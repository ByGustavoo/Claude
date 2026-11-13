---
name: short-form-video
description: Plan, script, narrate and render vertical short-form content videos (TikTok, Instagram Reels, YouTube Shorts, Kwai) as original 2D motion graphics with Remotion — explainer, countdown, "golpes", curiosidades, dinheiro, tecnologia — for the user's channel "Explica Aí" (@oexplicaai_). Use whenever the user asks for a vídeo pro TikTok/Reels/Shorts, vídeo vertical, vídeo narrado, vídeo com legenda, "um vídeo igual a esse" from a social link, a new episode for the channel, or to review/adjust such a video, and also for the channel's profile (nome, @, foto, bio). Trigger it before writing any script or Remotion code, because the voice pipeline, the narration-driven timeline and the long list of corrections the user already made decide most of the quality. Not for a product/MVP/app presentation video (Prisma, Orbit…) — that is `project-video`.
---

# Short-Form Video

## Responsibility

Produce a narrated vertical video (9:16) that a person scrolling the feed stops to watch and finishes. It must look professionally edited and **never "cara de IA"**: no neon grids, no particle backgrounds, no robotic voice, nothing that pops in without animation, nothing overlapping.

Deliverables:

- a Remotion project under `C:\Users\Usuário\Videos\<tema>`, separate per video;
- Full HD pilots for review;
- a final 2160×3840 60 fps master, loudness-normalized for TikTok;
- the narration texts the user records or generates;
- a 3:4 4K cover, the post description and verified hashtags (§12).

This skill is the opposite of `project-video`. That one sells a product with its real UI in 16:9. This one tells a story about a topic, for a social feed, driven by a narrator.

## Platform specs (TikTok upload rules the user gave)

Apply these to every final file:

| Rule | TikTok limit | What we always deliver |
|---|---|---|
| File size | max 30 GB | a 3-min 4K60 master is about 70 MB; check with `ls -la` |
| Duration | max 60 min | target 1:05–1:20, ceiling 1:30 (see §2) |
| Format | `.mp4` recommended | `.mp4`, H.264 + AAC, `-movflags +faststart` |
| Resolution | 1080p, 1440p or 4K recommended | **always 4K**. Pilots stay Full HD only for review |
| Aspect ratio | 16:9 landscape, 9:16 vertical | **9:16 vertical by default: 2160×3840.** 16:9 (3840×2160) only if the user asks for a landscape video |

- Before delivering, confirm with ffprobe that the file is `.mp4`, 2160×3840 (or 3840×2160 if landscape), under 30 GB and under 60 min.
- If a request would break a limit (for example a 70-minute video), say so before rendering.

## What can and cannot be made

Say this plainly when the user sends reference videos:

- ✅ **2D motion graphics:** kinetic word captions, phone mockups (WhatsApp, bank app, browser, call screen), receipts, notifications, stamps, counters, checklists, rankings, flat characters and icons.
- ⚠️ **Hybrid:** 3D or AI-generated scenes the user produces elsewhere (Veo, Kling, Sora); this skill does the edit, captions, narration and pacing on top.
- ❌ **Not possible:** realistic people, filmed scenes, 3D characters and cameras, talking avatars.

Never copy another creator's brand, mascot or exact look. Take only the format.

## How the user works

These are hard rules learned from this user:

- **Language:** they write in Portuguese, often by voice dictation. Messages are long, list many points at once and cite times like "no segundo 19", "1:04", "2:33".
  - Treat every point as a checklist item.
  - Acknowledge the count ("Anotei tudo, são 12 pontos").
  - Fix all of them, then report back numbered, one line per point.
