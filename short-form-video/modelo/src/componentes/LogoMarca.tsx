import type { CSSProperties } from 'react';
import { cores, fontes } from '../tema';

export type VarianteLogo = 'pergunta' | 'texto' | 'mascote';

interface LogoMarcaProps {
  tamanho: number;
  variante?: VarianteLogo;
  estilo?: CSSProperties;
  olhos?: number;
}

const BALAO =
  'M32 16H68A18 18 0 0 1 86 34V56A18 18 0 0 1 68 74H46L27 88L31 74A18 18 0 0 1 14 56V34A18 18 0 0 1 32 16Z';

export function LogoMarca({ tamanho, variante = 'pergunta', estilo, olhos = 1 }: LogoMarcaProps) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 100 100" style={{ display: 'block', overflow: 'visible', ...estilo }}>
      <path d={BALAO} fill={cores.destaque} />
      {variante === 'mascote' ? (
        <>
          <ellipse cx="39" cy="44" rx="4.6" ry={Math.max(6.6 * olhos, 0.9)} fill={cores.fundo} />
          <ellipse cx="61" cy="44" rx="4.6" ry={Math.max(6.6 * olhos, 0.9)} fill={cores.fundo} />
          <path d="M32 32q7-6 14-2" fill="none" stroke={cores.fundo} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M55 33.5h12" fill="none" stroke={cores.fundo} strokeWidth="3.6" strokeLinecap="round" />
          <path d="M44 58q6 4.5 12 0" fill="none" stroke={cores.fundo} strokeWidth="3.6" strokeLinecap="round" />
        </>
      ) : variante === 'pergunta' ? (
        <text x="50" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={50} fill={cores.fundo}>
          ?
        </text>
      ) : (
        <text x="50" y="46" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={38} letterSpacing="1.5" fill={cores.fundo}>
          Aí
        </text>
      )}
    </svg>
  );
}
