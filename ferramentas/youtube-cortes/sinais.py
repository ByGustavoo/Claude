import argparse
import re
import subprocess

import numpy as np

from comum import FFMPEG, Cronometro, agora_iso, gravar_json, ler_json, ler_tempo, montar_resumo, original_do_lote, pasta_do_lote

TAXA = 8000
JANELA = 0.5
TEMPO_NO_TEXTO = re.compile(r'(?<![\d:])((?:\d{1,2}:)?\d{1,2}:\d{2})(?![\d:])')
RISO = re.compile(r'k{3,}|(?:ha){2,}|(?:rs){2,}|risos?|risada', re.I)


def energia_em_janelas(original):
    processo = subprocess.run([FFMPEG, '-v', 'error', '-i', str(original), '-vn', '-ac', '1', '-ar', str(TAXA), '-f', 's16le', '-'], capture_output=True)
    if processo.returncode != 0:
        raise SystemExit(processo.stderr.decode(errors='replace')[-1500:])
    amostras = np.frombuffer(processo.stdout, dtype=np.int16).astype(np.float32) / 32768.0
    passo = int(TAXA * JANELA)
    n = len(amostras) // passo
    blocos = amostras[: n * passo].reshape(n, passo)
    rms = np.sqrt(np.mean(blocos ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms + 1e-9)


def eventos_altos(db, limite, minimo_janelas=1):
    eventos, inicio = [], None
    for i, valor in enumerate(list(db) + [-120]):
        if valor >= limite and inicio is None:
            inicio = i
        elif valor < limite and inicio is not None:
            if i - inicio >= minimo_janelas:
                trecho = db[inicio:i]
                eventos.append({'inicio': round(inicio * JANELA, 2), 'fim': round(i * JANELA, 2), 'pico_db': round(float(trecho.max()), 1), 'tempo': round((inicio + int(np.argmax(trecho))) * JANELA, 2)})
            inicio = None
    return eventos


def cortes_de_cena(original, limiar):
    processo = subprocess.run(
        [FFMPEG, '-hide_banner', '-loglevel', 'info', '-hwaccel', 'auto', '-i', str(original), '-an', '-sn', '-vf', f'fps=10,scale=256:-2,scdet=threshold={limiar}', '-f', 'null', '-'],
        capture_output=True, text=True, encoding='utf-8', errors='replace',
    )
    tempos = [round(float(t), 2) for t in re.findall(r'lavfi\.scd\.time:\s*([\d.]+)', processo.stderr)]
    return sorted(set(tempos))


def comentarios_com_tempo(info, duracao):
    saida = []
    for c in info.get('comentarios') or []:
        for marca in TEMPO_NO_TEXTO.findall(c.get('texto') or ''):
            segundo = ler_tempo(marca)
            if 0 <= segundo <= duracao:
                saida.append({'segundo': segundo, 'texto': c['texto'], 'curtidas': c.get('curtidas') or 0})
    return saida


def main():
    parser = argparse.ArgumentParser(description='Mede sinais do vídeo: energia do áudio, picos, possíveis risadas, cortes de câmera e comentários com tempo.')
    parser.add_argument('lote')
    parser.add_argument('--bloco', type=float, default=30)
    parser.add_argument('--sem-cenas', action='store_true', help='Pula a detecção de cortes de câmera (a parte mais lenta)')
    parser.add_argument('--limiar-cena', type=float, default=12)
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    original = original_do_lote(lote)
    info = ler_json(lote / '2-original' / 'info.json', {})
    transcricao = ler_json(lote / '3-momentos' / 'transcricao.json', {})
    cronometro = Cronometro()

    db = energia_em_janelas(original)
    duracao = len(db) * JANELA
    cronometro.marcar('energia')
    com_som = db[db > -60]
    mediana = float(np.median(com_som)) if len(com_som) else -30.0
    p97 = float(np.percentile(com_som, 97)) if len(com_som) else -10.0
    limite_pico = max(p97, mediana + 3)

    por_bloco = []
    janelas_por_bloco = int(args.bloco / JANELA)
    for b in range(0, len(db), janelas_por_bloco):
        trecho = db[b: b + janelas_por_bloco]
        energia_media = 10 * np.log10(np.mean(10 ** (trecho / 10)) + 1e-12)
        por_bloco.append({'inicio': round(b * JANELA, 2), 'media_db': round(float(energia_media), 1), 'pico_db': round(float(trecho.max()), 1), 'acima_da_mediana': round(float(energia_media - mediana), 1)})

    picos = sorted(eventos_altos(db, limite_pico), key=lambda e: -e['pico_db'])[:20]
    palavras = transcricao.get('palavras', [])
    reacoes = []
    if palavras:
        for evento in eventos_altos(db, max(float(np.percentile(com_som, 90)), mediana + 2), minimo_janelas=2):
            if evento['fim'] - evento['inicio'] > 8:
                continue
            dentro = [p for p in palavras if p['i'] < evento['fim'] and p['f'] > evento['inicio']]
            if not dentro or any(RISO.search(p['p']) for p in dentro):
                reacoes.append(evento)
    cronometro.marcar('picos')

    anterior = ler_json(lote / '3-momentos' / 'sinais.json', {})
    cenas = anterior.get('cortes_de_cena', []) if args.sem_cenas else cortes_de_cena(original, args.limiar_cena)
    cronometro.marcar('cenas')
    comentarios = comentarios_com_tempo(info, duracao)

    dados = {
        'gerado_em': agora_iso(),
        'duracao': round(duracao, 2),
        'mediana_db': round(mediana, 1),
        'limite_pico_db': round(limite_pico, 1),
        'energia_por_bloco': por_bloco,
        'picos': sorted(picos, key=lambda e: e['tempo']),
        'reacoes': reacoes,
        'cortes_de_cena': cenas,
        'comentarios_com_tempo': comentarios,
        'tem_transcricao': bool(palavras),
    }
    gravar_json(lote / '3-momentos' / 'sinais.json', dados)
    resumo = montar_resumo(lote, args.bloco)
    cronometro.marcar('gravar')
    dados_tempo = {'segundos': cronometro.total(), 'etapas': cronometro.etapas}
    gravar_json(lote / '3-momentos' / 'sinais-tempo.json', dados_tempo)
    print(f'{len(picos)} picos, {len(reacoes)} possíveis reações, {len(cenas)} cortes de câmera, {len(comentarios)} comentários com tempo, em {cronometro.total()} s. '
          f'Resumo: {resumo or "rode transcrever.py para montar"}')


if __name__ == '__main__':
    main()
