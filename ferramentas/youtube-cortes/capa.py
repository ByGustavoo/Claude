import argparse
import re

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from comum import FFMPEG, FONTES, Cronometro, agora_iso, escolher_cortes, gravar_json, ler_json, ler_tempo, momentos_do_lote, pasta_do_lote, rodar

LARGURA, ALTURA = 1080, 1920
AREA_PERFIL = (240, 1680)
MARGEM_ESQ, MARGEM_DIR = 70, 150
AMARELO = (255, 225, 77)
BRANCO = (255, 255, 255)


def quadro_do_corte(lote, n, segundo_no_corte, destino):
    rodar([FFMPEG, '-v', 'error', '-y', '-ss', f'{segundo_no_corte:.3f}', '-i', str(lote / '4-pilotos' / 'trabalho' / f'corte{n}-enquadrado.mkv'),
           '-frames:v', '1', '-q:v', '2', str(destino)])
    return Image.open(destino).convert('RGB')


def palavras_do_titulo(titulo):
    saida = []
    for parte in re.split(r'(\*[^*]+\*)', titulo):
        destaque = parte.startswith('*') and parte.endswith('*')
        for palavra in parte.strip('*').split():
            saida.append((palavra.upper(), destaque))
    return saida


def quebrar(palavras, fonte, largura_max, desenho):
    linhas, atual = [], []
    for palavra in palavras:
        teste = atual + [palavra]
        if atual and desenho.textlength(' '.join(p for p, _ in teste), font=fonte) > largura_max:
            linhas.append(atual)
            atual = [palavra]
        else:
            atual = teste
    if atual:
        linhas.append(atual)
    return linhas


def quebrar_equilibrado(palavras, fonte, largura_max, desenho):
    linhas = quebrar(palavras, fonte, largura_max, desenho)
    largura = largura_max
    while len(linhas) > 1:
        largura -= 10
        teste = quebrar(palavras, fonte, largura, desenho)
        if len(teste) > len(linhas):
            break
        linhas = teste
    return linhas


def escurecer(imagem, centro_y):
    linhas = np.arange(ALTURA, dtype=np.float32)
    if centro_y is None:
        comeco = ALTURA * 0.42
        gradiente = np.clip((linhas - comeco) / (ALTURA - comeco), 0, 1) * 0.82
    else:
        gradiente = np.clip(1 - np.abs(linhas - centro_y) / 420, 0, 1) * 0.78
    base = np.asarray(imagem, dtype=np.float32)
    return Image.fromarray((base * (1 - gradiente[:, None, None])).astype(np.uint8))


def layout_no_tempo(info, segundo):
    for plano in info.get('planos', []):
        if plano['de'] <= segundo < plano['ate']:
            return plano['layout']
    return None


def desenhar_titulo(imagem, titulo, base_y=None, centro_y=None):
    desenho = ImageDraw.Draw(imagem)
    palavras = palavras_do_titulo(titulo)
    largura_max = LARGURA - MARGEM_ESQ - MARGEM_DIR
    for tamanho in range(150, 70, -6):
        fonte = ImageFont.truetype(str(FONTES / 'Anton-Regular.ttf'), tamanho)
        linhas = quebrar_equilibrado(palavras, fonte, largura_max, desenho)
        if len(linhas) <= 3:
            break
    altura_linha = int(tamanho * 1.12)
    y = base_y - altura_linha * len(linhas) if centro_y is None else int(centro_y - altura_linha * len(linhas) / 2 - tamanho * 0.12)
    camada = Image.new('RGBA', imagem.size, (0, 0, 0, 0))
    sombra = ImageDraw.Draw(camada)
    for i, linha in enumerate(linhas):
        x = MARGEM_ESQ
        for palavra, _ in linha:
            sombra.text((x + 6, y + i * altura_linha + 8), palavra, font=fonte, fill=(0, 0, 0, 200))
            x += desenho.textlength(palavra + ' ', font=fonte)
    camada = camada.filter(ImageFilter.GaussianBlur(8))
    imagem.paste(camada, (0, 0), camada)
    desenho = ImageDraw.Draw(imagem)
    for i, linha in enumerate(linhas):
        x = MARGEM_ESQ
        for palavra, destaque in linha:
            desenho.text((x, y + i * altura_linha), palavra, font=fonte, fill=AMARELO if destaque else BRANCO, stroke_width=4, stroke_fill=(0, 0, 0))
            x += desenho.textlength(palavra + ' ', font=fonte)
    return {'linhas': len(linhas), 'tamanho': tamanho, 'topo': y}


def main():
    parser = argparse.ArgumentParser(description='Gera a capa 1080x1920 de cada corte a partir de um quadro e do título.')
    parser.add_argument('lote')
    parser.add_argument('--cortes', default=None)
    parser.add_argument('--tempo', default=None, help='Tempo do quadro no vídeo original (mm:ss); padrão: capa_tempo do corte ou um terço do corte')
    parser.add_argument('--titulo', default=None, help='Título da capa; *palavra* fica amarela. Padrão: titulo_capa ou titulo do corte')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    momentos = momentos_do_lote(lote)
    pasta = lote / '6-capas'
    relatorio = []
    for corte in escolher_cortes(momentos, args.cortes):
        n = int(corte['n'])
        cronometro = Cronometro()
        info = ler_json(lote / '4-pilotos' / 'trabalho' / f'corte{n}-info.json')
        if not info:
            raise SystemExit(f'Corte {n}: rode cortar.py antes.')
        absoluto = args.tempo or corte.get('capa_tempo')
        segundo = ler_tempo(absoluto) - info['inicio'] if absoluto is not None else info['duracao'] / 3
        segundo = min(max(0.0, segundo), info['duracao'] - 0.1)
        quadro = quadro_do_corte(lote, n, segundo, pasta / f'corte{n}-quadro.jpg')
        titulo = args.titulo or corte.get('titulo_capa') or corte.get('titulo') or ''
        layout = layout_no_tempo(info, segundo)
        centro = {'dividida': ALTURA // 2, 'jogo': 700}.get(layout)
        imagem = escurecer(quadro, centro)
        medida = desenhar_titulo(imagem, titulo, AREA_PERFIL[1] - 60, centro) if titulo else {}
        medida['layout'] = layout
        destino = pasta / f'corte{n}.jpg'
        imagem.save(destino, quality=94)
        tres_quartos = pasta / f'corte{n}-3x4.png'
        imagem.crop((0, AREA_PERFIL[0], LARGURA, AREA_PERFIL[1])).save(tres_quartos)
        medida['tres_quartos'] = tres_quartos.relative_to(lote).as_posix()
        (pasta / f'corte{n}-quadro.jpg').unlink(missing_ok=True)
        relatorio.append({'corte': n, 'arquivo': str(destino.relative_to(lote)).replace('\\', '/'), 'titulo': titulo, 'segundo_no_corte': round(segundo, 2), **medida, 'segundos': cronometro.total()})
        print(f'Corte {n}: capa com {medida.get("linhas", 0)} linhas em {cronometro.total()} s → {destino}')
    anterior = ler_json(pasta / 'capas.json', {'cortes': []})
    feitos = {c['corte']: c for c in anterior.get('cortes', [])}
    feitos.update({c['corte']: c for c in relatorio})
    gravar_json(pasta / 'capas.json', {'cortes': [feitos[k] for k in sorted(feitos)], 'atualizado': agora_iso()})


if __name__ == '__main__':
    main()
