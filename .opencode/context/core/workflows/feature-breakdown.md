<!-- Context: core/workflows/feature-breakdown | Priority: high | Version: 1.0 | Updated: 2026-06-03 -->

# Feature Breakdown Workflow

## Purpose
Break complex features into small, independent, verifiable tasks.

## Process

### 1. Understand the Feature
- Read the spec/design document
- Identify the core functionality
- List all components, APIs, data models, and tests needed

### 2. Identify Dependencies
- What must exist before other things can be built?
- What can be built in parallel?
- What is purely additive (no dependencies)?

### 3. Split into Tasks
Each task should be:
- **Small**: 2-5 minutes of implementation work
- **Focused**: One clear goal
- **Verifiable**: Has a test or manual check
- **Independent**: Minimal coupling to other tasks

### 4. Order Tasks
- Foundation first (data models, schemas, config)
- Core logic next
- API/UI last
- Tests alongside each

### 5. Task Format
```
## Task N: <name>
- **Files**: path/to/file.ts
- **What**: One clear sentence
- **Depends on**: Task M (optional)
- **Verify**: Command or check
```

## Anti-Patterns
- Tasks that take hours (too big)
- Tasks that take seconds (too small)
- Tasks with unclear completion criteria
- Tasks that span multiple domains
