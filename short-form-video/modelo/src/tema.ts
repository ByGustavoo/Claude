import { loadFont as carregarInter } from '@remotion/google-fonts/Inter';
import { loadFont as carregarMono } from '@remotion/google-fonts/JetBrainsMono';
import { loadFont as carregarMontserrat } from '@remotion/google-fonts/Montserrat';

const montserrat = carregarMontserrat('normal', { weights: ['700', '800', '900'], subsets: ['latin'] });
const inter = carregarInter('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });
const mono = carregarMono('normal', { weights: ['500', '700'], subsets: ['latin'] });

export const fontes = {
  titulo: montserrat.fontFamily,
  texto: inter.fontFamily,
  mono: mono.fontFamily,
};

export const cores = {
  fundo: '#05070C',
  fundoElevado: '#0B0F18',
  painel: '#111725',
  painelClaro: '#1A2234',
  borda: 'rgba(255,255,255,0.09)',
  texto: '#F5F7FB',
  suave: '#97A1B6',
  apagado: '#5B6479',
  perigo: '#FF3B4E',
  perigoEscuro: '#7A0E1B',
  seguro: '#1FE0A8',
  seguroEscuro: '#0B5C46',
  alerta: '#FFC53D',
  destaque: '#FFE14D',
  azul: '#4DA3FF',
  chat: '#1F8A5B',
  chatRecebido: '#1C2333',
};

export const MARCA = {
  nome: 'Explica Aí',
  arroba: '@oexplicaai_',
};
