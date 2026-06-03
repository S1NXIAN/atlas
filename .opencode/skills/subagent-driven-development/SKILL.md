---
name: subagent-driven-development
description: Use when executing an implementation plan with independent tasks and subagents are available in the current session
---

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then code quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec first, then quality) = high quality, fast iteration.

**Continuous execution:** Do not pause to check in with the human partner between tasks. Execute all tasks without stopping.

## When NOT to Use

- Tasks are tightly coupled and cannot be isolated
- No subagents are available (use executing-plans instead)
- The plan doesn't exist yet (use writing-plans first)

## When to Use

```
Tasks are independent?
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

| Status | Action |
|--------|--------|
| DONE | Proceed to spec review |
| DONE_WITH_CONCERNS | Review concerns, fix if needed, proceed |
| NEEDS_CONTEXT | Provide context, re-dispatch |
| BLOCKED | Stop, escalate to human partner |

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Dispatching multiple implementers in parallel | File conflicts, merge hell | One task at a time, sequentially |
| Skipping the spec review | Over-building or under-building | Spec review before quality review |
| Sharing full session history with subagent | Context pollution, wasted tokens | Craft precisely what the subagent needs |
| Proceeding with unfixed review issues | Accumulated debt | Fix every issue before next task |

## Quality Checklist

- [ ] All tasks extracted into todowrite before starting
- [ ] Each implementer gets precise, isolated context
- [ ] Spec compliance review done before quality review
- [ ] Issues fixed before proceeding to next task
- [ ] Final code review dispatched after all tasks
