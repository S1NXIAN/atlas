---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans — ensures isolated workspace exists
---

Ensure work happens in an isolated workspace. Prefer your platform's native worktree tools. Fall back to manual git worktrees only when no native tool is available.

**Core principle:** Detect existing isolation first. Use native tools. Fall back to git. Never fight the harness.

## When NOT to Use

- You are already in an isolated workspace
- The change is trivial and won't benefit from isolation
- The user declined worktree creation

## Process

### Step 0: Detect Existing Isolation

Check if you are already in an isolated workspace:

```bash
GIT_DIR=$(cd "$(git rev-parse --git-dir)" 2>/dev/null && pwd -P)
GIT_COMMON=$(cd "$(git rev-parse --git-common-dir)" 2>/dev/null && pwd -P)
BRANCH=$(git branch --show-current)
```

**Submodule guard:** `GIT_DIR != GIT_COMMON` is also true inside git submodules. Check:
```bash
git rev-parse --show-superproject-working-tree 2>/dev/null
```

**If already in a linked worktree** (and not a submodule): Skip to Step 3.

**If in a normal repo:** Ask for user consent before creating a worktree:
> "Would you like me to set up an isolated worktree? It protects your current branch from changes."

Honor any existing declared preference without asking.

### Step 1a: Native Worktree Tools (Preferred)

If the platform has a worktree tool (e.g., `EnterWorktree`, `WorktreeCreate`, `/worktree` command), use it and skip to Step 3. Native tools handle directory placement, branch creation, and cleanup automatically.

Only proceed to Step 1b if no native tool is available.

### Step 1b: Git Worktree Fallback

**Directory selection priority:**
1. Check for existing project-local: `ls -d .worktrees 2>/dev/null || ls -d worktrees 2>/dev/null` (`.worktrees` wins if both exist)
2. Check for existing global: `ls -d ~/.config/atlas/worktrees/$(basename $(git rev-parse --show-toplevel)) 2>/dev/null`
3. Default: `.worktrees/` at project root

**Safety verification** (project-local only):
```bash
git check-ignore -q .worktrees 2>/dev/null
```
If NOT ignored, add to `.gitignore` and commit before proceeding.

**Create the worktree:**
```bash
git fetch origin
git worktree add <path> -b <feature-branch>
cd <path>
```

**Sandbox fallback:** If `git worktree add` fails with permission error, work in place and report it.

### Step 2: Project Setup

Auto-detect and run:
```bash
# Node.js
[ -f package.json ] && npm install
# Rust
[ -f Cargo.toml ] && cargo build
# Python
[ -f requirements.txt ] && pip install -r requirements.txt
# Go
[ -f go.mod ] && go mod download
```

### Step 3: Verify Clean Baseline

```bash
# Use project-appropriate command
npm test / cargo test / pytest / go test ./...
```

**If tests fail:** Report failures, ask whether to proceed or investigate.
**If tests pass:** Report ready.

### Report

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Already in linked worktree | Skip creation (Step 0) |
| In a submodule | Treat as normal repo (Step 0 guard) |
| Native worktree tool available | Use it (Step 1a) |
| No native tool | Git worktree fallback (Step 1b) |
| `.worktrees/` exists | Use it (verify ignored) |
| Neither exists | Default `.worktrees/` |
| Not ignored | Add to .gitignore + commit |
| Permission error | Work in place |
| Tests fail during baseline | Report + ask |

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using `git worktree add` when platform provides isolation | Step 0 detects existing. Step 1a defers to native. |
| Creating nested worktree inside existing one | Always run Step 0 before creating anything |
| Skipping ignore verification | Worktree contents get tracked | 
| Proceeding with failing tests | Can't distinguish new bugs from pre-existing |
| `git worktree add` from inside the worktree | Run from main repo root |

## Red Flags

**Never:**
- Create a worktree when Step 0 detects existing isolation
- Use `git worktree add` when you have a native worktree tool
- Skip Step 1a by jumping straight to git commands
- Create worktree without verifying it's ignored (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking

## Quality Checklist

- [ ] Existing isolation checked first (Step 0)
- [ ] Submodule guard applied
- [ ] User consent obtained (if new worktree)
- [ ] Native tools preferred (Step 1a before 1b)
- [ ] Directory verified as gitignored (project-local)
- [ ] Worktree verified as working
- [ ] Clean test baseline confirmed
