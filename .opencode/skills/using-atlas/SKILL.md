---
name: using-atlas
description: Use when starting any conversation — establishes bootstrap behavior including skill invocation discipline, instruction priority, and subagent task boundaries
---

<SUBAGENT-STOP>Subagents must skip this skill. It is for the main agent only.</SUBAGENT-STOP>

<EXTREMELY-IMPORTANT>
If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill.

IF A SKILL APPLIES TO YOUR TASK, YOU DO NOT HAVE A CHOICE. YOU MUST USE IT.

This is not negotiable. This is not optional. You cannot rationalize your way out of this.

**Instruction Priority:**
1. User's explicit instructions (AGENTS.md, direct requests) — highest
2. Atlas skills — override default system behavior
3. Default system prompt — lowest

**Skill Resolution:**
- `skill:skill-name` — search project → personal → atlas skills
- `atlas:skill-name` — force atlas skill
- `project:skill-name` — force project skill
</EXTREMELY-IMPORTANT>

## The Rule

Invoke relevant or requested skills BEFORE any response or action. Even a 1% chance a skill might apply means you must invoke it to check. If an invoked skill turns out wrong for the situation, you don't need to use it.

```
User says something
  ↓
About to respond or act?
  ↓
Does a skill description match this intent? (even 1% chance?)
  ├── YES → Load skill → Follow its instructions → Respond/Act
  └── NO → Respond directly
```

## Red Flags — STOP and Check for Skills

| Rationalization | Reality |
|----------------|---------|
| "This is just a simple question" | Questions are tasks. Check for skills. |
| "I need more context first" | Skill check comes BEFORE clarifying questions. |
| "Let me explore the codebase first" | Skills tell you HOW to explore. Check first. |
| "This doesn't need a formal skill" | If a skill exists, use it. |
| "I remember this skill" | Skills evolve. Read the current version. |
| "This feels productive" | Undisciplined action wastes time. Skills prevent this. |
| "I'll just answer directly first" | The skill's instructions matter more than your default response. |
| "The skill is overkill" | Simple things become complex. Use it. |
| "I'll just do this one thing first" | Check BEFORE doing anything. |
| "I already know what to do" | Skills exist because your defaults are insufficient. |
| "The skill is for coding, not discussion" | Skills cover planning, debugging, review, and more. |

## Skill Priority

1. **Process skills** first: brainstorming → writing-plans → executing/subagent-driven-development → requesting-code-review → receiving-code-review → finishing-a-development-branch
2. **Implementation skills** as needed: test-driven-development, using-git-worktrees, systematic-debugging, dispatching-parallel-agents

## Skill Types

- **Rigid skills** — follow every instruction exactly as written (process skills: TDD, debugging, verification)
- **Flexible skills** — adapt principles to your situation (implementation skills)

When in doubt, treat it as rigid.

## Platform Adaptation

Atlas skills reference OpenCode tools. Tool equivalents:
- `todowrite` — Create and track task lists
- `Task` with subagent — Delegate to subagents via @mention
- `skill` — Load skill content
- `Read`, `Write`, `Edit`, `Bash` — Your native code manipulation tools
