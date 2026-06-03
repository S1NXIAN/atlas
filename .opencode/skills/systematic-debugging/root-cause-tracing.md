# Root Cause Tracing

## Overview

Trace bugs backward through the call stack to find the original trigger. Fix at the source, not at the symptom.

## The Technique

### Step 1: Identify the Symptom

Start at the failure point — the exact error message, the crash location, the wrong output. Note:
- Exact error message and line number
- Input values at the failure point
- Expected vs actual output

### Step 2: Walk Backward

Ask "what called this?" and "what value did it pass?" for each frame:

```
Failure at function processData(data) line 42: data.id is undefined

Frame 1: Who called processData?
  → transformResults(items) at line 78
  → items[0] missing 'id' field

Frame 2: Where did items come from?
  → fetchRecords(query) at line 15
  → query missing 'include=id' parameter

Frame 3: Who built the query?
  → buildQuery(params) at line 201
  → params.filter excludes 'id' field

Root cause: buildQuery() strips 'id' when filter is set
```

### Step 3: Fix at the Source

The fix goes in `buildQuery()`, not in `processData()`.

### Step 4: Add Defensive Checks

After fixing the root cause, add validation at the original symptom location as defense-in-depth:
- Log unexpected values
- Fail fast with clear messages
- Document the invariant

## When to Use

- Deep call stacks with confusing error messages
- Intermittent failures (value depends on code path)
- Errors that are caught and re-thrown (losing original context)

## When NOT to Use

- Simple, obvious errors with clear error messages
- Environment/configuration issues (tracing won't help)
- Known bug in a dependency (fix the usage or update)
