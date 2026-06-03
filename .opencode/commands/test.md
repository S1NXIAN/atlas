---
name: test
description: Run the complete testing pipeline — type checking, linting, and tests
---

# Testing Pipeline

When the user runs this command, execute the project's testing pipeline.

## Process

1. **Type checking**: check for `tsc`, `tsc --noEmit`, or `pnpm type:check`
2. **Linting**: check for `eslint`, `pnpm lint`, or similar
3. **Tests**: check for `vitest`, `jest`, `pytest`, or `pnpm test`
4. **Report results** for each step
5. If any step fails, report the failure clearly
6. If all pass, report success

## Adaptation

- Auto-detect the project's test framework from package.json or config files
- Use the project's established test commands
- Report failures with enough context to fix them

## Output Format

```
## Pipeline Results

### Type Check: ✅ PASS
[no errors]

### Lint: ❌ FAIL
[path/to/file.ts:10:5 - error: unused variable 'x']

### Tests: ⏭ SKIPPED
(lint step failed — fix before retrying)
```

## Quality Checklist

- [ ] Auto-detected test framework from project config
- [ ] Each step run and reported independently
- [ ] Failures include actionable context
