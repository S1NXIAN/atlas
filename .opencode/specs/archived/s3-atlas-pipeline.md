## Context

The current Atlas pipeline (pipeline.ts, 88 lines) uses string-based routing with no state persistence, no deterministic evidence gates, and no permission enforcement. Agents can edit any file regardless of role. Pipeline transitions are LLM-decided with no validation. This causes handoff failures, untracked state, and security risks from over-permissioned agents.

## Goal

Implement 3 S+ patterns — canonical WORKFLOW_STATE.md handoff file, TypeScript enum-based FSM pipeline with deterministic transitions, and per-stage evidence gates that run without LLM — to make the pipeline auditable, enforceable, and self-documenting.

## Scope

### In
1. **WORKFLOW_STATE.md** — new file at project root with phase tracking, agent output table, blockers, and gate results
2. **pipeline.ts** — rewrite with TypeScript enum `Stage`, const `PIPELINE_ORDER`, const `REROUTE_TARGETS`, const `EVIDENCE_GATES`, and tools that read/write WORKFLOW_STATE.md
3. **All 10 agent .md files** — update permission blocks per role (non-code agents: edit deny except WORKFLOW_STATE.md; code-forge: full edit allow; atlas: full orchestrator permissions)
4. **All 10 agent prompt bodies** — prepend "Read WORKFLOW_STATE.md before starting" and "Update ONLY your section in WORKFLOW_STATE.md after finishing" and "Do not modify other agents' sections"
5. **AGENTS.md** — add rules: WORKFLOW_STATE.md canonical handoff, path-based permissions, evidence gates, gate failure = reroute or stop (no LLM override)
6. **hooks.json** — optionally add evidence-gate hooks (bash commands that run deterministic checks per stage)

### Out
- No changes to doc-fetch.md, code-scout.md, plan-crafter.md, code-review.md, security-scan.md, done-check.md permission **structure** (they already have restricted perms, but prompts still need the 3 new lines)
- No changes to hooks.ts core logic (hook system stays, only hooks.json may add evidence-gate entries)
- No changes to docs-agent.md (not a pipeline agent)
- No changes to opencode.json (autoupdate, default_agent, instructions stay as-is)
- No changes to the `@opencode-ai/plugin` SDK

## Acceptance Criteria

### A. WORKFLOW_STATE.md Creation
- `/home/xian/Work/atlas/WORKFLOW_STATE.md` exists after first `pipeline_run` invocation
- File contains sections: `## Current Phase`, `## Agent Outputs` (table with Status/Output path/Evidence/Gate result), `## Blockers`, `## Gate Results` (table with Step/Gate/Result/Evidence)
- `Current Phase` value matches a member of the `Stage` enum
- File is valid Markdown (no broken table formatting)

### B. FSM Pipeline (pipeline.ts)
- `Stage` enum has exactly 10 values: `SpecWriter`, `CodeScout`, `PlanCrafter`, `CodeForge`, `DocFetch`, `WorkWeaver`, `CodeReview`, `SecurityScan`, `CodeClean`, `DoneCheck`
- `PIPELINE_ORDER` is a `const` array typed as `readonly Stage[]` in correct sequence
- `REROUTE_TARGETS` is a `const` map — keys `CodeReview` and `SecurityScan` only, each mapping to `CodeForge`
- `EVIDENCE_GATES` is a `const` map — one entry per Stage, value is array of check functions returning `{ pass: boolean; message: string }`
- `pipeline_run`: writes initial WORKFLOW_STATE.md with `Current Phase: SpecWriter` and all agents `Status: pending`
- `pipeline_status`: reads WORKFLOW_STATE.md, returns current Stage + Status (validates Stage is enum member, returns error if invalid)
- `pipeline_reroute`: validates target is in `REROUTE_TARGETS` keys, updates WORKFLOW_STATE.md `Current Phase` to target, returns error string if invalid target
- Compaction hook (`experimental.session.compacting`): reads WORKFLOW_STATE.md, injects current Phase into session context as `## Active Phase: [Stage]`
- Session created hook (`session.created`): reads WORKFLOW_STATE.md if exists, validates its format (must have `## Current Phase` header), logs error if malformed

