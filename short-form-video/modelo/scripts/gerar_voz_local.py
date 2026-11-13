import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

import imageio_ffmpeg
import numpy as np
import soundfile
import torch

RAIZ = Path(__file__).resolve().parent.parent
ROTEIRO = RAIZ / "roteiro.json"
PASTA = RAIZ / "out" / "voz_local"
SAIDA_AUDIO = RAIZ / "public" / "audio" / "voz.wav"
SAIDA_DADOS = RAIZ / "src" / "narracao.json"
TAXA_SAIDA = 48000
INICIO_SILENCIO = 0.25
FIM_SILENCIO = 2.2
PAUSAS = {".": 0.24, "?": 0.3, "!": 0.24, ":": 0.16}
LIMIAR_SIMILARIDADE = 0.86
TENTATIVAS = 5

FALADO = {
    "200": ["duzentos"],
    "500": ["quinhentos"],
    "80": ["oitenta"],
    "MED": ["méd"],
    "CPF": ["cê", "pê", "éfe"],
}

FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
PASTA_FFMPEG = PASTA / "bin"


def preparar_ffmpeg():
    PASTA_FFMPEG.mkdir(parents=True, exist_ok=True)
    destino = PASTA_FFMPEG / "ffmpeg.exe"
    if not destino.exists():
        destino.write_bytes(Path(FFMPEG).read_bytes())
    os.environ["PATH"] = str(PASTA_FFMPEG) + os.pathsep + os.environ["PATH"]


def normalizar(texto):
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", "", texto.lower()).strip()


def frases(texto):
    partes = re.findall(r"[^.?!:]+[.?!:]?", texto)
    return [p.strip() for p in partes if p.strip()]


def tokens_legenda(texto):
    return [t.strip(".,:;?!\"“”") for t in texto.split() if t.strip(".,:;?!\"“”")]


def texto_falado(frase):
    saida = []
    for palavra in frase.split():
        limpa = palavra.strip(".,:;?!\"“”")
        pontuacao = palavra[len(palavra.rstrip(".,:;?!")):]
        if limpa in FALADO:
            saida.append(" ".join(FALADO[limpa]) + pontuacao)
        else:
            saida.append(palavra)
    return " ".join(saida)


def preparar_referencia(origem):
    destino = PASTA / "referencia.wav"
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(origem), "-ac", "1", "-ar", "24000",
         "-af", "highpass=f=70,silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=-1:stop_duration=0.6:stop_threshold=-45dB,loudnorm=I=-20:TP=-2",
         "-t", "30", str(destino)],
        check=True,
    )
    return destino


def recortar_silencio(onda, taxa, limiar_db=-42):
    envelope = np.abs(onda)
    janela = int(taxa * 0.01)
    if len(envelope) < janela * 3:
        return onda
    energia = np.sqrt(np.convolve(envelope ** 2, np.ones(janela) / janela, mode="same"))
    limiar = 10 ** (limiar_db / 20) * max(energia.max(), 1e-6)
    ativos = np.where(energia > limiar)[0]
    if len(ativos) == 0:
        return onda
    inicio = max(ativos[0] - int(taxa * 0.03), 0)
    fim = min(ativos[-1] + int(taxa * 0.08), len(onda))
    return onda[inicio:fim]


NUMEROS = {"1": "um", "2": "dois", "3": "tres", "4": "quatro", "5": "cinco", "80": "oitenta", "200": "duzentos", "500": "quinhentos"}


def por_extenso(texto):
    return " ".join(NUMEROS.get(p, p) for p in normalizar(texto).split())


def similaridade(esperado, obtido):
    a = por_extenso(esperado).split()
    b = por_extenso(obtido).split()
    return difflib.SequenceMatcher(None, a, b).ratio()


def alinhar(palavras_whisper, tokens):
    falados = []
    for indice, token in enumerate(tokens):
        for parte in FALADO.get(token, [token]):
            falados.append((normalizar(parte), indice))
    sequencia_falada = [f[0] for f in falados]
    sequencia_whisper = [normalizar(p["word"]) for p in palavras_whisper]
    mapa = {}
    for bloco in difflib.SequenceMatcher(None, sequencia_falada, sequencia_whisper, autojunk=False).get_matching_blocks():
        for k in range(bloco.size):
            mapa[bloco.a + k] = palavras_whisper[bloco.b + k]
    tempos = [None] * len(tokens)
    for posicao, (_, indice) in enumerate(falados):
        if posicao in mapa:
            inicio, fim = mapa[posicao]["start"], mapa[posicao]["end"]
            atual = tempos[indice]
            tempos[indice] = (inicio, fim) if atual is None else (min(atual[0], inicio), max(atual[1], fim))
    conhecidos = [i for i, t in enumerate(tempos) if t is not None]
    if not conhecidos:
        raise RuntimeError("alinhamento vazio")
    for i in range(len(tempos)):
        if tempos[i] is None:
            antes = max([k for k in conhecidos if k < i], default=None)
            depois = min([k for k in conhecidos if k > i], default=None)
            if antes is None:
                tempos[i] = (max(tempos[depois][0] - 0.25, 0), tempos[depois][0])
            elif depois is None:
                tempos[i] = (tempos[antes][1], tempos[antes][1] + 0.25)
            else:
                lacuna = (tempos[depois][0] - tempos[antes][1]) / (depois - antes)
                inicio = tempos[antes][1] + lacuna * (i - antes - 1)
                tempos[i] = (inicio, inicio + lacuna)
    return tempos