- **Cited times:** extract the frame at each time from the pilot they watched. Look at it before changing anything, because the timestamp is the ground truth.
- **Questions:** ask with `AskUserQuestion` when a decision is really theirs (voice, brand, phone style). Give the recommended option first. Don't ask about things they already decided.
- **Pilots:** pilots are Full HD 30 fps, only the final is 4K 60 fps. Always open the pilot for them (`cmd //c start "" <arquivo>`) and give the full path. They will ask "onde está o piloto X?" if you don't.
- **Long renders:** run them in the background. When they say "me avisa quando terminar", the next message after the notification is the report.
- **Housekeeping:** delete old pilots when asked ("exclui os pilotos antigos"). Always delete the intermediate `-bruto.mp4`. Offer to delete outdated finals with a wrong brand, so the wrong one never gets posted.
- **"mais ideias":** each "mais ideias" means a fresh batch with **no repeats**, grouped by angle, ending with 3–4 favorites and why.
- **Exact limits:** when they ask for an exact limit ("exatamente 80 caracteres"), count with a script (`len()` and UTF-16 length) and show only verified options. Emoji may count as 2 on TikTok, so always include a no-emoji option.
- **Their taste:** they dislike pushy CTA tails in bios ("Segue aí" no final é muito ruim). They like propositions like "Aquilo que ninguém te explica direito, explicado em minutos".
- **Your opinion:** when they ask "qual sua opinião?", give a clear recommendation with reasons, not a neutral survey.
- **The other video:** they mentioned sending "outro vídeo" to merge styles. If it ever arrives, analyze it before the next script.

## Workflow

1. Analyze references, if any
2. Topic, research and script
3. Voice
4. Scaffold from `modelo/`
5. Narration-driven timeline
6. Scenes
7. Captions
8. Soundtrack
9. Pilot and review loop
10. Final 4K 60 fps
11. Deliver
12. Cover, description and hashtags (always, once the final is ready)

### 1. Analyze references

- `yt-dlp` gets blocked by TikTok. **Never** retry with browser impersonation: that is bot-check circumvention and the classifier denies it.
- Use Claude in Chrome (load the tools in one ToolSearch, open a new tab), or ask the user to download the videos and pass the path.
- In Chrome:
  - draw the `<video>` into a canvas at several `currentTime` values;
  - export contact sheets of about 14 frames per 20 s;
  - read the auto-captions (ASR) from the page for the spoken script.
- You cannot hear audio: say so, and judge structure, pacing, on-screen text, hook and CTA.
- If the extension is disconnected, say it once and offer: reconnect, or send the file / a screenshot.

### 2. Topic, research and script

- **Fact-check** every claim with web search and cite sources in the report (e.g. MED do Pix 80 dias). Wrong facts on a "golpes"/money channel kill trust.
- **Structure that worked (countdown):**
  1. Hook in the first sentence: concrete loss, second person.
  2. A "fica até o final, porque o #1…" retention line.
  3. #5→#1, each item following: what happens, then a stamp, then how to protect.
  4. "Caiu num golpe? faça isso na hora" checklist.
  5. CTA: "manda pra quem ia cair" plus a comment question.
- **Write for speech, not reading:**
  - use "sabe aquela…?", "aí", "tá?", "viu?";
  - use reticências for pauses;
  - keep sentences short and use exclamations where the narrator warns.
  - Words that drive animations ("200", "apertou", "devolve") must stay stable across rewrites. Keep a backup of the old script (`out/backup_*/roteiro_v1.json`).
- **Duration (the user adopted this rule on 2026-11-13):**
  - **Target 1:05–1:20.** It passes 1 minute, the minimum for TikTok monetization, and sits in the range that performed best in the analysis of 19 reference videos: 45–90 s won, and the 130–157 s ones all underperformed.
  - **Ceiling 1:30.** Go there only when the content needs it (e.g. a 5-item list such as the golpe do aluguel). The first video (5 golpes do Pix, 3:03) is longer than this rule: don't use its length as a model.
  - **Never pad to hit a time.** If the script closes at 1:05, it stays 1:05. A stretched video makes people leave midway, and that hurts reach more than a short video does.
  - **Retention matters more than length.** Put something new on screen every 15–20 s (a stamp, a number, a twist) so people don't swipe away.
  - Estimate the length from the script before recording: about 2.5 words per second including pauses (measured on the first video: 460 words in 3:03). So 1:05–1:20 is roughly 160–200 words. When it runs long, cut copy, not pauses.
