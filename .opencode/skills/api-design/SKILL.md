---
name: api-design
description: REST API design patterns — resource naming, HTTP methods/status codes, pagination (offset vs cursor), filtering/sorting, versioning, rate limiting. Use when designing new endpoints, reviewing API contracts, adding pagination, or implementing versioning.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling
---

# API Design Patterns

Conventions for consistent, developer-friendly REST APIs.

## Core rules

1. **URL structure** — Nouns, plural, kebab-case: `/api/v1/users/:id`. No verbs in URL. Actions map to HTTP methods.
2. **Method semantics** — GET (read, safe+idempotent), POST (create, not idempotent), PUT (full replace, idempotent), PATCH (partial update, idempotent if using merge), DELETE (remove, idempotent).
3. **Status codes** — 200 for success with body, 201 for created (with Location header), 204 for no-content (DELETE), 400 for bad request, 401 for missing auth, 403 for forbidden, 404 for not found, 409 for conflict, 422 for validation failure, 429 for rate limit.
4. **Never 200 with error body** — Use HTTP status codes semantically. 200 always means success.
5. **Pagination** — Cursor-based by default for scalable endpoints. Return `Link: <url?cursor=abc>; rel="next"` header (RFC 5988) alongside body-based cursor for discoverability. Offset-based (`?page=&per_page=`) only for admin/small datasets (<10K records).
6. **Filtering** — Bracket syntax: `?filter[status]=active&filter[price][gte]=10`. Comma for multi-value: `?filter[category]=a,b`.
7. **Sorting** — Prefix `-` for descending: `?sort=-created_at,price`.
8. **Versioning** — URL path prefix `/v1/`, `/v2/`. Max 2 active versions. Sunset header for deprecated versions.
9. **Rate limiting** — Return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Resource` (which rate limit bucket), and optionally `X-RateLimit-Used` (total requests in window) headers. Return 429 with `Retry-After` when exceeded. Example tiers: Free (100 req/hr), Pro (1000 req/hr), Enterprise (10000 req/hr). Document tiers in your API reference.
10. **Error envelope** — `{ error: { code, message, details? } }` matching error-handling skill format. Include auth-specific error codes: `UNAUTHORIZED` (401), `FORBIDDEN` (403), `TOKEN_EXPIRED` (401).
11. **Authentication & Authorization** — Use Bearer token (`Authorization: Bearer <token>`) for API auth. Validate tokens on every request. For resource-level authorization, check ownership or role-based access (RBAC). Return 401 for missing/invalid tokens, 403 for valid tokens without required permissions.
12. **Content negotiation** — Always specify `Content-Type: application/json` on requests with bodies. Clients should send `Accept: application/json`. For specialized responses (CSV, PDF), negotiate via `Accept` header or a `?format=` query param.

## Procedures

1. Define resource: noun, plural, kebab-case. Nest only for ownership (e.g., `/users/:id/orders`).
2. Select HTTP method: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for removal.
3. Map status codes: success (200/201/204), client errors (400/401/403/404/409/422/429).
4. For list endpoints: add cursor-based pagination with `?cursor=` and `?limit=` params.
5. Add filtering via bracket syntax on query params.
6. Add sorting with `-` prefix for descending.
7. Add version prefix `/v1/`.
8. Document rate limit tiers in response headers.
9. Wrap all responses in standard envelope matching error-handling format.
10. Add auth: specify token scheme (Bearer), scoping (user-level, app-level), and resource ownership checks. Document in security section of spec.

## Gotchas

- PATCH idempotency depends on implementation. Use merge-patch not JSON-Patch for simpler idempotency.
- 200 + `{ error: ... }` is NOT acceptable. Use correct 4xx status code.
- Cursor pagination cannot jump to arbitrary page. Offset is better for admin UIs with page numbers.
- Never expose internal IDs in cursor tokens. Use opaque values — cryptographically signed or encrypted — then base64-encode for transport. Never encode raw IDs.
- Versioning via Accept header is harder to test and cache. URL prefix is preferred.
- Rate limit headers must include remaining count and reset timestamp — not just limit.
- Auth is not optional. Every public endpoint needs auth. Even "public" endpoints should have rate-limit scoped to API key. 401 and 403 are not interchangeable — use them correctly.

## References

| File | Load when |
|------|-----------|
| `references/typescript-examples.md` | Implementing API endpoints in TypeScript |
| `references/python-examples.md` | Implementing API endpoints in Python |
| `references/go-examples.txt` | Implementing API endpoints in Go |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Designing new API endpoint | api-design + error-handling + technical-writing |
| Reviewing API contract | api-design + coding-standards + error-handling |
| Adding pagination | api-design + coding-standards |
| API version planning | api-design + arch-decision-records |

## Checklist

- [ ] URL follows kebab-case plural convention
- [ ] HTTP method correctly maps to create/read/update/delete
- [ ] Status codes are correct per action
- [ ] Pagination uses cursor-based approach with max page size
- [ ] Filtering uses bracket syntax
- [ ] Version prefix present
- [ ] Rate limit headers documented
- [ ] Error responses follow error-handling envelope format
- [ ] Auth scheme specified (Bearer / API key / OAuth2)
- [ ] 401 returned for missing/invalid credentials
- [ ] 403 returned for valid credentials with insufficient permissions
- [ ] Resource ownership or RBAC documented
- [ ] Request/response schemas defined
