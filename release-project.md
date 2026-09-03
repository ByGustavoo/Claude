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

## Before any Git write operation

Never write to Git based on assumption. Run these first, and read the output:

```bash
git status                     # what is staged, modified, untracked
git branch --show-current      # where you are
git remote -v                  # where it would go
git log --oneline -20          # the commit convention in use
git diff                       # what actually changed
git diff --staged
```

Then:

- Determine the project type with `project-classifier`.
- Identify untracked and sensitive files.
- Confirm nothing unrelated to this task is about to be swept in.

**Never assume the last commit number.** Read it.

## Hard limits

Ask before, and never do silently:

- `git push --force` or any rewrite of published history
- `git reset --hard`, `git clean -fd`, or anything that discards uncommitted work
- Committing to a branch other than the one the user is on
- Merging a Pull Request
- Deleting branches or tags
- Committing files that are or may contain secrets

If any of these seems necessary, stop and explain why rather than proceeding.

## Secret scan

Before staging, scan the diff for anything that must not be published:

- `.env` and variants, credential files, `*.pem`, `*.key`, `*.p12`, keystores
- API keys, tokens, passwords, connection strings with embedded credentials
- Private URLs, internal hostnames, real customer data in fixtures
- Cloud credentials, service-account JSON

If something like this appears, stop and report it. Do not commit it, and do not commit "everything except that file" without saying what you excluded — a secret already committed earlier still needs handling, and quietly skipping it hides the problem.

Also check for what does not belong in the commit: `console.log` and `System.out.println` left from debugging, commented-out code, temporary scripts, generated build output, IDE files, unrelated formatting churn.

## Commit numbering

The user maintains sequential numeric commit identifiers. The number must be derived from the actual history, never guessed.

**Procedure:**

1. Read recent subjects: `git log --pretty=format:'%s' -30 --no-merges`
2. Identify the pattern in use — it may be `12`, `12 - descrição`, `#12 descrição`, or another shape. Preserve whatever the repository already does.
3. Take the **highest** number found in that history, not simply the number on the most recent commit — rebases and merges can leave history out of order.
4. The next commit is that number plus one.
5. On a feature branch, continue the sequence from the repository's overall history, so the numbers do not collide when the branch merges.

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

## Writing the commit

The user prefers the interactive `git commit` flow over `git commit -m`, because it lets them see and edit the full message before it lands — not because of the editor itself.

An agent cannot open that editor, so preserve the intent instead: write the complete message, show it to the user, and commit from a file once they are satisfied.

```bash
cat > /tmp/commit-msg.txt <<'EOF'
15 - descrição curta do que mudou

Contexto e motivo da mudança.

- ponto relevante
- outro ponto relevante
EOF

git commit -F /tmp/commit-msg.txt
```

This produces the same result the editor flow would, with the same chance to review. Keep the subject line short and the body explaining *why*, in the language the repository already uses.

Stage deliberately — name the files rather than reaching for `git add .`, so that unrelated changes cannot ride along unnoticed.

## Change analysis

Before committing, work out for yourself: files changed, what was added and removed, what behaviour changed, documentation touched, tests added or changed, and anything that could break a consumer. This is what makes the commit message and PR description accurate instead of generic.

Do not include unrelated changes in the commit. If the working tree has two unrelated pieces of work, commit them separately or ask which one to publish.

## Validation

Run the project's real checks before publishing — see `testing`.

- Backend/API: unit tests, integration tests when available, the build task, and a look at what CI will run
- Web/frontend: build, lint, type check, and visual verification of what changed (see `elite-web-experience`)

If validation fails, do not present the release as successful. Report the failure and stop. **Never claim tests passed unless they actually passed.**

## Release by project type

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

## Pull Request description

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

## GitHub integration

When a GitHub integration or `gh` CLI is available, use it for repository and PR operations rather than constructing URLs or reconstructing repository metadata by hand.

## Completion report

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
