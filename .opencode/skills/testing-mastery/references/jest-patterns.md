# Jest Testing Patterns

## Describe / It Blocks

```typescript
describe('UserService', () => {
  describe('createUser', () => {
    it('returns error when email is already taken', async () => {
      const existing = { email: 'taken@test.com' }
      await db.user.create({ data: existing })

      const result = await service.createUser({ email: 'taken@test.com' })

      expect(result.ok).toBe(false)
      expect(result.error.code).toBe('CONFLICT')
    })
  })
})
```

## Matchers

```typescript
expect(value).toBe(primitive)
expect(object).toEqual(expected)
expect(array).toContainEqual(item)
expect(fn).toHaveBeenCalledWith(...args)
expect(fn).toHaveBeenCalledTimes(n)
expect(promise).rejects.toThrow(error)
expect(value).toBeNull()
expect(value).toBeDefined()
expect(value).toMatchSnapshot()
```

## jest.mock

```typescript
jest.mock('../../db/user-repository')
const mockRepo = mocked(UserRepository)
mockRepo.findByEmail.mockResolvedValue(null)
```

## jest.spyOn

```typescript
const sendSpy = jest.spyOn(emailService, 'sendVerification')
sendSpy.mockResolvedValue(true)
expect(sendSpy).toHaveBeenCalledWith(user.email)
```

## Timer Mocks

```typescript
jest.useFakeTimers()
jest.advanceTimersByTime(5000)
expect(callback).toHaveBeenCalled()
jest.useRealTimers()
```

## Snapshot Testing

```typescript
it('renders user profile', () => {
  const { container } = render(<UserProfile user={user} />)
  expect(container).toMatchSnapshot()
})
```

## Custom Matchers

```typescript
expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    return {
      pass: received >= floor && received <= ceiling,
      message: () => `expected ${received} to be within range ${floor}–${ceiling}`,
    }
  },
})
expect(100).toBeWithinRange(90, 110)
```

## Coverage Config (jest.config.ts)

```typescript
export default {
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { lines: 80, branches: 75, functions: 80, statements: 80 },
    'src/services/**': { lines: 90 },
    'src/errors/**': { lines: 100 },
  },
}
```
