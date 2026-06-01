## Context

The atlas pipeline has 10-stage FSM with deterministic evidence gates, but its planning is flat: plan-crafter outputs unstructured markdown, there is no context system, no task persistence, no parallel execution, and no pre-execution approval gates. The OpenAgentsControl project demonstrates that rich context, structured task JSONs, contract-first development, and multi-stage orchestration reduce rework significantly.

## Goal

Implement 7 phased improvements — context system, structured task management, contract definition stage, parallel batch execution, component planning, pre-execution approval gates, and session persistence — making atlas planning auditable, structured, and capable of parallel execution without breaking existing evidence gates.

## Scope

### In
1. **Context System** — `.opencode/context/` with `navigation.md` and categorized subdirectories (`core/standards/code-quality.md`, `development/navigation.md`)
2. **Task Manager Output** — plan-crafter outputs structured task JSONs (`.tmp/tasks/{feature-slug}/`) instead of flat markdown only; format: `{ id, name, status, subtasks: [{ seq, title, status, depends_on, parallel, files, verification }] }`
3. **Contract Definition Stage** — new stage `ContractDefinition` inserted between plan-crafter and code-forge; outputs interfaces, types, and API contracts to `.tmp/contracts/`
4. **Parallel Batch Execution** — code-forge receives batch task arrays; pipeline.ts tracks batch completion before advancing
5. **Component Planning** — plan-crafter outputs a high-level Master Plan first, then component-level plans in `.tmp/sessions/{timestamp}-{task-slug}/`
6. **Pre-Execution Approval Gate** — new `approval-required` field in WORKFLOW_STATE.md; pipeline halts before code-forge until explicit approval
7. **Session/Task Persistence** — `.tmp/sessions/` and `.tmp/tasks/` directories with canonical structured files

### Out
- No changes to doc-fetch, work-weaver, code-review, security-scan, code-clean, done-check agent logic (may update prompts to reference context system)
- No changes to hooks.ts plugin
- No changes to the `@opencode-ai/plugin` SDK
- No removal of existing evidence gates or Stage enum values
- No changes to AGENTS.md rules structure

## Acceptance Criteria

### A. Context System (Phase 1)
- File `.opencode/context/navigation.md` exists and contains links to all context subdirectories with <100 lines of content
- File `.opencode/context/core/navigation.md` exists with links to `standards/`
- File `.opencode/context/core/standards/code-quality.md` exists with coding standards reference (scannable in <30s)
- File `.opencode/context/development/navigation.md` exists

### B. Task Manager (Phase 2)
- plan-crafter output includes a structured JSON file at `.tmp/tasks/{feature-slug}/task.json`
- Every `task.json` has at least: `id` (string), `name` (string), `status` (one of: `pending`, `active`, `done`, `blocked`), `subtasks` (array)
- Every subtask object has `seq` (number), `title` (string), `status` (same enum), `depends_on` (array of seq numbers), `parallel` (boolean), `files` (array of file paths), `verification` (string — how to verify completion)
- plan-crafter evidence gates update: "has-numbered-steps" still passes; new gate "has-task-json" checks `.tmp/tasks/*/task.json` exists on disk

### C. Contract Definition Stage (Phase 3)
- `Stage` enum gains `ContractDefinition = "contract-definition"`
- `PIPELINE_ORDER` inserts `Stage.ContractDefinition` between `Stage.PlanCrafter` and `Stage.CodeForge`
- New agent file `.opencode/agents/contract-definition.md` exists with non-code permission block
- `contract-definition` agent writes type/interface definitions to `.tmp/contracts/{feature-slug}/`
- Evidence gates for contract-definition: (1) output matches `.ts` or `.d.ts` file paths, (2) `.tmp/contracts/` directory has at least 1 file

