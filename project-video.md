---
name: project-video
description: Analyze a project, pick its main features and turn them into a professional motion-graphics presentation video rendered in 4K with Remotion, plus a README GIF. Use whenever the user asks for a video, vídeo de apresentação, demo, teaser, trailer, "vídeo mostrando a ferramenta", motion graphics, or an animated showcase of an app, site, API or tool, even when they only give a duration or a format. Trigger it before writing any Remotion code, because the content plan, the shared timeline and the audio rules decide most of the quality and are expensive to retrofit.
---

# Project Video

## Responsibility

Produce a presentation video that explains what a project does by showing its real features in motion. It is not a logo animation and not a slideshow. Someone who has never seen the product should finish the video knowing what it is for, what its main tools are, and why it is different.

The deliverables:

- a Remotion package in the repository;
- a 4K (3840×2160) MP4 master;
- a README GIF;
- documentation of how to rebuild all of them.

Everything shown must be true. Use strings, values, presets and results that exist in the project, never invented features or numbers.

## Workflow at a glance

1. Analyze the project and rank its features
2. Ask what changes the output, and present the script
3. Scaffold the video package
4. Build the shared timeline
5. Build the scenes
6. Build the soundtrack
7. Render in 4K
8. Verify frame by frame
9. Deliver the video, the GIF and the docs

## 1. Analyze the project

Read before planning:

- `CLAUDE.md`, `README.md`, requirement files (`REQUISITOS.md`, `docs/`)
- routes, pages and navigation config
- feature config such as presets, options and defaults
- the theme tokens: colors, fonts, radius, shadows
- the logo or brand mark

Then run the project in its development environment and use it. In the browser, follow `elite-web-experience` §5–6 (Chrome, dev environment only). The goal is to collect, for every feature, three things:

- the real labels,
- a real input,
- the real output.

When the logic is pure, call it directly with `node` to get exact values. Examples: a score the analyzer gives, the entropy of a generated value, the result of a calculation.

Rank the features in a table before writing anything:

| Feature | What the user does | What they get | Why it matters | Real values to show |
|---|---|---|---|---|

Rank them by how central they are to the product's main action, and by how different they are from alternatives. The top three to six become the feature scenes. Differentiators that are not actions, such as privacy, offline use or speed, become one closing "trust" scene, not several.

## 2. Ask, then show the script

Ask only what changes the output, in one round, with a recommended option first:

- **Format:** 16:9 (README, site, YouTube), 9:16 (Reels, Shorts, Stories) or 1:1.
- **Location:** default to `video/` inside the repository, as a separate package.
- **Audio:** synthesized soundtrack (default), no audio, or a track the user provides.

**Duration follows content.** Budget:

- opening: about 2.4 s;
- hook or problem scene: about 4 s;
- each feature scene: about 4.5–5 s;
- trust scene: about 4 s;
- closing: about 4 s.

Five features land near 40 s. If the user asks for less time than the features need, say what fits (15 s holds two features at most) and recommend the longer cut. A video that "talks too little" was the failure mode last time.

**Present the script** in the same message as the questions:

| # | Scene | Time | Headline | What appears | Motion |
|---|---|---|---|---|---|

**The closing slogan** is a creative decision. Offer three or four options in the language of the project instead of reusing the README tagline.

## 3. Scaffold

Create `video/` as its own package, outside the app's build, CI and Docker context:

| File | Content |
|---|---|
| `package.json` | `private`, `"type": "module"`; exact pinned versions of `remotion`, `@remotion/cli`, `@remotion/fonts` (same version for all three); `react` and `react-dom` matching the app; the app's icon library; scripts `estudio`, `audio`, `render`, `gif`, `typecheck` |
| `tsconfig.json` | Copy `modelo/tsconfig.json` (strict, `noUncheckedIndexedAccess`, `allowImportingTsExtensions`, `verbatimModuleSyntax`) |
| `.gitignore` | `node_modules/`, `out/`, `public/audio/` |
| `public/fontes/` | The app's fonts as local `woff2`, loaded with `@remotion/fonts` `loadFont` before `registerRoot` renders |
| `src/index.ts`, `src/Raiz.tsx` | `registerRoot` and the `Composition` |
| `src/linhaDoTempo.ts` | Every cue (see step 4) |
| `src/tema.ts` | Colors and fonts copied from the app's tokens, dark theme by default |
| `src/animacao.ts` | Copy `modelo/animacao.ts` |
| `src/componentes/` | `TextoRevelado` (copy from `modelo/`), background, card, brand mark, UI replicas |
| `src/cenas/` | One file per scene |
| `scripts/sintese.ts` | Copy `modelo/sintese.ts` |
| `scripts/gerarAudio.ts` | The soundtrack arrangement |
| `scripts/gerarGif.ts` | Copy `modelo/gerarGif.ts` and set `ARQUIVO_VIDEO` |

Scripts:

