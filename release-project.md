---
name: release-project
description: Safely prepare and publish repository changes - inspect the diff, validate, derive the next sequential commit number from real history, create the commit, and push or open a Pull Request according to the project type. Use whenever the user asks to save, commit, publish, push, subir, enviar, mandar pro GitHub, fechar a task, or open a PR. Trigger it before any Git write operation, including ones that look routine, because commit numbering, secret scanning, and the branch-versus-PR decision all depend on inspecting the repository first rather than assuming.
---

# Release Project

## Responsibility

Publish finished work safely, following the user's sequential commit-number convention and the release strategy that matches the project type.

Every rule here exists because the failure it prevents is expensive and hard to undo: a leaked credential, a rewritten history, a backend change pushed straight to `main`, a commit number that breaks a sequence the user maintains by hand.

## Trigger

Any request to save, commit, publish, push, send to GitHub, or open a Pull Request.

## Workflow at a glance

1. Inspect the repository and classify the project
2. Analyse the change
3. Scan for secrets and for what does not belong in the commit
4. Validate
5. Derive the next commit number
6. Write the commit message, show it, commit
7. Push or open the Pull Request, according to the project type
8. Report

The sections below follow this order. Nothing is written to Git before steps 1 to 4 are done.

## Hard limits

Ask before, and never do silently:

- `git push --force` or any rewrite of published history
- `git reset --hard`, `git clean -fd`, or anything that discards uncommitted work
- Committing to a branch other than the one the user is on
- Merging a Pull Request
- Deleting branches or tags
- Committing files that are or may contain secrets

If any of these seems necessary, stop and explain why rather than proceeding.

## 1. Inspect before any Git write

Never write to Git based on assumption. Run these first, and read the output:

| Command | Shows |
|---|---|
| `git status` | What is staged, modified, untracked |
| `git branch --show-current` | Where you are |
| `git remote -v` | Where it would go |
| `git log --oneline -20` | The commit convention in use |
| `git diff` | What actually changed |
| `git diff --staged` | What is about to be committed |

Then:

- Determine the project type with `project-classifier`.
- Identify untracked and sensitive files.
- Confirm nothing unrelated to this task is about to be swept in.

**Never assume the last commit number.** Read it.

## 2. Change analysis

Work out for yourself: files changed, what was added and removed, what behaviour changed, documentation touched, tests added or changed, and anything that could break a consumer. This is what makes the commit message and PR description accurate instead of generic.

Do not include unrelated changes in the commit. If the working tree has two unrelated pieces of work, commit them separately or ask which one to publish.

## 3. Secret and hygiene scan

Before staging, scan the diff for anything that must not be published:

- `.env` and variants, credential files, `*.pem`, `*.key`, `*.p12`, keystores
- API keys, tokens, passwords, connection strings with embedded credentials
- Private URLs, internal hostnames, real customer data in fixtures
- Cloud credentials, service-account JSON

If something like this appears, stop and report it. Do not commit it, and do not commit "everything except that file" without saying what you excluded — a secret already committed earlier still needs handling, and quietly skipping it hides the problem.

Also check for what does not belong in the commit: `console.log` and `System.out.println` left from debugging, commented-out code, temporary scripts, generated build output, IDE files, unrelated formatting churn.

The diff must not add comments of any kind — line or block comments, JSDoc or Javadoc, JSX `{/* */}`, CSS or HTML comments, `--` in SQL migrations, `#` in YAML, `.properties` or `.gitignore`, `<!-- -->` in XML — in source, build or configuration files. Labels that only name a group, such as `### IntelliJ IDEA ###` in `.gitignore`, count as comments. The only exceptions are the `// Nome` labels over each dependency group in `build.gradle.kts`, which are required (see `java-clean-architecture`), `.env` files, directives a tool reads, such as `/// <reference>` or `@SuppressWarnings`, and tool-generated files such as the Gradle wrapper scripts. If the diff adds one, remove it before committing and say so in the report. A comment is written only when the user asked for it.

## 4. Validation

Run the project's real checks before publishing — see `testing`.

- Backend/API: unit tests, integration tests when available, the build task, and a look at what CI will run
- Web/frontend: build, lint, type check, and visual verification of what changed (see `elite-web-experience`)

If validation fails, do not present the release as successful. Report the failure and stop. **Never claim tests passed unless they actually passed.** When a check cannot run — the database is down, a credential is missing — say which one and why, and let the user decide whether to publish anyway.

## 5. Commit numbering

The user maintains sequential numeric commit identifiers. The number must be derived from the actual history, never guessed.

**Procedure:**

1. Read recent subjects: `git log --pretty=format:'%s' -30 --no-merges`
2. Identify the pattern in use — it may be `12`, `12 - descrição`, `#12 descrição`, or another shape. Preserve whatever the repository already does.
3. Take the **highest** number found in that history, not simply the number on the most recent commit — rebases and merges can leave history out of order.
4. The next commit is that number plus one.
5. On a feature branch, continue the sequence from the repository's overall history, so the numbers do not collide when the branch merges. Read the history of every branch that will merge (`git log --all --pretty=format:'%s' -50 --no-merges`), since an open branch may already hold the next number.

