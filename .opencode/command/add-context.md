---
description: Interactive wizard to add project patterns to the context system
---

# Add Context Command

When the user runs this command, guide them through an interactive wizard to capture their project's patterns.

## Process

Ask the following questions one at a time:

1. **Tech Stack**: What framework, language, database, and tools are you using?
2. **API Example**: Paste an example API endpoint from your project
3. **Component Example**: Paste an example UI component (if applicable)
4. **Naming Conventions**: File naming, component naming, function naming
5. **Testing Setup**: What test framework, where tests live, coverage requirements
6. **Security Requirements**: Auth method, data protection, any compliance needs

## Output

Generate the following files in `.opencode/context/project/`:

- `tech-stack.md` — Technology choices and versions
- `api-patterns.md` — API endpoint conventions with examples
- `component-patterns.md` — UI component patterns with examples
- `naming-conventions.md` — Naming rules for the project
- `security-requirements.md` — Security patterns and requirements

Each file should follow MVI principles: <200 lines, frontmatter, key points, example, reference.

## Update Mode

If the user runs `/add-context --update`:
- Read existing context files
- Ask what changed (new library, new pattern, migration)
- Update the relevant files and bump version numbers
