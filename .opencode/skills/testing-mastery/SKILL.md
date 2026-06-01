---
name: testing-mastery
description: Testing patterns — unit tests, integration tests, test doubles, assertion styles, test organization, and coverage strategies. Use when writing tests, setting up test infrastructure, or reviewing test coverage.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: coding-standards, error-handling
---

# Testing Mastery

Consistent testing patterns across the codebase. Tests are reliable, fast, and provide meaningful coverage.

## Core rules

1. **Test pyramid** — Unit > integration > e2e. Target: 70%+ unit, 20% integration, ≤10% e2e.
2. **One assertion theme per test** — Multiple asserts allowed only when testing the same behavior.
3. **Arrange-Act-Assert** — Every test has 3 clearly separated sections: setup, invoke, verify.
4. **Test doubles** — Mocks for external boundaries, stubs for return values, fakes for in-memory implementations. Prefer fakes over mocks.
5. **Test organization** — Mirror source tree exactly. `src/user/service.ts` → `tests/user/service.test.ts`.
6. **Coverage targets** — ≥80% line coverage overall. 100% for error paths and edge cases.
7. **No flaky tests** — Never use setTimeout, sleep, or time-based assertions. Deterministic fixtures only.
8. **Behavioral test names** — `returns error when email is already taken`, not `testEmailDuplicate`.
9. **Test isolation** — No shared mutable state. No test-order dependency. Clean up in afterEach/teardown.
10. **Property-based testing** — For functions with invariants (parsing, validation, serialization), use property-based testing.

## Procedures

1. Identify test layer → unit/integration/e2e.
2. Mock at module boundary for unit tests.
3. Use in-memory DB or testcontainers for integration tests.
4. Critical user journeys only for e2e tests.
5. Name test file after source with `.test` suffix.
6. Run with `--shard` in CI.
7. Generate coverage report, verify ≥80%.
8. Add property-based tests for validation/parsing functions.

## Gotchas

- Testing implementation details creates brittle tests.
- Over-mocking produces tests that pass with broken code.
- Snapshot tests must be small (<50 lines).
- Tests passing in isolation but failing in suite = shared state pollution.
- `beforeAll` shared across tests — use `beforeEach` for test-specific state.

## References

| File | Load when |
|------|-----------|
| `references/jest-patterns.md` | Writing tests in TypeScript/Jest |
| `references/pytest-patterns.md` | Writing tests in Python/pytest |
| `references/gotest-patterns.txt` | Writing tests in Go/testing |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Writing unit tests | testing-mastery + error-handling |
| Writing integration tests | testing-mastery + backend-patterns |
| Reviewing test coverage | testing-mastery + code-review-checklist |
| Testing error paths | testing-mastery + error-handling |
| E2E test setup | testing-mastery + backend-patterns + secure-coding |

## Checklist

- [ ] Test follows test pyramid (unit > integration > e2e)
- [ ] One assertion theme per test, AAA separated
- [ ] Test doubles appropriate (fakes > mocks)
- [ ] Test file mirrors source path
- [ ] Line coverage ≥80%, error path 100%
- [ ] No flaky patterns (setTimeout, sleep, time assertions)
- [ ] Test name describes behavior, not implementation
- [ ] Tests fully isolated (no shared state, no order dependency)
- [ ] Property-based tests for validation/parsing functions
- [ ] CI passes with sharding