### C. Evidence Gates (deterministic, no LLM)

Each check must be a pure function that takes agent output string and returns `{ pass: boolean; message: string }`.

**spec-writer:**
1. Output contains `"## Acceptance Criteria"` (case-sensitive)
2. Output contains `"## Scope"` (case-sensitive)
3. Scope section contains `"In:"` and `"Out:"` text
4. Output total length > 100 characters

**code-scout:**
1. Output matches file path regex `/[\w\-\.\/]+\.[a-z]+/g` at least once
2. Output references ≥ 2 distinct source files (count unique matches of `/[\w\-\.\/]+\.[a-z]+/g`)

**plan-crafter:**
1. Output contains numbered steps matching `/^\d+\.\s/m` (multiline start-anchored digits)
2. Output contains `"## Implementation Plan"`

**code-forge:**
1. Output artifact file path (extracted via regex `/[\w\-\.\/]+\.[a-z]+/g`) exists on disk (`Bun.file(path).exists()`)
2. Output contains `"## Implementation Report"`
3. Output contains `"PASS"` or `"SUCCESS"` (case-insensitive substring)

**doc-fetch:**
1. Output matches URL regex `/https?:\/\/[^\s]+/g` at least once
2. Output total length > 200 characters

**work-weaver:**
1. Output contains all 10 subagent names as substrings (case-insensitive): spec-writer, code-scout, plan-crafter, code-forge, doc-fetch, work-weaver, code-review, security-scan, code-clean, done-check
2. Output contains `"## Integration Summary"` or `"## Integration Report"`

**code-review:**
1. Output contains `"PASS"` or `"Changes requested"` (case-insensitive substring)
2. Output does NOT contain `"SKIP"` (case-insensitive substring)
3. If output contains `"FAIL"` (case-insensitive), set `reroute: true` flag

**security-scan:**
1. Output contains `"VULN_COUNT:"` or `"No vulnerabilities found"` (case-insensitive substring)
2. Output does NOT contain `"SKIP"` (case-insensitive substring)

**code-clean:**
1. Verify no TODOs remain: search project files (excluding node_modules, .git) for patterns: `TODO`, `FIXME`, `HACK`, `XXX` as word-boundary regex. Returns pass if 0 matches.
2. Verify all files referenced in plan-crafter output exist on disk (extract paths from plan-crafter output stored in WORKFLOW_STATE.md, check `Bun.file(path).exists()`)

**done-check:**
1. Output contains `"ALL_ACCEPTANCE_CRITERIA_MET: true"` (case-sensitive)
2. Output contains `"## Verification Results"`

### D. Permission Changes

**Non-code agents** (spec-writer.md, code-scout.md, plan-crafter.md, doc-fetch.md, work-weaver.md, code-review.md, security-scan.md, code-clean.md, done-check.md):
- New permission block:
```yaml
permission:
  read: allow
  glob: allow
  grep: allow
  list: allow
  write: allow
  edit:
    "*": deny
    "WORKFLOW_STATE.md": allow
  bash: ask
```

**code-forge.md** (ONLY code editor):
- New permission block:
```yaml
permission:
  read: allow
  write: allow
  edit: allow
  glob: allow
  grep: allow
  list: allow
  bash:
    "*": ask
    "npm test*": allow
    "go test*": allow
    "python -m pytest*": allow
```

**atlas.md** (orchestrator):
- New permission block:
```yaml
permission:
  read: allow
  write: allow
  edit: allow
  glob: allow
  grep: allow
  list: allow
  bash: allow
  webfetch: allow
  websearch: allow
  task:
    "*": deny
    spec-writer: allow
    code-scout: allow
    plan-crafter: allow
    code-forge: allow
    doc-fetch: allow
    work-weaver: allow
    code-review: allow
    security-scan: allow
    code-clean: allow
    done-check: allow
```

