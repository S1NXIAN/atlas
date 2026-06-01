# TypeScript API Examples

## Typed Fetch Client

```typescript
interface ListResponse<T> {
  data: T[]
  next_cursor?: string
  has_more: boolean
}

async function fetchList<T>(url: string, cursor?: string): Promise<ListResponse<T>> {
  const params = new URLSearchParams(cursor ? { cursor } : { limit: '20' })
  const res = await fetch(`${url}?${params}`)
  if (!res.ok) {
    const err = await res.json()
    throw new AppError(err.error.message, err.error.code, res.status)
  }
  return res.json()
}
```

## Paginated Response Type

```typescript
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total?: number
    next_cursor?: string
    has_more: boolean
  }
}

export function paginatedResponse<T>(data: T[], nextCursor?: string): PaginatedResponse<T> {
  return { data, meta: { next_cursor: nextCursor, has_more: !!nextCursor } }
}
```

## Zod Input Validation

```typescript
import { z } from 'zod'

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.issues } },
      { status: 422 }
    )
  }
  // ...
}
```
