---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## When NOT to Use

- The issue is already diagnosed and root cause is known (fix directly)
- The behavior is expected (misunderstanding, not a bug)

## The Iron Law

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

## The Four Phases

### Phase 1: Root Cause Investigation
1. Read error messages carefully — every word
2. Reproduce the issue consistently
3. Check recent changes: `git diff`, recent commits
4. Gather evidence — add diagnostic instrumentation at component boundaries
5. Trace data flow backward through the call stack

### Phase 2: Pattern Analysis
1. Find working examples in the same codebase
2. Compare against references — read completely, don't skim
3. Identify differences between working and broken
4. Understand dependencies

### Phase 3: Hypothesis and Testing
1. Form a single specific hypothesis
2. Test minimally — one variable at a time
3. Verify before continuing

### Phase 4: Fix
1. Apply the minimal fix
2. Verify the original symptom is resolved
3. Verify no regressions
4. Only then claim success

## Red Flags

| Thought | Reality |
|---------|---------|
| "I know what the fix is" | You don't until you've found root cause. |
| "Let me just try this" | Guessing is not debugging. |
| "It worked before" | What changed? Find it. |
| "This looks like that other bug" | Similar symptoms ≠ same root cause. |

## Quality Checklist

- [ ] Error message read completely
- [ ] Issue reproduced consistently
- [ ] Recent changes checked
- [ ] Root cause identified before fix
- [ ] Fix verified against original symptom
- [ ] No regressions introduced
