import type { CSSProperties, ReactNode } from 'react';
import { cores, fontes } from '../tema';

interface CelularProps {
  largura?: number;
  altura?: number;
  fundoTela?: string;
  estilo?: CSSProperties;
  children: ReactNode;
}

export function Celular({ largura = 640, altura = 940, fundoTela = cores.fundoElevado, estilo, children }: CelularProps) {
  return (
    <div
      style={{
        position: 'relative',
        width: largura,
        height: altura,
        borderRadius: 78,
        padding: 14,
        background: 'linear-gradient(145deg, #2A303C 0%, #0E1117 45%, #1C212B 100%)',
        boxShadow: '0 50px 120px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,255,255,0.08), inset 0 0 0 2px rgba(255,255,255,0.05)',
        ...estilo,
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          borderRadius: 64,
          overflow: 'hidden',
          background: fundoTela,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 74,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 44px 0',
            fontFamily: fontes.texto,
            fontWeight: 700,
            fontSize: 24,
            color: cores.texto,
            zIndex: 5,
          }}
        >
          <span>21:47</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3 }}>
              {[8, 12, 16, 20].map((altura) => (
                <div key={altura} style={{ width: 5, height: altura, borderRadius: 2, background: cores.texto }} />
              ))}
            </div>
            <div style={{ width: 40, height: 20, borderRadius: 6, border: `2.5px solid ${cores.texto}`, padding: 2 }}>
              <div style={{ width: '62%', height: '100%', borderRadius: 3, background: cores.texto }} />
            </div>
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 16,
            left: '50%',
            width: 150,
            height: 42,
            marginLeft: -75,
            borderRadius: 24,
            background: '#000',
            zIndex: 6,
          }}
        />
        <div style={{ position: 'absolute', inset: 0, paddingTop: 80 }}>{children}</div>
      </div>
    </div>
  );
}

interface NotificacaoProps {
  titulo: string;
  texto: string;
  cor: string;
  icone: ReactNode;
  estilo?: CSSProperties;
}

export function Notificacao({ titulo, texto, cor, icone, estilo }: NotificacaoProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 20,
        padding: '20px 24px',
        borderRadius: 30,
        background: 'rgba(32,38,52,0.94)',
        border: '1.5px solid rgba(255,255,255,0.1)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        fontFamily: fontes.texto,
        ...estilo,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: 18,
          background: cor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icone}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 800, fontSize: 25, color: cores.texto }}>{titulo}</span>
          <span style={{ fontWeight: 500, fontSize: 21, color: cores.suave }}>agora</span>
        </div>
        <span style={{ fontWeight: 600, fontSize: 25, color: '#D9DEE8', lineHeight: 1.25 }}>{texto}</span>
      </div>
    </div>
  );
}

interface BolhaProps {
  lado: 'esquerda' | 'direita';
  hora?: string;
  estilo?: CSSProperties;
  children: ReactNode;
}

export function Bolha({ lado, hora = '21:47', estilo, children }: BolhaProps) {
  const direita = lado === 'direita';
  return (
    <div style={{ display: 'flex', justifyContent: direita ? 'flex-end' : 'flex-start', ...estilo }}>
      <div
        style={{
          maxWidth: '84%',
          padding: '16px 22px 12px',
          borderRadius: 28,
          borderBottomLeftRadius: direita ? 28 : 8,
          borderBottomRightRadius: direita ? 8 : 28,
          background: direita ? cores.chat : cores.chatRecebido,
          fontFamily: fontes.texto,
          fontWeight: 600,
          fontSize: 29,
          lineHeight: 1.3,
          color: cores.texto,
          boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
        }}
      >
        {children}
        <div style={{ textAlign: 'right', fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{hora}</div>
      </div>
    </div>
  );
}

export function Digitando({ quadro }: { quadro: number }) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ display: 'flex', gap: 9, padding: '22px 26px', borderRadius: 28, borderBottomLeftRadius: 8, background: cores.chatRecebido }}>
        {[0, 1, 2].map((indice) => (
          <div
            key={indice}
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: cores.suave,
              opacity: 0.35 + 0.65 * Math.max(0, Math.sin((quadro - indice * 4) / 4)),
              transform: `translateY(${-5 * Math.max(0, Math.sin((quadro - indice * 4) / 4))}px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
