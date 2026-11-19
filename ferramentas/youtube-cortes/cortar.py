import argparse
import re
import subprocess

import cv2
import numpy as np

from comum import FFMPEG, MODELOS, Cronometro, agora_iso, escolher_cortes, gravar_json, ler_json, momentos_do_lote, original_do_lote, pasta_do_lote, rodar, sondar, tempo_legivel

LARGURA, ALTURA = 1080, 1920
LAYOUTS = ('auto', 'rosto', 'dividida', 'desfocado', 'jogo')
ALTURA_FACECAM = 700


def encaixar_em_frases(inicio, fim, segmentos):
    comecos = [s['i'] for s in segmentos if inicio - 0.6 <= s['i'] <= inicio + 1.0]
    finais = [s['f'] for s in segmentos if fim - 1.0 <= s['f'] <= fim + 0.6]
    if comecos:
        inicio = min(comecos, key=lambda x: abs(x - inicio))
    if finais:
        fim = min(finais, key=lambda x: abs(x - fim))
    return inicio, fim


def ajustar_limites(inicio, fim, palavras, margem_inicio, margem_fim):
    if not palavras:
        return inicio, fim, None, None
    depois = [n for n, p in enumerate(palavras) if (p['i'] + p['f']) / 2 >= inicio]
    antes = [n for n, p in enumerate(palavras) if (p['i'] + p['f']) / 2 <= fim]
    if not depois or not antes:
        return inicio, fim, None, None
    a, b = depois[0], antes[-1]
    primeira, ultima = palavras[a], palavras[b]
    novo_inicio = primeira['i'] - margem_inicio
    if a > 0:
        novo_inicio = max(novo_inicio, (palavras[a - 1]['f'] + primeira['i']) / 2)
    novo_fim = ultima['f'] + margem_fim
    if b + 1 < len(palavras):
        novo_fim = min(novo_fim, (ultima['f'] + palavras[b + 1]['i']) / 2)
    return max(0.0, round(novo_inicio, 3)), round(novo_fim, 3), primeira, ultima


