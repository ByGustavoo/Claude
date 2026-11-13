import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { criarDeixas, criarLinhaDoTempo, QUADROS_POR_SEGUNDO } from '../src/deixas.ts';
import type { Narracao } from '../src/deixas.ts';
import {
  Faixa,
  TAXA,
  adsr,
  decibeis,
  finalizar,
  medirPico,
  medirRms,
  nota,
  passaAlta,
  passaBaixa,
  percussivo,
  reverberar,
  tocarBumbo,
  tocarCliqueBotao,
  tocarGrave,
  tocarPad,
  tocarPluck,
  tocarSeno,
  tocarTecla,
  tocarToque,
} from './sintese.ts';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const narracao = JSON.parse(readFileSync(join(raiz, 'src', 'narracao.json'), 'utf-8')) as Narracao;
const linha = criarLinhaDoTempo(narracao);
const deixas = criarDeixas(linha);
const s = (quadro: number) => quadro / QUADROS_POR_SEGUNDO;
const duracaoTotal = linha.total / QUADROS_POR_SEGUNDO;

let semente = 7;
function aleatorio(): number {
  semente = (semente * 16807) % 2147483647;
  return semente / 2147483647;
}

const musica = new Faixa(Math.ceil(duracaoTotal * TAXA) + TAXA);
const efeitos = new Faixa(musica.amostras);

const BATIDA = 60 / 100;
const COMPASSO = BATIDA * 4;
const ACORDES: string[][] = [
  ['A2', 'E3', 'A3', 'C4', 'E4'],
  ['F2', 'C3', 'F3', 'A3', 'C4'],
  ['D2', 'A2', 'D3', 'F3', 'A3'],
  ['E2', 'B2', 'E3', 'G#3', 'B3'],
];
const BAIXOS = ['A2', 'F2', 'D2', 'E2'];

const inicioGroove = s(linha.cena('golpe5').inicio);
const inicioRespiro = s(linha.cena('protecao').inicio);
const inicioRetorno = s(deixas.protecao.registra);
const fimMusica = duracaoTotal - 0.4;

function intensidade(t: number): number {
  if (t < inicioGroove) return 0;
  if (t < inicioRespiro) return 1;
  if (t < inicioRetorno) return 0.25;
  return 0.85;
}

for (let compasso = 0; compasso * COMPASSO < fimMusica; compasso += 1) {
  const inicio = compasso * COMPASSO;
  const acorde = ACORDES[compasso % ACORDES.length] ?? [];
  const antesDoGroove = inicio + COMPASSO <= inicioGroove;
  const ganhoPad = antesDoGroove ? 0.016 : 0.022;
  acorde.forEach((nome, indice) => {
    tocarPad({
      faixa: musica,
      inicio,
      duracao: COMPASSO + 0.3,
      frequencia: nota(nome),
      envelope: adsr(0.5, COMPASSO - 0.2, 0.5),
      ganho: ganhoPad,
      panorama: (indice / (acorde.length - 1)) * 1.1 - 0.55,
      brilho: antesDoGroove ? 0.45 : 0.7,
    });
  });
  for (let batida = 0; batida < 4; batida += 1) {
    const t = inicio + batida * BATIDA;
    if (t >= fimMusica) break;
    const nivel = intensidade(t);
    if (nivel <= 0) continue;
    tocarBumbo(musica, t, 0.36 * nivel * (batida === 0 ? 1 : 0.8));
    if (batida === 0 || batida === 2) {
      tocarPluck({
        faixa: musica,
        inicio: t,
        duracao: BATIDA * 1.6,
        frequencia: nota(BAIXOS[compasso % BAIXOS.length] ?? 'A2'),
        envelope: percussivo(0.004, 0.35),
        ganho: 0.11 * nivel,
      });
    }
    const variacao = aleatorio();
    tocarToque(musica, t + BATIDA / 2, 0.05 * nivel * (0.8 + variacao * 0.4), 2.4 + variacao * 0.5, (variacao - 0.5) * 0.8);
    if (nivel >= 0.85 && batida % 2 === 1) {
      const arpejo = acorde.slice(2);
      arpejo.forEach((nome, indice) => {
        tocarPluck({
          faixa: musica,
          inicio: t + indice * (BATIDA / 4),
          duracao: 0.4,
          frequencia: nota(nome) * 2,
          envelope: percussivo(0.003, 0.12),
          ganho: 0.025 * nivel,
          panorama: indice % 2 === 0 ? -0.4 : 0.4,
        });
      });
    }
  }
}

