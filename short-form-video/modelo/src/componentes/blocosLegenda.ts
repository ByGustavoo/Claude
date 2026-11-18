import { normalizar } from '../deixas.ts';
import type { PalavraEmQuadros } from '../deixas.ts';
import { linha } from '../linhaDoTempo.ts';

export interface Bloco {
  palavras: PalavraEmQuadros[];
  inicio: number;
  fim: number;
  encadeado: boolean;
}

const MAXIMO_PALAVRAS = 3;
const MAXIMO_CARACTERES = 16;
const PAUSA_QUEBRA = 6;
const FOLGA_FINAL = 5;
const EMENDA = 8;
const QUADROS_MINIMOS_NA_TELA = 14;
const FIM_DE_FRASE = /[.?!:…,]$/;
const PALAVRAS_PRESAS = new Set(['nao', 'nem', 'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'no', 'na', 'pra', 'pro', 'e', 'que', 'se', 'seu', 'sua']);
const COLADAS_EXTRA = new Set(['em', 'com', 'ou', 'te', 'eu', 'so', 'sem']);
const PARES_INSEPARAVEIS = new Set(['numero um']);
const EXIBIR: Record<string, string> = {};

function prepararTextos(palavras: PalavraEmQuadros[]): PalavraEmQuadros[] {
  return palavras.map((palavra) => ({ ...palavra, texto: EXIBIR[normalizar(palavra.texto)] ?? palavra.texto }));
}

function ficaColada(texto: string): boolean {
  const chave = normalizar(texto);
  return PALAVRAS_PRESAS.has(chave) || COLADAS_EXTRA.has(chave);
}

function custoBloco(segmento: PalavraEmQuadros[], de: number, ate: number): number {
  const itens = segmento.slice(de, ate + 1);
  const n = itens.length;
  const caracteres = itens.map((item) => item.texto).join(' ').length;
  let custo = 3;
  if (n > MAXIMO_PALAVRAS) custo += 8 * (n - MAXIMO_PALAVRAS);
  if (caracteres > MAXIMO_CARACTERES) custo += 2 * (caracteres - MAXIMO_CARACTERES);
  if (n === 1 && segmento.length > 1) custo += 6;
  const primeira = itens[0];
  const ultima = itens[n - 1];
  if (primeira && ultima) custo += Math.max(0, QUADROS_MINIMOS_NA_TELA - (ultima.fim - primeira.inicio)) * 1.2;
  const seguinte = segmento[ate + 1];
  if (ultima && seguinte) {
    if (ficaColada(ultima.texto)) custo += 100;
    if (PARES_INSEPARAVEIS.has(`${normalizar(ultima.texto)} ${normalizar(seguinte.texto)}`)) custo += 100;
  }
  return custo;
}

function dividirSegmento(segmento: PalavraEmQuadros[]): PalavraEmQuadros[][] {
  const n = segmento.length;
  const melhor: number[] = new Array<number>(n + 1).fill(Infinity);
  const origem: number[] = new Array<number>(n + 1).fill(0);
  melhor[0] = 0;
  for (let fim = 1; fim <= n; fim += 1) {
    for (let inicio = Math.max(0, fim - 5); inicio < fim; inicio += 1) {
      const custo = (melhor[inicio] ?? Infinity) + custoBloco(segmento, inicio, fim - 1);
      if (custo < (melhor[fim] ?? Infinity)) {
        melhor[fim] = custo;
        origem[fim] = inicio;
      }
    }
  }
  const grupos: PalavraEmQuadros[][] = [];
  let fim = n;
  while (fim > 0) {
    const inicio = origem[fim] ?? 0;
    grupos.unshift(segmento.slice(inicio, fim));
    fim = inicio;
  }
  return grupos;
}

function montarBlocos(entrada: PalavraEmQuadros[]): Bloco[] {
  const palavras = prepararTextos(entrada);
  const grupos: PalavraEmQuadros[][] = [];
  let segmento: PalavraEmQuadros[] = [];
  palavras.forEach((palavra, indice) => {
    const anterior = palavras[indice - 1];
    const quebra = anterior !== undefined && (FIM_DE_FRASE.test(anterior.texto) || palavra.inicio - anterior.fim > PAUSA_QUEBRA || palavra.cena !== anterior.cena);
    if (quebra && segmento.length > 0) {
      grupos.push(...dividirSegmento(segmento));
      segmento = [];
    }
    segmento.push(palavra);
  });
  if (segmento.length > 0) grupos.push(...dividirSegmento(segmento));
  return grupos.map((grupo, indice) => {
    const primeira = grupo[0];
    const ultima = grupo[grupo.length - 1];
    const proximo = grupos[indice + 1]?.[0];
    const inicio = (primeira?.inicio ?? 0) - 2;
    const fimNatural = (ultima?.fim ?? 0) + FOLGA_FINAL;
    const encadeado = proximo !== undefined && proximo.inicio - 2 <= fimNatural + EMENDA;
    const fim = encadeado && proximo ? proximo.inicio - 2 : fimNatural;
    return { palavras: grupo, inicio, fim, encadeado };
  });
}

export const BLOCOS = montarBlocos(linha.palavras);