- **`roteiro.json`:** one block per scene (`abertura`, `item5`…`item1`, `protecao`, `chamada`), each with the spoken `texto`.

### 3. Voice

The user rejected robotic voices twice. Use this order:

1. **ElevenLabs website, manual — the default.**
   - The free-plan API returns `402 paid_plan_required` for library voices, so the user generates on the site.
   - Write `TEXTOS-ELEVENLABS.txt` with:
     - the settings at the top;
     - one block per scene: `--- 1/8 · salvar como: abertura.mp3 ---`.
   - The user generates **one block at a time**: cheap retakes, per-generation limit and better sync.
   - Settings for the newest model (v3/v4):
     - stability "Natural"/expressive, never "Robust";
     - speed 1.05–1.1;
     - 2–3 generations per block, keep the best.
   - Emotion tags like `[serious]`/`[excited]` work on v3+. Remove them on v2.
   - Prefer conversational/podcast voices over audiobook ones ("Calm & Warm" read like someone reading a paper).
   - The user downloads into `elevenlabs/`. Files may arrive as `abertura.mp3.mp3`, so handle that.
   - Then run `python scripts/montar_voz_externa.py` (project `.venv`). It trims silences, runs Whisper word timestamps, aligns them to the script tokens with difflib, keeps punctuation and writes `public/audio/voz.wav` (−18 LUFS) and `src/narracao.json`.
     - It prints unmatched words; extend `FALADO`/`EQUIVALENTES` (numbers spoken as words, "para"→"pra").
     - `INICIO_SILENCIO = 0.9` s gives the calm start the user asked for.
2. **The user's own cloned voice (Chatterbox Multilingual, local GPU)** is the free fallback that is allowed commercially.
   - It needs a 20–30 s recording of the user reading a natural text.
   - Template: `scripts/gerar_voz_local.py`. It generates each sentence up to 5 times, checks it with Whisper and supports retakes per `cena:frase`.
   - Setup gotchas: `setuptools<81` (pkg_resources), save with `soundfile` (torchaudio.save needs torchcodec). Never use a TTS voice as the reference: it stays artificial.
3. **edge-tts:** rejected as robotic. Use it only for a throwaway timing pilot.

Also:

- **Secrets:**
  - keep the API key in `.env` (gitignored);
  - never print or echo it;
  - suggest deleting loose key files in Downloads;
  - for TLS interception errors use `truststore.inject_into_ssl()`, never disable verification.
- **Commercial use:** the ElevenLabs free plan does not allow commercial use. Remind the user once if the channel will be monetized.

### 4. Scaffold

Copy `modelo/` into the new project and rename the scenes. Keep its structure:

| File | Role |
|---|---|
| `package.json`, `tsconfig.json` | Remotion 4 pinned, `@remotion/google-fonts`, `@remotion/bundler` + `@remotion/renderer` (stills) |
| `src/deixas.ts` | `QUADROS_POR_SEGUNDO=30`, `LARGURA=1080`, `ALTURA=1920`, `ANTECIPACAO=8`, `SOBREPOSICAO=14`, `ORDEM_CENAS`; `criarLinhaDoTempo` (scenes start 8 frames before their first word) and `criarDeixas` (cues anchored to words: `palavra(cena, 'apertou', ocorrencia)`) |
| `src/linhaDoTempo.ts` | `linha`, `deixas`, `deixasLocais(id)` |
| `src/tempo.ts` | `useQuadro()` = `frame * 30 / fps`; **every component uses it instead of `useCurrentFrame`**, so 60 fps keeps the same timing |
| `src/Raiz.tsx` | fps from `getInputProps().fps` (30 or 60); also `FotoPerfil`/`PainelFotos` compositions |
| `src/Video.tsx` | sequences scaled by `fps/30`, scenes **without overlap**, root `fontFamily` set |
| `src/animacao.ts` | `progresso`, curves, `contar`, `formatarReais`, `estiloTransicaoCena` |
| `src/tema.ts` | palette, fonts (Montserrat 900 titles, Inter text, JetBrains Mono), `MARCA` |
| `src/componentes/` | `Legenda`, `Hud`, `Iphone` + `TrocaDeTela`, `Zap` (WhatsApp), `Telas` (`Toque`, `BotaoApp`, `Banner`…), `Recibo` + `ContornoAnimado`, `Elementos` (`Carimbo`, `DicaCentral`, `Aparecer`, `TituloGolpe`), `Icone`, `Fundo`, `LogoMarca` |
| `scripts/` | `montar_voz_externa.py`, `gerar_voz_local.py`, `gerarAudio.ts` + `sintese.ts`, `quadros.ts` (stills, env `PASTA`, `ESCALA`), `folha.py` (contact sheet), `listarDeixas.ts` |

