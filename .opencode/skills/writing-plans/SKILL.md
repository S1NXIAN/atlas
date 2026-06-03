---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before touching code
---

Write comprehensive implementation plans assuming the engineer has zero context for our codebase and questionable taste. Document everything: which files to touch, code, testing, docs to check, how to test.

## Rules

- **DRY** — don't repeat yourself
- **YAGNI** — you aren't gonna need it
- **TDD** — tests first
- **Frequent commits** — small, atomic, meaningful
- **Bite-sized tasks** — 2-5 minutes each, not hours

Announce at start: "I'm using the writing-plans skill to create the implementation plan."

If working in an isolated worktree, it should have been created via `atlas:using-git-worktrees` first.

Save plans to `docs/plans/YYYY-MM-DD-<feature-name>.md`.

## Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. Do not proceed with a plan that spans unrelated domains.

## File Structure

Before defining tasks, map out:
- Which files will be created/modified
- What each file is responsible for
- Design units with clear boundaries
- Prefer smaller focused files over large monolithic ones

## Task Format

Each task must include:
- Exact file paths to modify
- What code to write (or reference to the approach)
- What tests to write and how to verify
- Dependencies on other tasks (if any)

Do not leave placeholders. Do not skip verification steps.
