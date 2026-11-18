import type { ReactNode } from 'react';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { Carimbo, DicaCentral, ESPERA_DICA, Realce, TituloGolpe } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import { Iphone, TrocaDeTela } from '../componentes/Iphone';
import { pressao, Toque } from '../componentes/Telas';
import { deixasLocais } from '../linhaDoTempo';
import { fontes } from '../tema';

function BotaoChamada({ cor, rotulo, girar = false, escala = 1, aperto = 0 }: { cor: string; rotulo: string; girar?: boolean; escala?: number; aperto?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ width: 150, height: 150, borderRadius: '50%', background: cor, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${escala * (1 - 0.08 * aperto)})`, filter: aperto > 0.01 ? `brightness(${1 - 0.2 * aperto})` : undefined }}>
        <Icone nome="telefone" tamanho={66} cor="#fff" preenchido espessura={1} estilo={{ transform: girar ? 'rotate(135deg)' : undefined }} />
      </div>
      <span style={{ fontFamily: fontes.texto, fontSize: 28, fontWeight: 500, color: '#fff' }}>{rotulo}</span>
    </div>
  );
}

function Botoes({ quadro, atender, desligar, encerrada, abrir }: { quadro: number; atender: number; desligar: number; encerrada: number; abrir: number }) {
  const movimento = progresso(quadro, atender + 6, 22, curvaEntradaSaida);
  const verde = progresso(quadro, atender + 4, 14, curvaEntradaSaida);
  const fim = progresso(quadro, encerrada, 14, curvaEntradaSaida);
  const centroVermelhoX = misturar(165, 426, movimento);
  const topoVermelho = misturar(700, 740, movimento) + 150 * progresso(quadro, abrir, 16, curvaEntradaSaida);
  const toqueSuave = 1 + 0.04 * Math.max(0, Math.sin(quadro / 6));
  return (
    <>
      {verde < 1 ? (
        <div style={{ position: 'absolute', left: 687 - 85, top: 700, width: 170, opacity: 1 - verde, transform: `scale(${1 - 0.3 * verde})` }}>
          <BotaoChamada cor="#34C759" rotulo="Aceitar" escala={quadro < atender ? toqueSuave : 1} aperto={pressao(quadro, atender)} />
        </div>
      ) : null}
      {fim < 1 ? (
        <div style={{ position: 'absolute', left: centroVermelhoX - 85, top: topoVermelho, width: 170, opacity: 1 - fim }}>
          <div style={{ position: 'relative' }}>
            <BotaoChamada cor="#EB4D3D" rotulo="" girar aperto={pressao(quadro, desligar)} />
            <span style={{ position: 'absolute', left: 0, right: 0, top: 164, textAlign: 'center', fontFamily: fontes.texto, fontSize: 28, fontWeight: 500, color: '#fff', opacity: 1 - movimento }}>Recusar</span>
            <span style={{ position: 'absolute', left: 0, right: 0, top: 164, textAlign: 'center', fontFamily: fontes.texto, fontSize: 28, fontWeight: 500, color: '#fff', opacity: movimento }}>Encerrar</span>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Fala({ inicio, fim, children }: { inicio: number; fim: number; children: ReactNode }) {
  const quadro = useQuadro();
  if (quadro < inicio - 1) return null;
  const t = progresso(quadro, inicio, 12, curvaSaida);
  const s = progresso(quadro, fim, 10, curvaEntradaSaida);
  if (s >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 50,
        right: 50,
        top: 400,
        opacity: t * (1 - s),
        transform: `translateY(${misturar(30, 0, t)}px)`,
        padding: '30px 36px',
        borderRadius: 36,
        background: 'rgba(255,255,255,0.1)',
        fontFamily: fontes.texto,
        color: '#fff',
      }}
    >
      {children}
    </div>
  );
}

function ItemDado({ inicio, texto }: { inicio: number; texto: string }) {
  const quadro = useQuadro();
  const t = progresso(quadro, inicio, 10, curvaSaida);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: quadro >= inicio ? t : 0.25, padding: '8px 0' }}>
      <div style={{ width: 44, height: 44, borderRadius: '50%', background: quadro >= inicio ? '#FF5A5F' : 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icone nome="check" tamanho={28} cor="#fff" espessura={3} />
      </div>
      <span style={{ fontSize: 38, fontWeight: 600 }}>{texto}</span>
    </div>
  );
}

export function Golpe2Central() {
  const quadro = useQuadro();
  const d = deixasLocais('golpe2');
  const toqueAtender = d.aqui - 14;
  const atendida = quadro >= d.aqui;
  const encerrada = quadro >= d.desliga + 16;
  const segundos = atendida ? Math.floor((Math.min(quadro, d.desliga + 16) - d.aqui) / 30) : 0;
  const tempo = `${String(Math.floor(segundos / 60)).padStart(2, '0')}:${String(segundos % 60).padStart(2, '0')}`;
  const saidaCelular = d.desliga + 30;

  return (
    <>
      <TituloGolpe numero={2} titulo="FALSA CENTRAL" />
      <Iphone entrada={18} saida={saidaCelular} fundoTela="linear-gradient(180deg, #2E3542 0%, #161A21 55%, #0D0F13 100%)">
        <div style={{ position: 'absolute', top: 190, left: 0, right: 0, textAlign: 'center', fontFamily: fontes.texto, color: '#fff' }}>
          <div style={{ fontSize: 30, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{atendida ? '' : 'Celular'}</div>
          <div style={{ fontSize: 64, fontWeight: 500, letterSpacing: '-0.01em', color: encerrada ? 'rgba(255,255,255,0.5)' : '#fff' }}>Central de Segurança</div>
          <div style={{ fontSize: 34, fontWeight: 400, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
            {encerrada ? 'Chamada encerrada' : atendida ? tempo : '0800 ••• •••• · chamando…'}
          </div>
        </div>
        <TrocaDeTela inicio={-100} fim={d.aqui - 4} modo="fade">
          <div style={{ position: 'absolute', top: 400, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 210, height: 210, borderRadius: '50%', background: '#5A6372', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icone nome="escudo" tamanho={110} cor="#fff" espessura={1.6} />
            </div>
          </div>
        </TrocaDeTela>
        {atendida ? (
          <>
            <Fala inicio={d.compra - 4} fim={d.sabem - 14}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>O QUE ELES DIZEM</div>
              <div style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.3 }}>“Identificamos uma compra de R$ 4.870,00 no seu cartão.”</div>
            </Fala>
            <Fala inicio={d.sabem + 2} fim={d.pedem - 14}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>ELES JÁ SABEM</div>
              <ItemDado inicio={d.nome} texto="Seu nome completo" />
              <ItemDado inicio={d.cpf} texto="Seu CPF" />
              <ItemDado inicio={d.calma} texto="E falam com toda a calma" />
            </Fala>
            <Fala inicio={d.pedem + 2} fim={d.desliga}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.55)', marginBottom: 12 }}>O PEDIDO</div>
              <div style={{ fontSize: 42, fontWeight: 600, lineHeight: 1.3 }}>“Faz um Pix pra uma conta segura que a gente protege o seu dinheiro.”</div>
            </Fala>
          </>
        ) : null}
        <Botoes quadro={quadro} atender={toqueAtender} desligar={d.desliga} encerrada={d.desliga + 16} abrir={d.existe - 16} />
      </Iphone>
      <Toque quadro={quadro} momento={toqueAtender} x={801} y={1479} />
      <Toque quadro={quadro} momento={d.desliga} x={540} y={1669} />
      <Carimbo texto="Não existe!" inicio={d.existe} fim={d.desliga - 22} estilo={{ top: 1400 }} />
      <DicaCentral
        inicio={saidaCelular + ESPERA_DICA}
        titulo={<><Realce>Desligue</Realce> e ligue você pro banco</>}
        texto="Use o número que está atrás do seu cartão. Banco nenhum pede Pix pra cancelar compra."
      />
    </>
  );
}