tocarPad({ faixa: musica, inicio: 0, duracao: inicioGroove + 0.5, frequencia: nota('A1'), envelope: adsr(1.2, inicioGroove - 0.8, 1), ganho: 0.03, brilho: 0.4 });

const final = s(deixas.chamada.qual) + 1.2;
['A2', 'E3', 'A3', 'C4', 'E4', 'A4'].forEach((nome, indice) => {
  tocarPad({ faixa: musica, inicio: final, duracao: duracaoTotal - final, frequencia: nota(nome), envelope: adsr(0.08, duracaoTotal - final - 1.4, 1.3), ganho: 0.02, panorama: indice * 0.2 - 0.5, brilho: 0.8 });
});

passaAlta(musica, 35);
passaBaixa(musica, () => 5200);
const reverbMusica = reverberar(musica, 0.8, 0.4);
musica.somarFaixa(reverbMusica, 0.5);

function impacto(t: number, ganho = 1): void {
  tocarGrave(efeitos, t, 0.4 * ganho, 1.1);
  tocarBumbo(efeitos, t, 0.32 * ganho);
}

function carimbo(t: number): void {
  tocarBumbo(efeitos, t, 0.22);
  tocarToque(efeitos, t, 0.12, 0.7 + aleatorio() * 0.15, (aleatorio() - 0.5) * 0.3);
}

function notificacao(t: number, tom = 1): void {
  [nota('E6'), nota('B6')].forEach((frequencia, indice) => {
    tocarSeno({
      faixa: efeitos,
      inicio: t + indice * 0.09,
      duracao: 0.5,
      frequencia: () => frequencia * tom,
      harmonicos: [
        [1, 1],
        [2, 0.18],
      ],
      envelope: percussivo(0.003, 0.14),
      ganho: 0.07,
      panorama: 0.15,
    });
  });
}

function balao(t: number): void {
  const variacao = aleatorio();
  tocarSeno({
    faixa: efeitos,
    inicio: t,
    duracao: 0.12,
    frequencia: (x) => (680 + variacao * 120) * (1 + 1.2 * Math.exp(-x / 0.02)),
    envelope: percussivo(0.002, 0.035),
    ganho: 0.06,
    panorama: -0.1,
  });
}

function positivo(t: number, nome: string): void {
  tocarPluck({ faixa: efeitos, inicio: t, duracao: 0.7, frequencia: nota(nome), envelope: percussivo(0.003, 0.22), ganho: 0.07 });
  tocarPluck({ faixa: efeitos, inicio: t + 0.07, duracao: 0.7, frequencia: nota(nome) * 1.5, envelope: percussivo(0.003, 0.2), ganho: 0.045 });
}

function toqueTelefone(inicio: number, fim: number): void {
  const melodia = ['E5', 'G5', 'B5', 'G5', 'E5', 'B4'];
  for (let t = inicio; t < fim; t += 1.3) {
    melodia.forEach((nome, indice) => {
      const quando = t + indice * 0.13;
      if (quando >= fim) return;
      tocarPluck({ faixa: efeitos, inicio: quando, duracao: 0.3, frequencia: nota(nome), envelope: percussivo(0.002, 0.09), ganho: 0.06, panorama: 0.2 });
    });
  }
}

function tique(t: number, ganho = 0.05): void {
  tocarToque(efeitos, t, ganho, 1.6 + aleatorio() * 0.3, (aleatorio() - 0.5) * 0.4);
}

const a = deixas.abertura;
tocarCliqueBotao(efeitos, s(a.clique), 0.22);
notificacao(s(a.clique + 8), 0.8);
impacto(s(a.dinheiro + 2), 0.55);
tique(s(a.apertou), 0.05);
impacto(s(a.cinco - 6), 0.8);
[5, 4, 3, 2, 1].forEach((_, indice) => tique(s(a.brasileiro + indice * 4), 0.05));
tocarGrave(efeitos, s(a.numero - 4), 0.25, 1.4);

for (const id of ['golpe5', 'golpe4', 'golpe3', 'golpe2', 'golpe1'] as const) {
  impacto(s(linha.cena(id).inicio + 4), id === 'golpe1' ? 0.9 : 0.7);
}

