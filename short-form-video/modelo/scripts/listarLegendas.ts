import { writeFileSync } from 'node:fs';
import { BLOCOS } from '../src/componentes/blocosLegenda.ts';

const f = (q: number) => (q / 30).toFixed(2).padStart(6);
const linhas = BLOCOS.map((b, i) => {
  const texto = b.palavras.map((p) => p.texto).join(' ').toUpperCase();
  const aviso: string[] = [];
  if (b.palavras.length === 1) aviso.push('palavra sozinha');
  if (b.palavras.length > 3) aviso.push('>3 palavras');
  if (texto.length > 16) aviso.push(`${texto.length} caracteres`);
  return `${String(i + 1).padStart(3)}  ${f(b.inicio)} - ${f(b.fim)}  [${b.palavras[0]?.cena}]  ${texto}${aviso.length ? '   <-- ' + aviso.join(', ') : ''}`;
});
linhas.push('', `Total: ${BLOCOS.length} blocos`);
writeFileSync(new URL('../out/legendas.txt', import.meta.url), linhas.join('\n'), 'utf-8');
console.log(linhas.join('\n'));
