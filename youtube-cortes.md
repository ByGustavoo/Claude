---
name: youtube-cortes
description: Transforma vídeos longos do YouTube (podcasts, entrevistas, lives) em cortes verticais 9:16 legendados para o TikTok, com a equipe de agentes de cortes (Caçador de Vídeos, Curador de Momentos, Editor de Cortes, Legendador de Cortes, Designer de Postagem) e 4 aprovações. Use sempre que o usuário pedir cortes, clipes ou "melhores momentos" de um vídeo do YouTube, um lote de cortes novo, "acha um podcast bombando pra cortar", conferir se um vídeo pode ser cortado, ajustar um corte, a conta de cortes do TikTok, os scripts de D:\Projetos\Quorum\YouTube\ferramentas ou o andar do YouTube do Quorum. Carregue antes de baixar, transcrever ou cortar qualquer vídeo, porque as regras de direitos, o método de escolha dos momentos e os scripts já testados decidem o custo e a qualidade. Não serve para vídeo animado do Explica Aí (isso é a short-form-video) nem para vídeo de apresentação de produto (project-video).
---

# Cortes do YouTube para o TikTok

## Responsabilidade

Pegar um vídeo longo do YouTube que **pode ser cortado** e entregar de 2 a 6 cortes verticais prontos para postar, cada um com:

- vídeo 1080x1920 no fps da fonte (até 60), H.264 + AAC, -14 LUFS, legenda palavra por palavra queimada e título-gancho na tela;
- capa 9:16 e capa 3:4 (a que o perfil do TikTok mostra);
- `7-postagem\corteN.txt` com título, descrição, crédito à fonte e hashtags verificadas;
- a ordem sugerida de publicação.

Custo-alvo: **~10 mi de tokens para um vídeo de 30 min e ~15 mi para um de 1 h**, contra ~122 mi de um vídeo animado do Explica Aí. Isso só se mantém porque todo trabalho mecânico é script Python rodando no PC; o Claude só decide e confere. O procedimento da equipe está em `EQUIPE-DE-CORTES.md` (leia antes de abrir um lote).

## Decisões do usuário (19/11/2026)

| # | Decisão |
|---|---|
| Conta | Os cortes vão para uma **conta nova só de cortes**, nunca para o @oexplicaai_. O TikTok marca conteúdo não original por conta, e isso não pode pesar sobre as animações originais. |
| Fontes | Canal com **regra pública que libera cortes** (ou programa de clipes) **e** vídeos com licença **Creative Commons**, sempre com a prova guardada. Canal sem regra escrita fica fora, mesmo bombando. |
| Nichos | **Nenhum tema fixo: o critério é o que está sendo mais visto agora**. O usuário ampliou em 19/11/2026: "não é para se prender a um ponto só, a um tema, é para pesquisar o que o pessoal tá mais vendo… de todos os temas". Vale comédia, podcast (Podpah, Flow…), youtubers em alta (Renato Cariani, Bistecone, Gabriel Coxinha…), jogos, fitness e vídeo gringo com áudio dublado em português (MrBeast). O `baixar.py` pega a faixa de áudio em português quando o vídeo tem dublagem. A regra da permissão vale igual para todos. |
| Duração | **60 a 90 s** por corte. Até 45 s só quando o momento é muito forte. O programa de recompensas do TikTok só conta vídeos de 1 min ou mais. |
| Enquadramento | Automático por plano (abaixo), trocável por corte no ✋2. |
| Qualidade | Resolução real da fonte com limpeza leve. Aumento de resolução com IA só como experimento à parte. |
| Legenda | Estilo próprio de cortes (abaixo), diferente do Explica Aí. |
| Aprovações | As 4 nos 3 primeiros lotes. Do 4º em diante, o Produtor pode oferecer juntar ✋3 e ✋4 quando os pilotos saírem bons de primeira, mas só junta com o "sim" do usuário. |
| Ritmo | 1 lote por semana, 1 corte por dia. |

## Limites que não mudam

