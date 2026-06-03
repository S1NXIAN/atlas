<!-- Context: core/patterns/error-handling | Priority: high | Version: 1.0 | Updated: 2026-06-03 -->

# Error Handling Patterns

## Philosophy
Handle errors at boundaries, not in every function. Errors should be:
- **Caught** at the system boundary (API handler, entry point, event handler)
- **Logged** with context (what happened, where, what state)
- **Transformed** into appropriate user-facing messages
- **Never silently swallowed**

## Patterns

### Result Type (preferred)
```typescript
type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E }

function divide(a: number, b: number): Result<number> {
  if (b === 0) return { ok: false, error: new Error('Division by zero') }
  return { ok: true, value: a / b }
}
```

### Try/Catch (at boundaries only)
```typescript
async function handler(req: Request): Promise<Response> {
  try {
    const data = await processRequest(req)
    return Response.json(data)
  } catch (err) {
    logger.error('Request failed', { error: err, path: req.url })
    return Response.json({ error: 'Internal error' }, { status: 500 })
  }
}
```

## Rules
- Don't catch errors you can't handle
- Don't use exceptions for control flow
- Log the full error at the catch site
- Return user-safe messages (no stack traces)
- Include correlation IDs for debugging
