<!-- Context: core/task-management/standards/task-schema | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Task Schema

## Task Format

Each task in a todowrite list follows this structure:

```markdown
- [ ] **Task N: Short Name** (priority: high/medium/low)
  - **What**: One clear sentence describing the task
  - **Files**: path/to/file.ts (one or more)
  - **Depends on**: Task M (optional, omit if independent)
  - **Verify**: Command or condition to confirm completion
```

## Priority

| Priority | Meaning |
|----------|---------|
| High | Blocks other tasks or is critical to the feature |
| Medium | Important but not blocking |
| Low | Nice to have, can be deferred |

## Task Size Guidelines

- **Too small**: Under 1 minute of work (combine with adjacent tasks)
- **Just right**: 2-5 minutes of work
- **Too large**: Over 10 minutes of work (split further)

## States
- Not started (unchecked)
- In progress (one task at a time)
- Completed (checked)
- Blocked (noted with reason)
