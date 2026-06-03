<!-- Context: core/workflows/task-delegation | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Task Delegation Workflow

## When to Delegate

| Situation | Delegate To |
|-----------|-------------|
| Need to understand codebase | explore or librarian |
| Complex architecture decision | oracle |
| Need project patterns | context-scout |
| UI/frontend work | frontend-engineer |
| Writing tests | test-engineer |
| Code review | code-reviewer |
| External library integration | external-scout |
| Feature breakdown | task-manager |

## How to Delegate

1. **Clear scope**: Tell the subagent exactly what to do
2. **Provide context**: Only what's needed — no more
3. **Set expectations**: What "done" looks like
4. **Never share your full session history**: Craft the context precisely

## After Delegation

- Review the subagent's output
- Integrate the work
- Verify nothing was broken
- Thank the subagent

## When NOT to Delegate

- Task takes less time to do yourself than to explain
- Task requires full system context the subagent can't get
- Task involves sensitive decisions only you should make
- Multiple subagents would conflict or duplicate work
