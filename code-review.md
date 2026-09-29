---
name: code-review
description: Review changes for correctness, regressions, security, data loss, broken business rules, and maintainability, grounded in the actual repository rather than generic best practices. Use when the user asks to review, check, audit, or sanity-check code or a diff - "revisa isso pra mim", "ta certo esse codigo?", "olha esse PR", "achei que quebrou alguma coisa" - and as a self-check before committing, pushing, or opening a Pull Request. Trigger it after implementing anything non-trivial, even without being asked, because the cheapest moment to catch a regression is before it is published.
---

# Code Review

## Responsibility

Find the problems that matter in a set of changes, explain them so they can be acted on, and say clearly when there is nothing to find.

Review is judgement, not a checklist pass. The value is in noticing what the diff does not show: the caller that now receives a different shape, the migration that runs against existing rows, the early return that skips a side effect.

## Process

### 1. Establish what changed and why

| Command | Shows |
|---|---|
| `git status` | Staged, modified and untracked files |
| `git diff` | Unstaged changes |
| `git diff --staged` | Staged changes |
| `git diff <default>...HEAD` | The whole branch against the default branch |
| `git log --oneline -10` | Recent history |

Find the default branch instead of assuming `main`: `git symbolic-ref --short refs/remotes/origin/HEAD` names it, and `git branch -a` shows the candidates when that fails. A review against the wrong base either misses changes or reports someone else's.

Before judging the code, understand the intent. Take it from the user's request, the PR description, the commit messages, and any issue or requirements document they point to (`REQUISITOS.md`, `API_CONTRACT.md`). A change that is technically fine but solves the wrong problem is the most expensive kind of defect, and it is invisible if you only read the diff line by line.

### 2. Read beyond the diff

The changed line is rarely the whole story. For each meaningful change, look at:

- **Callers** — who invokes this, and does the change alter what they receive?
- **Tests** — do existing tests still cover this behaviour? Should new ones exist?
- **Configuration** — did behaviour change without config changing to match?
- **Error paths** — what happens when this fails, and who finds out?
- **Persistence** — schema, migrations, transaction boundaries, what happens to existing data
- **Contracts** — API responses, event payloads, exported types, public function signatures

A diff can look correct in isolation and still be a regression two files away.

### 3. Review in priority order

Work down this list. A finding high on the list outranks any number of findings below it.

1. **Correctness** — does it do what it is supposed to do, including at the edges?
2. **Data loss and destructive behaviour** — irreversible deletes, migrations without a path back, overwrites, unbounded updates
3. **Security** — injection, missing authorization, leaked secrets, unsafe deserialization, unvalidated input crossing a trust boundary, sensitive data in logs
4. **Business rules** — does the change silently alter a rule the domain depends on?
5. **Contract regressions** — breaking changes to APIs, schemas, or public interfaces
6. **Performance** — N+1 queries, unbounded result sets, work inside loops, blocking calls on hot paths
7. **Architecture** — does it violate the boundaries this project has chosen?
8. **Maintainability** — clarity, duplication, dead code, misleading names
9. **Style** — last, and only where the project has an actual convention being broken

### 4. Verify claims instead of trusting them

If the change says it fixes something, check that it does. If it says tests pass, run them or say you did not. A review that repeats the author's claims back adds nothing.

### 5. Hold your own work to the same bar

When the review is a self-check of code you just wrote, the author's blind spots are yours. Re-read the diff as if someone else had written it, and look hardest at what you were least sure of while writing: the edge case you decided not to handle, the caller you did not open, the test you did not run. Approving your own change because it matches what you intended proves only that it matches what you intended.

## Findings

For each real issue:

- **What** is wrong
- **Where** — file and line
- **Why it matters** — the concrete consequence, not "this is bad practice"
- **A concrete fix** — enough to act on

Severity, so the reader knows what to do first:

| Level | Meaning |
|---|---|
| **Bloqueante** | Do not ship. Breaks correctness, loses data, or opens a security hole. |
| **Importante** | Should be fixed now. Real risk or significant maintenance cost. |
| **Sugestão** | Worth doing, safe to defer. |
| **Nit** | Preference. Explicitly optional. |

Never let a `Nit` sit above a `Bloqueante`, and never inflate a preference into a blocker to make the review look substantial.

**Example finding:**

> **Bloqueante** — `OrderService.java:87`
> `findById` returns `Optional` but `.get()` is called without checking. A request for a deleted order now returns HTTP 500 instead of 404, and the stack trace leaks the entity name.
> Use `.orElseThrow(() -> new OrderNotFoundException(id))` and map that exception to 404 in the existing handler at `GlobalExceptionHandler.java:34`.

## Output format

```markdown
## Review — <scope>

**Verdict:** <approved | approved with comments | changes required>
**Reviewed:** <N files, what was inspected beyond the diff>
**Validation:** <tests run and their result, or explicitly: not executed>

### Bloqueante
### Importante
### Sugestão
### Nit
```

Omit empty sections. Keep the review as short as the changes allow.

## Pre-release review

Before a commit, push, or PR, additionally check for:

- Secrets, tokens, keys, connection strings, `.env` files
- Debug leftovers: `console.log`, `System.out.println`, `printStackTrace`, commented-out code, `TODO` markers left as reminders
- Comments of any kind added to source, build or configuration files — line and block comments, JSDoc and Javadoc, JSX `{/* */}`, CSS and HTML comments, `--` in SQL, `#` in YAML, `.properties` and `.gitignore`, `<!-- -->` in XML, section banners, and group labels such as `// Spring Boot` over dependency lines. Projects here carry no comments unless the user asked for one; the only exceptions are `.env` files, directives a tool reads, such as `/// <reference>` or `@SuppressWarnings`, and tool-generated files such as the Gradle wrapper scripts
- Temporary or generated files that should not be tracked
- Unrelated modifications swept into the change
- Risky changes with no test covering them
- Documentation that the change just made inaccurate

## Standard

Prefer evidence from this repository over generic best practices. "This project uses MapStruct everywhere else" is a real finding; "you should consider using a mapper" usually is not.

The user's own conventions count as project evidence. In a Java backend, the review checklist and the test model of `java-clean-architecture` apply; in a web interface, the closing checklist of `elite-web-experience` applies. A change that breaks one of those rules is a finding with the same standing as a break from the repository's own code.

Do not manufacture issues to make a review look thorough. Inventing findings costs the reader more than it costs you, and it makes the real findings harder to trust.

**A clean review with no findings is a legitimate result.** Say so plainly, state what you inspected, and stop.
