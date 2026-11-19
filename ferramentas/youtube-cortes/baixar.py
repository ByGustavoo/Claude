import argparse

import yt_dlp

from comum import Cronometro, agora_iso, erro_do_youtube, gravar_json, opcoes_ytdlp, pasta_do_lote, sondar


def comentarios_resumidos(info):
    saida = []
    for c in info.get('comments') or []:
        saida.append({
            'autor': c.get('author'),
            'texto': (c.get('text') or '')[:600],
            'curtidas': c.get('like_count') or 0,
            'resposta': c.get('parent') not in (None, 'root'),
        })
    return saida


def main():
    parser = argparse.ArgumentParser(description='Baixa o vídeo da fonte em 2-original/ com metadados e comentários.')
    parser.add_argument('lote')
    parser.add_argument('url')
    parser.add_argument('--altura-max', type=int, default=2160)
    parser.add_argument('--comentarios', type=int, default=400, help='Quantos comentários ler (0 desliga)')
    parser.add_argument('--idioma', default='pt', help='Faixa de áudio preferida quando o vídeo tem dublagem (padrão: pt)')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    pasta = lote / '2-original'
    cronometro = Cronometro()
    for antigo in pasta.glob('original.*'):
        antigo.unlink()

    opcoes = opcoes_ytdlp(
        format=f'bv*[height<={args.altura_max}]+ba[language^={args.idioma}]/bv*[height<={args.altura_max}]+ba/b[height<={args.altura_max}]/b',
        format_sort=['res', 'fps', 'vcodec:av01', 'acodec'],
        merge_output_format='mp4',
        outtmpl={'default': str(pasta / 'original.%(ext)s')},
        getcomments=args.comentarios > 0,
        extractor_args={'youtube': {'max_comments': [str(args.comentarios), 'all', '0', '0'], 'comment_sort': ['top']}},
        retries=5,
        fragment_retries=5,
        concurrent_fragment_downloads=4,
        noprogress=True,
    )
    try:
        with yt_dlp.YoutubeDL(opcoes) as ydl:
            info = ydl.extract_info(args.url, download=True)
    except yt_dlp.utils.DownloadError as erro:
        tipo = erro_do_youtube(erro)
        gravar_json(pasta / 'baixar-erro.json', {'tipo': tipo, 'mensagem': str(erro)[:800], 'quando': agora_iso()})
        if tipo == 'bloqueio':
            raise SystemExit('O YouTube pediu verificação de robô ou bloqueou o download. Pare e avise o Produtor: não use cookies nem plugins.')
        raise SystemExit(f'Download falhou: {str(erro)[:400]}')
    cronometro.marcar('download')

    arquivo = next(pasta.glob('original.*'))
    tecnico = sondar(arquivo)
    cronometro.marcar('sondar')
    publicado = info.get('upload_date')
    dados = {
        'id': info['id'],
        'url': f'https://www.youtube.com/watch?v={info["id"]}',
        'titulo': info.get('title'),
        'canal': info.get('channel'),
        'arroba': info.get('uploader_id'),
        'canal_url': info.get('channel_url'),
        'canal_verificado': bool(info.get('channel_is_verified')),
        'inscritos': info.get('channel_follower_count'),
        'visualizacoes': info.get('view_count'),
        'curtidas': info.get('like_count'),
        'data': f'{publicado[6:8]}/{publicado[4:6]}/{publicado[:4]}' if publicado else None,
        'licenca': info.get('license'),
        'duracao': info.get('duration'),
        'descricao': info.get('description'),
        'tags': info.get('tags') or [],
        'capitulos': [{'inicio': c['start_time'], 'fim': c['end_time'], 'titulo': c['title']} for c in info.get('chapters') or []],
        'heatmap': [{'inicio': h['start_time'], 'fim': h['end_time'], 'valor': round(h['value'], 3)} for h in info.get('heatmap') or []],
        'comentarios': comentarios_resumidos(info),
        'arquivo': arquivo.name,
        'formato_baixado': info.get('format'),
        'idioma_audio': next((f.get('language') for f in info.get('requested_formats') or [] if f.get('acodec') not in (None, 'none')), info.get('language')),
        'idiomas_de_audio_disponiveis': sorted({f.get('language') for f in info.get('formats') or [] if f.get('acodec') not in (None, 'none') and f.get('language')}),
        'tecnico': tecnico,
        'baixado_em': agora_iso(),
    }
    dados['segundos'] = cronometro.total()
    dados['etapas'] = cronometro.etapas
    gravar_json(pasta / 'info.json', dados)
    print(f'{arquivo.name}: {tecnico["largura"]}x{tecnico["altura"]} {tecnico["fps"]} fps, {tecnico["duracao"]:.0f} s, {tecnico["tamanho_mb"]} MB, áudio {dados["idioma_audio"]}, '
          f'{len(dados["comentarios"])} comentários, heatmap {"sim" if dados["heatmap"] else "não"}, {len(dados["capitulos"])} capítulos, em {dados["segundos"]} s')


if __name__ == '__main__':
    main()