- **Direitos.** Vídeo sem permissão não entra no lote. A prova (link da regra do canal, licença ou autorização) fica em `1-fonte\fonte.json` e no `lote.md`. Todo corte leva crédito à fonte na descrição.
  - **Licença marcada por quem não é dono não vale.** Reupload com "Creative Commons" existe (Video de teste, 19/11/2026: um canal "Multishow" com 863 inscritos). Confira se o canal é o dono do conteúdo: verificado, número de inscritos coerente e o mesmo nome do programa. Na dúvida, fica fora.
  - Vídeo que é corte de outro programa (por exemplo, "melhores momentos" de outro podcast no canal de um convidado) só entra com a permissão de quem gravou o programa.
- **Download só com `yt-dlp` comum.** Nada de cookies da conta do usuário, plugins de PO token, imitar navegador ou contornar verificação de robô. Se o YouTube bloquear (`bloqueio` nos JSON de erro dos scripts), pare e avise.
- **O Claude não assiste vídeo nem ouve áudio.** "Assistir" é ler o resumo compacto, a transcrição com tempos, os sinais (energia, reações, comentários com tempo, mais repetidos, capítulos) e poucos quadros. Se o corte ficou bom de ver e ouvir, quem decide é o usuário, no piloto.
- **Um Chrome só.** Agente que usa o Chrome roda sozinho, nunca junto com outro agente de Chrome (nem com os do TikTok).
- **Só leitura nas plataformas.** Nada de curtir, seguir, comentar ou postar.
- **Tokens.** Baixar, transcrever, medir, cortar, legendar, renderizar e fazer capa são scripts. Nenhum agente lê o vídeo inteiro nem a transcrição inteira: só o resumo compacto e os trechos candidatos.

## Ferramentas