Python tools (Whisper, imageio-ffmpeg, PIL) live in the project `.venv`. The system Python does not have `imageio_ffmpeg`, so call `.venv/Scripts/python.exe -I`.

### 5. Timeline

- **Picture follows the voice.** Never hardcode a frame. Every cue is a word anchor plus an offset (`d.devolve + 8`), so a new voice take re-times everything.
- Audio SFX in `gerarAudio.ts` import the same cues.
- Units are 30 fps "timeline frames". `useQuadro()` converts, and fps 60 only adds smoothness.

### 6. Scenes — visual rules (each line is a correction the user made)

**General look**

- Use a clean dark gradient background (`#05070C`…`#111725`). No grids, particles, neon or busy gradients ("cara de IA").
- One accent palette:
  - yellow `#FFE14D` highlight;
  - red `#FF3B4E` danger;
  - green `#1FE0A8` safe.
  - Exception: "PIX" in the title is **green** (brand association), not yellow.
- Set `fontFamily` explicitly on the root and on SVG `<text>`, or some glyphs fall back to serif ("R$", marker numbers).
- **TikTok safe zones on 1080×1920:**
  - top about 160 px is covered by "Seguindo | Para você";
  - bottom about 380 px by the description;
  - right about 140 px by the buttons.
  - Keep text inside.

**Phone (iPhone)**

- Make it big and realistic:
  - 900 px wide, cut off at the bottom;
  - titanium frame, island, side buttons;
  - real status bar.
- Status bar text turns **black on light screens** (white site), as on a real iPhone.
- **Entrance:** from 1300 px below in 24 frames. **Exit:** slides fully off-screen while fading in the second half. It must never vanish mid-screen.
- Screen changes inside the phone use an iOS push (16 frames). The first screen uses `inicio=-100` so it never flashes.

**Chats (WhatsApp)**

- Incoming messages on the left, yours on the right, with correct tails, time and blue ticks.
- Show a typing bubble before every incoming message, including follow-ups like the e-mail line. Messages grow in and scroll up from the bottom.
- Emoji go **at the end** of the message. Messages must read like real people: short, split in two bubbles when natural.
- Emphasis messages ("🔥 TAREFA ESPECIAL VIP 🔥") get a gold border, an exclamation, emoji and urgency ("Só hoje. Restam 3 vagas ⏳").

**Taps and buttons (`Toque`)**

1. The finger circle appears about 16 frames before the press.
2. The button sinks and darkens on the press.
3. A ripple spreads.
4. Only then does the screen change.

- Never instant.
- Buttons that move must **slide**. For example, the "Encerrar" button glides from the left to the center when a call is accepted, never disappear and reappear.

**Highlights**

- Use `ContornoAnimado`: a rounded pill outline that draws itself around the target, then a soft red fill fades in.
  - Make it rounded, inside its card (never cut by the card edge).
  - Start it about 1 s after the element appears and hold it until the element leaves, so it is seen long enough.
- Markers around text are measured from the text itself, with padding. Never use a fixed box: one cut the number, another covered "digitando…".

**Receipts and app screens**

- Use one professional receipt model:
  - bank header;
  - icon and big value;
  - date;
  - dashed dividers;
  - "Para"/"Detalhes" sections;
  - transaction ID and balance.
