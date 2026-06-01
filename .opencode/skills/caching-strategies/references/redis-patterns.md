# Redis Caching Patterns

Redis is a high-performance in-memory data store commonly used as a distributed cache. Its rich data structures and atomic operations make it ideal for cache-aside, write-through, and write-behind patterns with TTL-based expiration and stampede prevention.

## Core patterns

**Cache-aside with GET/SETEX/DEL** — The standard lazy-loading pattern. On read miss, load from DB, store with TTL, return. On write, delete the cache key.

```javascript
// Node.js with ioredis
async function getProduct(productId) {
  const key = `catalog:product:${productId}`;
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached); // cache hit

  // cache miss: load from DB
  const product = await db.query('SELECT * FROM products WHERE id = $1', [productId]);
  if (!product) return null;

  // store in cache with TTL
  await redis.setex(key, 300, JSON.stringify(product)); // TTL: 5 minutes
  return product;
}

async function updateProduct(productId, data) {
  const product = await db.query('UPDATE products SET ... WHERE id = $1 RETURNING *', [productId, data]);
  // invalidate cache
  await redis.del(`catalog:product:${productId}`);
  return product;
}
```

```python
# Python with redis-py
async def get_product(product_id: str):
    key = f"catalog:product:{product_id}"
    cached = await redis.get(key)
    if cached:
        return json.loads(cached)

    product = await db.fetch("SELECT * FROM products WHERE id = $1", product_id)
    if not product:
        return None

    await redis.setex(key, 300, json.dumps(product))
    return product
```

```go
// Go with go-redis
func (r *RedisCache) GetProduct(ctx context.Context, productID string) (*Product, error) {
    key := fmt.Sprintf("catalog:product:%s", productID)
    cached, err := r.client.Get(ctx, key).Bytes()
    if err == nil {
        var p Product
        json.Unmarshal(cached, &p)
        return &p, nil
    }

    var p Product
    if err := r.db.QueryRow(ctx, "SELECT * FROM products WHERE id = $1", productID).Scan(&p); err != nil {
        return nil, err
    }

    data, _ := json.Marshal(p)
    r.client.SetEx(ctx, key, data, 300*time.Second)
    return &p, nil
}
```

**Write-through with SET + DB transaction** — Write to cache and database in a single logical operation:

```javascript
async function writeThrough(productId, data) {
  // Use a pipeline to reduce round trips
  const pipeline = redis.pipeline();
  pipeline.set(`catalog:product:${productId}`, JSON.stringify(data));
  pipeline.set(`catalog:product:${productId}:version`, Date.now());

  const [cacheResult, dbResult] = await Promise.all([
    pipeline.exec(),
    db.query('UPDATE products SET ... WHERE id = $1 RETURNING *', [productId, data]),
  ]);

  return dbResult.rows[0];
}
```

**Write-behind with Redis list as write-ahead log** — Fast writes by logging to Redis first, then asynchronously persisting to DB:

```javascript
// Write path — fast, just LPUSH to WAL
async function writeBehind(order) {
  await redis.lpush('wal:orders', JSON.stringify(order));
  return { status: 'accepted', orderId: order.id };
}

// Background worker — batch process the WAL
async function processWAL() {
  while (true) {
    const entry = await redis.rpop('wal:orders');
    if (!entry) { await sleep(100); continue; }
    try {
      await db.query('INSERT INTO orders ...', [JSON.parse(entry)]);
    } catch (err) {
      // Push to dead letter queue if persistent failure
      await redis.lpush('dlq:orders', entry);
    }
  }
}
```

**Probabilistic early expiration** — Prevent stampedes by randomly refreshing before TTL expires:

```javascript
async function getWithProbabilisticExpiry(key, ttlSeconds, loadFn) {
  const cached = await redis.get(key);
  if (!cached) {
    // Cache miss — load fresh
    const data = await loadFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  }

  // Probabilistic early expiration
  const ttl = await redis.ttl(key);
  const chance = 1 - (ttl / ttlSeconds);
  // Refresh if >80% of TTL consumed AND random chance
  if (chance > 0.8 && Math.random() < 0.5) {
    const fresh = await loadFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(fresh));
    return fresh;
  }

  return JSON.parse(cached);
}
```

