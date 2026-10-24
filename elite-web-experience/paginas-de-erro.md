# Páginas de erro: 404, 403 e falha geral

Guia para acertar de primeira as páginas de erro de tela inteira. Ele saiu de quatro projetos do usuário (PrismaWeb, OrbitWeb, AegisWeb e OryntWeb) e das correções que o usuário fez em 23 de outubro de 2026, enquanto as do OryntWeb eram construídas. Siga-o sempre que o pedido for uma página 404, uma página 403 ("sem acesso", "sem permissão") ou a tela de erro geral (error boundary, "a aplicação quebrou").

## 1. O que o usuário já recusou

Todas estas versões foram feitas e depois refeitas. Não as repita:

| Feito | Resposta do usuário | Lição |
|---|---|---|
| 404 com uma árvore B-tree de blocos | "tá muito simples, quero outra animação, sem ser esses quadrados" | Blocos e retângulos geométricos parados não bastam. A cena precisa ter vida e personalidade. |
| 404 com um painel de pontos estilo LED | "não gostei, quero outra ideia" | Trocar uma ilustração abstrata por outra não resolve. Proponha opções com prévia antes de construir. |
| Página com fundo liso | "o fundo está todo preto, sem nenhuma animação" | O fundo da página também é animado desde a primeira versão (§4). |
| 403 como seção dentro do shell | "deixa do mesmo jeito que a tela 404, o fundo e tudo mais, só muda as mensagens" | As três páginas são a mesma página de tela inteira; só as mensagens mudam. |
| 403 dizendo qual permissão falta | "não fala qual é o nome da permissão que falta na mensagem" | A 403 nunca diz qual permissão falta: nem no texto, nem na cena. |

A ideia aprovada foi a escolhida entre quatro propostas com prévia em ASCII. A recomendada, e escolhida, era a que **faz algo útil**: um terminal psql que procura o endereço ao vivo, devolve `(0 linhas)` e sugere a tela mais parecida.

## 2. Antes de escrever código

1. **Leia as páginas de erro que já existem** nos projetos irmãos. São o padrão que o usuário espera:
   - `D:\Projetos\OryntWeb\src\componentes\comum\MolduraDeErro.tsx` e `.module.css` (moldura e fundo animado), `TerminalPsql.tsx`, `TelaDeErroHttp.tsx`, `TelaDeFalha.tsx`, `LimiteDeErro.tsx`, `src\paginas\PaginaNaoEncontrada.tsx`, `src\componentes\layout\SemAcessoNaTela.tsx`, `src\regras\sugestaoDeTela.ts`, `src\regras\falhaDeTela.ts`. É a versão mais completa, com as três páginas.
   - `D:\Projetos\OrbitWeb\src\paginas\PaginaNaoEncontrada.tsx` (órbita que perde o sinal), `D:\Projetos\PrismaWeb\src\pages\PaginaNaoEncontrada.tsx` (série financeira interrompida), `D:\Projetos\AegisWeb\src\paginas\PaginaNaoEncontrada.tsx` (combinação de senha sem correspondência).
   - As notas de cada um: `PrismaWeb\CLAUDE.md` (seção "Pagina 404"), `AegisWeb\CLAUDE.md`, `OryntWeb\docs\notas\interface.md` e `OryntWeb\REQUISITOS.md` ("Páginas de erro").
2. **Escolha a cena no vocabulário do produto.** O erro é contado com um elemento que o produto já usa: em finanças, uma série que se interrompe; em produtividade, uma órbita que perde o sinal; em senhas, uma combinação que não abre nada; em banco de dados, uma consulta que volta vazia.
3. **Proponha antes de construir a cena da 404.** Use `AskUserQuestion` com 3 ou 4 ideias, cada uma com uma prévia em ASCII da cena. Pule esta etapa só se o usuário já tiver dito qual ideia quer, ou se o projeto já tiver uma 404 nesse formato. Recomende a ideia que:
   - **ajuda a pessoa a chegar aonde queria**, por exemplo sugerindo a tela mais parecida com o endereço digitado;
   - **tem movimento e narrativa** (algo acontece, falha e responde), não uma ilustração parada;
   - **parece uma ferramenta real do domínio** (terminal, gráfico, painel do produto), não formas abstratas.
4. **A 403 e a falha geral não pedem nova rodada de ideias.** Elas usam a mesma moldura e a mesma cena da 404, contando o próprio erro.

## 3. Estrutura da página (igual nas três)

