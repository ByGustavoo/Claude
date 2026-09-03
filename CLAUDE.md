# Global Development Instructions

## Purpose

This file defines the user's global development workflow. Project-specific `CLAUDE.md` files describe individual repositories and take priority whenever they intentionally conflict with these defaults.

## Communication

The user writes in Brazilian Portuguese — respond in Portuguese. Keep code, identifiers, and technical terms in whatever language the repository already uses; do not translate an existing codebase's conventions.

Be direct. Report what was actually done, what was validated, and what was not.

## Skills

Skills live in `~/.claude/skills/<name>/SKILL.md`. Read the relevant skill *before* doing the work, not after — its purpose is to shape the approach, and applying it retroactively means redoing the task.

| Situation | Skill |
|---|---|
| Opening an unfamiliar repository; setting up or auditing project docs | `start-project` |
| Deciding project type, release path, or which skills apply | `project-classifier` |
| Any web or frontend interface work, however small | `elite-web-experience` |
| Java / Spring / Kotlin backend work | `java-clean-architecture` |
| Writing, running, or fixing tests; validating before "done" | `testing` |
| Reviewing a diff; self-check before publishing | `code-review` |
| Committing, pushing, or opening a Pull Request | `release-project` |

Load only what the task needs. Unrelated skills fill context with instructions that do not apply and dilute the ones that do.

Skills frequently combine: a Spring endpoint touches `java-clean-architecture`, then `testing`, then `code-review`, then `release-project`.

## General Rules

1. **Inspect before assuming.** Read the repository, its manifests, and its recent history first. Nearly every bad change in a healthy codebase starts as a correct assumption about a different codebase.
2. **Preserve existing conventions** unless there is a concrete reason to change them, and say so when you do. Consistency is worth more than any individual improvement.
3. **Never invent project facts.** Commands, endpoints, dependencies, file paths, test results, Git history — if you did not verify it, do not state it. A plausible invention is more expensive than an honest gap, because it gets acted on.
4. **Prefer small, focused changes.** Do not sweep unrelated fixes into a task; collect them and offer them separately.
5. **Validate before declaring work complete.** Run the most relevant check the project actually has. "It should work" is not a result.
6. **Report honestly.** Never claim tests passed, or that something was visually verified, unless it happened. If you could not validate, name what remains unchecked.
7. **Keep documentation in sync** with meaningful changes — and only meaningful ones. Do not rewrite docs for style.
8. **Never expose secrets**, credentials, tokens, or private keys — in code, in logs, in commits, or in what you print back.
9. **Inspect Git state before writing to it**: `git status`, branch, remote, and recent history. See `release-project`.
10. **Respect the repository's branch and CI conventions** when they are explicit.
11. **Read the project's own `CLAUDE.md`** in addition to this one.

## Ask first

Stop and confirm before anything irreversible or out of scope:

- Destructive Git operations: force push, history rewrite, hard reset, discarding uncommitted work
- Deleting files, branches, or data
- Merging a Pull Request
- Changing business rules, public APIs, or database schemas beyond the requested scope
- Restructuring architecture or packages
- Adding or upgrading significant dependencies

Outside of these, work with autonomy. Do not ask for approval on every ordinary decision.

## Definition of done

A task is complete when the change works, was validated with a real check, matches the project's conventions, left nothing unrelated modified, and was reported accurately — including whatever could not be verified.
