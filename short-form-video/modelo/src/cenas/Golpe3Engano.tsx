import { useQuadro } from '../tempo';
import { contar, curvaSaida, formatarReais, misturar, progresso } from '../animacao';
import { Carimbo, DicaCentral, ESPERA_DICA, Realce, TituloGolpe } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import type { NomeIcone } from '../componentes/Icone';
import { Iphone, TrocaDeTela } from '../componentes/Iphone';
import { CabecalhoRecibo, ContornoAnimado, Recibo } from '../componentes/Recibo';
import { Avatar, BANCO, Banner, BotaoApp, Cartao, TopoApp } from '../componentes/Telas';
import { ConversaZap } from '../componentes/Zap';
import { deixasLocais } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

interface ItemExtrato {
  inicio: number;
  realce?: number;
  titulo: string;
  detalhe: string;
  valor: number;
  icone: NomeIcone;
}

function Extrato({ quadro, itens }: { quadro: number; itens: ItemExtrato[] }) {
  const visiveis = itens.filter((item) => quadro >= item.inicio - 1).reverse();
  return (
    <Cartao estilo={{ marginTop: 26, padding: '6px 18px' }}>
      {visiveis.map((item, indice) => {
        const t = progresso(quadro, item.inicio, 10, curvaSaida);
        const positivo = item.valor > 0;
        return (
          <div key={`${item.titulo}-${item.inicio}`} style={{ display: 'grid', gridTemplateRows: `${t}fr`, opacity: t }}>
            <div style={{ minHeight: 0, overflow: 'hidden' }}>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20, padding: '20px 14px', borderTop: indice === 0 ? 'none' : `1px solid ${BANCO.linha}` }}>
                {item.realce ? <ContornoAnimado progresso={item.realce} largura={744} altura={94} estilo={{ left: 0, top: 6, width: '100%', height: 'calc(100% - 12px)' }} /> : null}
                <div style={{ width: 66, height: 66, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icone nome={item.icone} tamanho={34} cor={BANCO.suave} espessura={2.2} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 31, fontWeight: 600, color: BANCO.texto }}>{item.titulo}</span>
                  <span style={{ fontSize: 26, fontWeight: 400, color: BANCO.suave }}>{item.detalhe}</span>
                </div>
                <span style={{ fontSize: 33, fontWeight: 700, color: positivo ? BANCO.positivo : BANCO.texto, whiteSpace: 'nowrap' }}>
                  {positivo ? '+' : '−'} R$ {formatarReais(Math.abs(item.valor))}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </Cartao>
  );
}

function TelaBanco({ quadro, saldo, itens }: { quadro: number; saldo: number; itens: ItemExtrato[] }) {
  return (
    <>
      <div style={{ position: 'absolute', inset: 0, background: BANCO.fundo }} />
      <TopoApp titulo="Olá, Maria" voltar={false} />
      <div style={{ position: 'absolute', top: 236, left: 40, right: 40, fontFamily: fontes.texto }}>
        <span style={{ fontSize: 30, fontWeight: 500, color: BANCO.suave }}>Saldo em conta</span>
        <div style={{ fontSize: 88, fontWeight: 700, letterSpacing: '-0.03em', color: saldo < 1000 ? BANCO.negativo : BANCO.texto, fontVariantNumeric: 'tabular-nums' }}>
          R$ {formatarReais(saldo)}
        </div>
        <Extrato quadro={quadro} itens={itens} />
      </div>
    </>
  );
}

export function Golpe3Engano() {
  const quadro = useQuadro();
  const d = deixasLocais('golpe3');
  const telaChat = d.mensagem - 8;
  const fimBannerEnviado = d.devolve + 68;
  const voltaBanco = fimBannerEnviado + 6;
  const estorno = Math.max(d.estorno + 2, voltaBanco + 20);
  const telaTransacao = d.recebeu - 4;
  const saidaCelular = d.botao + 22;

  const saldoInicio = contar(quadro, d.quinhentos + 4, 16, 1000, 1500);
  const saldoFinal = contar(quadro, d.sai, 18, 1000, 500);
  const saldo = quadro < voltaBanco ? saldoInicio : saldoFinal;

  const itens: ItemExtrato[] = [
    { inicio: -100, titulo: 'Mercado Bom Preço', detalhe: 'Compra no débito', valor: -86.4, icone: 'carrinho' },
    { inicio: d.quinhentos + 4, titulo: 'Pix recebido', detalhe: 'M. Oliveira', valor: 500, icone: 'banco' },
  ];
  const itensDepois: ItemExtrato[] = [
    ...itens.map((item) => ({ ...item, inicio: -100 })),
    { inicio: -100, titulo: 'Pix enviado', detalhe: 'reembolso.mo@email.com', valor: -500, icone: 'enviar', realce: progresso(quadro, voltaBanco + 12, 30, curvaSaida) * (1 - progresso(quadro, telaTransacao - 14, 10)) },
    { inicio: estorno, titulo: 'Devolução de Pix', detalhe: 'Estorno pedido por M. Oliveira', valor: -500, icone: 'devolver', realce: progresso(quadro, estorno + 10, 30, curvaSaida) * (1 - progresso(quadro, telaTransacao - 14, 10)) },
  ];
  const realceBotao = progresso(quadro, d.botao - 4, 10, curvaSaida);

  return (
    <>
      <TituloGolpe numero={3} titulo="PIX POR ENGANO" />
      <Iphone entrada={18} saida={saidaCelular}>
        <TrocaDeTela inicio={-100} fim={telaChat}>
          <TelaBanco quadro={quadro} saldo={saldo} itens={itens} />
        </TrocaDeTela>
        <TrocaDeTela inicio={telaChat} fim={voltaBanco}>
          <ConversaZap
            cabecalho={{ nome: '+55 11 97•••-0192', status: 'online', avatar: <Avatar iniciais="?" cor="#5B6470" /> }}
            mensagens={[
              { lado: 'data', inicio: 0, texto: 'HOJE' },
              { lado: 'recebida', inicio: d.mensagem, hora: '21:52', texto: 'Oi, boa noite! Te mandei 500 reais por engano 😥' },
              { lado: 'recebida', inicio: d.chave - 14, hora: '21:52', texto: 'Consegue devolver nessa outra chave? 🙏' },
              { lado: 'recebida', inicio: d.chave + 24, hora: '21:52', texto: 'reembolso.mo@email.com' },
              { lado: 'enviada', inicio: d.devolve, hora: '21:53', texto: 'Claro! Já devolvi 👍' },
            ]}
          />
        </TrocaDeTela>
        <TrocaDeTela inicio={voltaBanco} fim={telaTransacao}>
          <TelaBanco quadro={quadro} saldo={saldo} itens={itensDepois} />
        </TrocaDeTela>
        <TrocaDeTela inicio={telaTransacao}>
          <div style={{ position: 'absolute', inset: 0, background: BANCO.fundo }} />
          <div style={{ position: 'absolute', top: 140, left: 36, right: 36, fontFamily: fontes.texto }}>
            <CabecalhoRecibo titulo="Detalhes do Pix" />
            <Recibo
              titulo="Pix recebido"
              valor="+ R$ 500,00"
              corValor={BANCO.positivo}
              icone="banco"
              corIcone={BANCO.positivo}
              data="Hoje, às 21:51"
              secoes={[
                {
                  rotulo: 'QUEM ENVIOU',
                  linhas: [
                    { rotulo: 'Nome', valor: 'M. Oliveira' },
                    { rotulo: 'Instituição', valor: 'Banco Azul S.A.' },
                  ],
                },
              ]}
            />
            <div style={{ position: 'relative', marginTop: 26 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -12,
                  borderRadius: 68,
                  border: `5px solid ${cores.seguro}`,
                  opacity: realceBotao,
                  transform: `scale(${misturar(1.08, 1, realceBotao)})`,
                }}
              />
              <BotaoApp texto="Devolver este Pix" icone="devolver" />
            </div>
          </div>
        </TrocaDeTela>
        <Banner inicio={d.quinhentos} fim={d.mensagem - 16} titulo="Pix recebido" texto="M. Oliveira te enviou R$ 500,00" icone="banco" corIcone="#2FBF71" />
        <Banner inicio={d.devolve + 8} fim={fimBannerEnviado} titulo="Pix enviado" texto="R$ 500,00 para reembolso.mo@email.com" icone="enviar" corIcone="#FF5A5F" destaque />
        <Banner inicio={estorno} fim={Math.max(d.sai + 20, estorno + 70)} titulo="Devolução de Pix" texto="R$ 500,00 saíram da sua conta (estorno)" icone="devolver" corIcone="#FF5A5F" destaque />
      </Iphone>
      <Carimbo texto="Pagou 2x!" inicio={d.duas} fim={telaTransacao - 6} tamanho={52} estilo={{ top: 990, left: 590, right: 90 }} />
      <DicaCentral
        inicio={saidaCelular + ESPERA_DICA}
        titulo={<>Devolva só pelo <Realce>botão da transação</Realce></>}
        texto="Nunca faça Pix pra outra chave, mesmo que a pessoa insista."
      />
    </>
  );
}
