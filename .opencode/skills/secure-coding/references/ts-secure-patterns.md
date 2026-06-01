# TypeScript / Node.js Secure Patterns

## Helmet (Security Headers)

```typescript
import helmet from 'helmet'
app.use(helmet())
```

## CORS

```typescript
import cors from 'cors'
app.use(cors({
  origin: ['https://app.example.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
}))
```

## Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many attempts' } },
})
app.use('/api/auth', authLimiter)
```

## bcrypt (Password Hashing)

```typescript
import bcrypt from 'bcrypt'
const hash = await bcrypt.hash(plainPassword, 12)
const match = await bcrypt.compare(plainPassword, hash)
```

## JWT Validation

```typescript
import jwt from 'jsonwebtoken'
jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
  algorithms: ['RS256'],
  issuer: 'my-app',
  maxAge: '15m',
})
```

## DOMPurify (XSS Prevention)

```typescript
import DOMPurify from 'dompurify'
const clean = DOMPurify.sanitize(userInput)
element.innerHTML = clean
```

## Parameterized Queries

```typescript
import { Pool } from 'pg'
const pool = new Pool()
await pool.query('SELECT * FROM users WHERE email = $1', [email])
```

## dotenv + Zod Validation

```typescript
import { z } from 'zod'
import 'dotenv/config'
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_PRIVATE_KEY: z.string().min(1),
})
const env = envSchema.parse(process.env)
```