def extrair_trecho(original, inicio, duracao, destino):
    rodar([FFMPEG, '-v', 'error', '-y', '-ss', f'{inicio:.3f}', '-i', str(original), '-t', f'{duracao:.3f}', '-map', '0:v:0', '-map', '0:a:0',
           '-c:v', 'libx264', '-crf', '12', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ar', '48000', str(destino)])


def cortes_de_camera(trecho, limiar):
    processo = subprocess.run([FFMPEG, '-hide_banner', '-loglevel', 'info', '-i', str(trecho), '-an', '-vf', f'scale=256:-2,scdet=threshold={limiar}', '-f', 'null', '-'],
                              capture_output=True, text=True, encoding='utf-8', errors='replace')
    return sorted({round(float(t), 3) for t in re.findall(r'lavfi\.scd\.time:\s*([\d.]+)', processo.stderr)})


class Detector:
    def __init__(self):
        self.rede = cv2.FaceDetectorYN.create(str(MODELOS / 'face_detection_yunet_2023mar.onnx'), '', (320, 320), 0.7, 0.3, 50)

    def rostos(self, quadro):
        h, w = quadro.shape[:2]
        escala = 640 / w
        pequeno = cv2.resize(quadro, (640, int(round(h * escala))))
        self.rede.setInputSize((pequeno.shape[1], pequeno.shape[0]))
        _, achados = self.rede.detect(pequeno)
        saida = []
        for r in achados if achados is not None else []:
            x, y, rw, rh, pontuacao = float(r[0]), float(r[1]), float(r[2]), float(r[3]), float(r[-1])
            saida.append({'cx': (x + rw / 2) / pequeno.shape[1], 'cy': (y + rh / 2) / pequeno.shape[0], 'w': rw / pequeno.shape[1], 'h': rh / pequeno.shape[0], 'p': pontuacao})
        return saida


def agrupar(rostos, distancia=0.12):
    grupos = []
    for r in sorted(rostos, key=lambda r: r['cx']):
        if grupos and r['cx'] - grupos[-1][-1]['cx'] < distancia:
            grupos[-1].append(r)
        else:
            grupos.append([r])
    return grupos


def mediana_do_grupo(grupo):
    return {k: float(np.median([r[k] for r in grupo])) for k in ('cx', 'cy', 'w', 'h')}


def e_facecam(rosto):
    no_canto = (rosto['cx'] < 0.3 or rosto['cx'] > 0.7) and (rosto['cy'] < 0.35 or rosto['cy'] > 0.65)
    return rosto['h'] < 0.18 and no_canto


def decidir(amostras, forcado):
    validos = [r for lista in amostras for r in lista if r['p'] >= 0.75 and r['h'] >= 0.05]
    grupos = [g for g in agrupar(validos) if len(g) >= max(1, 0.4 * len(amostras))]
    grupos.sort(key=lambda g: -np.mean([r['h'] for r in g]))
    rostos = sorted([mediana_do_grupo(g) for g in grupos[:2]], key=lambda r: r['cx'])
    if forcado == 'desfocado':
        return 'desfocado', rostos
    if forcado == 'jogo':
        return ('jogo', rostos[:1]) if rostos else ('desfocado', rostos)
    if forcado == 'dividida' and len(rostos) >= 2:
        return 'dividida', rostos
    if forcado in ('rosto', 'dividida'):
        return 'rosto', rostos[:1] or [{'cx': 0.5, 'cy': 0.4, 'w': 0.1, 'h': 0.2}]
    if len(grupos) == 1 and e_facecam(rostos[0]):
        return 'jogo', rostos
    if len(grupos) == 1:
        return 'rosto', rostos
    if len(grupos) == 2 and abs(rostos[0]['cx'] - rostos[1]['cx']) >= 0.22:
        return 'dividida', rostos
    if len(grupos) == 2:
        juntos = {'cx': (rostos[0]['cx'] + rostos[1]['cx']) / 2, 'cy': (rostos[0]['cy'] + rostos[1]['cy']) / 2, 'w': 0.1, 'h': max(r['h'] for r in rostos)}
        return 'rosto', [juntos]
    return 'desfocado', rostos


def recorte_par(valor):
    return max(2, int(round(valor / 2)) * 2)


def compor_rosto(quadro, rosto):
    h, w = quadro.shape[:2]
    zoom = float(np.clip(0.2 / max(rosto['h'], 0.01), 1.0, 1.35))
    ch = recorte_par(h / zoom)
    cw = recorte_par(ch * 9 / 16)
    if cw > w:
        return compor_desfocado(quadro)
    x0 = int(np.clip(rosto['cx'] * w - cw / 2, 0, w - cw))
    y0 = int(np.clip(rosto['cy'] * h - 0.4 * ch, 0, h - ch))
    return cv2.resize(quadro[y0:y0 + ch, x0:x0 + cw], (LARGURA, ALTURA), interpolation=cv2.INTER_LANCZOS4)


def painel(quadro, rosto, largura, altura):
    h, w = quadro.shape[:2]
    proporcao = largura / altura
    ch = float(np.clip(rosto['h'] * h * 3.2, 0.35 * h, h))
    cw = ch * proporcao
    if cw > w:
        cw = w
        ch = cw / proporcao
    ch, cw = recorte_par(ch), recorte_par(cw)
    x0 = int(np.clip(rosto['cx'] * w - cw / 2, 0, w - cw))
    y0 = int(np.clip(rosto['cy'] * h - 0.45 * ch, 0, h - ch))
    return cv2.resize(quadro[y0:y0 + ch, x0:x0 + cw], (largura, altura), interpolation=cv2.INTER_LANCZOS4)


def compor_dividida(quadro, rostos):
    metade = ALTURA // 2
    saida = np.vstack([painel(quadro, rostos[0], LARGURA, metade), painel(quadro, rostos[1], LARGURA, metade)])
    saida[metade - 3: metade + 3, :] = (16, 16, 16)
    return saida


def compor_desfocado(quadro):
    h, w = quadro.shape[:2]
    escala = max(LARGURA / w, ALTURA / h)
    fundo = cv2.resize(quadro, (max(1, int(w * escala / 10)), max(1, int(h * escala / 10))), interpolation=cv2.INTER_AREA)
    fy, fx = fundo.shape[:2]
    x0, y0 = (fx - LARGURA // 10) // 2, (fy - ALTURA // 10) // 2
    fundo = fundo[y0:y0 + ALTURA // 10, x0:x0 + LARGURA // 10]
    fundo = cv2.GaussianBlur(fundo, (0, 0), 5)
    fundo = (cv2.resize(fundo, (LARGURA, ALTURA), interpolation=cv2.INTER_LINEAR) * 0.5).astype(np.uint8)
    altura_frente = recorte_par(LARGURA * h / w)
    frente = cv2.resize(quadro, (LARGURA, altura_frente), interpolation=cv2.INTER_LANCZOS4)
    topo = max(0, (ALTURA - altura_frente) // 2 - 120)
    fundo[topo:topo + altura_frente] = frente[: ALTURA - topo]
    return fundo


def compor_jogo(quadro, rosto):
    h, w = quadro.shape[:2]
    altura_jogo = ALTURA - ALTURA_FACECAM
    cw = recorte_par(min(w, h * LARGURA / altura_jogo))
    centro = w / 2
    if abs(rosto['cx'] - 0.5) < 0.25:
        centro = w * (0.25 if rosto['cx'] > 0.5 else 0.75)
    x0 = int(np.clip(centro - cw / 2, 0, w - cw))
    jogo = cv2.resize(quadro[:, x0:x0 + cw], (LARGURA, altura_jogo), interpolation=cv2.INTER_LANCZOS4)
    saida = np.vstack([painel(quadro, rosto, LARGURA, ALTURA_FACECAM), jogo])
    saida[ALTURA_FACECAM - 3: ALTURA_FACECAM + 3, :] = (16, 16, 16)
    return saida


def compor(quadro, plano):
    if plano['layout'] == 'rosto':
        return compor_rosto(quadro, plano['rostos'][0])
    if plano['layout'] == 'dividida':
        return compor_dividida(quadro, plano['rostos'])
    if plano['layout'] == 'jogo':
        return compor_jogo(quadro, plano['rostos'][0])
    return compor_desfocado(quadro)


def planos_do_trecho(trecho, fps, total_quadros, cortes, forcado, detector):
    limites = [0] + [int(round(t * fps)) for t in cortes if 0 < t * fps < total_quadros - 1] + [total_quadros]
    passo = max(1, int(round(fps / 4)))
    amostras = {}
    captura = cv2.VideoCapture(str(trecho))
    indice = 0
    inicios = set(l + 1 for l in limites[:-1])
    while True:
        ok, quadro = captura.read()
        if not ok:
            break
        if indice % passo == 0 or indice in inicios:
            amostras[indice] = detector.rostos(quadro)
        indice += 1
    captura.release()
    minimo = int(fps * 0.5)
    limpos = [limites[0]]
    for limite in limites[1:-1]:
        if limite - limpos[-1] >= minimo and limites[-1] - limite >= minimo:
            limpos.append(limite)
    limpos.append(limites[-1])
    limites = limpos
    planos = []
    for a, b in zip(limites, limites[1:]):
        if b <= a:
            continue
        lista = [v for k, v in amostras.items() if a <= k < b]
        if not lista and planos:
            planos.append({**planos[-1], 'de': a, 'ate': b})
            continue
        layout, rostos = decidir(lista, forcado)
        if planos and planos[-1]['layout'] == layout == 'rosto' and abs(planos[-1]['rostos'][0]['cx'] - rostos[0]['cx']) < 0.04:
            rostos = planos[-1]['rostos']
        planos.append({'de': a, 'ate': b, 'layout': layout, 'rostos': rostos, 'amostras': len(lista)})
    return planos, indice


def renderizar(trecho, destino, fps, planos):
    processo = subprocess.Popen(
        [FFMPEG, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{LARGURA}x{ALTURA}', '-r', f'{fps}', '-i', '-', '-i', str(trecho),
         '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '14', '-preset', 'fast', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest', str(destino)],
        stdin=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    captura = cv2.VideoCapture(str(trecho))
    indice, atual = 0, 0
    while True:
        ok, quadro = captura.read()
        if not ok:
            break
        while atual + 1 < len(planos) and indice >= planos[atual]['ate']:
            atual += 1
        processo.stdin.write(compor(quadro, planos[atual]).tobytes())
        indice += 1
    captura.release()
    processo.stdin.close()
    erro = processo.stderr.read().decode(errors='replace')
    if processo.wait() != 0:
        raise SystemExit(f'Falha ao gravar {destino.name}: {erro[-1500:]}')


def main():
    parser = argparse.ArgumentParser(description='Corta cada momento aprovado nas pausas da fala e enquadra em 9:16 (1080x1920).')
    parser.add_argument('lote')
    parser.add_argument('--cortes', default=None, help='Números separados por vírgula (padrão: todos os aprovados)')
    parser.add_argument('--margem-inicio', type=float, default=0.15)
    parser.add_argument('--margem-fim', type=float, default=0.45)
    parser.add_argument('--limiar-cena', type=float, default=12)
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    original = original_do_lote(lote)
    momentos = momentos_do_lote(lote)
    transcricao = ler_json(lote / '3-momentos' / 'transcricao.json', {})
    palavras = transcricao.get('palavras', [])
    trabalho = lote / '4-pilotos' / 'trabalho'
    trabalho.mkdir(parents=True, exist_ok=True)
    detector = Detector()
    relatorio = []
    for corte in escolher_cortes(momentos, args.cortes):
        n = int(corte['n'])
        cronometro = Cronometro()
        forcado = corte.get('layout', 'auto')
        if forcado not in LAYOUTS:
            raise SystemExit(f'Corte {n}: layout "{forcado}" não existe ({", ".join(LAYOUTS)}).')
        pedido_inicio, pedido_fim = encaixar_em_frases(float(corte['inicio']), float(corte['fim']), transcricao.get('segmentos', []))
        inicio, fim, primeira, ultima = ajustar_limites(pedido_inicio, pedido_fim, palavras, args.margem_inicio, args.margem_fim)
        duracao = round(fim - inicio, 3)
        trecho = trabalho / f'corte{n}-fonte.mkv'
        extrair_trecho(original, inicio, duracao, trecho)
        cronometro.marcar('extrair')
        tecnico = sondar(trecho)
        fps = min(tecnico['fps'] or 30, 60)
        cortes = cortes_de_camera(trecho, args.limiar_cena)
        cronometro.marcar('cortes_de_camera')
        captura = cv2.VideoCapture(str(trecho))
        total = int(captura.get(cv2.CAP_PROP_FRAME_COUNT)) or int(duracao * fps)
        captura.release()
        planos, lidos = planos_do_trecho(trecho, tecnico['fps'] or fps, total, cortes, forcado, detector)
        cronometro.marcar('rostos')
        destino = trabalho / f'corte{n}-enquadrado.mkv'
        renderizar(trecho, destino, tecnico['fps'] or fps, planos)
        cronometro.marcar('enquadrar')
        locais = [{'p': p['p'], 'i': round(max(0.0, p['i'] - inicio), 3), 'f': round(min(duracao, p['f'] - inicio), 3), 'prob': p.get('prob')}
                  for p in palavras if p['i'] >= inicio - 0.05 and p['f'] <= fim + 0.05]
        gravar_json(trabalho / f'corte{n}-palavras.json', {'corte': n, 'palavras': locais})
        contagem = {}
        for p in planos:
            contagem[p['layout']] = round(contagem.get(p['layout'], 0) + (p['ate'] - p['de']) / (tecnico['fps'] or fps), 2)
        info = {
            'corte': n,
            'pedido': {'inicio': corte['inicio'], 'fim': corte['fim']},
            'inicio': inicio,
            'fim': fim,
            'duracao': duracao,
            'primeira_palavra': primeira and primeira['p'],
            'ultima_palavra': ultima and ultima['p'],
            'fonte': {'largura': tecnico['largura'], 'altura': tecnico['altura'], 'fps': tecnico['fps']},
            'layout_pedido': forcado,
            'segundos_por_layout': contagem,
            'planos': [{'de': round(p['de'] / (tecnico['fps'] or fps), 2), 'ate': round(p['ate'] / (tecnico['fps'] or fps), 2), 'layout': p['layout'], 'rostos': len(p['rostos'])} for p in planos],
            'quadros_lidos': lidos,
            'arquivo': str(destino.relative_to(lote)).replace('\\', '/'),
            'gerado_em': agora_iso(),
            'segundos': cronometro.total(),
            'etapas': cronometro.etapas,
        }
        gravar_json(trabalho / f'corte{n}-info.json', info)
        trecho.unlink(missing_ok=True)
        relatorio.append(info)
        print(f'Corte {n}: {tempo_legivel(inicio)}–{tempo_legivel(fim)} ({duracao:.1f} s), começa em "{info["primeira_palavra"]}", termina em "{info["ultima_palavra"]}", '
              f'{len(planos)} planos {contagem}, em {cronometro.total()} s')
    anterior = ler_json(lote / '4-pilotos' / 'cortar.json', {'cortes': []})
    feitos = {c['corte']: c for c in anterior.get('cortes', [])}
    feitos.update({c['corte']: c for c in relatorio})
    gravar_json(lote / '4-pilotos' / 'cortar.json', {'cortes': [feitos[k] for k in sorted(feitos)], 'atualizado': agora_iso()})


if __name__ == '__main__':
    main()
