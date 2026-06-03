<!-- Context: core/context-system/operations/harvest | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Harvest — Extract Patterns from Existing Code

## When to Harvest
When starting with an existing codebase that has no context files yet.

## Process

1. **Scan the codebase structure** — understand the project layout
2. **Find repetitive patterns** — look for common patterns in components, API routes, data access
3. **Extract conventions** — naming, file organization, error handling, validation
4. **Document in context files** — one file per pattern domain
5. **Review with the team** — confirm the extracted patterns are correct

## What to Look For
- **Architecture**: How are files organized? (feature-based, type-based, layer-based)
- **Components**: How are components structured? (props, state, hooks)
- **API**: How are endpoints defined? (routes, validation, error responses)
- **Data**: How is data accessed? (ORM, queries, repositories)
- **Testing**: What test framework? How are tests structured? What's tested?

## Output
Generate files under `.opencode/context/project/`:
- `tech-stack.md`
- `api-patterns.md`
- `component-patterns.md`
- `naming-conventions.md`
