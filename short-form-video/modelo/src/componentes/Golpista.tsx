import type { CSSProperties } from 'react';
import { useQuadro } from '../tempo';

export type Expressao = 'sorriso' | 'risada' | 'serio';

interface GolpistaProps {
  tamanho?: number;
  expressao?: Expressao;
  estilo?: CSSProperties;
}

export function Golpista({ tamanho = 320, expressao = 'sorriso', estilo }: GolpistaProps) {
  const quadro = useQuadro();
  const ciclo = quadro % 110;
  const piscar = ciclo > 100 && ciclo < 105 ? 0.15 : 1;
  const balanco = Math.sin(quadro / 18) * 2;
  const olhar = Math.sin(quadro / 40) * 2.5;
  const risada = expressao === 'risada' ? Math.abs(Math.sin(quadro / 4)) * 2.5 : 0;

  return (
    <svg width={tamanho} height={tamanho * 1.1} viewBox="0 0 200 220" style={{ overflow: 'visible', ...estilo }}>
      <defs>
        <linearGradient id="moletom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#353C4A" />
          <stop offset="1" stopColor="#1E232C" />
        </linearGradient>
        <linearGradient id="capuz" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3D4554" />
          <stop offset="1" stopColor="#262C37" />
        </linearGradient>
        <radialGradient id="sombraRosto" cx="0.5" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#1B1F27" />
          <stop offset="1" stopColor="#0A0C10" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="216" rx="78" ry="6" fill="#000" opacity="0.25" />
      <g transform={`rotate(${balanco} 100 180)`}>
        <path d="M22 220C28 170 60 146 100 146s72 24 78 74Z" fill="url(#moletom)" />
        <path d="M70 160c8 10 18 15 30 15s22-5 30-15" fill="none" stroke="#171B22" strokeWidth="5" strokeLinecap="round" />
        <path d="M88 172v26M112 172v26" stroke="#9AA3B2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="88" cy="200" r="3.5" fill="#9AA3B2" />
        <circle cx="112" cy="200" r="3.5" fill="#9AA3B2" />
        <path d="M60 206h80v14H60z" fill="#1A1E26" opacity="0.6" />
        <g transform={`translate(0 ${-risada})`}>
          <path d="M38 118C38 60 64 26 100 26s62 34 62 92c0 32-22 50-62 50s-62-18-62-50Z" fill="url(#capuz)" />
          <path d="M52 114c0-40 20-66 48-66s48 26 48 66" fill="none" stroke="#FFFFFF" strokeOpacity="0.07" strokeWidth="3" />
          <ellipse cx="100" cy="112" rx="45" ry="49" fill="url(#sombraRosto)" />
          <path d="M58 98c12-8 28-10 42-6 14-4 30-2 42 6l-2 18c-12 6-26 6-40 0-14 6-28 6-40 0Z" fill="#050608" />
          <g transform={`translate(${olhar} 0)`}>
            <path d={`M70 ${106 - 5 * piscar}q11 ${-4 * piscar} 22 0q-11 ${7 * piscar} -22 0Z`} fill="#F4F5F7" />
            <path d={`M108 ${106 - 5 * piscar}q11 ${-4 * piscar} 22 0q-11 ${7 * piscar} -22 0Z`} fill="#F4F5F7" />
            {piscar > 0.5 ? (
              <>
                <circle cx="84" cy="105" r="3.4" fill="#0A0C10" />
                <circle cx="122" cy="105" r="3.4" fill="#0A0C10" />
              </>
            ) : null}
          </g>
          {expressao === 'risada' ? (
            <path d="M84 130q16 16 34 0q-17 6-34 0Z" fill="#F4F5F7" />
          ) : expressao === 'serio' ? (
            <path d="M88 134h26" stroke="#C9CED6" strokeWidth="3.5" strokeLinecap="round" />
          ) : (
            <path d="M86 132q14 9 30-3" fill="none" stroke="#E6E8EC" strokeWidth="4" strokeLinecap="round" />
          )}
        </g>
      </g>
    </svg>
  );
}
