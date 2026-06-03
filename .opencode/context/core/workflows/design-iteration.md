<!-- Context: core/workflows/design-iteration | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Design Iteration Workflow

## Purpose
Move from rough idea to approved design through structured iteration.

## Process

### Phase 1: Exploration
- Understand the user's intent and goals
- Ask clarifying questions one at a time
- Identify constraints and requirements
- Note what's in scope and out of scope

### Phase 2: Options
- Propose 2-3 approaches with concrete trade-offs
- For each option: effort, complexity, maintenance cost, flexibility
- Let the user choose or combine approaches

### Phase 3: Specification
- Present the design in sections (small enough to read)
- Each section covers: what, why, how, edge cases
- Include diagrams if helpful (ASCII or reference)
- Save the approved design to `docs/specs/`

### Phase 4: Self-Review
Before presenting to the user:
- Check for placeholders (`TODO`, `FIXME`)
- Check for contradictions
- Check for ambiguous statements
- Check for scope creep

### Phase 5: Approval
- User reviews the written spec
- User explicitly approves (or requests changes)
- Once approved, transition to planning (never directly to implementation)

## Anti-Patterns
- Jumping to solutions without understanding the problem
- Proposing only one option
- Writing code before design approval
- Skipping the written spec ("we already discussed this")
