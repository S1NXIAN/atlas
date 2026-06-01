---
name: spec-analysis
description: Requirements parsing, ambiguity detection, acceptance criteria formulation (Given/When/Then), scope boundary patterns, and dependency identification. Use when writing specs, reviewing requirements, or estimating scope.
metadata:
  pipeline-stage: spec-writer
  depends-on: none
---

# Spec Analysis

Systematic requirements analysis for clear, testable specifications.

## Core rules

1. **Flag weasel words** — "should", "may", "could", "might", "if needed", "as appropriate", "usually", "normally", "typically", "generally", "soon", "eventually", "some", "various", "multiple", "handle", "support", "deal with", "user-friendly", "easy", "simple", "such as", "etc.". Replace with concrete conditions.
2. **Identify implicit actors** — "the system", "the user", "the service". Make explicit which actor performs each action.
3. **Quantify constraints** — "fast" → "<200ms p95", "efficient" → "uses <100MB RAM", "scalable" → "handles 10K req/s".
4. **Every functional requirement needs Given/When/Then** — Given (initial state), When (action/trigger), Then (expected outcome).
5. **Explicit scope boundaries** — List what's in-scope AND what's out-of-scope. Every requirement must be tagged.
6. **Dependency graph** — Map all feature dependencies as `A → B` (A depends on B). Flag circular dependencies as blockers.
7. **Question inventory** — Every unresolved question gets an owner and a deadline. No orphan questions.
8. **No implementation in specs** — Spec describes WHAT and WHY. Not HOW.

## Procedures

1. Scan spec for weasel words → mark with `[AMBIGUOUS]`.
2. Identify implicit actors → rewrite each requirement with explicit subject.
3. Convert every functional requirement to Given/When/Then format.
4. Build dependency graph: list all features, draw `A → B` edges, flag cycles.
5. List external dependencies (services, APIs, data sources).
6. Define scope boundaries: in-scope and out-of-scope lists.
7. Compile question inventory with owners and deadlines.

## Gotchas

- Ambiguous is not wrong — flag it, don't assume. Ask the question.
- Don't over-specify: G/W/T is for functional behavior, not implementation steps.
- Dependency cycles are blockers. Stop and redesign before proceeding.
- Question inventory items without owners are dead. Every question needs who and when.
- Scope boundaries must be explicit: saying "X" is in-scope is insufficient — list what's NOT in-scope.

## References

This skill is self-contained. No reference files needed.

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Parsing new feature request | spec-analysis + technical-writing |
| Reviewing existing spec | spec-analysis + coding-standards |
| Estimating scope | spec-analysis + arch-decision-records |
| Third-party integration spec | spec-analysis + api-design |

## Checklist

- [ ] All weasel words flagged and replaced
- [ ] Every functional requirement has Given/When/Then
- [ ] In-scope and out-of-scope explicitly defined
- [ ] Dependency graph drawn and acyclic
- [ ] All external APIs and services documented
- [ ] Question inventory complete with owners and deadlines
- [ ] No implicit actors ("the system" without specification)
- [ ] Quantified constraints have specific thresholds
- [ ] Spec describes WHAT not HOW