- **Fora do shell, dentro dos provedores.** Um endereço que não existe não é uma tela do produto, então a página não tem menu nem cabeçalho e assume a navegação sozinha. Ela fica dentro do provedor de tema, para abrir no tema da pessoa. A exceção é a falha geral (§6).
- **Tela:** `min-height: 100dvh`, grid centralizado (`align-content: center; justify-items: center`), padding com `env(safe-area-inset-*)`, `position: relative; isolation: isolate; overflow: hidden` para o fundo animado.
- **Marca no topo:** símbolo de 32px, nome e slogan, num link para o início com `aria-label="<Nome>, ir para o início"` e foco visível.
- **Cartão:** `max-width: 620px`, `overflow: hidden`, raio grande, borda e **sombra de sobreposição**. É o único cartão do produto com sombra, porque é o único que flutua sozinho. Dentro dele vêm duas partes:
  - **Palco** em cima, com fundo `superficie-suave`, borda inferior, um brilho radial `destaque-suave` atrás e a cena com `aria-hidden="true"`.
  - **Conteúdo** embaixo, centralizado, nesta ordem:
    1. sobretítulo em caixa alta, pequeno, na cor de destaque: "Erro 404", "Erro 403", "Erro inesperado";
    2. `h1`;
    3. descrição com 46 a 50ch, que cita o endereço pedido num `<code>` (decodificado com `decodeURIComponent` dentro de `try`, com `overflow-wrap: anywhere`);
    4. ações;
    5. rodapé "Talvez você procure".
- **`main`** com o id do conteúdo principal do projeto e um `h1`.
- **Entrada em cascata** dos blocos do conteúdo, com o utilitário de cascata do projeto (`item-em-cascata` com `--indice`).
- **Título da aba** próprio: "Página não encontrada", "<Tela>: sem acesso", "Parou de funcionar".
- **Ações:**
  - "Voltar" só aparece quando existe histórico dentro do app (`location.key !== 'default'`).
  - Sem login: só "Ir para a tela de login", sem atalhos e sem sugestão.
  - Abaixo de 480px, as ações empilham e ocupam a largura toda.
  - Um botão com rótulo longo ("Abrir Usuários e permissões › Permissões") pode quebrar linha: `height: auto; white-space: normal`.
- **"Talvez você procure":** links em pílula, com altura mínima do alvo de toque e hover só em `@media (hover: hover)`. Liste só as telas que a conta pode abrir, sem a tela do botão principal, do rótulo mais curto ao mais longo.
- **Uma moldura compartilhada desde a primeira página.** Mesmo quando o pedido é só a 404, construa a moldura como um componente (`MolduraDeErro`, mais um invólucro com roteador como `TelaDeErroHttp`) que recebe `terminal`/`cena`, `sobretitulo`, `titulo`, `descricao`, `acoes` e `rodape`. A 403 e a falha geral passam a ser só mensagens novas. No fechamento, ofereça fazer as outras duas.

## 4. Fundo animado (obrigatório)

Fica atrás do cartão, com `aria-hidden` e `pointer-events: none`, todo com tokens do tema, então funciona no claro e no escuro. São três camadas sutis:

1. **Grade de pontos** a cada 24px (`radial-gradient` de 1px), com `mask-image` radial que a deixa mais visível em volta do cartão e a apaga nas bordas, e um `fade-in` na entrada.
2. **Dois brilhos** `destaque-suave` (`min(720px, 90vw)`), um acima e outro abaixo do cartão, que derivam devagar com `alternate` em ciclos diferentes (18s e 22s).
3. **Pulsos de luz:** uns oito traços com cabeça luminosa (`box-shadow` com o destaque) que correm pelas linhas e colunas da grade, cada um com duração e atraso próprios. Uma máscara em elipse os esconde no centro, para nunca cruzarem a marca nem o cartão. Abaixo de 600px os pulsos somem, porque o cartão ocupa quase a largura toda.

Com `prefers-reduced-motion`, os pulsos somem e o resto fica parado.

## 5. A cena: regras de engenharia

- **Altura final reservada desde o primeiro quadro.** Desenhe todas as linhas e esconda as que ainda não apareceram com `visibility: hidden`, não com renderização condicional. Assim nada abaixo da cena se mexe. Um cursor de terminal é uma caixa inline de largura zero com um `::after` absoluto.
- **Ritmo:**
  - digitação de cerca de 1,9s no total, com uma variação por caractere vinda de um ruído determinístico, nunca `Math.random` na renderização;
  - uma espera antes de digitar, pausas entre o Enter, a execução e a resposta;
  - no fim, um prompt com o cursor piscando.
- **Laços:**
  - Os laços CSS de uma mesma cena compartilham uma variável de ciclo, e os percentuais dos keyframes formam uma linha do tempo só: mudou um, confira os outros.
  - Uma constante do TSX que espelha um percentual do CSS muda junto com ele.
  - Comprimentos de traçado saem da geometria (soma de hipotenusas, `pathLength={1}`), não de `getTotalLength()` depois de montar.
