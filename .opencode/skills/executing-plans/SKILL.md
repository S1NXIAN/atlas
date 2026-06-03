---
name: executing-plans
description: Use when you have a written implementation plan and need to execute tasks sequentially without subagents
---

Load plan, review critically, execute all tasks, report when complete.

## When NOT to Use

- Subagents are available (use subagent-driven-development instead — higher quality)
- No written plan exists yet (use writing-plans first)
- Tasks are independent and could benefit from parallel execution

## Process

1. **Load and Review Plan**
   - Read the plan file from `docs/plans/`
   - Review critically — raise concerns before starting
   - If acceptable, create todowrite list and proceed

2. **Execute Tasks**
   For each task:
   - Mark `in_progress`
   - Follow each step exactly
   - Run verifications after each change
   - Mark `completed`

3. **Complete Development**
   After all tasks complete and are verified, use `atlas:finishing-a-development-branch`.

## When to Stop

- Blockers you cannot resolve
- Critical gaps in the plan
- Unclear instructions
- Repeated verification failures

## Quality Checklist

- [ ] Plan reviewed critically before starting
- [ ] Todowrite list created from plan tasks
- [ ] Each task verified after completion
- [ ] Finishing-a-development-branch invoked at the end
