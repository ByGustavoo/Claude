import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { LogoMarca } from './componentes/LogoMarca';
import { cores, fontes } from './tema';

export type ConceitoFoto =
  | 'pergunta' | 'texto' | 'invertido' | 'lampada' | 'interrobang' | 'escrito' | 'lupa'
  | 'duplo' | 'mascote' | 'reticencias' | 'play' | 'contorno' | 'gradiente' | 'gigante';

const BALAO =
  'M32 16H68A18 18 0 0 1 86 34V56A18 18 0 0 1 68 74H46L27 88L31 74A18 18 0 0 1 14 56V34A18 18 0 0 1 32 16Z';

const FUNDO_ESCURO = `radial-gradient(circle at 50% 42%, ${cores.painel} 0%, ${cores.fundoElevado} 48%, ${cores.fundo} 100%)`;
const SOMBRA = 'drop-shadow(0 24px 48px rgba(0,0,0,0.45))';

function Brilho() {
  return <div style={{ position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: cores.destaque, opacity: 0.1, filter: 'blur(120px)' }} />;
}

function Simbolo({ conceito }: { conceito: ConceitoFoto }) {
  if (conceito === 'pergunta' || conceito === 'texto') {
    return <LogoMarca tamanho={880} variante={conceito} estilo={{ filter: SOMBRA }} />;
  }
  const escuro = cores.fundo;
  const svg = (conteudo: ReactNode, defs?: ReactNode) => (
    <svg width={880} height={880} viewBox="0 0 100 100" style={{ filter: SOMBRA, overflow: 'visible' }}>
      {defs ? <defs>{defs}</defs> : null}
      {conteudo}
    </svg>
  );
  if (conceito === 'duplo') {
    return svg(
      <g transform="translate(50 50) scale(0.86) translate(-51 -44)">
        <g transform="translate(106 -4) scale(-0.6 0.6)"><path d={BALAO} fill="#F5F7FB" /></g>
        <text x="76" y="23.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={30} fill={escuro}>!</text>
        <g transform="translate(-6 10) scale(0.78)"><path d={BALAO} fill={cores.destaque} stroke={escuro} strokeWidth={3} /></g>
        <text x="33" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={39} fill={escuro}>?</text>
      </g>,
    );
  }
  if (conceito === 'mascote') {
    return <LogoMarca tamanho={880} variante="mascote" estilo={{ filter: SOMBRA }} />;
  }
  if (conceito === 'reticencias') {
    return svg(
      <>
        <path d={BALAO} fill={cores.destaque} />
        <circle cx="34" cy="45" r="6" fill={escuro} />
        <circle cx="50" cy="45" r="6" fill={escuro} />
        <circle cx="66" cy="45" r="6" fill={escuro} />
      </>,
    );
  }
  if (conceito === 'play') {
    return svg(
      <>
        <path d={BALAO} fill={cores.destaque} />
        <path d="M43 33L62 45L43 57Z" fill={escuro} stroke={escuro} strokeWidth="5" strokeLinejoin="round" />
      </>,
    );
  }
  if (conceito === 'contorno') {
    return svg(
      <>
        <path d={BALAO} fill="none" stroke={cores.destaque} strokeWidth="6" strokeLinejoin="round" />
        <text x="50" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={44} fill={cores.destaque}>?</text>
      </>,
    );
  }
  if (conceito === 'gradiente') {
    return svg(
      <>
        <path d={BALAO} fill="url(#degrade)" />
        <text x="50" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={50} fill={escuro}>?</text>
      </>,
      <linearGradient id="degrade" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#FFE14D" />
        <stop offset="1" stopColor="#FF8A1F" />
      </linearGradient>,
    );
  }
  if (conceito === 'gigante') {
    return (
      <svg width={880} height={880} viewBox="0 0 100 100">
        <text x="50" y="52" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={84} fill={cores.fundo}>?</text>
      </svg>
    );
  }
  if (conceito === 'invertido') {
    return (
      <svg width={880} height={880} viewBox="0 0 100 100" style={{ filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))' }}>
        <path d={BALAO} fill={cores.fundo} />
        <text x="50" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={50} fill={cores.destaque}>?</text>
      </svg>
    );
  }
  if (conceito === 'interrobang') {
    return (
      <svg width={880} height={880} viewBox="0 0 100 100" style={{ filter: SOMBRA }}>
        <path d={BALAO} fill={cores.destaque} />
        <text x="50" y="46.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={44} letterSpacing="-2" fill={cores.fundo}>?!</text>
      </svg>
    );
  }
  if (conceito === 'lampada') {
    return (
      <svg width={880} height={880} viewBox="0 0 100 100" style={{ filter: SOMBRA }}>
        <path d={BALAO} fill={cores.destaque} />
        <path d="M50 24a15 15 0 0 0-8.5 27.4V56h17v-4.6A15 15 0 0 0 50 24Z" fill={cores.fundo} />
        <rect x="41.5" y="58.5" width="17" height="4" rx="2" fill={cores.fundo} />
        <rect x="44" y="64.5" width="12" height="4" rx="2" fill={cores.fundo} />
      </svg>
    );
  }
  if (conceito === 'lupa') {
    return (
      <svg width={880} height={880} viewBox="0 0 100 100" style={{ filter: SOMBRA }}>
        <line x1="60" y1="60" x2="80" y2="80" stroke={cores.destaque} strokeWidth="11" strokeLinecap="round" />
        <circle cx="44" cy="44" r="23" fill={cores.fundoElevado} stroke={cores.destaque} strokeWidth="8" />
        <text x="44" y="45.5" textAnchor="middle" dominantBaseline="central" fontFamily={fontes.titulo} fontWeight={900} fontSize={32} fill={cores.destaque}>?</text>
      </svg>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: fontes.titulo, fontWeight: 900, lineHeight: 1, gap: 30, marginTop: 10 }}>
      <span style={{ fontSize: 150, letterSpacing: '0.02em', color: cores.texto }}>EXPLICA</span>
      <span style={{ fontSize: 400, letterSpacing: '-0.04em', color: cores.destaque }}>AÍ?</span>
    </div>
  );
}

