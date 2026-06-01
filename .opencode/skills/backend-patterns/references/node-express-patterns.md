# Node.js / Express Backend Patterns

## Layered File Structure

```
src/
├── handlers/        # Route handlers (thin, delegates to service)
├── services/        # Business logic
├── data/            # Database access, external API clients
├── middleware/      # Auth, logging, validation
├── config/         # Environment config
└── app.ts          # Express app setup, middleware wiring
```

## Middleware Chain Pattern

```typescript
// app.ts
app.use(authMiddleware)
app.use(requestLoggingMiddleware)
app.use(validationMiddleware)
app.use(router)

// Handler example
async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json({ data: user })
  } catch (err) {
    next(err)  // Caught by error handler middleware
  }
}
```

## Service Layer with Typed Errors

```typescript
import { AppError } from '../error-handling'

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(input: CreateUserInput): Promise<User> {
    const existing = await this.userRepo.findByEmail(input.email)
    if (existing) {
      throw new AppError('USER_EXISTS', 'User already exists', 409)
    }
    return this.userRepo.create(input)
  }
}
```

## Structured Logging with Correlation ID

```typescript
import pino from 'pino'

const logger = pino()

// In middleware
app.use((req, res, next) => {
  const rawCorrelationId = req.headers['x-correlation-id']
  req.correlationId = typeof rawCorrelationId === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(rawCorrelationId)
    ? rawCorrelationId
    : crypto.randomUUID()
  res.setHeader('x-correlation-id', req.correlationId)
  next()
})

// In service
logger.info({ correlationId, userId }, 'User created successfully')
```

## Graceful Shutdown

```typescript
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully')
  server.close(() => {
    logger.info('HTTP server closed')
    process.exit(0)
  })
  setTimeout(() => {
    logger.error('Forced shutdown after timeout')
    process.exit(1)
  }, 30000).unref()
})

// Health Checks
import { Router } from 'express'

const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

healthRouter.get('/ready', async (_req, res) => {
  try {
    await db.raw('SELECT 1')
    res.json({ status: 'ready' })
  } catch {
    res.status(503).json({ status: 'not ready' })
  }
})

// Config from Env
import 'dotenv/config'

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/app',
  logLevel: process.env.LOG_LEVEL || 'info',
}

const required = ['DATABASE_URL']
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
}

// Response Envelope
interface Envelope<T> {
  data?: T
  error?: { code: string; message: string; details?: unknown }
  meta?: Record<string, unknown>
}

function success<T>(data: T): Envelope<T> {
  return { data }
}

function errorResponse(code: string, message: string): Envelope<never> {
  return { error: { code, message } }
}
```
