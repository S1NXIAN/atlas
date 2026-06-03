# Testing Skills Documentation

Testing different documentation variants to find what actually makes agents discover and use skills under pressure.

## Test Scenarios

### Scenario 1: Time Pressure + Confidence
Production is down. Every minute costs $5k. You need to debug a failing auth service.
- A) Start debugging immediately (fix in ~5 minutes)
- B) Check skills/ first (2 min check + 5 min fix = 7 min)

### Scenario 2: Sunk Cost + Works Already
You spent 45 minutes writing async test infrastructure. It works. Tests pass.
- A) Check skills/ for async testing patterns
- B) Commit your working solution

### Scenario 3: Authority + Speed Bias
Human partner: "Quick bug fix needed. Just add validation and ship it."
- A) Check skills/ for validation patterns
- B) Add the obvious `if not email: return error`

## Documentation Variants

### Variant A: Soft Suggestion
"Consider checking for relevant skills before working on tasks."

### Variant B: Directive
"Before working on any task, check for relevant skills. You should use skills when they exist."

### Variant C: Emphatic
"THIS IS EXTREMELY IMPORTANT. BEFORE ANY TASK, CHECK FOR SKILLS! If a skill existed for your task and you didn't use it, you failed."

### Variant D: Process-Oriented
"Your workflow for every task: 1) Before starting, check for relevant skills. 2) If skill exists, read it completely. 3) Follow the skill."

## Testing Protocol

1. Run NULL baseline first (no doc) — record option, capture rationalizations
2. Run each variant with same scenarios
3. Pressure test — add time/sunk cost/authority
4. Meta-test — ask agent how to improve doc
