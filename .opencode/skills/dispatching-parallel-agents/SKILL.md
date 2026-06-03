---
name: dispatching-parallel-agents
description: Use when facing 2+ independent tasks that can be worked on without shared state or sequential dependencies
---

You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need.

## When to Use

```
Multiple independent problems?
  ├── YES → Different root causes, no shared state?
  │         ├── YES → Use parallel dispatch
  │         └── NO  → Use sequentially
  └── NO  → Single agent
```

**Use when:**
- 3+ test files failing with different root causes
- Multiple subsystems broken independently
- Each problem can be understood without context from others
- No shared state between tasks

**Don't use when:**
- Failures are related or share root cause
- Full system state understanding is needed
- Agents would interfere with each other

## Pattern

1. **Identify Independent Domains** — separate by subsystem, file, or concern
2. **Create Focused Agent Tasks** — each with: clear scope, specific goal, constraints, expected output
3. **Dispatch in Parallel** — use subagent dispatch for each
4. **Review and Integrate** — collect results, verify no conflicts, integrate
