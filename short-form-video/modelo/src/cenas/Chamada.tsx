import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { Aparecer } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import type { NomeIcone } from '../componentes/Icone';
import { pressao, Toque } from '../componentes/Telas';
import { deixasLocais } from '../linhaDoTempo';
import { cores, fontes, MARCA } from '../tema';
import { LogoMarca } from '../componentes/LogoMarca';

function piscada(quadro: number, momento: number): number {
  const t = quadro - momento;
  if (t < 0 || t > 6) return 1;
  return Math.abs(t - 3) / 3;
}

const CONTATOS = [
  { nome: 'Mãe', iniciais: 'M', cor: '#D9677E' },
  { nome: 'Pai', iniciais: 'P', cor: '#4E7FD6' },
  { nome: 'Vó Lúcia', iniciais: 'VL', cor: '#B98A3E' },
  { nome: 'Tio Beto', iniciais: 'TB', cor: '#3E9C7B' },
];

const GOLPES: { numero: number; nome: string; resumo: string; icone: NomeIcone }[] = [
  { numero: 5, nome: 'Loja falsa', resumo: 'Promoção boa demais, só no Pix', icone: 'carrinho' },
  { numero: 4, nome: 'Tarefas pagas', resumo: 'Paga pra liberar ganhos', icone: 'coracao' },
  { numero: 3, nome: 'Pix por engano', resumo: 'Devolve pra outra chave', icone: 'devolver' },
  { numero: 2, nome: 'Falsa central', resumo: 'Pix pra “conta segura”', icone: 'telefone' },
  { numero: 1, nome: 'Falso parente', resumo: '“Troquei de número”', icone: 'usuario' },
];

function Compartilhar({ quadro, inicio, fim, selecao, envio }: { quadro: number; inicio: number; fim: number; selecao: number; envio: number }) {
  const t = progresso(quadro, inicio, 20, curvaSaida);
  const s = progresso(quadro, fim, 14, curvaEntradaSaida);
  if (quadro < inicio - 1 || s >= 1) return null;
  const marcado = progresso(quadro, selecao, 10, curvaSaida);
  const enviado = quadro >= envio + 10;
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, top: 860, opacity: t * (1 - s), transform: `translateY(${misturar(80, 0, t) + s * 40}px)` }}>
      <div style={{ borderRadius: 44, background: '#1B1F26', padding: '34px 36px 38px', boxShadow: '0 40px 90px rgba(0,0,0,0.5)', fontFamily: fontes.texto }}>
        <div style={{ width: 80, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.18)', margin: '0 auto 26px' }} />
        <div style={{ fontSize: 34, fontWeight: 700, color: '#F2F3F5', textAlign: 'center', marginBottom: 30 }}>Enviar para</div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {CONTATOS.map((contato, indice) => {
            const ativo = indice === 0;
            return (
              <div key={contato.nome} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: 170 }}>
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 120,
                      height: 120,
                      borderRadius: '50%',
                      background: contato.cor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 42,
                      color: '#fff',
                      boxShadow: ativo ? `0 0 0 ${6 * marcado}px #1B1F26, 0 0 0 ${10 * marcado}px ${cores.seguro}` : undefined,
                    }}
                  >
                    {contato.iniciais}
                  </div>
                  {ativo ? (
                    <div
                      style={{
                        position: 'absolute',
                        right: -4,
                        bottom: -4,
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: cores.seguro,
                        border: '4px solid #1B1F26',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: `scale(${marcado})`,
                      }}
                    >
                      <Icone nome="check" tamanho={26} cor="#06120E" espessura={3.4} />
                    </div>
                  ) : null}
                </div>
                <span style={{ fontSize: 28, fontWeight: 500, color: '#C3CAD6' }}>{contato.nome}</span>
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 38,
            height: 104,
            borderRadius: 52,
            background: enviado ? '#2A3038' : cores.seguro,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            fontWeight: 700,
            fontSize: 36,
            color: enviado ? cores.seguro : '#06120E',
            opacity: misturar(0.45, 1, marcado),
            transform: `scale(${1 - 0.045 * pressao(quadro, envio)})`,
          }}
        >
          <Icone nome={enviado ? 'check' : 'enviar'} tamanho={38} cor={enviado ? cores.seguro : '#06120E'} espessura={2.6} />
          {enviado ? 'Enviado pra Mãe' : 'Enviar'}
        </div>
      </div>
    </div>
  );
}