- Reuse it everywhere a receipt appears.
- Fake sites need dense, believable detail:
  - gray Safari URL bar (it must read as a field);
  - logo, search, cart count;
  - gallery, stars, strikethrough price, free shipping;
  - trust badges, a "Quem viu também comprou" strip.
  - No empty areas.
- Notifications (`Banner`) that matter get a red border. Keep them on screen about 2 s, and don't cut to the next screen until they are read. Never stack two notifications.

**Cards, stamps, titles**

- **Protection card (`DicaCentral`):**
  - starts `ESPERA_DICA = 30` frames after the phone's exit begins. The exit lasts 24, so there is a short empty beat of about 0.2 s;
  - builds in stages: card and header +0, title +6, support line +16. Never show the empty box alone: a blank card for 0.2 s read as a glitch;
  - highlights only the 1–3 words with real impact;
  - title `lineHeight` ≥ 1.2, so lines never touch ("é golpe" touched "pra").
- **Stamps (`Carimbo`)** end with "!": "Nunca chega!", "Não existe!", "Pagou 2x!". Matching caption lines also use "!".
  - **A stamp never covers text.** Place it in free space next to what it judges:
    - below a receipt card;
    - beside a balance;
    - over a picture, never over a label.
  - In chats there is no free space, so open it. `ConversaZap espacoFinal={ESPACO_CARIMBO * t}` pushes the messages up, like a new message would, and the stamp sits at `TOPO_CARIMBO_ZAP` (1460).
  - On the call screen, slide the end-call button down 150 px before the stamp, and move its `Toque` to match.
  - Finish the stamp's fade about 22 frames before any tap underneath it.
  - Check that every stamp really appears: `inicio < fim`, and the phone must still be on screen. "Sumiu!" was programmed to start after the phone had already left, and it never showed.
- **Hold the phone after the last story beat.** The final event ("Ana removeu você") needs about 1.5 s on screen before the exit starts. If you delay the exit, move the protection card's `positivo` sound in `gerarAudio.ts` by the same amount.
- **Headlines:**
  - never leave a single word on the last line ("cair" alone). Rewrite into two balanced lines;
  - no two-color word salads (two red words looked bad). Use white plus, at most, one accent phrase.
- **Exits:** cards that leave while chat continues scroll **up** with the messages, never vanish.
- **Characters:** flat, simple, consistent (the hooded thief). Nothing cartoonish-busy.
- **Lists of signs:** never misaligned labels. Use numbered markers ①② on the elements plus one aligned card explaining them.

**Motion rules**

- **Nothing appears or disappears without animation.** That includes headers like "Caiu num golpe?": the shield spins and scales in with a ripple, the overline slides, the title rises.
- **No overlap between leaving and entering elements:** caption, phone, card and stamp each wait for the previous to clear.
- **Scene transitions** are sequential fades: 14 frames out, then 14 in, with translateY 24. No crossfades of two busy scenes.
- **No spring overshoot.** Ease-out curves only: bounce looked amateur.
- **Opening:** about 1 s of breathing before the voice. The phone rises calmly, nothing is "pum" in the first frame.

**Top HUD (progress through items)**

- Chips #5…#1 at top 192, height 62, radius 31, fonts 26/24. The user wanted it **this size**: smaller was hard to read.
- The active chip expands in red with its name and an inner progress bar. Done chips get a green ✓.
- It fades out before the CTA scene.

### 7. Captions (`Legenda`)

- **One style:** Montserrat 900, 88 px, uppercase, white with a 9 px black stroke. Only the word being spoken is yellow. No green/red alternation.
- The active word may hop 8 px up but **never scales** (scaling glued words together: "ELEPRECISOU").
- **Blocks:** target at most 3 words or 16 characters. Break on punctuation, on pauses over 6 frames and at scene changes.
  - Short function words (não, o, a, de, na, pra, que…) stay attached to the next word ("NÃO EXISTE!" never split). This may stretch a block to 4 words ("SEU BANCO NA HORA"), which wraps to two lines and is fine.
  - Accepted styles: a 4-word block on two lines; a dimmed upcoming word (opacity 0.38) until it is spoken.
