---
name: brainstorming
description: "You MUST use this before any creative work — creating features, building components, adding functionality, or modifying behavior. Explores user intent, requirements and design before implementation."
---

Help turn ideas into fully formed designs and specs through natural collaborative dialogue.

<HARD-GATE>
You MUST NOT invoke any implementation skill or write any code until the design is approved. This gate is absolute. "This is too simple to need a design" is an anti-pattern, not an exception.
</HARD-GATE>

## Process

1. **Explore project context** — understand what you're working with
2. **Offer visual companion** — ask if diagrams or wireframes would help clarify
3. **Ask clarifying questions** — one at a time, don't overwhelm
4. **Propose 2-3 approaches** — with concrete trade-offs for each
5. **Present design in sections** — small enough to read and digest per section
6. **Write design doc** — save to `docs/specs/YYYY-MM-DD-<topic>-design.md`
7. **Self-review spec** — check for: placeholders, contradictions, ambiguity, scope creep
8. **User reviews written spec** — wait for explicit approval
9. **Transition to implementation** — invoke `atlas:writing-plans` NOT an implementation skill

### Anti-Pattern: "This Is Too Simple To Need A Design"

| Claim | Reality |
|-------|---------|
| "It's just a button" | What color? What state? What does it do? Where does it go? |
| "We already discussed this" | The spec serves as a record. New details emerge in writing. |
| "I've done this a hundred times" | This project has unique constraints you haven't explored yet. |
| "The user will get bored" | The user will be happier with a working result than a fast wrong one. |

**Terminal state:** Invoke `atlas:writing-plans`. Never an implementation skill.
