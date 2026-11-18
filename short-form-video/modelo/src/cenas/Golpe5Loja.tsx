import { useQuadro } from '../tempo';
import { curvaSaida, progresso } from '../animacao';
import { Carimbo, DicaCentral, ESPERA_DICA, Realce, TituloGolpe } from '../componentes/Elementos';
import { Icone } from '../componentes/Icone';
import { Iphone, TELA, TrocaDeTela } from '../componentes/Iphone';
import { CabecalhoRecibo, Recibo } from '../componentes/Recibo';
import { BANCO, BotaoApp, pressao, Toque } from '../componentes/Telas';
import { deixasLocais } from '../linhaDoTempo';
import { fontes } from '../tema';

const VERMELHO_LOJA = '#E53935';

function Televisao() {
  return (
    <svg width="300" height="190" viewBox="0 0 420 266">
      <defs>
        <linearGradient id="telaTv" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1E3C72" />
          <stop offset="0.55" stopColor="#5B3E96" />
          <stop offset="1" stopColor="#E0558C" />
        </linearGradient>
        <linearGradient id="reflexoTv" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="14" y="6" width="392" height="226" rx="8" fill="#15171B" />
      <rect x="22" y="14" width="376" height="210" rx="3" fill="url(#telaTv)" />
      <path d="M40 200 Q140 120 210 150 T380 90 V224 H40Z" fill="#000" opacity="0.18" />
      <rect x="22" y="14" width="160" height="210" fill="url(#reflexoTv)" transform="skewX(-18)" />
      <rect x="180" y="232" width="60" height="10" rx="3" fill="#2A2D33" />
      <path d="M110 262h200" stroke="#2A2D33" strokeWidth="8" strokeLinecap="round" />
      <path d="M150 242l-26 20M270 242l26 20" stroke="#2A2D33" strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

function Estrelas() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[0, 1, 2, 3, 4].map((indice) => (
        <svg key={indice} width="26" height="26" viewBox="0 0 24 24">
          <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8Z" fill="#F5B301" />
        </svg>
      ))}
      <span style={{ fontSize: 24, color: '#6B717B', marginLeft: 8 }}>4,9 (2.341 avaliações)</span>
    </div>
  );
}

