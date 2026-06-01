---
name: observability
description: Three pillars (logs, metrics, traces), RED/USE metrics, structured logging with correlation IDs, W3C trace context, symptom-based alerting, SLI/SLO/error-budget tracking, actionable dashboards, and on-call runbooks. Use when setting up monitoring, designing observability, configuring alerting, creating dashboards, or writing on-call runbooks.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: error-handling, backend-patterns
---

# Observability Patterns

Consistent observability practices across the three pillars: structured logs, RED/USE metrics, and distributed tracing with W3C trace context.

## Core rules

1. **Three pillars** — Observability is built on three data types: **Logs** — discrete events with a timestamp and structured fields, high-cardinality, useful for debugging specific requests. **Metrics** — aggregated numerical measurements over time, low-cardinality, useful for dashboards and alerts. **Traces** — end-to-end request lifecycle across services, useful for latency analysis and dependency mapping. All three must be present.

2. **RED metrics for request-driven services** — Every service that serves requests must expose three metric types: **Rate** — requests per second (HTTP, RPC, queue messages). **Errors** — failed requests per second (4xx/5xx, panics, timeouts). **Duration** — latency distribution (p50, p95, p99 in milliseconds). Label by: service name, endpoint/method, HTTP status code, and error type.

3. **USE metrics for resources** — Every system resource (CPU, memory, disk, network) is monitored by three metrics: **Utilization** — percentage of time the resource is busy. **Saturation** — degree to which the resource has extra work queued (run queue, swap usage, disk I/O wait). **Errors** — count of error events (disk errors, network errors, OOM kills). Alert on saturation before utilization reaches 100%.

4. **Structured logging with correlation IDs** — All logs are JSON, not plain text. Every log line contains: `timestamp`, `level`, `correlation_id`, `service`, `message`, and domain-specific fields. String interpolation in log messages is forbidden (`logger.info("User " + id + " logged in")` is wrong; `logger.info("user login", { user_id: id })` is correct).

5. **Alert on symptoms, not causes** — Alert rules must fire on symptoms that users experience, not on system internals. Correct: `error_rate > 1% over 5 minutes` (symptom). Incorrect: `cpu > 90%` (cause). High CPU that doesn't affect user-facing error rate is an operations concern, not an alert.

6. **SLI/SLO/error budget** — Every service defines an **SLI** (Service Level Indicator): what we measure (e.g., "proportion of requests returning non-5xx within 2000ms"). The **SLO** (Service Level Objective): the target value (e.g., "99.9% over a 30-day rolling window"). The **Error Budget**: `100% - SLO` = allowed failures. Track error budget burn rate and alert before the budget is exhausted.

7. **Distributed tracing with W3C trace context** — Every service propagates the W3C `traceparent` and `tracestate` headers to all downstream calls (HTTP, message queues, gRPC). The `traceparent` header contains: version, trace ID, span ID, and trace flags. For async/queue workflows, inject the trace context into the message envelope and extract it when processing.

8. **Actionable dashboards** — Every dashboard must answer a question: "Is the service healthy?" Each dashboard must include RED metrics for the service, dependency health, error budget remaining, and deployment markers. Maximum of 10 panels — more panels means information overload. A good dashboard should be readable in 5 seconds.

9. **On-call runbook for every alert** — Every alert must have an associated runbook answering: (a) What does this alert mean? (b) Where should I look first? (logs → metrics → traces). (c) What are the most common causes and fixes? (d) Who do I escalate to? (e) What is the manual recovery procedure? Runbooks are version-controlled and deployed alongside the service.

10. **Log levels defined** — Every service uses exactly these log levels: **DEBUG** — detailed diagnostic information, disabled in production (toggled via feature flag or log level change). **INFO** — normal operational events (request start/end, state transitions). **WARN** — something unexpected happened but the system recovered (retry succeeded on second attempt, degraded but functional). **ERROR** — a failure occurred that needs human response (request failed, downstream service unavailable). **FATAL** — the service cannot continue and will exit (failed to start, irrecoverable state).

## Procedures

1. **Define SLIs and SLOs** — For each service, define the SLI, set the SLO target, calculate the error budget. Document in the service's readme or spec. Track error budget burn rate in a dashboard.

