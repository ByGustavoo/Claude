import argparse
import json
import re
import subprocess

from comum import FFMPEG, Cronometro, agora_iso, escolher_cortes, gravar_json, ler_json, momentos_do_lote, pasta_do_lote, rodar, sondar

ALVO = 'I=-14:TP=-1.5:LRA=11'
LIMPEZA_SOM = 'highpass=f=70,afftdn=nr=8:nf=-35'
LIMPEZA_IMAGEM = 'hqdn3d=1.2:1.2:4:4,unsharp=5:5:0.5:5:5:0'


def medir_volume(entrada, cwd, filtro_antes):
    processo = subprocess.run([FFMPEG, '-hide_banner', '-nostats', '-i', entrada, '-vn', '-af', f'{filtro_antes},loudnorm={ALVO}:print_format=json', '-f', 'null', '-'],
                              capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=cwd)
    bloco = re.findall(r'\{[^{}]*"input_i"[^{}]*\}', processo.stderr)
    if not bloco:
        raise SystemExit(f'Não consegui medir o volume: {processo.stderr[-800:]}')
    return json.loads(bloco[-1])


def conferir(saida, cwd):
    processo = subprocess.run([FFMPEG, '-hide_banner', '-nostats', '-i', saida, '-vn', '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                              capture_output=True, text=True, encoding='utf-8', errors='replace', cwd=cwd)
    resumo = processo.stderr.split('Summary:')[-1]
    lufs = re.search(r'I:\s*(-?[\d.]+) LUFS', resumo)
    pico = re.search(r'Peak:\s*(-?[\d.]+|-inf) dBFS', resumo)
    return {'lufs': float(lufs.group(1)) if lufs else None, 'pico_dbfs': float(pico.group(1)) if pico and pico.group(1) != '-inf' else None}


def main():
    parser = argparse.ArgumentParser(description='Junta legenda, som e acabamento: piloto rápido em 4-pilotos/ ou final em 5-cortes/.')
    parser.add_argument('lote')
    parser.add_argument('--modo', choices=['piloto', 'final'], required=True)
    parser.add_argument('--cortes', default=None)
    args = parser.parse_args()

    lote = pasta_do_lote(args.lote)
    momentos = momentos_do_lote(lote)
    relatorio = []
    for corte in escolher_cortes(momentos, args.cortes):
        n = int(corte['n'])
        cronometro = Cronometro()
        entrada = f'4-pilotos/trabalho/corte{n}-enquadrado.mkv'
        legenda = f'legendas/corte{n}.ass'
        if not (lote / entrada).exists():
            raise SystemExit(f'Corte {n}: rode cortar.py antes.')
        if not (lote / legenda).exists():
            raise SystemExit(f'Corte {n}: rode legendar.py antes.')
        tecnico = sondar(lote / entrada)
        fps = tecnico['fps'] or 30
        filtro_legenda = f'ass={legenda}:fontsdir=legendas/fontes'
        filtro_fps = ',fps=60' if fps > 60.5 else ''
        if args.modo == 'piloto':
            saida = f'4-pilotos/corte{n}.mp4'
            comando = [FFMPEG, '-v', 'error', '-y', '-i', entrada, '-vf', filtro_legenda + filtro_fps, '-af', f'loudnorm={ALVO}',
                       '-c:v', 'libx264', '-crf', '20', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-movflags', '+faststart', saida]
        else:
            medida = medir_volume(entrada, lote, LIMPEZA_SOM)
            cronometro.marcar('medir_volume')
            filtro_som = (f'{LIMPEZA_SOM},loudnorm={ALVO}:measured_I={medida["input_i"]}:measured_TP={medida["input_tp"]}:measured_LRA={medida["input_lra"]}'
                          f':measured_thresh={medida["input_thresh"]}:offset={medida["target_offset"]}:linear=true')
            saida = f'5-cortes/corte{n}.mp4'
            comando = [FFMPEG, '-v', 'error', '-y', '-i', entrada, '-vf', f'{LIMPEZA_IMAGEM},{filtro_legenda}{filtro_fps}', '-af', filtro_som,
                       '-c:v', 'libx264', '-crf', '17', '-preset', 'slow', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
                       '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
                       '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-movflags', '+faststart', saida]
        rodar(comando, cwd=lote)
        cronometro.marcar('render')
        volume = conferir(saida, lote)
        resultado = sondar(lote / saida)
        cronometro.marcar('conferir')
        item = {'corte': n, 'modo': args.modo, 'arquivo': saida, **resultado, **volume, 'segundos': cronometro.total(), 'etapas': cronometro.etapas}
        relatorio.append(item)
        print(f'Corte {n} ({args.modo}): {resultado["largura"]}x{resultado["altura"]} {resultado["fps"]} fps, {resultado["duracao"]:.1f} s, {resultado["tamanho_mb"]} MB, '
              f'{volume["lufs"]} LUFS, pico {volume["pico_dbfs"]} dBFS, em {cronometro.total()} s → {lote / saida}')
    arquivo = lote / ('4-pilotos/pilotos.json' if args.modo == 'piloto' else '5-cortes/finais.json')
    anterior = ler_json(arquivo, {'cortes': []})
    feitos = {c['corte']: c for c in anterior.get('cortes', [])}
    feitos.update({c['corte']: c for c in relatorio})
    gravar_json(arquivo, {'cortes': [feitos[k] for k in sorted(feitos)], 'atualizado': agora_iso()})


if __name__ == '__main__':
    main()
