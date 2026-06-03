---
name: dispatching-parallel-agents
description: Use when 2+ independent tasks can be worked on without shared state or sequential dependencies
---

You delegate tasks to specialized agents with isolated context. By precisely crafting their instructions and context, you ensure they stay focused and succeed at their task. They should never inherit your session's context or history — you construct exactly what they need.

## When NOT to Use

- Tasks share state or have dependencies on each other
- Tasks modify the same files (will cause conflicts)
- Full system state understanding is needed for each task

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

## Pattern

1. **Identify Independent Domains** — separate by subsystem, file, or concern
2. **Create Focused Agent Tasks** — each with: clear scope, specific goal, constraints, expected output
3. **Dispatch in Parallel** — use subagent dispatch for each
4. **Review and Integrate** — collect results, verify no conflicts, integrate

## Anti-Patterns

| Pattern | Problem | Fix |
|---------|---------|-----|
| Dispatching related tasks in parallel | Merge conflicts, inconsistent solutions | Use sequential execution for related tasks |
| Not reviewing results for conflicts | Incompatible changes | Always review and integrate after parallel dispatch |
| Giving each agent full session context | Wasted tokens, context pollution | Craft precise, minimal instructions per agent |

## Quality Checklist

- [ ] All tasks confirmed independent
- [ ] No shared state between tasks
- [ ] Each agent gets precise, isolated context
- [ ] Results reviewed for conflicts before integration
