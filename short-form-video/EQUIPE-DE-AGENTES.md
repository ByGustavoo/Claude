# Equipe de agentes — how the user wants videos produced

The user designed this on 2026-11-13. Read it whenever you start a new episode, resume one, or receive feedback on one. It is the procedure; SKILL.md holds the craft rules each step uses.

Status: **agents implemented on 2026-11-13** in `C:\Users\Usuário\.claude\agents\tiktok-*.md` (9 specialists). The office page does not exist yet. **You, the main conversation, are the Produtor**: follow "Produtor playbook" below. If an agent is not available (session started before the files existed), do that step yourself following the agent's file, and tell the user to restart Claude Code.

## Why it works this way

The user said it plainly: "não faz sentido eu ver o vídeo só no final". Redoing work late wastes tokens, ElevenLabs credits and CPU. So:

- **Every stage is approved by the user before the next one starts.**
- The cheapest version of each thing is shown first: a topic before a script, a script before a voice, a storyboard before animation, a Full HD pilot before 4K.
- Feedback goes back only to the agent that owns the problem and to the ones downstream of it.

## The 10 agents

| # | Agent (`subagent_type`) | Job | Writes |
|---|---|---|---|
| 1 | **Produtor** (main session) | The main Claude Code conversation, **not a subagent**: subagents run alone and only return at the end, so they cannot stop to ask the user anything. Talks to the user, dispatches the others, shows each gate, routes feedback. | `episodio.md`, `status\produtor.json` |
| 2 | **Analista de Tendências** (`tiktok-analista-tendencias`) | **Start:** opens TikTok Studio in Chrome (the user's logged-in session), filters to **Brasil**, lists the topics with the most views and picks the ones that fit the channel (dinheiro, golpes, curiosidades, "E se você…"). TikTok Creative Center (trends by country) is the fallback/complement. **End:** verifies every hashtag of the post (SKILL.md §12) and reports its count. | `tendencias.md`, hashtag table |
| 3 | **Pesquisador de Referências** (`tiktok-pesquisador`) | With the chosen topic, finds similar videos on TikTok in Chrome. Saves URL, views, likes, shares, duration, ASR transcript and why each one worked or not (SKILL.md §1). | `referencias.md` |
| 4 | **Roteirista** (`tiktok-roteirista`) | Script of 1:05–1:20 (ceiling 1:30), hook in the first sentence, split into scenes, highlight words marked (SKILL.md §2). | `projeto\roteiro.json`, `2-roteiro\roteiro.md` |
| 5 | **Verificador de Fatos** (`tiktok-verificador`) | **"dossie":** right after ✋1, researches the theme on reliable internet sources (official bodies, major news outlets, fact-checkers) so the script starts from verified facts. **"checar":** checks every number and claim of the script, re-opening the sources, and sends errors back to the Roteirista. Never trusts the model's memory alone: every fact needs a link and a date, numbers need two sources. The author never checks their own script. | `1-pesquisa\dossie.md`, `2-roteiro\checagem.md` |
| 6 | **Diretor de Voz** (`tiktok-diretor-voz`) | Writes `TEXTOS-ELEVENLABS.txt` with Eleven v4 audio tags and the voice recommendation (SKILL.md §3). When the MP3s arrive, checks each block. | `TEXTOS-ELEVENLABS.txt`, `narracao.json` |
| 7 | **Legendador** (`tiktok-legendador`) | Word-by-word captions on the narration timing (SKILL.md §7). | caption data |
| 8 | **Animador** (`tiktok-animador`) | **First a storyboard** (what is on screen in each scene, which elements, which words trigger what), written while the user generates the voice. After approval, the scenes (SKILL.md §5–6). | `storyboard.md`, scenes |
| 9 | **Editor** (`tiktok-editor`) | Scaffolds `projeto\` from `modelo/`, then soundtrack, Full HD pilot, then the 4K 60 fps final with loudnorm (SKILL.md §8–11). | `4-pilotos\`, `5-video\` |
| 10 | **Designer de Capa** (`tiktok-designer-capa`) | Cover concept at ✋5, the 3:4 4K cover after the pilot, post description; hashtags go through Analista de Tendências for verification (SKILL.md §12). | `6-capa\`, `7-postagem\postagem.txt` |

Constraints:

- **One Chrome.** Analista de Tendências and Pesquisador de Referências both drive Claude in Chrome, so they run one after the other, never in parallel.
  - Before dispatching a Chrome agent, the Produtor checks the extension itself (`tabs_context_mcp`); if it is disconnected, ask the user to reconnect first (Video 02: the hashtag check started with Chrome off and returned nothing). The extension disconnects often: say so once and offer to reconnect, never fail silently.
- **Claude cannot hear audio.** The voice is checked by transcription (Whisper vs. script), duration and loudness numbers. Whether it *sounds* good is the user's call, so the voice gate always asks them to listen.
- The Animador depends on the narration timing, so scenes can't start before the voice. Only the storyboard can.

## The flow and the 7 gates

```
Analista de Tendências → ✋1 TEMA → Pesquisador de Referências + Verificador de Fatos (dossiê) → Roteirista ⇄ Verificador de Fatos (checagem) → ✋2 ROTEIRO
→ Diretor de Voz → ✋3 TEXTO DA VOZ → (user generates in ElevenLabs; Animador writes the storyboard meanwhile)
→ ✋4 VOZ → ✋5 STORYBOARD + CONCEITO DA CAPA → Legendador + Animador → Editor (pilot) → ✋6 PILOTO
→ Editor (4K) + Capa (render, postagem) → Analista de Tendências (hashtags) → ✋7 FINAL → the user posts
```

| Gate | What the user receives | Cost of redoing at this point |
|---|---|---|
| ✋1 Tema | Trending topics in Brazil that fit the channel, plus the reference videos, with a recommendation | almost nothing |
| ✋2 Roteiro | Fact-checked script with sources and the estimated duration (≈2.5 words/s) | a few tokens |
| ✋3 Texto da voz | The tagged blocks to paste in ElevenLabs, the recommended voice and settings | nothing, nothing generated yet |
| ✋4 Voz | Per block: words missing or misread, numbers read wrong, duration. The user listens | credits for the bad block only |
| ✋5 Storyboard + capa | Scene-by-scene description and the cover concept (title options, key visual). The cover itself is rendered after the pilot, because it is built from the video's own elements | a few tokens |
| ✋6 Piloto | Full HD 30 fps pilot, opened for them; they cite times ("no segundo 19") | a light render |
| ✋7 Final | 4K 60 fps master, cover, description and verified hashtags | a heavy render, which is why it is last |

At **every** gate the Produtor states, before asking for approval:

1. **What gets locked** once approved. Example: approving the script locks the words that drive animations ("200", "devolve").
2. **What changing it later would cost.** Example: "mudar uma frase depois da voz = gerar de novo só o bloco 3 no ElevenLabs e re-sincronizar".
3. **What looks risky** and is worth checking now (a doubtful fact, a block that runs long, a word the voice may mispronounce).

**The user never has to read the agents' files to approve** (user's rule, 2026-11-13, Video 02: "são arquivos de 400, 500 linhas… para ficar vendo isso, lendo linha por linha, é complicado. A gente tem que pensar em uma forma melhor de aprovar"). The long `.md` files (dossiê, storyboard, conceito, checagem) are for the agents. What the user sees at a gate must fit in one screen and be visual whenever the thing is visual:

- the gate message in chat stays self-contained (decisions, recommendation, locked/cost/risk), never "abra o arquivo X para ver";
- ✋5 storyboard: one image, not text — a contact sheet with a quick sketch/still of each scene's key moment and a one-line caption under each, opened for the user (`cmd //c start`);
- ✋5 cover concept: a rough mockup image of the recommended cover, not a description;
- until the office page exists, these images are the "mesa de aprovação"; the office page (planned) should show them with approve/adjust buttons.

Never skip a gate, never merge two gates on your own, and never start the next stage before an explicit approval. If the user approves with changes, apply them and show only the changed part again.

## Routing feedback

Redo the owner of the problem and everything downstream of it, nothing upstream:

| Feedback | Goes to |
|---|---|
| "muda o texto" (after the voice) | Roteirista → Verificador de Fatos → Diretor de Voz (only affected blocks) → Legendador → Animador (re-time) → Editor |
| "a voz ficou ruim no bloco X" | Diretor de Voz (that block only) → Legendador → Editor |
| "essa cena tá feia" | Animador → Editor |
| "a legenda tá rápida / errada" | Legendador → Editor |
| "muda a capa" / "muda a descrição" | Designer de Capa only |
| "troca as hashtags" | Designer de Capa → Analista de Tendências (verify) |

Before rerunning, tell the user which agents will redo work and what it costs (credits, render time).

## Folders (user's rule, 2026-11-13)

Everything lives on drive **D:**, one folder per video, numbered in posting order. Never put a new video under `C:\Users\Usuário\Videos` again.

```
D:\Projetos\TikTok\
├── Video 01 - Golpes do Pix\
├── Video 02 - Black Friday\
└── Video NN - <Tema>\
    ├── episodio.md          topic, decisions at each gate, open questions
    ├── status\              one JSON per agent (produtor.json, roteirista.json…): the office page reads them
    ├── 1-pesquisa\          tendencias.md, referencias.md
    ├── 2-roteiro\           roteiro.md (with sources), storyboard.md
    ├── 3-voz\               TEXTOS-ELEVENLABS.txt + the MP3s the user downloads
    ├── 4-pilotos\           Full HD pilots (piloto1.mp4, piloto2.mp4…)
    ├── 5-video\             the final 4K 60 fps video, ready to post
    ├── 6-capa\              the 3:4 4K cover
    ├── 7-postagem\          postagem.txt: description + verified hashtags
    └── projeto\             the Remotion code (package.json, src, public, scripts, node_modules, .venv)
```

Rules:

- **Number:** the next video takes the highest existing number + 1, two digits (`Video 03`). The theme is short, in Title Case, **without accents** (`Video 04 - Saque de 49 Mil`). Accents in paths already caused trouble (`Usuário`).
- **Subfolders are numbered** in production order, so they sort in the order the user follows them.
- **Nothing the user needs stays inside `projeto\` or `out\`.** Renders, covers and post texts are written straight to their numbered folder. `projeto\out\` is only for scratch work (stills, contact sheets, temp audio) and can be deleted.
- **Scaffolding a new video:** copy `modelo/` into `projeto\`, then point the paths to the numbered folders before the first use: `montar_voz_externa.py` reads the MP3s from `..\3-voz`, renders go to `..\4-pilotos` and `..\5-video`, the cover to `..\6-capa`.
- Agents talk through these files, never through memory of the conversation. Every gate message gives the **full path** of what the user must open.
- **Video 01 - Golpes do Pix** was moved here from `C:\Users\Usuário\Videos\tiktok-golpes-pix` on 2026-11-13. Its `projeto\` is the reference project. `.venv` (imageio-ffmpeg) and `.venv-voz` (torch, Whisper, Chatterbox) were copied as they were and still work: on Windows a venv survives a move when called as `.venv\Scripts\python.exe` (only the `.exe` entry points like `pip.exe` break). **Whisper lives in `.venv-voz`**, so run `montar_voz_externa.py` with it.
- **Channel-level files** (profile photos, logo tests) go to `D:\Projetos\TikTok\Canal\`, not inside a video.

## ElevenLabs plan and the user's manual step

- **Current plan: Free.** Keep it until the user says to switch (they plan to move to Starter later). Never assume a paid plan, never try the API for library voices.
- So the voice is generated **by the user on the website**, and the Diretor de Voz must hand them a step-by-step they can follow without thinking. At the ✋3 gate, send:
  1. the file to open, with the full path: `D:\Projetos\TikTok\Video NN - <Tema>\3-voz\TEXTOS-ELEVENLABS.txt`;
  2. the voice to pick and the settings (model Eleven v4, stability…);
  3. for each block, in order: "copie o bloco 1/8, cole no ElevenLabs, gere, ouça, baixe";
  4. **the exact file name** for each download (`abertura.mp3`, `golpe5.mp3`…) and **the exact folder** to save it: `…\3-voz\`;
  5. the estimated credits for the whole text;
  6. "me avise quando terminar".
- When they say it's done, check that every expected file is there (accept `abertura.mp3.mp3`), list any missing or misnamed ones, then run the voice check of gate ✋4.
- **When the user switches to Starter:** update this section, then test the API with library voices on the first video. If it works, the Diretor de Voz generates the blocks itself and the user only listens at ✋4.

## The office page (planned)

**Full build spec: `C:\Users\Usuário\Downloads\ESCRITORIO-DOS-AGENTES.md` (2026-11-15).** Decided by the user: cartoon flat style (C), page + terminal (the Produtor writes `pedidos\<id>.json` per gate and watches `respostas\` with Monitor), plan Pro, extras: Windows notification, sounds, bookshelf of videos, lessons board. The summary below is the original idea.

A local web page drawn as an office:

- each agent is a character at its own desk, with a speech bubble saying what it is doing ("procurando vídeos de golpe…") and a state color;
- clicking an agent shows what it produced;
- a **mesa de aprovação** highlights whatever is waiting for the user, with "aprovar" and "pedir ajuste";
- a meeting room shows the pilot/final, the cover and the script;
- when feedback is routed, the Produtor character walks to the owner's desk.

Build it in two steps: first it only **shows** the files in `status\`; then it **sends** approvals and adjustments to the Produtor. Load `elite-web-experience` before building it (user's global rule).

## Produtor playbook

You are the Produtor. Specialists are called with the Agent tool (`subagent_type: "tiktok-…"`). They cannot ask the user anything, so every decision passes through you.

**Opening an episode**

1. Next number = highest `Video NN` in `D:\Projetos\TikTok\` + 1. Create `Video NN - Novo\` with the 7 numbered folders, `status\` and `episodio.md`. Rename it to the theme right after ✋1, before dispatching anyone else.
2. If the user already brings a theme or reference links, still offer the trends step in one line; skip it if they say so.

**Dispatch order**

| Step | Call | How | Then |
|---|---|---|---|
| 1 | `tiktok-analista-tendencias`, mode "tendencias" | foreground | ✋1 tema |
| 2 | `tiktok-editor` "preparar" + `tiktok-verificador` "dossie" + `tiktok-pesquisador` | all three in parallel (editor and verificador in background; only the pesquisador uses Chrome) | — |
| 3 | `tiktok-roteirista` → `tiktok-verificador` "checar" | foreground; if the check has ⚠️/❌, roteirista again with `checagem.md`, then verificador again (2 rounds max, then show the user) | ✋2 roteiro |
| 4 | `tiktok-diretor-voz` "preparar" | foreground | ✋3: paste the step-by-step for the user |
| 5 | `tiktok-animador` "storyboard" + `tiktok-designer-capa` "conceito" | background, while the user generates the voice | — |
| 6 | `tiktok-diretor-voz` "conferir" | when the user says the MP3s are saved | ✋4 voz |
| 7 | — | show storyboard + cover concept | ✋5 |
| 8 | `tiktok-animador` "cenas" + `tiktok-legendador` | parallel (separate files) | — |
| 9 | `tiktok-editor` "piloto" | background render | ✋6 piloto |
| 10 | `tiktok-editor` "final" + `tiktok-designer-capa` "capa" then "postagem" | editor in background | — |
| 11 | `tiktok-analista-tendencias` "hashtags" | foreground | ✋7 final |
| 12 | — | retrospective (`DESEMPENHO-AGENTES.md`, loop 4): every adjustment of this video becomes a rule | report "o que a equipe aprendeu" |

**When the user brings a ready script** (e.g. `C:\Users\Usuário\Downloads\Explica Ai - roteiros dos proximos 6 videos.txt`, six scripts written on 2026-11-13 from the analysis of 19 reference videos, never reviewed by the team):

| Step | Call | Then |
|---|---|---|
| 1 | `tiktok-analista-tendencias` "tendencias" with the user's themes: rank them by current interest and date | ✋1: which video now (date-bound themes first) |
| 2 | `tiktok-editor` "preparar" + `tiktok-verificador` "dossie" | parallel, background. Skip `tiktok-pesquisador`: the 19-video analysis already covers references, unless the user sends new links |
| 3 | `tiktok-roteirista` "revisar" → `tiktok-verificador` "checar" | ✋2 shows `roteiro.md` **and** `mudancas.md` (original vs. proposed, per scene) |
| 4+ | same as the normal flow from step 4 | |

The script is a strong draft, not approved text: the user said the team may change anything that improves it, but every change is shown and approved at ✋2.

**Every call** gives the agent: the episode folder's full path, the mode, and the user's relevant decisions or feedback **verbatim**. Never two Chrome agents at once.

**After every agent returns**

1. Check its key claims yourself (open the file it wrote, look at a sheet of frames): don't relay a report blindly.
2. Append the decision to `episodio.md` and update `status\produtor.json` (`etapa`, `aguardando`: what the user must do).
   - Whenever a delivery is sent back (by you or by the user), log it in `DESEMPENHO-AGENTES.md`, decide "missing rule" vs. "agent failure", and escalate when the threshold is reached. Say it in one line at the next gate ("O Roteirista errou o mesmo ponto 2 vezes: passei ele para Opus com esforço xhigh").
3. Show the gate: what was done, full paths to open, **what gets locked**, **what changing later costs**, **what looks risky**, and the question "aprova ou quer ajustar?".

**Status files:** one per agent in `status\` (`{"estado","fazendo","saida","atualizado"}`, states `parado | trabalhando | esperando você | pronto`). One file per agent, so agents running in parallel never overwrite each other.

**Agent files:** `C:\Users\Usuário\.claude\agents\tiktok-*.md`. Each one points to the SKILL.md sections it owns instead of copying them, so rules live in one place: change a rule here or in SKILL.md, not in the agents. Only Analista de Tendências and Pesquisador de Referências have Chrome. None of them can spawn other agents.

**Models and effort (decided 2026-11-13).** Use the aliases `opus` / `sonnet`, never a pinned version, so each agent always runs the newest model of its family (Opus 5.5 / Sonnet 5.5 today). Heavy reasoning goes only where quality decides the video:

| Agent | Model | Effort | Why |
|---|---|---|---|
| Roteirista | opus | high | the script decides whether people watch |
| Verificador de Fatos | opus | high | a wrong fact kills the channel's trust |
| Animador | opus | xhigh | the hardest code and the most visual rules |
| Designer de Capa | opus | medium | the cover decides the click (lowered from high on 2026-11-15, plan Pro) |
| Diretor de Voz | sonnet | medium | tags follow written rules; a short, bounded job (lowered from opus on 2026-11-15, plan Pro) |
| Analista de Tendências | sonnet | medium | reading and summarizing pages |
| Pesquisador de Referências | sonnet | medium | collecting data in Chrome |
| Legendador | sonnet | medium | applying fixed rules |
| Editor | sonnet | medium | running renders and checking specs |

`max` effort is not used at the start: it costs far more and rarely beats `high`. **Agents that keep failing are escalated** one step at a time (sonnet → opus, medium → high → xhigh → max), following `DESEMPENHO-AGENTES.md`, which also holds the current level of each agent and the error log. That file wins over this table if they differ. The Produtor (main session) runs whatever model and effort the user set in Claude Code.
