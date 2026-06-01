# HTTP Caching Patterns

HTTP caching reduces server load and improves client response times by reusing previously fetched responses. Proper Cache-Control headers, ETags, and conditional requests enable browser, proxy, and CDN caching with zero additional infrastructure.

## Core patterns

**Cache-Control directives** — Every HTTP response must include a Cache-Control header:

| Directive | Meaning | When to use |
|-----------|---------|-------------|
| `public` | May be cached by any cache (browser, proxy, CDN) | Non-user-specific content |
| `private` | May be cached only by the browser | User-specific content (profile, dashboard) |
| `no-cache` | Must revalidate with origin before serving | Content that changes frequently, still cacheable with ETag |
| `no-store` | Never cached at all | Sensitive data (auth tokens, payment details) |
| `max-age=<seconds>` | Maximum time the response is considered fresh | General freshness control |
| `s-maxage=<seconds>` | Overrides max-age for shared caches (CDN, proxy) | Different cache durations for CDN vs browser |
| `immutable` | Response body won't change during freshness lifetime | Versioned static assets |
| `stale-while-revalidate=<seconds>` | Serve stale content while refreshing in background | Graceful degradation for slow updates |
| `stale-if-error=<seconds>` | Serve stale content if origin returns an error | Graceful degradation during outages |

**ETag generation** — Generate an entity tag from the response body or content hash:

```javascript
const express = require('express');
const crypto = require('crypto');

app.get('/api/products/:id', async (req, res) => {
  const product = await db.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  const body = JSON.stringify(product);

  // Generate ETag from content hash
  const etag = crypto.createHash('md5').update(body).digest('hex');
  res.set('ETag', `"${etag}"`);

  // Check if client's ETag matches
  if (req.headers['if-none-match'] === `"${etag}"`) {
    return res.status(304).end(); // Not Modified
  }

  // Set caching headers
  // Public: anyone can cache; s-maxage: CDN caches for 60s; max-age: browser caches for 30s
  res.set('Cache-Control', 'public, max-age=30, s-maxage=60');
  res.json(product);
});
```

**Python FastAPI with ETag:**
```python
from fastapi import FastAPI, Request, Response
import hashlib

@app.get("/api/products/{product_id}")
async def get_product(product_id: str, request: Request):
    product = await db.fetch("SELECT * FROM products WHERE id = $1", product_id)
    body = product.json()
    etag = hashlib.md5(body.encode()).hexdigest()

    if request.headers.get("if-none-match") == f'"{etag}"':
        return Response(status_code=304)

    return Response(
        content=body,
        headers={
            "ETag": f'"{etag}"',
            "Cache-Control": "public, max-age=30, s-maxage=60",
        }
    )
```

**Go with Chi:**
```go
import (
    "crypto/md5"
    "fmt"
    "net/http"
)

func GetProduct(w http.ResponseWriter, r *http.Request) {
    product := fetchProduct(r.Context(), chi.URLParam(r, "id"))
    body, _ := json.Marshal(product)
    etag := fmt.Sprintf(`"%x"`, md5.Sum(body))

    if r.Header.Get("If-None-Match") == etag {
        w.WriteHeader(http.StatusNotModified)
        return
    }

    w.Header().Set("ETag", etag)
    w.Header().Set("Cache-Control", "public, max-age=30, s-maxage=60")
    w.Write(body)
}
```

**Conditional requests with If-Modified-Since:**
```javascript
app.get('/api/products/:id', async (req, res) => {
  const product = await db.query('SELECT *, updated_at FROM products WHERE id = $1', [req.params.id]);
  const lastModified = product.updated_at;

  // Check If-Modified-Since
  if (req.headers['if-modified-since']) {
    const since = new Date(req.headers['if-modified-since']);
    if (lastModified <= since) {
      return res.status(304).end();
    }
  }

  res.set('Last-Modified', lastModified.toUTCString());
  res.set('Cache-Control', 'public, max-age=30');
  res.json(product);
});
```

