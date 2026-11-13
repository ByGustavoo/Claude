import { AbsoluteFill } from 'remotion';
import { Golpista } from './componentes/Golpista';
import { Icone } from './componentes/Icone';
import { LogoMarca } from './componentes/LogoMarca';
import { CabecalhoRecibo, Recibo } from './componentes/Recibo';
import { BANCO } from './componentes/Telas';
import { cores, fontes, MARCA } from './tema';

export function Capa() {
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, #2A0E14 0%, ${cores.fundoElevado} 42%, ${cores.fundo} 100%)`, fontFamily: fontes.texto }}>
      <div style={{ position: 'absolute', top: 250, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 28px 12px 18px', borderRadius: 999, background: 'rgba(255,255,255,0.07)' }}>
          <LogoMarca tamanho={52} variante="mascote" />
          <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 30, color: cores.texto }}>{MARCA.nome}</span>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 335, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 360, lineHeight: 0.86, color: cores.perigo, letterSpacing: '-0.06em', textShadow: '0 20px 60px rgba(255,59,78,0.35)' }}>5</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 134, lineHeight: 0.95, color: cores.texto, letterSpacing: '-0.035em' }}>GOLPES</span>
            <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 134, lineHeight: 0.95, color: cores.texto, letterSpacing: '-0.035em' }}>
              DO <span style={{ color: cores.seguro }}>PIX</span>
            </span>
          </div>
        </div>
        <span style={{ marginTop: 26, fontFamily: fontes.mono, fontWeight: 700, fontSize: 36, letterSpacing: '0.16em', color: cores.suave }}>QUE MAIS PEGAM BRASILEIRO</span>
      </div>

      <div style={{ position: 'absolute', top: 750, right: 40, transform: 'rotate(8deg)' }}>
        <Golpista tamanho={330} expressao="risada" />
      </div>

      <div style={{ position: 'absolute', top: 815, left: 90, width: 760, transform: 'rotate(-4deg)', filter: 'drop-shadow(0 40px 60px rgba(0,0,0,0.6))' }}>
        <div style={{ borderRadius: 44, background: BANCO.fundo, padding: '34px 34px 36px', border: '1.5px solid rgba(255,255,255,0.06)' }}>
          <CabecalhoRecibo titulo="Comprovante" />
          <Recibo
            titulo="Pix enviado"
            valor="R$ 2.000,00"
            icone="check"
            corIcone={BANCO.positivo}
            data="Hoje, às 21:47"
            secoes={[
              {
                rotulo: 'DETALHES',
                linhas: [
                  { rotulo: 'Para', valor: 'J. P. Lima' },
                  { rotulo: 'Autorizado por', valor: 'Você (biometria)', realce: 1 },
                ],
              },
            ]}
          />
        </div>
      </div>

      <div style={{ position: 'absolute', top: 1415, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {[5, 4, 3, 2, 1].map((numero) => {
          const misterio = numero === 1;
          return (
            <div
              key={numero}
              style={{
                width: 136,
                height: 150,
                borderRadius: 26,
                background: misterio ? cores.perigo : '#1A1D23',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                transform: misterio ? 'translateY(-14px) scale(1.08)' : undefined,
                boxShadow: misterio ? '0 20px 50px rgba(255,59,78,0.45)' : '0 16px 36px rgba(0,0,0,0.4)',
              }}
            >
              <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 58, color: '#fff' }}>#{numero}</span>
              {misterio ? <Icone nome="cadeado" tamanho={36} cor="#fff" espessura={2.6} /> : <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 26, color: cores.apagado }}>???</span>}
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 1592, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 32px', borderRadius: 999, background: 'rgba(255,197,61,0.13)', fontFamily: fontes.titulo, fontWeight: 800, fontSize: 36, color: cores.alerta }}>
          <Icone nome="alerta" tamanho={38} cor={cores.alerta} espessura={2.6} />O #1 ENGANA ATÉ GENTE ESPERTA
        </div>
      </div>
    </AbsoluteFill>
  );
}

export function CapaTresQuartos() {
  return (
    <AbsoluteFill style={{ background: cores.fundo, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', left: 0, top: -240, width: 1080, height: 1920, transform: 'scale(0.92)', transformOrigin: '540px 960px' }}>
        <Capa />
      </div>
    </AbsoluteFill>
  );
}
