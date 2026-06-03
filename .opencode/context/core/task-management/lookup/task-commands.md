<!-- Context: core/task-management/lookup/task-commands | Priority: low | Version: 1.0 | Updated: 2026-06-03 -->

# Task Commands Reference

## OpenCode Native
- `todowrite` — Create/manage task list
- Tasks stay in the conversation, not persistent between sessions

## Workflow Integration
Tasks are managed through the development workflow:
1. Planning phase creates the task list (via writing-plans skill)
2. Execution phase marks tasks complete (via subagent-driven-development or executing-plans)
3. Review phase verifies tasks (via requesting-code-review)
4. Completion phase closes out (via finishing-a-development-branch)

## Best Practices
- Create the full task list before starting execution
- Mark tasks as they complete
- Don't skip tasks
- If blocked, note the blocker and escalate
