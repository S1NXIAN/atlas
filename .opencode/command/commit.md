---
name: commit
description: Create well-formatted commits with conventional commit messages
---

# Commit Command

When the user runs this command, create a well-formatted git commit.

## Process

1. **Pre-commit check**: Run lint and build/typecheck if applicable
2. **Stage files**: `git add .` if nothing is staged
3. **Analyze changes**: `git diff --cached` to understand what changed
4. **Generate commit message**: Use conventional commit format
5. **Commit**: `git commit -m "<message>"`
6. **Push**: `git push` (ask first if unclear)

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

## Quality Checklist

- [ ] Pre-commit checks pass (lint, typecheck)
- [ ] Changes analyzed before writing message
- [ ] Conventional commit format used
- [ ] Push confirmed with user (if needed)