```json
"estudio": "remotion studio src/index.ts",
"audio": "node scripts/gerarAudio.ts",
"render": "npm run audio && remotion render src/index.ts <Composicao> out/<projeto>-apresentacao.mp4 --codec=h264 --scale=2 --image-format=png --crf=12 --x264-preset=slow --color-space=bt709 --audio-bitrate=320k",
"gif": "node scripts/gerarGif.ts",
"typecheck": "tsc"
```

Also:

- add `video` to `.dockerignore`;
- make sure the app's `tsconfig`, test runner and linter do not pick up `video/`;
- if npm asks to approve install scripts, add only `esbuild` to `allowScripts`.

Follow the target project's conventions inside the video package: identifier language, no comments, strict types.

## 4. The shared timeline

`src/linhaDoTempo.ts` is the single source of time for both picture and sound:

- **Base values:** `QUADROS_POR_SEGUNDO = 30`, `LARGURA = 1920`, `ALTURA = 1080`.
- **Beat grid:** `QUADROS_POR_BATIDA = 12` (150 BPM). Every scene start and every accent (a click, a value landing, an impact) sits on a multiple of 12 frames, so music and picture lock together.
- **Overlap:** `SOBREPOSICAO = 12`. A scene lasts until the next one starts, plus 12 frames, for the crossfade.
- **Scene table:** `inicios` holds scene start frames. `cenas` is derived from it as `{ inicio, duracao }`, along with `ordemCenas` and `NomeCena`.
- **Local cues:** each scene has an object of cues in frames relative to its own start (`gerador.cliqueGerarOutra`). Helpers compute per-character or per-segment frames (`quadroSorteio(indice)`).
- **Content constants:** generated values, sample inputs and results live here too, because the audio needs them (one key sound per typed character).

Never write a frame number inside a scene or in the audio script. Import it, so moving a cue moves its picture and its sound together.

## 5. Scenes and motion

### Composition

- **Size:** compose at 1920×1080 with sizes in px. Use 140 px side margins.
- **Type sizes:** headlines 64–80 px at weight about 620, letter-spacing −0.035em. Body text 20 px or more, and UI labels 20 px or more. Anything smaller is unreadable in the GIF.
- **One idea per scene.** Use an overline label (`GERADOR`), a two-line headline with the key phrase in the accent color, one supporting sentence, and the feature itself on a card.
- **Show the feature, don't describe it.** Rebuild the real UI as React components with the app's tokens: the panel, the tabs, the meter, the buttons, the result. Don't use screenshots. Animate the real interaction: a value being generated, a click on the real button, a score counting up, a recommendation simulating its effect.
- **Hold time.** The last element of a scene must stay still for at least `palavras / 3 + 1` seconds before the exit begins.
- **Headlines.** Never end on a single word. Rewrite the copy, don't shrink the font.

### Motion vocabulary

These all live in `animacao.ts` and the components:

- `progresso` with `curvaSaida` for entrances; `mola` (spring) for cards and pressed buttons.
- `TextoRevelado`: words rise from a mask, about 2 frames apart.
- Character scramble that settles into the real value, with a short glow on landing.
- Meters and bars fill segment by segment, on the beat.
- Typing: one character every 2 frames, with a caret.
- Button press: scale to 0.94 and back, on a beat frame, with its click sound.
- Numbers count with `interpolate`, using `Math.round` and a fixed `minWidth` so the layout does not jump.
- Scene transition: `estiloTransicaoCena`, a crossfade with a slight scale and blur.
- A continuous background (grid, glow and a brand shape) whose position and intensity interpolate between scenes. Without it, crossfades look like cuts.

### Determinism

Remotion renders frames out of order and in parallel:

- everything must be a pure function of `useCurrentFrame()`;
- use `random(seed)` from Remotion, never `Math.random`;
- use no CSS `transition` or `animation`, no timers and no state that accumulates between frames.

### Arc

1. **Opening:** the brand mark draws itself, then the name and a one-line category.
2. **Hook:** the problem the product solves, in concrete terms. For example, common passwords with the time to break each one.
3. **Feature scenes:** in ranked order, each with its real values.
4. **Trust scene:** the differentiators as a row of seals.
5. **Closing:** the mark, the name and the chosen slogan, revealed in two beats.

## 6. Soundtrack

The user cannot accept what you cannot hear. Treat these as hard rules, learned from rejected versions:

- **No filtered-noise whooshes** or risers between scenes: they sound like paper. Scene changes are carried by music and picture.
- **No identical repeated effects.** Vary pitch, gain and pan with a seeded generator for each repetition, such as keys or ticks. Give different events different sounds.
- **Music is not wall-to-wall.** Leave the opening and the hook dry. Bring the music in at the first feature, drop it for a breath (for example, under the analysis or the "problem" moment), and bring it back for the build to the closing chord.
- **Music level:** calibrate the music bus to about −24 dB RMS. Impacts sit 4–6 dB above it. Use a soft-knee limiter with fixed gain, never peak normalization: normalization lifts the whole mix when you remove a loud event.
- **Clicks are soft and short:** `tocarCliqueBotao` around 0.2, `tocarTecla` around 0.15. They only play on visible clicks.
- **No FM bells (`tocarSino`) on the logo moments.** Their attack reads as a click. Use `tocarGrave` and a soft `swellReverso` for the mark instead.
- **Bass:** high-pass the master at 35 Hz and keep the bass an octave up, so it does not rumble on laptop speakers.
- **Decays:** keep bell and pad tails short before a silent scene.