Tudo em `D:\Projetos\Quorum\YouTube\ferramentas\`, com o Python do `.venv-cortes` (torch 2.11 + CUDA, Whisper, `yt-dlp[default]`, OpenCV 5.1 com YuNet, Pillow). O ffmpeg 9 completo vem do winget (`Gyan.FFmpeg`); o `comum.py` acha ele sozinho. Fonte da legenda e da capa: Anton (OFL) em `fontes\`.

Chamada (Git Bash):

```bash
PY="D:/Projetos/Quorum/YouTube/ferramentas/.venv-cortes/Scripts/python.exe"
F="D:/Projetos/Quorum/YouTube/ferramentas"
"$PY" "$F/transcrever.py" "Lote 01 - Canal - Tema"
```

O lote pode ser o nome da pasta (procurado em `D:\Projetos\Quorum\YouTube\`, ou em `QUORUM_RAIZ_YOUTUBE` para testes) ou o caminho completo. Cada script grava um JSON com o resultado e os segundos de cada etapa: leia os números, nunca o vídeo.

| Script | Faz | Grava | Tempo medido* |
|---|---|---|---|
| `novo_lote.py "<Canal>" "<Tema>"` | Cria `Lote NN - Canal - Tema` com as subpastas e o `lote.md` | a pasta | <1 s |
| `buscar.py <lote> --busca "termo" [--cc] [--canal URL] [--url URL]` | Busca e lê metadados: visualizações por dia, licença, canal verificado, inscritos, capítulos, `heatmap`, trechos da descrição do vídeo **e do canal** que falam de cortes, miniatura | `1-fonte\busca.json`, `1-fonte\miniaturas\` | 8 a 20 s |
| `baixar.py <lote> <url>` | Melhor qualidade até 4K (vídeo + áudio juntos), metadados e até 400 comentários | `2-original\original.mp4`, `info.json` | 36 s (288 MB) |
| `transcrever.py <lote>` | Whisper `large-v3-turbo` na GPU, tempo por palavra, segunda passada nos buracos com fala, resumo compacto | `3-momentos\transcricao.json`, `transcricao.txt`, `resumo.md` | 85 s (22x o tempo real) |
| `sinais.py <lote> [--sem-cenas]` | Energia por bloco, 20 maiores picos, possíveis risadas, cortes de câmera, comentários com tempo; refaz o resumo | `3-momentos\sinais.json` | 31 s (28 s são os cortes de câmera) |
| `quadros.py <lote> [tempos] [--corte N] [--todos]` | Quadros nos tempos pedidos (ou início/meio/fim de cada corte) e folha de contato | `3-momentos\quadros\` | 5 s |
| `cortar.py <lote> [--cortes 1,2]` | Encaixa início/fim em frases e pausas, acha rostos por plano e enquadra em 9:16 | `4-pilotos\trabalho\corteN-*`, `4-pilotos\cortar.json` | ~40 s por corte |
| `legendar.py <lote> [--recomecar]` | Legenda `.ass` palavra por palavra + título-gancho | `legendas\corteN.ass`, `corteN-blocos.txt`, `legendar.json` | <1 s |
| `finalizar.py <lote> --modo piloto` | Legenda queimada, loudnorm de 1 passada, render rápido | `4-pilotos\corteN.mp4`, `pilotos.json` | 7 s por corte |
| `finalizar.py <lote> --modo final` | Limpeza leve do som (highpass + afftdn) e da imagem (hqdn3d + unsharp), loudnorm de 2 passadas a -14 LUFS / -1,5 dBTP, H.264 crf 17 bt709 | `5-cortes\corteN.mp4`, `finais.json` | 24 s por corte |
| `capa.py <lote> [--tempo mm:ss] [--titulo "..."]` | Capa a partir de um quadro do corte já enquadrado, com o título | `6-capas\corteN.jpg`, `corteN-3x4.png`, `capas.json` | 1 s por corte |

\* Vídeo de 27 min, 1080p30, cortes de ~55 s, RTX 5060 Ti (19/11/2026). O lote inteiro de 2 cortes rodou em ~5 min de máquina.

### `momentos.json` (o contrato entre o Curador e os scripts)

```json
{
  "fonte": {"id": "l2DW4nmbWYg", "canal": "Sexto Round"},
  "cortes": [
    {"n": 1, "inicio": 1199.6, "fim": 1258.3, "nota": 8.5,
     "notas": {"gancho": 9, "historia": 8, "pico": 9, "publico": 9, "duracao": 8, "fecho": 8},
     "gancho": "Isso não te preocupa, Walter?", "porque": "...",
     "titulo": "Ele pediu *desculpa* pro rival", "titulo_tela": "Valter pediu *desculpa* pro rival",
     "titulo_capa": "...", "capa_tempo": "20:47",
     "layout": "auto", "destaques": ["desculpa", "Robocop"], "aprovado": true}
  ]
}
```

- Tempos em segundos do vídeo original (`capa_tempo` aceita `mm:ss`). `*palavra*` nos títulos fica amarela.
- `layout`: `auto` (padrão), `rosto`, `dividida`, `desfocado` ou `jogo`. `aprovado: false` tira o corte sem apagar.
- Os scripts processam só os aprovados, ou os de `--cortes`.

## Como achar as melhores partes (Curador)

1. Ler o `resumo.md`. Ele traz blocos de 30 s com a transcrição, a energia do áudio, o gráfico de mais repetidos (`rep`, quando o YouTube tem), os comentários que citam o tempo (`com`), os cortes de câmera e ★ nos blocos com sinal forte. No topo ficam os capítulos, os picos de mais repetidos, os comentários com tempo mais curtidos e as possíveis risadas. Para 27 min, ele tem ~30 KB (~9 mil tokens).
2. Marcar os candidatos: blocos com ★, comentários com tempo (o sinal mais confiável quando não há `heatmap`), mudança de assunto pelos capítulos, perguntas diretas do entrevistador e respostas com número, revelação, opinião forte ou humor.
3. Só nos candidatos, ler as palavras com tempo em `transcricao.json` (filtrar pelo intervalo, nunca abrir o arquivo inteiro) e rodar `quadros.py --corte N` para ver 3 quadros.
4. Dar nota de 0 a 10 em seis critérios e a média como nota final:
   - **gancho:** a primeira frase prende sem contexto. Melhor ainda se for uma pergunta, um número ou uma frase de impacto;
   - **história:** começa e termina dentro do corte, sem "como eu falei antes" nem "ele" sem saber quem é;
   - **pico:** número surpreendente, opinião forte, revelação, humor, discussão;
   - **público:** mais repetidos, comentários com tempo, reações;
   - **duração:** 60 a 90 s (45 a 60 s só com nota de pico 9 ou mais);
   - **fecho:** termina numa frase de impacto ou risada, nunca no meio de uma ideia.
5. **Só entram no ✋2 os candidatos com nota 7 ou mais.** O teto é de 2 ou 3 cortes por 30 min e de 5 ou 6 por hora. Se só houver 2 bons, saem 2.
6. Escolher início e fim no começo de uma frase e no fim de outra. O `cortar.py` encaixa no começo/fim do trecho do Whisper mais próximo (até 1 s), depois na palavra cujo meio está dentro do corte, com 0,15 s de margem antes e 0,45 s depois, sem passar do meio da pausa vizinha.

## Enquadramento (`cortar.py`)

O trecho é dividido em planos pelos cortes de câmera (planos de menos de 0,5 s se juntam ao vizinho). Em cada plano, o YuNet procura rostos 4 vezes por segundo:

- **1 rosto** → **rosto em destaque:** recorte 9:16 centrado no rosto, com o rosto a 40% do topo e zoom de até 1,35x quando o rosto é pequeno;
- **2 rostos afastados** → **tela dividida:** um em cima e outro embaixo (o da esquerda em cima), cada um centrado;
- **2 rostos juntos** → rosto em destaque no meio dos dois;
- **1 rosto pequeno (menos de 18% da altura) num canto** → **jogo:** a facecam em cima (1080x700) e o gameplay embaixo (1080x1220, recorte do centro, ou do lado oposto quando a facecam está perto do meio). Formato padrão dos cortes de jogo, criado em 19/11/2026 quando o usuário incluiu vídeos de jogo nos nichos;
- **nenhum rosto ou 3 ou mais** (videochamada, plateia, tela) → **fundo desfocado:** o quadro inteiro na largura, um pouco acima do centro, sobre ele mesmo ampliado, desfocado e escurecido.

Rostos com confiança abaixo de 0,75 ou com menos de 5% da altura são ignorados. Rosto em destaque com centro parecido com o do plano anterior não se mexe, para não tremer.

## Legenda (estilo dos cortes)

- Fonte Anton, maiúsculas, 120 px, contorno preto de 8 px e sombra.
- Blocos de 2 ou 3 palavras (até 16 caracteres), agrupados por menor custo:
  - um bloco nunca atravessa uma pausa de 0,7 s;
  - a quebra prefere pontuação e pausa;
  - palavra curta ("de", "que", "não", "te"…) não fica pendurada no fim do bloco;
  - os pares de `PARES` ("às vezes", "por isso", "tá ligado", "meu irmão"…) nunca se separam.
- A palavra falada fica amarela (`#FFE14D`) e 8% maior. As palavras de destaque ficam verdes (`#3CE87A`).
- Posição por plano: na emenda da tela dividida (y = 960) e do layout jogo (y = 700), e embaixo nos outros layouts (base a 460 px do fim, acima da interface do TikTok). Sempre entre x≈60 e x≈940, que é a zona segura à direita, igual à do Explica Aí.
- Título-gancho (`titulo_tela`) no topo durante o corte inteiro, numa caixa escura de Anton 78 px, a 220 px do topo.
- **Correções do Legendador:**
  - `legendas\corteN-palavras.json` é a cópia editável das palavras do Whisper: corrigir o texto (`p`), juntar ou separar palavras e marcar `"destaque": true`;
  - `legendas\correcoes.json` vale para o lote inteiro: `{"substituir": {"walter": "Valter"}, "destaques": ["desculpa"], "pares": ["bruno diferente"]}`;
  - depois, rodar `legendar.py` e ler `corteN-blocos.txt` e o `legendar.json` (blocos de uma palavra, palavras pouco confiáveis);
  - `--recomecar` descarta as correções.

