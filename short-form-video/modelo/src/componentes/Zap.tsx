import type { ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { curvaSaida, progresso } from '../animacao';
import { fontes } from '../tema';
import { TELA } from './Iphone';

export const ZAP = {
  fundo: '#0B141A',
  cabecalho: '#1F2C34',
  recebida: '#202C33',
  enviada: '#005C4B',
  texto: '#E9EDEF',
  suave: '#8696A0',
  icone: '#AEBAC1',
  azul: '#53BDEB',
  verde: '#25D366',
};

export const ALTURA_CABECALHO = TELA.barraStatus + 126;
export const LIMITE_VISIVEL = 930;
export const ESPACO_CARIMBO = 200;
export const TOPO_CARIMBO_ZAP = 1460;

export type Lado = 'recebida' | 'enviada' | 'sistema' | 'data' | 'digitando';

export interface MensagemZap {
  lado: Lado;
  inicio: number;
  fim?: number;
  texto?: ReactNode;
  hora?: string;
  autor?: { nome: string; cor: string };
  destaque?: boolean;
}

function Tiques() {
  return (
    <svg width="34" height="22" viewBox="0 0 17 11" style={{ marginLeft: 6, flexShrink: 0 }}>
      <path d="M1 5.8 3.9 8.7 10 1.6" fill="none" stroke={ZAP.azul} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.6 8.4 7 8.7 13.1 1.6" fill="none" stroke={ZAP.azul} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Rabicho({ lado }: { lado: 'recebida' | 'enviada' }) {
  const recebida = lado === 'recebida';
  return (
    <svg
      width="22"
      height="30"
      viewBox="0 0 11 15"
      style={{ position: 'absolute', top: 0, [recebida ? 'left' : 'right']: -16 }}
    >
      <path d={recebida ? 'M11 0H1.5C.4 0 0 1.3.8 2L11 13V0Z' : 'M0 0h9.5c1.1 0 1.5 1.3.7 2L0 13V0Z'} fill={recebida ? ZAP.recebida : ZAP.enviada} />
    </svg>
  );
}

function Pontinhos({ quadro }: { quadro: number }) {
  return (
    <div style={{ display: 'flex', gap: 10, padding: '8px 4px' }}>
      {[0, 1, 2].map((indice) => {
        const onda = Math.max(0, Math.sin((quadro - indice * 5) / 5));
        return <div key={indice} style={{ width: 16, height: 16, borderRadius: '50%', background: ZAP.suave, opacity: 0.4 + 0.6 * onda }} />;
      })}
    </div>
  );
}

function Balao({ mensagem, quadro, comRabicho }: { mensagem: MensagemZap; quadro: number; comRabicho: boolean }) {
  if (mensagem.lado === 'data' || mensagem.lado === 'sistema') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
        <div
          style={{
            padding: '10px 24px',
            borderRadius: 16,
            background: '#182229',
            color: mensagem.lado === 'data' ? ZAP.suave : '#D1D7DB',
            fontFamily: fontes.texto,
            fontWeight: 500,
            fontSize: mensagem.lado === 'data' ? 26 : 29,
            textAlign: 'center',
          }}
        >
          {mensagem.texto}
        </div>
      </div>
    );
  }
  const enviada = mensagem.lado === 'enviada';
  const lado = enviada ? 'enviada' : 'recebida';
  return (
    <div style={{ display: 'flex', justifyContent: enviada ? 'flex-end' : 'flex-start', padding: '0 32px' }}>
      <div
        style={{
          position: 'relative',
          maxWidth: '80%',
          padding: mensagem.lado === 'digitando' ? '14px 26px' : '12px 22px 10px',
          borderRadius: 22,
          borderTopLeftRadius: comRabicho && !enviada ? 0 : 22,
          borderTopRightRadius: comRabicho && enviada ? 0 : 22,
          background: enviada ? ZAP.enviada : ZAP.recebida,
          border: mensagem.destaque ? '3px solid #F5B301' : undefined,
          color: ZAP.texto,
          fontFamily: fontes.texto,
          fontWeight: 400,
          fontSize: 36,
          lineHeight: 1.32,
          boxShadow: '0 1px 1px rgba(0,0,0,0.25)',
        }}
      >
        {comRabicho ? <Rabicho lado={lado} /> : null}
        {mensagem.lado === 'digitando' ? (
          <Pontinhos quadro={quadro} />
        ) : (
          <>
            {mensagem.autor ? <div style={{ fontSize: 28, fontWeight: 600, color: mensagem.autor.cor, marginBottom: 2 }}>{mensagem.autor.nome}</div> : null}
            <span>{mensagem.texto}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', float: 'right', fontSize: 24, color: enviada ? 'rgba(233,237,239,0.6)' : ZAP.suave, marginLeft: 18, marginTop: 14, lineHeight: 1 }}>
              {mensagem.hora ?? '21:47'}
              {enviada ? <Tiques /> : null}
            </span>
          </>
        )}
      </div>
    </div>
  );
}

function Papel() {
  const formas = [];
  for (let linha = 0; linha < 16; linha += 1) {
    for (let coluna = 0; coluna < 7; coluna += 1) {
      const x = coluna * 130 + (linha % 2) * 65;
      const y = linha * 100;
      const tipo = (linha * 7 + coluna * 3) % 4;
      formas.push(
        tipo === 0 ? (
          <circle key={`${linha}-${coluna}`} cx={x} cy={y} r="14" />
        ) : tipo === 1 ? (
          <rect key={`${linha}-${coluna}`} x={x - 12} y={y - 12} width="24" height="24" rx="6" transform={`rotate(20 ${x} ${y})`} />
        ) : tipo === 2 ? (
          <path key={`${linha}-${coluna}`} d={`M${x - 14} ${y + 8}l14-20 14 20Z`} />
        ) : (
          <path key={`${linha}-${coluna}`} d={`M${x - 16} ${y}q8-14 16 0t16 0`} />
        ),
      );
    }
  }
  return (
    <svg width={TELA.largura} height={TELA.altura} style={{ position: 'absolute', inset: 0 }}>
      <g fill="none" stroke="#FFFFFF" strokeOpacity="0.045" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {formas}
      </g>
    </svg>
  );
}

