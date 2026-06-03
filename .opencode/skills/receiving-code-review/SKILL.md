---
name: receiving-code-review
description: Use when receiving code review feedback, before implementing suggestions — requires technical evaluation not performative agreement
---

# Code Review Reception

## Overview

Code review requires technical evaluation, not emotional performance.

**Core principle:** Verify before implementing. Ask before assuming. Technical correctness over social comfort.

## When NOT to Use

- You are the one requesting review (use requesting-code-review instead)
- No feedback has been received yet
- You've already verified and implemented the feedback

## The Response Pattern

```
WHEN receiving code review feedback:

1. READ: Complete feedback without reacting
2. UNDERSTAND: Restate requirement in own words (or ask)
3. VERIFY: Check against codebase reality
4. EVALUATE: Technically sound for THIS codebase?
5. RESPOND: Technical acknowledgment or reasoned pushback
6. IMPLEMENT: One item at a time, test each
```

## Forbidden Responses

**NEVER:**
- "You're absolutely right!"
- "Great point!" / "Excellent feedback!"
- "Let me implement that now" (before verification)

**INSTEAD:**
- Restate the technical requirement
- Ask clarifying questions
- Push back with technical reasoning if wrong
- Just start working (actions > words)

## Handling Unclear Feedback

```
IF any item is unclear:
  STOP — do not implement anything yet
  ASK for clarification on unclear items

WHY: Items may be related. Partial understanding = wrong implementation.
```

## Implementation Order

```
FOR multi-item feedback:
  1. Clarify anything unclear FIRST
  2. Then implement in this order:
     - Blocking issues (breaks, security)
     - Simple fixes (typos, imports)
     - Complex fixes (refactoring, logic)
  3. Test each fix individually
  4. Verify no regressions
```

## When To Push Back

Push back when:
- Suggestion breaks existing functionality
- Reviewer lacks full context
- Violates YAGNI (unused feature)
- Technically incorrect for this stack
- Legacy/compatibility reasons exist
- Conflicts with architectural decisions

**How to push back:**
- Use technical reasoning, not defensiveness
- Ask specific questions
- Reference working tests/code

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Performative agreement | Reviewer doesn't learn what's wrong | State requirement or just act |
| Blind implementation | Breaks existing functionality | Verify against codebase first |
| Batch without testing | Can't isolate regression cause | One at a time, test each |
| Assuming reviewer is always right | Ships incorrect changes | Check if it breaks things |
| Avoiding pushback | Technical correctness suffers | Technical correctness > comfort |
| Partial understanding | Wrong implementation | Clarify all items first |

## Quality Checklist

- [ ] Read all feedback completely before reacting
- [ ] Clarified anything unclear before implementing
- [ ] Verified each suggestion against codebase reality
- [ ] One fix at a time, tested individually
- [ ] Pushed back with reasoning where appropriate
- [ ] No regressions introduced
