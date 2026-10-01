---
name: start-project
description: Onboard into a repository - inspect its structure, classify it, identify which skills apply, and create or update its CLAUDE.md and README.md from verified facts. Use when opening a repository for the first time, when the user says things like "inicializa esse projeto", "faz o setup", "audita esse repo", "cria o CLAUDE.md", "configura as instrucoes do projeto", or "documenta isso"; whenever you are about to work in a repository you have not yet inspected in this session; and whenever you create, rewrite or improve any README.md, including the README of a project you just created in this session, because it defines the user's README pattern. Trigger it even when the request that follows is small, because the cost of writing code against assumed conventions is far higher than the cost of a short inspection first.
---

# Start Project

## Responsibility

Build an accurate mental model of a repository, then persist that model so it does not have to be rebuilt from scratch every session.

The deliverable is understanding plus, when justified, an updated project `CLAUDE.md` and `README.md`. Everything written must come from facts verified in this repository.

## Scope guard

Onboarding is not a licence to change code. In this skill:

- Read, run read-only commands, and write documentation.
- Do not refactor, reformat, upgrade dependencies, or "clean up" anything you happen to notice.
- Collect what you noticed and list it at the end as suggestions.

The one exception is step 6: comments and group labels left by templates are removed during onboarding, because the projects carry none and leaving them would make every later change inherit them. That removal is the only edit outside the documentation, and the completion report lists each file it touched.

If the user asked for a specific task and you are inspecting only to do that task well, keep the inspection proportional — read what you need, skip the full audit, and do not write documentation nobody asked for.

## Workflow

### 1. Inspect

Look at the repository before forming any opinion about it:

- Structure and entry points — `ls`, then read the top-level directories that carry source
- `CLAUDE.md` (root and nested), `README.md`, `CONTRIBUTING.md`, `docs/`
- Build and dependency manifests
- Test structure: where tests live, how they are named, which framework
- Development commands: `scripts` in `package.json`, Maven/Gradle tasks, `Makefile`, `docker-compose.yml`
- CI configuration and what it actually enforces
- `git status`, current branch, remotes, and recent history (`git log --oneline -20`)
- `.env.example`, config files, and which environment variables are expected
- `.gitignore` — what the project deliberately keeps out

Two things worth reading closely because they encode conventions nothing else states: the most recent meaningful commits, and one existing test file. They show how this project actually writes code and messages, which matters more than any style guide it might have.

Do not assume the project type before inspecting it.

### 2. Classify

Use `project-classifier` to determine the category and release path. Do not duplicate its logic here — read it and apply it.

### 3. Select skills

Load only what the work requires, using the type-to-skill table in `project-classifier`. Loading unrelated skills fills context with instructions that do not apply and dilutes the ones that do.

### 4. CLAUDE.md

The global `CLAUDE.md` holds workflow defaults. The repository `CLAUDE.md` holds facts about *this* project — the things that are expensive to rediscover.

**If it does not exist**, create it from verified facts:

```markdown
# <Project Name>

## What this is
<One or two sentences: what it does and who uses it.>

## Type
<category> - release: <push to main | branch + PR>

## Stack
<language, framework, versions, database, key libraries>

## Structure
<the 4-8 directories that matter, one line each>

## Commands
| Purpose | Command |
|---|---|
| Install | ... |
| Run (dev) | ... |
| Test | ... |
| Build | ... |
| Lint / format | ... |

## Conventions
<naming, layering, mapping approach, error handling, commit style - only what is actually observed>

## Gotchas
<things that surprised you: required env vars, services that must be running, slow or flaky steps>
```

Every command listed must be one you found in the project, not one you assume works. If you could not verify a command, either omit it or mark it explicitly as unverified.

**If it exists**: preserve useful content, update only what is outdated or missing, and never replace it wholesale. Do not add generic rules that do not apply to this project — a `CLAUDE.md` that repeats universal advice trains the reader to skim past it, including the parts that matter.