**Vary header** — Differentiate cache keys based on request headers:

```javascript
// Cache varies by Accept-Encoding and Authorization
res.set('Vary', 'Accept-Encoding, Authorization');
// Cache varies by Accept-Language for localized content
res.set('Vary', 'Accept-Language');
```

## Configuration

**Per-endpoint caching policy table:**

| Endpoint | Cache-Control | ETag | Vary | Notes |
|----------|---------------|------|------|-------|
| `GET /api/products/:id` | `public, max-age=30, s-maxage=60` | Content hash | Accept-Encoding | Product data, short TTL |
| `GET /api/users/me` | `private, max-age=300` | User version | Authorization | User profile, browser-only |
| `GET /api/search` | `public, max-age=10, s-maxage=30` | Content hash | Accept-Encoding | Search results, very short TTL |
| `GET /static/js/app.*.js` | `public, max-age=31536000, immutable` | Built-in filename hash | Accept-Encoding | Versioned, permanent cache |
| `POST /api/orders` | `no-store` | None | None | Mutating, no caching |

**Nginx reverse proxy caching:**
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;
proxy_cache_key "$scheme$request_method$host$request_uri";

server {
  location /api/ {
    proxy_pass http://backend;
    proxy_cache api_cache;
    proxy_cache_valid 200 60s;
    proxy_cache_use_stale error timeout updating;
    add_header X-Cache-Status $upstream_cache_status;
  }
}
```

**Varnish VCL:**
```vcl
sub vcl_recv {
  if (req.url ~ "^/api/products/") {
    set req.http.X-Cache-TTL = "60s";
    return (hash);
  }
}

sub vcl_backend_response {
  if (beresp.http.X-Cache-TTL) {
    set beresp.ttl = std.duration(beresp.http.X-Cache-TTL, 60s);
  }
}
```

**Service Worker caching strategies:**

```javascript
// Cache First — serve from cache, update in background
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.put(event.request, response.clone());
        return response;
      });
      return cached || fetchPromise;
    })
  );
});

// Network First — try network, fall back to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Stale While Revalidate
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        caches.put(event.request, response.clone());
        return response;
      });
      return cached || fetchPromise;
    })
  );
});
```

## Common pitfalls

- **Missing Cache-Control header** — Without Cache-Control, browsers and proxies may cache responses arbitrarily. Always explicitly set Cache-Control on every response. Default for no header varies by HTTP/1.1 spec (sometimes "don't cache", sometimes heuristic caching).
- **Clustered ETags** — Multiple server instances must generate the same ETag for the same content. Use content-based hashing (MD5/SHA of response body), not instance-specific values like `process.hrtime()` or random UUIDs.
- **Vary: \*** — Using `Vary: *` tells caches to never reuse cached responses because the cache key includes everything. Be specific about which headers affect the response.
- **no-store vs public CDN** — Using `Cache-Control: no-store` on CDN-cached content prevents any caching. If you want CDN caching but not browser caching, use `Cache-Control: public, s-maxage=60, max-age=0`.
- **Caching authenticated content** — User-specific API responses must use `Cache-Control: private` to prevent shared caches (CDNs, proxies) from serving one user's data to another. Only the browser should cache private content.

## Monitoring

Check cache effectiveness with response headers and origin metrics:

- **Age header** — `Age: 123` shows how many seconds the response has been in a cache. High Age values indicate good cache hits.
- **X-Cache header** — CDNs like CloudFront return `X-Cache: Hit from cloudfront` or `Miss from cloudfront`. Monitor hit/miss ratio.
- **cf-cache-status** — CloudFlare returns `HIT`, `MISS`, `DYNAMIC`, `EXPIRED`, `REVALIDATED`. Track HIT/(HIT+MISS) ratio.
- **Origin fetch rate** — Monitor requests-per-second to your origin servers. A decreasing trend with steady user traffic indicates effective caching.
- **Cache Control Stats** — Log the ratio of `Cache-Control: public` vs `private` vs `no-store` responses to identify endpoints missing caching headers.
