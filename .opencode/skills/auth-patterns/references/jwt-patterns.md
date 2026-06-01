# JWT Patterns

## Key Generation (RS256)

```bash
openssl genpkey -algorithm RSA -out private.pem -pkeyopt rsa_keygen_bits:2048
openssl pkey -in private.pem -pubout -out public.pem
```

## RS256 vs HS256 Tradeoffs

| Aspect | RS256 (asymmetric) | HS256 (symmetric) |
|---|---|---|
| Key distribution | Public shared, private secret | Single shared secret |
| Key rotation | Rotate private, keep old public for verification | All services must get new secret |
| Use case | Cross-service / microservices | Single service, internal only |
| Security model | Private key compromise limited to signing | Secret compromise = full access |

## Claims Validation

```typescript
function validateAccessToken(token: string): JwtPayload {
  const PUBLIC_KEY = process.env.JWT_PUBLIC_KEY!
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ['RS256'],
    issuer: 'https://auth.example.com',
    audience: 'api.example.com',
    maxAge: '15m',
  })
}
```

## Refresh Rotation with Family Model

```typescript
interface RefreshToken {
  id: string
  userId: string
  familyId: string
  tokenHash: string
  expiresAt: Date
  usedAt?: Date
}
```

## Revocation Strategies

| Strategy | Granularity | Complexity | Notes |
|---|---|---|---|
| Blacklist (DB) | Per-token | Medium | Store jti on revoke; check every request |
| Short TTL | Time-based | None | Access tokens expire automatically |
| Key rotation | All tokens with old key | Low | Users re-authenticate |
| Deny list (Redis) | Per-token | Medium | Fast lookup, TTL-bound entries |
