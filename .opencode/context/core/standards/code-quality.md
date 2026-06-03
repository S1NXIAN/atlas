<!-- Context: core/standards/code-quality | Priority: critical | Version: 1.0 | Updated: 2026-06-03 -->

# Code Quality Standards

## Structure
- One responsibility per file
- One function per logical operation
- Files under 300 lines unless justified
- Clear naming: functions are verbs, variables are nouns, booleans are predicates

## Naming Conventions
- **Files**: kebab-case (e.g., `user-auth-service.ts`)
- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Types/Interfaces**: PascalCase with prefix convention from project patterns

## Functions
- Do one thing (single responsibility)
- 3 parameters max — use object parameter for more
- Return early, avoid deep nesting
- No side effects in pure functions

## Error Handling
- Use specific error types, not generic ones
- Handle errors at the appropriate level
- Don't catch errors you can't handle
- Log with context, not just the message

## Testing
- Tests live next to their source files in `__tests__/` or `.test.ts`
- One behavior per test
- Clear test names that describe the scenario

## Comments
- Code should be self-documenting
- Comments explain WHY, not WHAT
- No commented-out code
- No obvious comments (`// increment i`)
