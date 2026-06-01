# Structured Logging Patterns

Structured logging is the foundation of production observability. JSON-formatted logs with correlation IDs enable searching, filtering, and correlation with metrics and traces across distributed systems.

## Setup

Configure the logger to output JSON with a minimum set of standard fields. Set the log level via the `LOG_LEVEL` environment variable.

**Node.js with pino:**
```javascript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level(label) { return { level: label }; },
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.headers.cookie'],
});

// Usage
logger.info({ user_id: '42', action: 'login' }, 'user login');
logger.error({ err, request_id: 'abc' }, 'failed to process order');
```

**Python with structlog:**
```python
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()
logger.info("user login", user_id="42", action="login")
```

**Go with slog:**
```go
import "log/slog"

logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
    ReplaceAttr: func(groups []string, a slog.Attr) slog.Attr {
        if a.Key == "level" {
            a.Key = "severity"
        }
        return a
    },
}))
slog.SetDefault(logger)

slog.Info("user login", "user_id", 42, "action", "login")
```

## Core patterns

**Logging middleware** — Attach request context to every log line. Capture method, path, status code, duration, and correlation ID:

```javascript
function loggingMiddleware(req, res, next) {
  const start = Date.now();
  const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  req.logger = logger.child({ correlation_id: correlationId, method: req.method, path: req.path });

  res.on('finish', () => {
    req.logger.info({
      status_code: res.statusCode,
      duration_ms: Date.now() - start,
    }, 'request completed');
  });

  next();
}
```

**Correlation ID propagation** — Extract the correlation ID from incoming request headers. Propagate to all downstream calls (HTTP headers, message queue metadata, database session tags):

```javascript
// Extract at service boundary
const correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();

// Inject into downstream HTTP calls
fetch(url, {
  headers: { 'x-correlation-id': correlationId }
});

// Inject into queue messages
await sqs.sendMessage({
  QueueUrl: queueUrl,
  MessageBody: JSON.stringify(payload),
  MessageAttributes: {
    correlation_id: { DataType: 'String', StringValue: correlationId }
  }
});
```

**Structured errors** — Log errors with error code, stack trace (in development), and correlation ID:

```javascript
try {
  await processOrder(orderId);
} catch (err) {
  logger.error({
    err,
    error_code: err.code || 'UNKNOWN',
    order_id: orderId,
    correlation_id: req.correlationId,
  }, 'order processing failed');
  throw err;
}
```

**Log sampling** — At high throughput, sample debug-level logs to reduce cost. Never sample ERROR or FATAL:

```javascript
function shouldSample(level, samplingRate = 0.01) {
  if (level === 'error' || level === 'fatal') return true;
  return Math.random() < samplingRate;
}
```

## Integration with other pillars

**Trace ID in every log line** — Include `trace_id` and `span_id` from OpenTelemetry context in every log entry:

```javascript
import { context, trace } from '@opentelemetry/api';

function enrichWithTrace(logger) {
  const span = trace.getSpan(context.active());
  if (span) {
    const spanContext = span.spanContext();
    return logger.child({
      trace_id: spanContext.traceId,
      span_id: spanContext.spanId,
    });
  }
  return logger;
}
```

**Deployment markers** — Log a marker event on every deployment so dashboards can overlay deploy times:

```json
{ "event": "deployment", "service": "myapp", "version": "a1b2c3d", "timestamp": "2026-05-31T12:00:00Z" }
```

**Exemplars** — When emitting metrics, include a log line reference or trace ID as an exemplar to correlate metric spikes with individual log entries.

## Common pitfalls

- **Cost of high-volume logging** — At 10K requests/second, logging every request produces ~10GB of logs per day. Use adaptive sampling and set retention policies: 7 days for debug/info, 30 days for warn, 1 year for error.
- **PII in logs** — Never log passwords, tokens, credit card numbers, or personal data. Use logger redact options to strip sensitive fields. Audit logs regularly for PII leaks.
- **Synchronous logging blocks the event loop** — Always use async logging in production. In Node.js, pino is async by default. In Python, configure structlog with async handlers.
- **Missing correlation_id in async workflows** — When processing queue messages, ensure the correlation ID is extracted from message attributes and attached to the logger context. Without this, requests spanning multiple async hops have broken correlation chains.
- **ERROR level misused for expected failures** — Validation errors, 404s, and rate limit responses are WARN, not ERROR. ERROR means a human needs to investigate. Using ERROR for expected conditions trains on-call to ignore alerts.
