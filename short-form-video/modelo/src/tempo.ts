import { useCurrentFrame, useVideoConfig } from 'remotion';
import { QUADROS_POR_SEGUNDO } from './deixas';

export function useQuadro(): number {
  const quadro = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (quadro * QUADROS_POR_SEGUNDO) / fps;
}
