---
description: Create well-formatted commits with conventional commit messages
---

# Commit Command

When the user runs this command, create a well-formatted git commit.

## Process

1. **Check pre-commit**: Run lint and build/typecheck if applicable
2. **Stage files**: `git add .` if nothing is staged
3. **Analyze changes**: `git diff --cached` to understand what changed
4. **Generate commit message**: Use conventional commit format

## Commit Message Format

```
<type>(<scope>): <description>

<body (optional)>

<footer (optional)>
```

### Types
| Type | When |
|------|------|
| feat | New feature |
| fix | Bug fix |
| refactor | Code change that neither fixes nor adds |
| test | Adding or updating tests |
| docs | Documentation only |
| chore | Maintenance, dependencies, tooling |

### Scope
The module, file, or area affected (e.g., `auth`, `api`, `ui`).

5. **Commit**: `git commit -m "<message>"`
6. **Push**: `git push` (ask first if unclear)