### D. Parallel Batch Execution (Phase 4)
- pipeline.ts `EVIDENCE_GATES[Stage.CodeForge]` gains batch-aware gate: "all-batch-artifacts-exist" checks all paths in current batch
- code-forge.md prompt updated: accepts `files: [array]` from task JSON; iterates in dependency order; parallel-flagged tasks run concurrently
- `REROUTE_TARGETS` unchanged (reroute still targets code-forge)

### E. Component Planning (Phase 5)
- plan-crafter outputs Master Plan at `.tmp/plans/{feature-slug}/master-plan.md` (high-level, 3-5 components)
- Component-level plans at `.tmp/plans/{feature-slug}/components/{component-name}.md` (detailed per component)
- Only the active component has full detail; others remain 2-3 sentence summaries

### F. Pre-Execution Approval Gate (Phase 6)
- WORKFLOW_STATE.md adds `## Approvals` section with table: `| Gate | Status | Timestamp |`
- pipeline.ts `pipeline_run` initializes approvals table with `pre-execution: pending`
- `pipeline_approve` tool added: sets `pre-execution` status to `approved` or `denied` in WORKFLOW_STATE.md
- If `pre-execution` is `pending`, pipeline_status reports `AWAITING_APPROVAL` and blocks transition to code-forge
- atlas.md updated: after plan-crafter + contract-definition complete, calls `pipeline_approve` before routing to code-forge

### G. Session/Task Persistence (Phase 7)
- Session context lives in WORKFLOW_STATE.md's `## Session Context` section, populated at pipeline_run start; contains task description, session path, status, and related fields
- `.tmp/tasks/{feature-slug}/task.json` persists across pipeline stages; each stage appends its output reference
- Session compaction hook preserves session file path

## Files to Change

| # | File | Change |
|---|------|--------|
| 1 | `.opencode/context/navigation.md` | **Create** — root navigation file linking all context categories |
| 2 | `.opencode/context/core/navigation.md` | **Create** — core standards index |
| 3 | `.opencode/context/core/standards/code-quality.md` | **Create** — baseline coding standards (<100 lines) |
| 4 | `.opencode/context/development/navigation.md` | **Create** — development context index |
| 5 | `.opencode/agents/plan-crafter.md` | **Edit** — add task JSON output instructions; update evidence gates |
| 6 | `.opencode/agents/contract-definition.md` | **Create** — new agent with non-code permission block |
| 7 | `.opencode/plugins/pipeline.ts` | **Edit** — add `ContractDefinition` to Stage enum + PIPELINE_ORDER; add batch-aware gates; add `pipeline_approve` tool; add Approvals section to state file |
| 8 | `.opencode/agents/atlas.md` | **Edit** — add context system references; add approval gate routing step; add contract-definition to task allow list |
| 9 | `.opencode/agents/code-forge.md` | **Edit** — add batch task handling from task.json; parallel execution support |
| 10 | `.opencode/agents/code-scout.md` | **Edit** — add reference to context system for pattern discovery |
| 11 | `WORKFLOW_STATE.md` | **Edit** — add `## Approvals` section template |

## Dependencies

- Phase 2 (Task Manager) must precede Phase 4 (Parallel Execution) — code-forge batch handling depends on structured task JSON format
- Phase 3 (Contract Definition) must precede code-forge changes — contract agent must exist before pipeline can route to it
- Phase 1 (Context System) is independent and can ship first; subsequent agent prompt updates depend on it
- Phase 6 (Approval Gate) depends on pipeline.ts tool additions but not on other phases
- Phase 7 (Session Persistence) depends on .tmp/ directory creation, which happens in Phase 2

## Unknowns

1. Whether contract-definition should be a full subagent (new .md file) or a stage handled by plan-crafter. Spec assumes full subagent to maintain separation of concerns.
2. Whether parallel batch execution in code-forge needs OS-level concurrency or just async iteration. Spec assumes async iteration over parallel-flagged subtasks with `Promise.all`.
3. Whether the existing `pipeline_reroute` tool should also reset the approval gate status. Tentatively: yes — reroute resets `pre-execution` to `pending`.
