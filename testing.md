---
name: testing
description: Design and run a testing strategy proportional to the risk of a change - choosing between unit, integration and end-to-end tests, discovering the project's runner and conventions, writing tests that fail for real regressions, and reporting results honestly. Use when asked to write, fix, run, or improve tests; when a change touches business rules, persistence, or an API contract; when a test is flaky or failing; and before claiming that any work is complete. Trigger it even when the user did not mention testing, because "done" without executed validation is a claim, not a fact.
---

# Testing

## Responsibility

Decide what is worth testing for a given change, write tests that would actually catch a regression, run them, and report what really happened.

## Proportionality

Test coverage should follow risk, not habit. Before writing anything, ask what would break and who would notice:

| Change | Reasonable response |
|---|---|
| Business rule, calculation, state transition | Unit tests, including edge cases |
| Persistence, query, migration | Integration test against a real database |
| API contract, status codes, serialization | Integration test at the HTTP layer |
| Critical user flow across boundaries | One end-to-end test, not ten |
| Copy, styling, spacing | Usually none — visual verification instead |
| Refactor with no behaviour change | Existing tests must pass unchanged; that is the point |

Tests have a cost: they are read, maintained, and debugged for as long as the code lives. A test that duplicates another one, or that asserts an implementation detail, is a permanent tax with no return.

## Before writing tests

1. **Find the runner and the commands.** Read `package.json` scripts, `pom.xml`, `build.gradle`, `Makefile`, and CI configuration. Use what the project uses.
2. **Read an existing test.** It shows naming, structure, fixture style, and assertion library faster than any convention document.
3. **Reuse existing fixtures, builders, and helpers.** A second parallel test-data strategy is as costly as a second mapping strategy.
4. **Identify what behaviour actually changed** — that is what needs covering, not the whole file.

Common commands, to be verified against the project rather than assumed:

```bash
mvn test                              # Maven unit
mvn verify                            # Maven, including integration
./gradlew test                        # Gradle
npm test / npm run test:unit          # Node
npx vitest run / npx jest             # Vitest / Jest directly
pytest -q                             # Python
go test ./...                         # Go
```

## Test layers

**Unit** — isolated logic, no I/O, no framework context. Business rules, validation, edge cases, deterministic behaviour. These should be fast enough to run constantly.

**Integration** — real components talking to each other: database and repositories, HTTP layer, external adapters, Spring context. Use Testcontainers over in-memory substitutes when the production database differs, because an H2 test that passes while PostgreSQL would fail is worse than no test at all.

**End-to-end** — complete flows across boundaries. Slow and fragile by nature, so keep them few and reserve them for paths where failure is unacceptable.

## Writing good tests

- **Name the behaviour, not the method.** `shouldRejectOrderWhenCustomerHasNoCredit` tells you what broke; `testCreateOrder2` does not.
- **Structure as arrange / act / assert.** The separation makes the intent readable at a glance.
- **Assert the outcome, not the mechanics.** Verifying that a method was called once couples the test to the implementation; verifying the resulting state survives refactoring.
- **Keep tests deterministic.** No real clock, no random values, no network, no dependence on execution order, no shared mutable state between tests. Inject time and randomness.
- **One reason to fail per test.** When a test with six assertions fails, you learn less than you should.
- **Cover the edges that matter**: empty, null, boundary values, duplicates, concurrent access, and the failure path — not just the happy path.
- **Verify a new test fails without the fix.** A test that passes against the broken code proves nothing, and this is the single most common defect in test suites.

## Backend / API specifics

For REST endpoints, consider: valid request, validation errors, not-found, unauthorized versus forbidden, business rule violation, persistence behaviour, serialization and deserialization, status codes, and error response shape.

For persistence: mapping correctness, transactional behaviour, cascade and orphan removal effects, constraint violations, and query results against realistic data volumes.

## Frontend specifics

Test behaviour a user could observe: rendered output, interaction results, conditional states, form validation. Query by role and accessible name rather than by CSS class or test id where possible — it tests what the user experiences and breaks less on refactors.

Do not unit-test styling. Verify visual work visually (see `elite-web-experience`).

## Flaky tests

A flaky test is a defect, not a nuisance. Ignoring it teaches the team to ignore red builds, which is how real regressions ship.

Usual causes: timing and arbitrary waits, shared state between tests, order dependence, real clock or timezone, unseeded randomness, external network. Find the cause. Do not add a retry or a `sleep` to hide it, and do not disable the test without saying so explicitly.

## Reporting

Report what was executed, with the actual outcome:

```
Command: <exact command>
Result: <N passed, N failed, N skipped>
Failures: <name and cause, if any>
Not executed: <what remains and why>
```

**Never claim tests passed without running them or having reliable CI evidence.** If they cannot be run — missing service, absent credentials, no database — say so plainly and name the command that still needs to run. An honest "not verified" is useful; a false "all green" destroys trust in every other statement you make.
