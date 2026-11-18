import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, progresso } from '../animacao';
import { Carimbo, DicaCentral, ESPERA_DICA, Realce, TituloGolpe } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import { Iphone } from '../componentes/Iphone';
import { Banner } from '../componentes/Telas';
import { ConversaZap, ESPACO_CARIMBO, TOPO_CARIMBO_ZAP } from '../componentes/Zap';
import type { MensagemZap } from '../componentes/Zap';
import { deixasLocais } from '../linhaDoTempo';
import { cores, fontes } from '../tema';

const ANA = { nome: 'Ana · Recrutadora', cor: '#E5A64B' };

function Miniaturas({ quadro, inicio }: { quadro: number; inicio: number }) {
  const fundos = ['linear-gradient(160deg,#F28AA0,#8E3B8A)', 'linear-gradient(160deg,#6FB1F2,#2D4E9B)', 'linear-gradient(160deg,#F5C76B,#D9673A)'];
  return (
    <div style={{ display: 'flex', gap: 12, margin: '12px 0 4px' }}>
      {fundos.map((fundo, indice) => {
        const curtido = quadro >= inicio + 14 + indice * 8;
        return (
          <div key={fundo} style={{ width: 150, height: 196, borderRadius: 14, background: fundo, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14 }}>
            <Icone nome="coracao" tamanho={44} cor={curtido ? '#FF3B5C' : '#fff'} preenchido={curtido} espessura={2.2} />
          </div>
        );
      })}
    </div>
  );
}

function AvatarGrupo() {
  return (
    <div style={{ width: '100%', height: '100%', background: 'linear-gradient(150deg,#2FBF71,#1C7C4A)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: fontes.titulo, fontWeight: 900, fontSize: 30 }}>R$</div>
  );
}

export function Golpe4Tarefas() {
  const quadro = useQuadro();
  const d = deixasLocais('golpe4');
  const saidaCelular = d.se + 24;
  const espacoIsca = progresso(quadro, d.confianca + 2, 12, curvaSaida) * (1 - progresso(quadro, d.especial - 14, 12, curvaEntradaSaida));
  const espacoSumiu = progresso(quadro, d.some + 4, 12, curvaSaida);
  const removido = quadro >= d.some;

  const mensagens: MensagemZap[] = [
    { lado: 'data', inicio: 0, texto: 'HOJE' },
    { lado: 'recebida', inicio: d.chamam, autor: ANA, hora: '21:40', texto: 'Oi! Quer ganhar até R$ 300 por dia só curtindo vídeos? 🤑' },
    { lado: 'enviada', inicio: d.curtindo + 16, hora: '21:41', texto: 'Quero! Como funciona?' },
    {
      lado: 'recebida',
      inicio: d.pagam - 8,
      autor: ANA,
      hora: '21:41',
      texto: (
        <>
          Tarefa 1: curte esses 3 vídeos e manda o print 👍
          <Miniaturas quadro={quadro} inicio={d.pagam - 8} />
        </>
      ),
    },
    {
      lado: 'recebida',
      inicio: d.especial,
      autor: ANA,
      hora: '21:46',
      destaque: true,
      texto: (
        <>
          <b style={{ color: '#F5B301' }}>🔥 TAREFA ESPECIAL VIP 🔥</b>
          <br />
          Deposita <b>R$ 200</b> e libera <b>R$ 800</b> em tarefas! 💰
          <br />
          Só hoje. Restam 3 vagas ⏳
        </>
      ),
    },
    { lado: 'enviada', inicio: d.deposita, hora: '21:47', texto: 'Pronto! Fiz o Pix de R$ 200 ✅' },
    { lado: 'sistema', inicio: d.some, texto: 'Ana removeu você' },
  ];

  return (
    <>
      <TituloGolpe numero={4} titulo="TAREFAS PAGAS" />
      <Iphone entrada={18} saida={saidaCelular}>
        <ConversaZap
          cabecalho={{
            nome: 'Renda Extra VIP 💸',
            status: removido ? 'Você não é mais participante' : 'Ana, Bruno, Carla e mais 245',
            avatar: <AvatarGrupo />,
          }}
          mensagens={mensagens}
          espacoFinal={ESPACO_CARIMBO * Math.max(espacoIsca, espacoSumiu)}
        />
        <Banner inicio={d.trocados - 4} fim={d.confianca - 8} titulo="Pix recebido" texto="Você recebeu R$ 15,00 de Renda Extra" icone="banco" corIcone="#2FBF71" />
        <Banner inicio={d.confianca + 6} fim={d.especial - 12} titulo="Pix recebido" texto="Você recebeu R$ 20,00 de Renda Extra" icone="banco" corIcone="#2FBF71" />
      </Iphone>
      <Carimbo texto="Isca!" cor={cores.alerta} inicio={d.confianca + 6} fim={d.especial - 16} rotacao={6} estilo={{ top: TOPO_CARIMBO_ZAP }} />
      <Carimbo texto="Sumiu!" inicio={d.some + 8} fim={saidaCelular - 4} estilo={{ top: TOPO_CARIMBO_ZAP }} />
      <DicaCentral
        inicio={saidaCelular + ESPERA_DICA}
        titulo={<>Pediu depósito pra liberar ganho? <Realce cor={cores.perigo}>É golpe.</Realce></>}
        texto="Trabalho de verdade não cobra pra você começar a ganhar."
      />
    </>
  );
}
