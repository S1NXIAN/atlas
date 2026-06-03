<!-- Context: core/workflows/session-management | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Session Management

## Context Window Awareness
- Be aware of the limited context window
- Prioritize the most relevant information
- Prune old/superseded information when needed
- Use subagents for tasks that would bloat context

## Session Continuation
- When resuming a session, read the plan file and todo list first
- Check git status to understand current state
- Review the most recent context and decisions
- Verify tests still pass before continuing

## Between Sessions
- Save plans to `docs/plans/`
- Save specs to `docs/specs/`
- Keep tasks in a todowrite list
- Commit frequently with clear messages

## Compaction
When context gets full:
1. Summarize what's been accomplished
2. Save the current state to files
3. Identify what remains
4. Verify nothing is lost in the summary

## Recovery
If the session crashes or resets:
1. Read the plan file
2. Read git log for recent commits
3. Run tests to see what passes/fails
4. Check for uncommitted work
5. Resume from the last verified state
