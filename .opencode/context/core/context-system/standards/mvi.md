<!-- Context: core/context-system/standards/mvi | Priority: critical | Version: 1.0 | Updated: 2026-06-03 -->

# MVI (Minimal Viable Information) Principle

## Core Idea
Only load what's needed, when it's needed. Every context file must justify its existence.

## File Constraints
- **Concepts**: <100 lines
- **Guides**: <150 lines
- **Examples**: <80 lines
- **Total per topic**: <200 lines

## Structure
Each context file follows:
1. **Frontmatter**: HTML comment with context path, priority, version, date
2. **Purpose**: 1-3 sentences explaining what this file contains
3. **Key Points**: 3-5 bullet points of critical information
4. **Example**: 5-10 line code example (if applicable)
5. **Reference**: Link to more detailed documentation

## Priority Levels
| Priority | When Loaded | Example |
|----------|-------------|---------|
| Critical | Always, on every task | code-quality.md, security-patterns.md |
| High | When relevant to the task | test-coverage.md, error-handling.md |
| Medium | When specifically needed | documentation.md, logging.md |

## Discovery
ContextScout discovers relevant files by:
1. Understanding the user's intent
2. Glob/grep to find matching files
3. Read confirmed matches to extract key information
4. Return ranked results to the main agent