**Distributed mutex with SET NX EX** — Prevent stampede for the first concurrent miss:

```javascript
async function getWithMutex(key, ttlSeconds, loadFn) {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  // Try to acquire lock (SET NX EX <lock-ttl>)
  const lockKey = `lock:${key}`;
  const lockAcquired = await redis.set(lockKey, process.pid, 'NX', 'EX', 5);
  if (!lockAcquired) {
    // Someone else is loading — wait briefly and retry
    await sleep(50);
    return getWithMutex(key, ttlSeconds, loadFn);
  }

  try {
    const data = await loadFn();
    await redis.setex(key, ttlSeconds, JSON.stringify(data));
    return data;
  } finally {
    await redis.del(lockKey);
  }
}
```

**Cache key construction with colons** — Redis conventionally uses `:` as separator:

```
{service}:{resource}:{id}:{dimensions}
catalog:product:12345:en_US
catalog:product:12345:en_US:v2
session:user:42
rate:limit:user:42:api:v1
```

**Hash data structures for object caching** — Use HSET/HGETALL for caching objects with field-level access:

```javascript
// Store as hash
await redis.hset(`product:${id}`, {
  name: product.name,
  price: product.price.toString(),
  stock: product.stock.toString(),
});
await redis.expire(`product:${id}`, 300);

// Retrieve all fields
const cached = await redis.hgetall(`product:${id}`);

// Retrieve single field
const name = await redis.hget(`product:${id}`, 'name');
```

## Configuration

**Eviction policy** — Configure via `maxmemory-policy` in redis.conf:

| Policy | Behavior | When to use |
|--------|----------|-------------|
| `allkeys-lru` | Evict least-recently-used keys from all keys | General-purpose cache with mixed TTL/no-TTL keys |
| `volatile-ttl` | Evict keys with shortest TTL first | All keys have TTLs, evict soon-to-expire keys |
| `volatile-lru` | Evict LRU keys that have TTL set | Mix of cached and persistent keys |
| `allkeys-lfu` | Evict least-frequently-used keys | When access frequency varies significantly |
| `noeviction` | Return OOM error on writes | Persistent data that must never be evicted |

**Recommended settings:**
```
maxmemory 4gb
maxmemory-policy allkeys-lru
```

**Persistence:** Use RDB (point-in-time snapshots) for cache recovery after restart. Append-only file (AOF) is unnecessary for a cache — data can be re-fetched from the source.

**Connection pooling:** Configure pool size to match expected concurrent requests (typically 50-100 connections per application instance).

## Common pitfalls

- **Eviction policy mismatch** — Using `noeviction` for a cache causes write failures when memory is full. For caches, use `allkeys-lru` or `volatile-ttl`.
- **HOT keys** — A single key receiving disproportionate traffic (e.g., a celebrity's profile). Mitigate with local cache in front of Redis or shard the key across multiple Redis nodes.
- **KEYS command in production** — `KEYS *` blocks Redis for large key spaces. Use `SCAN 0 MATCH pattern` instead for key pattern matching.
- **Pipeline vs transaction** — Pipelines are non-atomic (faster). Transactions (`MULTI`/`EXEC`) are atomic (slower). Choose based on whether you need atomicity.
- **BLPOP blocking in worker pools** — `BLPOP` blocks a connection until data is available. With connection pooling, this can exhaust the pool. Use `RPOP` with polling instead, or dedicate specific connections for blocking operations.

## Monitoring

Use the Redis `INFO` command to track cache effectiveness:

```
# Cache hit/miss ratio
info stats: keyspace_hits_total, keyspace_misses_total
# Hit rate = hits / (hits + misses)

# Eviction rate
info stats: evicted_keys_total

# Memory usage
info memory: used_memory, maxmemory

# Expired keys
info stats: expired_keys_total
```

Monitor these metrics in Grafana and alert if hit rate drops below 80% or eviction rate spikes above baseline. Use key prefix labels to identify which cache regions are underperforming.
