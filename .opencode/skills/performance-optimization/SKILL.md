---
name: performance-optimization
description: Performance optimization patterns — profiling, bottleneck detection, memory optimization, CPU optimization, I/O optimization, database query optimization, lazy loading, and performance budgets. Use when profiling slow code, optimizing critical paths, or establishing performance budgets.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: coding-standards, backend-patterns, frontend-patterns, database-migrations
---

# Performance Optimization

Profiling, bottleneck detection, and targeted optimization strategies for web applications and services.

## Core rules

1. **Measure before optimizing** — Profile first. Establish a baseline before any change. Compare after every optimization. If improvement is <10%, revert the change.
2. **Performance budget** — Maximum 2.5s Largest Contentful Paint (LCP) load, 200KB JS gzipped, 200ms p95 API latency. CI pipeline fails if budgets are exceeded.
3. **Database query optimization** — Run EXPLAIN ANALYZE on every new query. Never use SELECT *. Always apply LIMIT. Use composite indexes for multi-column filters.
4. **N+1 detection** — Enable query logging in development. Batch-load related data with JOINs, eager loading, or DataLoader. Never fetch in loops.
5. **Memory optimization** — Fix leaks: unsubscribed listeners, detached DOM nodes, stale closures. Use WeakMap/WeakRef for caches. Apply size limits with LRU/LFU eviction policy.
6. **CPU optimization** — Profile hot paths. Eliminate O(n²) algorithms in request-path. Offload heavy computation to worker threads. Throttle/debounce UI event handlers.
7. **I/O optimization** — Batch small I/O operations. Use connection pooling (10-20 connections). Prefer async I/O. Stream large payloads. Enable keep-alive.
8. **Lazy loading** — Route-based code splitting. IntersectionObserver for images and components. Lazy-load below-the-fold content. Defer non-critical JavaScript with `defer` or `type="module"`.
9. **Bundle optimization** — Tree-shaking enabled. Vendor/app code separation. Brotli compression at CDN layer. Dead code elimination via build tool. Regular bundle audit.
10. **CDN and edge caching** — Static assets on CDN with cache hashing. API responses cached at edge with TTL. Cache-Control, ETag, Last-Modified headers set correctly. Invalidation strategy defined.

## Procedures

1. Identify the issue or establish a baseline performance metric.
2. Profile using appropriate tools: Lighthouse, DevTools Performance tab, pprof, EXPLAIN ANALYZE.
3. Analyze the profile and categorize the bottleneck as CPU, memory, I/O, database, rendering, or bundle size.
4. Select the highest-impact bottleneck and apply a targeted fix.
5. Re-profile under identical conditions and compare against baseline.
6. If improvement is <10%, revert the change. If ≥10%, commit with before/after metrics in the description.
7. Update the performance budget configuration file if thresholds changed.
8. Add or update performance tests (Lighthouse CI thresholds, k6 load tests).
9. Document: what was slow, what changed, and what improved (include metrics).
10. Review for regressions across related features and environments.

## Gotchas

- Premature optimization without profiling creates complexity with zero measurable benefit.
- Optimizing the wrong bottleneck — a 50% improvement to a 1ms function is worthless if users wait 3s elsewhere.
- Micro-optimizations that hurt code maintainability and readability.
- Caching without an invalidation strategy leads to stale data and subtle bugs.
- Over-engineering before measuring — always start with the simplest fix.

## References

| File | Load when |
|------|-----------|
| `references/web-vitals.md` | Debugging LCP, FID/INP, CLS, or TTFB |
| `references/db-query-opt.md` | Interpreting EXPLAIN ANALYZE, choosing indexes, fixing N+1 |
| `references/profiling-tools.txt` | Setting up browser, Node.js, Python, Go, or universal profilers |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Profiling slow page load | performance-optimization + frontend-patterns |
| Optimizing API response time | performance-optimization + backend-patterns + api-design |
| Database query bottleneck | performance-optimization + database-migrations |
| Reducing bundle size | performance-optimization + coding-standards |
| Reviewing performance PR | performance-optimization + coding-standards + backend-patterns |

## Checklist

- [ ] Baseline profiled before optimization
- [ ] Performance budgets defined (3s load, 200KB bundle, 200ms p95 API)
- [ ] DB queries: EXPLAIN ANALYZE reviewed, SELECT * absent, pagination applied
- [ ] N+1 queries detected and fixed
- [ ] Memory: no leaks, caches have size limits + eviction
- [ ] CPU: hot paths profiled, O(n²) eliminated, workers for heavy tasks
- [ ] I/O: batched, connection pooling, async I/O
- [ ] Lazy loading: route-based splitting, lazy images, deferred non-critical JS
- [ ] Bundle: tree-shaking, minified, compressed, dead code removed
- [ ] CDN/edge caching: static assets on CDN, API cached with TTL, invalidation strategy
