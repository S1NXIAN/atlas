---
name: writing-plans
description: Use when a spec or requirements exist and you are about to create a multi-step implementation plan before touching code
---

Write implementation plans as directed acyclic graphs (DAGs) of subgoals with typed success criteria. Match decomposition granularity to task complexity — one level does not fit all. Document everything: which files to touch, code, testing, verification.

Research basis: Task-Decoupled Planning (TDP, arXiv 2601.07577), Decomposition Granularity Index (DGI, clawRxiv 2604.00690), KPI-Chain (OpenReview 2026).

## When NOT to Use

- The change is a single edit with no dependencies (use TDD directly)
- No spec or requirements exist yet (use brainstorming first)
- The task is exploratory or research-only

## Process

### 0. Complexity Assessment (before any decomposition)

Estimate S = minimum number of sequential steps required. Classify:

| Steps (S) | Regime | Strategy |
|-----------|--------|----------|
| 1-3 | Simple | Flat task list, minimal decomposition (DGI 1.0-1.2) |
| 4-8 | Moderate | DAG with 2-3 subgoals (DGI 1.8-2.4) |
| 9-20 | Complex | Full 3-tier plan with strategic milestones (DGI 2.8-4.5) |
| 20+ | Very Complex | CORPGEN-style: strategic objectives → tactical plans → operational actions |

**Optimal subtask count** ≈ 0.85 × S^1.5 (derived from DGI ≈ 0.85√S).

**Coordination budget warning**: above DGI 3.0, coordination consumes >30% of tokens and causes ~18% of errors. At DGI 5.0, coordination is 52% of tokens and 34% of errors. Do not over-decompose.

### 1. Scope Check

If the spec covers multiple independent subsystems, it should have been broken into sub-project specs during brainstorming. Do not proceed with a plan that spans unrelated domains.

### 2. DAG Structure (replaces flat task lists)

Map the plan as a directed acyclic graph of subgoals:

```
[Init] → [Core Logic] → [API Layer] → [UI] → [Integration]
   ↑            ↑
[Config]    [Data Models]
```

Each node (subgoal) must define:
- **ID**: Unique identifier (e.g., T1, T2)
- **Description**: One clear sentence
- **Preconditions**: What must be true before this node starts
- **Post-conditions**: What must be true after this node completes
- **KPI entities**: Typed expected outputs (string, number, array, dict) that must be extractable from this node's result
- **Depends on**: Parent node IDs
- **Can parallelize**: Whether siblings can execute concurrently
- **Verify**: Command or check that confirms post-conditions

### 3. KPI Entity Definitions (replaces vague "done" criteria)

Each task's success is measured by typed entities it must produce:

**Format:**
```
T3: <name>
  Outputs:
    - user_id: string (the created user's ID)
    - auth_token: string (session token for immediate use)
    - status_code: number (201 for success)
  Depends on: T1, T2
  Verify: curl -X POST ... | jq '.user_id != null'
```

Failure = expected entity cannot be extracted from the output. This makes failure root causes immediately diagnosable.

### 4. File Structure

Before defining tasks, map out:
- Which files will be created/modified
- What each file is responsible for
- Design units with clear boundaries
- Prefer smaller focused files over large monolithic ones

### 5. Task Detail

Each task must include:
- Exact file paths to modify
- What code to write (or reference to the approach)
- KPI entities that define success
- What tests to write and how to verify
- Dependencies on other tasks

### 6. Replanning Boundaries

Define per-node:
- **Local**: Failures in this node trigger replanning only within this node. No cascading replan.
- **Global**: Failures here invalidate downstream nodes. Requires full re-plan of affected subtree.

Most nodes should be **Local** replanning. Only integration/interface nodes should be **Global**.

### 7. Goal Re-anchoring

For plans with 10+ tasks, insert checkpoints every 3-5 tasks where the original high-level objective is re-injected into context to prevent goal drift.

## Rules

- **Complexity-matched decomposition** — use DGI formula: subtasks ≈ 0.85 × S^1.5
- **DAG over list** — always map dependencies explicitly; flat lists hide coupling
- **KPI entities required** — every task must define typed expected outputs
- **Coordination budget** — if DGI > 3.0, justify every additional subtask; over-decomposition is worse than under-decomposition
- **DRY** — don't repeat yourself
- **YAGNI** — you aren't gonna need it
- **TDD** — tests first
- **Frequent commits** — small, atomic, meaningful
- **Bite-sized tasks** — 2-5 minutes each, not hours

If working in an isolated worktree, it should have been created via `atlas:using-git-worktrees` first.

Save plans to `docs/plans/YYYY-MM-DD-<feature-name>.md`.

## Plan Format (template)

```markdown
# Plan: <feature>

Complexity: <simple | moderate | complex | very-complex>
Estimated steps (S): <number>
DGI target: <range>
Total subtasks: <number>

## Goal
Re-anchor: <original high-level objective>

## DAG
<ASCII or Mermaid diagram>

## Tasks

### T1: <name> [local replan]
- **Pre**: <precondition>
- **Post**: <post-condition>
- **Outputs**:
  - <entity>: <type> (<description>)
- **Files**: <path>
- **Depends on**: <none | T-X>
- **Verify**: <command or check>

[repeat for all tasks]

## Replanning Boundaries
- Local replan nodes: T1, T2, T3...
- Global replan triggers: <conditions>
```

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Fixed granularity for all tasks | Wrong DGI for complexity level | Estimate S first, then choose DGI |
| Flat list with no dependency graph | Hidden coupling, wrong order | Use DAG structure with explicit edges |
| Vague "done" criteria ("works correctly") | Unverifiable, subjective | Use typed KPI entities |
| Prose paragraphs instead of structured tasks | Ambiguous, un-trackable | Use structured task format with exact fields |
| No replanning boundaries | Single failure cascades to global replan | Label each node local vs global |
| Over-decomposition ("more tasks = more thorough") | Coordination overhead dominates | Stay within DGI range; prune if coordination > 30% |
| Leaving placeholders in tasks | Implementation stalls | Fill in every detail before starting |
| Plans with no testing strategy | Untestable features | Every task needs a Verify step |
| Tasks spanning multiple files with no clear boundaries | Coupling, context loss | One clear concern per task |
| Skipping dependency mapping | Wrong order, blocked tasks | Map dependencies before writing tasks |

## Quality Checklist

- [ ] Complexity assessed and DGI chosen before decomposition
- [ ] DAG structure with explicit dependency edges
- [ ] Each task has typed KPI entity outputs
- [ ] Replanning boundaries labeled (local vs global)
- [ ] Goal re-anchoring checkpoint for 10+ task plans
- [ ] Coordination budget checked (DGI < 3.0 or justified)
- [ ] All file paths are exact
- [ ] Each task has a verification step
- [ ] Dependencies are explicit
- [ ] No placeholders or TODOs
- [ ] Plan saved to `docs/plans/`
