---
name: finishing-a-development-branch
description: Use when implementation is complete, all tests pass, and you need to decide how to integrate the work — presents structured options for merge, PR, or cleanup
---

Guide completion of development work by presenting clear options and handling chosen workflow.

**Core principle:** Verify tests → Detect environment → Present options → Execute choice → Clean up.

## When NOT to Use

- Tests are still failing (fix them first)
- Implementation is not complete
- No development branch exists (you're on main)

## Process

### Step 1: Verify Tests
Run the project's test suite. If tests fail, show failures and stop.

### Step 2: Detect Environment
Determine workspace state using `GIT_DIR` vs `GIT_COMMON`:
- Normal repo or named-branch worktree → 4 options
- Detached HEAD → 3 options

### Step 3: Determine Base Branch
Try `git merge-base HEAD main` or `master`.

### Step 4: Present Options

**Normal repo / named-branch worktree:**
1. **Merge** — merge back to base branch locally
2. **PR** — push and create a pull request
3. **Keep** — keep branch as-is
4. **Discard** — throw away this work

**Detached HEAD:**
1. **PR** — push and create a pull request
2. **Keep** — note the SHA for later
3. **Discard** — throw away this work

### Step 5: Execute Choice
Carry out the selected option with the correct git commands.

### Step 6: Cleanup Workspace
Only for Merge and Discard options. Check provenance — only clean up worktrees under known paths (`.worktrees/`, `worktrees/`, `~/.config/atlas/worktrees/`).

## Quality Checklist

- [ ] Tests pass before proceeding
- [ ] Environment detected correctly
- [ ] Base branch determined
- [ ] Options presented clearly
- [ ] Workspace cleaned up (for merge/discard)
