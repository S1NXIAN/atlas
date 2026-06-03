---
name: writing-skills
description: Use when creating new skills, editing existing skills, or verifying skills work before deployment
---

# Writing Skills

## Overview

**Writing skills IS Test-Driven Development applied to process documentation.**

You write test cases (pressure scenarios with subagents), watch them fail (baseline behavior), write the skill (documentation), watch tests pass (agents comply), and refactor (close loopholes).

**Core principle:** If you didn't watch an agent fail without the skill, you don't know if the skill teaches the right thing.

**REQUIRED BACKGROUND:** You MUST understand `atlas:test-driven-development` before using this skill. That skill defines the fundamental RED-GREEN-REFACTOR cycle. This skill adapts TDD to documentation.

## What is a Skill?

A **skill** is a reference guide for proven techniques, patterns, or tools. Skills help future agents find and apply effective approaches.

**Skills are:** Reusable techniques, patterns, tools, reference guides

**Skills are NOT:** Narratives about how you solved a problem once

## TDD Mapping for Skills

| TDD Concept | Skill Creation |
|-------------|----------------|
| **Test case** | Pressure scenario with subagent |
| **Test fails (RED)** | Agent violates rule without skill (baseline) |
| **Test passes (GREEN)** | Agent complies with skill present |
| **Refactor** | Close loopholes while maintaining compliance |

## When to Create a Skill

**Create when:**
- Technique wasn't intuitively obvious to you
- You'd reference this again across projects
- Pattern applies broadly (not project-specific)
- Others would benefit

**Don't create for:**
- One-off solutions
- Standard practices well-documented elsewhere
- Project-specific conventions (put in AGENTS.md)
- Mechanical constraints (if it's enforceable, automate it)

## SKILL.md Structure

**Frontmatter (YAML):**
- Two required fields: `name` and `description`
- `name`: Use letters, numbers, and hyphens only
- `description`: Third-person, describes ONLY when to use (NOT what it does)
  - Start with "Use when..." to focus on triggering conditions
  - **NEVER summarize the skill's process or workflow** (see CSO section for why)

**Body:**
- Overview with core principle
- When to Use / When NOT to Use
- Process or Pattern with concrete steps
- Anti-patterns (common mistakes)
- Quality Checklist

## Claude Search Optimization (CSO)

**Critical for discovery:** Future agents need to FIND your skill.

### 1. Rich Description Field

**Purpose:** Description answers: "Should I read this skill right now?"

**CRITICAL: Description = When to Use, NOT What the Skill Does**

The description should ONLY describe triggering conditions. Do NOT summarize the skill's process or workflow.

```yaml
# ❌ BAD: Summarizes workflow — Claude may follow this instead of reading skill
description: Use when executing plans — dispatches subagent per task with code review

# ✅ GOOD: Just triggering conditions, no workflow summary
description: Use when executing implementation plans with independent tasks
```

### 2. Keyword Coverage

Use words agents would search for:
- Error messages: "Hook timed out", "race condition"
- Symptoms: "flaky", "hanging", "zombie"
- Synonyms: "timeout/hang/freeze", "cleanup/teardown"

### 3. Descriptive Naming

**Use active voice, verb-first:**
- ✅ `writing-skills` not `skill-creation`
- ✅ `condition-based-waiting` not `async-test-helpers`

**Gerunds (-ing) work well for processes:**
- `writing-skills`, `systematic-debugging`, `brainstorming`

## The Iron Law (Same as TDD)

**NO SKILL WITHOUT A FAILING TEST FIRST.**

This applies to NEW skills AND EDITS to existing skills.

Write skill before testing? Delete it. Start over.
Edit skill without testing? Same violation.

## TDD Cycle for Skills

### RED: Write Failing Test (Baseline)

Run pressure scenario with subagent WITHOUT the skill. Document exact behavior:
- What choices did they make?
- What rationalizations did they use (verbatim)?
- Which pressures triggered violations?

### GREEN: Write Minimal Skill

Write skill that addresses those specific rationalizations. Don't add extra content for hypothetical cases.

Run same scenarios WITH skill. Agent should now comply.

### REFACTOR: Close Loopholes

Agent found new rationalization? Add explicit counter. Re-test until bulletproof.

See `testing-skills-with-subagents.md` for complete testing methodology.

## Anti-Patterns

| Pattern | Problem |
|---------|---------|
| Narrative storytelling | Too specific, not reusable |
| Multi-language examples | Mediocre quality, maintenance burden |
| Code in flowcharts | Can't copy-paste |
| Generic labels (step1, helper2) | Labels should have semantic meaning |

## Quality Checklist

- [ ] Created pressure scenarios (3+ combined pressures for discipline skills)
- [ ] Ran scenarios WITHOUT skill — documented baseline verbatim
- [ ] Description starts with "Use when..." includes specific triggers
- [ ] Description written in third person
- [ ] No workflow summary in description (CSO discipline)
- [ ] Clear overview with core principle
- [ ] One excellent example (not multi-language)
- [ ] Anti-patterns or common mistakes section
- [ ] Quality checklist present
- [ ] Reran scenarios WITH skill — agent complies
- [ ] Identified new rationalizations and closed loopholes