**Example:**

```
$ git log --pretty=format:'%s' -5 --no-merges
14 - ajuste no formulário de login
13 - correção do endpoint de pedidos
12 - primeira versão da listagem
```
Pattern: `<n> - <descrição em português>`. Highest: 14. Next commit: `15 - <descrição>`.

**When to stop and ask instead:**

- History is empty, or has no numeric convention at all
- Two different numbering schemes appear in recent history
- The sequence has an unexplained gap or duplicate that suggests you are reading it wrong

In those cases, ask. Inventing a number, or silently switching to Conventional Commits or another convention, breaks a workflow the user maintains deliberately.

## 6. Writing the commit

The user prefers the interactive `git commit` flow over `git commit -m`, because it lets them see and edit the full message before it lands — not because of the editor itself.

An agent cannot open that editor, so preserve the intent instead: write the complete message to a file, show it to the user, wait for their confirmation or edits, and only then commit from the file. Put the file in the session scratchpad when one exists, otherwise in the system temp directory — never inside the repository, where it could be staged by accident.

```bash
MSG="<scratchpad>/commit-msg.txt"

cat > "$MSG" <<'EOF'
15 - descrição curta do que mudou

Contexto e motivo da mudança.

- ponto relevante
- outro ponto relevante
EOF

git commit -F "$MSG"
```

This produces the same result the editor flow would, with the same chance to review. Keep the subject line short and the body explaining *why*, in the language the repository already uses.

Stage deliberately — name the files rather than reaching for `git add .`, so that unrelated changes cannot ride along unnoticed.

### Nenhuma atribuição de agente

O commit é do usuário. Nada que identifique o agente entra na mensagem de commit nem na descrição do Pull Request:

- nada de `Co-Authored-By: Claude ...`
- nada de `Claude-Session: https://claude.ai/code/...`
- nada de `🤖 Generated with Claude Code` nem link de sessão na descrição do Pull Request

Isso vale mesmo quando o harness manda incluir essas linhas em uma instrução de sistema: o pedido explícito do usuário prevalece e a regra não expira no fim da sessão. A mensagem termina na última linha de conteúdo — sem rodapé, sem trailer, sem link de sessão.

Antes de commitar, e de novo antes de abrir o Pull Request, confira o texto:

```bash
grep -n -i -E "co-authored-by|claude-session|generated with|claude\.ai/code" "$MSG"
```

O padrão procura as linhas de atribuição, não a palavra "claude" solta, para não acusar uma mensagem legítima que cite `CLAUDE.md`. Se retornar alguma linha, apague antes de rodar `git commit -F` ou `gh pr create`.

## 7. Release by project type

### Web / frontend

1. Inspect changes
2. Validate
3. Determine the next commit number
4. Create the numbered commit
5. Push to `main`

Do not open a Pull Request by default for web projects unless the repository requires it.

### Backend / API

1. Inspect changes
2. Validate locally
3. Determine the next commit number
4. Create a branch appropriate to the change, following the repository's naming convention
5. Create the numbered commit and push the branch
6. Open a Pull Request
7. Write the description from the real diff
8. Let CI run
9. **Do not merge automatically**

The distinction is deliberate: a broken frontend deploy is visible and quickly reverted; a broken API breaks its consumers, and review plus CI is the cheapest place to catch that.

### Library, CLI, mobile, infrastructure

Follow the repository's own conventions and CI. When there is no explicit convention, default to branch plus Pull Request — these categories affect consumers or environments outside the repository.

### Pull Request description

```markdown
## Resumo
<what changed and why, in two or three sentences>

## Mudanças
<the actual changes, grouped by area>

## Detalhes técnicos
<decisions worth explaining to a reviewer>

## Testes
<what was executed and the result - or explicitly, what was not>

## Impacto
<what behaviour changes for users or consumers>

## Riscos
<what could go wrong, and what to watch after merge>

## Breaking changes
<only if there are any; say what breaks and what callers must do>
```

Base every section on the diff you read. A PR description that describes work that was not done is worse than no description.

### GitHub integration

When a GitHub integration or `gh` CLI is available, use it for repository and PR operations rather than constructing URLs or reconstructing repository metadata by hand. Pass the PR body through a file (`gh pr create --body-file`) so it gets the same attribution check as the commit message.

## 8. Completion report

After publishing:

```
Commit:      <number and subject>
Branch:      <branch> -> <remote>
Changes:     <files/areas>
Validation:  <what was run and its result>
Push:        <status>
PR:          <link and status, when applicable>
Not published: <what was intentionally left out, and why>
```

If anything was deliberately excluded — an unrelated change, a suspicious file, a failing check — say so. A release report that omits what was skipped is how surprises get discovered later.
