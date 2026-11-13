import difflib
import json
import os
import re
import subprocess
import sys
import unicodedata
import wave
from pathlib import Path

import imageio_ffmpeg

RAIZ = Path(__file__).resolve().parent.parent
ROTEIRO = RAIZ / "roteiro.json"
PASTA_ENTRADA = RAIZ / "elevenlabs"
PASTA_TRABALHO = RAIZ / "out" / "voz_externa"
SAIDA_AUDIO = RAIZ / "public" / "audio" / "voz.wav"
SAIDA_DADOS = RAIZ / "src" / "narracao.json"
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
TAXA = 48000
INICIO_SILENCIO = 0.9
FIM_SILENCIO = 3.0
PONTUACAO = ".,:;?!\"“”…"
FALADO = {
    "200": ["duzentos"],
    "500": ["quinhentos"],
    "80": ["oitenta"],
    "CPF": ["cê", "pê", "éfe"],
}
EQUIVALENTES = {"para": "pra", "estou": "to", "avise": "avisa", "cpf": "ce", "5": "cinco", "4": "quatro", "3": "tres", "2": "dois", "1": "um", "200": "duzentos", "500": "quinhentos", "80": "oitenta"}


def preparar_ffmpeg():
    pasta = PASTA_TRABALHO / "bin"
    pasta.mkdir(parents=True, exist_ok=True)
    destino = pasta / "ffmpeg.exe"
    if not destino.exists():
        destino.write_bytes(Path(FFMPEG).read_bytes())
    os.environ["PATH"] = str(pasta) + os.pathsep + os.environ["PATH"]


def normalizar(texto):
    texto = unicodedata.normalize("NFD", texto)
    texto = "".join(c for c in texto if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9 ]", "", texto.lower()).strip()


def tokens_legenda(texto):
    tokens = []
    for bruto in texto.replace("...", "…").split():
        exibido = bruto.replace("“", "").replace("”", "").replace('"', "")
        if exibido.strip(PONTUACAO):
            tokens.append(exibido)
    return tokens


def alinhar(palavras_whisper, tokens):
    falados = []
    for indice, token in enumerate(tokens):
        for parte in FALADO.get(token.strip(PONTUACAO), [token]):
            falados.append((normalizar(parte), indice))
    sequencia_falada = [f[0] for f in falados]
    sequencia_whisper = [EQUIVALENTES.get(normalizar(p["word"]), normalizar(p["word"])) for p in palavras_whisper]
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
    cobertura = len(conhecidos) / max(len(tokens), 1)
    faltando = [tokens[i] for i, t in enumerate(tempos) if t is None]
    if faltando:
        print("   sem par no áudio: " + ", ".join(faltando), file=sys.stderr)
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
    return tempos, cobertura


def localizar(id_cena):
    candidatos = sorted(PASTA_ENTRADA.glob(f"{id_cena}*"))
    candidatos = [c for c in candidatos if c.suffix.lower() in {".mp3", ".wav", ".m4a", ".ogg", ".opus", ".flac"}]
    if not candidatos:
        raise SystemExit(f"Falta o áudio da cena '{id_cena}' em {PASTA_ENTRADA}")
    return candidatos[-1]


def decodificar(origem, destino, tempo):
    filtros = [
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.05",
        "areverse",
        "silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.12",
        "areverse",
    ]
    if tempo != 1.0:
        filtros.append(f"atempo={tempo}")
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(origem), "-af", ",".join(filtros), "-ac", "1", "-ar", str(TAXA), "-sample_fmt", "s16", str(destino)],
        check=True,
    )
    with wave.open(str(destino), "rb") as arquivo:
        return arquivo.readframes(arquivo.getnframes()), arquivo.getnframes() / TAXA


def principal():
    preparar_ffmpeg()
    PASTA_TRABALHO.mkdir(parents=True, exist_ok=True)
    roteiro = json.loads(ROTEIRO.read_text(encoding="utf-8"))
    tempo = roteiro.get("vozExterna", {}).get("tempo", 1.0)
    import whisper

    transcritor = whisper.load_model("turbo", device="cuda")
    silencio = lambda segundos: b"\x00\x00" * int(segundos * TAXA)
    blocos = [silencio(INICIO_SILENCIO)]
    cursor = INICIO_SILENCIO
    cenas = []
    for cena in roteiro["cenas"]:
        origem = localizar(cena["id"])
        destino = PASTA_TRABALHO / f"{cena['id']}.wav"
        amostras, duracao = decodificar(origem, destino, tempo)
        resultado = transcritor.transcribe(str(destino), language="pt", word_timestamps=True)
        palavras_whisper = [p for segmento in resultado["segments"] for p in segmento["words"]]
        tokens = tokens_legenda(cena["texto"])
        tempos, cobertura = alinhar(palavras_whisper, tokens)
        aviso = "" if cobertura >= 0.85 else "  <-- confira: o áudio pode não bater com o texto"
        print(f"{cena['id']}: {duracao:.1f}s, {cobertura:.0%} das palavras alinhadas{aviso}", file=sys.stderr)
        cenas.append({
            "id": cena["id"],
            "inicio": round(cursor, 4),
            "duracao": round(duracao, 4),
            "palavras": [{"texto": t, "inicio": round(cursor + a, 4), "fim": round(cursor + b, 4)} for t, (a, b) in zip(tokens, tempos)],
        })
        blocos.append(amostras)
        pausa = roteiro["pausaEntreCenas"]
        blocos.append(silencio(pausa))
        cursor += duracao + pausa
    blocos.append(silencio(FIM_SILENCIO))
    cursor += FIM_SILENCIO
    bruto = PASTA_TRABALHO / "voz_bruta.wav"
    with wave.open(str(bruto), "wb") as arquivo:
        arquivo.setnchannels(1)
        arquivo.setsampwidth(2)
        arquivo.setframerate(TAXA)
        arquivo.writeframes(b"".join(blocos))
    SAIDA_AUDIO.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [FFMPEG, "-y", "-loglevel", "error", "-i", str(bruto), "-af", "loudnorm=I=-18:TP=-2:LRA=9", "-ar", str(TAXA), "-ac", "1", "-sample_fmt", "s16", str(SAIDA_AUDIO)],
        check=True,
    )
    SAIDA_DADOS.write_text(json.dumps({"duracaoTotal": round(cursor, 4), "cenas": cenas}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"total: {cursor:.2f}s", file=sys.stderr)


principal()
