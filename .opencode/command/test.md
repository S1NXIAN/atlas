---
description: Run the complete testing pipeline
---

# Testing Pipeline

When the user runs this command, execute the project's testing pipeline.

## Process

1. Run type checking: check for `tsc`, `tsc --noEmit`, or `pnpm type:check`
2. Run linting: check for `eslint`, `pnpm lint`, or similar
3. Run tests: check for `vitest`, `jest`, `pytest`, or `pnpm test`
4. Report results for each step
5. If any step fails, report the failure clearly
6. If all pass, report success

## Adaptation
- Auto-detect the project's test framework from package.json or config files
- Use the project's established test commands
- Report failures with enough context to fix them
