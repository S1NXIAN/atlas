---
name: code-scout-tactics
description: Codebase navigation and analysis tactics — reading unfamiliar code, finding entry points, tracing request flows, understanding architecture from code, and documentation generation. Use when exploring a new codebase, understanding a feature, or documenting architecture.
metadata:
  pipeline-stage: code-scout
  depends-on: coding-standards, technical-writing
---

# Code Scout Tactics

Systematic approach to exploring unfamiliar codebases, tracing request flows, and documenting architecture.

## Core rules

1. **Find entry points first** — Locate main() functions, route registrations, event handlers, queue consumers, and cron triggers. List all entry points before reading any business logic.
2. **Trace patterns, not implementations** — Read middleware chains, error handling, logging, and auth first. These reveal the architecture's conventions and constraints.
3. **Read tests first** — Tests are the most reliable documentation. Start with integration tests to understand system behavior; read unit tests for edge cases.
4. **Map module boundaries** — List imports and exports per module. Detect circular dependencies. A module importing 10+ other modules is doing too much.
5. **Follow one request end-to-end** — Trace HTTP → middleware → handler → service → data. Document each transformation the data undergoes.
6. **Identify the data model** — Schema definitions, database migrations, entity classes, and TypeScript types. The data model reveals the domain model.
7. **Look for ADRs and design docs** — Search `docs/adr/`, `docs/decisions/`, `docs/rfcs/`. ADRs explain WHY decisions were made, not just what.
8. **Use dependency graph tools** — Run depcruise, go mod graph, pipdeptree, or madge. Visualize coupling and package boundaries.
9. **Document findings** — Produce an architecture overview (1 page), a context diagram (1 page), and a key files map (1 page) in `docs/scout-notes/`.
10. **Build a domain glossary** — Collect terms, their definitions, and file references. Share with the team for alignment.

## Procedures

1. Find entry points: search for `func main`, route groups, event listeners, queue workers, cron schedules.
2. Read the middleware chain: auth, logging, error handling, request validation.
3. Read the test directory structure: integration tests first, then unit tests.
4. Run a dependency graph tool to visualize module coupling.
5. Pick one feature and trace it end-to-end: route → handler → service → data store.
6. Find data model files: schemas, migrations, entities, types.
7. Search for `docs/adr/`, `docs/decisions/`, or `docs/rfcs/` and read the founding ADRs.
8. List module boundaries and detect circular dependencies.
9. Write a 1-page architecture overview with an ASCII or Mermaid diagram.
10. Build a domain glossary: terms, definitions, and file references.

## Gotchas

- Assuming convention is followed everywhere — spot-check at least 3 different modules.
- Missing the test directory — search for `test/`, `spec/`, `__tests__/`, and `*.test.*` patterns.
- Skipping build and deploy config — Dockerfile, CI config, and env files reveal architecture constraints.
- Not asking the team for context — after 1 hour of exploration, ask targeted questions to fill gaps.
- Documenting too much detail — limit to 1-page overview + 1-page key files + 1-page glossary.

## References

| File | Load when |
|------|-----------|
| `references/code-reading.md` | Choosing a code reading strategy for unfamiliar code |
| `references/arch-recovery.md` | Running dependency graph tools and creating C4 diagrams |
| `references/query-patterns.txt` | Using grep one-liners to find entry points, routes, models |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Exploring new codebase from scratch | code-scout-tactics + coding-standards + technical-writing |
| Tracing request end-to-end | code-scout-tactics + backend-patterns + api-design |
| Documenting architecture | code-scout-tactics + technical-writing + arch-decision-records |
| Onboarding to a team | code-scout-tactics + git-workflow + technical-writing |
| Finding production bug source | code-scout-tactics + error-handling + backend-patterns |

## Checklist

- [ ] Entry points identified: main, routes, event handlers, queues, crons
- [ ] Cross-cutting patterns traced: middleware, error handling, logging, auth
- [ ] Tests read before implementation: integration first, then unit
- [ ] Module boundaries mapped: imports/exports per module, circular deps detected
- [ ] One request traced end-to-end: route → handler → service → data
- [ ] Data model identified: schemas, migrations, entities, relationships
- [ ] ADRs and design docs found; founding ADR read
- [ ] Dependency graph visualized
- [ ] Architecture overview written (1 page) + key files map (1 page)
- [ ] Domain glossary built: terms, definitions, file references shared