def principal():
    if len(sys.argv) < 2:
        raise SystemExit("uso: gerar_voz_local.py <audio_de_referencia> [cena:frase ...]")
    refazer = set(sys.argv[2:])
    preparar_ffmpeg()
    PASTA.mkdir(parents=True, exist_ok=True)
    referencia = preparar_referencia(Path(sys.argv[1]))
    roteiro = json.loads(ROTEIRO.read_text(encoding="utf-8"))
    ajustes = roteiro.get("vozLocal", {})

    import whisper
    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    modelo = ChatterboxMultilingualTTS.from_pretrained(device="cuda")
    transcritor = whisper.load_model("turbo", device="cuda")
    taxa = modelo.sr

    blocos = [np.zeros(int(INICIO_SILENCIO * taxa), dtype=np.float32)]
    cursor = INICIO_SILENCIO
    cenas = []
    for cena in roteiro["cenas"]:
        pedacos = []
        for numero, frase in enumerate(frases(cena["texto"])):
            falada = texto_falado(frase)
            escolhida = PASTA / f"{cena['id']}_{numero}.wav"
            texto_salvo = PASTA / f"{cena['id']}_{numero}.txt"
            chave = f"{cena['id']}:{numero}"
            if escolhida.exists() and texto_salvo.exists() and texto_salvo.read_text(encoding="utf-8") == falada and chave not in refazer and "tudo" not in refazer:
                onda, _ = soundfile.read(str(escolhida), dtype="float32")
                pedacos.append(onda)
                pedacos.append(np.zeros(int(PAUSAS.get(frase[-1], 0.2) * taxa), dtype=np.float32))
                continue
            melhor = None
            for tentativa in range(TENTATIVAS):
                torch.manual_seed(1000 + tentativa * 17 + numero + (7919 if chave in refazer else 0))
                onda = modelo.generate(
                    falada,
                    language_id="pt",
                    audio_prompt_path=str(referencia),
                    exaggeration=ajustes.get("exageracao", 0.5),
                    cfg_weight=ajustes.get("cfg", 0.4),
                    temperature=ajustes.get("temperatura", 0.75),
                ).squeeze(0).cpu().numpy().astype(np.float32)
                onda = recortar_silencio(onda, taxa)
                caminho = PASTA / f"{cena['id']}_{numero}_{tentativa}.wav"
                soundfile.write(str(caminho), onda, taxa)
                obtido = transcritor.transcribe(str(caminho), language="pt")["text"]
                nota = similaridade(falada, obtido)
                duracao = len(onda) / taxa
                plausivel = 0.18 < duracao / max(len(falada.split()), 1) < 0.75
                pontos = nota - (0 if plausivel else 0.3)
                if melhor is None or pontos > melhor[0]:
                    melhor = (pontos, onda, obtido)
                if nota >= LIMIAR_SIMILARIDADE and plausivel:
                    break
            print(f"{cena['id']} #{numero}: {melhor[0]:.2f} | {melhor[2].strip()}", file=sys.stderr)
            soundfile.write(str(escolhida), melhor[1], taxa)
            texto_salvo.write_text(falada, encoding="utf-8")
            pedacos.append(melhor[1])
            pedacos.append(np.zeros(int(PAUSAS.get(frase[-1], 0.25) * taxa), dtype=np.float32))
        audio_cena = np.concatenate(pedacos[:-1])
        caminho_lento = PASTA / f"{cena['id']}_lento.wav"
        soundfile.write(str(caminho_lento), audio_cena, taxa)
        caminho_cena = PASTA / f"{cena['id']}.wav"
        subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-i", str(caminho_lento), "-af", f"atempo={ajustes.get('tempo', 1.0)}", str(caminho_cena)], check=True)
        audio_cena, _ = soundfile.read(str(caminho_cena), dtype="float32")
        resultado = transcritor.transcribe(str(caminho_cena), language="pt", word_timestamps=True)
        palavras_whisper = [p for segmento in resultado["segments"] for p in segmento["words"]]
        tokens = tokens_legenda(cena["texto"])
        tempos = alinhar(palavras_whisper, tokens)
        duracao = len(audio_cena) / taxa
        cenas.append({
            "id": cena["id"],
            "inicio": round(cursor, 4),
            "duracao": round(duracao, 4),
            "palavras": [{"texto": t, "inicio": round(cursor + a, 4), "fim": round(cursor + b, 4)} for t, (a, b) in zip(tokens, tempos)],
        })
        blocos.append(audio_cena)
        pausa = roteiro["pausaEntreCenas"]
        blocos.append(np.zeros(int(pausa * taxa), dtype=np.float32))
        cursor += duracao + pausa
    blocos.append(np.zeros(int(FIM_SILENCIO * taxa), dtype=np.float32))
    cursor += FIM_SILENCIO
    bruto = PASTA / "voz_bruta.wav"
    soundfile.write(str(bruto), np.concatenate(blocos), taxa)
    SAIDA_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(bruto), "-af",
         "highpass=f=60,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120,loudnorm=I=-18:TP=-2:LRA=7",
         "-ar", str(TAXA_SAIDA), "-ac", "1", "-sample_fmt", "s16", str(SAIDA_AUDIO)],
        check=True,
    )
    SAIDA_DADOS.write_text(json.dumps({"duracaoTotal": round(cursor, 4), "cenas": cenas}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total: {cursor:.2f}s", file=sys.stderr)


principal()