## Capa e postagem

- **Capa:**
  - quadro do corte já enquadrado (`capa_tempo`), parte de baixo escurecida e título em Anton branco com `*palavra*` amarela, equilibrado em até 3 linhas, entre x 70 e x 930;
  - quando o quadro é de tela dividida ou do layout jogo, o título vai para a emenda, para não cobrir rosto;
  - o texto fica dentro da faixa y 240–1680, que é o recorte 3:4 que o perfil mostra; a `corteN-3x4.png` é esse recorte.
- **Escolha do quadro:** expressão forte, boca fechada ou no meio de uma palavra aberta, olhos abertos e nada de borrão de movimento. Ver com `quadros.py` antes.
- **`7-postagem\corteN.txt`**, pronto para colar:
  1. título-gancho (a primeira linha aparece antes do "mais");
  2. uma ou duas linhas de contexto com as palavras que as pessoas buscam;
  3. crédito: `🎙️ Trecho de "<nome do episódio>" - <canal> (@<arroba>). Assista completo no YouTube.`;
  4. "Parte N de M" quando os cortes forem uma sequência;
  5. chamada para o próximo corte;
  6. de 3 a 5 hashtags **verificadas pela Analista de Tendências** (sem `#fyp`/`#viral`).
- **Ordem de publicação** em `7-postagem\ordem.md`: o corte de nota mais alta primeiro, um por dia.
- **Conta nova:** o nome é decisão do usuário. A regra do Explica Aí vale aqui também: "Clips"/"cortes" no nome sinaliza conteúdo reutilizado e derruba o alcance.

