---
name: frontend-patterns
description: Frontend component architecture, state management, data fetching with loading/error/success states, error boundaries, form handling, optimistic updates, debounce, accessibility, CSS scoping, and bundle splitting. Use when building UI components, managing client state, implementing data fetching, or handling form inputs.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling, coding-standards
---

# Frontend Patterns

Consistent frontend architecture and component patterns.

## Core rules

1. **Component composition** — Container (logic/state) vs Presenter (rendering). Containers fetch data and pass down. Presenters receive props and render. One concern per component.
2. **State management** — Lift state up to nearest common ancestor. Colocate state with the component that owns it. Prefer local state over global state. Context is not a state management solution — use it for DI (theme, auth, locale).
3. **Data fetching** — Every data fetch has 3 states: loading, success, error. Use a data-fetching library (react-query, SWR, Apollo) that handles caching, deduplication, and refetching. Abort stale requests on unmount.
4. **Error boundaries** — Catch render-phase errors and display fallback UI. One error boundary per route or logical section. Log error details to monitoring service.
5. **Form handling** — Controlled inputs with validation on submit and on blur. Show errors inline next to fields. Disable submit button during submission. Never store form state in global state.
6. **Optimistic updates** — Update UI immediately on user action. Roll back on server error. Show a subtle indicator (not a full loader) during the pending state.
7. **Debounce user input** — Debounce input handlers by 300ms for search/autocomplete. Cancel previous debounce on new input. Show loading state only after debounce fires.
8. **Accessibility** — ARIA labels on interactive elements. Keyboard navigation for all interactive flows. Focus management after navigation. Color contrast ratio >= 4.5:1.
9. **CSS scoping** — Per-component styles using CSS Modules, CSS-in-JS, or scoped styles. No global CSS mutations from components. Design tokens (colors, spacing, typography) in a shared theme file.
10. **Bundle splitting** — Split by route using dynamic imports. Lazy load heavy components (charts, editors, maps). Measure bundle size impact per component.

## Procedures

1. Identify component role: container (data/logic) or presenter (rendering).
2. Choose state scope: local for form/UI state, context for theme/auth, library for server state.
3. Add data fetching: loading state, success render, error state with retry.
4. Wrap each route with error boundary.
5. Build form: controlled inputs, validation schema, submit handler, inline errors.
6. Add optimistic updates for mutations with rollback on error.
7. Debounce search/autocomplete inputs at 300ms.
8. Verify keyboard navigation: tab order, enter to submit, escape to close.
9. Scope styles: CSS modules or CSS-in-JS, no global leakage.
10. Verify bundle: dynamic imports for route-level and heavy components.

## Gotchas

- Fetching in useEffect is not enough — handle abort, error, loading, and race conditions. Stale closures on async callbacks cause bugs when component unmounts before response arrives.
- Prop drilling vs context — Context is not for state that changes frequently (every keystroke, every animation frame). Use context for stable values like theme or locale.
- Premature optimization — Don't memo before profiling. `useMemo` and `useCallback` have costs. Measure first.
- Form state in Redux is usually wrong. Form state is ephemeral — keep it local. Only move to global state when another component needs to read it.
- Nested loading spinners — Don't show a loading spinner in every nested component that fetches data. Use Suspense boundaries or skeleton screens at the page level.

## References

| File | Load when |
|------|-----------|
| `references/react-patterns.md` | Implementing React components with hooks |
| `references/ts-component-patterns.md` | TypeScript component patterns and typing |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Building new UI feature | frontend-patterns + error-handling + api-design |
| Implementing data fetching | frontend-patterns + backend-patterns |
| Building form with validation | frontend-patterns + coding-standards |
| Adding accessibility | frontend-patterns + coding-standards |
| Code splitting a route | frontend-patterns + error-handling |

## Checklist

- [ ] Component split into container/presenter (one concern each)
- [ ] State scope matches need (local/context/library, not global by default)
- [ ] Data fetching: loading + success + error states handled
- [ ] Error boundary at each route or logical section
- [ ] Form: controlled inputs, validation (submit + blur), inline errors
- [ ] Optimistic updates with rollback on error
- [ ] Debounce input (300ms) for search/autocomplete
- [ ] Keyboard navigation verified (tab, enter, escape)
- [ ] Styles scoped per component (no global leakage)
- [ ] Dynamic imports for route-level and heavy components
