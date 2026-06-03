<!-- Context: core/standards/test-coverage | Priority: high | Version: 1.0 | Updated: 2026-06-03 -->

# Test Coverage Standards

## Test Types

| Type | Scope | Speed | When |
|------|-------|-------|------|
| Unit | Single function/module | ms | Every function with logic |
| Integration | Component + dependencies | s | API endpoints, database, services |
| E2E | Full user flow | min | Critical paths only |

## Coverage Targets
- Unit tests: 90%+ branch coverage for business logic
- Integration: All API endpoints and data access paths
- E2E: Critical user journeys (login, purchase, core flow)

## What to Test
- Public API/interface (not internals)
- Edge cases and boundary values
- Error conditions and error messages
- State transitions
- Business rules and logic

## What NOT to Test
- Implementation details
- Third-party library behavior (test integration, not the library itself)
- Trivial code (simple getters, constants)
- Configuration

## Test Structure (AAA)
1. **Arrange**: Set up the test data and environment
2. **Act**: Execute the code being tested
3. **Assert**: Verify the outcome

## Naming
- `describe('ModuleName')`
- `it('should <expected behavior> when <condition>')`
- Test names describe behaviors, not implementations
