<!-- Context: core/workflows/feature-breakdown | Priority: high | Version: 2.0 | Updated: 2026-06-03 -->

# Feature Breakdown Workflow

## Purpose
Break complex features into a DAG of subgoals with typed success criteria, matched to task complexity.

## Process

### 0. Complexity Assessment
- Estimate S = minimum sequential steps required
- Choose DGI target: simple (1.0-1.2), moderate (1.8-2.4), complex (2.8-4.5)
- Calculate optimal subtask count ≈ 0.85 × S^1.5
- Do not exceed DGI 3.0 without justification (coordination overhead becomes dominant)

### 1. Understand the Feature
- Read the spec/design document
- Identify the core functionality
- List all components, APIs, data models, and tests needed

### 2. Map Dependency DAG (not flat list)
- What must exist before other things can be built?
- What can be built in parallel?
- What is purely additive (no dependencies)?
- Draw explicit edges between dependent subgoals

### 3. Define Node Specifications
Each DAG node must specify:
- **Preconditions**: What must be true before start
- **Post-conditions**: What must be true after completion
- **KPI entities**: Typed expected outputs (string, number, array, dict)
- **Replanning boundary**: local (default) or global
- **Verification**: Command or check for post-conditions

### 4. Order Tasks (DAG traversal)
- Roots first (no dependencies)
- Then nodes whose dependencies are satisfied
- Parallelize independent branches

### 5. Task Format
```
## T<N>: <name> [replan: <local|global>]
- **Pre**: <precondition>
- **Post**: <post-condition>
- **Outputs**:
  - <entity>: <type> (<description>)
- **Files**: path/to/file.ts
- **Depends on**: T<M> (optional)
- **Can parallelize**: yes/no
- **Verify**: Command or check
```

## Anti-Patterns
- Tasks that take hours (too big)
- Tasks that take seconds (too small — merge into parent)
- Flat lists without dependency edges
- Tasks with no typed success criteria
- Over-decomposition (DGI above optimal range)
- Global replan label on every node (should be rare)
