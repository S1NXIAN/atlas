## Context

`pipeline_run` creates a session directory at `.tmp/sessions/{timestamp}-{task-slug}/` and writes a `context.md` file containing the task name, ISO timestamp, and status. This file is **never read by any agent, tool, or evidence gate** — all its data (task name, created, status) is already tracked in WORKFLOW_STATE.md's `## Active Session` table. The compaction hook globs for `.tmp/sessions/*/context.md` but only injects the file path into context, ignoring the file's content. The file is dead weight — it adds complexity, an extra write, and a stale reference point with zero consumption.

## Goal

Absorb `context.md`'s structured fields into WORKFLOW_STATE.md's session section (renamed `## Session Context` with expanded fields), stop creating `context.md`, and update all references to point at the canonical state file instead.

## Scope

### In
- Rename `## Active Session` → `## Session Context` in WORKFLOW_STATE.md
- Add structured fields to `## Session Context`: `task`, `created`, `status`, `path`, `context_files`, `reference_files`, `components`, `exit_criteria`
- pipeline.ts: remove `context.md` creation (line 262); change compaction hook glob from `.tmp/sessions/*/context.md` to `.tmp/sessions/*/` (line 155); update status message to reference `## Session Context` instead of `context.md` (line 293)
- Update `.opencode/specs/pipeline-planning-improvements.md` line 66 to reflect the merged approach

### Out
- Changing how `.tmp/tasks/`, `.tmp/plans/`, or `.tmp/contracts/` artifacts work
- Adding agent prompts to populate the new fields (`context_files`, `reference_files`, `components`, `exit_criteria`) — that is a separate downstream task
- Changes to the 30-day session pruning logic (lines 282-286 of pipeline.ts)
- Changes to the session cleanup on pipeline completion (pipeline_status lines 334-354)
- Changes to hooks.json or any existing evidence gate logic — no evidence gate references context.md

## Acceptance Criteria

### A1 — Section rename and field expansion
Given `pipeline_run` executes
When WORKFLOW_STATE.md is written
Then the state file contains `## Session Context` (not `## Active Session`)
And the table has columns `Field | Value` (not `Property | Value`)
And rows include: `task`, `created`, `status`, `path`, `context_files`, `reference_files`, `components`, `exit_criteria`
And new fields default to `—`

### A2 — No context.md created
Given `pipeline_run` executes with a task string
When the session directory is created
Then no file at `{sessionDir}/context.md` exists on disk
And `ls {sessionDir}` shows no `context.md`

### A3 — Compaction hook updated
Given the compaction hook (`experimental.session.compacting`) runs
When it injects session info into context
Then it does NOT glob for `.tmp/sessions/*/context.md`
And it either globs for `.tmp/sessions/*/` or reads `## Session Context` from WORKFLOW_STATE.md

### A4 — Status message updated
Given `pipeline_run` completes successfully
When the return message is constructed
Then the `Session:` line references WORKFLOW_STATE.md or `## Session Context` rather than `{sessionDir}/context.md`

### A5 — Spec file updated
Given `.opencode/specs/pipeline-planning-improvements.md`
When inspected for context.md references
Then line 66 (or surrounding text) states that session context lives in WORKFLOW_STATE.md's `## Session Context`, not in a separate `context.md`

### A6 — Backward compatibility
Given an existing WORKFLOW_STATE.md lacking `## Session Context` (from a prior pipeline run)
When `pipeline_run` executes
Then it overwrites the stale section with the new `## Session Context` table (no crash, no manual migration)

### A7 — No stale heading
Given any WORKFLOW_STATE.md produced after this change
When searched for `## Active Session`
Then the exact heading `## Active Session` does not appear (only `## Session Context`)

## Files to Change

| # | File | What to change |
|---|------|----------------|
| 1 | `WORKFLOW_STATE.md` | Template written by `pipeline_run` (pipeline.ts lines 206-249): rename `## Active Session` → `## Session Context`, change column headers from `Property|Value` to `Field|Value`, add rows for `task`, `context_files`, `reference_files`, `components`, `exit_criteria` |
| 2 | `.opencode/plugins/pipeline.ts` | **Line 155**: change glob from `.tmp/sessions/*/context.md` to `.tmp/sessions/*/` (or remove session path injection entirely and read from WORKFLOW_STATE.md instead). **Line 262**: remove `Bun.write` for `context.md`. **Line 273**: update regex to match `## Session Context` instead of `## Active Session`. **Line 293**: change `Session: ${sessionDir}/context.md` to `Session context: WORKFLOW_STATE.md → ## Session Context`. |
| 3 | `.opencode/specs/pipeline-planning-improvements.md` | **Line 66**: update Phase 7 criterion to state session context lives in WORKFLOW_STATE.md's `## Session Context` section rather than a standalone `context.md` |

## Dependencies

- **PRs/blocks**: None. Self-contained refactor.
- **Stale line numbers note**: The user-reported line numbers in WORKFLOW_STATE.md (252, 292, 398, 454, 863, 962, 983 referencing context.md) belong to an earlier version no longer present — the current WORKFLOW_STATE.md is regenerated fresh by `pipeline_run` (35 lines). No manual edits to those line positions are needed.
- **Evidence gate note**: No evidence gate references `context.md`. The user-described "Evidence gate G2" does not exist in the codebase. No evidence gate changes needed.

## Unknowns

1. **Compaction hook strategy**: Should the compaction hook glob for any file in `.tmp/sessions/*/` (keeping the session path injection), or should it read `## Session Context` from WORKFLOW_STATE.md directly? Decision: keep glob but change pattern to `.tmp/sessions/*/` — the path is the only data currently consumed. If the directory is empty after removing context.md, the glob still matches the directory entry.
2. **New field population**: This spec does not assign which agents write to `context_files`, `reference_files`, `components`, or `exit_criteria`. Those assignments will come in a follow-up spec.
