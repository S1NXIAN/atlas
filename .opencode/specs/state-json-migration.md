## Context

The atlas pipeline FSM in `.opencode/plugins/pipeline.ts` reads/writes a single Markdown file (`WORKFLOW_STATE.md`) using 3 regex calls for state parsing, approval matching, and session context extraction — brittle, error-prone, and unsafe for parallel agent execution. All 11 agents share this one file, creating a single-writer bottleneck with no isolation. The compaction hook injects the entire Markdown blob (~1.5KB) into LLM context. Existing research (doc-fetch, Jun 2026) has validated a JSON-based state architecture from the Sisyphus project as a replacement.

## Goal

Replace WORKFLOW_STATE.md Markdown state management with a `.tmp/`-dominant JSON state architecture using `state.json` (machine source of truth), per-agent `handoffs/{agent}.json` files (safe parallel writes), and an `active-session.json` pointer — eliminating all regex parsing and enabling deterministic JSON-schema-validated evidence gates.

## Scope

### In

1. **State file migration** — pipeline.ts FSM reads/writes `.tmp/sessions/{sessionId}/state.json` (JSON, ~700B) instead of `WORKFLOW_STATE.md`; `getStageFromFile()` uses `JSON.parse` instead of regex
2. **Active session pointer** — `.tmp/active-session.json` file containing `{ sessionId: string, statePath: string }` as the canonical entry point
3. **Per-agent handoff files** — pipeline.ts writes `handoffs/{agent}.json` for each completed subagent (using schema `HandoffRecord`); files written by atlas after each Task tool completion
4. **Evidence gate migration** — All `EVIDENCE_GATES` checks switch from text pattern matching (e.g., `o.includes("## Acceptance Criteria")`) to JSON schema field checks (e.g., `state.completedSteps.includes("spec-writer")`); gates read from `state.json` or `handoffs/{agentId}.json`
5. **Compaction hook** — Reads `state.json` and injects a compact JSON summary (<1KB) into LLM context instead of the full Markdown blob; references `handoffs/{agent}.json` paths for detail
6. **WORKFLOW_STATE.md rendering** — `WORKFLOW_STATE.md` at repo root becomes a thin ~12-line human-readable summary, rendered from `state.json` on write; `pipeline_run` no longer creates it as the primary state artifact
7. **AGENTS.md Rule 5 update** — Rewords "WORKFLOW_STATE.md Is Canonical" to "state.json Is Canonical"; adds description of the two-tier state architecture (machine JSON + human Markdown)
8. **11 agent prompt updates** — All `.opencode/agents/*.md` files update their read path from `WORKFLOW_STATE.md` to `.tmp/active-session.json` → `state.json`; permission blocks change from `**/WORKFLOW_STATE.md` to `.tmp/active-session.json` + `.tmp/sessions/*/state.json` for reading and `.tmp/sessions/*/handoffs/{agent}.json` for writing
9. **pipeline_reroute tool** — Reads/writes `state.json` fields (`currentStep`, `failedSteps`, `blockerReason`) instead of regex-replacing Markdown table rows
10. **pipeline_approve tool** — Reads/writes `state.approvals[gate].status` instead of regex-replacing a Markdown table cell

### Out

- Subagent output contract changes (agents still return text; atlas writes handoff JSON from task output)
- Pipeline order changes (11-stage FSM stays identical)
- Session cleanup/pruning logic (30-day prune remains, only the file paths change)
- Approval gate concept (pre-execution gate semantics unchanged)
- `HandoffRecord` schema structure (defined here; agents do not write it directly)
- Changes to existing evidence gate logic (same checks, different implementation target — text → JSON)
- Changes to `.gitignore` (`.tmp/` already covers everything)

## Acceptance Criteria

### A — `state.json` as machine source of truth