### 5. README.md

The README is for humans, including future contributors. Update it only when a real change made it inaccurate or materially incomplete — not for style.

**If it does not exist**, or when the user asks to create or improve one, write it in the user's README pattern below. This applies to every README, not only during onboarding: a README written as part of creating a new project follows the same pattern, and a generic structure (a `# Title` heading, plain section names, `-` lists) is never acceptable.

Before writing, open one or two of the user's most recent READMEs of the same project type to match their current form: the sibling repositories next to the working directory, or `gh repo view ByGustavoo/<repo>` when they are not local. PrismaAPI and OrbitAPI are the reference for backends, PrismaWeb and OrbitWeb for frontends, Sentinela and Claude for tools and other projects.

Never copy project-specific facts from another repository into this one. Reuse the *shape* of the documentation, never its content.

#### The user's README pattern

The skeleton every README follows:

````markdown
<div align="center"> <br>
  <img align="center" alt="<projeto>-<tecnologia>" height="150" width="150" src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/<tecnologia>/<tecnologia>-original.svg" />
</div>

<br>

<div align="center">
  <Uma a três frases em pt-BR: o que o projeto é, para quem serve e o que concentra. Cita o projeto irmão com link quando houver.>
</div>

<br> <br>

## 🚀 Ferramentas Utilizadas

* ☕️ Java 25

* 🟢 Spring Boot 4.1.1

<br>

## ⚙️ Pré-requisitos

* JDK 25 instalada

<br>

## ▶️ Como Executar

```bash
# Ambiente de desenvolvimento (porta 9017)
./gradlew bootRun --args="--spring.profiles.active=dev"
```

<br>

## 📁 Estrutura

```
src/main/java/br/com/<projeto>
├── <Projeto>Application.java   # Classe de inicialização
├── config                      # Configurações e beans
└── service                     # Regras de negócio
```

<br>

## 🖥️ Desenvolvedor

### 🔵 LinkedIn: [Gustavo Correa](https://www.linkedin.com/in/gustavo-chauar-correa-946168269/)
````

The rules behind it:

- **No `#` title.** The README opens with the centered logo: the devicon of the main technology (`spring` for Spring Boot APIs, `react` for React frontends, `java` for plain Java, `python` for Python), 150×150, with `alt` as `<projeto>-<tecnologia>` in lowercase. Check that the icon URL exists before using it.
- **The description lives in the centered `<div>`**, never under a heading, followed by `<br> <br>`.
- **Every section is `## <emoji> <Título em Title Case>`** (`Como Executar`, `Variáveis de Ambiente`, `Testes e Build`), and sections are separated by a `<br>` line with one blank line on each side.
- **Reuse the established titles and emojis** when the section applies, in this order, and skip the ones that do not:

| Section | Used for |
|---|---|
| `## 🚀 Ferramentas Utilizadas` | Always first: stack and tools |
| `## 🎯 Objetivo` | Why the project exists, when the description is not enough |
| `## 📌 Status do Projeto` | What is done, integrated or pending |
| `## ✨ Funcionalidades` | Features, grouped with `🔹 **Grupo**` lines followed by bullets |
| `## 🔎 Como Funciona` | The mechanism, in plain language |
| `## ⚙️ Pré-requisitos` | What must be installed or reachable |
| `## 📦 Instalação` | Installing dependencies |
| `## 🔐 Variáveis de Ambiente` | Table `\| Variável \| Descrição \|` |
| `## ▶️ Como Executar` | Running, per profile or per shell |
| `## 📜 Scripts Disponíveis` | Package scripts (frontends) |
| `## 🧪 Testes e Build` | Test and build commands (`## 🧪 Testes` when there is no build) |
| `## 🐳 Docker` | Compose files and the image |
| `## 🤖 Integração Contínua` | Table `\| Workflow \| Gatilho \| O que faz \|` |
| `## 🔌 API` / `## 🔌 Integração com a API` | The contract, or how the frontend reaches the backend |
| `## 📁 Estrutura` / `## 📂 Estrutura do Projeto` | The source tree |
| `## ⚠️ Limitações` | Known limits, stated honestly |
| `## 🗺️ Próximas Etapas` | What comes next |
| `## 🖥️ Desenvolvedor` | Always last, exactly as in the skeleton |

  A project-specific section (a catalogue of patterns, a data layer, a theme system) gets its own fitting emoji in the same `## <emoji> <Título>` form, placed where it reads naturally before the structure.
