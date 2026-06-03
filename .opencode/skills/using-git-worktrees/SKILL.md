---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans — checks for existing isolation and creates one if needed
---

Ensure work happens in an isolated workspace. Prefer your platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

## When NOT to Use

- You are already in an isolated workspace
- The change is trivial and won't benefit from isolation
- The user declined worktree creation

## Process

### Step 0: Detect Existing Isolation
Check if already in a linked worktree:
- `GIT_DIR` vs `GIT_COMMON_DIR` detection
- Submodule guard: `git rev-parse --show-superproject-working-tree`

If already in a linked worktree, skip to Step 3.

If not, ask for user consent before creating a worktree.

### Step 1a: Native Worktree Tools (Preferred)
If the platform has a worktree tool (e.g., `EnterWorktree`, `WorktreeCreate`, `/worktree` command), use it. Only proceed to Step 1b if no native tool exists.

### Step 1b: Git Worktree Fallback
Directory selection priority:
1. `./worktrees/`
2. `./.worktrees/`
3. `~/.config/atlas/worktrees/$project/`

Verify the directory is gitignored before creating.

### Step 2: Create Worktree
```bash
git fetch origin
git checkout -b <feature-branch>
git worktree add ../worktrees/<feature-branch> <feature-branch>
```

### Step 3: Verify Setup
- Confirm you're in the worktree
- Run project setup (install, build)
- Verify clean test baseline

Once verified, proceed to `atlas:writing-plans`.

## Quality Checklist

- [ ] Existing isolation checked first
- [ ] User consent obtained (if new worktree)
- [ ] Worktree verified as working
- [ ] Clean test baseline confirmed
