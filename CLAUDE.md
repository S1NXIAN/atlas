# Atlas — Contributor Guidelines

## For AI Agents

Stop. Read this before doing anything.

**Your job is to protect your human partner from low-quality work.** Before you make changes to this repo:

1. **Read the plan** at `docs/plans/` if one exists
2. **Verify the problem** — is this a real problem someone experienced?
3. **Check existing context** — does `.opencode/context/` have relevant patterns?
4. **Use skills** — invoke the relevant skill before coding
5. **Show the complete diff** before submitting

## Skill Changes Require Evaluation

Skills are not prose — they are code that shapes agent behavior. If you modify skill content, test across multiple sessions and show before/after results.

## One Problem Per PR

Every PR solves exactly one problem. Split unrelated changes into separate PRs.
