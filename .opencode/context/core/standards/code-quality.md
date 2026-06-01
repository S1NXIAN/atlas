# Code Quality Standards

**Purpose**: Baseline coding conventions for all pipeline-generated code

---

## Principles

1. **Readability over cleverness** — Code is read far more than written
2. **Type safety** — Use TypeScript strict mode, avoid `any`
3. **Single responsibility** — One function, one concern
4. **Explicit over implicit** — Clear intent, no magic
5. **Testability** — Every function should be testable in isolation

## Naming

| Construct | Convention | Example |
|-----------|-----------|---------|
| Files | kebab-case | `user-service.ts` |
| Classes | PascalCase | `UserService` |
| Functions | camelCase | `getUserById()` |
| Constants | UPPER_SNAKE | `MAX_RETRY_COUNT` |
| Types/Interfaces | PascalCase | `UserProfile` |

## Error Handling

- Use typed error classes, not generic `Error`
- Return Result types where appropriate
- Never swallow errors with empty catch blocks
- Log errors with context, not just the message

## Structure

- One export per file (default if single, named if multiple)
- Group imports: external → internal → types
- Keep files under 200 lines
