# Documentation Templates

## README Template

```markdown
# Project Name

Brief description: what this is and why it exists. 1-2 sentences.

## Quick Start

```bash
npm install
npm run dev
```

## API

### `functionName(param: Type): ReturnType`

Description of what this does.

### Endpoint: `GET /api/resource`

Returns list of resources.

## Development

```bash
npm run test
npm run lint
npm run build
```
```

## JSDoc Template

```typescript
/**
 * Description of what the function does.
 * Include rationale if non-obvious.
 *
 * @param paramName - Description of parameter
 * @param options - Configuration options
 * @returns Description of return value
 * @throws {NotFoundError} If resource not found
 *
 * @example
 * ```typescript
 * const result = await fn('value')
 * ```
 */
```

## ADR Template

```markdown
# ADR NNNN: Title in Title Case

## Status

accepted | proposed | deprecated | superseded

## Context

What is the issue motivating this decision? What constraints exist? What alternatives were considered?

## Decision

What was decided and why. Be specific about the chosen approach.

## Consequences

What becomes easier, harder, or different as a result. Include trade-offs.
```
