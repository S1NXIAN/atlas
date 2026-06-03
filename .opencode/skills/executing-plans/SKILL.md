---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

Load plan, review critically, execute all tasks, report when complete.

Announce at start: "I'm using the executing-plans skill to implement this plan."

**Note:** If subagents are available, use `atlas:subagent-driven-development` instead — it produces higher quality results through specialized review.

## Step 1: Load and Review Plan
- Read the plan file from `docs/plans/`
- Review critically — raise concerns before starting
- If acceptable, create todowrite list and proceed

## Step 2: Execute Tasks
For each task:
- Mark `in_progress`
- Follow each step exactly
- Run verifications after each change
- Mark `completed`

## Step 3: Complete Development
After all tasks complete and are verified, use `atlas:finishing-a-development-branch`.

## When to Stop
- Blockers you cannot resolve
- Critical gaps in the plan
- Unclear instructions
- Repeated verification failures

## When to Revisit
- Partner updates the plan
- Fundamental approach needs rethinking
