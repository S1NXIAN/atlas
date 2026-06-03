<!-- Context: core/patterns/configuration | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Configuration Patterns

## Environment Variables
```bash
# .env.example — committed to repo
DATABASE_URL=postgres://localhost:5432/myapp
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug

# .env — gitignored, actual values
DATABASE_URL=postgres://user:pass@prod:5432/myapp
```

## Rules
- Never hardcode configuration values
- Use environment variables for all environment-specific values
- Validate all required config at startup
- Provide sensible defaults where safe
- Document all configuration in README or example files

## Secret Management
- Never commit secrets to git
- Use environment variables or secret managers (Vault, AWS Secrets Manager)
- Rotate secrets regularly
- Use different secrets per environment

## Configuration Loading
```typescript
const config = {
  port: parseInt(process.env.PORT || '3000'),
  databaseUrl: process.env.DATABASE_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
  isProduction: process.env.NODE_ENV === 'production',
}

// Validate required config at startup
if (!config.databaseUrl) throw new Error('DATABASE_URL is required')
```
