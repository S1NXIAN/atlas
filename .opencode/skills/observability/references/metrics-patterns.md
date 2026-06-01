# Metrics Patterns

Metrics provide aggregated numerical measurements over time for dashboards and alerts. Using Prometheus and Grafana, implement RED metrics for request-driven services and USE metrics for resources.

## Setup

Install the Prometheus client library and expose a `/metrics` endpoint. Register default metrics and add custom application metrics.

**Node.js with prom-client:**
```javascript
import client from 'prom-client';

// Register default metrics (CPU, memory, event loop lag)
client.collectDefaultMetrics();

// Expose /metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
```

**Python with prometheus_client:**
```python
from prometheus_client import Counter, Histogram, Gauge, generate_latest, REGISTRY
from prometheus_client import start_http_server

# Start /metrics endpoint on port 8000
start_http_server(8000)

# Or integrate with FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
Instrumentator().instrument(app).expose(app)
```

**Go with prometheus client_golang:**
```go
import "github.com/prometheus/client_golang/prometheus/promhttp"

http.Handle("/metrics", promhttp.Handler())
go http.ListenAndServe(":8000", nil)
```

## Core patterns

**Counter with labels** — Count requests, errors, and events. Label with method, path, status, and service:

```javascript
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status', 'service'],
});

const httpErrorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total HTTP errors',
  labelNames: ['method', 'path', 'status', 'error_type', 'service'],
});

// Use in middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestCounter.labels(req.method, req.path, res.statusCode, 'myapp').inc();
    if (res.statusCode >= 500) {
      httpErrorCounter.labels(req.method, req.path, res.statusCode, 'server_error', 'myapp').inc();
    }
  });
  next();
});
```

**Histogram with latency buckets** — Track request duration with p50/p95/p99 percentiles:

```javascript
const httpDurationHistogram = new client.Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'path', 'service'],
  buckets: [5, 10, 25, 50, 100, 200, 500, 1000, 2000, 5000],
});

// Use in middleware
const end = httpDurationHistogram.labels(req.method, req.path, 'myapp').startTimer();
res.on('finish', () => end());
```

**Gauge for resources** — Track current CPU, memory, and other resource states:

```javascript
const cpuUsageGauge = new client.Gauge({
  name: 'process_cpu_usage_ratio',
  help: 'Current CPU usage ratio (0-1)',
});

const memoryUsageGauge = new client.Gauge({
  name: 'process_memory_bytes',
  help: 'Current memory usage in bytes',
  labelNames: ['type'],
});

// Update periodically
setInterval(() => {
  cpuUsageGauge.set(process.cpuUsage().user / 1000000);
  memoryUsageGauge.labels('heap').set(process.memoryUsage().heapUsed);
}, 15000);
```

**Metric naming convention** — Use the format `{namespace}_{metric_name}_{unit}`:
```
myapp_http_requests_total
myapp_http_request_duration_ms
myapp_db_query_duration_seconds
myapp_cache_hits_total
myapp_cache_misses_total
```

**Cardinality limits** — No more than 10 distinct values per label. Avoid labels with unbounded values (user IDs, email addresses, session IDs). Use a label with fewer than 100 total combinations per metric.

## Integration with other pillars

**Exemplars with trace IDs** — Attach a trace ID exemplar to metric data points to correlate metric spikes with traces:

```javascript
const end = histogram.startTimer();
res.on('finish', () => {
  end({ exemplar: { trace_id: currentTraceId } });
});
```

**Grafana RED row dashboard** — Create a dashboard row with three panels:
1. **Rate** — `sum(rate(myapp_http_requests_total[5m])) by (method, path)`
2. **Errors** — `sum(rate(myapp_http_errors_total[5m])) by (method, path)`
3. **Duration** — histogram_quantile(0.99, sum(rate(myapp_http_request_duration_ms_bucket[5m])) by (le))

Add a second row for USE metrics: CPU utilization, memory usage, disk I/O.

**Alerting rules** — Define Prometheus alerting rules for symptom-based alerts:

```yaml
groups:
  - name: myapp-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(myapp_http_errors_total[5m]) / rate(myapp_http_requests_total[5m]) > 0.01
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Error rate > 1% for 5 minutes"
          runbook: "https://runbooks.example.com/high-error-rate"

      - alert: HighLatency
        expr: histogram_quantile(0.99, rate(myapp_http_request_duration_ms_bucket[5m])) > 2000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "p99 latency > 2000ms"
          runbook: "https://runbooks.example.com/high-latency"
```

## Common pitfalls

- **High cardinality explodes metrics** — Adding `user_id` or `email` as a label creates thousands of unique metric series. This overwhelms Prometheus and increases storage costs. Use log-based analysis for high-cardinality dimensions.
- **Averaging instead of percentiles** — Average latency hides outliers. A 200ms average can mask 95% of requests at 100ms and 5% at 2100ms. Always use histograms with p50/p95/p99.
- **Metrics without SLOs** — Collecting metrics without SLIs and SLOs produces dashboards that don't answer "is the service healthy?" Every metric panel should tie back to an SLI.
- **Pushgateway misused for long-lived metrics** — Pushgateway is only for batch jobs that terminate. Using it for application metrics prevents Prometheus from detecting down instances. Use a proper pull-based endpoint for long-lived services.
- **Missing exemplars** — Without exemplar links, investigating a metric spike requires manual log/trace correlation. Attach trace IDs as exemplars to enable one-click navigation from dashboard to trace.
