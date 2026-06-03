---
name: test-driven-development
description: Use when implementing any feature or bugfix, before writing implementation code
---

Write the test first. Watch it fail. Write minimal code to pass.

**Core principle:** If you didn't watch the test fail, you don't know if it tests the right thing.

**Violating the letter of the rules is violating the spirit of the rules.**

## When to Use

ALWAYS for: new features, bug fixes, refactoring, behavior changes.

Exceptions (ask your human partner): throwaway prototypes, generated code, configuration files.

## The Iron Law

**NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.**

If you wrote code before the test, delete it and start over. No exceptions.

## Red-Green-Refactor

**RED:** Write a failing test with:
- Clear test name (describes one behavior)
- Tests one thing (no "and" in the name)
- Uses real code, not mocks (when practical)

**Verify RED:** Watch it fail. Check the failure message tells you what's wrong.

**GREEN:** Write minimal code to pass the test. Nothing more.

**Verify GREEN:** Watch it pass.

**REFACTOR:** Clean up while keeping green. Extract duplication. Improve names.

## Good Tests

| Quality | Description |
|---------|-------------|
| Minimal | One thing only. No "and" in the name. |
| Clear | Name describes the behavior being tested. |
| Shows intent | Demonstrates how the API should be used. |
| Independent | Order-independent, no shared state. |

## Why Order Matters

| Rationalization | Reality |
|----------------|---------|
| "I'll write tests after" | You won't. Or you'll write tests that pass against already-working code. |
| "Deleting X hours of work is wasteful" | Keeping untested code is more wasteful. It will break and you won't know. |
| "This is too simple to need a test first" | Then the test is simple too. No excuse. |
| "I'll just verify manually" | Manual verification is not repeatable. Tests are. |
