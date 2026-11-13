import type { ComponentType } from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { QUADROS_POR_SEGUNDO } from './deixas';
import { useQuadro } from './tempo';
import { estiloTransicaoCena } from './animacao';
import { Abertura } from './cenas/Abertura';
import { Chamada } from './cenas/Chamada';
import { Golpe1Parente } from './cenas/Golpe1Parente';
import { Golpe2Central } from './cenas/Golpe2Central';
import { Golpe3Engano } from './cenas/Golpe3Engano';
import { Golpe4Tarefas } from './cenas/Golpe4Tarefas';
import { Golpe5Loja } from './cenas/Golpe5Loja';
import { Protecao } from './cenas/Protecao';
import { Fundo } from './componentes/Fundo';
import { Hud } from './componentes/Hud';
import { Legenda } from './componentes/Legenda';
import type { IdCena } from './deixas';
import { linha } from './linhaDoTempo';
import { cores, fontes } from './tema';

const COMPONENTES: Record<IdCena, ComponentType> = {
  abertura: Abertura,
  golpe5: Golpe5Loja,
  golpe4: Golpe4Tarefas,
  golpe3: Golpe3Engano,
  golpe2: Golpe2Central,
  golpe1: Golpe1Parente,
  protecao: Protecao,
  chamada: Chamada,
};

function Cena({ id, duracao, ultima }: { id: IdCena; duracao: number; ultima: boolean }) {
  const quadro = useQuadro();
  const Componente = COMPONENTES[id];
  return (
    <AbsoluteFill style={estiloTransicaoCena(quadro, duracao, !ultima)}>
      <Componente />
    </AbsoluteFill>
  );
}

export function Video() {
  const { fps } = useVideoConfig();
  const fator = fps / QUADROS_POR_SEGUNDO;
  return (
    <AbsoluteFill style={{ backgroundColor: cores.fundo, fontFamily: fontes.texto }}>
      <Fundo />
      {linha.cenas.map((cena, indice) => {
        const ultima = indice === linha.cenas.length - 1;
        const duracao = cena.duracao;
        return (
          <Sequence key={cena.id} from={Math.round(cena.inicio * fator)} durationInFrames={Math.round(duracao * fator)} name={cena.id}>
            <Cena id={cena.id} duracao={duracao} ultima={ultima} />
          </Sequence>
        );
      })}
      <Hud />
      <Legenda />
      <Audio src={staticFile('audio/voz.wav')} />
      <Audio src={staticFile('audio/trilha.wav')} />
    </AbsoluteFill>
  );
}
