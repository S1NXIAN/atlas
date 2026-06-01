---
name: code-review-checklist
description: Code review checklist covering correctness, security, performance, maintainability, and style. Use when reviewing PRs, preparing code for review, or establishing review standards.
metadata:
  pipeline-stage: code-review, security-scan
  depends-on: coding-standards, backend-patterns, frontend-patterns, api-design, database-migrations
---

# Code Review Checklist

Structured code review process covering all dimensions of code quality.

## Core rules

1. **Correctness** — All paths handled: success, error, edge cases. Tests for each.
2. **Security** — Input validated at trust boundaries. No injection. Auth on every endpoint. Rate limiting.
3. **Performance** — No N+1 queries. Queries indexed. Caching applied. No sync blocking in async paths.
4. **Maintainability** — Readable code. Single responsibility. Comments explain WHY not WHAT.
5. **Style** — Coding standards followed. Linter passes. No magic numbers. ≤3-level nesting.
6. **Error handling** — Every error handled or propagated. No empty catch blocks. Typed errors.
7. **Logging** — Structured logs with correlation ID. No sensitive data in logs.
8. **Testing** — Tests cover the change. ≥80% coverage on new code. No flaky tests.
9. **Dependencies** — Justified. Pinned. No known vulnerabilities. License compatible.
10. **Documentation** — Public API documented. Migration notes. ADR for architecture changes.

## Procedures

Before starting: read PR description, linked issue, and any ADR to understand context.

1. **Check correctness** — Trace main path, error paths, edge cases. Run tests.
2. **Security scan** — Input validation at boundaries, auth on endpoints, no injection.
3. **Performance review** — N+1 queries, indexes, caching, sync blocking in async paths.
4. **Architecture & maintainability** — Follows layered architecture? Single responsibility? No circular deps? Comments explain WHY.
5. **Style check** — Coding standards followed. Linter passes. No magic numbers. ≤3-level nesting.
6. **Error handling** — Every catch block: handled, re-thrown, or logged? No empty catches.
7. **Logging** — Structured fields with correlation ID? No sensitive data in logs?
8. **Tests** — Run suite. New code ≥80% coverage. Edge cases covered. Deterministic.
9. **Dependencies** — New dependencies justified? Versions pinned? No known vulns?
10. **Documentation** — Public APIs documented. Migration notes if schema changed. ADR if architecture changed.

## Gotchas

- Reviewing style before correctness is wasted time.
- Approving without running code misses runtime errors.
- Nitpicking trivial issues frustrates contributors.
- Missing architecture fit (clean PR can be wrong architecture).

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Reviewing a PR | code-review-checklist + testing-mastery + secure-coding |
| Security-focused review | code-review-checklist + secure-coding + auth-patterns |
| Architecture review | code-review-checklist + api-design + backend-patterns |
| Frontend review | code-review-checklist + frontend-patterns |
| Schema change review | code-review-checklist + database-migrations |

## Checklist

- [ ] All code paths handled and tested (success, error, edge cases)
- [ ] Input validated at all trust boundaries; no injection vectors
- [ ] No N+1 queries; async paths have no blocking calls
- [ ] Code readable, follows conventions, WHY comments present
- [ ] Linter/formatter passes with zero warnings
- [ ] All errors handled or propagated; no empty catch blocks
- [ ] Structured logging with correlation IDs; no sensitive data in logs
- [ ] Tests cover the change; no flaky tests; ≥80% coverage on new code
- [ ] Dependencies justified, pinned, scanned for vulnerabilities
- [ ] Public APIs documented; migration notes present; ADR if architecture changed
