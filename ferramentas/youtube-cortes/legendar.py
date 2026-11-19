import argparse
import re
import shutil

from comum import FONTE_LEGENDA, FONTES, Cronometro, agora_iso, escolher_cortes, gravar_json, ler_json, momentos_do_lote, pasta_do_lote

MAX_CARACTERES = 16
PAUSA_QUEBRA = 0.35
PAUSA_PROIBIDA = 0.7
CURTAS = {'a', 'o', 'e', 'é', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'um', 'uma', 'que', 'pra', 'pro', 'com', 'se', 'por', 'mas', 'ou', 'eu', 'me', 'te', 'os', 'as', 'ao', 'às', 'tá', 'lhe', 'não', 'nem'}
PARES = {('às', 'vezes'), ('por', 'isso'), ('de', 'novo'), ('tá', 'ligado'), ('tá', 'ligado?'), ('meu', 'irmão'), ('a', 'gente'), ('o', 'que'), ('pra', 'que'), ('por', 'que'), ('até', 'hoje'), ('de', 'repente'), ('com', 'certeza')}
AMARELO = '&H004DE1FF&'
VERDE = '&H007AE83C&'


def limpar(texto):
    texto = re.sub(r'[,.;:…]+$', '', texto.strip())
    texto = re.sub(r'^[,.;:…"“”]+|["“”]+$', '', texto)
    return texto.upper()


def termina_frase(texto):
    return bool(re.search(r'[.?!…:;,]$', texto.strip()))


def nucleo(texto):
    return re.sub(r'[^\wÀ-ÿ?-]', '', texto).lower()


def custo_do_bloco(palavras, a, b, pares=PARES):
    bloco = palavras[a:b + 1]
    k = len(bloco)
    caracteres = sum(len(limpar(p['p'])) for p in bloco) + k - 1
    if k > 4 or (k > 1 and caracteres > MAX_CARACTERES):
        return float('inf')
    for x, y in zip(bloco, bloco[1:]):
        if y['i'] - x['f'] > PAUSA_PROIBIDA:
            return float('inf')
    custo = {1: 6.0, 2: 0.0, 3: 0.4, 4: 2.5}[k]
    for p in bloco[:-1]:
        if termina_frase(p['p']):
            custo += 5.0
    ultima = bloco[-1]
    proxima = palavras[b + 1] if b + 1 < len(palavras) else None
    if termina_frase(ultima['p']) or proxima is None or proxima['i'] - ultima['f'] > PAUSA_QUEBRA:
        custo -= 1.0
    if limpar(ultima['p']).lower() in CURTAS and proxima is not None:
        custo += 3.0
    if proxima is not None and (nucleo(ultima['p']), nucleo(proxima['p'])) in pares:
        custo += 6.0
    return custo


def agrupar(palavras, pares=PARES):
    n = len(palavras)
    melhor = [0.0] + [float('inf')] * n
    volta = [0] * (n + 1)
    for fim in range(1, n + 1):
        for inicio in range(max(0, fim - 4), fim):
            c = melhor[inicio] + custo_do_bloco(palavras, inicio, fim - 1, pares)
            if c < melhor[fim]:
                melhor[fim], volta[fim] = c, inicio
    blocos, fim = [], n
    while fim > 0:
        blocos.append(palavras[volta[fim]:fim])
        fim = volta[fim]
    return list(reversed(blocos))


def tempo_ass(segundos):
    segundos = max(0.0, segundos)
    h, resto = divmod(segundos, 3600)
    m, s = divmod(resto, 60)
    return f'{int(h)}:{int(m):02d}:{s:05.2f}'


def escapar(texto):
    return texto.replace('\\', '').replace('{', '(').replace('}', ')')


def cabecalho():
    return (
        '[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\nScaledBorderAndShadow: yes\nYCbCr Matrix: TV.709\n\n'
        '[V4+ Styles]\n'
        'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
        f'Style: Legenda,{FONTE_LEGENDA},120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,8,4,2,60,140,460,1\n'
        f'Style: LegendaMeio,{FONTE_LEGENDA},120,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,0,0,0,0,100,100,1,0,1,8,4,5,60,140,0,1\n'
        f'Style: Titulo,{FONTE_LEGENDA},78,&H00FFFFFF,&H00FFFFFF,&H22101010,&H22101010,0,0,0,0,100,100,1,0,3,16,0,8,90,170,220,1\n\n'
        '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n'
    )


def texto_do_titulo(titulo):
    partes = re.split(r'(\*[^*]+\*)', titulo)
    saida = []
    for parte in partes:
        if parte.startswith('*') and parte.endswith('*'):
            saida.append('{\\c' + AMARELO + '}' + escapar(parte[1:-1].upper()) + '{\\c&H00FFFFFF&}')
        else:
            saida.append(escapar(parte.upper()))
    return ''.join(saida)


EMENDA = {'dividida': 960, 'jogo': 700}


def estilo_no_tempo(planos, segundo):
    for plano in planos:
        if plano['de'] <= segundo < plano['ate'] and plano['layout'] in EMENDA:
            return 'LegendaMeio', EMENDA[plano['layout']]
    return 'Legenda', None