Given `pipeline_run` executes with a task string
When the pipeline initializes
Then a file at `.tmp/sessions/{timestamp}-{task-slug}/state.json` exists
And `state.json` matches the `PipelineState` interface (all fields present)
And `state.status` equals `"running"`
And `state.currentStep` equals `"spec-writer"`
And `state.completedSteps` is an empty array `[]`
And `state.createdAt` and `state.updatedAt` are valid ISO 8601 timestamps

### B — Active session pointer

Given `pipeline_run` completes initialization
When the plugin writes session state
Then a file at `.tmp/active-session.json` exists
And its content is `{ "sessionId": "{id}", "statePath": ".tmp/sessions/{id}/state.json" }`
And reading `.tmp/active-session.json` then resolving `statePath` yields the correct `state.json`

### C — No regex state parsing

Given any pipeline tool (`pipeline_status`, `pipeline_approve`, `pipeline_reroute`) executes
When it reads pipeline state
Then it reads `.tmp/active-session.json` → resolves `statePath` → `JSON.parse`s the file
And it does NOT call `content.match()` or `content.includes()` for state field extraction
And `getStageFromFile()` uses `JSON.parse()` and returns typed fields

### D — Per-agent handoff files

Given a subagent (e.g., spec-writer) completes execution via the Task tool
When atlas processes the subagent output
Then a file at `.tmp/sessions/{id}/handoffs/{agent}.json` is written
And the handoff JSON matches the `HandoffRecord` interface
And `handoff.status` equals `"passed"` (or `"failed"` on error)
And `handoff.summary` is ≤200 tokens
And `handoff.artifactsProduced` contains file paths only (no inlined content)
And `handoff.priorDecisions` contains decisions from upstream handoff files

### E — Evidence gates use JSON schema checks

Given a subagent completes and evidence gates run
When the gate function executes for `Stage.SpecWriter`
Then `has-acceptance-criteria` checks `handoff.artifactsProduced` or `state.stepHistory[].evidence[]` instead of `o.includes("## Acceptance Criteria")`
And `has-scope` checks the same JSON evidence fields
When the gate function executes for `Stage.CodeScout`
Then `has-file-paths` checks `handoff.artifactsProduced.length >= 1` instead of regex on raw text
When the gate function executes for `Stage.CodeForge`
Then `artifact-exists` checks paths listed in `handoff.artifactsProduced` exist on disk
When the gate function executes for `Stage.CodeReview`
Then `check-fail-reroute` checks `handoff.status !== "failed"` instead of `/FAIL/i.test(o)`

### F — Compaction hook injects JSON summary

Given the compaction hook (`experimental.session.compacting`) fires
When it reads pipeline state
Then it reads `.tmp/active-session.json` → resolves to `state.json`
And it injects into LLM context a JSON summary string ≤1KB of the form:
`{"version":"1.0","status":"running","currentStep":"spec-writer","completedSteps":[],"stepHistory":[{"stepId":"spec-writer","status":"running"}]}`
And it does NOT inject the full `state.json` content (>1KB)
And it does NOT inject raw WORKFLOW_STATE.md Markdown text

### G — WORKFLOW_STATE.md becomes thin rendering

Given `pipeline_run` executes
When the root `WORKFLOW_STATE.md` is written
Then it contains exactly these sections: `# Atlas Pipeline State`, `## Current Phase`, `## Status`, `## Quick Summary`
And it is ≤15 lines total
And it contains the text `Machine state: .tmp/sessions/{id}/state.json`
And it does NOT contain agent status tables, gate results tables, or session context tables
And `pipeline_run` does NOT write the 48-line Markdown template

### H — pipeline_approve reads/writes state.approvals

Given `pipeline_approve` is called with `gate: "pre-execution"`, `decision: "approved"`
When the tool executes
Then `state.approvals["pre-execution"].status` equals `"approved"`
And `state.approvals["pre-execution"].timestamp` is a valid ISO 8601 string
And no regex was used to find/replace a Markdown table cell
Given `pipeline_status` reads state with `pre-execution` approval as `"pending"`
When the next step is `code-forge`
Then the output includes `"AWAITING_APPROVAL"`

