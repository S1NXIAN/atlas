<!-- Context: core/standards/security-patterns | Priority: critical | Version: 1.0 | Updated: 2026-06-03 -->

# Security Patterns

## Authentication
- Use the project's established auth provider
- Store sessions securely (httpOnly cookies or tokens)
- Implement MFA for sensitive operations
- Rate-limit login attempts

## Authorization
- Check permissions on every request, not just the UI
- Principle of least privilege
- Validate access at the API boundary, not just the frontend
- Use role-based or attribute-based access control

## Input Validation
- Validate ALL input at the boundary
- Use schema validation (Zod, Joi, Yup)
- Never concatenate user input into SQL/commands
- Sanitize output for XSS prevention

## Data Protection
- Encrypt sensitive data at rest
- Use HTTPS everywhere
- Never log secrets, tokens, or PII
- Environment variables for configuration, not code

## Common Vulnerabilities to Prevent
- SQL/NoSQL injection: parameterized queries always
- XSS: output encoding, CSP headers
- CSRF: anti-forgery tokens
- SSRF: validate URLs, restrict outbound traffic
- Insecure direct object references: verify ownership
- Mass assignment: whitelist allowed fields
