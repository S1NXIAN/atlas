---
name: error-handling
description: Typed error hierarchies, Result pattern, retry/backoff, ErrorBoundary, and user-facing error messages for TypeScript, Python, and Go. Use when designing error handling, reviewing error propagation, adding retry logic, or implementing API error responses.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: coding-standards
---

# Error Handling Patterns

Consistent error handling across the codebase. All errors are typed, never swallowed, and have clear audit trails.

## Core rules

1. **Never swallow errors** — Every `catch` block must handle, re-throw, or log the error. No empty catch blocks.
2. **Typed over string** — Errors are typed classes/values with `code`, `message`, and optional `details`. Never throw bare strings or `new Error("message")` without a code.
3. **Fail fast** — Surface errors at the boundary where they occur. Don't propagate opaque errors through 5 layers.
4. **User vs developer** — User sees friendly messages. Developer sees full context (code, details, stack in dev). Never expose stack traces to users.
5. **Error codes are API contract** — Every error code a client may receive is documented and stable.
6. **Retry only retriable errors** — Not 4xx errors. Only 5xx, network timeouts, and rate limits.

## Procedures

1. Define error hierarchy: base `AppError` → domain-specific subclasses (NotFoundError, ValidationError, etc.).
2. Use Result pattern for operations where failure is expected (parsing, external calls).
3. Implement API error handler middleware that converts typed errors to JSON: `{ error: { code, message, details } }`.
4. Add ErrorBoundary at React component tree boundaries.
5. Wrap external calls (DB, API, filesystem) with retry logic using exponential backoff + jitter.
6. Map error codes to user-facing messages — never pass internal errors to end users.

## Gotchas

- TypeScript `instanceof` breaks across module boundaries with `Error` subclasses. Use `Object.setPrototypeOf(this, new.target.prototype)` in constructors (TS).
- Python `except Exception` catches everything including `KeyboardInterrupt` and `SystemExit`. Be specific.
- Go `errors.Is()` unwraps the chain. `errors.As()` finds a matching type. Use both, not `==` on errors.
- Don't wrap errors that the caller needs to check with `errors.Is()`. Use custom sentinels instead.
- Retry without jitter causes thundering herd on service recovery. Always add random jitter.

## References

| File | Load when |
|------|-----------|
| `references/ts-patterns.md` | Implementing error handling in TypeScript |
| `references/python-patterns.md` | Implementing error handling in Python |
| `references/go-patterns.txt` | Implementing error handling in Go |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Building API endpoint | error-handling + api-design + coding-standards |
| Adding retry logic | error-handling + observability |
| Code review | error-handling + code-review-checklist |
| Frontend error handling | error-handling + frontend-patterns |

## Checklist

- [ ] All errors are typed (not bare strings or generic Error)
- [ ] Every catch block handles, re-throws, or logs
- [ ] API error responses follow standard envelope
- [ ] User-facing messages contain no stack traces
- [ ] Retry logic uses jitter and only retries retriable errors
- [ ] ErrorBoundary wraps all major component sections
- [ ] Error codes are documented in API spec
