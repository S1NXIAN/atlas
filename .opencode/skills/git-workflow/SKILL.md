---
name: git-workflow
description: Git branching strategy, Conventional Commits format, PR sizing rules, and merge strategy selection. Use when creating branches, writing commit messages, reviewing PRs, or deciding between merge strategies.
metadata:
  pipeline-stage: code-clean, done-check
  depends-on: none
---

# Git Workflow

Consistent git practices for maintainable history and automated changelog generation.

## Core rules

1. **Branch naming** — `type/description` in kebab-case. Max 50 chars. Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `ci`.
2. **Commit format** — Strict Conventional Commits 1.0.0: `type(scope): description` body footer. Subject max 72 chars. Body wrapped at 72 chars.
3. **Allowed types** — `feat`, `fix`, `chore`, `docs`, `style`, `refactor`, `perf`, `test`, `ci`, `build`. No other types.
4. **PR sizing** — Max 400 lines changed, max 10 files. Exclude lockfiles, generated files, and vendor dirs.
5. **Merge strategy** — Squash-merge for feature branches. Rebase-merge for shared branches. Never create merge bubbles.
6. **History** — Always rebase onto target before merging. No merge commits from main into feature branches.
7. **No force push on shared branches** — Use `--force-with-lease` if required. Prefer `--force-if-includes`.

## Procedures

1. Create branch: `git checkout -b feat/description` (type matches the primary change).
2. Make changes. Commit using: `feat(scope): description` for features, `fix(scope): description` for bug fixes.
3. Before PR: rebase onto target branch: `git rebase main`.
4. PR title must match first commit subject. Description summarizes all commits.
5. Ensure PR is ≤400 lines and ≤10 files. If too large, split into stacked PRs.
6. Select merge strategy: squash for feature branches, rebase for collaboration branches.
7. Delete branch after merge.

## Gotchas

- `git rebase` rewrites history. Never rebase commits that exist on a shared branch.
- `--force-with-lease` still overwrites remote. Only use on feature branches you own.
- Large auto-generated files (lockfiles, .pb.go, .generated.ts) count toward line limits unless in .gitattributes as `linguist-generated`.
- Conventional Commit `BREAKING CHANGE` in footer triggers major version bump. Use sparingly and with clear migration guide.
- `git commit --no-verify` bypasses all hooks (lint, test, format). Only for emergency fixes with a ticket reference.

## References

| File | Load when |
|------|-----------|
| `references/commit-templates.txt` | Need commit message examples or type reference |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Starting new feature | git-workflow + coding-standards |
| Preparing PR | git-workflow + code-review-checklist |
| Releasing | git-workflow + changelog-release |
| Onboarding | git-workflow + technical-writing |

## Checklist

- [ ] Branch name matches `type/description` pattern
- [ ] Commit messages follow Conventional Commits
- [ ] PR ≤400 lines and ≤10 files
- [ ] Rebased onto target branch (clean linear history)
- [ ] No merge commits in feature branch
- [ ] Merge strategy is squash or rebase (not merge commit)
- [ ] Branch deleted after merge
