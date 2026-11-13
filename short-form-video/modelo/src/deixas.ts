export const QUADROS_POR_SEGUNDO = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
export const ANTECIPACAO = 8;
export const SOBREPOSICAO = 14;

export const ORDEM_CENAS = ['abertura', 'golpe5', 'golpe4', 'golpe3', 'golpe2', 'golpe1', 'protecao', 'chamada'] as const;
export type IdCena = (typeof ORDEM_CENAS)[number];

export interface PalavraNarrada {
  texto: string;
  inicio: number;
  fim: number;
}

export interface CenaNarrada {
  id: string;
  inicio: number;
  duracao: number;
  palavras: PalavraNarrada[];
}

export interface Narracao {
  duracaoTotal: number;
  cenas: CenaNarrada[];
}

export interface PalavraEmQuadros {
  texto: string;
  inicio: number;
  fim: number;
  cena: IdCena;
}

export interface TrechoCena {
  id: IdCena;
  inicio: number;
  fim: number;
  duracao: number;
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

export function emQuadros(segundos: number): number {
  return Math.round(segundos * QUADROS_POR_SEGUNDO);
}

export function criarLinhaDoTempo(narracao: Narracao) {
  const total = emQuadros(narracao.duracaoTotal);
  const narradas = ORDEM_CENAS.map((id) => {
    const cena = narracao.cenas.find((item) => item.id === id);
    if (!cena) throw new Error(`Cena sem narração: ${id}`);
    return cena;
  });
  const inicios = narradas.map((cena, indice) => (indice === 0 ? 0 : emQuadros(cena.inicio) - ANTECIPACAO));
  const cenas: TrechoCena[] = ORDEM_CENAS.map((id, indice) => {
    const inicio = inicios[indice] ?? 0;
    const fim = inicios[indice + 1] ?? total;
    return { id, inicio, fim, duracao: fim - inicio };
  });
  const palavras: PalavraEmQuadros[] = narradas.flatMap((cena, indice) =>
    cena.palavras.map((palavra) => ({
      texto: palavra.texto,
      inicio: emQuadros(palavra.inicio),
      fim: emQuadros(palavra.fim),
      cena: ORDEM_CENAS[indice] ?? 'abertura',
    })),
  );

  function cena(id: IdCena): TrechoCena {
    const encontrada = cenas.find((item) => item.id === id);
    if (!encontrada) throw new Error(`Cena inexistente: ${id}`);
    return encontrada;
  }

  function palavra(id: IdCena, alvo: string, ocorrencia = 1): number {
    const procurada = normalizar(alvo);
    const candidatas = palavras.filter((item) => item.cena === id && normalizar(item.texto) === procurada);
    const escolhida = candidatas[ocorrencia - 1];
    if (!escolhida) throw new Error(`Palavra "${alvo}" (${ocorrencia}) não encontrada em ${id}`);
    return escolhida.inicio;
  }

  function fimPalavra(id: IdCena, alvo: string, ocorrencia = 1): number {
    const procurada = normalizar(alvo);
    const candidatas = palavras.filter((item) => item.cena === id && normalizar(item.texto) === procurada);
    const escolhida = candidatas[ocorrencia - 1];
    if (!escolhida) throw new Error(`Palavra "${alvo}" (${ocorrencia}) não encontrada em ${id}`);
    return escolhida.fim;
  }

  return { total, cenas, palavras, cena, palavra, fimPalavra };
}

export type LinhaDoTempo = ReturnType<typeof criarLinhaDoTempo>;

export function criarDeixas(linha: LinhaDoTempo) {
  const p = linha.palavra;
  return {
    abertura: {
      clique: p('abertura', 'clique'),
      ele: p('abertura', 'ele'),
      dinheiro: p('abertura', 'dinheiro'),
      sem: p('abertura', 'sem'),
      apertou: p('abertura', 'apertou'),
      esses: p('abertura', 'esses'),
      cinco: p('abertura', 'cinco'),
      brasileiro: p('abertura', 'brasileiro'),
      fica: p('abertura', 'fica'),
      numero: p('abertura', 'numero'),
      engana: p('abertura', 'engana'),
    },
    golpe5: {
      numero: p('golpe5', 'numero'),
      promocao: p('golpe5', 'promocao'),
      site: p('golpe5', 'site'),
      pix: p('golpe5', 'pix'),
      paga: p('golpe5', 'paga'),
      nunca: p('golpe5', 'nunca'),
      antes: p('golpe5', 'antes'),
      nome: p('golpe5', 'nome'),
      se: p('golpe5', 'se'),
      cancela: p('golpe5', 'cancela'),
    },
    golpe4: {
      numero: p('golpe4', 'numero'),
      chamam: p('golpe4', 'chamam'),
      curtindo: p('golpe4', 'curtindo'),
      pagam: p('golpe4', 'pagam'),
      trocados: p('golpe4', 'trocados'),
      confianca: p('golpe4', 'confianca'),
      especial: p('golpe4', 'especial'),
      duzentos: p('golpe4', '200'),
      deposita: p('golpe4', 'deposita', 2),
      some: p('golpe4', 'some'),
      se: p('golpe4', 'se'),
      golpe: p('golpe4', 'golpe'),
    },
    golpe3: {
      numero: p('golpe3', 'numero'),
      quinhentos: p('golpe3', '500'),
      mensagem: p('golpe3', 'mensagem'),
      chave: p('golpe3', 'chave'),
      devolve: p('golpe3', 'devolve', 2),
      golpista: p('golpe3', 'golpista'),
      estorno: p('golpe3', 'estorno'),
      sai: p('golpe3', 'sai'),
      duas: p('golpe3', 'duas'),
      recebeu: p('golpe3', 'recebeu'),
      botao: p('golpe3', 'botao'),
      nunca: p('golpe3', 'nunca'),
    },
    golpe2: {
      numero: p('golpe2', 'numero'),
      toca: p('golpe2', 'toca'),
      aqui: p('golpe2', 'aqui'),
      compra: p('golpe2', 'compra'),
      sabem: p('golpe2', 'sabem'),
      nome: p('golpe2', 'nome'),
      cpf: p('golpe2', 'cpf'),
      calma: p('golpe2', 'calma'),
      pedem: p('golpe2', 'pedem'),
      contaSegura: p('golpe2', 'conta', 2),
      existe: p('golpe2', 'existe'),
      nenhum: p('golpe2', 'nenhum'),
      desliga: p('golpe2', 'desliga'),
      atras: p('golpe2', 'atras'),
    },
    golpe1: {
      numero: p('golpe1', 'numero'),
      mensagem: p('golpe1', 'mensagem'),
      foto: p('golpe1', 'foto'),
      oi: p('golpe1', 'oi'),
      problema: p('golpe1', 'problema'),
      preciso: p('golpe1', 'preciso'),
      amanha: p('golpe1', 'amanha'),
      pressa: p('golpe1', 'pressa'),
      antes: p('golpe1', 'antes'),
      liga: p('golpe1', 'liga'),
      pergunta: p('golpe1', 'pergunta'),
    },
    protecao: {
      caiu: p('protecao', 'caiu'),
      avisa: p('protecao', 'avisa'),
      med: p('protecao', 'med'),
      contestar: p('protecao', 'contestar'),
      oitenta: p('protecao', '80'),
      quanto: p('protecao', 'quanto'),
      registra: p('protecao', 'registra'),
      diminui: p('protecao', 'diminui'),
      noite: p('protecao', 'noite'),
    },
    chamada: {
      agora: p('chamada', 'agora'),
      manda: p('chamada', 'manda'),
      cair: p('chamada', 'cair'),
      comenta: p('chamada', 'comenta'),
      qual: p('chamada', 'qual'),
    },
  } satisfies Record<IdCena, Record<string, number>>;
}

export type Deixas = ReturnType<typeof criarDeixas>;
