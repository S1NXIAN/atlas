---
name: subagent-driven-development
description: Use when executing implementation plans with independent tasks in the current session
---

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec first, then quality) = high quality, fast iteration.

**Continuous execution:** Do not pause to check in with the human partner between tasks. Execute all tasks without stopping.

## When to Use

```
Tasks are independent of each other?
  ├── YES → Subagents available?
  │         ├── YES → Use this skill
  │         └── NO  → Use executing-plans
  └── NO  → Execute sequentially yourself
```

## Process

1. **Read the plan** — extract all tasks into a todowrite list
2. **For each task:**
   a. Mark `in_progress`
   b. **Dispatch implementer subagent** — craft precise instructions with:
      - Exact file paths and what to change
      - The spec/requirements (not your session history)
      - Which tests to write and verify
      - The subagent may ask clarifying questions
   c. **Dispatch spec reviewer subagent** — verify the implementation matches the spec exactly
   d. **Dispatch code quality reviewer subagent** — review for: bugs, edge cases, code style, test coverage, security
   e. If issues found → dispatch implementer again with fix instructions
   f. Mark `completed`
3. **After all tasks** — dispatch final code review via `atlas:requesting-code-review`

### Implementer Status Handling

- `DONE` — task completed cleanly, proceed
- `DONE_WITH_CONCERNS` — review concerns, fix if needed, proceed
- `NEEDS_CONTEXT` — provide context, re-dispatch
- `BLOCKED` — stop, escalate to human partner