const g5 = deixas.golpe5;
carimbo(s(g5.site + 2));
tocarCliqueBotao(efeitos, s(g5.paga), 0.2);
carimbo(s(g5.nunca));
tique(s(g5.nome), 0.06);
positivo(s(g5.se + 14), 'A4');

const g4 = deixas.golpe4;
balao(s(g4.chamam));
balao(s(g4.curtindo + 16));
balao(s(g4.pagam - 8));
[0, 1, 2].forEach((indice) => tique(s(g4.pagam + 6 + indice * 8), 0.04));
notificacao(s(g4.trocados - 4));
notificacao(s(g4.confianca), 1.06);
carimbo(s(g4.confianca + 6));
balao(s(g4.especial));
balao(s(g4.deposita));
carimbo(s(g4.some + 8));
positivo(s(g4.se + 54), 'A4');

const g3 = deixas.golpe3;
notificacao(s(g3.quinhentos));
balao(s(g3.mensagem));
balao(s(g3.chave - 12));
balao(s(g3.devolve));
notificacao(s(g3.devolve + 8), 0.75);
notificacao(s(Math.max(g3.estorno + 2, g3.devolve + 94)), 0.7);
carimbo(s(g3.duas));
tique(s(g3.botao - 4), 0.06);
positivo(s(g3.botao + 52), 'A4');

const g2 = deixas.golpe2;
toqueTelefone(s(linha.cena('golpe2').inicio + 24), s(g2.aqui - 14));
tocarCliqueBotao(efeitos, s(g2.aqui - 14), 0.16);
tique(s(g2.nome), 0.05);
tique(s(g2.cpf), 0.05);
tique(s(g2.calma), 0.05);
carimbo(s(g2.existe));
tocarCliqueBotao(efeitos, s(g2.desliga), 0.2);
positivo(s(g2.desliga + 60), 'A4');

const g1 = deixas.golpe1;
balao(s(g1.oi));
balao(s(Math.min(g1.oi + 44, g1.problema - 12)));
balao(s(g1.problema));
balao(s(g1.preciso));
balao(s(g1.amanha));
balao(s(g1.pressa + 12));
carimbo(s(g1.pressa + 18));
positivo(s(g1.antes + 18), 'A4');

const p = deixas.protecao;
tocarGrave(efeitos, s(p.caiu - 2), 0.25, 1.3);
positivo(s(p.avisa + 4), 'C5');
positivo(s(p.med + 4), 'E5');
positivo(s(p.oitenta), 'A5');
positivo(s(p.registra + 4), 'G5');
positivo(s(p.diminui + 4), 'C6');

const c = deixas.chamada;
tique(s(c.agora), 0.06);
tocarCliqueBotao(efeitos, s(c.manda + 14), 0.16);
tocarCliqueBotao(efeitos, s(Math.min(c.cair + 4, c.comenta - 38)), 0.18);
notificacao(s(Math.min(c.cair + 4, c.comenta - 38) + 10), 1.1);
balao(s(c.comenta - 4));
[0, 1, 2, 3, 4].forEach((indice) => tique(s(c.qual + indice * 4), 0.04));
[...'Comigo foi o #'].forEach((_, indice) => tocarTecla(efeitos, s(c.qual + 34 + indice * 2.5), 0.1, aleatorio()));
tocarGrave(efeitos, s(c.qual + 70), 0.22, 1.6);

passaAlta(efeitos, 35);

const saida = new Faixa(musica.amostras);
saida.somarFaixa(musica, 0.55);
saida.somarFaixa(efeitos, 1);

const trechos = linha.cenas.map((cena) => {
  const inicio = cena.inicio / QUADROS_POR_SEGUNDO;
  const fim = cena.fim / QUADROS_POR_SEGUNDO;
  return `${cena.id.padEnd(9)} musica ${decibeis(medirRms(musica, inicio, fim) * 0.55).toFixed(1)} dB · total ${decibeis(medirRms(saida, inicio, fim)).toFixed(1)} dB`;
});
console.log(trechos.join('\n'));
console.log(`pico ${decibeis(medirPico(saida)).toFixed(1)} dB`);

mkdirSync(join(raiz, 'public', 'audio'), { recursive: true });
writeFileSync(join(raiz, 'public', 'audio', 'trilha.wav'), finalizar(saida, 0.89, 1.2));
console.log(`trilha.wav: ${duracaoTotal.toFixed(2)}s`);
