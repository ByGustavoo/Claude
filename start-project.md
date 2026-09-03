---
name: start-project
description: Onboard into a repository - inspect its structure, classify it, identify which skills apply, and create or update its CLAUDE.md and README.md from verified facts. Use when opening a repository for the first time, when the user says things like "inicializa esse projeto", "faz o setup", "audita esse repo", "cria o CLAUDE.md", "configura as instrucoes do projeto", or "documenta isso"; and whenever you are about to work in a repository you have not yet inspected in this session. Trigger it even when the request that follows is small, because the cost of writing code against assumed conventions is far higher than the cost of a short inspection first.
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

Load only what the work requires:

| Project | Load |
|---|---|
| Web / frontend | `elite-web-experience` |
| Java / Spring backend | `java-clean-architecture`, `testing` |
| Any backend or API | `testing` |
| Fullstack | the skills for the half being touched |
| Any meaningful change under review | `code-review` |
| Committing or publishing | `release-project` |

Loading unrelated skills fills context with instructions that do not apply and dilutes the ones that do.

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

**If it does not exist**, follow the user's established documentation pattern: when a GitHub integration is available, look at their other repositories with a similar stack, identify the structure and tone they consistently use, and follow it. Otherwise use a standard structure: what it is, requirements, install, run, test, structure, configuration.

Never copy project-specific facts from another repository into this one. Reuse the *shape* of the documentation, never its content.

### 6. Validate

Before declaring initialization complete:

- Every path mentioned in the documentation exists
- Every command mentioned runs, or is marked as unverified
- No documented capability is unsupported by the code
- No files outside `CLAUDE.md` and `README.md` were modified

## Completion

Report, briefly:

- Project type and the evidence for it
- Which skills apply
- What you created or updated, and what you deliberately left alone
- Anything you noticed but did not act on, offered as next steps

If you inspected but wrote nothing because nothing needed changing, say that. A repository already in good shape is a legitimate outcome.
