import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { renderStill, selectComposition } from '@remotion/renderer';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const quadros = process.argv.slice(2).map(Number).filter((valor) => Number.isFinite(valor));
const escala = Number(process.env.ESCALA ?? '0.5');
const pasta = join(raiz, 'out', process.env.PASTA ?? 'quadros');
mkdirSync(pasta, { recursive: true });

const servido = await bundle({ entryPoint: join(raiz, 'src', 'index.ts') });
const composicao = await selectComposition({ serveUrl: servido, id: 'GolpesPix' });
for (const quadro of quadros) {
  const destino = join(pasta, `q${String(quadro).padStart(5, '0')}.png`);
  await renderStill({ serveUrl: servido, composition: composicao, frame: quadro, output: destino, scale: escala, overwrite: true });
  console.log(destino);
}
