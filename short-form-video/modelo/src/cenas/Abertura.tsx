import { useQuadro } from '../tempo';
import { contar, curvaSaida, formatarReais, misturar, progresso } from '../animacao';
import { Aparecer } from '../componentes/Elementos';
import { Golpista } from '../componentes/Golpista';
import { Icone } from '../componentes/Icone';
import { Iphone, TrocaDeTela } from '../componentes/Iphone';
import { CabecalhoRecibo, Recibo } from '../componentes/Recibo';
import { BANCO, BotaoApp, pressao, Toque } from '../componentes/Telas';
import { deixasLocais } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const SALDO = 2347.9;
const VALOR = 2000;

export function Abertura() {
  const quadro = useQuadro();
  const d = deixasLocais('abertura');
  const comprovante = d.clique + 20;
  const saldo = contar(quadro, d.dinheiro, 22, Math.round(SALDO * 100), Math.round((SALDO - VALOR) * 100)) / 100;
  const golpista = progresso(quadro, d.ele, 16, curvaSaida);
  const saidaGolpista = progresso(quadro, d.esses - 14, 10);
  const realceAutorizacao = progresso(quadro, comprovante + 30, 26, curvaSaida);
  const cartoes = [5, 4, 3, 2, 1];

  return (
    <>
      <Iphone entrada={2} saida={d.esses - 10} fundoTela={BANCO.fundo}>
        <TrocaDeTela inicio={-20} fim={comprovante}>
          <div style={{ position: 'absolute', inset: 0, background: BANCO.fundo }} />
          <div style={{ position: 'absolute', top: 140, left: 36, right: 36, fontFamily: fontes.texto }}>
            <CabecalhoRecibo titulo="Revise o Pix" />
            <Recibo
              titulo="Você vai transferir"
              valor={`R$ ${formatarReais(VALOR)}`}
              icone="enviar"
              corIcone={BANCO.destaque}
              secoes={[
                {
                  rotulo: 'PARA',
                  linhas: [
                    { rotulo: 'Nome', valor: 'J. P. Lima' },
                    { rotulo: 'CPF', valor: '•••.731.205-••' },
                    { rotulo: 'Instituição', valor: 'Banco Digital S.A.' },
                  ],
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '22px 8px 0', fontSize: 28 }}>
              <span style={{ color: BANCO.suave, fontWeight: 500 }}>Saldo disponível</span>
              <span style={{ color: BANCO.texto, fontWeight: 600 }}>R$ {formatarReais(SALDO)}</span>
            </div>
            <BotaoApp texto="Confirmar Pix" pressionado={pressao(quadro, d.clique)} estilo={{ marginTop: 26 }} />
          </div>
        </TrocaDeTela>
        <TrocaDeTela inicio={comprovante}>
          <div style={{ position: 'absolute', inset: 0, background: BANCO.fundo }} />
          <div style={{ position: 'absolute', top: 140, left: 36, right: 36, fontFamily: fontes.texto }}>
            <CabecalhoRecibo titulo="Comprovante" />
            <Recibo
              titulo="Pix enviado"
              valor={`R$ ${formatarReais(VALOR)}`}
              icone="check"
              corIcone={BANCO.positivo}
              data="Hoje, às 21:47"
              secoes={[
                {
                  rotulo: 'PARA',
                  linhas: [
                    { rotulo: 'Nome', valor: 'J. P. Lima' },
                    { rotulo: 'CPF', valor: '•••.731.205-••' },
                    { rotulo: 'Instituição', valor: 'Banco Digital S.A.' },
                  ],
                },
                {
                  rotulo: 'DETALHES',
                  linhas: [
                    { rotulo: 'Autorizado por', valor: 'Você (biometria)', realce: realceAutorizacao * (1 - progresso(quadro, d.esses - 18, 8)) },
                    { rotulo: 'ID', valor: 'E18236120261112…9QpL2', mono: true },
                  ],
                },
              ]}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, padding: '18px 26px', borderRadius: 24, background: quadro >= d.dinheiro ? 'rgba(255,90,95,0.12)' : '#171A20' }}>
              <span style={{ fontSize: 28, color: BANCO.suave, fontWeight: 500 }}>Saldo disponível</span>
              <span style={{ fontSize: 34, fontWeight: 700, color: quadro >= d.dinheiro ? BANCO.negativo : BANCO.texto, fontVariantNumeric: 'tabular-nums' }}>R$ {formatarReais(saldo)}</span>
            </div>
          </div>
        </TrocaDeTela>
      </Iphone>
      <Toque quadro={quadro} momento={d.clique} x={540} y={1440} />
      {quadro >= d.ele && saidaGolpista < 1 ? (
        <div
          style={{
            position: 'absolute',
            right: -30,
            top: 1290,
            opacity: golpista * (1 - saidaGolpista),
            transform: `translateX(${misturar(200, 0, golpista)}px) rotate(-8deg)`,
          }}
        >
          <Golpista tamanho={280} expressao={quadro > d.dinheiro ? 'risada' : 'sorriso'} />
        </div>
      ) : null}
      {quadro >= Math.max(d.cinco - 6, d.esses + 12) ? (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Aparecer inicio={Math.max(d.cinco - 6, d.esses + 12)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 290, lineHeight: 0.9, color: cores.perigo, letterSpacing: '-0.06em' }}>5</span>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 106, lineHeight: 0.95, color: cores.texto, letterSpacing: '-0.03em' }}>GOLPES</span>
                <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 106, lineHeight: 0.95, color: cores.texto, letterSpacing: '-0.03em' }}>
                  DO <span style={{ color: cores.seguro }}>PIX</span>
                </span>
              </div>
            </div>
          </Aparecer>
          <Aparecer inicio={d.brasileiro - 6} estilo={{ marginTop: 20 }}>
            <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 30, letterSpacing: '0.16em', color: cores.suave }}>QUE MAIS PEGAM BRASILEIRO</span>
          </Aparecer>
          <div style={{ display: 'flex', gap: 22, marginTop: 70 }}>
            {cartoes.map((numero, indice) => {
              const t = progresso(quadro, d.brasileiro + indice * 4, 14, curvaSaida);
              const misterio = numero === 1;
              const realce = misterio ? progresso(quadro, d.numero - 4, 12, curvaSaida) : 0;
              return (
                <div
                  key={numero}
                  style={{
                    width: 150,
                    height: 196,
                    borderRadius: 26,
                    background: misterio ? cores.perigo : '#1A1D23',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    opacity: t,
                    transform: `translateY(${misturar(60, 0, t) - realce * 24}px) scale(${1 + realce * 0.1})`,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
                  }}
                >
                  <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 66, color: '#fff' }}>#{numero}</span>
                  {misterio ? <Icone nome="cadeado" tamanho={40} cor="#fff" espessura={2.6} /> : <span style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 30, color: cores.apagado }}>???</span>}
                </div>
              );
            })}
          </div>
          <Aparecer inicio={d.fica} estilo={{ marginTop: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 30px', borderRadius: 999, background: 'rgba(255,197,61,0.12)', fontFamily: fontes.titulo, fontWeight: 800, fontSize: 34, color: cores.alerta }}>
              <Icone nome="alerta" tamanho={36} cor={cores.alerta} espessura={2.6} />O #1 ENGANA ATÉ GENTE ESPERTA
            </div>
          </Aparecer>
        </div>
      ) : null}
    </>
  );
}
