---
name: caching-strategies
description: Cache-aside, write-through, write-behind patterns, TTL management, cache stampede prevention, HTTP caching headers, CDN caching with versioned assets, cache key design, and hit-rate monitoring. Use when optimizing read performance, designing cache layers, setting up Redis, configuring HTTP caching, or auditing static asset delivery.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling, backend-patterns, api-design
---

# Caching Strategies

Proven caching patterns with mandatory TTLs, stampede prevention, and proper HTTP/CDN caching headers.

## Core rules

1. **Cache-aside (lazy loading)** — The most common caching pattern. On read: check cache for the key. If found (cache hit), return the cached value. If not found (cache miss), load the data from the database, store it in cache with a TTL, then return it. On write: invalidate the cache key (or update it, if the data is simple). Works well for read-heavy workloads. TTL ensures eventual consistency.

2. **Write-through** — On write: write the data to the cache AND to the database in the same transaction/session. The cache is always consistent with the database (strong consistency at write time). Trade-off: writes are slower because both operations must complete before responding. Use when consistency is critical and data is frequently read after write.

3. **Write-behind (write-back)** — On write: write to the cache first and respond to the client immediately. The database write happens asynchronously in a background process. Trade-off: writes are very fast but if the cache fails before the DB write completes, data is lost. Use for high-volume write workloads where eventual consistency is acceptable. Always include a write-ahead log or queue.

4. **TTL is mandatory for every cached item** — Every cache entry must have a TTL (Time To Live). No TTL = stale data that lives forever. TTL values: short (30s–5m) for frequently changing dynamic data, medium (5m–1h) for moderately changing data, long (1h–24h) for reference data. The TTL is the defense against stale data — tune it, don't remove it.

5. **Cache invalidation is hard — prefer TTL-based expiration** — Explicit cache invalidation (removing entries when data changes) is error-prone. Where possible, use TTL-based expiration and accept minutes-old data. If you must invalidate explicitly, use a message bus event: when data changes, publish an event and have cache consumers invalidate their relevant keys.

6. **Cache stampede prevention** — When a popular cached item expires and multiple concurrent requests all see a cache miss, they all try to reload from the database simultaneously — a stampede that can overwhelm the database. Prevention strategies: (a) **Probabilistic early expiration**: randomly refresh at ~80% of TTL. (b) **Mutex/locking**: only one request reloads the cache; others wait (SET NX). (c) **Stale-while-revalidate**: serve stale value and refresh in background. Choose (a) for most cases.

7. **HTTP caching headers** — Every HTTP response must include appropriate caching headers. **Cache-Control**: use `max-age=<seconds>` for freshness, `s-maxage=<seconds>` for shared caches, `private` for user-specific responses, `public` for shared responses, `no-cache` for revalidation, `no-store` for sensitive data. **ETag/If-None-Match**: server returns an entity tag; client revalidates; server returns 304 Not Modified if unchanged.

8. **CDN caching for static assets** — Static assets (JS bundles, CSS, images, fonts, videos) are served via CDN with aggressive caching. Use versioned filenames (content hash in filename: `app.a3b8c9.js`) so deploying a new version produces a new URL. Set `Cache-Control: public, max-age=31536000, immutable` (1 year). Never use query-string-based versioning (`?v=1`) — CDNs and proxies treat query strings as separate URLs.

9. **Cache key design** — Every cache key must include: the resource type/name, the identifier, and any dimensions that affect the cached value (locale, version, user role, filters). Key format: `{service}:{resource}:{id}:{dimensions}` (e.g., `catalog:product:12345:en_US:v2`). Use a consistent separator (`:`). Avoid keys that grow unbounded — dimension values must be from a finite set.

10. **Monitor cache hit rate** — Every caching layer must expose a cache hit rate metric. Target: hit rate > 80%. Below 80%, the cache is not providing meaningful benefit. Debug by checking: (a) are keys being evicted before reuse? (b) Are keys correctly constructed? (c) Are there cache misses for the same keys? (d) Is the cache large enough? Metric: `cache_hits_total` and `cache_misses_total` with key prefix labels.

## Procedures

1. **Identify caching candidates** — Profile the application to find the most expensive queries or API calls (high latency, high frequency, repeated identical queries). Priority: read-heavy endpoints, frequently accessed reference data, computed/aggregate results.

2. **Choose the cache type** — Local in-memory cache for single-instance services (fastest, limited to one machine). Distributed cache (Redis/Memcached) for multi-instance services (consistent across instances, survives restarts). HTTP/CDN cache for public, cacheable responses.

