# Keep a Changelog Reference

Based on [https://keepachangelog.com](https://keepachangelog.com) — the standard format for project changelogs.

## Format

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
### Changed
### Deprecated
### Removed
### Fixed
### Security
```

## Section Ordering

Sections must appear in exactly this order:

| Section | Content |
|---------|---------|
| **Added** | New features, endpoints, modules |
| **Changed** | Changes in existing functionality |
| **Deprecated** | Soon-to-be-removed features (with timeline) |
| **Removed** | Features removed in this release |
| **Fixed** | Bug fixes |
| **Security** | Vulnerability fixes |

Do not add custom sections not in this list. Use the standardized headers.

## Entry Format

```
- Description of the change (#PR-number, [@username]).
- Another change ([commit-hash]).
```

- Use past tense: "Added", "Fixed", not "Adds", "Fixes".
- Each entry is a single bullet point.
- Reference pull request number or commit hash.
- Group related changes under the same section.
- No GitHub username flair unless contributing outside the core team.

## Link Format

Entries link to issues, PRs, or commits:

```markdown
[Unreleased]: https://github.com/owner/repo/compare/v1.0.0...HEAD
[1.1.0]: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/owner/repo/releases/tag/v1.0.0
```

Comparison links go at the bottom of the file. Each release version links to its tag or compare URL.

## Complete Example

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- User profile endpoint (GET /api/v1/users/:id) (#142, [@alice]).
- Email notification service for order confirmations (#145).

### Changed
- Database connection pool increased from 10 to 20 for better throughput.
- Rate limit error responses now include Retry-After header (#148).

### Fixed
- Pagination cursor encoding issue when cursor contains special characters (#150).

## [1.2.0] - 2024-11-15

### Added
- Order export feature (CSV download via GET /api/v1/orders/export) (#132).
- Webhook endpoint for third-party integrations (#135).
- Invoice generation service with PDF output (#138).

### Changed
- API rate limit tiers: Free (100/hr), Pro (1000/hr), Enterprise (10000/hr) (#130).
- Pagination defaults changed from 10 to 25 items per page.

### Deprecated
- GET /api/v1/orders/list (deprecated in 1.2.0, planned removal in 2.0.0).
  Use GET /api/v1/orders with ?status filter instead.

### Fixed
- Race condition in concurrent order processing (#140).
- Memory leak in WebSocket connection handler (#141).

## [1.1.0] - 2024-09-01

### Added
- Order cancellation endpoint (POST /api/v1/orders/:id/cancel) (#118).
- Product search with full-text support (#122).

### Changed
- Authentication tokens now expire after 24 hours (was 7 days) (#120).
- Error response format standardized across all endpoints (#125).

### Fixed
- Double billing in subscription renewal process (#121).
- Timezone display in order timestamps (#119).

## [1.0.0] - 2024-06-15

### Added
- Initial release with user management, products, orders, and payments.
- Authentication via Bearer JWT tokens.
- CRUD API for users, products, orders, and payments.
- Rate limiting with three tiers (Free, Pro, Enterprise).
- Cursor-based pagination on all list endpoints.

[Unreleased]: https://github.com/owner/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/owner/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/owner/repo/releases/tag/v1.0.0
```

## YAML Frontmatter Alternative

For programmatic processing, changelogs may include YAML frontmatter:

```yaml
---
title: Changelog
description: All notable changes to this project
layout: changelog
---
```

This is optional. The markdown format alone is sufficient for readability and tooling.

## Common Mistakes

- Adding a "Version" section header instead of `## [X.Y.Z]` link format.
- Mixing past tense ("Fixed") with present tense ("Fixes"). Be consistent.
- Including every commit verbatim without grouping by type.
- Forgetting to update the Unreleased comparison link after release.
- Adding entries to the wrong section (e.g., "Fixed" entries under "Changed").
- Leaving Unreleased section empty for too long between releases.
