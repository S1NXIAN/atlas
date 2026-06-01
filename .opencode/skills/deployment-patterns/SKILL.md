---
name: deployment-patterns
description: Immutable artifact pipelines, blue-green/canary deployments, environment parity, health-gated rollouts, DB migration sequencing, config/secret externalization, and artifact traceability. Use when setting up CI/CD pipelines, planning deployments, designing release processes, or implementing rollback procedures.
metadata:
  pipeline-stage: code-forge, code-review
  depends-on: backend-patterns, database-migrations, error-handling
---

# Deployment Patterns

Consistent deployment processes with immutable artifacts, health-gated rollouts, and tested rollback plans.

## Core rules

1. **Immutable artifacts** — Build the artifact once and promote it through every environment unchanged. Never rebuild for a different environment. The same artifact (Docker image, compiled binary, ZIP) that passed tests in staging is the exact artifact deployed to production. Inject environment-specific configuration at deploy time.

2. **Environment parity** — Development, staging, and production environments must be as identical as possible: same OS version, same dependency versions (pinned, not ranges), same configuration structure (even if values differ), same database engine version. Staging must be a production replica, not a scaled-down approximation.

3. **Blue-green deployments** — Maintain two identical production environments (blue and green). At any time, one is live and the other is idle. Deploy the new version to the idle environment, run smoke tests, then switch the load balancer/router to route traffic to the updated environment. Instant rollback: switch back to the previous environment. The transition is atomic at the load balancer level.

4. **Canary releases** — For high-risk or high-traffic services, route a small percentage of traffic (5%) to the new version. Monitor error rates, latency, and business metrics for an observation window (minimum 5 minutes). If stable, gradually increase to 25%, 50%, 100%. If error rate spikes or latency degrades beyond SLO, instantly roll back. Requires feature parity, metrics comparison (canary vs baseline), and automated rollback conditions.

5. **Rollback plan** — Every deployment must have a documented rollback procedure before the deploy starts. The rollback procedure must be tested before deploying forward. Strategy depends on deployment model: blue-green (switch environments), canary (route 100% back to old version), or rolling restart (redeploy previous artifact). Database rollbacks must be specifically documented — irreversible migrations require a restore-from-backup rollback plan.

6. **Health gates** — Deployment pauses at every stage if health checks fail. The `/health` endpoint must return HTTP 200 for the new version before any traffic is routed to it. Health checks must verify: process liveness, database connectivity, downstream service reachability, and cache availability. Unhealthy deployments are automatically rolled back (no manual intervention needed). Readiness gates run continuously during canary stages.

7. **Database migration sequencing** — Follow a three-phase pattern: **Expand phase** — run backward-compatible migrations (add columns, add tables) BEFORE the new application deploys. Old code must work with the new schema. **Deploy phase** — deploy the new application version that uses the new schema. **Contract phase** — after all instances are running the new code, run cleanup migrations (drop old columns, remove deprecated tables). This order prevents downtime from schema-version mismatches.

8. **Configuration is not code** — Configuration values (environment names, service URLs, feature flags, tier settings) are never baked into the artifact. Config is injected at deploy time via: environment variables, a configuration service (Consul, etcd, AppConfig), or mounted config files. The same artifact runs in dev with dev config and in prod with prod config.

9. **Tag all artifacts** — Every build artifact is tagged with: the full git commit SHA (40-character), the build timestamp in ISO 8601 format, the CI pipeline build number, and the branch name. Tags are immutable once published to the artifact registry. This enables traceability from a running instance back to the exact source code and deterministic rollback to any previous artifact.

10. **Secrets never in artifacts** — Secrets (API keys, database passwords, certificates, tokens) are never stored in the artifact, committed to git, or included in the source tree. Secrets are injected at deploy time from a secret manager (AWS Secrets Manager, HashiCorp Vault, GCP Secret Manager, Azure Key Vault). Local development uses local secret storage (`.env.local` files that are gitignored, or a local vault dev server).

## Procedures

1. **Configure artifact build** — Set up the build step to produce an immutable artifact (Docker image, compiled binary, ZIP/archive). The build runs in a clean CI environment with pinned dependency versions and caching for speed. Output: artifact tagged with git SHA + timestamp.

2. **Push artifact to registry** — Push the tagged artifact to the artifact registry (Docker Hub/ECR/GCR, Nexus, S3). The registry is append-only: no tags are overwritten. This guarantees every artifact is uniquely identifiable.

3. **Promote through environments** — The same artifact goes through dev → staging → prod. Each promotion is triggered by the preceding environment passing its test suite. Dev deployment: automatic on merge to main. Staging: automatic after dev passes. Production: manual approval gate (or automatic for low-risk services).

