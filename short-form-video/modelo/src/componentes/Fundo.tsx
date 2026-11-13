import { AbsoluteFill } from 'remotion';

export function Fundo() {
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #15171C 0%, #0E1014 45%, #0A0B0E 100%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255,255,255,0.06), transparent 70%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 90% 70% at 50% 55%, transparent 55%, rgba(0,0,0,0.45) 100%)' }} />
    </AbsoluteFill>
  );
}
