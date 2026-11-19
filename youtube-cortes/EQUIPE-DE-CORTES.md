# Equipe de cortes: como um lote é produzido

Procedimento definido pelo usuário em 19/11/2026 (`C:\Users\Usuário\Downloads\QUORUM-ANDAR-DE-CORTES.md`). Ele copia o jeito de trabalhar da equipe do Explica Aí (`short-form-video\EQUIPE-DE-AGENTES.md`): **a conversa principal é o Produtor**, os especialistas são subagentes, cada etapa é aprovada antes da próxima e a versão mais barata vem primeiro. As regras do ofício estão no `SKILL.md` desta skill.

Agentes em `C:\Users\Usuário\.claude\agents\youtube-*.md`. Se um deles não estiver disponível (sessão aberta antes de os arquivos existirem), faça a etapa você mesmo seguindo o arquivo do agente e diga ao usuário para reiniciar o Claude Code.

## A equipe

| Agente (`subagent_type`) | Trabalho | Escreve | Status |
|---|---|---|---|
| **Produtor** (conversa principal) | Fala com o usuário, roda os scripts de baixar, transcrever e medir, chama os outros, abre cada aprovação e encaminha os ajustes | `lote.md`, `status\produtor.json` | `produtor` |
| **Caçador de Vídeos** (`youtube-cacador`) | Procura vídeos longos em alta nos nichos e confere a permissão de cada um | `1-fonte\candidatos.md`, `1-fonte\fonte.json` | `cacador` |
| **Curador de Momentos** (`youtube-curador`) | Lê o resumo compacto, escolhe e dá nota aos momentos, ajusta início e fim | `3-momentos\momentos.json`, `momentos.md`, folhas de quadros | `curador` |
| **Editor de Cortes** (`youtube-editor`) | Roda `cortar.py`, `finalizar.py` e confere quadros e números | `4-pilotos\`, `5-cortes\` | `editor` |
| **Legendador de Cortes** (`youtube-legendador`) | Corrige as palavras do Whisper, marca destaques e roda `legendar.py` | `legendas\` | `legendador` |
| **Designer de Postagem** (`youtube-postagem`) | Capa, título-gancho, descrição com crédito, hashtags candidatas e ordem de publicação | `6-capas\`, `7-postagem\` | `postagem` |
| **Analista de Tendências** (`tiktok-analista-tendencias`, modo "hashtags") | A mesma do Explica Aí: confere as hashtags de cada `corteN.txt` | tabela de hashtags em cada `corteN.txt` | `analista-tendencias` |

**Um Chrome só:** o Caçador (quando precisa do Chrome) e a Analista nunca rodam juntos, nem junto com um agente de Chrome do TikTok. Antes de chamar um agente de Chrome, confira a extensão (`tabs_context_mcp`).

## O fluxo e as 4 aprovações

```
Caçador de Vídeos → ✋1 FONTE → (Produtor: baixar + transcrever + sinais) → Curador de Momentos → ✋2 MOMENTOS
→ Editor (enquadrar) → Legendador → Editor (piloto) → ✋3 PILOTOS
→ Editor (final) + Designer de Postagem → Analista (hashtags) → ✋4 FINAL → o usuário publica, um corte por dia
```

| Aprovação | O que o usuário recebe | Custo de refazer neste ponto |
|---|---|---|
| ✋1 Fonte | De 3 a 5 vídeos candidatos como `escolhas`: miniatura, canal, visualizações por dia, data, duração, a prova da permissão e uma recomendação | quase nada |
| ✋2 Momentos | Um item por corte: início e fim, frase de gancho, título sugerido, nota de 0 a 10 e por quê, layout e a folha de quadros. Ele pode tirar, juntar ou mudar início e fim | poucos tokens |
| ✋3 Pilotos | Cada corte em 1080x1920 com legenda, tocando na página, com "Marcar este segundo" para pedir ajuste | um render leve (7 s) por corte |
| ✋4 Final | Cortes finais, capas, descrição e hashtags verificadas de cada um, na ordem sugerida de publicação | render final (~25 s) por corte |

Em toda aprovação, o Produtor diz **o que fica travado**, **quanto custa mudar depois** e **o que parece arriscado**. O usuário nunca precisa ler os arquivos longos: a mensagem cabe numa tela e, quando a coisa é visual, vai como imagem ou vídeo.

Nos 3 primeiros lotes, as 4 aprovações são obrigatórias. Do 4º em diante, quando todos os pilotos do ✋3 forem aprovados sem ajuste, o Produtor pode **perguntar** se o usuário quer juntar ✋3 e ✋4 nos próximos lotes. Nunca junte por conta própria.

## Encaminhando ajustes

Refaça o dono do problema e tudo o que vem depois dele, nada antes:

| Ajuste | Vai para |
|---|---|
| "troca o vídeo" (depois do ✋1) | Caçador → tudo de novo |
| "tira / junta / muda o início do corte N" (✋2 ou ✋3) | Curador (só aquele corte) → Editor (enquadrar) → Legendador → Editor (piloto) |
| "o enquadramento tá ruim no segundo X" | Editor (enquadrar, com `layout` trocado no `momentos.json` pelo Produtor) → Legendador → Editor (piloto) |
| "a legenda tá errada / rápida" | Legendador → Editor (piloto) |
| "muda a capa / o título / a descrição" | Designer de Postagem |
| "troca as hashtags" | Designer de Postagem → Analista (hashtags) |

Antes de refazer, diga quem vai trabalhar de novo e quanto custa.

## Pastas

```
D:\Projetos\Quorum\YouTube\
├── ferramentas\                  scripts e .venv-cortes
└── Lote NN - <Canal> - <Tema>\
    ├── lote.md                   fonte, permissão, decisões de cada aprovação, dúvidas, tokens por etapa
    ├── status\                   um JSON por agente (o Quorum lê)
    ├── pedidos\  respostas\      mesmo protocolo do Explica Aí
    ├── 1-fonte\                  busca.json, candidatos.md, fonte.json, miniaturas\
    ├── 2-original\               original.mp4 + info.json (pode ser apagado depois de publicar)
    ├── 3-momentos\               transcricao.json, resumo.md, sinais.json, momentos.json, momentos.md, quadros\
    ├── 4-pilotos\                corte1.mp4… e trabalho\ (enquadrados, palavras, info de cada corte)
    ├── 5-cortes\                 finais prontos para postar
    ├── 6-capas\                  corteN.jpg (9:16) e corteN-3x4.png
    ├── 7-postagem\               corteN.txt e ordem.md
    └── legendas\                 corteN.ass, corteN-palavras.json, correcoes.json, fontes\