4. **Configure environment parity** — Verify each environment has: same OS, same runtime version, same dependency lockfile, same config structure (different values). Run a parity check script in CI that compares staging and prod environment specs. If parity drifts, block the deployment.

5. **Set up blue-green infrastructure** — Provision two identical compute environments (ECS services, Kubernetes namespaces, VM autoscaling groups). Label them `blue` and `green`. The load balancer has two target groups; the router only routes to one at a time. At deploy, update the inactive group, run health checks, then switch the router.

6. **Implement database migration pipeline** — Create separate CI steps: (a) `migrate:expand` — run backward-compatible migrations BEFORE app deploy, (b) `deploy` — deploy the new app version, (c) `migrate:contract` — run cleanup migrations AFTER all instances are updated. Each step must pass health checks before the next begins.

7. **Add health gates** — Add a pre-routing script that hits `/health` on the new deployment, expects 200, and checks response body for dependency status. Add continuous health monitoring during canary stages. If health check fails three consecutive times, auto-rollback.

8. **Document rollback procedure** — For each deploy, write a rollback runbook: (a) identify the previous artifact tag, (b) deploy the previous artifact to the idle environment, (c) run database rollback migration (or document restore-from-backup plan), (d) switch traffic back, (e) verify health. Include this runbook in the deployment ticket/PR. Test the rollback before the forward deploy.

9. **Set up config injection** — Create a deploy-time step that injects environment config: read from env vars or config service, validate required values exist, inject into the running container at startup. Read configuration from environment variables only at startup in a centralized config module — do not scatter `process.env` or `os.Getenv` reads throughout application code.

10. **Configure secret injection** — Set up secret manager access in each environment. At deploy time, the deploy script fetches secrets and injects them as environment variables or mounted files. Secrets are never logged. Access to secrets is audited. Rotate secrets on a schedule (90 days).

## Gotchas

- **Migration order mistake is the #1 cause of deployment downtime** — Running `migrate:contract` before all instances are updated causes 500 errors. Running `migrate:expand` after deployment breaks old instances still running. The three-phase sequence (expand → deploy → contract) is non-negotiable.
- **Canary releases with sticky sessions** — If the application uses session affinity (sticky sessions), canary routing must preserve sessions. A user's session is pinned to a version until the session expires. Use a session-broken approach: non-sticky routes (degraded UX during canary) or session draining (let sessions age out naturally into new version).
- **Rollback of irreversible migrations** — `DROP COLUMN`, `DROP TABLE`, and data transformations that lose information cannot be rolled back by a `down` migration. The rollback procedure must document restoring the database from a backup taken before the migration. Test this before the forward deploy.
- **Config drift between environments** — Over time, staging and prod environments diverge: different dependency versions from partial updates, different config keys added manually, different OS patches. Run a weekly drift-detection script. The only solution is ephemeral environments (recreate from scratch for each deploy).
- **Rollback is not just "deploy old version"** — If the deployment includes a database migration, rolling back the app without reverting the database can cause the old app to crash on unexpected columns. The rollback plan must coordinate app rollback + database rollback (or document data compatibility).

## References

| File | Load when |
|------|-----------|
| `references/docker-deploy.md` | Deploying with Docker / Docker Compose |
| `references/k8s-deploy.md` | Deploying with Kubernetes / Helm |
| `references/serverless-deploy.txt` | Deploying with Serverless / AWS Lambda |

## Typical load combos

| Scenario | Load these skills |
|---|---|
| Setting up CI/CD for a new service | deployment-patterns + database-migrations + error-handling |
| Release planning | deployment-patterns + git-workflow |
| Rollback drill / incident response | deployment-patterns + observability |
| Database migration deployment | deployment-patterns + database-migrations |
| Canary release setup | deployment-patterns + observability + error-handling |

## Checklist

- [ ] Immutable artifacts: build once, same artifact through all environments
- [ ] Environment parity: dev/staging/prod identical (OS, deps, config structure)
- [ ] Blue-green or canary strategy defined per service (not rolling restart as default)
- [ ] Canary: traffic progression (5% → 25% → 50% → 100%) with automated rollback on error
- [ ] Rollback plan documented AND tested before every deployment
- [ ] Health gates: /health returns 200 before traffic is routed, auto-rollback on failure
- [ ] Database migration order: expand (before deploy) → deploy → contract (after deploy)
- [ ] Config injected via env vars or config service, not built into artifact
- [ ] Artifacts tagged with full git SHA + build timestamp (no overwrite)
- [ ] Secrets injected from secret manager at deploy time, never in artifact
