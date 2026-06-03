# Atlas

**The Unified OpenCode Experience**

Atlas combines the best of three opencode ecosystems into one cohesive experience:

| Project | What Atlas Takes |
|---------|-----------------|
| **[Superpowers](https://github.com/obra/superpowers)** (216k⭐) | Methodology — 12 skills driving brainstorming → TDD → subagent-driven dev → code review → ship |
| **[OpenAgentsControl](https://github.com/darrenhinde/OpenAgentsControl)** (4.2k⭐) | Context system — MVI pattern discovery, approval gates, team-ready patterns |
| **[Oh My OpenCode](https://github.com/code-yeongyu/oh-my-opencode)** (60.8k⭐) | Infrastructure — agent orchestration, todo enforcer, comment checker, background tasks |

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/S1NXIAN/atlas/main/install.sh | bash
```

Restart OpenCode, then:

```
skill tool to list skills
```

Or just start building:

```
build a user authentication system
```

## The Ultrawork Keyword

Include `ultrawork` (or `ulw`) in any prompt to activate the full Atlas pipeline — context discovery, brainstorming, planning, parallel agent execution, code review, and clean finish. Works out of the box.

## What's Inside

```
.opencode/
├── plugins/atlas.js             # Bootstrap injection + skill auto-registration
├── skills/                      # 12 Superpowers methodology skills
│   ├── using-atlas/
│   ├── brainstorming/
│   ├── writing-plans/
│   ├── subagent-driven-development/
│   ├── test-driven-development/
│   ├── executing-plans/
│   ├── using-git-worktrees/
│   ├── requesting-code-review/
│   ├── finishing-a-development-branch/
│   ├── systematic-debugging/
│   ├── verification-before-completion/
│   └── dispatching-parallel-agents/
├── agents/                      # Editable markdown agents
│   ├── core/
│   │   └── atlas.md             # End-to-end orchestrator & production coder
│   └── subagents/
│       ├── context-scout.md     # Pattern discovery (OAC)
│       ├── oracle.md            # Architecture/debugging
│       ├── librarian.md         # Docs/codebase research
│       ├── frontend-engineer.md # UI implementation
│       ├── explore.md           # Fast codebase search
│       ├── task-manager.md      # Feature breakdown
│       ├── test-engineer.md     # TDD executor
│       ├── code-reviewer.md     # Code quality review
│       └── external-scout.md    # Live library docs
├── context/                     # MVI context system
│   ├── core/
│   │   ├── standards/           # Code quality, security, testing
│   │   ├── workflows/           # Review, delegate, break down
│   │   └── patterns/            # Error handling, logging, config
│   └── project/                 # Your patterns here
├── commands/                    # Slash commands
│   ├── add-context.md           # Context wizard
│   ├── commit.md                # Smart commits
│   └── test.md                  # Test pipeline
└── src/                         # TypeScript plugin infrastructure
```

## Key Features

### 🧠 Methodology (from Superpowers)
Design-first development. Every feature starts with brainstorming, produces a written spec, breaks into bite-sized TDD tasks, executes via subagent-driven development, reviews thoroughly, and finishes cleanly. Iron Laws ensure process discipline.

### 📐 Context System (from OpenAgentsControl)
Your project patterns are stored in `.opencode/context/` — agents load them before coding. The ContextScout subagent discovers relevant patterns automatically. Add your patterns with `/add-context`. Commit context to git for team-wide consistency.

### ⚙️ Parallel Agents (from Oh My OpenCode)
Spawn background subagents for independent tasks. Model-agnostic — no hardcoded models, uses your default OpenCode model. Focused agents for architecture (oracle), research (librarian), UI (frontend-engineer), and search (explore).

### ✋ Approval Gates
Agents propose plans before implementing. You review and approve. No surprise auto-execution.

### ♻️ Repeatable Patterns
Same patterns = same quality. Configure once with `/add-context`, commit to repo, entire team uses the same standards.

## Commands

| Command | Action |
|---------|--------|
| `/add-context` | Interactive wizard to add your project's patterns |
| `/commit` | Smart git commit with conventional message format |
| `/test` | Run the project's full testing pipeline |

## Configuration

No hardcoded models. Atlas uses your default OpenCode model. To override per-agent, add to `opencode.json`:

```json
{
  "agent": {
    "atlas": { "model": "anthropic/claude-sonnet-4-5" },
    "oracle": { "model": "openai/gpt-5.2" }
  }
}
```

## Updating

```bash
curl -fsSL https://raw.githubusercontent.com/S1NXIAN/atlas/main/update.sh | bash
```

## Philosophy

- **Test-Driven Development** — Write tests first, always
- **Systematic over ad-hoc** — Process over guessing
- **Complexity reduction** — Simplicity as primary goal
- **Evidence over claims** — Verify before declaring success
- **No vendor lock-in** — Model agnostic by design

## License

MIT