### E. Agent Prompt Updates

Every agent .md file (atlas.md, spec-writer.md, code-scout.md, plan-crafter.md, code-forge.md, doc-fetch.md, work-weaver.md, code-review.md, security-scan.md, code-clean.md, done-check.md) must have these 3 lines prepended to the instruction body (after frontmatter):

```
Read WORKFLOW_STATE.md before starting. Update ONLY your section in WORKFLOW_STATE.md after finishing. Do not modify other agents' sections.
```

### F. AGENTS.md Updates

Add these new rules (order after existing Iron Rules, before Error Handling):

```
**Rule 5: WORKFLOW_STATE.md Is Canonical**
WORKFLOW_STATE.md is the single source of handoff truth. Every agent reads it before starting and updates only its own section after finishing. No agent modifies another agent's section.

**Rule 6: Path-Based Permissions Enforced**
Only code-forge may edit code files. Non-code agents (spec-writer, code-scout, plan-crafter, doc-fetch, work-weaver, code-review, security-scan, code-clean, done-check) may only write new files and edit WORKFLOW_STATE.md.

**Rule 7: Evidence Gates Run After Every Agent**
After each agent completes, the pipeline runs deterministic evidence checks against its output. These checks are pure function calls — no LLM invocation. If any check fails, the pipeline logs the failure and either reroutes or stops.

**Rule 8: Gate Failure = Reroute or Stop, No LLM Override**
If evidence gates fail, the pipeline automatically determines next action:
- code-review or security-scan failure → automatic reroute to code-forge
- All other stage failures → pipeline stops with error report
No agent or LLM may override a gate failure. The WORKFLOW_STATE.md blocker list records the failure.
```

## Files to Change

| # | File | Change |
|---|------|--------|
| 1 | `WORKFLOW_STATE.md` | **Create** — template with sections: Current Phase, Agent Outputs table, Blockers, Gate Results table. Written by pipeline_run, updated by each agent and evidence gate |
| 2 | `.opencode/plugins/pipeline.ts` | **Rewrite** — replace entire 88-line file with FSM implementation: `Stage` enum, `PIPELINE_ORDER` const array (typed), `REROUTE_TARGETS` const map, `EVIDENCE_GATES` const map with all per-stage check arrays, `pipeline_run` tool (inits WORKFLOW_STATE.md), `pipeline_status` tool (reads WORKFLOW_STATE.md, validates Stage), `pipeline_reroute` tool (validates REROUTE_TARGETS, updates WORKFLOW_STATE.md), compaction hook (injects current Stage), session.created hook (validates WORKFLOW_STATE.md format) |
| 3 | `AGENTS.md` | **Edit** — add Rules 5-8 after the existing 4 Iron Rules (before Error Handling section). Update Plugin Architecture bullet to mention WORKFLOW_STATE.md. Keep all existing content (skills, superpowers, deprecated) |
| 4 | `.opencode/agents/atlas.md` | **Edit** — 3 changes: (a) replace permission block with orchestrator block from §D, (b) prepend the 3-line WORKFLOW_STATE.md instruction to body, (c) add `pipeline_run`, `pipeline_status`, `pipeline_reroute` to the tool permission list (already present — verify) |
| 5 | `.opencode/agents/spec-writer.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D, (b) prepend the 3-line WORKFLOW_STATE.md instruction to body (after frontmatter, before existing text) |
| 6 | `.opencode/agents/code-scout.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (note: current block has bash allow for rg/fd/sg — new block sets `bash: ask` which is a restriction increase), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 7 | `.opencode/agents/plan-crafter.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current has `write: deny`, new has `write: allow` — this is a permission increase but required for writing WORKFLOW_STATE.md), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 8 | `.opencode/agents/code-forge.md` | **Edit** — 2 changes: (a) replace permission block with code-forge block from §D (keep existing `bash` granularity, add `cargo test*` if desired but not required), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 9 | `.opencode/agents/doc-fetch.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current has `glob: deny`, `grep: deny`, `list: deny` — new block sets these to `allow` which is a permission increase), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 10 | `.opencode/agents/work-weaver.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current has `edit: allow`, `write: allow`, `bash: allow` — new block restricts these), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 11 | `.opencode/agents/code-review.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current bash: `"sg scan *": allow` loses — new block sets `bash: ask`), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 12 | `.opencode/agents/security-scan.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current `bash: allow` — new sets `bash: ask`), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 13 | `.opencode/agents/code-clean.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current has `edit: allow`, `write: allow`, granular bash — all restricted), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 14 | `.opencode/agents/done-check.md` | **Edit** — 2 changes: (a) replace permission block with non-code block from §D (current `bash: allow` → `bash: ask`), (b) prepend the 3-line WORKFLOW_STATE.md instruction |
| 15 | `.opencode/hooks.json` | **Optional edit** — may add evidence-gate hook entries (e.g., `pipeline_status` after hooks that run evidence checks). Not required for core spec |

