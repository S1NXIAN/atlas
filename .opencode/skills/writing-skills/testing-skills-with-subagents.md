# Testing Skills With Subagents

**Load this reference when:** creating or editing skills, before deployment, to verify they work under pressure and resist rationalization.

## Overview

**Testing skills is just TDD applied to process documentation.**

You run scenarios without the skill (RED - watch agent fail), write skill addressing those failures (GREEN - watch agent comply), then close loopholes (REFACTOR - stay green).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill prevents the right failures.

## When to Use

Test skills that:
- Enforce discipline (TDD, testing requirements)
- Have compliance costs (time, effort, rework)
- Could be rationalized away ("just this once")

Don't test:
- Pure reference skills (API docs, syntax guides)
- Skills without rules to violate

## TDD Mapping for Skill Testing

| TDD Phase | Skill Testing | What You Do |
|-----------|---------------|-------------|
| **RED** | Baseline test | Run WITHOUT skill, watch agent fail |
| **Verify RED** | Capture rationalizations | Document exact failures verbatim |
| **GREEN** | Write skill | Address specific baseline failures |
| **Verify GREEN** | Pressure test | Run WITH skill, verify compliance |
| **REFACTOR** | Plug holes | Find new rationalizations, add counters |
| **Stay GREEN** | Re-verify | Test again, ensure still compliant |

## RED Phase: Baseline Testing

**Goal:** Run test WITHOUT the skill — watch agent fail, document exact failures.

**Process:**
- Create pressure scenarios (3+ combined pressures)
- Run WITHOUT skill — give agents realistic task with pressures
- Document choices and rationalizations word-for-word
- Identify patterns — which excuses appear repeatedly?

## GREEN Phase: Write Minimal Skill

Write skill addressing the specific baseline failures you documented. Don't add extra content for hypothetical cases.

## REFACTOR Phase: Close Loopholes

For each new rationalization discovered:
1. Add explicit negation in rules
2. Add entry in rationalization table
3. Add red flag entry
4. Update description with violation symptoms
5. Re-test same scenarios with updated skill

When skill is bulletproof:
- Agent chooses correct option under maximum pressure
- Agent cites skill sections as justification
- Agent acknowledges temptation but follows rule anyway
- Meta-testing reveals "skill was clear, I should follow it"

## Pressure Types

| Pressure | Example |
|----------|---------|
| **Time** | Emergency, deadline, deploy window closing |
| **Sunk cost** | Hours of work, "waste" to delete |
| **Authority** | Senior says skip it, manager overrides |
| **Exhaustion** | End of day, already tired |
| **Pragmatic** | "Being pragmatic vs dogmatic" |

Best tests combine 3+ pressures.

## Quick Reference

| Phase | Key Activity | Success Criteria |
|-------|-------------|------------------|
| RED | Run scenario without skill | Agent fails, document rationalizations |
| GREEN | Write skill | Agent now complies with skill |
| REFACTOR | Close loopholes | No new rationalizations found |