- **Show punctuation** exactly as spoken: . ? ! … :
- **Visible only while the narrator speaks:** from 2 frames before the first word to 5 after the last. Blocks chain without fade when the gap is ≤ 8 frames, and disappear in silences.
- **Position:** top 288, height 244, between the HUD and the scene title, never overlapping either. Check every scene.

### 8. Soundtrack

- Synthesize the music and SFX with `sintese.ts`, cues imported from the timeline. Music sits about 10 dB under the voice.
- Use soft UI sounds for taps, typing and notifications, and a positive sound when a protection card lands.
- Follow `project-video` §6 rules: no noise whooshes, no identical repeats, no wall-to-wall music.
- You cannot hear: measure RMS and peak per scene and report the numbers.

### 9. Pilot and review loop

1. Before rendering, run `npx tsc --noEmit`.
2. Render key stills with `scripts/quadros.ts`: every cue's built state, every transition midpoint and every timestamp the user cited. Tile them with `folha.py` and look at them.
3. Render the pilot: `npx remotion render src/index.ts <Comp> out/pilotoN.mp4 --codec=h264 --crf=18` (1080×1920, 30 fps), in the background.
4. Extract frames from the MP4 too, because what renders in the video is what counts. Check:
   - overlaps;
   - one-word lines;
   - captions colliding with the HUD or title;
   - things appearing without animation;
   - serif fallbacks;
   - text cut by cards;
   - status bar contrast;
   - stamps covering text, or stamps that never show up;
   - empty boxes that show before their content.
5. Open the pilot for the user and report:
   - path;
   - duration;
   - a numbered list mapping each of their points to what changed;
   - extra issues you found yourself.
6. Prefer the Chrome extension for viewing. It disconnects often, so fall back to frames plus `cmd //c start`.

### 10. Final 4K 60 fps

Only after the user approves. Do a last global polish pass first, if asked.

```
npx remotion render src/index.ts <Comp> out/<nome>-4k60-bruto.mp4 --props='{"fps":60}' --scale=2 --image-format=png --codec=h264 --crf=16 --x264-preset=slow --color-space=bt709 --audio-bitrate=320k
```

Then normalize the loudness for TikTok with two-pass `loudnorm`, using the ffmpeg from `.venv` `imageio_ffmpeg`:

1. Measure the input with `loudnorm=I=-14:TP=-1.5:LRA=9:print_format=json`.
2. Apply it with the measured values, `linear=true,aresample=48000`, `-c:v copy -c:a aac -b:a 320k -movflags +faststart`.
3. Verify with `ebur128=peak=true`. The target is −14.0 LUFS, peak ≤ −1.4 dBFS.
4. Confirm with ffprobe: 2160×3840, 60 fps, h264 yuv420p bt709.
5. Do a 100% crop check of small text.
6. Delete the `-bruto` file.

A 3-minute render takes about 20–30 min.

- If only the audio is unchanged, the previous loudnorm measurement can be reused.
- If only one scene changed, still re-render the whole video: splicing H.264 is not worth the risk.

### 11. Deliver

- Give the path and open the file.
- Specs: resolution, fps, duration, size, LUFS.
- Posting tips:
  - transfer the original file (cable, Drive, Nearby), never through WhatsApp, which recompresses;
  - enable "alta qualidade" on upload.

### 12. Cover, description and hashtags (mandatory)

Every time the final video is done, do this step without being asked. The user asked for it permanently.

**Cover image**

- **Format:** always **3:4 portrait, in 4K: 2880×3840 px, PNG**. The user corrected this explicitly: **not 4:3** (landscape is useless on TikTok), and not the full 9:16 frame.
- **How:**
  1. Build the full 1080×1920 `Capa` composition.
  2. Wrap it in `CapaTresQuartos` at 1080×1440: shift the Capa up 240 px and scale it to 0.92 around its center, so everything fits with a margin ("um pouquinho menor"). Template: `modelo/src/Capa.tsx`, registered in `modelo/src/Raiz.tsx`.
  3. Render it with `npx remotion still src/index.ts CapaTresQuartos out/capa/capa-<tema>-3x4-4k.png --scale=2.6667`.
  4. Check that the result is 2880×3840.
