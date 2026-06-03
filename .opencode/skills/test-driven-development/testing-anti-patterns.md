# Testing Anti-Patterns

## Common Mistakes

### 1. Testing Mock Behavior Instead of Real Behavior

```typescript
// ❌ BAD: Tests that mocks were called, not behavior
const mock = vi.fn();
processor.process(mock);
expect(mock).toHaveBeenCalledWith('data');

// ✅ GOOD: Tests actual behavior
const result = processor.process('data');
expect(result).toBe('processed:data');
```

**Rule:** Mock external dependencies (network, filesystem), not the code you're testing.

### 2. Test-Only Methods in Production Classes

```typescript
// ❌ BAD: Test-only method pollutes production code
class UserService {
  // Only exists for tests
  public _resetForTesting() { ... }
}

// ✅ GOOD: Test through public API
class UserService {
  async createUser(data: UserData) { ... }
}
```

### 3. Mocking Without Understanding Dependencies

```typescript
// ❌ BAD: Heavy mocking hides coupling problems
vi.mock('database');
vi.mock('cache');
vi.mock('auth');
const result = await service.getData();
expect(result).toEqual({ id: 1 });

// ✅ GOOD: Integration test or minimal mocking
const result = await service.getData(1);
expect(result).toBeDefined();
```

**Rule:** If you must mock everything, your code is too coupled.

### 4. Testing Implementation Details

```typescript
// ❌ BAD: Tests internal state, not behavior
expect(service['cache']).toHave('key');

// ✅ GOOD: Tests observable behavior  
const result = await service.getData('key');
expect(result).toEqual(expected);
```

### 5. Assertions Without Messages

```typescript
// ❌ BAD: Vague failure — "expected false to be true"
expect(result.isValid).toBe(true);

// ✅ GOOD: Descriptive failure
expect(result.isValid, 'User should be valid after registration').toBe(true);
```

### 6. Duplicate Setup in Every Test

```typescript
// ❌ BAD: Repeated setup
test('test 1', () => {
  const svc = new Service(new Db(), new Cache(), new Auth());
  ...
});
test('test 2', () => {
  const svc = new Service(new Db(), new Cache(), new Auth());
  ...
});

// ✅ GOOD: Shared factory or beforeEach
function createService() {
  return new Service(new Db(), new Cache(), new Auth());
}
```

### 7. Testing the Framework

```typescript
// ❌ BAD: Testing that Express routes work
const res = await request(app).get('/users');
expect(res.status).toBe(200);

// ✅ GOOD: Testing YOUR logic
const result = await userController.listUsers();
expect(result).toHaveLength(3);
```

## Quick Reference

| Anti-Pattern | Symptom | Fix |
|-------------|---------|-----|
| Mock behavior | Tests break when implementation changes | Test through public API |
| Test-only methods | Production classes have public test helpers | Remove, test through public API |
| Over-mocking | Every test has 5+ mocks | Simplify design, use DI |
| Implementation testing | Tests access private state | Test observable behavior |
| No assertion messages | "expected false to be true" | Add descriptive messages |
| Repeated setup | Same 10 lines in every test | Extract factory/beforeEach |
| Framework testing | Tests mock framework internals | Test your logic only |
