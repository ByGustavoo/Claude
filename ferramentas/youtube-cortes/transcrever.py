import argparse
import re

import numpy as np

from comum import Cronometro, agora_iso, gravar_json, ler_json, montar_resumo, original_do_lote, pasta_do_lote


TAXA = 16000


def extrair(segmentos_whisper, deslocamento):
    segmentos, palavras = [], []
    for s in segmentos_whisper:
        segmentos.append({'i': round(s['start'] + deslocamento, 2), 'f': round(s['end'] + deslocamento, 2), 'texto': s['text'].strip()})
        for w in s.get('words') or []:
            texto = w['word'].strip()
            if texto:
                palavras.append({'p': texto, 'i': round(w['start'] + deslocamento, 2), 'f': round(w['end'] + deslocamento, 2), 'prob': round(w.get('probability', 0), 2)})
    return segmentos, palavras


def lacunas_com_fala(audio, palavras, minimo=6.0):
    janela = TAXA // 2
    n = len(audio) // janela
    db = 20 * np.log10(np.sqrt(np.mean(audio[: n * janela].reshape(n, janela) ** 2, axis=1)) + 1e-9)
    referencia = float(np.median(db[db > -60])) if np.any(db > -60) else -30.0
    saida = []
    for a, b in zip([0.0] + [w['f'] for w in palavras], [w['i'] for w in palavras] + [len(audio) / TAXA]):
        if b - a < minimo:
            continue
        trecho = db[int(a * 2):int(b * 2)]
        if len(trecho) and np.mean(trecho > referencia - 10) > 0.4:
            saida.append((a, b))
    return saida


def main():
    parser = argparse.ArgumentParser(description='Transcreve o vídeo com o Whisper na GPU, com tempo por palavra, e monta o resumo compacto.')
    parser.add_argument('lote')
    parser.add_argument('--modelo', default='large-v3-turbo')
    parser.add_argument('--idioma', default='pt')
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    original = original_do_lote(lote)
    info = ler_json(lote / '2-original' / 'info.json', {})
    cronometro = Cronometro()

    import warnings

    import torch
    import whisper

    warnings.filterwarnings('ignore')

    dispositivo = 'cuda' if torch.cuda.is_available() else 'cpu'
    modelo = whisper.load_model(args.modelo, device=dispositivo)
    cronometro.marcar('carregar_modelo')
    audio = whisper.load_audio(str(original))
    cronometro.marcar('extrair_audio')
    dica = ', '.join(x for x in [info.get('canal'), info.get('titulo')] if x)
    parametros = dict(language=args.idioma, word_timestamps=True, condition_on_previous_text=False, initial_prompt=dica[:200] or None, fp16=dispositivo == 'cuda', verbose=None)
    resultado = modelo.transcribe(audio, hallucination_silence_threshold=2.0, **parametros)
    cronometro.marcar('transcrever')
    segmentos, palavras = extrair(resultado['segments'], 0.0)
    lacunas = []
    for inicio, fim in lacunas_com_fala(audio, palavras):
        anteriores = [s['i'] for s in segmentos if inicio - 6 <= s['i'] < inicio]
        inicio = min(anteriores) if anteriores else inicio
        trecho = audio[int(max(0, inicio - 1) * TAXA):int((fim + 1) * TAXA)]
        novos_segmentos, novas = extrair(modelo.transcribe(trecho, **parametros)['segments'], max(0, inicio - 1))
        novas = [w for w in novas if inicio - 0.05 <= w['i'] and w['f'] < fim]
        novos_segmentos = [s for s in novos_segmentos if inicio - 0.05 <= s['i'] < fim]
        palavras = [w for w in palavras if not (inicio - 0.05 <= w['i'] < fim)]
        segmentos = [s for s in segmentos if not (inicio - 0.05 <= s['i'] < fim)]
        lacunas.append({'inicio': round(inicio, 2), 'fim': round(fim, 2), 'palavras': len(novas)})
        palavras += novas
        segmentos += novos_segmentos
    palavras.sort(key=lambda w: w['i'])
    segmentos.sort(key=lambda s: s['i'])
    cronometro.marcar('lacunas')
    duracao = round(len(audio) / 16000, 2)
    repetidas = sum(1 for a, b in zip(segmentos, segmentos[1:]) if a['texto'] and a['texto'] == b['texto'])
    dados = {
        'modelo': args.modelo,
        'idioma': args.idioma,
        'dispositivo': dispositivo,
        'duracao': duracao,
        'gerado_em': agora_iso(),
        'segmentos_repetidos': repetidas,
        'lacunas_refeitas': lacunas,
        'palavras_pouco_confiaveis': sum(1 for p in palavras if p['prob'] < 0.4),
        'segmentos': segmentos,
        'palavras': palavras,
    }
    gravar_json(lote / '3-momentos' / 'transcricao.json', dados)
    texto_corrido = re.sub(r'\s+', ' ', ' '.join(s['texto'] for s in segmentos))
    (lote / '3-momentos' / 'transcricao.txt').write_text(texto_corrido, encoding='utf-8')
    resumo = montar_resumo(lote)
    cronometro.marcar('gravar')
    gravar_json(lote / '3-momentos' / 'transcrever.json', {'segundos': cronometro.total(), 'etapas': cronometro.etapas, 'palavras': len(palavras), 'duracao_audio': duracao, 'velocidade': round(duracao / max(cronometro.etapas['transcrever'], 0.1), 1)})
    print(f'{len(palavras)} palavras em {len(segmentos)} trechos, {duracao:.0f} s de áudio em {cronometro.total()} s '
          f'({duracao / max(cronometro.etapas["transcrever"], 0.1):.0f}x tempo real). Resumo: {resumo}')


if __name__ == '__main__':
    main()
