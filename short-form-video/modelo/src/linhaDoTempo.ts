import narracaoBruta from './narracao.json';
import { criarDeixas, criarLinhaDoTempo } from './deixas';
import type { IdCena, Narracao } from './deixas';

export const narracao: Narracao = narracaoBruta;
export const linha = criarLinhaDoTempo(narracao);
export const deixas = criarDeixas(linha);

export function deixasLocais<T extends IdCena>(id: T): (typeof deixas)[T] {
  const { inicio } = linha.cena(id);
  const absolutas = deixas[id];
  return Object.fromEntries(Object.entries(absolutas).map(([chave, valor]) => [chave, valor - inicio])) as (typeof deixas)[T];
}
