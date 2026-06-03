<!-- Context: core/task-management/guides/splitting-tasks | Priority: medium | Version: 1.0 | Updated: 2026-06-03 -->

# Splitting Tasks

## Horizontal Split (by layer)
```
Feature: User Registration
├── Task 1: Database schema + migration
├── Task 2: Validation logic
├── Task 3: API endpoint
├── Task 4: UI component
└── Task 5: Integration test
```

## Vertical Split (by feature slice)
```
Feature: User Profile
├── Task 1: Display profile (read)
└── Task 2: Edit profile (write + update)
```

## When to Split Horizontally
- Large feature with distinct layers
- Different team members own different layers
- Layers can be tested independently

## When to Split Vertically
- Small to medium features
- End-to-end slices are more valuable
- Faster feedback on complete functionality

## General Rules
- Each task produces a working increment (even if not shippable)
- Tasks should be independently verifiable
- Dependencies should be explicit and minimal
- Prefer many small tasks over few large ones
