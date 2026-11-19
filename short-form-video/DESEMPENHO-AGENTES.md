# Desempenho dos agentes — error log and escalation

The user's rule (2026-11-13): the Produtor tracks every agent's mistakes, forever, and raises the model or effort of an agent that keeps getting work sent back. Only ever up: "a gente vai aprendendo com o tempo". The Produtor never lowers a level on its own; only the user can (they did once, on 2026-11-15, to save the Claude **Pro** plan's limit: see the log). The user authorized the Produtor to apply an escalation without asking; announce it in one line at the next gate.

## How the agents learn (user's rule, 2026-11-13)

A subagent starts from zero every time: it does not remember past jobs. It "learns" only through what it reads when it starts: its own file (rules + **Lições aprendidas** at the end), SKILL.md and this log. So learning = the Produtor turning every mistake into a written rule, on its own, without waiting to be asked. Four loops:

1. **On every sent-back delivery** (before rerunning the agent): find the cause, log it below, and write the lesson so the rerun already uses it.
   - A rule about **how this agent works** (process, files, checks) → a dated line in the agent's **Lições aprendidas**: `- 2026-11-20 · Video 02: <rule>. Motivo: <what went wrong>.`
   - A **craft rule** that applies to every video (visual, caption, voice, script style) → SKILL.md in the right section, so every agent and future video gets it.
   - The user's own words go in quotes when they explain the rule.
2. **When the agent proposes one:** every report ends with **Sugestão de aprendizado**. If it is a real gap, add it (same places as above) and say so at the gate. Agents never edit their own files.
3. **When the user says an agent "está errando muito"**: do a review right away.
   1. Read every log row for that agent, plus the gates' feedback in the `episodio.md` of the videos involved.
   2. Group the mistakes by cause and find the pattern (missing rule, rule ignored, task too big for one run, wrong model).
   3. Fix the cause: rewrite the unclear rule, consolidate scattered lessons into one clear rule, split the task, or escalate (ladder below).
   4. Tell the user in a few lines: what was going wrong, what changed, and what to watch on the next video.
4. **Retrospective after every video** (right after ✋7): go through every adjustment the user asked in this video. Each one that was not a change of taste becomes a rule in the right place. Report "o que a equipe aprendeu neste vídeo" in 3–5 lines.
   - **Last step, always (user's rule, 2026-11-18: "subir automaticamente para o GitHub... sempre deixar essas skills atualizadas"):** publish the skills to the repository `ByGustavoo/Claude` (local clone `D:\Projetos\Claude`, public). Run `node "C:\Users\Usuário\.claude\scripts\sincronizar-skills.mjs"`: it copies every skill (`SKILL.md` → `<skill>.md`, other files → `<skill>/`), the `tiktok-*` agents (→ `agentes/tiktok/`) and the global `CLAUDE.md` into the clone, and lists what changed. If it says "Nada mudou", stop there. Otherwise write the commit points in pt-BR, one `- ` line per change, in the style of the previous `CLD-N` commits and with no agent attribution, save them to a file in the scratchpad and run it again with `--publicar <file>`: it numbers the commit `CLD-N` from the history, commits and pushes to `main`. The user authorized this push without asking each time; report the commit number in the retrospective summary. The script refuses to publish when the clone has unrelated changes or a file looks like it holds a secret: then stop and tell the user. When a skill or agent is added or removed, also update the counts and tables in the repository's `README.md` before publishing.

Housekeeping: when an agent has more than 10 lessons, merge them into its main rules and empty the list. A lesson that contradicts a newer user decision is deleted, not kept.

## What counts as a failure

Count one failure for an agent when its delivery has to be redone **because of the agent's own work**:

- the user rejects it at a gate for a quality reason (wrong rule followed, sloppy result, missed instruction);
- the Produtor's own check finds a rule from SKILL.md or the agent's file broken and sends it back;
- the Verificador de Fatos finds a ❌ (wrong fact) in the Roteirista's script, or the Roteirista put a fact without a source;
- the agent stops without finishing for a reason of its own (not an external one).

Do **not** count: the user changing their mind or taste, new information, a request outside the agent's job, Chrome disconnecting, ElevenLabs or any other outside service failing.

## Before escalating: is it a missing rule?

First ask why it failed:

- **The rule did not exist or was unclear** → write the rule (loop 1 above). No escalation; that is cheaper and fixes it for good.
- **The rule existed and the agent broke it, or the work was simply weak** → escalate.

## When to escalate

Escalate one step when either happens:

- **2 failures for the same reason in the same video**, or
- **3 failures in total over the last 2 videos**.

After an escalation the counter starts again from zero for that agent.

## The ladder (one step at a time)

| Step | Model | Effort |
|---|---|---|
| 1 | sonnet | medium |
| 2 | opus | medium |
| 3 | opus | high |
| 4 | opus | xhigh |
| 5 | opus | max |

`xhigh` sits between `high` and `max` and costs less than `max`, so it is tried first. If an agent at step 5 still fails, the problem is in the instructions or the task split: tell the user and propose splitting the job or rewriting the agent.

To escalate: edit `model:` / `effort:` in `C:\Users\Usuário\.claude\agents\tiktok-<agente>.md`, update the table below, add a row to the log, and update the models table in `EQUIPE-DE-AGENTES.md`. For the cuts team, edit `youtube-<agente>.md` and the table in `youtube-cortes\EQUIPE-DE-CORTES.md` instead.

The cuts team (skill `youtube-cortes`, 2026-11-19) uses this same file, the same failure rules and the same ladder. Its rows end with "(cortes)", and its log rows name the lote instead of the video (`Lote 01`).

## Current levels

| Agent | Step | Model | Effort | Failures since last change |
|---|---|---|---|---|
| Roteirista | 3 | opus | high | 1 |
| Verificador de Fatos | 3 | opus | high | 1 |
| Animador | 4 | opus | xhigh | 2 |
| Designer de Capa | 2 | opus | medium | 0 |
| Diretor de Voz | 1 | sonnet | medium | 0 |
| Analista de Tendências | 1 | sonnet | medium | 0 |
| Pesquisador de Referências | 1 | sonnet | medium | 0 |
| Legendador | 1 | sonnet | medium | 0 |
| Editor | 1 | sonnet | medium | 0 |
| Caçador de Vídeos (cortes) | 1 | sonnet | medium | 0 |
| Curador de Momentos (cortes) | 3 | opus | high | 0 |
| Editor de Cortes (cortes) | 1 | sonnet | medium | 0 |
| Legendador de Cortes (cortes) | 1 | sonnet | medium | 0 |
| Designer de Postagem (cortes) | 2 | opus | medium | 0 |

## Log

One row per failure, rule added or escalation. Newest at the bottom.

| Data | Vídeo | Agente | O que aconteceu | Causa | Ação |
|---|---|---|---|---|---|
| 2026-11-13 | — | todos | níveis iniciais definidos | — | tabela acima |
| 2026-11-13 | Video 02 | Editor | regra adicionada (não é falha) | `modelo/` incompleto: faltam index.ts, cenas/, narracao.json, public/. Lição no arquivo do Editor; pendente: tornar o modelo compilável sozinho. |
| 2026-11-13 | Video 02 | Verificador de Fatos | regra adicionada (não é falha) | redação sugerida no dossiê sem fonte virou o único ⚠️ da checagem; lição no arquivo do agente. |
| 2026-11-13 | Video 02 | Roteirista | falha 1 (abertura sem sentido) + regra adicionada | a abertura citou "a número um" sem apresentar a lista; critério abstrato. Regra em SKILL.md §2. Contador: 1. |
| 2026-11-13 | Video 02 | Roteirista/Produtor | regra adicionada (não é falha) | tempo de leitura dos cartões não entrou na estimativa do ✋2; regra em SKILL.md §2. |
| 2026-11-13 | Video 02 | Verificador de Fatos | falha 1 (nome fictício não conferido em redes) + regra | Ofertalume aprovado no ✋5 tinha perfil real no Instagram/Telegram. Contador: 1. |
| 2026-11-13 | Video 02 | Animador | falhas 1–3 (piloto1, achadas pelo Editor) | celular da abertura some no meio da tela (regra §6 de saída); carimbo "Desconto falso!" cobre o gráfico (regra "carimbo nunca cobre"); "Link falso!" ainda em fade no toque (regra 22 quadros). Os stills dele disseram "sem problema conhecido". |
| 2026-11-13 | Video 02 | Animador | **escalado: opus high → opus xhigh** | 3 falhas no mesmo vídeo com regras existentes. Contador zerado. |
| 2026-11-13 | Video 02 | Animador | falhas 1–2 após escalada (piloto 2, usuário) | 1ª mensagem do Zap sem "digitando" (regra existia); contorno do "R$ 899,00" com trecho faltando e marcador ④ fora do alvo (regra "markers measured from the target"). Demais pontos do usuário viraram regras novas (raio do contorno, "·", ícones, barra do Zap, larguras iguais). Contador: 2 (motivos diferentes). |
| 2026-11-15 | — | Designer de Capa, Diretor de Voz | **rebaixados pelo usuário** (plano Pro) | economizar o limite do Claude Pro; Roteirista e Verificador ficam em opus/high, Animador fica em opus/xhigh (escalado por falhas) | Designer de Capa opus high → opus medium; Diretor de Voz opus medium → sonnet medium |
| 2026-11-18 | Video 02 | todos | retrospectiva (não é falha) | 27 sugestões de aprendizado e os ajustes do usuário revisados; 20 já eram regra | 7 regras novas: Designer "conceito" depois do storyboard e Chrome testado antes das hashtags e status com caminhos relativos via biblioteca JSON (EQUIPE); folga do contorno ≥ margem do cartão, zona segura direita como padrão dos componentes, legenda por custo mínimo e tabela de textos pequenos (SKILL). `modelo/` compila sozinho, com `blocosLegenda.ts`, `ContornoAnimado` sem viewBox e `juntar_numeros()`. Lição do Editor sobre o modelo incompleto apagada; lição nova no Animador. Nenhum nível mudou. |
| 2026-11-19 | — | equipe de cortes | níveis iniciais definidos (não é falha) | equipe nova da skill `youtube-cortes` | Curador opus/high (julgamento dos momentos), Designer de Postagem opus/medium (igual ao Designer de Capa), Caçador, Editor e Legendador sonnet/medium (mecânicos, regra da especificação) |