- **Tool lists — one entry per tool, shortest to longest.** In "🚀 Ferramentas Utilizadas", every tool gets its own bullet with its own emoji and its version when it has one, with a blank line between bullets. Never merge two into one line with `+`: `* 🐘 PostgreSQL + Flyway` and `* 📊 Log4j2 + JaCoCo` are wrong — each is two bullets. Order the bullets by visual line length, shortest first, regardless of importance or category. The bullets of "⚙️ Pré-requisitos" are also separated by blank lines.
- **Lists use `*`, never `-`.** Explanatory lists lead with bold: `* **Termo:** explicação`.
- **Commands go in fenced blocks, each command preceded by a `# ` line in pt-BR saying what it does** (`# Sobe um PostgreSQL local na porta 5432`), with a blank line between commands. When there are independent steps or alternative shells, put a `🔹 <Rótulo>` line right above each block. These `#` lines are documentation inside the README and are expected there; the no-comments rule covers the repository's files, not examples in Markdown.
- **The structure is a tree** (`├──`, `└──`, `│`) starting at the source root package, with each entry followed by a `# Descrição` aligned in one column, naming what the folder holds.
- **Tables for anything tabular**: variables, workflows, endpoints, catalogues. A catalogue table may start each row with an emoji and the bold name (`🧱 **Builder**`).
- **The footer never changes**: `## 🖥️ Desenvolvedor` followed by `### 🔵 LinkedIn: [Gustavo Correa](https://www.linkedin.com/in/gustavo-chauar-correa-946168269/)`, and nothing after it.
- **Prose is pt-BR and factual.** Every class, path, command, port and count must exist in the project and be checked before publishing.

### 6. Conventions to apply while onboarding

**Dependency manifests** follow the same grouping as the README tool list, and carry no comments. Each tool's declarations form their own group — PostgreSQL and Flyway are two groups, not one —, groups are separated by a blank line, and inside each group the declarations run from the shortest line to the longest.

**Never write comments in the repository's files** — source, configuration, manifests, migrations, scripts, `.gitignore`, or `.gitattributes`. No Javadoc or JSDoc either. A label that only names a group counts as a comment: the `// Spring Boot` lines a template puts over dependency blocks and the `### IntelliJ IDEA ###` headers Spring Initializr puts in `.gitignore` are removed during onboarding, leaving the blank line between groups. The exceptions are `.env` and `.env.example`, where a comment explains each variable to whoever sets up the environment, directives a tool reads (`@SuppressWarnings`, `/// <reference>`), and tool-generated files such as the Gradle wrapper scripts, which stay as generated. Otherwise a comment is written only when the user asks for one. When a convention needs explaining, the explanation belongs in `CLAUDE.md` or `README.md`, not in the file it governs.

### 7. Validate

Before declaring initialization complete:

- Every path mentioned in the documentation exists
- Every command mentioned runs, or is marked as unverified
- No documented capability is unsupported by the code
- No files outside `CLAUDE.md` and `README.md` were modified, apart from the comment and group-label removal of step 6

## Completion

Report, briefly:

- Project type and the evidence for it
- Which skills apply
- What you created or updated, and what you deliberately left alone
- Which files had template comments or group labels removed, if any
- Anything you noticed but did not act on, offered as next steps

If you inspected but wrote nothing because nothing needed changing, say that. A repository already in good shape is a legitimate outcome.
