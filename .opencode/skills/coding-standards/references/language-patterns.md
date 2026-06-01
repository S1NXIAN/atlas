# Language Patterns

## TypeScript

- **Naming**: camelCase for variables, functions, parameters. PascalCase for classes, interfaces, types, enums.
- **Imports**: Named imports preferred. Default imports only for React components and library entry points. Sort: external → internal → relative.
- **Types**: Prefer `interface` for object shapes, `type` for unions/intersections. Explicit return types on all functions.
- **Error pattern**: `class XxxError extends Error` with `code: string` property.
- **File pattern**: One class/component per file. Barrel exports via `index.ts`.

## Python

- **Naming**: snake_case for variables, functions, methods. PascalCase for classes. UPPER_SNAKE for constants.
- **Imports**: `import X` for stdlib, `from Y import Z` for packages. Sorted: stdlib → third-party → local.
- **Error pattern**: `class XxxError(Exception)` with `code` and `status_code` properties.
- **Type hints**: Required on all public functions. Use `|` union syntax (3.10+).
- **File pattern**: One class or module function group per file.

## Go

- **Naming**: camelCase for unexported, PascalCase for exported. Single-letter receiver names by convention (`t *T`, `r *Reader`).
- **Imports**: Grouped: stdlib → third-party → local. No blank imports except for drivers.
- **Error pattern**: `var ErrXxx = errors.New("xxx")` for sentinels. `fmt.Errorf("context: %w", err)` for wrapping.
- **File pattern**: Package-level declaration first, then types, then exported functions, then unexported. Tests in `xxx_test.go`.