**Verify objectively, because you cannot listen.** In a scratchpad script:

- measure the RMS and peak of each scene segment;
- render a spectrogram (STFT to PNG) and band energies;
- check transient steepness (step/peak ratio) at the cues the user complained about.

When asked to remove one sound, change only that sound. Then diff the new WAV against a backup sample by sample, and report the time ranges that changed.

## 7. Render in 4K

`npm run render --prefix video`:

- **`--scale=2`:** the browser renders the 1920×1080 layout at double density. Text, icons and shapes are vectors, so the output is native 3840×2160, not an upscale. Do not compose at 3840: every px value would double for no gain.
- **`--image-format=png`:** removes the JPEG step that blotches dark gradients and glows.
- **`--crf=12 --x264-preset=slow`:** near-transparent quality at about 7–8 Mbps for flat UI content.
- **`--color-space=bt709`:** without it, players show washed-out colors.
- **`--audio-bitrate=320k`.**

Render in the background; a 40 s video takes about 5 minutes.

## 8. Verify

Never deliver a render you have not looked at. Extract frames with `npx remotion ffmpeg -ss <s> -i out/<arquivo>.mp4 -frames:v 1 <png>`:

- at least one frame at each scene's fully built state, plus the crossfades;
- a 1280×720 crop at 100% (`-vf crop=1280:720:x:y`) to confirm 4K sharpness;
- `npx remotion ffprobe` to confirm 3840×2160, h264, `yuv420p`, `bt709`, aac 320k and the expected duration.

Check every frame for:

- text clipped or overflowing its card;
- buttons changing width as their label changes;
- one-word last lines;
- badges whose count does not match the items;
- two scenes visible at once outside a crossfade;
- values that differ from the app.

Fix the problem, render again, and look again.

## 9. Deliver

- **Video:** `SendUserFile` refuses files above 30 MiB. If the master is larger, send a preview copy encoded to `scratchpad` with `-c:v libx264 -preset slow -b:v 4.6M -maxrate 7M -bufsize 14M -c:a copy -movflags +faststart` (still 4K, about 25 MB). Say where the master is.
- **GIF:** `npm run gif --prefix video` writes `video/apresentacao.gif` at 800 px, 12 fps, 96 colors and no dithering, from a frame sequence. Keep it under 10 MB. If it grows past that, lower it to 720 px before lowering the fps. Dithering defeats GIF frame compression on animated backgrounds.
- **README:** add a `## 🎬 Apresentação` section in the user's README pattern (`start-project` §5), right after `## 🚀 Ferramentas Utilizadas`. It holds:
  - the GIF, centered at `width="800"`;
  - one paragraph with duration, resolution and where the package lives;
  - a command block with `# ` lines for install, render, gif and studio.

  Also add `🎬 Remotion <major>` to the tools list, in length order.
- **`CLAUDE.md`:** add a Structure row for `video/` (what holds the cues, what arranges the audio) and a Commands row for install, render, gif and studio.
- **Commit:** through `release-project`. Commit the GIF, never `out/` or `public/audio/`.

## Gotchas

- Remotion's bundled ffmpeg is a stripped build: it has no `fps`, `select`, `vstack` or `showspectrumpic` filters. Downscale with `-r` into a PNG sequence, then build the palette from the sequence, as `modelo/gerarGif.ts` does.
- On Windows, filter graphs with `;` and `[]` break through `npx` and shells. Call the CLI with `execFileSync(process.execPath, [<node_modules>/@remotion/cli/remotion-cli.js, 'ffmpeg', ...])`, with no shell.
- Node 24 runs `.ts` scripts by stripping types. Constructor parameter properties are rejected, and relative imports need the `.ts` extension.
- A word-reveal mask (`overflow: hidden`) clips descenders and wide words. Pad the mask and put the space between words outside the masked span.
- Monospace values on a card must be sized for the longest value the scene shows, not the first one.

## Template files (`modelo/`)

| File | Use |
|---|---|
| `sintese.ts` | DSP: envelopes, oscillators, pad, pluck, FM bell, kick, sub, UI clicks and keys, biquad filters, ping-pong delay, reverb, meters, limiter and WAV writer (48 kHz stereo) |
| `animacao.ts` | Curves, `progresso`, `mola`, `misturar`, scene transition; imports `QUADROS_POR_SEGUNDO` and `SOBREPOSICAO` from the timeline |
| `TextoRevelado.tsx` | Masked word reveal with colored segments |
| `gerarGif.ts` | GIF from the render; set `ARQUIVO_VIDEO` |
| `tsconfig.json` | Strict config for `src` and `scripts` |

Adapt names to the target project's conventions when copying.
