---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

## The Iron Law

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

## When to Use

ANY technical issue: test failures, bugs, unexpected behavior, performance problems, build failures, integration issues.

Use ESPECIALLY when:
- Under time pressure
- A quick fix seems obvious
- Previous fixes have failed
- The issue isn't fully understood

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