def eventos_da_legenda(blocos, duracao, planos):
    linhas = []
    for n, bloco in enumerate(blocos):
        inicio_bloco = bloco[0]['i']
        proximo = blocos[n + 1][0]['i'] if n + 1 < len(blocos) else None
        fim_bloco = bloco[-1]['f'] + 0.25
        if proximo is not None and proximo - bloco[-1]['f'] < 0.6:
            fim_bloco = proximo
        if proximo is not None:
            fim_bloco = min(fim_bloco, proximo)
        fim_bloco = min(fim_bloco, duracao)
        estilo, emenda = estilo_no_tempo(planos, inicio_bloco)
        posicao = '{\\pos(500,' + str(emenda) + ')}' if emenda else ''
        for j, palavra in enumerate(bloco):
            de = inicio_bloco if j == 0 else palavra['i']
            ate = bloco[j + 1]['i'] if j + 1 < len(bloco) else fim_bloco
            if ate - de < 0.02:
                continue
            partes = []
            for k, p in enumerate(bloco):
                texto = escapar(limpar(p['p']))
                if k == j:
                    partes.append('{\\c' + AMARELO + '\\fscx108\\fscy108}' + texto + '{\\c&H00FFFFFF&\\fscx100\\fscy100}')
                elif p.get('destaque'):
                    partes.append('{\\c' + VERDE + '}' + texto + '{\\c&H00FFFFFF&}')
                else:
                    partes.append(texto)
            linhas.append(f'Dialogue: 1,{tempo_ass(de)},{tempo_ass(ate)},{estilo},,0,0,0,,{posicao}' + ' '.join(partes))
    return linhas


def aplicar_correcoes(palavras, correcoes, destaques):
    substituir = {k.lower(): v for k, v in (correcoes.get('substituir') or {}).items()}
    marcados = {d.lower() for d in list(correcoes.get('destaques') or []) + list(destaques or [])}
    saida = []
    for p in palavras:
        nucleo = re.sub(r'[^\wÀ-ÿ-]', '', p['p']).lower()
        novo = dict(p)
        if nucleo in substituir:
            novo['p'] = re.sub(re.escape(re.sub(r'[^\wÀ-ÿ-]', '', p['p'])), substituir[nucleo], p['p'], count=1)
        if nucleo in marcados:
            novo['destaque'] = True
        saida.append(novo)
    return saida


def main():
    parser = argparse.ArgumentParser(description='Gera a legenda palavra por palavra (.ass) de cada corte, com o título-gancho no topo.')
    parser.add_argument('lote')
    parser.add_argument('--cortes', default=None)
    parser.add_argument('--recomecar', action='store_true', help='Descarta as palavras corrigidas em legendas/ e volta às do Whisper')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    momentos = momentos_do_lote(lote)
    pasta = lote / 'legendas'
    (pasta / 'fontes').mkdir(parents=True, exist_ok=True)
    for fonte in FONTES.glob('*.ttf'):
        if not (pasta / 'fontes' / fonte.name).exists():
            shutil.copy2(fonte, pasta / 'fontes' / fonte.name)
    correcoes = ler_json(pasta / 'correcoes.json', {})
    relatorio = []
    for corte in escolher_cortes(momentos, args.cortes):
        n = int(corte['n'])
        cronometro = Cronometro()
        info = ler_json(lote / '4-pilotos' / 'trabalho' / f'corte{n}-info.json')
        if not info:
            raise SystemExit(f'Corte {n}: rode cortar.py antes.')
        editavel = pasta / f'corte{n}-palavras.json'
        if args.recomecar or not editavel.exists():
            shutil.copy2(lote / '4-pilotos' / 'trabalho' / f'corte{n}-palavras.json', editavel)
        palavras = aplicar_correcoes(ler_json(editavel)['palavras'], correcoes, corte.get('destaques'))
        palavras = [p for p in palavras if limpar(p['p'])]
        pares = PARES | {tuple(par.lower().split()[:2]) for par in correcoes.get('pares') or [] if len(par.split()) >= 2}
        blocos = agrupar(palavras, pares)
        linhas = [cabecalho()]
        titulo = corte.get('titulo_tela') or corte.get('titulo')
        if titulo:
            linhas.append(f'Dialogue: 2,{tempo_ass(0)},{tempo_ass(info["duracao"])},Titulo,,0,0,0,,{texto_do_titulo(titulo)}')
        linhas += eventos_da_legenda(blocos, info['duracao'], info.get('planos', []))
        destino = pasta / f'corte{n}.ass'
        destino.write_text('\n'.join(linhas) + '\n', encoding='utf-8-sig')
        texto_blocos = [' '.join(limpar(p['p']) for p in b) for b in blocos]
        (pasta / f'corte{n}-blocos.txt').write_text('\n'.join(texto_blocos), encoding='utf-8')
        soltas = [t for t in texto_blocos if ' ' not in t]
        relatorio.append({'corte': n, 'blocos': len(blocos), 'palavras': len(palavras), 'blocos_de_uma_palavra': soltas, 'pouco_confiaveis': [p['p'] for p in palavras if (p.get('prob') or 1) < 0.4],
                          'titulo': titulo, 'arquivo': str(destino.relative_to(lote)).replace('\\', '/'), 'segundos': cronometro.total()})
        print(f'Corte {n}: {len(blocos)} blocos, {len(soltas)} de uma palavra → {destino}')
    gravar_json(pasta / 'legendar.json', {'cortes': relatorio, 'gerado_em': agora_iso()})


if __name__ == '__main__':
    main()
