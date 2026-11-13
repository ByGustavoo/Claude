import type { CSSProperties } from 'react';
import { Easing, interpolate, random, spring } from 'remotion';
import { QUADROS_POR_SEGUNDO, SOBREPOSICAO } from './deixas';

export const curvaSaida = Easing.bezier(0.22, 1, 0.36, 1);
export const curvaEntradaSaida = Easing.bezier(0.65, 0, 0.35, 1);

export function progresso(quadro: number, inicio: number, duracao: number, curva = curvaSaida): number {
  return interpolate(quadro, [inicio, inicio + duracao], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: curva,
  });
}

export function mola(quadro: number, inicio: number, rigidez = 170, amortecimento = 14, massa = 1): number {
  return spring({
    frame: quadro - inicio,
    fps: QUADROS_POR_SEGUNDO,
    config: { stiffness: rigidez, damping: amortecimento, mass: massa },
  });
}

export function misturar(de: number, para: number, t: number): number {
  return de + (para - de) * t;
}

export function tremor(quadro: number, inicio: number, intensidade = 14, duracao = 10): { x: number; y: number } {
  const t = quadro - inicio;
  if (t < 0 || t > duracao) return { x: 0, y: 0 };
  const queda = (1 - t / duracao) ** 2;
  return {
    x: (random(`tx${inicio}-${t}`) - 0.5) * 2 * intensidade * queda,
    y: (random(`ty${inicio}-${t}`) - 0.5) * 2 * intensidade * queda,
  };
}

export function pulso(quadro: number, periodo = 30, minimo = 0.6): number {
  return minimo + (1 - minimo) * (0.5 + 0.5 * Math.sin((quadro / periodo) * Math.PI * 2));
}

export function estiloTransicaoCena(quadro: number, duracao: number, comSaida = true): CSSProperties {
  const entrada = progresso(quadro, 0, SOBREPOSICAO, curvaSaida);
  const saida = comSaida ? progresso(quadro, duracao - SOBREPOSICAO, SOBREPOSICAO, curvaEntradaSaida) : 0;
  return {
    opacity: entrada * (1 - saida),
    transform: `translateY(${(1 - entrada) * 24 - saida * 24}px)`,
  };
}

export function entradaElemento(quadro: number, inicio: number, deslocamento = 60): CSSProperties {
  const t = mola(quadro, inicio, 190, 16);
  return {
    opacity: progresso(quadro, inicio, 6),
    transform: `translateY(${misturar(deslocamento, 0, t)}px) scale(${misturar(0.92, 1, t)})`,
  };
}

export function contar(quadro: number, inicio: number, duracao: number, de: number, para: number): number {
  return Math.round(misturar(de, para, progresso(quadro, inicio, duracao, curvaEntradaSaida)));
}

export function formatarReais(valor: number, centavos = true): string {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: centavos ? 2 : 0, maximumFractionDigits: centavos ? 2 : 0 });
}
