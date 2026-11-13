import { Composition, getInputProps } from 'remotion';
import { ALTURA, LARGURA, QUADROS_POR_SEGUNDO } from './deixas';
import { linha } from './linhaDoTempo';
import { Video } from './Video';
import { FotoPerfil, PainelFotos } from './FotoPerfil';
import { Capa, CapaTresQuartos } from './Capa';

const fpsPedido = Number(getInputProps().fps ?? QUADROS_POR_SEGUNDO);
const FPS = fpsPedido === 60 ? 60 : QUADROS_POR_SEGUNDO;

export function Raiz() {
  return (
    <>
    <Composition
      id="GolpesPix"
      component={Video}
      durationInFrames={Math.round((linha.total * FPS) / QUADROS_POR_SEGUNDO)}
      fps={FPS}
      width={LARGURA}
      height={ALTURA}
    />
    <Composition id="Capa" component={Capa} durationInFrames={1} fps={30} width={1080} height={1920} />
    <Composition id="CapaTresQuartos" component={CapaTresQuartos} durationInFrames={1} fps={30} width={1080} height={1440} />
    <Composition id="FotoPerfil" component={FotoPerfil} durationInFrames={1} fps={30} width={1080} height={1080} defaultProps={{ conceito: 'pergunta' as const }} />
    <Composition id="PainelFotos" component={PainelFotos} durationInFrames={1} fps={30} width={1620} height={1180} defaultProps={{ ids: ['pergunta', 'duplo', 'mascote', 'reticencias', 'play', 'contorno', 'gradiente', 'gigante'] as ('pergunta' | 'duplo' | 'mascote' | 'reticencias' | 'play' | 'contorno' | 'gradiente' | 'gigante')[] }} />
    </>
  );
}
