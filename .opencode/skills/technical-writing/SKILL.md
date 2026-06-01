---
name: technical-writing
description: Standards for README structure, inline documentation, JSDoc/docstring conventions, API documentation envelopes, and Architecture Decision Records. Use when writing README files, documenting public APIs, creating ADRs, or reviewing documentation quality.
metadata:
  pipeline-stage: code-forge, code-clean
  depends-on: coding-standards
---

# Technical Writing

Documentation standards for consistent, maintainable project docs.

## Core rules

1. **README mandatory sections** — `Description`, `Quick Start`, `API/Usage`, `Development`. In that order. No `Introduction` section (redundant with Description).
2. **Comment WHY, not WHAT** — Code should self-document through names and structure. Comments explain rationale, non-obvious tradeoffs, and business rules.
3. **No obvious comments** — `// increment i by 1` is wasted tokens. Delete it.
4. **No commented-out code** — Git history preserves old code. Don't leave it in the source.
5. **No section markers** — No `// ----`, `// ====`, or `// TODO:` without a ticket reference.
6. **JSDoc on public APIs only** — Exported functions, types, interfaces, classes. Private/internal: use descriptive names instead.
7. **ADR format** — Title, Status, Context, Decision, Consequences. All 5 required.

## Procedures

1. Create README: start with Description (what and why), then Quick Start (install + minimal example), then API/Usage (main functionality), then Development (how to contribute).
2. For every public function: add JSDoc with @param (name + type + description), @returns (type + description), @throws (error type + condition).
3. For architectural decisions: create ADR at `docs/adr/NNNN-title-in-kebab-case.md` with all 5 sections.
4. For API endpoints: document summary, description, parameters, requestBody, responses (200 + 4xx/5xx).
5. Review docs: check for commented-out code, section markers, and obvious comments.

## Gotchas

- README `## Installation` is implied by Quick Start for package managers. Don't duplicate.
- ADRs are immutable once accepted. To change: create new ADR superseding the old one.
- No emoji in section headings. Emoji in body only for disambiguation (e.g., ⚠️ security notes).
- JSDoc `@description` is redundant — the first sentence IS the description.
- API doc `operationId` is for tooling. Don't write it by hand — let codegen handle it.

## References

| File | Load when |
|------|-----------|
| `references/doc-templates.md` | Need README, JSDoc, or ADR templates |
| `references/api-doc-standards.md` | Need API documentation format reference |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Creating README | technical-writing + coding-standards |
| Documenting API | technical-writing + api-design |
| Writing ADR | technical-writing + arch-decision-records |
| Final cleanup | technical-writing + cleanup-review |

## Checklist

- [ ] README has all mandatory sections in correct order
- [ ] No commented-out code anywhere
- [ ] No obvious comments (`// increment i by 1` etc.)
- [ ] All public functions have JSDoc with @param, @returns, @throws
- [ ] ADR has all 5 required sections
- [ ] API docs include summary, description, parameters, requestBody, responses
- [ ] No emoji in section headings