### I — pipeline_reroute reads/writes state.json fields

Given `pipeline_reroute` is called with `target: "code-forge"`, `reason: "review failure"`
When the tool executes
Then `state.currentStep` equals `"code-forge"`
And `state.failedSteps` includes the failing stage name
And `state.approvals["pre-execution"].status` is reset to `"pending"`
And no regex was used to replace `## Current Phase` or `## Blockers` sections

### J — AGENTS.md Rule 5 updated

Given `AGENTS.md` is read
When inspected for Rule 5
Then the rule text reads: `"state.json Is Canonical — .tmp/sessions/{id}/state.json is the single machine source of truth. WORKFLOW_STATE.md is a human-readable rendering rendered from state.json. Every agent reads .tmp/active-session.json to locate state.json before starting and writes its own handoffs/{agent}.json after finishing."`
And the old text `"WORKFLOW_STATE.md is the single source of handoff truth"` does not appear

### K — All 11 agent prompts updated

Given each agent file under `.opencode/agents/` (spec-writer, code-scout, plan-crafter, contract-definition, code-forge, doc-fetch, work-weaver, code-review, security-scan, code-clean, done-check)
When inspected
Then the read instruction references `.tmp/active-session.json` → `state.json` instead of `Read WORKFLOW_STATE.md before starting`
And the edit permission block allows `"**/WORKFLOW_STATE.md"` is replaced with `".tmp/active-session.json"` and `".tmp/sessions/*/state.json"` for reading and `".tmp/sessions/*/handoffs/{agent}.json"` for writing
And there is no remaining reference to `WORKFLOW_STATE.md` in the instruction block (first line of body)

### L — atlas.md migration

Given `.opencode/agents/atlas.md`
When inspected
Then the instruction references `Read .tmp/active-session.json to locate state.json` instead of `Read WORKFLOW_STATE.md before starting`
And the permission block reads `"**/WORKFLOW_STATE.md"` is replaced with `".tmp/active-session.json"`, `".tmp/sessions/*/state.json"`, and `".tmp/sessions/*/handoffs/*.json"`
And atlas.md includes a step after each Task tool completion: "Write handoffs/{agent}.json from task output"

### M — Root WORKFLOW_STATE.md never created as primary state

Given `pipeline_run` executes
When the run completes
Then the root `WORKFLOW_STATE.md` exists but is ≤15 lines and references `state.json`
And the 48-line Markdown template with full tables is NOT written to root
And `.tmp/WORKFLOW_STATE.md` (if it existed) is removed or no longer created

### N — All existing evidence gates still pass with same semantics

Given the full pipeline runs end-to-end
After each subagent, evidence gates execute
Then every gate check passes under the same conditions it passed before (same pass/fail semantics, different implementation)
Specifically: `has-acceptance-criteria`, `has-scope`, `has-file-paths`, `has-numbered-steps`, `artifact-exists`, `has-implementation-report`, `has-url-refs`, `references-all-agents`, `check-fail-reroute`, `vuln-count-or-clean`, `all-criteria-met` all produce identical pass/fail results for identical inputs

## Files to Change

