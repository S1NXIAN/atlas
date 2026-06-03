---
name: requesting-code-review
description: Use after completing a task, implementing a feature, or before merging — any time changes need verification against requirements
---

Dispatch a code reviewer subagent to catch issues before they cascade. The reviewer gets precisely crafted context for evaluation — never your session's history.

## When NOT to Use

- Changes are trivial (typo fix, comment update)
- You are still in active development (review after task completion)
- The code hasn't been tested yet (test first, then review)

## When to Request Review

**Mandatory:**
- After each task in subagent-driven development
- After completing a major feature
- Before merge to main

**Optional:**
- When stuck
- Before refactoring
- After fixing a complex bug

## How to Request

1. Get git SHAs: `BASE_SHA` (commit before your changes) and `HEAD_SHA` (current)
2. Dispatch a code reviewer subagent with:
   - Description of what was implemented
   - The plan or requirements
   - `BASE_SHA` and `HEAD_SHA`
   - Never your session history

## Act on Feedback

| Severity | Action |
|----------|--------|
| Critical | Fix immediately — blocks progress |
| Important | Fix before proceeding |
| Minor | Note for later |
| Disagree | Push back with reasoning |

## Integration

- In Subagent-Driven Development: review after EACH task
- In Executing Plans: review after each task or at natural checkpoints

## Quality Checklist

- [ ] Code has been tested before requesting review
- [ ] Reviewer gets spec context, not session history
- [ ] Git SHAs provided for diff
- [ ] Critical and Important issues fixed before proceeding
