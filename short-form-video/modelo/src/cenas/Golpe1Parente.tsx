import type { CSSProperties } from 'react';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, misturar, progresso } from '../animacao';
import { Carimbo, DicaCentral, ESPERA_DICA, Realce, TituloGolpe } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import type { NomeIcone } from '../componentes/Icone';
import { Iphone } from '../componentes/Iphone';
import { FotoFilho } from '../componentes/Telas';
import { ConversaZap, ESPACO_CARIMBO, TOPO_CARIMBO_ZAP } from '../componentes/Zap';
import { deixasLocais } from '../linhaDoTempo';
import { fontes } from '../tema';

const VERMELHO = '#FF4D5A';

function Selo({ numero, estilo }: { numero: number; estilo: CSSProperties }) {
  return (
    <div
      style={{
        position: 'absolute',
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: VERMELHO,
        border: '3px solid #1F2C34',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: fontes.texto,
        fontWeight: 800,
        fontSize: 24,
        color: '#fff',
        ...estilo,
      }}
    >
      {numero}
    </div>
  );
}

function ItemSinal({ inicio, numero, icone, titulo, detalhe }: { inicio: number; numero: number; icone: NomeIcone; titulo: string; detalhe: string }) {
  const quadro = useQuadro();
  const t = progresso(quadro, inicio, 14, curvaSaida);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 0', opacity: t, transform: `translateX(${misturar(-24, 0, t)}px)` }}>
      <div style={{ position: 'relative', width: 68, height: 68, borderRadius: 20, background: 'rgba(255,77,90,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icone nome={icone} tamanho={36} cor={VERMELHO} espessura={2.2} />
        <Selo numero={numero} estilo={{ right: -14, top: -14, width: 34, height: 34, fontSize: 19, border: '3px solid #161B21' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{ fontSize: 34, fontWeight: 700, color: '#F2F3F5' }}>{titulo}</span>
        <span style={{ fontSize: 26, fontWeight: 400, color: '#9AA0AA' }}>{detalhe}</span>
      </div>
    </div>
  );
}

function CartaoSinais({ inicioNumero, inicioFoto, fim }: { inicioNumero: number; inicioFoto: number; fim: number }) {
  const quadro = useQuadro();
  if (quadro < inicioNumero - 1) return null;
  const t = progresso(quadro, inicioNumero, 14, curvaSaida);
  const s = progresso(quadro, fim, 16, curvaEntradaSaida);
  if (s >= 1) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: 40,
        right: 40,
        top: 272,
        zIndex: 15,
        padding: '22px 30px 14px',
        borderRadius: 30,
        background: 'rgba(22,27,33,0.97)',
        border: '1.5px solid rgba(255,77,90,0.35)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        fontFamily: fontes.texto,
        opacity: t * (1 - s),
        transform: `translateY(${misturar(20, 0, t) - s * 90}px) scale(${1 - s * 0.04})`,
      }}
    >
      <div style={{ fontFamily: fontes.mono, fontWeight: 700, fontSize: 24, letterSpacing: '0.16em', color: VERMELHO, marginBottom: 4 }}>REPARE NOS SINAIS</div>
      <ItemSinal inicio={inicioNumero + 4} numero={1} icone="telefone" titulo="Número que você não conhece" detalhe="“Troquei de número”" />
      {quadro >= inicioFoto - 1 ? <ItemSinal inicio={inicioFoto} numero={2} icone="usuario" titulo="Foto copiada do seu filho" detalhe="Pega das redes sociais dele" /> : null}
    </div>
  );
}

export function Golpe1Parente() {
  const quadro = useQuadro();
  const d = deixasLocais('golpe1');
  const saidaCelular = d.antes - 12;
  const resposta = Math.min(d.oi + 48, d.problema - 14);
  const fimSinais = d.preciso - 10;
  const espacoPressa = progresso(quadro, d.pressa + 14, 12, curvaSaida);

  return (
    <>
      <TituloGolpe numero={1} titulo="FALSO PARENTE" />
      <Iphone entrada={18} saida={saidaCelular}>
        <ConversaZap
          cabecalho={{
            nome: '+55 11 98•••-3374',
            status: quadro >= d.oi - 24 && quadro < d.pressa + 30 ? 'digitando…' : 'online',
            avatar: <FotoFilho />,
            marcarNome: progresso(quadro, d.mensagem, 12, curvaSaida) * (1 - progresso(quadro, fimSinais, 12, curvaEntradaSaida)),
            marcarAvatar: progresso(quadro, d.foto, 12, curvaSaida) * (1 - progresso(quadro, fimSinais, 12, curvaEntradaSaida)),
          }}
          mensagens={[
            { lado: 'data', inicio: 0, texto: 'HOJE' },
            { lado: 'recebida', inicio: d.oi, hora: '21:44', texto: 'Oi mãe, troquei de número, salva esse 😊' },
            { lado: 'enviada', inicio: resposta, hora: '21:44', texto: 'Oi filho! Salvei ❤️' },
            { lado: 'recebida', inicio: d.problema, hora: '21:45', texto: 'Tô com um problema aqui 😟' },
            { lado: 'recebida', inicio: d.preciso, hora: '21:45', texto: 'Preciso pagar uma conta urgente, consegue fazer um Pix pra mim?' },
            { lado: 'recebida', inicio: d.amanha, hora: '21:46', texto: 'Amanhã te devolvo, prometo 🙏' },
            { lado: 'recebida', inicio: d.pressa + 12, hora: '21:46', texto: 'Mãe?? É urgente 😭' },
          ]}
          espacoFinal={ESPACO_CARIMBO * espacoPressa}
        />
        <CartaoSinais inicioNumero={d.mensagem} inicioFoto={d.foto} fim={fimSinais} />
      </Iphone>
      <Carimbo texto="Pressa = golpe!" inicio={d.pressa + 18} fim={saidaCelular - 8} tamanho={70} estilo={{ top: TOPO_CARIMBO_ZAP }} />
      <DicaCentral
        inicio={saidaCelular + ESPERA_DICA}
        titulo={<>Ligue pro <Realce>número antigo</Realce> antes de qualquer Pix</>}
        texto="Ou faça uma pergunta que só a pessoa de verdade saberia responder."
      />
    </>
  );
}
