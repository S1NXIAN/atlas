---
name: arch-decision-records
description: Architecture Decision Record format, trade-off analysis, status lifecycle, and integration with spec-writer pipeline. Use when making architectural decisions, writing ADRs, reviewing design choices, or planning specs that depend on architecture decisions.
metadata:
  pipeline-stage: spec-writer, plan-crafter
  depends-on: technical-writing
---

# Architecture Decision Records

Systematic documentation of architecture decisions with structured trade-off analysis.

## Core rules

1. **When to write ADR** — New dependency, framework choice, data model change, API design decision, infrastructure change, security model decision.
2. **5 mandatory sections** — Title, Status, Context, Decision, Consequences. All required.
3. **Status lifecycle** — proposed → accepted | rejected (terminal) | deprecated → superseded (terminal). Also: accepted → deprecated (circumstances changed before superseding). Status must reflect actual state.
4. **At least 2 alternatives** — Every decision must compare at least 2 options with trade-off matrix.
5. **Supersedence** — New ADR links to superseded one via `Supersedes: ADR-NNNN`. Chain must be acyclic.
6. **File naming** — `docs/adr/NNNN-title-kebab-case.md`. Sequential numbering, zero-padded to 4 digits.
7. **ADR is not a design doc** — Keep under 2 pages. Be concise, capture the decision not the discussion.
8. **Spec integration** — When architecture decision precedes spec writing, reference the ADR in spec's dependency section.

## Procedures

1. Identify decision point requiring an ADR.
2. Gather alternatives: research each option, list pros and cons.
3. Draft Context: problem statement, constraints, evaluated options.
4. Write Decision: chosen option with rationale.
5. Write Consequences: positive impacts and negative trade-offs.
6. Set Status and create file at `docs/adr/NNNN-title-kebab-case.md`.
7. Link ADR in relevant spec documents.

## Gotchas

- ADR is not a design doc. Max 2 pages. Capture decision, not discussion.
- Status must reflect actual state. Don't mark `accepted` if pending review.
- Supersedence chain must be acyclic. Check that new ADR doesn't create a cycle.
- Missing trade-off matrix means the decision is half-baked. Always compare alternatives.
- Don't ADR trivial decisions (variable naming, file organization). Use coding-standards instead.

## References

| File | Load when |
|------|-----------|
| `references/adr-examples.md` | Need ADR examples or templates |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Database technology decision | arch-decision-records + api-design + error-handling |
| API design choice | arch-decision-records + api-design |
| Framework selection | arch-decision-records + coding-standards |
| Spec writing with architecture dependency | arch-decision-records + spec-analysis + technical-writing |

## Checklist

- [ ] Decision matches ADR trigger criteria (new dep, framework, data model, API, infra, security)
- [ ] All 5 mandatory sections present (Title, Status, Context, Decision, Consequences)
- [ ] At least 2 alternatives compared with trade-off matrix
- [ ] Status matches current reality (not aspirational)
- [ ] Supersedes link correct (if applicable)
- [ ] File named `docs/adr/NNNN-title-kebab-case.md`
- [ ] Consequences include both positive and negative
- [ ] ADR referenced in relevant spec documents
