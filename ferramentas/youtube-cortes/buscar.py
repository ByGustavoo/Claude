import argparse
import re
import time
import urllib.parse
import urllib.request
from datetime import date, datetime

import yt_dlp

from comum import Cronometro, agora_iso, erro_do_youtube, gravar_json, ler_json, opcoes_ytdlp, pasta_do_lote

FILTRO_CC = 'EgIwAQ%3D%3D'
PALAVRAS_DE_CORTE = re.compile(r'\bcortes?\b|\bclipes?\b|\bclips?\b|\brecortes?\b|\bclipping\b|\breutiliza|\blicen[çc]a|creative commons|cc[ -]by', re.I)


def ids_da_busca(termo, maximo, cc):
    url = f'https://www.youtube.com/results?search_query={urllib.parse.quote_plus(termo)}'
    if cc:
        url += f'&sp={FILTRO_CC}'
    with yt_dlp.YoutubeDL(opcoes_ytdlp(extract_flat=True, playlistend=maximo)) as ydl:
        dados = ydl.extract_info(url, download=False)
    return [e['id'] for e in dados.get('entries') or [] if e.get('id') and len(e['id']) == 11]


def ids_do_canal(url, maximo):
    if not re.search(r'/(videos|streams|playlist)', url):
        url = url.rstrip('/') + '/videos'
    with yt_dlp.YoutubeDL(opcoes_ytdlp(extract_flat=True, playlistend=maximo)) as ydl:
        dados = ydl.extract_info(url, download=False)
    return [e['id'] for e in dados.get('entries') or [] if e.get('id') and len(e['id']) == 11]


def trechos_sobre_cortes(descricao):
    linhas = [l.strip() for l in (descricao or '').splitlines() if l.strip()]
    return [l[:240] for l in linhas if PALAVRAS_DE_CORTE.search(l)][:6]


def resumo_do_video(info):
    publicado = info.get('upload_date')
    dias = None
    if publicado:
        dias = max(1, (date.today() - datetime.strptime(publicado, '%Y%m%d').date()).days)
    visualizacoes = info.get('view_count') or 0
    heatmap = [{'inicio': h['start_time'], 'fim': h['end_time'], 'valor': round(h['value'], 3)} for h in info.get('heatmap') or []]
    licenca = info.get('license') or ''
    return {
        'id': info['id'],
        'url': f'https://www.youtube.com/watch?v={info["id"]}',
        'titulo': info.get('title'),
        'canal': info.get('channel'),
        'canal_url': info.get('channel_url'),
        'canal_id': info.get('channel_id'),
        'arroba': info.get('uploader_id'),
        'canal_verificado': bool(info.get('channel_is_verified')),
        'inscritos': info.get('channel_follower_count'),
        'visualizacoes': visualizacoes,
        'curtidas': info.get('like_count'),
        'comentarios': info.get('comment_count'),
        'data': f'{publicado[6:8]}/{publicado[4:6]}/{publicado[:4]}' if publicado else None,
        'dias_no_ar': dias,
        'visualizacoes_por_dia': round(visualizacoes / dias) if dias else None,
        'duracao': info.get('duration'),
        'idioma': info.get('language'),
        'licenca': licenca,
        'creative_commons': 'creative commons' in licenca.lower(),
        'altura_maxima': max((f.get('height') or 0 for f in info.get('formats') or [] if f.get('vcodec') not in (None, 'none')), default=None),
        'capitulos': [{'inicio': c['start_time'], 'fim': c['end_time'], 'titulo': c['title']} for c in info.get('chapters') or []],
        'tem_heatmap': bool(heatmap),
        'heatmap': heatmap,
        'miniatura': info.get('thumbnail'),
        'trechos_sobre_cortes': trechos_sobre_cortes(info.get('description')),
        'descricao': (info.get('description') or '')[:2000],
        'ao_vivo': info.get('was_live') or info.get('is_live') or False,
    }


def descricao_do_canal(ydl, canal_url, cache):
    if not canal_url or canal_url in cache:
        return cache.get(canal_url)
    try:
        dados = ydl.extract_info(canal_url, download=False, process=False)
        cache[canal_url] = dados.get('description') or ''
        cache[('inscritos', canal_url)] = dados.get('channel_follower_count')
    except yt_dlp.utils.DownloadError:
        cache[canal_url] = None
    return cache[canal_url]


def baixar_miniatura(lote, video):
    if not video.get('miniatura'):
        return None
    destino = lote / '1-fonte' / 'miniaturas' / f'{video["id"]}.jpg'
    destino.parent.mkdir(parents=True, exist_ok=True)
    url = f'https://i.ytimg.com/vi/{video["id"]}/hqdefault.jpg'
    try:
        with urllib.request.urlopen(url, timeout=20) as resposta:
            destino.write_bytes(resposta.read())
        return str(destino.relative_to(lote)).replace('\\', '/')
    except Exception:
        return None


