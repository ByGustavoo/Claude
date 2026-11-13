import type { CSSProperties, ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { fontes } from '../tema';
import { Icone } from './Icone';
import type { NomeIcone } from './Icone';
import { TELA } from './Iphone';

export const BANCO = {
  fundo: '#0F1115',
  cartao: '#1A1D23',
  linha: 'rgba(255,255,255,0.07)',
  texto: '#F2F3F5',
  suave: '#9AA0AA',
  destaque: '#3D7BFF',
  positivo: '#2FBF71',
  negativo: '#FF5A5F',
};

export function TopoApp({ titulo, voltar = true }: { titulo: string; voltar?: boolean }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: TELA.barraStatus,
        left: 0,
        right: 0,
        height: 100,
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        padding: '0 40px',
        fontFamily: fontes.texto,
      }}
    >
      {voltar ? (
        <svg width="34" height="48" viewBox="0 0 12 20">
          <path d="M10 2 2 10l8 8" fill="none" stroke={BANCO.texto} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <span style={{ fontSize: 38, fontWeight: 700, color: BANCO.texto }}>{titulo}</span>
    </div>
  );
}

export function Cartao({ estilo, children }: { estilo?: CSSProperties; children: ReactNode }) {
  return <div style={{ borderRadius: 34, background: BANCO.cartao, padding: '30px 36px', ...estilo }}>{children}</div>;
}

export function Linha({ rotulo, valor, destaque, estilo }: { rotulo: string; valor: ReactNode; destaque?: string; estilo?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 20, padding: '18px 0', fontFamily: fontes.texto, ...estilo }}>
      <span style={{ fontSize: 30, fontWeight: 500, color: BANCO.suave }}>{rotulo}</span>
      <span style={{ fontSize: 32, fontWeight: 600, color: destaque ?? BANCO.texto, textAlign: 'right' }}>{valor}</span>
    </div>
  );
}

export function pressao(quadro: number, momento: number): number {
  if (quadro < momento) return 0;
  if (quadro < momento + 8) return progresso(quadro, momento, 4, curvaSaida);
  return 1 - progresso(quadro, momento + 8, 8, curvaSaida);
}

export function BotaoApp({ texto, cor = BANCO.destaque, corTexto = '#fff', pressionado = 0, icone, estilo }: { texto: string; cor?: string; corTexto?: string; pressionado?: number; icone?: NomeIcone; estilo?: CSSProperties }) {
  return (
    <div
      style={{
        height: 112,
        borderRadius: 56,
        background: cor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        fontFamily: fontes.texto,
        fontWeight: 700,
        fontSize: 36,
        color: corTexto,
        transform: `scale(${1 - 0.045 * pressionado})`,
        filter: pressionado > 0.01 ? `brightness(${1 - 0.18 * pressionado})` : undefined,
        ...estilo,
      }}
    >
      {icone ? <Icone nome={icone} tamanho={40} cor={corTexto} espessura={2.4} /> : null}
      {texto}
    </div>
  );
}

export function Toque({ quadro, momento, x, y }: { quadro: number; momento: number; x: number; y: number }) {
  const inicio = momento - 16;
  if (quadro < inicio || quadro > momento + 26) return null;
  const aparece = progresso(quadro, inicio, 14, curvaSaida);
  const some = progresso(quadro, momento + 12, 14, curvaEntradaSaida);
  const aperto = pressao(quadro, momento);
  const onda = progresso(quadro, momento + 2, 24, curvaSaida);
  return (
    <div
      style={{
        position: 'absolute',
        left: x + (1 - aparece) * 40,
        top: y + (1 - aparece) * 70,
        zIndex: 40,
        opacity: aparece * (1 - some),
      }}
    >
      {quadro >= momento + 2 ? (
        <div
          style={{
            position: 'absolute',
            left: -60,
            top: -60,
            width: 120,
            height: 120,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.9)',
            transform: `scale(${misturar(0.7, 2.1, onda)})`,
            opacity: (1 - onda) * 0.7,
          }}
        />
      ) : null}
      <div
        style={{
          width: 104,
          height: 104,
          marginLeft: -52,
          marginTop: -52,
          borderRadius: '50%',
          background: 'rgba(235,238,242,0.55)',
          border: '2px solid rgba(255,255,255,0.85)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          transform: `scale(${misturar(1.25, 1, aparece) * (1 - 0.2 * aperto)})`,
        }}
      />
    </div>
  );
}