```

- **Número:** o maior `Lote NN` + 1, com dois dígitos (`novo_lote.py` faz isso). Nome sem acento. Antes do ✋1 o lote é criado como `Lote NN - A definir - <Nicho>` e é renomeado para `Lote NN - <Canal> - <Tema>` logo depois do ✋1, antes de chamar mais alguém.
- Os agentes conversam por estes arquivos, nunca pela memória da conversa. Toda mensagem de aprovação dá o caminho completo do que abrir.

## Protocolo das aprovações

O mesmo do Explica Aí (`short-form-video\EQUIPE-DE-AGENTES.md` → "The office page"): `<lote>\pedidos\<id>.json` → a página mostra → `<lote>\respostas\<id>.json` → `vigiar.js` avisa pelo Monitor. Campos aceitos: `resumo`, `imagens`, `midia`, `escolhas`, `copiar`, `pastas`, `travado`, `custo`, `riscos`, `textoConfirmar`, `opcoes` (só `aprovar`, `ajustar`, `recusar`).

- ✋1 usa `escolhas` (um cartão por candidato, o recomendado marcado) e `imagens` com as miniaturas.
- ✋2 usa `imagens` com a folha de quadros de cada corte e `resumo` com um item por corte ("Corte 1 · 19:59–20:58 · 59 s · nota 8,5 · Valter pediu desculpa pro rival").
- ✋3 usa `midia` com os pilotos (`4-pilotos/corteN.mp4`).
- ✋4 usa `midia` com os finais, `imagens` com as capas e `copiar` com o texto de cada `corteN.txt`, um bloco por corte (`--- 1/3 · corte1 ---`).

**Até o andar do YouTube existir no Quorum** (parte 4 da especificação), a página só lê as pastas do TikTok. Até lá, escreva o pedido mesmo assim (ele já fica pronto para o Quorum), mostre a aprovação no terminal e, quando o usuário responder, grave `respostas\<id>.json` com `"via": "terminal"`.

## Roteiro do Produtor

**Abrir um lote**

1. Rodar `novo_lote.py "A definir" "<Nicho>"`. Escrever `status\produtor.json` com `etapa: "✋1"`.
2. Se o usuário já trouxe um link, ainda assim o Caçador confere a permissão desse vídeo (modo "conferir") antes do ✋1.

**Ordem das chamadas**

| Passo | Chamada | Como | Depois |
|---|---|---|---|
| 1 | `youtube-cacador` modo "buscar" (ou "conferir" quando o usuário trouxe o link) | primeiro plano | ✋1 fonte |
| 2 | Produtor roda `baixar.py`, `transcrever.py` e `sinais.py`, nessa ordem | Bash em segundo plano (2 a 5 min para 1 h de vídeo); escrever `status\produtor.json` com o que está rodando | — |
| 3 | `youtube-curador` | primeiro plano | ✋2 momentos |
| 4 | `youtube-editor` modo "enquadrar" | primeiro plano | — |
| 5 | `youtube-legendador` | primeiro plano | — |
| 6 | `youtube-editor` modo "piloto" | primeiro plano | ✋3 pilotos |
| 7 | `youtube-editor` modo "final" + `youtube-postagem` | o Editor em segundo plano, a Postagem em primeiro plano (arquivos separados) | — |
| 8 | `tiktok-analista-tendencias` modo "hashtags", passando a pasta do lote | primeiro plano, depois de conferir o Chrome | ✋4 final |
| 9 | — | retrospectiva (`DESEMPENHO-AGENTES.md` da short-form-video, laço 4), publicando as skills no GitHub | "o que a equipe aprendeu" |
| 10 | — | o usuário diz que postou o último corte | encerrar o lote |

**Toda chamada** passa ao agente: o caminho completo do lote, o modo e as decisões ou o retorno do usuário **com as palavras dele**.

**Depois que cada agente volta**

1. Confira o principal você mesmo: abra o JSON que ele gravou e olhe uma folha de quadros. Nunca repasse um relatório sem olhar.
2. Anote a decisão no `lote.md` e atualize `status\produtor.json` (`etapa`, `aguardando`).
3. Toda entrega devolvida (por você ou pelo usuário) entra no log do `DESEMPENHO-AGENTES.md` da short-form-video, com a mesma regra de "falta regra" ou "falha do agente" e a mesma escada de níveis.
4. Mostre a aprovação: o que foi feito, os caminhos, o que fica travado, o custo de mudar depois, os riscos e a pergunta.

**Tokens por etapa:** ao fim de cada aprovação, anote no `lote.md` (seção "Tokens por etapa") os tokens que o Quorum mostra para aquela etapa. No primeiro lote, compare com a tabela "Quanto custa" da especificação.

**Encerrar um lote** (o usuário diz que postou o último corte, ou o Quorum grava `tipo: "lote-postado"`):

1. Todo pedido aberto ganha `respostas\<id>.json` com `"decisao": "aprovar"`, `"motivo": "lote postado"`, `"via": "terminal"`.
2. No `lote.md`: `Postado: DD/MM/AAAA` e a decisão `- AAAA-MM-DD · ✋4 APROVADO · cortes postados pelo usuário`.
3. Todo arquivo de `status\` vira `"estado": "pronto"` com `"fazendo": ""`; `produtor.json` vira `{"estado": "pronto", "etapa": "concluido", "aguardando": "", "fazendo": ""}`.
4. Pergunte se pode apagar `2-original\` (o vídeo baixado ocupa espaço e não é mais necessário).
5. Diga em uma ou duas linhas o que a equipe aprendeu e que o próximo lote começa pelo quadro ou pelo nicho.

**Arquivos de status:** um por agente em `status\`, `{"estado","fazendo","saida","atualizado"}`, com estados `parado | trabalhando | esperando você | pronto | travado` (este com `motivo`). Os caminhos de `saida` são relativos à pasta do lote, com `/`. O arquivo é gravado com uma biblioteca JSON (`json.dumps`), nunca digitado à mão num heredoc.

## Modelos e esforço (19/11/2026)

Os níveis atuais e o log de falhas ficam no `DESEMPENHO-AGENTES.md` da short-form-video, que vale mais que esta tabela se as duas discordarem.

| Agente | Modelo | Esforço | Por quê |
|---|---|---|---|
| Curador de Momentos | opus | high | a escolha dos momentos decide se o corte prende; é o único trabalho de julgamento pesado |
| Designer de Postagem | opus | medium | título e capa decidem o clique (igual ao Designer de Capa) |
| Caçador de Vídeos | sonnet | medium | ler metadados e regras de canal |
| Editor de Cortes | sonnet | medium | rodar scripts e conferir números (igual ao `tiktok-editor`) |
| Legendador de Cortes | sonnet | medium | aplicar regras fixas |
