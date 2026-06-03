---
name: executing-plans
description: Use when you have a written implementation plan and need to execute tasks sequentially without subagents
---

Execute a DAG-structured plan with scoped context per sub-task, local replanning on failure, and periodic goal re-anchoring. Each sub-task operates on its own context slice — never the full global execution history.

Research basis: Task-Decoupled Planning (TDP, arXiv 2601.07577).

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Subagent-Driven Development produces higher quality results. If subagents are available in your session, use `atlas:subagent-driven-development` instead. This skill is for when subagents are not available or you need a parallel session.

## When NOT to Use

- Subagents are available (use subagent-driven-development instead)
- No written plan exists yet (use writing-plans first)
- Tasks are independent and could benefit from parallel execution

## Process

### 1. Load and Review Plan

- Read the plan file from `docs/plans/`
- Identify the DAG structure — which nodes depend on which
- Note replanning boundaries (local vs global)
- Verify KPI entities are defined for each task
- Review critically — raise concerns before starting
- If acceptable, create todowrite list and proceed

### 2. Scoped Context Per Sub-Task

For each task, construct a **node-scoped context** containing ONLY:
- The task's own specification (description, files, KPIs)
- Prerequisite node outcomes (not full execution history)
- The interaction trace accumulated during this task's execution only

**NEVER pass the full global execution history** into a sub-task. This prevents error propagation and reduces cognitive load.

### 3. Execute Tasks (DAG-order)

For each task (in dependency order):
- Mark `in_progress`
- Load only the scoped context for this node
- Follow each step exactly
- Verify KPI entities — confirm all typed expected outputs are extractable
- If verification fails, determine replanning scope:
  - **Local replanning**: Fix within this node only. Do not revisit completed prerequisite nodes or propagate to siblings.
  - **Global replanning**: If the failure invalidates downstream nodes, flag for full re-plan of the affected subtree.

- Mark `completed` only when all KPI entities are verified

### 4. Goal Re-anchoring (for plans with 10+ tasks)

Every 3-5 tasks, re-inject the original high-level objective into context. This prevents goal drift as context fills with operational detail.

### 5. Complete Development

After all tasks complete and are verified, use `atlas:finishing-a-development-branch`.

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

**Return to Review when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

Don't force through blockers — stop and ask.

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Passing full execution history to each sub-task | Error propagation, context pollution | Use node-scoped context only |
| Global replan on every local failure | Token waste, destabilizes completed work | Try local replan first; escalate only if node's post-conditions are unreachable |
| No verification between tasks | Broken KPI chains propagate downstream | Verify every task's entity outputs before advancing |
| No goal re-anchoring in long plans | Goal drift after 5+ tasks | Re-inject original high-level objective every 3-5 tasks |
| Ignoring replanning boundaries in the plan | Cascading failures across independent nodes | Respect the plan's local/global labels |

## Quality Checklist

- [ ] Plan reviewed critically before starting
- [ ] DAG traversal order correct (dependencies first)
- [ ] Each task received scoped context only (not full history)
- [ ] KPI entities verified after each task
- [ ] Local replanning attempted before escalating to global
- [ ] Goal re-anchored at checkpoints (if 10+ tasks)
- [ ] Todowrite list created from plan tasks
- [ ] Each task verified after completion
- [ ] Finishing-a-development-branch invoked at the end