export function Banner({ inicio, fim, titulo, texto, icone, corIcone, destaque = false }: { inicio: number; fim: number; titulo: string; texto: string; icone: NomeIcone; corIcone: string; destaque?: boolean }) {
  const quadro = useQuadro();
  if (quadro < inicio - 1) return null;
  const entrada = progresso(quadro, inicio, 12, curvaSaida);
  const saida = progresso(quadro, fim, 12, curvaEntradaSaida);
  if (saida >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 24,
        right: 24,
        top: 24,
        zIndex: 35,
        transform: `translateY(${misturar(-260, 0, entrada) - saida * 260}px)`,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          padding: '26px 28px',
          borderRadius: 50,
          background: destaque ? 'rgba(58,30,34,0.97)' : 'rgba(44,44,48,0.96)',
          border: destaque ? '3px solid #FF5A5F' : undefined,
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
          fontFamily: fontes.texto,
        }}
      >
        <div style={{ width: 88, height: 88, borderRadius: 22, background: corIcone, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icone nome={icone} tamanho={50} cor="#fff" espessura={2.2} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#fff' }}>{titulo}</span>
            <span style={{ fontSize: 26, fontWeight: 500, color: 'rgba(255,255,255,0.55)' }}>agora</span>
          </div>
          <span style={{ fontSize: 31, fontWeight: 400, color: 'rgba(255,255,255,0.88)', lineHeight: 1.3 }}>{texto}</span>
        </div>
      </div>
    </div>
  );
}

export function Destaque({ inicio, fim, estilo, cor = '#FF4D5A' }: { inicio: number; fim?: number; estilo: CSSProperties; cor?: string }) {
  const quadro = useQuadro();
  if (quadro < inicio) return null;
  const t = progresso(quadro, inicio, 10, curvaSaida);
  const saida = fim === undefined ? 0 : progresso(quadro, fim, 10, curvaEntradaSaida);
  return (
    <div
      style={{
        position: 'absolute',
        borderRadius: 26,
        border: `5px solid ${cor}`,
        background: `${cor}14`,
        opacity: t * (1 - saida),
        transform: `scale(${misturar(1.08, 1, t)})`,
        ...estilo,
      }}
    />
  );
}

export function Avatar({ iniciais, cor, tamanho = 84 }: { iniciais: string; cor: string; tamanho?: number }) {
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: '50%',
        background: cor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fontes.texto,
        fontWeight: 600,
        fontSize: tamanho * 0.4,
        color: '#fff',
      }}
    >
      {iniciais}
    </div>
  );
}

export function FotoFilho({ tamanho = 84 }: { tamanho?: number }) {
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 84 84">
      <defs>
        <linearGradient id="ceuFoto" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7FB6E8" />
          <stop offset="1" stopColor="#C9DDEB" />
        </linearGradient>
      </defs>
      <rect width="84" height="84" fill="url(#ceuFoto)" />
      <path d="M0 70c10-6 20-8 30-6l54-4v24H0Z" fill="#5E8C61" />
      <path d="M18 84c2-15 12-24 24-24s22 9 24 24Z" fill="#2B3A55" />
      <circle cx="42" cy="38" r="15" fill="#E2B48C" />
      <path d="M27 35c0-11 7-17 15-17s16 6 15 17c-4-6-10-7-15-7s-11 1-15 7Z" fill="#3B2A1E" />
      <path d="M36 44c3 3 9 3 12 0" stroke="#7A4A33" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}