function Loja({ quadro, pix, paga }: { quadro: number; pix: number; paga: number }) {
  const restante = Math.max(0, 299 - Math.floor(quadro / 30));
  const relogio = `0${Math.floor(restante / 60)}:${String(restante % 60).padStart(2, '0')}`;
  const realceBotao = progresso(quadro, pix - 4, 12, curvaSaida);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#F2F3F5', fontFamily: fontes.texto, color: '#1F2329' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: TELA.barraStatus + 96, background: '#F7F7F8', borderBottom: '1px solid #E1E3E6' }}>
        <div
          style={{
            position: 'absolute',
            left: 28,
            right: 28,
            top: TELA.barraStatus + 8,
            height: 74,
            borderRadius: 22,
            background: '#E3E5E9',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 14,
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 600, color: '#4A4F57' }}>aA</span>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <Icone nome="cadeado" tamanho={24} cor="#4A4F57" espessura={2.4} />
            <span style={{ fontSize: 30, color: '#2B2F35' }}>megaofertas-oficial.shop</span>
          </div>
          <svg width="30" height="30" viewBox="0 0 24 24">
            <path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5" fill="none" stroke="#4A4F57" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ position: 'absolute', top: TELA.barraStatus + 96, left: 0, right: 0, height: 92, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', borderBottom: '1px solid #ECEDEF' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="36" height="30" viewBox="0 0 24 20">
            <path d="M2 3h20M2 10h20M2 17h20" stroke="#1F2329" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <span style={{ fontFamily: fontes.titulo, fontWeight: 900, fontSize: 36, letterSpacing: '-0.02em' }}>
            Mega<span style={{ color: VERMELHO_LOJA }}>Ofertas</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
          <svg width="36" height="36" viewBox="0 0 24 24">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="#1F2329" strokeWidth="2.2" />
            <path d="M15.5 15.5 21 21" stroke="#1F2329" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <div style={{ position: 'relative' }}>
            <Icone nome="carrinho" tamanho={38} cor="#1F2329" espessura={2.2} />
            <div style={{ position: 'absolute', right: -10, top: -8, width: 26, height: 26, borderRadius: '50%', background: VERMELHO_LOJA, color: '#fff', fontSize: 17, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: TELA.barraStatus + 188, left: 0, right: 0, height: 58, background: VERMELHO_LOJA, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', color: '#fff' }}>
        <span style={{ fontWeight: 800, fontSize: 26, letterSpacing: '0.04em' }}>QUEIMA DE ESTOQUE</span>
        <span style={{ fontWeight: 700, fontSize: 26, fontVariantNumeric: 'tabular-nums' }}>termina em {relogio}</span>
      </div>
      <div style={{ position: 'absolute', top: TELA.barraStatus + 262, left: 28, right: 28 }}>
        <div style={{ position: 'relative', borderRadius: 28, background: '#fff', padding: '18px 26px 22px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ position: 'relative', borderRadius: 20, background: '#F4F5F7', height: 196, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Televisao />
            <div style={{ position: 'absolute', top: 14, left: 14, padding: '6px 14px', borderRadius: 10, background: VERMELHO_LOJA, color: '#fff', fontWeight: 800, fontSize: 26 }}>-70%</div>
            <div style={{ position: 'absolute', bottom: 12, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {[0, 1, 2, 3].map((indice) => (
                <div key={indice} style={{ width: indice === 0 ? 22 : 9, height: 9, borderRadius: 5, background: indice === 0 ? '#1F2329' : '#C5C8CE' }} />
              ))}
            </div>
          </div>
          <div style={{ fontSize: 31, fontWeight: 600, marginTop: 14 }}>Smart TV 65&quot; 4K UHD com Wi-Fi</div>
          <div style={{ marginTop: 6 }}>
            <Estrelas />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 6 }}>
            <span style={{ fontSize: 66, fontWeight: 800, letterSpacing: '-0.03em' }}>R$ 1.199,00</span>
            <span style={{ fontSize: 26, color: '#8A9099', textDecoration: 'line-through' }}>R$ 3.999,00</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 25, fontWeight: 600, color: '#2E7D32' }}>
            <Icone nome="caixa" tamanho={26} cor="#2E7D32" espessura={2.2} />
            Frete grátis, chega amanhã
          </div>
        </div>
        <BotaoApp
          texto="Pagar com Pix"
          cor="#16A34A"
          icone="carrinho"
          pressionado={pressao(quadro, paga)}
          estilo={{ marginTop: 20, boxShadow: `0 0 0 ${realceBotao * 8}px rgba(22,163,74,0.22)` }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20, padding: '18px 22px', borderRadius: 22, background: '#fff' }}>
          {[
            { icone: 'escudo' as const, texto: 'Compra 100% segura' },
            { icone: 'devolver' as const, texto: 'Troca grátis' },
            { icone: 'caixa' as const, texto: 'Entrega expressa' },
          ].map((selo) => (
            <div key={selo.texto} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icone nome={selo.icone} tamanho={26} cor="#2E7D32" espessura={2.2} />
              <span style={{ fontSize: 21, fontWeight: 600, color: '#3A3F47' }}>{selo.texto}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 22, fontSize: 28, fontWeight: 700 }}>Quem viu também comprou</div>
        <div style={{ display: 'flex', gap: 16, marginTop: 14 }}>
          {[
            { nome: 'Soundbar 2.1', preco: 'R$ 299,00', cor: 'linear-gradient(150deg,#3A3F47,#16181C)' },
            { nome: 'Fone sem fio', preco: 'R$ 89,90', cor: 'linear-gradient(150deg,#E8E9EC,#B9BCC2)' },
            { nome: 'Smartwatch', preco: 'R$ 149,00', cor: 'linear-gradient(150deg,#2B5876,#4E4376)' },
          ].map((item) => (
            <div key={item.nome} style={{ flex: 1, borderRadius: 20, background: '#fff', padding: 12 }}>
              <div style={{ height: 120, borderRadius: 14, background: item.cor }} />
              <div style={{ fontSize: 22, color: '#3A3F47', marginTop: 10 }}>{item.nome}</div>
              <div style={{ fontSize: 26, fontWeight: 800 }}>{item.preco}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Golpe5Loja() {
  const quadro = useQuadro();
  const d = deixasLocais('golpe5');
  const confirmacao = d.paga + 20;
  const realceNome = progresso(quadro, d.nome, 26, curvaSaida);
  const saidaCelular = d.se - 16;

  return (
    <>
      <TituloGolpe numero={5} titulo="LOJA FALSA" />
      <Iphone entrada={18} saida={saidaCelular} claro={quadro < confirmacao + 8}>
        <TrocaDeTela inicio={-100} fim={confirmacao}>
          <Loja quadro={quadro} pix={d.pix} paga={d.paga} />
        </TrocaDeTela>
        <TrocaDeTela inicio={confirmacao}>
          <div style={{ position: 'absolute', inset: 0, background: BANCO.fundo }} />
          <div style={{ position: 'absolute', top: 140, left: 36, right: 36, fontFamily: fontes.texto }}>
            <CabecalhoRecibo titulo="Pagar com Pix" />
            <Recibo
              titulo="Você vai pagar"
              valor="R$ 1.199,00"
              icone="carrinho"
              corIcone={BANCO.destaque}
              secoes={[
                {
                  rotulo: 'QUEM VAI RECEBER',
                  linhas: [
                    { rotulo: 'Nome', valor: 'Carlos E. Souza', realce: realceNome, cor: realceNome > 0.5 ? BANCO.negativo : undefined },
                    { rotulo: 'CPF', valor: '•••.482.317-••' },
                    { rotulo: 'Instituição', valor: 'Banco Digital S.A.' },
                  ],
                },
              ]}
            />
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginTop: 20,
                padding: '22px 26px',
                borderRadius: 24,
                background: 'rgba(255,90,95,0.12)',
                border: '1.5px solid rgba(255,90,95,0.4)',
                opacity: progresso(quadro, d.nome + 12, 14, curvaSaida),
                transform: `translateY(${(1 - progresso(quadro, d.nome + 12, 14, curvaSaida)) * 16}px)`,
              }}
            >
              <Icone nome="alerta" tamanho={40} cor={BANCO.negativo} espessura={2.4} />
              <span style={{ fontSize: 34, fontWeight: 700, color: BANCO.negativo }}>É uma pessoa, não a loja!</span>
            </div>
          </div>
        </TrocaDeTela>
      </Iphone>
      <Toque quadro={quadro} momento={d.paga} x={540} y={1544} />
      <Carimbo texto="Site falso!" inicio={d.site + 2} fim={d.paga - 18} estilo={{ top: 1130 }} />
      <Carimbo texto="Nunca chega!" inicio={d.nunca} fim={d.nome - 14} estilo={{ top: 1330 }} />
      <DicaCentral
        inicio={saidaCelular + ESPERA_DICA}
        titulo={<>Confira <Realce>quem recebe</Realce> antes de pagar</>}
        texto="Se o nome não for o da empresa, cancele na hora."
      />
    </>
  );
}
