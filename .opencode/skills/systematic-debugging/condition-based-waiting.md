# Condition-Based Waiting

## Overview

Replace arbitrary timeouts with condition polling. Timeouts are guessing — condition-based waiting proves the condition was met (or wasn't).

## The Pattern

### ❌ Bad: Arbitrary timeout

```typescript
await new Promise(resolve => setTimeout(resolve, 1000));
// Hope the operation finished 🤞
```

### ✅ Good: Condition-based polling

```typescript
async function waitFor(
  condition: () => boolean | Promise<boolean>,
  options?: { timeout?: number; interval?: number }
): Promise<void> {
  const timeout = options?.timeout ?? 5000;
  const interval = options?.interval ?? 50;
  const start = Date.now();

  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error(`Condition not met within ${timeout}ms`);
}
```

## Usage

### Wait for file to exist
```typescript
await waitFor(() => fs.existsSync(outputPath));
```

### Wait for async state
```typescript
await waitFor(async () => {
  const state = await readState();
  return state.status === 'completed';
});
```

### Wait for DOM element (browser)
```typescript
await waitFor(() => document.querySelector('.result') !== null);
```

## When to Use

- Tests with async operations
- Race conditions in test suites
- File system operations
- Process/child process completion
- Any "wait and hope" timeout pattern

## When NOT to Use

- Truly fixed delays (animations, user feedback timing)
- The event system already provides a callback/promise
- Polling would be too expensive (use event-based waiting instead)

## Real-World Impact

From debugging sessions:
- Arbitrary timeout: 51 flaky test failures/month
- Condition-based polling: 0 flaky failures/month
- Average fix time: Replace `sleep(1000)` with `waitFor(condition)` — 2 minutes