function ListaGolpes({ quadro, inicio }: { quadro: number; inicio: number }) {
  return (
    <div style={{ position: 'absolute', left: 80, right: 80, top: 780, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {GOLPES.map((golpe, indice) => {
        const t = progresso(quadro, inicio + indice * 5, 16, curvaSaida);
        return (
          <div
            key={golpe.numero}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 22,
              padding: '18px 24px',
              borderRadius: 28,
              background: '#171B21',
              border: '1.5px solid rgba(255,255,255,0.06)',
              opacity: t,
              transform: `translateX(${misturar(-50, 0, t)}px)`,
            }}
          >
            <div style={{ width: 72, height: 72, borderRadius: 20, background: cores.perigo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: fontes.titulo, fontWeight: 900, fontSize: 36, color: '#fff', flexShrink: 0 }}>
              #{golpe.numero}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
              <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 38, color: cores.texto }}>{golpe.nome}</span>
              <span style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 27, color: cores.suave }}>{golpe.resumo}</span>
            </div>
            <Icone nome={golpe.icone} tamanho={44} cor={cores.suave} espessura={2} />
          </div>
        );
      })}
    </div>
  );
}

function CaixaComentario({ quadro, inicio }: { quadro: number; inicio: number }) {
  const texto = 'Comigo foi o #';
  const letras = Math.max(0, Math.min(texto.length, Math.floor((quadro - inicio - 10) / 2.5)));
  const cursor = Math.floor(quadro / 15) % 2 === 0;
  return (
    <Aparecer inicio={inicio}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 16px 0 30px', height: 100, borderRadius: 50, background: '#1F242C', border: `2px solid ${cores.destaque}`, fontFamily: fontes.texto }}>
        <Icone nome="comentario" tamanho={40} cor={cores.destaque} espessura={2.2} />
        <span style={{ flex: 1, fontSize: 34, fontWeight: 500, color: letras > 0 ? cores.texto : cores.suave }}>
          {letras > 0 ? texto.slice(0, letras) : 'Adicionar comentário…'}
          <span style={{ opacity: cursor ? 1 : 0, color: cores.destaque }}>|</span>
        </span>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: cores.destaque, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icone nome="enviar" tamanho={34} cor="#111" espessura={2.4} />
        </div>
      </div>
    </Aparecer>
  );
}

export function Chamada() {
  const quadro = useQuadro();
  const d = deixasLocais('chamada');
  const trocaParte = d.comenta - 8;
  const selecao = d.manda + 16;
  const envio = Math.min(d.cair + 4, trocaParte - 30);
  const tituloSaida = progresso(quadro, trocaParte, 12, curvaEntradaSaida);

  return (
    <>
      {tituloSaida < 1 ? (
        <div style={{ position: 'absolute', top: 560, left: 80, right: 80, opacity: 1 - tituloSaida }}>
          <Aparecer inicio={d.agora - 6}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
              <div style={{ width: 104, height: 104, borderRadius: 28, background: cores.seguro, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icone nome="compartilhar" tamanho={60} cor="#06120E" preenchido espessura={1.2} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 58, lineHeight: 1.08, letterSpacing: '-0.025em', color: cores.texto }}>Conhece alguém que cairia nisso?</span>
                <span style={{ fontFamily: fontes.texto, fontWeight: 500, fontSize: 34, color: cores.suave }}>Manda esse vídeo pra essa pessoa agora.</span>
              </div>
            </div>
          </Aparecer>
        </div>
      ) : null}
      <Compartilhar quadro={quadro} inicio={d.manda - 4} fim={trocaParte} selecao={selecao} envio={envio} />
      <Toque quadro={quadro} momento={selecao - 2} x={201} y={1062} />
      <Toque quadro={quadro} momento={envio} x={540} y={1262} />
      {quadro >= trocaParte + 8 ? (
        <>
          <div style={{ position: 'absolute', top: 560, left: 80, right: 80 }}>
            <Aparecer inicio={trocaParte + 8}>
              <div style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 62, lineHeight: 1.04, letterSpacing: '-0.03em', color: cores.texto }}>
                QUAL DESSES JÁ <span style={{ color: cores.destaque }}>TENTARAM COM VOCÊ?</span>
              </div>
            </Aparecer>
          </div>
          <ListaGolpes quadro={quadro} inicio={d.qual - 4} />
          <div style={{ position: 'absolute', left: 80, right: 80, top: 1460 }}>
            <CaixaComentario quadro={quadro} inicio={d.qual + 24} />
          </div>
          <div style={{ position: 'absolute', left: 0, right: 0, top: 1590, display: 'flex', justifyContent: 'center' }}>
            <Aparecer inicio={d.qual + 70}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 26px', borderRadius: 999, background: 'rgba(255,255,255,0.08)' }}>
                <LogoMarca tamanho={52} variante="mascote" olhos={piscada(quadro, d.qual + 96)} />
                <span style={{ fontFamily: fontes.titulo, fontWeight: 800, fontSize: 28, color: cores.texto }}>Siga <span style={{ color: cores.destaque }}>{MARCA.arroba}</span> pra não cair no próximo</span>
              </div>
            </Aparecer>
          </div>
        </>
      ) : null}
    </>
  );
}
