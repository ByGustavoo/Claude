import subprocess
import sys
from pathlib import Path

import imageio_ffmpeg

pasta = Path(sys.argv[1])
saida = Path(sys.argv[2])
colunas = int(sys.argv[3]) if len(sys.argv) > 3 else 4
arquivos = sorted(pasta.glob("q*.png"))
linhas = (len(arquivos) + colunas - 1) // colunas
entradas = []
for arquivo in arquivos:
    entradas += ["-i", str(arquivo)]
partes = "".join(f"[{i}:v]scale=432:768,pad=440:776:4:4:color=0x333333[v{i}];" for i in range(len(arquivos)))
rotulos = "".join(f"[v{i}]" for i in range(len(arquivos)))
layout = "|".join(f"{(i % colunas) * 440}_{(i // colunas) * 776}" for i in range(len(arquivos)))
filtro = f"{partes}{rotulos}xstack=inputs={len(arquivos)}:layout={layout}:fill=black"
subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", *entradas, "-filter_complex", filtro, "-frames:v", "1", str(saida)], check=True)
print(saida)
