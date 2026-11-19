import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

from comum import FFMPEG, FONTES, Cronometro, gravar_json, ler_json, ler_tempo, original_do_lote, pasta_do_lote, rodar, tempo_legivel


def extrair(original, segundo, destino, largura):
    rodar([FFMPEG, '-v', 'error', '-y', '-ss', f'{segundo:.3f}', '-i', str(original), '-frames:v', '1', '-vf', f'scale={largura}:-2', '-q:v', '3', str(destino)])
    return destino


def folha(imagens, rotulos, destino, colunas):
    primeira = Image.open(imagens[0])
    largura, altura = primeira.size
    faixa = 34
    linhas = math.ceil(len(imagens) / colunas)
    folha_img = Image.new('RGB', (colunas * largura, linhas * (altura + faixa)), '#111111')
    fonte = ImageFont.truetype(str(FONTES / 'Anton-Regular.ttf'), 24)
    desenho = ImageDraw.Draw(folha_img)
    for n, (caminho, rotulo) in enumerate(zip(imagens, rotulos)):
        x, y = (n % colunas) * largura, (n // colunas) * (altura + faixa)
        folha_img.paste(Image.open(caminho).resize((largura, altura)), (x, y + faixa))
        desenho.text((x + 8, y + 3), rotulo, fill='#FFE14D', font=fonte)
    folha_img.save(destino, quality=88)
    return destino


def main():
    parser = argparse.ArgumentParser(description='Extrai quadros do vídeo original e monta uma folha de contato.')
    parser.add_argument('lote')
    parser.add_argument('tempos', nargs='*', help='Tempos em segundos ou mm:ss')
    parser.add_argument('--corte', action='append', default=[], help='Número do corte em momentos.json: 3 quadros (início, meio e fim)')
    parser.add_argument('--todos', action='store_true', help='3 quadros de cada corte de momentos.json')
    parser.add_argument('--largura', type=int, default=640)
    parser.add_argument('--nome', default=None, help='Nome da folha de contato')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    original = original_do_lote(lote)
    pasta = lote / '3-momentos' / 'quadros'
    pasta.mkdir(parents=True, exist_ok=True)
    cronometro = Cronometro()

    pedidos = [(ler_tempo(t), tempo_legivel(ler_tempo(t))) for t in args.tempos]
    momentos = ler_json(lote / '3-momentos' / 'momentos.json', {})
    escolhidos = {int(c) for c in args.corte}
    for corte in momentos.get('cortes', []):
        if args.todos or int(corte['n']) in escolhidos:
            i, f = float(corte['inicio']), float(corte['fim'])
            for rotulo, t in [('início', i + 1.5), ('meio', (i + f) / 2), ('fim', f - 1.5)]:
                pedidos.append((t, f'corte {corte["n"]} {rotulo} {tempo_legivel(t)}'))
    if not pedidos:
        raise SystemExit('Diga os tempos, --corte N ou --todos.')

    arquivos = []
    for segundo, rotulo in pedidos:
        destino = pasta / f'q_{int(segundo * 10):06d}.jpg'
        if not destino.exists():
            extrair(original, segundo, destino, args.largura)
        arquivos.append({'segundo': round(segundo, 2), 'rotulo': rotulo, 'arquivo': str(destino.relative_to(lote)).replace('\\', '/')})
    cronometro.marcar('extrair')
    colunas = 3 if len(arquivos) % 3 == 0 or len(arquivos) > 4 else 2
    nome = args.nome or ('folha-cortes' if (args.todos or escolhidos) and not args.tempos else f'folha-{int(pedidos[0][0])}')
    caminho_folha = folha([lote / a['arquivo'] for a in arquivos], [a['rotulo'] for a in arquivos], pasta / f'{nome}.jpg', colunas)
    cronometro.marcar('folha')
    gravar_json(pasta / f'{nome}.json', {'quadros': arquivos, 'folha': str(Path(caminho_folha).relative_to(lote)).replace('\\', '/'), 'segundos': cronometro.total()})
    print(f'{len(arquivos)} quadros em {cronometro.total()} s. Folha: {caminho_folha}')


if __name__ == '__main__':
    main()
