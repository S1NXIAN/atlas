# Database Query Optimization Reference

## EXPLAIN ANALYZE Interpretation

Run `EXPLAIN ANALYZE <query>` (PostgreSQL) or `EXPLAIN ANALYZE <query>` (MySQL 8+) to see the actual execution plan.

### Key terms

| Term | Meaning |
|------|---------|
| **Seq Scan** | Sequential table scan — reads every row. Bad for large tables without filter. |
| **Index Scan** | Scans an index, then fetches rows from heap. Good selectivity. |
| **Index Only Scan** | All needed columns in the index — no heap fetch. Optimal. |
| **Bitmap Index Scan** | Index produces a bitmap, then fetches pages. Used for multiple conditions. |
| **cost=** | Start-up cost..total cost. Arbitrary units, useful for relative comparison. |
| **rows=** | Estimated rows (EXPLAIN) vs actual rows (EXPLAIN ANALYZE). |
| **width=** | Average row width in bytes. |
| **actual time=** | Actual execution time for that node (ms). |
| **loops=** | How many times the node executed. High loops + small rows is an N+1 flag. |

### Red flags
- **Seq Scan on a table >10K rows** with a WHERE clause — missing index.
- **Rows estimate >> actual rows** — stale statistics, run `ANALYZE`.
- **Nested Loop with high loops** — potential N+1.
- **Sort (external) with high memory** — missing index for ORDER BY.

---

## Index Types

| Type | Best for | Notes |
|------|----------|-------|
| **B-tree** (default) | Equality and range queries, ORDER BY, UNIQUE constraints | Works for most use cases |
| **Hash** | Equality lookups only | Not for ranges or ordering. Less useful than B-tree in most engines |
| **GIN** | Full-text search, arrays, JSONB, trigrams | Good for "contains" queries on composite types |
| **GiST** | Geometric data, full-text search (ranking), range types | Supports nearest-neighbor |
| **BRIN** | Huge tables with naturally ordered data (logs, timeseries) | Much smaller than B-tree. Only if data is physically clustered |

### Creating indexes
```sql
-- B-tree
CREATE INDEX idx_users_email ON users (email);

-- Composite B-tree
CREATE INDEX idx_orders_user_created ON orders (user_id, created_at);

-- Partial index
CREATE INDEX idx_active_users ON users (email) WHERE status = 'active';

-- Concurrent build (no table lock)
CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);

-- GIN for JSONB
CREATE INDEX idx_metadata ON documents USING GIN (metadata jsonb_path_ops);

-- BRIN for time-series
CREATE INDEX idx_logs_created ON logs USING BRIN (created_at) WITH (pages_per_range = 32);
```

---

## Composite Index Column Order

Rules for ordering columns in a composite index:

1. **Equality conditions first** — columns used with `=` or `IN`.
2. **High cardinality first** — more selective columns reduce scan range.
3. **Range conditions last** — `>`, `<`, `BETWEEN`, `LIKE` (prefix).

```sql
-- Query: WHERE status = 'active' AND category = 'premium' ORDER BY created_at DESC

-- Good: equality (high cardinality) → equality → range/sort
CREATE INDEX idx_orders_cat_status_created
  ON orders (category, status, created_at DESC);

-- Bad: low cardinality first, range mixed in
CREATE INDEX idx_orders_status_created_cat
  ON orders (status, created_at DESC, category);
```

### Indexing for ORDER BY
- B-tree index can satisfy ORDER BY if the leading index column matches the sort column.
- `DESC` in index definition avoids reverse scan overhead.

```sql
-- Supports: ORDER BY created_at DESC
-- Does NOT support: ORDER BY created_at ASC
CREATE INDEX idx_created_desc ON orders (created_at DESC);
```

---

## Query Rewriting

### Avoid functions in WHERE clauses

```sql
-- Bad: function on column prevents index usage
SELECT * FROM orders WHERE EXTRACT(YEAR FROM created_at) = 2024;

-- Good: range query uses index
SELECT * FROM orders
WHERE created_at >= '2024-01-01' AND created_at < '2025-01-01';
```

### OR → UNION/IN rewrite

```sql
-- Bad: OR often prevents index merge
SELECT * FROM orders WHERE status = 'pending' OR status = 'processing';

-- Good: IN is index-friendly
SELECT * FROM orders WHERE status IN ('pending', 'processing');
```

### Keyset pagination (cursor-based)

```sql
-- Bad: OFFSET scans all skipped rows
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 100000;

-- Good: keyset pagination uses index
SELECT * FROM orders
WHERE id > 100000
ORDER BY id
LIMIT 20;
```

### Avoid redundant columns

```sql
-- Bad: SELECT * fetches unnecessary data
SELECT * FROM users WHERE email = 'test@example.com';

-- Good: SELECT only needed columns
SELECT id, name, email FROM users WHERE email = 'test@example.com';
```

---

## N+1 Detection

### What is N+1
A query executes once for the parent entity (1) and then N times for each child (N), instead of a single JOIN.

### Detection strategies

**PostgreSQL:**
```sql
-- Enable query logging for slow queries
SET log_min_duration_statement = 200;  -- log queries >200ms
SET log_duration = on;

-- Find repeated similar queries in logs
SELECT query, calls, total_time / calls AS avg_time
FROM pg_stat_statements
WHERE query ILIKE '%WHERE user_id%'
ORDER BY calls DESC;
```

**MySQL:**
```sql
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 0.2;
SET GLOBAL log_queries_not_using_indexes = ON;
```

**Application-level (Node.js example):**
```javascript
// Bad: N+1
const users = await db.query('SELECT * FROM users');
for (const user of users) {
  const posts = await db.query('SELECT * FROM posts WHERE user_id = $1', [user.id]);
}

// Good: batch with JOIN
const usersWithPosts = await db.query(`
  SELECT u.*, p.id as post_id, p.title as post_title
  FROM users u
  LEFT JOIN posts p ON p.user_id = u.id
  WHERE u.id = ANY($1)
`, [userIds]);
```

**Dataloader pattern:**
```javascript
const DataLoader = require('dataloader');

const userLoader = new DataLoader(async (ids) => {
  const users = await db.query('SELECT * FROM users WHERE id = ANY($1)', [ids]);
  return ids.map(id => users.find(u => u.id === id));
});

// Each .load() call is batched into one query per event-loop tick
const user = await userLoader.load(userId);
```

---

## Connection Pooling

### Why
Creating a new database connection per request is expensive. Pooling reuses connections.

### Pool size formula
```
pool_size = (2 × number_of_cores) + 1
```

Example: 8-core server → pool of 17 connections. For write-heavy workloads, consider separate read/write pools.

### PgBouncer (PostgreSQL connection pooler)

```
# pgbouncer.ini
[databases]
mydb = host=127.0.0.1 port=5432 dbname=mydb

[pgbouncer]
listen_addr = 127.0.0.1
listen_port = 6432
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt
pool_mode = transaction      # transaction-level pooling
default_pool_size = 25
max_client_conn = 100
```

### Application-level pool (Node.js example)
```javascript
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Always release or use pool.query() which auto-releases
const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
```

### Pool tuning checklist
- [ ] Pool size follows 2×cores+1 formula.
- [ ] Connection timeout set to avoid hung requests.
- [ ] Idle timeout set to free unused connections during low traffic.
- [ ] Separate read pool for read replicas (if applicable).
- [ ] Transaction pooling mode (PgBouncer) for web applications.
- [ ] Monitor `pool.waitCount` — if >0, pool is exhausted.
