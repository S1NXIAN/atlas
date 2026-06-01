# Code Reading Strategies Reference

## Reading Strategies

### Bottom-Up (files → modules → system)

Start with individual files, understand each in isolation, then assemble into modules and finally the system.

**When to use:**
- You are new to programming in this language.
- The codebase has no clear entry points or documentation.
- You want deep understanding of a specific module.

**Process:**
1. Pick a small file (under 200 lines) and read it entirely.
2. Note its imports/exports. Read each import's file.
3. After reading a cluster of related files, summarize the module's responsibility.
4. Look for the module's "main" or index file that wires exports together.
5. Repeat for adjacent modules until you understand the system.

**Risks:**
- Slow — you may spend days on details without seeing the big picture.
- Easy to get lost in peripheral files.

### Top-Down (entry points → layers → data)

Start with system entry points, trace through layers down to data stores.

**When to use:**
- The codebase has clear entry points (main.go, index.ts, app.py).
- You need a system-level understanding quickly.
- You are debugging or tracing a feature.

**Process:**
1. Find all entry points: main() functions, route registrations, event listeners.
2. Read the outermost layer (e.g., HTTP handler or CLI command).
3. Trace each call to the next layer (service, use-case, domain).
4. Continue tracing until you reach data access (database, API, filesystem).
5. Optionally work back up to understand response construction.

**Advantages:**
- Fast — you get a high-level map in minutes.
- Focused — only reads files on the critical path.
- Natural — mirrors how the code executes.

### Feature-Driven (pick a feature, trace it)

Pick a concrete user-facing feature and trace everything it touches.

**When to use:**
- You need to understand a specific feature, not the whole system.
- The codebase is large and a full top-down pass is too time-consuming.
- You are assigned to fix a bug or add a feature.

**Process:**
1. Start with the test file for the feature (see code-scout-tactics rule #3).
2. From the test, identify the entry point (API route, function call).
3. Trace execution from the entry point through all layers.
4. Note every file touched: handler, validator, service, repository, model.
5. Create a dependency list for just this feature.

**Advantages:**
- High signal-to-noise — only reads relevant code.
- Immediate practical output (you understand the feature you need to change).
- Tests provide executable documentation.

---

## Annotation Techniques

### Inline Comments While Reading

Add temporary comments as you read to capture understanding:

```typescript
// [ENTRY POINT] This route handles user registration
// [FLOWS TO] -> validation middleware -> auth service -> user repository
// [SIDE EFFECT] Sends welcome email via notification service
```

Use markers:
- `[ENTRY POINT]` — where execution starts
- `[FLOWS TO]` — next hop in the trace
- `[DATA MODEL]` — schema/type definition
- `[SIDE EFFECT]` — observable behavior beyond return value
- `[CONTRACT]` — assumption or invariant
- `[TODO: VERIFY]` — uncertain about behavior

### Module Summary Cards

After reading a module, create a one-paragraph summary:

```
Module: src/services/order-service.ts
Responsibility: Orchestrates order lifecycle (create, cancel, refund)
Key functions: createOrder(), cancelOrder(), processRefund()
Dependencies: product-repository, payment-gateway, notification-service
Used by: order-handler.ts, admin-order-handler.ts
Side effects: Writes to orders table, sends payment to gateway, queues emails
```

Keep these in `docs/scout-notes/` alongside the architecture overview.

---

## Speed-Reading Patterns

When you recognize a framework or pattern, skip familiar boilerplate:

| Framework | What to skip | What to read |
|-----------|-------------|--------------|
| Express/Fastify | Route definition syntax | Middleware order, error handlers, hooks |
| NestJS | Module/Controller decorators | Guards, interceptors, providers |
| Django | View class boilerplate | Middleware, signals, context processors |
| Spring Boot | @RestController/@Service annotations | Interceptors, filters, AOP aspects |
| React | Component boilerplate | Hooks, context providers, effects |
| Next.js | Pages/router boilerplate | Middleware, data fetching (getServerSideProps) |
| Go Chi | Route registration | Middleware chain, handler signatures |
| FastAPI | Route decorators | Dependencies, middleware, background tasks |

### Recognizing Framework Conventions

- **Express/Fastify**: App.use() chain reveals middleware order. Error handlers have 4 params `(err, req, res, next)`.
- **NestJS**: Module imports reveal feature boundaries. @Global() modules are shared singletons.
- **React**: Provider tree at the app root reveals state management layers.
- **Go**: `func main()` in `cmd/` or `main.go`. Middleware in `internal/middleware/`.
- **Python**: `urls.py` or `routes.py` for web frameworks. `celery.py` for task queues.
- **Django**: `urls.py` → `views.py` → `models.py` is the canonical trace path.

---

## When to Use Each Strategy

| Situation | Recommended Strategy |
|-----------|---------------------|
| First day on a new project | Top-down for system map, then feature-driven for first task |
| Fixing a bug | Feature-driven (start with test for the failing case) |
| Adding a feature | Feature-driven (trace related feature first, then add yours) |
| Code review | Top-down (check entry point, trace relevant path) |
| Security audit | Top-down + Bottom-up (entry points + deep dive into auth/crypto) |
| Architecture documentation | Top-down for overview, Bottom-up for detail on key modules |
| Onboarding a new team member | Top-down walkthrough together, then feature-driven for first task |
| Large legacy codebase with no docs | Top-down for high-level map, then feature-driven to investigate modules |
