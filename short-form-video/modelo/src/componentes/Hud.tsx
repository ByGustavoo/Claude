import { AbsoluteFill, interpolate, interpolateColors } from 'remotion';
import { useQuadro } from '../tempo';
import { curvaEntradaSaida, curvaSaida, progresso } from '../animacao';
import type { IdCena } from '../deixas';
import { linha } from '../linhaDoTempo';
import { cores, fontes } from '../tema';
import { Icone } from './Icone';

const SEGMENTOS: { id: IdCena; numero: number; nome: string }[] = [
  { id: 'golpe5', numero: 5, nome: 'LOJA FALSA' },
  { id: 'golpe4', numero: 4, nome: 'TAREFAS' },
  { id: 'golpe3', numero: 3, nome: 'PIX ENGANO' },
  { id: 'golpe2', numero: 2, nome: 'CENTRAL' },
  { id: 'golpe1', numero: 1, nome: 'PARENTE' },
];

const TRANSICAO = 16;

export function Hud() {
  const quadro = useQuadro();
  const entrada = progresso(quadro, 6, 18, curvaSaida);
  const saida = progresso(quadro, linha.cena('chamada').inicio - 6, 14, curvaEntradaSaida);
  if (saida >= 1) return null;

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', opacity: entrada * (1 - saida) }}>
      <div style={{ position: 'absolute', top: 192, left: 70, right: 70, height: 62, display: 'flex', gap: 10 }}>
        {SEGMENTOS.map((segmento, indice) => {
          const trecho = linha.cena(segmento.id);
          const peso = progresso(quadro, trecho.inicio, TRANSICAO, curvaEntradaSaida) * (1 - progresso(quadro, trecho.fim - TRANSICAO, TRANSICAO, curvaEntradaSaida));
          const concluido = progresso(quadro, trecho.fim - TRANSICAO / 2, TRANSICAO, curvaSaida);
          const andamento = interpolate(quadro, [trecho.inicio, trecho.fim], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
          const aparece = progresso(quadro, 6 + indice * 3, 16, curvaSaida);
          const fundo = interpolateColors(peso, [0, 1], [interpolateColors(concluido, [0, 1], ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.13)']), cores.perigo]);
          return (
            <div
              key={segmento.id}
              style={{
                position: 'relative',
                flex: `${1 + 3.4 * peso} 1 0`,
                minWidth: 0,
                borderRadius: 31,
                background: fundo,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                opacity: aparece,
                transform: `translateY(${(1 - aparece) * -14}px)`,
              }}
            >
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${andamento * 100}%`, background: 'rgba(255,255,255,0.16)', opacity: peso }} />
              {concluido > 0.05 && peso < 0.5 ? (
                <div style={{ opacity: concluido, display: 'flex' }}>
                  <Icone nome="check" tamanho={24} cor={cores.seguro} espessura={3.2} />
                </div>
              ) : null}
              <span
                style={{
                  position: 'relative',
                  fontFamily: fontes.titulo,
                  fontWeight: 900,
                  fontSize: 26,
                  color: peso > 0.5 || concluido > 0.5 ? '#fff' : 'rgba(255,255,255,0.4)',
                  whiteSpace: 'nowrap',
                }}
              >
                #{segmento.numero}
              </span>
              {peso > 0.05 ? (
                <span style={{ position: 'relative', fontFamily: fontes.titulo, fontWeight: 800, fontSize: 24, letterSpacing: '0.04em', color: '#fff', whiteSpace: 'nowrap', opacity: progresso(peso, 0.5, 0.5) }}>
                  {segmento.nome}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
}
