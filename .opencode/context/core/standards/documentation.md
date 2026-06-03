<!-- Context: core/standards/documentation | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Documentation Standards

## Code Documentation

### Functions
JSDoc/TSDoc for all public APIs:
```typescript
/**
 * Gets user by ID with caching.
 * @param id - User's unique identifier
 * @returns User object or null if not found
 * @throws {DatabaseError} If the database query fails
 */
```

### Internal Functions
Only document WHY, not WHAT. The code says what it does.

## README Files
Every project needs a README.md with:
- What it does (one paragraph)
- Quick start (install + run)
- Key commands (build, test, lint)
- Architecture overview (optional, for complex projects)

## Specs and Plans
- Specs go in `docs/specs/YYYY-MM-DD-topic-design.md`
- Plans go in `docs/plans/YYYY-MM-DD-feature-name.md`
- Both use clear markdown with headings and code blocks

## Changelog
- Keep a CHANGELOG.md following Keep a Changelog format
- Major changes, breaking changes, and new features noted per version
