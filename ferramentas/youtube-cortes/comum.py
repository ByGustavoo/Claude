import json
import os
import re
import shutil
import subprocess
import sys
import time
from pathlib import Path

FERRAMENTAS = Path(__file__).resolve().parent
RAIZ_YOUTUBE = Path(os.environ.get('QUORUM_RAIZ_YOUTUBE') or FERRAMENTAS.parent)
FONTES = FERRAMENTAS / 'fontes'
MODELOS = FERRAMENTAS / 'modelos'
FONTE_LEGENDA = 'Anton'

SUBPASTAS = ['status', 'pedidos', 'respostas', '1-fonte', '2-original', '3-momentos', '4-pilotos', '5-cortes', '6-capas', '7-postagem', 'legendas']

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')


def _pasta_do_ffmpeg():
    achado = shutil.which('ffmpeg')
    if achado:
        return Path(achado).parent
    pacotes = Path(os.environ.get('LOCALAPPDATA', '')) / 'Microsoft' / 'WinGet' / 'Packages'
    for pasta in sorted(pacotes.glob('Gyan.FFmpeg*/ffmpeg-*/bin'), reverse=True):
        if (pasta / 'ffmpeg.exe').exists():
            return pasta
    raise SystemExit('ffmpeg não encontrado: instale com "winget install Gyan.FFmpeg".')


PASTA_FFMPEG = _pasta_do_ffmpeg()
FFMPEG = str(PASTA_FFMPEG / ('ffmpeg.exe' if os.name == 'nt' else 'ffmpeg'))
FFPROBE = str(PASTA_FFMPEG / ('ffprobe.exe' if os.name == 'nt' else 'ffprobe'))
os.environ['PATH'] = str(PASTA_FFMPEG) + os.pathsep + os.environ.get('PATH', '')


def pasta_do_lote(texto):
    caminho = Path(texto)
    if not caminho.is_absolute():
        caminho = RAIZ_YOUTUBE / texto
    if not caminho.is_dir():
        raise SystemExit(f'Pasta do lote não existe: {caminho}')
    if not (caminho / 'lote.md').exists():
        raise SystemExit(f'{caminho} não é um lote (falta lote.md). Passe o caminho completo da pasta "Lote NN - …".')
    for sub in SUBPASTAS:
        (caminho / sub).mkdir(exist_ok=True)
    return caminho


def ler_json(caminho, padrao=None):
    try:
        with open(caminho, encoding='utf-8') as arquivo:
            return json.load(arquivo)
    except FileNotFoundError:
        return padrao


def gravar_json(caminho, dados):
    caminho = Path(caminho)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    temporario = caminho.with_suffix(caminho.suffix + '.tmp')
    with open(temporario, 'w', encoding='utf-8') as arquivo:
        json.dump(dados, arquivo, ensure_ascii=False, indent=2)
    os.replace(temporario, caminho)


def agora_iso():
    return time.strftime('%Y-%m-%dT%H:%M:%S')


class Cronometro:
    def __init__(self):
        self.inicio = time.perf_counter()
        self.etapas = {}
        self._ultimo = self.inicio

    def marcar(self, nome):
        agora = time.perf_counter()
        self.etapas[nome] = round(agora - self._ultimo, 2)
        self._ultimo = agora

    def total(self):
        return round(time.perf_counter() - self.inicio, 2)


def rodar(comando, **extra):
    resultado = subprocess.run(comando, capture_output=True, text=True, encoding='utf-8', errors='replace', **extra)
    if resultado.returncode != 0:
        raise SystemExit(f'Falhou: {" ".join(map(str, comando[:6]))}…\n{resultado.stderr[-3000:]}')
    return resultado


def sondar(caminho):
    saida = rodar([FFPROBE, '-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', str(caminho)]).stdout
    dados = json.loads(saida)
    video = next((s for s in dados['streams'] if s['codec_type'] == 'video'), None)
    audio = next((s for s in dados['streams'] if s['codec_type'] == 'audio'), None)
    fps = None
    if video and video.get('avg_frame_rate', '0/0') != '0/0':
        num, den = video['avg_frame_rate'].split('/')
        fps = round(int(num) / int(den), 3) if int(den) else None
    return {
        'duracao': round(float(dados['format'].get('duration', 0)), 3),
        'largura': video and video.get('width'),
        'altura': video and video.get('height'),
        'fps': fps,
        'codec_video': video and video.get('codec_name'),
        'codec_audio': audio and audio.get('codec_name'),
        'tamanho_mb': round(int(dados['format'].get('size', 0)) / 1048576, 1),
    }


def original_do_lote(lote):
    for nome in ['original.mp4', 'original.mkv', 'original.webm']:
        caminho = lote / '2-original' / nome
        if caminho.exists():
            return caminho
    raise SystemExit(f'Nenhum vídeo em {lote / "2-original"}: rode baixar.py antes.')


def tempo_legivel(segundos):
    segundos = max(0, float(segundos))
    h, resto = divmod(int(segundos), 3600)
    m, s = divmod(resto, 60)
    return f'{h}:{m:02d}:{s:02d}' if h else f'{m}:{s:02d}'


def ler_tempo(texto):
    texto = str(texto).strip().replace(',', '.')
    if ':' not in texto:
        return float(texto)
    total = 0.0
    for parte in texto.split(':'):
        total = total * 60 + float(parte)
    return total