def main():
    parser = argparse.ArgumentParser(description='Busca vídeos longos no YouTube e grava os metadados em 1-fonte/busca.json.')
    parser.add_argument('lote', help='Pasta do lote (caminho ou nome dentro de D:\\Projetos\\Quorum\\YouTube)')
    parser.add_argument('--busca', action='append', default=[], help='Termo de busca (pode repetir)')
    parser.add_argument('--canal', action='append', default=[], help='URL de um canal ou playlist (pode repetir)')
    parser.add_argument('--url', action='append', default=[], help='URL de um vídeo específico (pode repetir)')
    parser.add_argument('--cc', action='store_true', help='Filtro de Creative Commons na busca (a licença é conferida vídeo a vídeo)')
    parser.add_argument('--max', type=int, default=15, help='Máximo de resultados por busca ou canal')
    parser.add_argument('--min-minutos', type=float, default=20)
    parser.add_argument('--max-minutos', type=float, default=240)
    parser.add_argument('--dias', type=int, default=180, help='Ignora vídeos mais antigos que isso')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    cronometro = Cronometro()
    ids, origens = [], {}
    try:
        for termo in args.busca:
            for i in ids_da_busca(termo, args.max, args.cc):
                origens.setdefault(i, f'busca: {termo}')
                ids.append(i)
        for canal in args.canal:
            for i in ids_do_canal(canal, args.max):
                origens.setdefault(i, f'canal: {canal}')
                ids.append(i)
    except yt_dlp.utils.DownloadError as erro:
        gravar_json(lote / '1-fonte' / 'busca-erro.json', {'tipo': erro_do_youtube(erro), 'mensagem': str(erro)[:600], 'quando': agora_iso()})
        raise SystemExit(f'O YouTube recusou a busca ({erro_do_youtube(erro)}). Pare e avise o Produtor.')
    for url in args.url:
        m = re.search(r'(?:v=|youtu\.be/|shorts/|live/)([\w-]{11})', url)
        if m:
            origens.setdefault(m.group(1), 'url')
            ids.append(m.group(1))
    cronometro.marcar('listar')

    arquivo = lote / '1-fonte' / 'busca.json'
    anterior = ler_json(arquivo, {'videos': []})
    conhecidos = {v['id']: v for v in anterior.get('videos', [])}
    novos, ignorados, falhas = [], [], []
    vistos = set()
    canais = {}
    with yt_dlp.YoutubeDL(opcoes_ytdlp(skip_download=True)) as ydl, yt_dlp.YoutubeDL(opcoes_ytdlp(extract_flat=True, playlistend=1)) as ydl_canal:
        for i in ids:
            if i in vistos:
                continue
            vistos.add(i)
            try:
                info = ydl.extract_info(f'https://www.youtube.com/watch?v={i}', download=False)
            except yt_dlp.utils.DownloadError as erro:
                tipo = erro_do_youtube(erro)
                falhas.append({'id': i, 'tipo': tipo, 'mensagem': str(erro)[:300]})
                if tipo == 'bloqueio':
                    break
                continue
            video = resumo_do_video(info)
            video['origem'] = origens.get(i)
            minutos = (video['duracao'] or 0) / 60
            motivo = None
            if origens.get(i) != 'url':
                if minutos < args.min_minutos:
                    motivo = f'curto ({minutos:.0f} min)'
                elif minutos > args.max_minutos:
                    motivo = f'longo demais ({minutos:.0f} min)'
                elif video['dias_no_ar'] and video['dias_no_ar'] > args.dias:
                    motivo = f'antigo ({video["dias_no_ar"]} dias)'
            if motivo:
                ignorados.append({'id': i, 'titulo': video['titulo'], 'motivo': motivo})
                continue
            descricao_canal = descricao_do_canal(ydl_canal, video['canal_url'], canais)
            video['canal_descricao'] = (descricao_canal or '')[:2500]
            inscritos_do_canal = canais.get(('inscritos', video['canal_url']))
            if inscritos_do_canal and inscritos_do_canal > (video['inscritos'] or 0):
                video['inscritos'] = inscritos_do_canal
            video['trechos_do_canal_sobre_cortes'] = trechos_sobre_cortes(descricao_canal)
            video['miniatura_local'] = baixar_miniatura(lote, video)
            conhecidos[i] = video
            novos.append(i)
            time.sleep(0.5)
    cronometro.marcar('metadados')

    videos = sorted(conhecidos.values(), key=lambda v: -(v.get('visualizacoes_por_dia') or 0))
    gravar_json(arquivo, {
        'atualizado': agora_iso(),
        'videos': videos,
        'ultima_busca': {'buscas': args.busca, 'canais': args.canal, 'urls': args.url, 'cc': args.cc, 'novos': novos, 'ignorados': ignorados, 'falhas': falhas},
        'segundos': cronometro.total(),
        'etapas': cronometro.etapas,
    })
    print(f'{len(novos)} vídeos novos, {len(ignorados)} ignorados, {len(falhas)} falhas em {cronometro.total()} s → {arquivo}')
    for v in videos[:20]:
        cc = 'CC' if v['creative_commons'] else '--'
        print(f'{cc} {v["id"]} {v["duracao"] // 60:>4} min {v["visualizacoes_por_dia"] or 0:>8}/dia  {v["canal"]} ({v["inscritos"]}) - {v["titulo"][:70]}')
    if any(f['tipo'] == 'bloqueio' for f in falhas):
        raise SystemExit('O YouTube pediu verificação de robô. Pare e avise o Produtor.')


if __name__ == '__main__':
    main()
