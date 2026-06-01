---
name: changelog-release
description: Changelog and release management — semantic versioning, conventional commits, changelog generation, release notes, version bumping, and release automation. Use when creating releases, writing changelogs, or automating version management.
metadata:
  pipeline-stage: code-review, security-scan
  depends-on: coding-standards, git-workflow
---

# Changelog and Release Management

Consistent release process with semantic versioning, conventional commits, and automated changelog generation.

## Core rules

1. **Semantic versioning** — MAJOR for breaking changes, MINOR for new features, PATCH for bug fixes. Pre-release suffixes: `-alpha.1`, `-beta.2`, `-rc.1`. 0.x indicates initial development (no stable API).
2. **Conventional commits** — `type(scope): description` format. `feat` → MINOR bump, `fix` → PATCH bump. Breaking changes flagged with `BREAKING CHANGE:` footer or `!` after type/scope.
3. **Changelog auto-generation** — Generated from commits grouped by type: Features, Bug Fixes, Performance Improvements, etc. Each entry linked to commit hash.
4. **Release metadata** — All four required: version number, release date, changelog content, and git tag (`vX.Y.Z`).
5. **Deprecation notices** — Announced with timeline: deprecated in version X, planned removal in version Y. Include old way → new way migration.
6. **Breaking changes highlighted** — `## ⚠ BREAKING CHANGES` section at top of release notes with migration guide: what changed, why, migration steps, old vs new code.
7. **Unreleased section** — `## [Unreleased]` maintained at top of changelog. Renamed on release. Fresh empty section created after release.
8. **Release branches** — `release/vX.Y.Z` created from main. Hotfix: `hotfix/vX.Y.Z` branched from the release tag, not from main.
9. **Automated version bump** — CI reads commits since last tag, determines next version, updates version files, creates commit, tags, pushes. Must be idempotent.
10. **Release notes structure** — Version, date, one-paragraph summary, full changelog, migration notes (if breaking), upgrade instructions.

## Procedures

1. Collect commits since last tag: `git log $(git describe --tags --abbrev=0)..HEAD --oneline`.
2. Analyze: breaking changes → MAJOR; feat → MINOR; fix/perf → PATCH; docs/chore/refactor → no bump.
3. Generate changelog: group by type, deduplicate similar entries, order chronologically within groups.
4. Create release branch: `git checkout -b release/vX.Y.Z`.
5. Update version files (package.json, Cargo.toml, version.py, etc.) to the new version.
6. Commit: `chore(release): vX.Y.Z` with the changelog diff.
7. Tag: `git tag vX.Y.Z`.
8. Merge release branch to main (squash-merge), push tags: `git push --tags`.
9. Publish release notes to GitHub/GitLab releases page.
10. Refresh the Unreleased section: rename current section, create fresh empty `## [Unreleased]`.

## Gotchas

- Version conflicts in monorepos — use per-package versioning with changesets or Release Please.
- Breaking changes without MAJOR bump is the most common release error. Review commits carefully.
- Changelog with no consumer context (just raw commit messages) is useless — group and summarize.
- Forgetting to tag means the tag is lost as the single source of truth for version history.
- Hotfix branching from main instead of the release tag includes unshipped changes from main.

## References

| File | Load when |
|------|-----------|
| `references/keepachangelog.md` | Structuring changelog format and sections |
| `references/semver-guide.md` | Deciding version bumps and pre-release tags |
| `references/release-please-setup.txt` | Configuring Release Please automation |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Creating a new release | changelog-release + git-workflow |
| Writing changelog entries | changelog-release + technical-writing |
| Setting up automated version bump | changelog-release + coding-standards |
| Handling breaking changes | changelog-release + technical-writing + git-workflow |
| Monorepo release management | changelog-release + git-workflow |

## Checklist

- [ ] Version follows semver: MAJOR for breaking, MINOR for features, PATCH for fixes
- [ ] All commits use conventional commit format with valid types
- [ ] Changelog grouped by type, entries consumer-readable
- [ ] Release metadata complete: version, date, changelog, git tag
- [ ] Deprecation notices include version deprecated and planned removal
- [ ] Breaking changes at top with migration guide (old code → new code)
- [ ] Unreleased section exists and is fresh
- [ ] Release branch named `release/vX.Y.Z`; hotfix from tag, not main
- [ ] Automated version bump: analyze → bump → commit → tag → push
- [ ] Release notes: version, date, summary, changelog, migration notes, upgrade instructions