## WORKFLOW_STATE.md Template

```markdown
# Atlas Pipeline State

## Current Phase
`SpecWriter` — [one of: SpecWriter, CodeScout, PlanCrafter, CodeForge, DocFetch, WorkWeaver, CodeReview, SecurityScan, CodeClean, DoneCheck, Complete, Failed]

## Agent Outputs

| Agent | Status | Output Path | Evidence (SHA-256) | Gate Result |
|-------|--------|-------------|---------------------|-------------|
| spec-writer | pending | — | — | — |
| code-scout | pending | — | — | — |
| plan-crafter | pending | — | — | — |
| code-forge | pending | — | — | — |
| doc-fetch | pending | — | — | — |
| work-weaver | pending | — | — | — |
| code-review | pending | — | — | — |
| security-scan | pending | — | — | — |
| code-clean | pending | — | — | — |
| done-check | pending | — | — | — |

## Blockers
- [None, or list of active blockers with stage origin]

## Gate Results

| Step | Gate | Result | Evidence |
|------|------|--------|----------|
| — | — | — | — |
```

## Dependency Notes

- Implementation order: WORKFLOW_STATE.md template → pipeline.ts FSM rewrite → agent permission/prompt updates → AGENTS.md rule additions → hooks.json optional
- pipeline.ts rewrite depends on understanding `@opencode-ai/plugin` SDK types. The existing import `import { type Plugin, tool } from "@opencode-ai/plugin"` shows the SDK is already available. Evidence gate checks use `Bun.file()` (Bun is the runtime) and regex — no external deps
- All 10 agents must be updated atomically — partial updates leave a broken pipeline (some agents can edit, others can't)
- The `experimental.session.compacting` hook signature from current pipeline.ts: `(input, output) => void` — `output` has `context: string[]` — this API must not change

## Unknowns

1. **docs-agent.md** (`/home/xian/Work/atlas/.opencode/agents/docs-agent.md`) has `edit: allow` and `write: allow` but is not a pipeline agent. The spec does not address whether it should be restricted. Recommendation: leave as-is since it's outside the pipeline.
2. **code-scout.md** current `bash` has granular allow for `rg`, `fd`, `ast-grep`, `sg`. New spec sets `bash: ask` (generic). This restricts the scout from running search commands without confirmation. Consider whether these should stay as granular bash allows for productivity.
3. **doc-fetch.md** current permissions deny `glob`, `grep`, `list` — new spec sets them to `allow`. This is a permission increase. Verify this is intentional (doc-fetch may need to read project files to find package.json for version matching).
4. **code-review.md** current `bash` has granular `"sg scan *": allow` for ast-grep. New spec sets `bash: ask`. Consider preserving `"sg scan *": allow` under the new block to avoid unnecessary prompts.
5. **code-clean.md** loses all edit/write permissions — it can no longer refactor code directly. Its role becomes purely analytical (reporting issues for code-forge to fix). The prompt may need adjustment to reflect this role change, but the spec does not mandate prompt rewrites beyond the 3-line WORKFLOW_STATE.md instruction.
