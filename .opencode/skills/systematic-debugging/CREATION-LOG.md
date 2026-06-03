# Creation Log: Systematic Debugging Skill

Reference example of extracting, structuring, and bulletproofing a critical skill.

## Extraction Decisions

**What to include:**
- Complete 4-phase framework with all rules
- Anti-shortcuts ("NEVER fix symptom")
- Pressure-resistant language
- Concrete steps for each phase

**What to leave out:**
- Project-specific context
- Repetitive variations of same rule
- Narrative explanations (condensed to principles)

## Bulletproofing Elements

### Language Choices
- "ALWAYS" / "NEVER" (not "should" / "try to")
- "STOP and re-analyze" (explicit pause)

### Structural Defenses
- Phase 1 required — can't skip to implementation
- Single hypothesis rule — forces thinking
- Explicit failure mode — if first fix doesn't work, mandatory action

### Redundancy
- Root cause mandate in overview + when_to_use + Phase 1 + implementation
- "NEVER fix symptom" appears in multiple contexts

## Testing

Created 4 validation tests:
1. Academic: Perfect compliance, complete investigation
2. Time pressure + obvious fix: Resisted shortcut, found root cause
3. Complex system: Traced through all layers, found source
4. Failed first fix: Stopped, re-analyzed, formed new hypothesis

All tests passed. No rationalizations found.

## Key Insight

Most important bulletproofing: Anti-patterns section showing exact shortcuts that feel justified in the moment. When an agent thinks "I'll just add this one quick fix", seeing that exact pattern listed as wrong creates cognitive friction.
