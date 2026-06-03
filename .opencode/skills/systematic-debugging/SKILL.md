---
name: systematic-debugging
description: Use when encountering any bug, test failure, or unexpected behavior, before proposing fixes
---

Random fixes waste time and create new bugs. Quick patches mask underlying issues.

**Core principle:** ALWAYS find root cause before attempting fixes. Symptom fixes are failure.

**Violating the letter of this process is violating the spirit of debugging.**

## The Iron Law

**NO FIXES WITHOUT ROOT CAUSE INVESTIGATION FIRST.**

If you haven't completed Phase 1, you cannot propose fixes.

## When NOT to Use

- The issue is already diagnosed and root cause is known (fix directly)
- The behavior is expected (misunderstanding, not a bug)

## When to Use

Use for ANY technical issue:
- Test failures
- Bugs in production
- Unexpected behavior
- Performance problems
- Build failures
- Integration issues

**Use ESPECIALLY when:**
- Under time pressure (emergencies make guessing tempting)
- "Just one quick fix" seems obvious
- You've already tried multiple fixes
- You don't fully understand the issue

Don't skip when:
- Issue seems simple (simple bugs have root causes too)
- You're in a hurry (rushing guarantees rework)

## The Four Phases

You MUST complete each phase before proceeding to the next.

### Phase 1: Root Cause Investigation

Before attempting ANY fix:

1. **Read Error Messages Carefully** — every word, stack traces completely, note line numbers and file paths
2. **Reproduce Consistently** — can you trigger it reliably? Every time?
3. **Check Recent Changes** — `git diff`, recent commits, new dependencies, config changes
4. **Gather Evidence in Multi-Component Systems**

   When system has multiple components (API → service → database, CI → build → signing):

   Before proposing fixes, add diagnostic instrumentation:
   ```
   For EACH component boundary:
     - Log what data enters component
     - Log what data exits component
     - Verify environment/config propagation
     - Check state at each layer

   Run once to gather evidence showing WHERE it breaks
   THEN analyze evidence to identify failing component
   THEN investigate that specific component
   ```

   **Example (multi-layer signing flow):**
   ```bash
   # Layer 1: Workflow
   echo "=== Secrets available in workflow: ==="
   echo "IDENTITY: ${IDENTITY:+SET}${IDENTITY:-UNSET}"

   # Layer 2: Build script
   echo "=== Env vars in build script: ==="
   env | grep IDENTITY || echo "IDENTITY not in environment"

   # Layer 3: Signing script
   echo "=== Keychain state: ==="
   security list-keychains
   security find-identity -v

   # Layer 4: Actual signing
   codesign --sign "$IDENTITY" --verbose=4 "$APP"
   ```
   This reveals which layer fails — helps pin the issue immediately.

5. **Trace Data Flow** — where does the bad value originate? What called this with bad value? Trace up until you find the source. Fix at source, not at symptom.

### Phase 2: Pattern Analysis

1. Find working examples in the same codebase
2. Compare against references — read completely, don't skim
3. Identify differences between working and broken — list every difference
4. Understand dependencies

### Phase 3: Hypothesis and Testing

1. Form a single specific hypothesis: "I think X is the root cause because Y"
2. Test minimally — one variable at a time. Don't fix multiple things at once.
3. Verify before continuing
4. If didn't work → form NEW hypothesis

### Phase 4: Fix

1. Create a failing test case reproducing the bug
2. Implement the single fix — address the root cause, ONE change at a time
3. Verify the original symptom is resolved
4. Verify no regressions

**If Fix Doesn't Work:**
- If < 3 attempts: Return to Phase 1 with new information
- **If ≥ 3 attempts: STOP and question the architecture (see below)**
- Don't attempt Fix #4 without architectural discussion

### If 3+ Fixes Failed: Question Architecture

Pattern indicating architectural problem:
- Each fix reveals new shared state/coupling in a different place
- Fixes require "massive refactoring" to implement
- Each fix creates new symptoms elsewhere

**STOP and question fundamentals:**
- Is this pattern fundamentally sound?
- Should we refactor architecture vs. continue fixing symptoms?

Discuss with the human partner before attempting more fixes.

## Red Flags — STOP and Follow Process

| Rationalization | Reality |
|----------------|---------|
| "I know what the fix is" | You don't until you've found root cause. |
| "Let me just try this" | Guessing is not debugging. |
| "Quick fix for now, investigate later" | No such thing. First fix sets the pattern. |
| "It worked before, what changed?" | Good instinct — find exactly what changed. |
| "This looks like that other bug" | Similar symptoms ≠ same root cause. |
| "One more fix attempt" (after 2+ failures) | 3+ failures = architectural problem. |
| "Just try changing X and see if it works" | Add multiple changes, not a single test. |
| "Skip the test, I'll manually verify" | Manual verification is not repeatable. |

## Human Partner's Signals You're Doing It Wrong

**Watch for these redirections:**
- "Is that not happening?" — You assumed without verifying
- "Will it show us...?" — You should have added evidence gathering
- "Stop guessing" — You're proposing fixes without understanding
- "We're stuck?" (frustrated) — Your approach isn't working

## Rationalization Prevention

| Excuse | Reality |
|--------|---------|
| "Issue is simple, don't need process" | Simple issues have root causes too. Process is fast for simple bugs. |
| "Emergency, no time for process" | Systematic debugging is FASTER than guess-and-check thrashing. |
| "I'll write test after confirming fix works" | Untested fixes don't stick. Test first proves it. |
| "Multiple fixes at once saves time" | Can't isolate what worked. Causes new bugs. |
| "Reference too long, I'll adapt the pattern" | Partial understanding guarantees bugs. Read it completely. |

## Quick Reference

| Phase | Key Activities | Success Criteria |
|-------|---------------|------------------|
| 1. Root Cause | Read errors, reproduce, check changes, gather evidence | Understand WHAT and WHY |
| 2. Pattern | Find working examples, compare | Identify differences |
| 3. Hypothesis | Form theory, test minimally | Confirmed or new hypothesis |
| 4. Fix | Create test, fix, verify | Bug resolved, tests pass |

## Quality Checklist

- [ ] Error message read completely
- [ ] Issue reproduced consistently
- [ ] Recent changes checked
- [ ] Root cause identified before fix
- [ ] Multi-component instrumentation gathered (if applicable)
- [ ] Hypothesis tested minimally (one variable)
- [ ] Failing test written before fix
- [ ] Fix verified against original symptom
- [ ] No regressions introduced
- [ ] If 3+ fixes failed: architecture questioned
