import type { CSSProperties, ReactNode } from 'react';
import { fontes } from '../tema';
import { Icone } from './Icone';
import type { NomeIcone } from './Icone';
import { BANCO } from './Telas';

export interface LinhaRecibo {
  rotulo: string;
  valor: ReactNode;
  cor?: string;
  realce?: number;
  mono?: boolean;
}

export interface SecaoRecibo {
  rotulo: string;
  linhas: LinhaRecibo[];
}

interface ReciboProps {
  titulo: string;
  valor: string;
  corValor?: string;
  icone: NomeIcone;
  corIcone: string;
  data?: string;
  secoes: SecaoRecibo[];
  estilo?: CSSProperties;
}

export function ContornoAnimado({ progresso: t, altura, raio, cor = '#FF4D5A', estilo }: { progresso: number; largura?: number; altura: number; raio?: number; cor?: string; estilo?: CSSProperties }) {
  if (t <= 0) return null;
  const desenho = Math.min(t / 0.8, 1);
  const preenchimento = Math.max((t - 0.6) / 0.4, 0);
  const r = Math.min(raio ?? altura / 2, altura / 2);
  const completo = desenho >= 1;
  return (
    <svg style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none', ...estilo }}>
      <rect x="0" y="0" width="100%" height="100%" rx={r} ry={r} fill={cor} fillOpacity={0.09 * preenchimento} />
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        rx={r}
        ry={r}
        fill="none"
        stroke={cor}
        strokeWidth={4}
        pathLength={1}
        strokeDasharray={completo ? undefined : '1 1'}
        strokeDashoffset={completo ? undefined : 1 - desenho}
        strokeLinecap="round"
        style={{ transformBox: 'fill-box', transformOrigin: 'center', transform: 'rotate(180deg)' }}
      />
    </svg>
  );
}

function Divisor() {
  return <div style={{ margin: '22px -36px', borderTop: '2px dashed rgba(255,255,255,0.1)' }} />;
}

function MarcaBanco() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: BANCO.destaque, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontes.titulo, fontWeight: 900, fontSize: 20, color: '#fff' }}>MB</div>
      <span style={{ fontSize: 24, fontWeight: 600, color: BANCO.suave }}>Meu Banco</span>
    </div>
  );
}

export function Recibo({ titulo, valor, corValor = BANCO.texto, icone, corIcone, data, secoes, estilo }: ReciboProps) {
  return (
    <div style={{ borderRadius: 38, background: '#171A20', border: '1px solid rgba(255,255,255,0.05)', padding: '30px 36px 32px', fontFamily: fontes.texto, ...estilo }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: corIcone, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icone nome={icone} tamanho={44} cor="#fff" espessura={2.8} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: BANCO.suave }}>{titulo}</span>
            <span style={{ fontSize: 62, fontWeight: 700, color: corValor, letterSpacing: '-0.03em', lineHeight: 1.05, fontVariantNumeric: 'tabular-nums' }}>{valor}</span>
          </div>
        </div>
      </div>
      {data ? <div style={{ fontSize: 25, fontWeight: 500, color: BANCO.suave, marginTop: 16 }}>{data}</div> : null}
      {secoes.map((secao) => (
        <div key={secao.rotulo}>
          <Divisor />
          <div style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 21, letterSpacing: '0.16em', color: BANCO.suave, marginBottom: 6 }}>{secao.rotulo}</div>
          {secao.linhas.map((linha) => (
            <div key={linha.rotulo} style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20, padding: '10px 0' }}>
              {linha.realce !== undefined && linha.realce > 0 ? (
                <ContornoAnimado progresso={linha.realce} largura={760} altura={62} estilo={{ left: -24, right: -24, top: -4, width: 'calc(100% + 48px)', height: 'calc(100% + 8px)' }} />
              ) : null}
              <span style={{ fontSize: 28, fontWeight: 500, color: BANCO.suave, whiteSpace: 'nowrap' }}>{linha.rotulo}</span>
              <span
                style={{
                  fontSize: linha.mono ? 24 : 30,
                  fontFamily: linha.mono ? fontes.mono : fontes.texto,
                  fontWeight: linha.mono ? 500 : 600,
                  color: linha.cor ?? BANCO.texto,
                  textAlign: 'right',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {linha.valor}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export function CabecalhoRecibo({ titulo }: { titulo: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
      <span style={{ fontSize: 40, fontWeight: 700, color: BANCO.texto, fontFamily: fontes.texto }}>{titulo}</span>
      <MarcaBanco />
    </div>
  );
}
