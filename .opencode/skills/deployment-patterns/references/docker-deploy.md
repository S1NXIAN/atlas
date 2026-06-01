# Docker-based Deployment

Docker provides consistent, reproducible deployment environments through container images. Combined with Docker Compose for multi-service orchestration, it enables immutable artifact pipelines with health-gated rollouts.

## Immutable artifacts

Build the image once with a unique tag and promote it unchanged through all environments.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

LABEL git-sha="<commit-sha>"
LABEL build-timestamp="<iso8601-timestamp>"

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

Tag immutably at build time:
```bash
docker build -t myapp:$GIT_SHA-$BUILD_TIMESTAMP .
docker tag myapp:$GIT_SHA-$BUILD_TIMESTAMP registry.example.com/myapp:$GIT_SHA-$BUILD_TIMESTAMP
docker push registry.example.com/myapp:$GIT_SHA-$BUILD_TIMESTAMP
```

Never overwrite tags. Never use `:latest` for deployments — use it only as a convenience pointer for local development.

## Blue-green deployment

Docker Compose with two service definitions enables blue-green switching.

```yaml
# docker-compose.yml
services:
  app-blue:
    image: registry.example.com/myapp:${TAG}
    ports:
      - "3001:3000"
    environment:
      - ACTIVE=false
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s

  app-green:
    image: registry.example.com/myapp:${TAG}
    ports:
      - "3002:3000"
    environment:
      - ACTIVE=false
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s

  lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app-blue
      - app-green
```

Switch procedure:
```bash
# Deploy new version to idle environment (e.g., green is idle)
TAG=$(cat ./new-version.tag)
docker compose up -d app-green

# Wait for health check to pass
while ! curl -f http://localhost:3002/health; do sleep 2; done

# Switch load balancer to green
cp nginx.green.conf nginx.active.conf
docker compose exec lb nginx -s reload
```

## Canary deployment

Gradual traffic shift using service scaling and health monitoring:

```yaml
# docker-compose.canary.yml
services:
  app-stable:
    image: registry.example.com/myapp:${STABLE_TAG}
    scale: 19

  app-canary:
    image: registry.example.com/myapp:${CANARY_TAG}
    scale: 1

  lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.canary.conf:/etc/nginx/nginx.conf:ro
```

Progression: scale canary from 1 to 5 to 10 to 19 of 20 instances. Monitor error rate at each step. Rollback by scaling canary to 0 and reverting to stable.

## Database migration sequencing

Run migrations in entrypoint or as a separate container:

```bash
#!/bin/sh
# entrypoint.sh — expand migration runs before app starts
if [ "$RUN_MIGRATIONS" = "true" ]; then
  npm run migrate:expand
fi
exec node dist/server.js
```

```yaml
# migration container in pipeline
services:
  migrate-expand:
    image: registry.example.com/myapp:${TAG}
    command: ["node", "dist/migrate-expand.js"]
    environment:
      - DATABASE_URL=${DATABASE_URL}

  app:
    image: registry.example.com/myapp:${TAG}
    depends_on:
      migrate-expand:
        condition: service_completed_successfully

  migrate-contract:
    image: registry.example.com/myapp:${TAG}
    command: ["node", "dist/migrate-contract.js"]
    depends_on:
      app:
        condition: service_started
```

## Health gates

Every image includes a `HEALTHCHECK` instruction. The deploy pipeline waits for healthy status before routing traffic:

```bash
# Wait for health
for i in $(seq 1 30); do
  if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo "Health check passed"
    exit 0
  fi
  sleep 2
done
echo "Health check failed"
exit 1
```

The health endpoint must verify database connectivity, downstream service reachability, and cache availability. Return a JSON body with individual dependency status.

## Rollback procedure

```bash
# 1. Identify previous healthy tag
PREVIOUS_TAG=$(cat ./previous-version.tag)

# 2. Deploy previous artifact to idle environment
docker compose -f docker-compose.yml up -d app-green

# 3. Wait for health
while ! curl -f http://localhost:3002/health; do sleep 2; done

# 4. Switch load balancer back
cp nginx.blue.conf nginx.active.conf
docker compose exec lb nginx -s reload

# 5. Run database rollback migration (if applicable)
docker compose run --rm migrate-contract npm run migrate:rollback
```
