# Core Web Vitals Reference

## Overview

Core Web Vitals are Google's set of real-world metrics for user experience. They measure loading, interactivity, and visual stability.

| Metric | Good | Needs Improvement | Poor | Description |
|--------|------|-------------------|------|-------------|
| **LCP** (Largest Contentful Paint) | ≤2.5s | 2.5s–4.0s | >4.0s | Loading — perceived load speed |
| **FID** (First Input Delay) | ≤100ms | 100ms–300ms | >300ms | Interactivity — first input responsiveness |
| **INP** (Interaction to Next Paint) | ≤200ms | 200ms–500ms | >500ms | Interactivity — overall responsiveness (replaces FID) |
| **CLS** (Cumulative Layout Shift) | ≤0.1 | 0.1–0.25 | >0.25 | Visual stability — unexpected layout shifts |
| **TTFB** (Time to First Byte) | ≤800ms | 800ms–1800ms | >1800ms | Network — server response time |

Note: INP replaced FID as a Core Web Vital in March 2024. Both thresholds are shown above.

---

## LCP — Largest Contentful Paint

### What it measures
Time from navigation start until the largest visible element (image, video, text block) is rendered.

### Common causes of poor LCP
- Slow server response times (high TTFB)
- Render-blocking CSS and JavaScript
- Slow resource load times (images, hero images)
- Client-side rendering without SSR

### Measurement
```javascript
// Using web-vitals library
import { onLCP } from 'web-vitals';
onLCP(console.log);
```
- Lighthouse: Performance audit → LCP section
- Chrome DevTools: Performance panel → Timings

### Fixes
1. Improve TTFB — optimize server, use CDN, warm caches.
2. Preload hero image: `<link rel="preload" as="image" href="hero.webp">`.
3. Defer non-critical CSS and JS.
4. Use SSR/SSG for content-heavy pages.
5. Compress and optimally size images (WebP/AVIF, responsive srcset).
6. Eliminate render-blocking resources — inline critical CSS.

---

## FID / INP — First Input Delay / Interaction to Next Paint

### What they measure
FID: Time from first user interaction to when the browser can process the event handler.
INP: Latency of all interactions, reporting the worst one.

### Common causes of poor FID/INP
- Long tasks (>50ms) blocking the main thread
- Heavy JavaScript execution (parsing, compiling, executing)
- Large bundle sizes loaded on interaction
- Complex event handlers doing too much work

### Measurement
```javascript
import { onFID, onINP } from 'web-vitals';
onFID(console.log);
onINP(console.log);
```

### Fixes
1. Break up long tasks with `setTimeout()` or `scheduler.yield()`.
2. Use Web Workers for heavy computation.
3. Lazy-load non-essential JavaScript.
4. Debounce/throttle frequent event handlers (scroll, resize).
5. Split monolithic event handlers into smaller chunks.
6. Use `requestAnimationFrame` for visual updates.

---

## CLS — Cumulative Layout Shift

### What it measures
Sum of all unexpected layout shifts during the page's lifetime. Shifts caused by visible elements changing position.

### Common causes of poor CLS
- Images/videos without explicit dimensions
- Dynamically injected content (ads, embeds, banners)
- Late-loading fonts (FOUT/FOIT)
- DOM mutations triggered after user interaction

### Measurement
```javascript
import { onCLS } from 'web-vitals';
onCLS(console.log);
```

### Fixes
1. Always set `width` and `height` attributes on images and videos.
2. Use `aspect-ratio` CSS property as a fallback.
3. Reserve space for ads, embeds, and dynamic content.
4. Use `font-display: optional` or `font-display: swap` with explicit fallback metrics.
5. Avoid inserting content above existing content after load.
6. Use `<link rel="preload">` for critical fonts.

---

## TTFB — Time to First Byte

### What it measures
Time from navigation start to when the browser receives the first byte of the response.

### Common causes of poor TTFB
- Slow server processing (unoptimized queries, slow frameworks)
- Geographic distance from server
- Slow DNS resolution
- Missing CDN or edge caching
- Cold server caches

### Measurement
```javascript
// From the Navigation Timing API
const ttfb = performance.getEntriesByType('navigation')[0].responseStart;
```
- Lighthouse: Performance audit → TTFB section
- Server-side: request logging with duration tracking

### Fixes
1. Use CDN with edge caching for static content.
2. Add server-side caching (Redis, Memcached, APCu).
3. Optimize database queries (see `db-query-opt.md`).
4. Pre-warm caches after deployment.
5. Use a faster hosting region or multi-region deployment.
6. Enable HTTP/2 or HTTP/3 for multiplexed connections.
7. Minimize middleware overhead in the request pipeline.

---

## Budget Enforcement

### Lighthouse CI thresholds
```json
{
  "ci": {
    "assert": {
      "assertions": {
        "largest-contentful-paint": ["warn", {"maxNumericValue": 2500}],
        "first-input-delay": ["error", {"maxNumericValue": 100}],
        "cumulative-layout-shift": ["error", {"maxNumericValue": 0.1}],
        "interactive": ["error", {"maxNumericValue": 5000}],
        "max-potential-fid": ["error", {"maxNumericValue": 300}],
        "server-response-time": ["error", {"maxNumericValue": 800}],
        "total-byte-weight": ["error", {"maxNumericValue": 500000}],
        "uses-responsive-images": "error",
        "offscreen-images": "error",
        "unminified-javascript": "error",
        "unused-javascript": "warn",
        "unused-css-rules": "warn"
      }
    },
    "collect": {
      "numberOfRuns": 3,
      "settings": {
        "preset": "desktop"
      }
    }
  }
}
```

### Web Vitals JavaScript library
```bash
npm install web-vitals
```
```javascript
import { onLCP, onFID, onCLS, onTTFB, onINP } from 'web-vitals';

function sendToAnalytics(metric) {
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,       // 'good' | 'needs-improvement' | 'poor'
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType
  });
  navigator.sendBeacon('/analytics', body);
}

onLCP(sendToAnalytics);
onFID(sendToAnalytics);
onCLS(sendToAnalytics);
onTTFB(sendToAnalytics);
onINP(sendToAnalytics);
```
