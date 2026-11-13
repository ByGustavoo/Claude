import { useQuadro } from '../tempo';
import { curvaSaida, misturar, progresso } from '../animacao';
import { normalizar } from '../deixas';
import type { PalavraEmQuadros } from '../deixas';
import { linha } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

interface Bloco {
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
const FIM_DE_FRASE = /[.?!:…,]$/;
const PALAVRAS_PRESAS = new Set(['nao', 'nem', 'o', 'a', 'os', 'as', 'um', 'uma', 'de', 'do', 'da', 'no', 'na', 'pra', 'pro', 'e', 'que', 'se', 'seu', 'sua']);

function montarBlocos(palavras: PalavraEmQuadros[]): Bloco[] {
  const grupos: PalavraEmQuadros[][] = [];
  let atual: PalavraEmQuadros[] = [];
  palavras.forEach((palavra, indice) => {
    const anterior = palavras[indice - 1];
    const caracteres = atual.reduce((soma, item) => soma + item.texto.length + 1, 0) + palavra.texto.length;
    const presaAnterior = anterior !== undefined && PALAVRAS_PRESAS.has(normalizar(anterior.texto)) && atual.length <= MAXIMO_PALAVRAS;
    const quebra =
      (!presaAnterior && (atual.length >= MAXIMO_PALAVRAS || caracteres > MAXIMO_CARACTERES)) ||
      (anterior !== undefined && (FIM_DE_FRASE.test(anterior.texto) || palavra.inicio - anterior.fim > PAUSA_QUEBRA || palavra.cena !== anterior.cena));
    if (quebra && atual.length > 0) {
      grupos.push(atual);
      atual = [];
    }
    atual.push(palavra);
  });
  if (atual.length > 0) grupos.push(atual);
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

const BLOCOS = montarBlocos(linha.palavras);
export function Legenda() {
  const quadro = useQuadro();
  const bloco = BLOCOS.find((item) => quadro >= item.inicio && quadro < item.fim);
  if (!bloco) return null;
  const entrada = progresso(quadro, bloco.inicio, 6, curvaSaida);
  const indiceAtivo = bloco.palavras.reduce((melhor, palavra, indice) => (quadro >= palavra.inicio - 1 ? indice : melhor), -1);
  const saida = bloco.encadeado ? 0 : progresso(quadro, bloco.fim - 4, 4);

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: 288,
        height: 244,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          columnGap: 36,
          rowGap: 0,
          fontFamily: fontes.titulo,
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 1.08,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          textAlign: 'center',
          transform: `scale(${misturar(0.92, 1, entrada)}) translateY(${misturar(14, 0, entrada)}px)`,
          opacity: (1 - saida) * entrada,
        }}
      >
        {bloco.palavras.map((palavra, indice) => {
          const ativa = quadro >= palavra.inicio - 1;
          const falando = indice === indiceAtivo;
          const pulo = progresso(quadro, palavra.inicio - 1, 5, curvaSaida) * (1 - progresso(quadro, palavra.inicio + 4, 6, curvaSaida));
          const cor = falando ? cores.destaque : cores.texto;
          return (
            <span
              key={`${palavra.inicio}-${indice}`}
              style={{
                display: 'inline-block',
                color: cor,
                opacity: ativa ? 1 : 0.38,
                transform: `translateY(${-8 * pulo}px)`,
                WebkitTextStroke: '9px #000',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 18px rgba(0,0,0,0.45)',
              }}
            >
              {palavra.texto}
            </span>
          );
        })}
      </div>
    </div>
  );
}
