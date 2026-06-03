<!-- Context: core/patterns/logging | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Logging Patterns

## Levels

| Level | When | Example |
|-------|------|---------|
| ERROR | Something is broken | Database connection failed |
| WARN | Something unexpected but not broken | Rate limit approaching |
| INFO | Notable lifecycle event | Server started, user registered |
| DEBUG | Detailed troubleshooting | Request parameters |
| TRACE | Very detailed flow | Function entry/exit |

## Best Practices

### DO
- Log at boundaries (entry/exit/error of significant operations)
- Include correlation/trace IDs for request tracking
- Use structured logging (JSON) in production
- Log what happened, not just that something happened
- Include relevant context (user ID, request ID, action)

### DON'T
- Log secrets, passwords, tokens, or PII
- Log in tight loops
- Log the same thing at multiple levels
- Log without context ("Error occurred" — what error?)
- Log to console in production libraries
