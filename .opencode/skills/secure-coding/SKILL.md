---
name: secure-coding
description: Secure coding patterns — OWASP Top 10, input validation, output encoding, authentication, authorization, CSRF, XSS prevention, SQL injection prevention, dependency scanning, and secrets management. Use when implementing security-sensitive features, reviewing code for vulnerabilities, or hardening an application.
metadata:
  pipeline-stage: code-review, security-scan
  depends-on: coding-standards, error-handling, api-design
---

# Secure Coding

Security-first coding patterns covering OWASP Top 10 and common vulnerability classes.

## Core rules

1. **Input validation at boundary** — Validate every input at system boundary. Use allow-lists. Validate length, format, range, type.
2. **Output encoding for context** — HTML entity encode for HTML, parameterize for SQL, JSON for APIs, URL encode for query strings.
3. **Parameterized queries always** — Prepared statements for ALL database access. Never concatenate input into SQL.
4. **Auth via established libraries** — Passport.js, Auth.js, django-allauth, Supabase. Never roll your own crypto or auth.
5. **Authorization on every request** — Check permissions on every protected endpoint. Default-deny. Distinguish 401 vs 403.
6. **CSRF protection** — Anti-CSRF tokens for state-changing requests. SameSite cookies. CORS allow-list.
7. **XSS prevention** — Never use dangerouslySetInnerHTML, innerHTML, v-html. Use DOMPurify if raw HTML needed.
8. **Dependency scanning** — npm audit, pip-audit, govulncheck in CI. Pin versions. Fail on critical/high.
9. **Secrets management** — Environment variables or secret managers. Never hardcode. Never commit .env files.
10. **Rate limiting + brute force protection** — 5 attempts/min per IP on auth. Exponential backoff. Account lockout.

## Procedures

1. Identify every input source → threat model.
2. Define validation rules per input source.
3. Define encoding function per output context.
4. Replace raw SQL with parameterized queries.
5. Replace custom auth with established library.
6. Add auth middleware, default-deny.
7. Add CSRF middleware, configure CORS.
8. Search for innerHTML/dangerouslySetInnerHTML → replace.
9. Add dependency scanning to CI.
10. Run secret scanner, rotate leaked secrets.

## Gotchas

- CSP is not a replacement for output encoding — it's defense-in-depth.
- Helmet/security headers are security theater without proper config.
- JWT secrets committed to source = critical vulnerability.
- Logging passwords/tokens violates compliance (GDPR, PCI-DSS).
- Missing rate limiting on auth = #1 cause of credential stuffing.

## References

| File | Load when |
|------|-----------|
| `references/ts-secure-patterns.md` | Implementing secure patterns in TypeScript/Node.js |
| `references/py-secure-patterns.md` | Implementing secure patterns in Python |
| `references/go-secure-patterns.txt` | Implementing secure patterns in Go |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Security review of PR | secure-coding + code-review-checklist + auth-patterns |
| Hardening an API endpoint | secure-coding + api-design + error-handling |
| Implementing authentication | secure-coding + auth-patterns + backend-patterns |
| Dependency audit | secure-coding + coding-standards |
| Secrets rotation | secure-coding + technical-writing |

## Checklist

- [ ] All input sources validated (type, length, format, allow-list)
- [ ] Output encoded per context (HTML/SQL/JSON/URL/Shell)
- [ ] All DB queries use parameterized statements
- [ ] Auth uses established library; no custom crypto
- [ ] Every protected endpoint checks authorization; default-deny
- [ ] CSRF tokens on state-changing requests; CORS allow-list
- [ ] No dangerouslySetInnerHTML, innerHTML, v-html
- [ ] Dependency scanning in CI; versions pinned; no critical/high vulns
- [ ] No secrets in source code; .env gitignored; scanner clean
- [ ] Rate limiting on auth (5 req/min); account lockout configured
