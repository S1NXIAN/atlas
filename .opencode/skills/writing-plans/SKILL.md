---
name: writing-plans
description: Use when a spec or requirements exist and you are about to create a multi-step implementation plan before touching code
---

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything: which files to touch, code, testing, docs to check, how to test.

## When NOT to Use

- The change is a single edit with no dependencies (use TDD directly)
- No spec or requirements exist yet (use brainstorming first)
- The task is exploratory or research-only

## Process

1. **Scope check** — if the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. Do not proceed with a plan that spans unrelated domains.

2. **File structure** — before defining tasks, map out:
   - Which files will be created/modified
   - What each file is responsible for
   - Design units with clear boundaries
   - Prefer smaller focused files over large monolithic ones

3. **Task format** — each task must include:
   - Exact file paths to modify
   - What code to write (or reference to the approach)
   - What tests to write and how to verify
   - Dependencies on other tasks (if any)

## Rules

- **DRY** — don't repeat yourself
- **YAGNI** — you aren't gonna need it
- **TDD** — tests first
- **Frequent commits** — small, atomic, meaningful
- **Bite-sized tasks** — 2-5 minutes each, not hours

If working in an isolated worktree, it should have been created via `atlas:using-git-worktrees` first.

Save plans to `docs/plans/YYYY-MM-DD-<feature-name>.md`.

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Leaving placeholders in tasks | Implementation stalls | Fill in every detail before starting |
| Plans with no testing strategy | Untestable features | Every task needs a Verify step |
| Tasks spanning multiple files with no clear boundaries | Coupling, context loss | One clear concern per task |
| Skipping dependency mapping | Wrong order, blocked tasks | Map dependencies before writing tasks |

## Quality Checklist

- [ ] Scope verified — single subsystem
- [ ] All file paths are exact
- [ ] Each task has a verification step
- [ ] Dependencies are explicit
- [ ] No placeholders or TODOs
- [ ] Plan saved to `docs/plans/`