2. **Implement structured logging** — Configure JSON logging, set the log level from `LOG_LEVEL` env var, add logging middleware that attaches request context (method, path, status, duration, correlation_id). Log every request at INFO level.

3. **Implement RED metrics** — Add request counter (with status/method/path labels), error counter, and latency histogram with p50/p95/p99 buckets. Expose via `/metrics` endpoint. Add to the service handler middleware.

4. **Implement USE metrics** — Add CPU utilization gauge, memory gauge, disk I/O metrics, and network metrics. For containerized workloads, use cgroup metrics or the container runtime's metric endpoint.

5. **Set up distributed tracing** — Install OpenTelemetry SDK, configure the OTLP exporter, set `service.name` resource attribute. Add auto-instrumentation for HTTP, gRPC, and database clients. Add manual spans for business-logic boundaries.

6. **Propagate trace context** — Extract `traceparent`/`tracestate` from incoming requests. Inject into outgoing HTTP requests. For async queues, inject trace context into message headers and extract on consumer.

7. **Correlate pillars** — Include `trace_id` in every log line. Add exemplars to metrics with trace IDs. This enables jumping from a metric spike to the relevant traces and from a trace to the relevant logs.

8. **Create actionable dashboards** — Build one dashboard per service: top row shows RED metrics (RPS, error rate, latency p50/p95/p99), second row shows dependencies, third row shows error budget and deployment markers. Max 10 panels.

9. **Write on-call runbooks** — For each alert rule, write a runbook. Store runbooks in the service repository alongside the alert definitions. Include a link to the relevant dashboard.

10. **Tune alerts** — Review alert rules every 30 days. If an alert hasn't triggered an action (rollback, code change, config fix) in the last 30 days, delete or downgrade it. Every alert must have a tested remediation.

## Gotchas

- **Logging too much costs money and creates noise** — At high throughput, logging every request can exceed the logging budget ($1K+/month in cloud logging costs). Sample debug-level logs at 1% in production. Use async logging to avoid slowing the application.
- **Alert fatigue from poorly tuned thresholds** — If every alert fires every day but never requires action, on-call engineers will ignore all alerts including critical ones. If an alert has not triggered an action in 30 days, delete or downgrade it.
- **Missing trace context in async/queue workflows** — When a message is published to a queue, the trace context is often lost. The publisher must inject `traceparent`/`tracestate` into the message headers. The consumer must extract them and create a child span.
- **Dashboards without actionability** — A dashboard showing 50 graphs with no annotations, no logical grouping, and no narrative will be ignored. Every dashboard must have a clear title answering a question and a logical top-to-bottom flow.
- **Log level misuse** — ERROR should mean "needs human response." Using ERROR for minor expected failures (validation errors, 404s) trains on-call to ignore real errors. Use WARN for expected failures that the application handles.

## References

| File | Load when |
|------|-----------|
| `references/logging-patterns.md` | Implementing structured logging |
| `references/metrics-patterns.md` | Implementing Prometheus / Grafana metrics |
| `references/tracing-patterns.txt` | Implementing OpenTelemetry / distributed tracing |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Setting up monitoring for a new service | observability + backend-patterns + error-handling |
| Incident response (debugging production) | observability + deployment-patterns |
| Alert tuning / reducing alert fatigue | observability + caching-strategies |
| Designing SLOs for a service | observability + api-design |
| On-call onboarding | observability + error-handling |

## Checklist

- [ ] Three pillars present: structured logs, RED/USE metrics, distributed tracing
- [ ] RED metrics exposed: Rate, Errors, Duration (p50/p95/p99) for every request-driven service
- [ ] USE metrics exposed: Utilization, Saturation, Errors for every resource
- [ ] Structured logging: JSON format with correlation_id, no string interpolation
- [ ] Alert on symptoms (error rate), not causes (CPU). Every alert has a runbook.
- [ ] SLI defined + SLO set + error budget tracked and burn rate monitored
- [ ] W3C trace context propagated across all services and async boundaries
- [ ] Dashboards are actionable: tell what's broken in 5 seconds, ≤10 panels, deployment markers
- [ ] Runbook exists for every alert: what to check, where to look, how to fix, who to escalate
- [ ] Log levels used correctly: ERROR=needs human, WARN=expected but notable, INFO=normal ops
