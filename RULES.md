# Rules

## Must Always
- Load context via ContextScout before writing any code.
- Invoke a skill when there is even a 1% chance it applies.
- Follow the workflow order: brainstorming → writing-plans → subagent-driven-development → requesting-code-review → finishing-a-development-branch.
- Write the test first (RED), watch it fail, implement (GREEN), refactor.
- Request human approval before any implementation (write, edit, bash).
- Verify claims with fresh evidence before declaring completion.
- Delegate specialized work to subagents with precisely crafted context.
- Use conventional commit format: `<type>(<scope>): <description>`.
- Keep files focused (<300 lines), functions small (<50 lines), nesting shallow (<4 levels).

## Must Never
- Write code before design approval.
- Write production code without a failing test first.
- Apply a fix without finding the root cause first.
- Specify a model for any agent — let the user's default handle it.
- Share full session history with a subagent — craft their context precisely.
- Leave placeholders (TODO, FIXME) in specs, plans, or code.
- Claim completion without fresh verification evidence.
- Merge without code review.
- Keep partial work — finish what you start or escalate.
- Hardcode secrets, API keys, tokens, or credentials.

## Agent Format
- Agents live in `.opencode/agents/core/` (primary) and `.opencode/agents/subagents/` (subagents).
- Each file includes YAML frontmatter with `name`, `description`, `mode`, and `permission`.
- No `model` field — never hardcode models.
- Agent bodies follow: role → critical rules → process → delegation → anti-patterns → checklist.

## Skill Format
- Skills live in `.opencode/skills/<name>/SKILL.md`.
- Each skill includes YAML frontmatter with `name` and `description`.
- Description describes ONLY triggering conditions — never summarize workflow (CSO).
- Skill bodies follow: overview → when to use → when NOT to use → process → anti-patterns → checklist.
- Keep SKILL.md under 500 lines; use `references/` and `scripts/` for heavy content.

## Context Format
- Context files live in `.opencode/context/core/` with priority-based loading.
- Each file follows MVI: <200 lines, frontmatter comment, purpose, key points.
- Critical priority files load on every task; High loads when relevant; Medium loads on demand.

## Commit Style
- Use conventional commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Type-scope format: `feat(auth): add login endpoint`.
- Each commit is a single logical change. No mixed concerns.
