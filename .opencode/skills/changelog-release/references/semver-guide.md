# Semantic Versioning 2.0.0 Reference

Based on [https://semver.org](https://semver.org).

## Version Format

```
MAJOR.MINOR.PATCH-prerelease+buildmetadata

Example: 2.1.3-beta.1+build.20241115
```

| Component | Bump when | Examples |
|-----------|-----------|----------|
| **MAJOR** | Breaking changes | 1.0.0 → 2.0.0 |
| **MINOR** | New features (backward-compatible) | 1.0.0 → 1.1.0 |
| **PATCH** | Bug fixes (backward-compatible) | 1.0.0 → 1.0.1 |
| **Pre-release** | Pre-release build | 1.0.0-alpha.1, 1.0.0-rc.1 |
| **Build metadata** | Build-specific info (ignored in precedence) | 1.0.0+20241115 |

## What Triggers a MAJOR Bump

A **breaking change** is any modification that breaks backward compatibility:

- Removing or renaming a public API endpoint, function, or class.
- Changing a function signature (adding required params, changing param type).
- Changing a return type.
- Changing the behavior of an existing API in a non-backward-compatible way.
- Removing a setting or configuration option.
- Upgrading a dependency that itself has a breaking change your consumers must handle.
- Changing a database schema that requires migration of external integrations.

## What Triggers a MINOR Bump

A **feature addition** that is backward-compatible:

- Adding a new API endpoint or public function.
- Adding an optional parameter to an existing function.
- Adding a new response field (clients should ignore unknown fields).
- Adding a new configuration option.
- Deprecating an existing feature (deprecation alone is MINOR).

## What Triggers a PATCH Bump

A **bug fix** that is backward-compatible:

- Fixing a crash or incorrect behavior.
- Performance improvement with no API change.
- Security patch with no API change.
- Documentation fix in code comments (user-facing docs are not versioned).
- Internal refactoring with no public API change.

## Pre-release Tags

| Tag | Meaning | When to use |
|-----|---------|-------------|
| `-alpha.N` | Internal testing | First cut, unstable, experimental |
| `-beta.N` | External testing | Feature-complete but may have bugs |
| `-rc.N` | Release candidate | Final testing before release |
| `-dev` | Development build | Intermediate development builds |

Pre-release versions have **lower precedence** than the normal version. `1.0.0-alpha.1` < `1.0.0`.

Precedence: `1.0.0-alpha` < `1.0.0-alpha.1` < `1.0.0-alpha.beta` < `1.0.0-beta` < `1.0.0-beta.2` < `1.0.0-beta.11` < `1.0.0-rc.1` < `1.0.0`.

## Version Decision Examples

| Scenario | Current | Next Version | Rationale |
|----------|---------|--------------|-----------|
| Initial public release | (none) | 1.0.0 | First stable release |
| Fix a crash bug | 1.0.0 | 1.0.1 | PATCH — bug fix |
| Add optional query param to existing endpoint | 1.0.1 | 1.1.0 | MINOR — backward-compatible addition |
| Add new endpoint (GET /api/v2/analytics) | 1.1.0 | 1.2.0 | MINOR — new feature, no breakage |
| Remove deprecated endpoint | 1.2.0 | 2.0.0 | MAJOR — breaking change |
| Rename response field `user_name` -> `username` | 2.0.0 | 3.0.0 | MAJOR — consumers must update |
| Change parameter from required to optional | 2.0.0 | 2.1.0 | MINOR — less restrictive |
| Change parameter from optional to required | 2.1.0 | 3.0.0 | MAJOR — breaking change |
| Security patch in internal module | 1.5.2 | 1.5.3 | PATCH — no API change |
| Mark endpoint as deprecated | 1.5.3 | 1.6.0 | MINOR — deprecation is backward-compatible |
| Remove deprecated feature (announced in 1.6.0 deprecation) | 1.6.0 | 2.0.0 | MAJOR — removal breaks consumers |
| Refactor without API change | 2.0.0 | 2.0.1 | PATCH — no behavior change |
| Update logo and brand colors in docs | 1.0.0 | (no bump) | Cosmetics — no impact on users of the software |
| Fix typo in error message | 1.0.0 | (no bump) | Trivial — message change is not a fix or feature |

## Common Mistakes

### 1. Documentation changes don't require a version bump
Mistake: Bumping PATCH because README changed.
Correct: Documentation-only changes should not trigger a release unless they fix incorrect API documentation that could cause misuse.

### 2. Refactoring without behavior change
Mistake: Bumping MINOR because of major internal refactoring.
Correct: If the public API is identical, it's PATCH (or no release at all).

### 3. Deprecation is not a breaking change
Mistake: Bumping MAJOR when marking something deprecated.
Correct: Deprecation is MINOR. The *removal* of the deprecated feature is MAJOR.

### 4. Adding fields to responses
Mistake: Bumping MAJOR or MINOR when adding optional fields to responses.
Correct: If clients ignore unknown fields (which they should), this can be PATCH. If clients validate responses strictly, treat as MINOR.

### 5. Dependency version changes
Mistake: Not bumping when a dependency introduces a breaking change that is exposed in your public API.
Correct: If your function returns a type from the upgraded dependency and that type changed, your MAJOR must bump too.

### 6. 0.x versions
During initial development (0.x), anything can break. 0.1.0 to 0.2.0 may include breaking changes. Consumers of 0.x should pin exact versions.

### 7. Pre-release precedence
Mistake: Assuming `1.0.0-beta.11` comes before `1.0.0-beta.2`.
Correct: Pre-release precedence is alphanumeric. `1.0.0-beta.11` > `1.0.0-beta.2` because `11` > `2` numerically but only for the same numeric field.

## Spec URL

Full specification: [https://semver.org/spec/v2.0.0.html](https://semver.org/spec/v2.0.0.html)