export interface CabecalhoZap {
  nome: string;
  status: string;
  avatar: ReactNode;
  marcarNome?: number;
  marcarAvatar?: number;
}

const VERMELHO_MARCA = '#FF4D5A';

function SeloMarca({ numero, opacidade }: { numero: number; opacidade: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        right: -22,
        top: -22,
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: VERMELHO_MARCA,
        border: `3px solid ${ZAP.cabecalho}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 800,
        fontSize: 22,
        color: '#fff',
        opacity: opacidade,
        transform: `scale(${0.6 + 0.4 * opacidade})`,
      }}
    >
      {numero}
    </div>
  );
}

export function ConversaZap({ cabecalho, mensagens, espacoFinal = 0 }: { cabecalho: CabecalhoZap; mensagens: MensagemZap[]; espacoFinal?: number }) {
  const quadro = useQuadro();
  const comDigitacao: MensagemZap[] = [];
  mensagens.forEach((mensagem, indice) => {
    const anterior = mensagens[indice - 1];
    if (mensagem.lado === 'recebida' && anterior && anterior.lado !== 'data') {
      const inicio = Math.max(mensagem.inicio - 20, anterior.inicio + 10);
      if (mensagem.inicio - inicio >= 8) comDigitacao.push({ lado: 'digitando', inicio, fim: mensagem.inicio - 8 });
    }
    comDigitacao.push(mensagem);
  });
  const visiveis = comDigitacao.filter((mensagem) => quadro >= mensagem.inicio - 1 && (mensagem.fim === undefined || quadro < mensagem.fim + 8));

  return (
    <div style={{ position: 'absolute', inset: 0, background: ZAP.fundo, fontFamily: fontes.texto }}>
      <Papel />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: ALTURA_CABECALHO,
          background: ZAP.cabecalho,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '0 30px 22px 22px',
          gap: 18,
          zIndex: 10,
        }}
      >
        <svg width="40" height="56" viewBox="0 0 12 20" style={{ marginBottom: 14 }}>
          <path d="M10 2 2 10l8 8" fill="none" stroke={ZAP.icone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden' }}>{cabecalho.avatar}</div>
          {cabecalho.marcarAvatar ? (
            <>
              <div style={{ position: 'absolute', inset: -9, borderRadius: '50%', border: `4px solid ${VERMELHO_MARCA}`, opacity: cabecalho.marcarAvatar }} />
              <SeloMarca numero={2} opacidade={cabecalho.marcarAvatar} />
            </>
          ) : null}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1, minWidth: 0, fontFamily: fontes.texto, paddingBottom: 4 }}>
          <span style={{ position: 'relative', fontSize: 36, fontWeight: 600, color: ZAP.texto, whiteSpace: 'nowrap' }}>
            {cabecalho.nome}
            {cabecalho.marcarNome ? (
              <>
                <span style={{ position: 'absolute', inset: '-6px -16px', borderRadius: 999, border: `4px solid ${VERMELHO_MARCA}`, opacity: cabecalho.marcarNome }} />
                <SeloMarca numero={1} opacidade={cabecalho.marcarNome} />
              </>
            ) : null}
          </span>
          <span style={{ fontSize: 26, fontWeight: 400, color: ZAP.suave, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cabecalho.status}</span>
        </div>
        <svg width="50" height="50" viewBox="0 0 24 24" style={{ marginBottom: 18 }}>
          <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h9A1.5 1.5 0 0 1 15 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 3 16.5v-9ZM15 10.5l5-3v9l-5-3" fill="none" stroke={ZAP.icone} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
        <svg width="44" height="44" viewBox="0 0 24 24" style={{ marginBottom: 20, marginLeft: 14 }}>
          <path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6.4 6.4l1.5-2.3 4.6 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" fill="none" stroke={ZAP.icone} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      </div>
      <div
        style={{
          position: 'absolute',
          top: ALTURA_CABECALHO,
          left: 0,
          right: 0,
          height: LIMITE_VISIVEL - ALTURA_CABECALHO,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          paddingBottom: 10 + espacoFinal,
        }}
      >
        {visiveis.map((mensagem, indice) => {
          const anterior = visiveis[indice - 1];
          const comRabicho = !anterior || anterior.lado !== mensagem.lado;
          const entrada = progresso(quadro, mensagem.inicio, 8, curvaSaida);
          const saida = mensagem.fim === undefined ? 0 : progresso(quadro, mensagem.fim, 8, curvaSaida);
          const altura = Math.min(entrada, 1 - saida);
          return (
            <div
              key={`${mensagem.lado}-${mensagem.inicio}`}
              style={{ display: 'grid', gridTemplateRows: `${altura}fr`, marginTop: altura * (comRabicho ? 18 : 6) }}
            >
              <div style={{ minHeight: 0, overflow: 'hidden' }}>
                <div style={{ opacity: altura, transform: `translateY(${(1 - entrada) * 16}px)`, paddingLeft: 16, paddingRight: 16 }}>
                  <Balao mensagem={mensagem} quadro={quadro} comRabicho={comRabicho && mensagem.lado !== 'data' && mensagem.lado !== 'sistema'} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
