import type { CSSProperties, ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { fontes } from '../tema';

export const TELA = { largura: 852, altura: 1512, barraStatus: 118 };

const FONTE_SISTEMA = fontes.texto;

function BarraStatus({ claro }: { claro: boolean }) {
  const cor = claro ? '#000' : '#fff';
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: TELA.barraStatus,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '18px 74px 0 92px',
        zIndex: 30,
        fontFamily: FONTE_SISTEMA,
        fontWeight: 600,
        fontSize: 38,
        color: cor,
        letterSpacing: '-0.01em',
      }}
    >
      <span>21:47</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <svg width="40" height="26" viewBox="0 0 20 13">
          {[0, 1, 2, 3].map((indice) => (
            <rect key={indice} x={indice * 5.2} y={9 - indice * 3} width="3.6" height={4 + indice * 3} rx="1" fill={cor} />
          ))}
        </svg>
        <svg width="36" height="26" viewBox="0 0 18 13">
          <path d="M9 12.2 6.6 9.6a3.4 3.4 0 0 1 4.8 0L9 12.2Z" fill={cor} />
          <path d="M4.4 7.5a6.5 6.5 0 0 1 9.2 0l-1.5 1.5a4.4 4.4 0 0 0-6.2 0L4.4 7.5Z" fill={cor} />
          <path d="M2.2 5.3a9.6 9.6 0 0 1 13.6 0l-1.5 1.5a7.5 7.5 0 0 0-10.6 0L2.2 5.3Z" fill={cor} />
        </svg>
        <svg width="56" height="26" viewBox="0 0 28 13">
          <rect x="0.7" y="0.7" width="23" height="11.6" rx="3.6" fill="none" stroke={cor} strokeOpacity="0.4" strokeWidth="1.2" />
          <rect x="2.4" y="2.4" width="15" height="8.2" rx="2.2" fill={cor} />
          <path d="M25.4 4.4v4.2a2.2 2.2 0 0 0 0-4.2Z" fill={cor} fillOpacity="0.4" />
        </svg>
      </div>
    </div>
  );
}

interface IphoneProps {
  entrada: number;
  saida?: number;
  claro?: boolean;
  fundoTela?: string;
  estilo?: CSSProperties;
  children: ReactNode;
}

export function Iphone({ entrada, saida, claro = false, fundoTela = '#000', estilo, children }: IphoneProps) {
  const quadro = useQuadro();
  const t = progresso(quadro, entrada, 24, curvaSaida);
  const s = saida === undefined ? 0 : progresso(quadro, saida, 24, curvaEntradaSaida);
  if (quadro < entrada - 1 || s >= 1) return null;
  const deslocamento = misturar(1300, 0, t) + s * 1300;
  const opacidade = Math.min(t * 1.4, 1) * (1 - progresso(s, 0.35, 0.65));

  return (
    <div
      style={{
        position: 'absolute',
        left: 90,
        top: 680,
        width: 900,
        height: 1560,
        transform: `translateY(${deslocamento}px)`,
        opacity: opacidade,
        ...estilo,
      }}
    >
      {[
        { lado: 'left' as const, topo: 250, altura: 64 },
        { lado: 'left' as const, topo: 360, altura: 120 },
        { lado: 'left' as const, topo: 500, altura: 120 },
        { lado: 'right' as const, topo: 400, altura: 190 },
      ].map((botao) => (
        <div
          key={`${botao.lado}${botao.topo}`}
          style={{
            position: 'absolute',
            [botao.lado]: -7,
            top: botao.topo,
            width: 10,
            height: botao.altura,
            borderRadius: 4,
            background: 'linear-gradient(90deg, #5B5E66, #2A2C31)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 132,
          padding: 7,
          background: 'linear-gradient(135deg, #8D9097 0%, #3D4046 18%, #26282C 50%, #45484E 82%, #9A9DA4 100%)',
          boxShadow: '0 60px 120px rgba(0,0,0,0.55), 0 20px 40px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ width: '100%', height: '100%', borderRadius: 126, background: '#050505', padding: 17 }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              borderRadius: 110,
              overflow: 'hidden',
              background: fundoTela,
            }}
          >
            <BarraStatus claro={claro} />
            <div
              style={{
                position: 'absolute',
                top: 26,
                left: '50%',
                width: 236,
                height: 70,
                marginLeft: -118,
                borderRadius: 36,
                background: '#000',
                zIndex: 31,
              }}
            />
            <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrocaDeTela({ inicio, fim, modo = 'empurrar', children }: { inicio: number; fim?: number; modo?: 'empurrar' | 'fade'; children: ReactNode }) {
  const quadro = useQuadro();
  if (quadro < inicio - 1) return null;
  const entrada = inicio <= 0 ? 1 : progresso(quadro, inicio, 16, curvaEntradaSaida);
  const saida = fim === undefined ? 0 : progresso(quadro, fim, 16, curvaEntradaSaida);
  if (saida >= 1) return null;
  if (modo === 'fade') {
    return <div style={{ position: 'absolute', inset: 0, opacity: entrada * (1 - saida) }}>{children}</div>;
  }
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        transform: `translateX(${(1 - entrada) * 100 - saida * 28}%)`,
        boxShadow: entrada < 1 ? '-30px 0 60px rgba(0,0,0,0.45)' : undefined,
        zIndex: entrada < 1 ? 2 : 1,
      }}
    >
      {children}
      {saida > 0 ? <div style={{ position: 'absolute', inset: 0, background: `rgba(0,0,0,${saida * 0.45})` }} /> : null}
    </div>
  );
}

export const fonteSistema = FONTE_SISTEMA;