def opcoes_ytdlp(**extra):
    opcoes = {
        'quiet': True,
        'no_warnings': True,
        'js_runtimes': {'node': {}},
        'http_headers': {'Accept-Language': 'pt-BR,pt;q=0.9'},
        'ffmpeg_location': str(PASTA_FFMPEG),
    }
    opcoes.update(extra)
    return opcoes


def erro_do_youtube(erro):
    texto = str(erro)
    if re.search(r'not a bot|Sign in to confirm|PO Token|HTTP Error 429|HTTP Error 403', texto, re.I):
        return 'bloqueio'
    return 'erro'


def momentos_do_lote(lote):
    dados = ler_json(lote / '3-momentos' / 'momentos.json')
    if not dados or not dados.get('cortes'):
        raise SystemExit(f'Sem cortes em {lote / "3-momentos" / "momentos.json"}.')
    return dados


def escolher_cortes(dados, texto):
    cortes = [c for c in dados['cortes'] if c.get('aprovado', True) is not False]
    if texto:
        pedidos = {int(n) for n in str(texto).split(',') if n.strip()}
        cortes = [c for c in dados['cortes'] if int(c['n']) in pedidos]
    if not cortes:
        raise SystemExit('Nenhum corte para processar.')
    return cortes


def _blocos_de_tempo(duracao, tamanho):
    inicio = 0.0
    while inicio < duracao:
        yield inicio, min(duracao, inicio + tamanho)
        inicio += tamanho


def montar_resumo(lote, tamanho_bloco=30):
    info = ler_json(lote / '2-original' / 'info.json', {})
    transcricao = ler_json(lote / '3-momentos' / 'transcricao.json')
    sinais = ler_json(lote / '3-momentos' / 'sinais.json', {})
    if not transcricao:
        return None
    duracao = transcricao.get('duracao') or info.get('duracao') or 0
    palavras = transcricao.get('palavras', [])
    heatmap = info.get('heatmap') or []
    capitulos = info.get('capitulos') or []
    energia = {round(b['inicio']): b for b in sinais.get('energia_por_bloco', [])}
    picos = sinais.get('picos', [])
    reacoes = sinais.get('reacoes', [])
    comentarios = sinais.get('comentarios_com_tempo', [])
    cortes_cena = sinais.get('cortes_de_cena', [])

    linhas = [
        f'# Resumo compacto - {info.get("titulo", lote.name)}',
        '',
        f'- Canal: {info.get("canal", "?")} | duração {tempo_legivel(duracao)} | {info.get("visualizacoes", "?")} visualizações | publicado em {info.get("data", "?")}',
        f'- Blocos de {tamanho_bloco} s. Colunas: energia média e pico do áudio (dB), "rep" = gráfico de mais repetidos (0 a 1, vazio se o YouTube não tem), "com" = comentários que citam o tempo, "cenas" = cortes de câmera, ★ = bloco com sinal forte.',
    ]
    if capitulos:
        linhas += ['', '## Capítulos', ''] + [f'- {tempo_legivel(c["inicio"])} {c["titulo"]}' for c in capitulos]
    if heatmap:
        maiores = sorted(heatmap, key=lambda h: -h['valor'])[:8]
        linhas += ['', '## Picos de mais repetidos', ''] + [f'- {tempo_legivel(h["inicio"])}–{tempo_legivel(h["fim"])}: {h["valor"]:.2f}' for h in sorted(maiores, key=lambda h: h['inicio'])]
    if comentarios:
        linhas += ['', '## Comentários com tempo (mais curtidos)', '']
        for c in sorted(comentarios, key=lambda c: -(c.get('curtidas') or 0))[:15]:
            linhas.append(f'- {tempo_legivel(c["segundo"])} ({c.get("curtidas") or 0} curtidas): {c["texto"][:160]}')
    if reacoes:
        linhas += ['', '## Possíveis risadas ou reações (som alto sem fala)', ''] + [f'- {tempo_legivel(r["inicio"])} ({r["fim"] - r["inicio"]:.1f} s)' for r in reacoes[:20]]

    linhas += ['', '## Linha do tempo', '']
    for inicio, fim in _blocos_de_tempo(duracao, tamanho_bloco):
        texto = ' '.join(p['p'] for p in palavras if inicio <= p['i'] < fim).strip()
        rep = max((h['valor'] for h in heatmap if h['inicio'] < fim and h['fim'] > inicio), default=None)
        e = energia.get(round(inicio))
        com = sum(1 for c in comentarios if inicio <= c['segundo'] < fim)
        cenas = sum(1 for t in cortes_cena if inicio <= t < fim)
        tem_pico = any(inicio <= p['tempo'] < fim for p in picos)
        tem_reacao = any(inicio <= r['inicio'] < fim for r in reacoes)
        forte = (rep is not None and rep >= 0.6) or com >= 2 or tem_pico or tem_reacao
        partes = [f'[{tempo_legivel(inicio)}–{tempo_legivel(fim)}]']
        if e:
            partes.append(f'energia {e["media_db"]:.0f}/{e["pico_db"]:.0f}')
        if rep is not None:
            partes.append(f'rep {rep:.2f}')
        if com:
            partes.append(f'com {com}')
        if cenas:
            partes.append(f'cenas {cenas}')
        if tem_reacao:
            partes.append('reação')
        if forte:
            partes.append('★')
        linhas.append(' '.join(partes))
        linhas.append(texto or '(sem fala)')
        linhas.append('')
    caminho = lote / '3-momentos' / 'resumo.md'
    caminho.write_text('\n'.join(linhas), encoding='utf-8')
    return caminho
