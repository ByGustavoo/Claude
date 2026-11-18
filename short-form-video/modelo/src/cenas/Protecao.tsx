import type { ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { contar, curvaSaida, misturar, progresso } from '../animacao';
import { Aparecer } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import type { NomeIcone } from '../componentes/Icone';
import { deixasLocais } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

interface PassoProps {
  quadro: number;
  inicio: number;
  fim: number;
  numero: number;
  icone: NomeIcone;
  titulo: string;
  detalhe: string;
  extra?: ReactNode;
}

function Passo({ quadro, inicio, fim, numero, icone, titulo, detalhe, extra }: PassoProps) {
  if (quadro < inicio - 1) return null;
  const t = progresso(quadro, inicio, 18, curvaSaida);
  const ativo = quadro >= inicio && quadro < fim;
  const marcado = progresso(quadro, inicio + 6, 12, curvaSaida);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        padding: '30px 30px',
        borderRadius: 32,
        background: ativo ? '#18211F' : '#15181D',
        border: `2px solid ${ativo ? cores.seguro : 'rgba(255,255,255,0.06)'}`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
        opacity: Math.min(t * 2, 1),
        transform: `translateX(${misturar(-120, 0, t)}px)`,
      }}
    >
      <div style={{ position: 'relative', width: 78, height: 78, flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 22, background: `${cores.seguro}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icone nome={icone} tamanho={42} cor={cores.seguro} espessura={2.4} />
        </div>
        <div
          style={{
            position: 'absolute',
            right: -10,
            top: -10,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: cores.seguro,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: `scale(${marcado})`,
            fontFamily: fontes.titulo,
            fontWeight: 900,
            fontSize: 20,
            color: cores.fundo,
          }}
        >
          {numero}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, minWidth: 0 }}>
        <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 46, color: cores.texto, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{titulo}</span>
        <span style={{ fontFamily: fontes.texto, fontWeight: 600, fontSize: 28, color: cores.suave }}>{detalhe}</span>
      </div>
      {extra}
    </div>
  );
}

function Limite({ quadro, inicio }: { quadro: number; inicio: number }) {
  const t = progresso(quadro, inicio + 8, 22);
  const valor = contar(quadro, inicio + 8, 22, 5000, 200);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, width: 150 }}>
      <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 24, color: cores.alerta, fontVariantNumeric: 'tabular-nums' }}>R$ {valor.toLocaleString('pt-BR')}</span>
      <div style={{ position: 'relative', width: 150, height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.15)' }}>
        <div style={{ width: `${misturar(100, 8, t)}%`, height: '100%', borderRadius: 5, background: cores.alerta }} />
        <div style={{ position: 'absolute', top: -9, left: `calc(${misturar(100, 8, t)}% - 14px)`, width: 28, height: 28, borderRadius: '50%', background: '#fff', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }} />
      </div>
    </div>
  );
}

export function Protecao() {
  const quadro = useQuadro();
  const d = deixasLocais('protecao');
  const inicioTitulo = Math.min(10, d.caiu);
  const escudo = progresso(quadro, inicioTitulo, 26, curvaSaida);
  const onda = progresso(quadro, inicioTitulo + 12, 30, curvaSaida);
  const linhaFina = progresso(quadro, inicioTitulo + 10, 16, curvaSaida);
  const titulo = progresso(quadro, inicioTitulo + 16, 18, curvaSaida);
  const dias = contar(quadro, d.oitenta - 6, 18, 0, 80);

  return (
    <>
      <div style={{ position: 'absolute', top: 540, left: 70, right: 70, display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 40,
              border: `4px solid ${cores.seguro}`,
              opacity: quadro >= inicioTitulo + 12 ? (1 - onda) * 0.8 : 0,
              transform: `scale(${misturar(1, 1.7, onda)})`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 36,
              background: cores.seguro,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${misturar(0.4, 1, escudo)}) rotate(${misturar(-35, 0, escudo)}deg)`,
              opacity: escudo,
            }}
          >
            <Icone nome="escudo" tamanho={84} cor={cores.fundo} espessura={2.4} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflow: 'hidden' }}>
          <span
            style={{
              fontFamily: fontes.mono,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '0.2em',
              color: cores.seguro,
              opacity: linhaFina,
              transform: `translateX(${misturar(-30, 0, linhaFina)}px)`,
            }}
          >
            FAÇA ISSO NA HORA
          </span>
          <span
            style={{
              fontFamily: fontes.titulo,
              fontWeight: 900,
              fontSize: 68,
              lineHeight: 1.05,
              letterSpacing: '-0.03em',
              color: cores.texto,
              opacity: titulo,
              transform: `translateY(${misturar(40, 0, titulo)}px)`,
            }}
          >
            CAIU NUM GOLPE?
          </span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 70, right: 150, top: 735, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <Passo quadro={quadro} inicio={d.avisa} fim={d.med} numero={1} icone="banco" titulo="Avise o banco na hora" detalhe="Pelo app ou canal oficial" />
        <Passo
          quadro={quadro}
          inicio={d.med}
          fim={d.registra}
          numero={2}
          icone="devolver"
          titulo="Peça o MED"
          detalhe="Devolução do Pix por golpe"
          extra={
            quadro >= d.oitenta - 8 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '10px 18px',
                  borderRadius: 22,
                  background: cores.destaque,
                  transform: `scale(${misturar(0.6, 1, progresso(quadro, d.oitenta - 8, 14, curvaSaida))})`,
                  opacity: progresso(quadro, d.oitenta - 8, 10),
                }}
              >
                <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 54, lineHeight: 1, color: '#000', fontVariantNumeric: 'tabular-nums', minWidth: 72, textAlign: 'center' }}>{dias}</span>
                <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 18, color: '#000' }}>DIAS</span>
              </div>
            ) : null
          }
        />
        <Passo quadro={quadro} inicio={d.registra} fim={d.diminui} numero={3} icone="documento" titulo="Registre um B.O." detalhe="Boletim de ocorrência" />
        <Passo quadro={quadro} inicio={d.diminui} fim={d.noite + 60} numero={4} icone="lua" titulo="Pix à noite: limite baixo" detalhe="Ajuste no app do banco" extra={<Limite quadro={quadro} inicio={d.diminui} />} />
      </div>
      {quadro >= d.contestar - 2 && quadro < d.registra ? (
        <div style={{ position: 'absolute', left: 70, right: 150, top: 1110 }}>
          <Aparecer inicio={d.contestar - 2}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '18px 24px', borderRadius: 24, background: 'rgba(255,225,77,0.1)', border: `2px solid ${cores.destaque}` }}>
              <Icone nome="raio" tamanho={36} cor={cores.destaque} preenchido espessura={1.6} />
              <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 32, color: cores.destaque }}>Conteste no app: quanto antes, melhor!</span>
            </div>
          </Aparecer>
        </div>
      ) : null}
    </>
  );
}