- **Movimento reduzido mostra o quadro final com sentido:** o terminal já completo, o 404 já formado. Nunca um gráfico vazio nem uma linha recolhida.
- **Celular:** aumente as marcas (`--escala-marcas`) e a espessura dos traços abaixo de 600px. Reduza a fonte do terminal com container query (escolha um nome de container que ainda não esteja em uso).
- **IDs de SVG** com `useId()`. Prefira SVG escrito à mão a uma biblioteca de gráficos para uma cena sem eixos.

## 6. Mensagens de cada página

### 404
- Sobretítulo "Erro 404", título "Página não encontrada".
- Descrição: "Nenhuma tela do <Produto> responde pelo endereço `<endereço>`." Depois, "A mais parecida é **<Tela>**." quando houver sugestão, ou, sem sugestão, "Ele pode ter sido digitado com um erro ou pertencer a uma tela que mudou de lugar."
- **Sugestão de tela** numa regra pura e testada (`regras/sugestaoDeTela.ts`):
  - distância de edição normalizada sobre o caminho inteiro ou sobre o último trecho (mais um peso de 0,1), aceita até 0,4;
  - ignora acentos, maiúsculas e minúsculas e barras repetidas e finais;
  - só entre as telas que a conta pode abrir; sem login, não sugere.
- **Ações:**
  - com sugestão: "Abrir <Tela>" (primária, com seta à direita), "Ir para o Dashboard" (secundária) e "Voltar" (terciária);
  - sem sugestão: "Ir para o Dashboard" e "Voltar".
- Na cena, a busca acontece e volta vazia (`(0 linhas)`), depois vem a dica ("você quis dizer '<caminho>'?").

### 403
- **Página inteira idêntica à 404**, no lugar do shell. Só mudam as mensagens, o selo e o tom vermelho da cena (`tom="erro"`).
- Sobretítulo "Erro 403", título "Sem acesso a esta tela".
- Descrição: "Sua conta não tem permissão para abrir **<Tela>**. Quem administra o <Produto> na sua equipe pode liberar o acesso." Acrescente "A tentativa ficou registrada na auditoria." **só se isso for verdade no código.**
- **Nunca diga qual permissão falta**, nem pelo nome nem pelo código, em lugar nenhum da página.
- Na cena, a conta tenta e o domínio recusa (`ERRO: permissão negada para tabela <área>`, `DETALHE` com a conta, `DICA` de pedir acesso).
- Ações: "Ir para o Dashboard", ou "Abrir <primeira tela permitida>" quando a conta não vê o Dashboard; mais "Voltar".
- A página é mais uma camada da guarda, nunca a única: o servidor continua respondendo 403, o item continua escondido do menu, e o registro na auditoria (quando existir) continua acontecendo antes de a página ser desenhada.

### Falha geral
- Um error boundary em volta da aplicação inteira, **fora do roteador e dos provedores**. Por isso a moldura não pode usar hooks de roteador, de tema nem de autenticação: a marca é um `<a href="/">` simples e o `main` leva `role="alert"`.
- Um segundo boundary em volta de cada tela, dentro do shell, com a chave do caminho: a falha de uma tela só mostra um estado de erro simples ali dentro, com o menu funcionando, e a próxima tela começa limpa.
- **Separe dois motivos:**
  - **módulo que não chegou** (`ChunkLoadError` e as mensagens de import dinâmico do Chrome, do Firefox e do Safari): sobretítulo "Falha de carregamento", título "<Produto> não carregou", explicação de versão nova ou rede;
  - **erro de renderização**: sobretítulo "Erro inesperado", título "<Produto> parou de funcionar".
- **Nunca mostre o texto do erro.** Diga "Nada foi alterado no seu <dado>." quando for verdade.
- **Única ação: "Recarregar a página".** Um "Tentar novamente" não funciona depois que um `lazy()` falhou.
- A cena mostra a conexão caindo (`FATAL`, prompt `orynt!>`) ou o `ERRO` com o `DETALHE` do carregamento.

## 7. Verificação no Chrome

Confira as três páginas, cada uma:

- nos dois temas;
- logado e deslogado (404);
- em 320, 390 e 834px (carregadas em iframes se o Chrome não diminuir) e em desktop;
- com movimento reduzido;
- sem rolagem lateral;
- sem erro no console;
- com a cena terminando sem empurrar o conteúdo.

Como fazer cada uma aparecer:

- **404:** qualquer endereço inexistente. Teste também um endereço com erro de digitação, para ver a sugestão, e um endereço com acento.
- **403:** tire temporariamente uma permissão da conta de teste. Avise o usuário que tirou, e devolva a permissão quando ele terminar de olhar.
- **Falha geral:** lance um erro provisório num componente acima das telas (por exemplo, a guarda de rota). Avise que nenhuma tela abre enquanto ele estiver lá, e retire-o antes de dar a tarefa por concluída.

Registre nas notas do projeto o desenho escolhido, as ideias recusadas e as armadilhas encontradas.