## Regras da plataforma (conferido em 19/11/2026)

- O TikTok chama de não original o conteúdo "reaproveitado sem edição criativa". Esse conteúdo pode sair do Para Você e não participa do programa de recompensas, que também exige vídeos de 1 min ou mais. Título-gancho, legenda própria, enquadramento e contexto na descrição são a nossa edição criativa, mas não garantem nada. Confira a regra na Creator Academy a cada mês e diga ao usuário quando mudar.
- O `yt-dlp` precisa de um programa de JavaScript para o YouTube: usamos o Node (`js_runtimes: {'node': {}}` no `comum.py`).

## Armadilhas

- **`extractor_args youtube lang=pt` estraga números e licença:** "413 mil" vira 413 e a licença vem `None`. Sem ele, o título já vem no original. O cabeçalho `Accept-Language: pt-BR` não atrapalha.
- **O filtro de Creative Commons da busca do YouTube não é confiável:** traz vídeos sem a licença. Confira o campo `licenca` de cada um (`creative_commons: true` no `busca.json`).
- **Vídeos recentes quase nunca têm `heatmap`** (os 3 de teste não tinham). Os comentários com tempo viram o principal sinal do público.
- **O Whisper pula janelas inteiras em vídeo longo** (Video de teste: 30 s sem nenhuma palavra em 20:05). O `transcrever.py` refaz cada buraco de mais de 6 s em que o áudio tem fala, começando no trecho anterior (que costuma vir errado também), e registra em `lacunas_refeitas`.
- **Áudio de podcast é muito comprimido:** a mediana fica a ~3 dB do p97. Por isso os limites de pico do `sinais.py` são percentis, não "mediana + N dB".
- **O Whisper erra nomes próprios** ("Walter" por "Valter"). O Legendador corrige pela descrição do vídeo, pelos capítulos e pelo título.
- Os `.ass` são lidos com `cwd` na pasta do lote (caminhos relativos), porque o filtro `ass` do ffmpeg não aceita bem `D:` com espaços. A fonte é copiada para `legendas\fontes\`.
- O piloto usa loudnorm de 1 passada (fica entre -13,5 e -15 LUFS). Só o final garante -14,0.
