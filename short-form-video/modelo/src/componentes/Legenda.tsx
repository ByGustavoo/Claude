import { useQuadro } from '../tempo';
import { curvaSaida, misturar, progresso } from '../animacao';
import { BLOCOS } from './blocosLegenda';
import { cores, fontes } from '../tema';

export function Legenda() {
  const quadro = useQuadro();
  const bloco = BLOCOS.find((item) => quadro >= item.inicio && quadro < item.fim);
  if (!bloco) return null;
  const entrada = progresso(quadro, bloco.inicio, 6, curvaSaida);
  const indiceAtivo = bloco.palavras.reduce((melhor, palavra, indice) => (quadro >= palavra.inicio - 1 ? indice : melhor), -1);
  const saida = bloco.encadeado ? 0 : progresso(quadro, bloco.fim - 4, 4);

  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        width: 880,
        top: 288,
        height: 244,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          maxWidth: 860,
          justifyContent: 'center',
          columnGap: 36,
          rowGap: 0,
          fontFamily: fontes.titulo,
          fontWeight: 900,
          fontSize: 88,
          lineHeight: 1.08,
          letterSpacing: '-0.01em',
          textTransform: 'uppercase',
          textAlign: 'center',
          transform: `scale(${misturar(0.92, 1, entrada)}) translateY(${misturar(14, 0, entrada)}px)`,
          opacity: (1 - saida) * entrada,
        }}
      >
        {bloco.palavras.map((palavra, indice) => {
          const ativa = quadro >= palavra.inicio - 1;
          const falando = indice === indiceAtivo;
          const pulo = progresso(quadro, palavra.inicio - 1, 5, curvaSaida) * (1 - progresso(quadro, palavra.inicio + 4, 6, curvaSaida));
          const cor = falando ? cores.destaque : cores.texto;
          return (
            <span
              key={`${palavra.inicio}-${indice}`}
              style={{
                display: 'inline-block',
                color: cor,
                opacity: ativa ? 1 : 0.38,
                transform: `translateY(${-8 * pulo}px)`,
                WebkitTextStroke: '9px #000',
                paintOrder: 'stroke fill',
                textShadow: '0 6px 18px rgba(0,0,0,0.45)',
              }}
            >
              {palavra.texto}
            </span>
          );
        })}
      </div>
    </div>
  );
}
