---
name: project-classifier
description: Classify a repository as web/frontend, backend/API, fullstack, library/package, CLI/tool, mobile, or infrastructure using real file evidence, and derive the release workflow that follows from that classification. Use this before committing, pushing, opening a PR, or releasing anything; before choosing which stack-specific skill to load; and any time you are about to assume what kind of project you are working in. Trigger it even when the project type looks obvious - a repo with package.json can still be a backend, a repo with a Dockerfile can still be a library - because guessing wrong sends changes down the wrong release path and loads the wrong conventions.
---

# Project Classifier

## Responsibility

Determine what kind of project this repository is, based on evidence in the repository itself, and state the workflow rules that follow from that answer.

Classification exists to answer three practical questions:

1. Which skills should be loaded for this work?
2. What is the release path — push to `main`, or branch plus Pull Request?
3. Which validation commands are meaningful here?

A wrong classification is expensive: it can push an unreviewed change straight to a production backend, or bury a two-line CSS fix in a Pull Request nobody needed.

## Process

### 1. Gather evidence

Read manifests and structure before deciding. Useful signals, roughly in order of weight:

- Build/dependency manifests: `package.json`, `pom.xml`, `build.gradle`, `build.gradle.kts`, `requirements.txt`, `pyproject.toml`, `go.mod`, `Cargo.toml`, `*.csproj`, `composer.json`, `Gemfile`
- What the manifest actually declares: dependencies, `scripts`, `main`/`bin`/`exports`, `packaging`, Spring Boot starters
- Source layout: `src/`, `app/`, `pages/`, `components/`, `controllers/`, `routes/`, `cmd/`
- Framework configuration: `next.config.js`, `vite.config.ts`, `angular.json`, `application.yml`, `settings.py`
- Entry points: `index.html`, `main.tsx`, `Application.java`, `main.go`, a `bin` entry
- Deployment: `Dockerfile`, `docker-compose.yml`, `vercel.json`, `netlify.toml`, `Procfile`, Helm charts, Terraform
- CI: `.github/workflows/`, `.gitlab-ci.yml` — what it builds, tests, and deploys
- Existing documentation: `README.md`, project `CLAUDE.md`, `CONTRIBUTING.md`

Dependencies are stronger evidence than folder names. A folder called `api/` proves nothing; `spring-boot-starter-web` in `pom.xml` proves a lot.

### 2. Classify

**Web / Frontend** — React, Next.js, Vue, Angular, Svelte, Astro, or plain HTML/CSS/JS. Builds to static assets or a rendered site; the deliverable is a user interface.

Default release: commit and push directly to `main`, unless the repository explicitly defines otherwise.

**Backend / API** — REST or GraphQL services, Spring Boot, Node/Express/Nest, .NET, Django, FastAPI, Go services. The deliverable is a running server other systems depend on.

Default release: feature branch plus Pull Request. Never merge automatically.

**Fullstack** — frontend and backend in one repository. Follow the dominant deployment workflow. If the two halves release differently, read CI and project docs before choosing; when the change touches only one half, follow that half's rules and say so.

**Library / Package** — published for other projects to consume (`"private": false` with an `exports` map, `packaging` set to `jar` without a Spring Boot plugin, a crate, a PyPI package). Do not force web or backend rules; the real constraints here are semantic versioning, public API stability, and the publish pipeline.

**CLI / Tool** — a `bin` entry, an `argparse`/`cobra`/`picocli` command tree, installed and executed rather than served. Release like a library.

**Mobile** — React Native, Flutter, native Android/iOS. Release is gated by store builds; treat as backend-like (branch plus PR) unless the repository says otherwise.

**Infrastructure / Config** — Terraform, Helm, Ansible, GitHub Actions collections. Highest blast radius of all categories. Always branch plus PR, and be explicit about what would actually change on apply.

### 3. Break ties with evidence, not intuition

- **Next.js with API routes, tRPC, or server actions** — fullstack in capability, but if it deploys as one unit to one host, treat it as web and release as web.
- **Spring Boot serving a bundled frontend** — the release risk lives in the backend. Treat as backend.
- **Monorepo** — do not classify the repo; classify the package the change touches. Say which package you classified.
- **`package.json` present but no browser framework** — likely a Node backend, a CLI, or tooling. Check `main`, `bin`, and whether anything listens on a port.
- **Docker present** — tells you how it deploys, not what it is. Weak signal on its own.
- **Contradictory evidence** — read more files. Never resolve a tie by guessing; if it stays ambiguous after a genuine look, state both readings and ask.

### 4. Report

State the classification compactly before acting on it:

```
Type: <category> (<package or module, if a monorepo>)
Evidence: <2-4 concrete files or dependencies that decided it>
Release path: <push to main | branch + PR | publish pipeline>
Relevant skills: <skills to load>
Uncertainty: <what could change this answer, or "none">
```

## Persist the result

Once classified, record the project type, release path, and validation commands in the repository's `CLAUDE.md` (see `start-project`). Re-deriving this on every session wastes effort and risks landing on a different answer than last time.

If `CLAUDE.md` already records a type, trust it — but verify it still matches reality when the manifests or CI have visibly changed since it was written.

## Standard

Classification must be evidence-based and traceable to files you actually read. If you cannot name the evidence, you have not classified — you have assumed.