| # | File | What to change | Change type |
|---|------|----------------|-------------|
| 1 | `.opencode/plugins/pipeline.ts` | Rewrite FSM engine: `STATE_FILE` → reads `.tmp/active-session.json` → `state.json`; `getStageFromFile()` → `JSON.parse`; template writing → JSON literal; `pipeline_run` initializes `state.json` and `active-session.json` pointer; `pipeline_status` reads `state.currentStep`; `pipeline_approve` reads/writes `state.approvals[]`; `pipeline_reroute` reads/writes `state.currentStep` + `state.failedSteps`; compaction hook injects JSON summary; all `EVIDENCE_GATES` check JSON fields instead of `o.includes()` text patterns; add handoff file writing logic after gate checks | Edit |
| 2 | `.opencode/agents/atlas.md` | Update read instruction; add handoff writing step after each Task tool call; change permission block | Edit |
| 3 | `.opencode/agents/spec-writer.md` | Update read instruction; replace `**/WORKFLOW_STATE.md` edit permission with state.json paths | Edit |
| 4 | `.opencode/agents/code-scout.md` | Same as #3 | Edit |
| 5 | `.opencode/agents/plan-crafter.md` | Same as #3 | Edit |
| 6 | `.opencode/agents/contract-definition.md` | Same as #3 | Edit |
| 7 | `.opencode/agents/code-forge.md` | Update read instruction; replace WORKFLOW_STATE.md permission if present | Edit |
| 8 | `.opencode/agents/doc-fetch.md` | Same as #3 | Edit |
| 9 | `.opencode/agents/work-weaver.md` | Same as #3 | Edit |
| 10 | `.opencode/agents/code-review.md` | Same as #3 | Edit |
| 11 | `.opencode/agents/security-scan.md` | Same as #3 | Edit |
| 12 | `.opencode/agents/code-clean.md` | Same as #3 | Edit |
| 13 | `.opencode/agents/done-check.md` | Same as #3 | Edit |
| 14 | `AGENTS.md` | Reword Rule 5; update Rule 6, 8, 10 to reference state.json fields; update Plugin Architecture | Edit |
| 15 | `.tmp/WORKFLOW_STATE.md` | Delete if present (replaced by state.json) | Delete |
| 16 | `WORKFLOW_STATE.md` (root) | Template shrinks from 48 lines to ≤15 lines; tables replaced with key-value summary | Edit |

## Dependencies

- **PRs/blocks:** None. Self-contained migration — no other in-flight PRs modify pipeline.ts or the agent files.
- **Sisyphean state.json schema** is adopted as-is from doc-fetch research (validated Jun 2026, documented in `.tmp/WORKFLOW_STATE.md` under `## Research Findings`).
- **Sequencing:** Agent prompt updates (files 3-14) must happen after pipeline.ts (file 1) is deployed — agents must not read state.json before it exists.
- **Compaction hook** change must happen after `state.json` writes are verified working.
- **Evidence gate migration** must preserve identical pass/fail semantics — each gate's logic must be verified against the old implementation on the same inputs.

## Unknowns

1. **Handoff file writing responsibility** — atlas.md is expected to write handoff JSON files from unstructured subagent task output text. This requires the orchestrator LLM to extract structured fields (`summary`, `keyDecisions`, `artifactsProduced`) from free-text output. Alternative: pipeline.ts could write a minimal `handoff.json` with deterministic fields (`agentId`, `status`, file paths extracted by regex), while atlas writes the enriched fields via LLM. **Decision needed:** who writes the handoff JSON — atlas (LLM-driven enrichment) or pipeline.ts (deterministic extraction)?

2. **Evidence gate function signature** — Current `GateCheck.check` receives `(output: string)`. After migration, gates need access to `handoff: HandoffRecord` and/or `state: PipelineState`. The interface must change. Two options: (a) change signature to `(handoff: HandoffRecord) => GateResult` or (b) provide a context object `(ctx: { state: PipelineState, handoff?: HandoffRecord }) => GateResult`. **Decision needed:** which signature? Option (b) is more flexible for gates that need cross-agent state.

3. **WORKFLOW_STATE.md rendering timing** — Should root `WORKFLOW_STATE.md` be re-rendered from `state.json` on every state mutation (consistent but extra I/O), or only on `pipeline_run` and pipeline completion (lazy, could drift between events)? Spec assumes render-on-write (every `pipeline_approve`, `pipeline_reroute` update also re-renders the Markdown). Confirm this is acceptable.