export function FotoPerfil({ conceito }: { conceito: ConceitoFoto }) {
  const claro = conceito === 'invertido' || conceito === 'gigante';
  return (
    <AbsoluteFill style={{ background: claro ? cores.destaque : FUNDO_ESCURO, alignItems: 'center', justifyContent: 'center' }}>
      {claro ? null : <Brilho />}
      <Simbolo conceito={conceito} />
    </AbsoluteFill>
  );
}

const CONCEITOS: { id: ConceitoFoto; letra: string; nome: string }[] = [
  { id: 'pergunta', letra: 'A', nome: 'Balão com ?' },
  { id: 'texto', letra: 'B', nome: 'Balão com Aí' },
  { id: 'invertido', letra: 'C', nome: 'Fundo amarelo' },
  { id: 'lampada', letra: 'D', nome: 'Lâmpada' },
  { id: 'interrobang', letra: 'E', nome: 'Balão com ?!' },
  { id: 'escrito', letra: 'F', nome: 'Nome escrito' },
  { id: 'lupa', letra: 'G', nome: 'Lupa com ?' },
  { id: 'duplo', letra: 'H', nome: 'Pergunta e resposta' },
  { id: 'mascote', letra: 'I', nome: 'Carinha curiosa' },
  { id: 'reticencias', letra: 'J', nome: 'Digitando…' },
  { id: 'play', letra: 'K', nome: 'Balão com play' },
  { id: 'contorno', letra: 'L', nome: 'Só o contorno' },
  { id: 'gradiente', letra: 'M', nome: 'Degradê' },
  { id: 'gigante', letra: 'N', nome: '? gigante' },
];

function Circulo({ conceito, tamanho }: { conceito: ConceitoFoto; tamanho: number }) {
  return (
    <div style={{ position: 'relative', width: tamanho, height: tamanho, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', left: 0, top: 0, width: 1080, height: 1080, transform: `scale(${tamanho / 1080})`, transformOrigin: '0 0' }}>
        <FotoPerfil conceito={conceito} />
      </div>
    </div>
  );
}

export function PainelFotos({ ids }: { ids: ConceitoFoto[] }) {
  return (
    <AbsoluteFill style={{ background: '#121212', padding: 60, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 40, alignContent: 'flex-start', fontFamily: fontes.titulo }}>
      {CONCEITOS.filter((c) => ids.includes(c.id)).map((c) => (
        <div key={c.id} style={{ width: 460, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24 }}>
            <Circulo conceito={c.id} tamanho={280} />
            <Circulo conceito={c.id} tamanho={96} />
            <Circulo conceito={c.id} tamanho={44} />
          </div>
          <span style={{ fontWeight: 800, fontSize: 34, color: '#fff' }}>
            <span style={{ color: cores.destaque }}>{c.letra}</span> · {c.nome}
          </span>
        </div>
      ))}
    </AbsoluteFill>
  );
}