3. **Select the cache pattern** — Cache-aside for most read-heavy endpoints (simple, works well). Write-through for data that must be immediately consistent after write. Write-behind for high-volume write workloads with acceptable staleness.

4. **Set TTL for each cached item** — Determine the maximum staleness you can tolerate. Set TTL equal to that window (e.g., 5-minute staleness → 5-minute TTL). The jitter (±20% random) serves as the expiration buffer. Add jitter to TTL to prevent mass expiration of popular keys.

5. **Implement cache with stampede prevention** — Wrap the cache-aside logic with probabilistic early expiration (refresh at 80% TTL ± jitter). Use a mutex lock for the first-few-misses scenario. Document the stampede protection strategy.

6. **Design cache keys** — Define key format per cached resource. Include resource type, ID, and variation dimensions. Write key construction as a named function (not inline string concatenation). Add key format documentation to the codebase.

7. **Add HTTP caching headers** — For every API response, set Cache-Control and ETag (or Last-Modified). For static assets: set `immutable` + 1-year max-age with versioned filenames. For API responses: set `max-age=0, s-maxage=<seconds>` for CDN cache, `private` for user-specific data.

8. **Set up CDN caching** — Configure CDN (CloudFront, CloudFlare, Fastly) with cache behavior matching your Cache-Control headers. Enable automatic cache invalidation on deploy (if using non-versioned URLs). For versioned URLs: no invalidation needed.

9. **Add cache metrics** — Instrument the cache layer to emit: `cache_hits_total` (with key prefix label), `cache_misses_total`, `cache_evictions_total`, `cache_size_current`. Create a Grafana dashboard panel tracking hit rate over time (target: >80% line).

10. **Test cache behavior** — Write integration tests that verify: cache hit returns cached data, cache miss populates cache, TTL expiration evicts the entry, cache key differences produce different cached values, write-through updates both cache and DB, write-invalidation removes the correct keys.

## Gotchas

- **Cache invalidation is famously one of the two hard things in CS** (with naming and off-by-one errors). TTL-based expiry avoids explicit invalidation for most cases. If you need explicit invalidation, use event-driven (publish invalidate events) rather than inline invalidation calls.
- **Cache stampede with popular items** — A single popular key expiring can cause 10,000 simultaneous requests to hit the database. Probabilistic early expiration prevents this. Never deploy cache-aside without stampede protection.
- **Stale reads from eventual consistency** — In distributed systems, cache-aside guarantees eventual consistency, not strong consistency. If a user writes data and immediately reads it back, they may get the stale cached value. Use write-through for this case.
- **Redis memory eviction policy matters** — The default policy `noeviction` returns errors on writes when memory is full. Common production policies: `allkeys-lru` (evict least-recently-used) or `volatile-ttl` (evict keys with shortest TTL). Match policy to your use case.
- **Monitoring cache hit rate is the #1 most overlooked step** — Teams implement caching, see initial speedup, and never check whether the cache is still effective 3 months later. A cron or dashboard alert for "cache hit rate < 80%" prevents silent degradation.

## References

| File | Load when |
|------|-----------|
| `references/redis-patterns.md` | Implementing Redis-based caching |
| `references/http-caching.md` | Configuring HTTP caching headers |
| `references/cdn-strategies.txt` | Setting up CDN caching for static assets |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Optimizing read performance | caching-strategies + backend-patterns + api-design |
| API response caching (HTTP/CDN) | caching-strategies + api-design |
| Cache invalidation design | caching-strategies + database-migrations + error-handling |
| Redis cache setup | caching-strategies + backend-patterns |
| Static asset performance audit | caching-strategies + frontend-patterns |

## Checklist

- [ ] Cache pattern selected per use case: cache-aside (read-heavy), write-through (consistency), write-behind (write-heavy)
- [ ] TTL set on every cached item (no TTL-less cache entries)
- [ ] Cache stampede prevention in place (probabilistic early expiration, mutex, or stale-while-revalidate)
- [ ] HTTP caching headers present on every response (Cache-Control, ETag or Last-Modified)
- [ ] CDN caching configured with versioned filenames and immutable directive for static assets
- [ ] Cache keys use consistent format with bounded dimensions, documented in API spec
- [ ] Cache hit rate (target >80%) is instrumented and monitored
- [ ] Write-through or explicit invalidation used for read-your-writes consistency (if needed)
- [ ] Redis eviction policy configured correctly for the use case (allkeys-lru / volatile-ttl)
- [ ] Integration tests verify cache hit, cache miss, TTL expiry, and write-invalidation behavior
