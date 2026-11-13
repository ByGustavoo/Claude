import type { CSSProperties, ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { cores, fontes } from '../tema';
import { Icone } from './Icone';

interface TituloGolpeProps {
  numero: number;
  titulo: string;
  inicio?: number;
}

export function TituloGolpe({ numero, titulo, inicio = 4 }: TituloGolpeProps) {
  const quadro = useQuadro();
  const selo = progresso(quadro, inicio, 14, curvaSaida);
  const texto = progresso(quadro, inicio + 4, 14, curvaSaida);
  const destaque = numero === 1;

  return (
    <div
      style={{
        position: 'absolute',
        top: 548,
        left: 90,
        right: 90,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
      }}
    >
      <div
        style={{
          width: 104,
          height: 104,
          borderRadius: 28,
          background: cores.perigo,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fontes.titulo,
          fontWeight: 900,
          fontSize: 66,
          color: '#fff',
          letterSpacing: '-0.04em',
          transform: `scale(${misturar(1.35, 1, selo)})`,
          opacity: selo,
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 36, marginRight: 1, marginTop: -20, opacity: 0.85 }}>#</span>
        {numero}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, opacity: texto, transform: `translateX(${misturar(40, 0, texto)}px)` }}>
        <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.2em', color: cores.perigo }}>
          {destaque ? 'O QUE MAIS ENGANA' : `GOLPE Nº ${numero}`}
        </span>
        <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 60, lineHeight: 1, letterSpacing: '-0.03em', color: cores.texto, whiteSpace: 'nowrap' }}>
          {titulo}
        </span>
      </div>
    </div>
  );
}

interface CarimboProps {
  texto: string;
  inicio: number;
  fim?: number;
  cor?: string;
  rotacao?: number;
  tamanho?: number;
  estilo?: CSSProperties;
}

export function Carimbo({ texto, inicio, fim, cor = cores.perigo, rotacao = -6, tamanho = 76, estilo }: CarimboProps) {
  const quadro = useQuadro();
  if (quadro < inicio) return null;
  const t = progresso(quadro, inicio, 12, curvaSaida);
  const saida = fim === undefined ? 0 : progresso(quadro, fim, 12, curvaEntradaSaida);
  if (saida >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 50,
        opacity: t * (1 - saida),
        ...estilo,
      }}
    >
      <div
        style={{
          transform: `rotate(${rotacao}deg) scale(${misturar(1.22, 1, t) * (1 - saida * 0.06)})`,
          padding: '14px 36px 10px',
          border: `6px solid ${cor}`,
          borderRadius: 20,
          fontFamily: fontes.titulo,
          fontWeight: 900,
          fontSize: tamanho,
          letterSpacing: '0.01em',
          color: cor,
          background: 'rgba(12,13,16,0.9)',
          boxShadow: '0 18px 40px rgba(0,0,0,0.45)',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
        }}
      >
        {texto}
      </div>
    </div>
  );
}

export function Realce({ cor = cores.seguro, children }: { cor?: string; children: ReactNode }) {
  return <span style={{ color: cor }}>{children}</span>;
}

export const ESPERA_DICA = 30;

export function DicaCentral({ inicio, fim, titulo, texto }: { inicio: number; fim?: number; titulo: ReactNode; texto: string }) {
  const quadro = useQuadro();
  if (quadro < inicio - 1) return null;
  const cartao = progresso(quadro, inicio, 24, curvaSaida);
  const cabecalho = progresso(quadro, inicio + 6, 16, curvaSaida);
  const manchete = progresso(quadro, inicio + 12, 18, curvaSaida);
  const apoio = progresso(quadro, inicio + 24, 18, curvaSaida);
  const saida = fim === undefined ? 0 : progresso(quadro, fim, 14, curvaEntradaSaida);
  if (saida >= 1) return null;
  const linha = (t: number): CSSProperties => ({ opacity: t, transform: `translateY(${misturar(18, 0, t)}px)` });
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: 740,
        opacity: cartao * (1 - saida),
        transform: `translateY(${misturar(70, 0, cartao) - saida * 30}px) scale(${misturar(0.97, 1, cartao)})`,
      }}
    >
      <div
        style={{
          borderRadius: 46,
          padding: '50px 54px 56px',
          background: '#13171C',
          border: '1.5px solid rgba(31,224,168,0.45)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 30, ...linha(cabecalho) }}>
          <div style={{ width: 64, height: 64, borderRadius: 18, background: cores.seguro, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icone nome="escudo" tamanho={38} cor="#06120E" espessura={2.4} />
          </div>
          <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 28, letterSpacing: '0.16em', color: cores.seguro }}>COMO SE PROTEGER</span>
        </div>
        <div style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 60, lineHeight: 1.2, color: cores.texto, letterSpacing: '-0.02em', ...linha(manchete) }}>{titulo}</div>
        <div style={{ height: 2, background: 'rgba(255,255,255,0.08)', margin: '32px 0 28px', ...linha(apoio) }} />
        <div style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 38, lineHeight: 1.4, color: '#C3CAD6', ...linha(apoio) }}>{texto}</div>
      </div>
    </div>
  );
}

export function Aparecer({ inicio, fim, deslocamento = 36, estilo, children }: { inicio: number; fim?: number; deslocamento?: number; estilo?: CSSProperties; children: ReactNode }) {
  const quadro = useQuadro();
  if (quadro < inicio - 1) return null;
  const t = progresso(quadro, inicio, 14, curvaSaida);
  const saida = fim === undefined ? 0 : progresso(quadro, fim, 10, curvaEntradaSaida);
  if (saida >= 1) return null;
  return (
    <div
      style={{
        opacity: t * (1 - saida),
        transform: `translateY(${misturar(deslocamento, 0, t)}px)`,
        ...estilo,
      }}
    >
      {children}
    </div>
  );
}
