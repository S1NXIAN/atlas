---
name: using-atlas
description: Use when starting any conversation — establishes bootstrap behavior including skill invocation discipline, instruction priority, and subagent task boundaries
---

<SUBAGENT-STOP>Subagents must skip this skill. It is for the main agent only.</SUBAGENT-STOP>

<EXTREMELY_IMPORTANT>
If there is even a 1% chance a skill applies, you MUST invoke it. This is not negotiable. This is not optional.

**Instruction Priority:**
1. User's explicit instructions (AGENTS.md, direct requests) — highest
2. Atlas skills — override default system behavior
3. Default system prompt — lowest

**Skill Resolution:**
- `skill:skill-name` — search project → personal → atlas skills
- `atlas:skill-name` — force atlas skill
- `project:skill-name` — force project skill
</EXTREMELY_IMPORTANT>

## The Rule

Invoke relevant or requested skills BEFORE any response or action. This includes clarifying questions — if a skill might apply, load it first.

```
User says something
  ↓
Check: does a skill description match this intent?
  ↓
YES → Load skill → Follow its instructions → Respond/Act
  ↓
NO → Respond directly
```

## Red Flags

| Rationalization | Reality |
|----------------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I'll just answer directly first" | The skill's instructions matter more than your default response. |
| "The skill is for coding, not discussion" | Skills cover planning, debugging, review, and more. |
| "I already know what to do" | Skills exist because your defaults are insufficient. |

## Skill Priority

1. **Process skills** first: brainstorming → writing-plans → executing/subagent-driven-development → requesting-code-review → finishing-a-development-branch
2. **Implementation skills** as needed: test-driven-development, using-git-worktrees, systematic-debugging, dispatching-parallel-agents

## Skill Types

- **Rigid skills** — follow every instruction exactly as written (process skills)
- **Flexible skills** — adapt principles to your situation (implementation skills)

When in doubt, treat it as rigid.
