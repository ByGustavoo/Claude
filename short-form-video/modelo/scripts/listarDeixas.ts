import { readFileSync } from 'node:fs';
import { criarDeixas, criarLinhaDoTempo } from '../src/deixas.ts';
import type { Narracao } from '../src/deixas.ts';

const narracao = JSON.parse(readFileSync(new URL('../src/narracao.json', import.meta.url), 'utf-8')) as Narracao;
const linha = criarLinhaDoTempo(narracao);
console.log(JSON.stringify({ total: linha.total, cenas: linha.cenas, deixas: criarDeixas(linha) }));
