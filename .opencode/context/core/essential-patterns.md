<!-- Context: core/essential-patterns | Priority: critical | Version: 1.0 | Updated: 2026-06-03 -->

# Essential Patterns — Core Development Guidelines

## Core Philosophy

**Modular**: Everything is a component — small, focused, reusable
**Functional**: Pure functions, immutability, composition over inheritance
**Maintainable**: Self-documenting, testable, predictable

## Critical Patterns

### Pure Functions
ALWAYS write pure functions:
- Same input = same output
- No side effects
- No mutation of external state
- Predictable and testable

### Error Handling
- Handle errors at boundaries, not in every function
- Use Result types or exceptions consistently
- Never swallow errors silently
- Log at appropriate levels (error/warn/info/debug)

### Validation
- Validate all external input at the boundary
- Use schema validation (Zod, Joi, etc.) for API endpoints
- Return clear error messages
- Never trust user input

### Security
- Never hardcode credentials
- Use environment variables for secrets
- Parameterize all database queries
- Validate and sanitize all user input

### Logging
- Structured logs (JSON) in production
- Include correlation IDs for request tracing
- Log at boundaries (entry/exit/error)
- Never log secrets or PII

## Language-Agnostic

Apply to all programming languages. For language-specific patterns, see `languages/`.
