# ADR Examples

## ADR 0001: Database Selection for Multi-Tenant SaaS

### Status
accepted

### Context
Building a multi-tenant SaaS platform requiring row-level security, JSON document storage, complex reporting queries, and strong consistency. Evaluated PostgreSQL and MySQL.

### Decision
Use PostgreSQL. Required features: JSONB for flexible tenant configs, CTE for reporting queries, Row-Level Security for tenant isolation, BRIN indexes for time-series data.

### Consequences
Positive: Richer querying capabilities, better ecosystem (PostGIS, pgvector), stronger JSON support. Negative: Higher operational complexity, more memory usage per connection, fewer managed hosting options than MySQL.

---

## ADR 0002: API Architecture for Public API

### Status
accepted

### Context
Building a public API serving web, mobile, and third-party clients. Need field selection, caching, and versioning. Evaluated RESTful and GraphQL.

### Decision
Use REST with cursor pagination and sparse fieldsets. Rationale: simpler caching (CDN-friendly), wider tooling support, predictable URL structure for documentation generation.

### Consequences
Positive: Better cache hit rates, simpler client implementation, OpenAPI tooling ecosystem. Negative: More round trips for complex queries, over-fetching on fixed responses, requires versioning strategy from day one.

---

## ADR 0003: Framework Selection for Dashboard Application

### Status
accepted

### Context
Building an internal dashboard with SSR requirements, real-time updates, and team of 4 full-stack developers. Evaluated Next.js (App Router), Remix, and React SPA.

### Decision
Use Next.js with App Router. Rationale: Server Components reduce client bundle, file-based routing simplifies team workflow, Vercel deployment matches existing infra.

### Consequences
Positive: Faster initial page loads, better SEO for public pages, simpler data fetching pattern with RSC. Negative: Steeper learning curve for developers new to React Server Components, tighter coupling to Next.js rendering model, migration harder if switching frameworks later.
