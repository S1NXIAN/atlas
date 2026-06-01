---
name: backend-patterns
description: Server-side coding patterns — layered architecture (handler→service→data), middleware chains, async error propagation, structured logging, DI, config from env, health checks, graceful shutdown, request validation at boundary, response envelope. Use when implementing backend services, designing API handlers, writing middleware, or structuring server-side code.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: api-design, error-handling, coding-standards
---

# Backend Patterns

Consistent server-side architecture and coding patterns.

## Core rules

1. **Layered architecture** — Handler (HTTP concern) → Service (business logic) → Data (DB/API access). Each layer only talks to the one below it. No skipping layers.
2. **Middleware chains** — Order: auth → logging → request validation → handler. Middleware must call `next()` or terminate the response. Never modify the request body in logging middleware.
3. **Async error propagation** — Always catch errors at the handler boundary. Services throw typed errors (from error-handling skill). Never catch in service layer unless recovering.
4. **Structured logging** — Use structured fields (correlation ID, request ID, user ID), not string interpolation. No console.log in production. Log levels: debug, info, warn, error.
5. **Dependency injection** — Constructor injection for services and repositories. No global singletons or service locators. Makes testing possible without mocking frameworks.
6. **Config from env** — All configuration from environment variables with sensible defaults. Validate on startup. No config files in the application.
7. **Health check endpoints** — `/health` (liveness) and `/ready` (readiness). Liveness checks process status. Readiness checks DB connections, downstream dependencies.
8. **Graceful shutdown** — Trap SIGTERM/SIGINT. Drain connections, flush logs, complete in-flight requests within timeout (default 30s), then exit.
9. **Request validation at boundary** — Validate input at the handler boundary using a schema library (Zod/Pydantic). Never trust request data in service layer.
10. **Response envelope** — Consistent response structure matching api-design error envelope format. Success: `{ data, meta? }`. Error: `{ error: { code, message, details? } }`.

## Procedures

1. Start with handler: parse request, validate input, call service, format response.
2. Add service layer: business logic, typed errors, no HTTP concerns.
3. Add data layer: queries, transactions, repository pattern.
4. Wire middleware: auth → logging → validation in that order.
5. Add structured logging: correlation ID from request header or generate on entry.
6. Apply DI: inject dependencies via constructor, not globals.
7. Read config: env-based, validate at startup, fail fast on missing required values.
8. Add health endpoints: `/health` for liveness, `/ready` for readiness.
9. Implement graceful shutdown: signal handler → drain → flush → exit.
10. Verify: response envelope matches api-design format, all errors from error-handling skill.

## Gotchas

- ORM query in handler is an anti-pattern. Business logic belongs in service layer, not inline in route handlers.
- Naked goroutines (Go) or fire-and-forget tasks must have error handling and cancellation context.
- Magic numbers and string literals in business logic are tech debt. Use constants or config.
- Mixing sync and async without explicit boundaries causes subtle bugs. Use a task queue for background work, not inline async.
- Logging at the service layer should use structured fields, not string formatting. String formatting in logs makes searching impossible.
- Transaction management at the handler level is a code smell. Transactions belong in the data layer with explicit commit/rollback.

## References

| File | Load when |
|------|-----------|
| `references/node-express-patterns.md` | Implementing backend in Node.js/Express |
| `references/python-fastapi-patterns.md` | Implementing backend in Python/FastAPI |
| `references/go-chi-patterns.txt` | Implementing backend in Go/Chi |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Building new backend service | backend-patterns + api-design + error-handling |
| Adding middleware | backend-patterns + coding-standards |
| Refactoring handler logic | backend-patterns + api-design |
| Implementing health checks | backend-patterns + error-handling |
| Setting up graceful shutdown | backend-patterns + coding-standards |

## Checklist

- [ ] Layered architecture: handler → service → data (no layer skipping)
- [ ] Middleware order: auth → logging → validation → handler
- [ ] Async errors caught at handler boundary, never in service
- [ ] Structured logging with correlation ID (not string interpolation)
- [ ] Constructor DI (no globals, no service locators)
- [ ] Config from env with startup validation
- [ ] /health and /ready endpoints present
- [ ] Graceful shutdown: signal → drain → flush → exit
- [ ] Request validated at handler boundary (Zod/Pydantic)
- [ ] Response envelope matches api-design error format
