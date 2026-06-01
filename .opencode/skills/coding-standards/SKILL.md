---
name: coding-standards
description: Baseline coding conventions for naming, readability, immutability, DRY/KISS/YAGNI, file organization, and code smell detection across TypeScript, Python, and Go. Use when writing new code, reviewing code quality, or cleaning up code structure. Not for framework-specific patterns — defer to backend-patterns or frontend-patterns.
metadata:
  pipeline-stage: code-forge, code-review, code-clean
  depends-on: none
---

# Coding Standards

Baseline conventions applicable across all projects.

## Core rules

1. **Naming** — Variables/functions: camelCase (TS/Go), snake_case (Python). Classes/PascalCase all languages. Max 50 chars per name. No single-letter names except loop indices.
2. **Function length** — Max 50 lines. Each function does one thing at one level of abstraction.
3. **Nesting** — Max 3 levels deep. Use guard clauses/early returns instead of arrow code.
4. **Immutability** — Prefer `const`/`readonly`/`final`. No parameter reassignment. No shared mutable state across modules.
5. **DRY** — Extract duplicated logic after 2nd occurrence. Max 3 lines of duplication before extraction.
6. **KISS** — Simplest correct solution. No premature abstraction. No speculatively generic interfaces.
7. **YAGNI** — Don't build features before needed. Start simple, refactor when pattern emerges.
8. **Error naming** — Errors follow pattern: `Err*` (Go sentinel), `*Error` (TS class), `*Exception` (Python). See error-handling skill.
9. **Async** — Prefer async/await over raw promises/callbacks. No fire-and-forget without error handling.
10. **File organization** — One public export per file. Max 300 lines per file. Flat imports (no deep relative paths like `../../../../`).

## Procedures

1. Before writing a function, verify the name describes WHAT not HOW (`calculateTotal` vs `processData`).
2. After writing a function, check: does it exceed 50 lines? Does it mix abstraction levels?
3. Check nesting: if you see `if/if/if` or `if/else/if/else`, refactor to guard clauses or strategy pattern.
4. Check for magic numbers/strings: every literal except 0, 1, -1, empty string must be a named constant.
5. Check for dead code: delete unused imports, functions, and commented-out blocks.
6. Run project formatter and linter before committing.
7. Flag any `any` type (TS) without justification comment.

## Gotchas

- DRY at the expense of readability is wrong: if extracting adds indirection without clarity, inline is better.
- `const` does NOT mean immutable in JS/TS — only the binding is immutable. Use `Readonly<T>` for deep immutability.
- Python's `final` (3.8+ `typing.Final`) is a type hint only — not enforced at runtime.
- Go uses PascalCase for exported symbols, camelCase for unexported. Forgetting this causes compilation errors.
- 50-line limit is for function bodies (the `{ }` block), not including doc comments.

## References

| File | Load when |
|------|-----------|
| `references/language-patterns.md` | Need language-specific naming/import conventions |
| `references/anti-patterns.txt` | Reviewing code for known anti-patterns |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Writing new module | coding-standards + error-handling + backend-patterns |
| Code review | coding-standards + code-review-checklist |
| Code cleanup | coding-standards + error-handling |
| Writing tests | coding-standards + testing-mastery |

## Checklist

- [ ] All functions ≤50 lines, single responsibility
- [ ] No nesting >3 levels
- [ ] No magic numbers/strings without named constants
- [ ] No `any` types without justification
- [ ] No dead code or commented-out blocks
- [ ] All public functions have doc comments
- [ ] Imports are flat (no `../../` chains)
- [ ] Project linter passes with zero warnings
