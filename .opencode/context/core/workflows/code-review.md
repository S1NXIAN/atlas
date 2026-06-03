<!-- Context: core/workflows/code-review | Priority: high | Version: 1.0 | Updated: 2026-06-03 -->

# Code Review Workflow

## When to Review
- After every task in subagent-driven development
- Before merging any branch
- After complex bug fixes
- Before major refactoring

## Review Process

### 1. Spec Compliance
Does the code do what the spec says?
- All requirements implemented
- No scope creep (YAGNI)
- Correct behavior for happy path and edge cases
- Error conditions handled appropriately

### 2. Code Quality
- Clean, readable, maintainable
- Proper naming, structure, organization
- Functions have single responsibility
- No duplication (DRY)

### 3. Security
- Input validation present and correct
- No injection vulnerabilities
- Proper authentication/authorization checks
- Secrets not exposed

### 4. Testing
- Tests exist for the new/changed code
- Tests are meaningful (test behavior, not implementation)
- Edge cases covered
- Tests pass

## Severity Triage

| Severity | Definition | Action |
|----------|------------|--------|
| Critical | Bug, security issue, or spec violation that breaks functionality | Fix NOW |
| Important | Quality issue that will cause problems later | Fix before merge |
| Minor | Style, naming, or preference | Note for later |
| Suggestion | Optional improvement | Consider |

## Response to Feedback
- Fix critical and important issues
- Discuss if you disagree (provide reasoning)
- Thank the reviewer regardless
