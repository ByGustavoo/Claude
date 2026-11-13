import type { CSSProperties, ReactNode } from 'react';

export type NomeIcone =
  | 'escudo'
  | 'check'
  | 'x'
  | 'alerta'
  | 'telefone'
  | 'cadeado'
  | 'compartilhar'
  | 'comentario'
  | 'relogio'
  | 'carrinho'
  | 'caixa'
  | 'usuario'
  | 'cartao'
  | 'banco'
  | 'devolver'
  | 'enviar'
  | 'lua'
  | 'documento'
  | 'codigo'
  | 'coracao'
  | 'seta'
  | 'raio';

const desenhos: Record<NomeIcone, ReactNode> = {
  escudo: <path d="M12 2.5 4 5.5v6c0 5 3.4 8.8 8 10 4.6-1.2 8-5 8-10v-6l-8-3Z" />,
  check: <path d="m5 12.5 4.5 4.5L19.5 7" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  alerta: (
    <>
      <path d="M12 3 2 20.5h20L12 3Z" />
      <path d="M12 10v4.5M12 17.5v.5" />
    </>
  ),
  telefone: <path d="M5 3.5h3.5l1.8 4.6-2.3 1.5a11 11 0 0 0 6.4 6.4l1.5-2.3 4.6 1.8V19a2 2 0 0 1-2 2A16.5 16.5 0 0 1 3 5.5a2 2 0 0 1 2-2Z" />,
  cadeado: (
    <>
      <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </>
  ),
  compartilhar: <path d="M14 4.5 21 11l-7 6.5V14c-5 0-8.5 1.5-11 6 .8-6 3.7-10.5 11-11.5V4.5Z" />,
  comentario: <path d="M4 5.5h16v10.5H10l-5 4v-4H4V5.5Z" />,
  relogio: (
    <>
      <circle cx="12" cy="12.5" r="8.5" />
      <path d="M12 7.5v5l3.5 2" />
    </>
  ),
  carrinho: (
    <>
      <path d="M2.5 3.5h3l2.4 11.5h10.6l2-8H6.6" />
      <circle cx="9.5" cy="19.5" r="1.4" />
      <circle cx="17" cy="19.5" r="1.4" />
    </>
  ),
  caixa: (
    <>
      <path d="M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5v-9Z" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" />
    </>
  ),
  usuario: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c.8-4.2 4-6.5 8-6.5s7.2 2.3 8 6.5" />
    </>
  ),
  cartao: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 9.5h19M6 15h4" />
    </>
  ),
  banco: <path d="M3 9.5 12 4l9 5.5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20.5h18" />,
  devolver: <path d="M9 5 4 10l5 5M4 10h10a6 6 0 0 1 0 12h-3" />,
  enviar: <path d="M21 3 10 14M21 3l-6.5 18-4.5-7-7-4.5L21 3Z" />,
  lua: <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />,
  documento: (
    <>
      <path d="M6 2.5h8l4.5 4.5v14.5H6V2.5Z" />
      <path d="M14 2.5V7h4.5M9 12h6M9 16h6" />
    </>
  ),
  codigo: <path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16" />,
  coracao: <path d="M12 20.5s-8-4.6-8-10.5a4.5 4.5 0 0 1 8-2.8 4.5 4.5 0 0 1 8 2.8c0 5.9-8 10.5-8 10.5Z" />,
  seta: <path d="M5 12h14M13 6l6 6-6 6" />,
  raio: <path d="M13 2 4.5 13.5h6.5L10 22l9-12h-6.5L13 2Z" />,
};

interface IconeProps {
  nome: NomeIcone;
  tamanho?: number;
  cor?: string;
  espessura?: number;
  preenchido?: boolean;
  estilo?: CSSProperties;
}

export function Icone({ nome, tamanho = 48, cor = 'currentColor', espessura = 2.2, preenchido = false, estilo }: IconeProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill={preenchido ? cor : 'none'}
      stroke={cor}
      strokeWidth={espessura}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0, ...estilo }}
    >
      {desenhos[nome]}
    </svg>
  );
}
