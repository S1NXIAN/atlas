---
name: auth-patterns
description: Authentication and authorization patterns — JWT, OAuth2, session management, RBAC, API keys, password hashing, MFA, and token refresh. Use when implementing authentication, designing authorization models, or reviewing auth security.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling, api-design, secure-coding
---

# Auth Patterns

Authentication and authorization patterns for secure identity and access management.

## Core rules

1. **Password hashing** — bcrypt (cost ≥12) or argon2id. Never plaintext, MD5, SHA-1, unsalted SHA-256.
2. **JWT lifecycle** — Asymmetric keys (RS256/ES256) for cross-service. Access token: ≤15min. Refresh: ≤7d, stored in DB, rotatable.
3. **OAuth2 flows** — Authorization Code + PKCE for SPAs. Never Implicit flow (deprecated OAuth 2.1). Validate redirect URIs. Use state parameter.
4. **Session management** — HttpOnly + Secure + SameSite cookies. Session ID ≥128 bits random. Regenerate on login.
5. **RBAC model** — Roles on users. Permissions on roles. Check at endpoint level. Default-deny. Flat RBAC > role hierarchy.
6. **API keys** — Prefixed (`sk_live_xxx`). Stored hashed (SHA-256). Rotatable. Scoped. Audited.
7. **MFA** — TOTP (RFC 6238). 10 backup codes. Rate-limited verification. Required for sensitive operations.
8. **Token refresh (rotation + reuse detection)** — Rotate refresh tokens. Invalidate old. Family model: detect reuse, invalidate all.
9. **Rate limiting** — Login: 5/min per IP. Registration: 3/hr per IP. Password reset: 3/hr per email. TOTP: 3/5min per user.
10. **Audit logging** — Every auth event logged: timestamp, actor, action, resource, outcome.

## Procedures

1. Choose auth strategy: sessions (web apps) vs JWT (SPAs/APIs).
2. Implement password hashing (bcrypt cost 12).
3. For JWT: asymmetric keys, 15min access, 7d refresh, validate all 5 claims.
4. For sessions: secure cookies, server-side session store, regenerate on login.
5. Design RBAC: resources → actions → roles → users.
6. API keys: prefixed, hashed, returned once at creation.
7. Rate limiting middleware on all auth routes.
8. Audit logging middleware on auth routes.

## Gotchas

- JWT key rotation requires careful planning — old keys valid until tokens expire.
- OAuth2 state parameter prevents CSRF on callback — always use it.
- Email-based password reset without rate limiting = account enumeration vector.
- Refresh token rotation limits exposure window but family model closes persistence gap.
- Role hierarchy creates implicit permissions — flat RBAC is safer.

## References

| File | Load when |
|------|-----------|
| `references/jwt-patterns.md` | Implementing JWT access/refresh token system |
| `references/oauth2-patterns.md` | Integrating OAuth2 providers (Google, GitHub, Auth0) |
| `references/rbac-patterns.txt` | Designing and implementing RBAC with SQL schema |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Implementing login/registration | auth-patterns + secure-coding + backend-patterns |
| Designing API key system | auth-patterns + api-design |
| Building RBAC model | auth-patterns + database-migrations + error-handling |
| OAuth2 integration (SSO) | auth-patterns + secure-coding |
| Auth review/audit | auth-patterns + code-review-checklist + secure-coding |
| MFA implementation | auth-patterns + backend-patterns |

## Checklist

- [ ] Passwords hashed with bcrypt (cost ≥12) or argon2id
- [ ] JWT access tokens ≤15min; refresh tokens ≤7d, stored, rotated
- [ ] OAuth2 uses Auth Code + PKCE; redirect URIs allow-listed; state used
- [ ] Sessions use HttpOnly + Secure + SameSite; IDs random ≥128 bits; regenerated on login
- [ ] RBAC: permissions on roles, roles on users; default-deny; endpoint-level checks
- [ ] API keys prefixed, stored hashed, rotatable, scoped
- [ ] MFA offered (TOTP); backup codes; rate-limited verification
- [ ] Refresh token rotation with family model; reuse detection logs incident
- [ ] Rate limiting on all auth endpoints with exponential backoff
- [ ] Audit logging on all auth events (timestamp, actor, action, resource, outcome)