- **Do not grab a frame from the video:** compose the cover from the video's own elements.
- **Layout, top to bottom:**
  - brand chip (mascot + "Explica Aí");
  - the big title in the video's colors, then the subtitle;
  - the key visual (e.g. the receipt with the highlighted line), tilted, with the character peeking from behind it;
  - the countdown chips with #1 locked;
  - the hook pill.
- **Check the preview:**
  - nothing overlaps (the card must not touch the title or the chips);
  - no value or label wraps (widen or scale the card instead of letting "R$ 2.000,00" break);
  - the character stays visible;
  - margins at the top and bottom.
- If the file is open in a viewer, Windows locks it and the render fails with `UNKNOWN: open`. Render to a new name instead.
- Save it to `out/capa/`, open it for the user and give the path.

**Description**

- Write it ready to paste, in a code block:
  1. the hook as the first line (it shows before "mais");
  2. one or two lines naming the topics with the words people search for ("falsa central do banco", "MED do Pix"), because TikTok search reads the description;
  3. a save/share line;
  4. a comment question that matches the video's ending.
- Explain briefly why each part is there.

**Hashtags**

- Use 4–6 topic hashtags, broad and niche mixed. No `#fyp`/`#viral`.
- **Only hashtags that exist on TikTok.** Verify each one before delivering:
  1. Open `https://www.tiktok.com/tag/<hashtag>` in Claude in Chrome.
  2. Read the post or view count on the page.
  3. Drop any tag with no page or a tiny count.
  4. Show the count next to each tag in the table.
  - TikTok blocks curl/WebFetch ("Please wait…"). If Chrome is not connected, say the tags are not verified yet and ask the user to connect it. Never claim they exist without checking.
- Also give 3–4 verified alternatives, plus the tip to put the main keyword in the on-screen text and cover.

## Channel brand: Explica Aí

- **Name:** Explica Aí. **Handle:** **@oexplicaai_**, chosen 2026-11-13. TikTok allows handle changes only every 30 days.
- **Topics:** varied — golpes, dinheiro, tecnologia, curiosidades — so every video must fit a general explainer channel.
- **Logo and profile photo:**
  - a yellow speech-bubble **mascot with a curious face** (raised eyebrow), on a dark background;
  - in code: `LogoMarca variante="mascote"`, composition `FotoPerfil` with `conceito: 'mascote'`;
  - other concepts exist in `FotoPerfil.tsx` (`PainelFotos` renders a comparison at 280/96/44 px in circle crops, which is how logos must be judged).
- **In every video:**
  - the closing pill "Siga **@oexplicaai_** pra …" with the handle in yellow;
  - the mini mascot, which blinks once (`olhos={piscada(...)}`).
  - The mascot can also react in openings and endings.
- **Bio:** the user prefers "Aquilo que ninguém te explica direito, explicado em minutos…" without a pushy CTA tail. Max 80 characters; verify counts with a script.
- **Naming feedback the user accepted:**
  - avoid repeated letters or a trailing "_" when possible;
  - avoid "Clips"/"cortes" (it signals reused content and lowers reach);
  - avoid names that collide with big existing channels ("Você Sabia?");
  - "@explica.ai" reads as an AI tool.

## Gotchas

- Remotion's bundled ffmpeg is stripped: no `fps`, `select`, `xstack` and so on. Use the `.venv` imageio-ffmpeg for contact sheets, crops and loudness.
- **Windows:**
  - in Python, `sys.stdout.reconfigure(encoding='utf-8')` before printing emoji; `PYTHONIOENCODING` is ignored under `-I`;
  - paths with "Usuário": build backslash paths carefully in heredocs;
  - `rm` with globs may be blocked: write to new folders via env `PASTA`.
- TikTok profile pages return "Please wait…" to curl/WebFetch. Use Chrome.
- `Carimbo` opacity must be controlled through its `fim` prop, not overridden by `estilo`, or the fade breaks.
- Unused variables fail `tsc` (strict). Run it before every pilot.
