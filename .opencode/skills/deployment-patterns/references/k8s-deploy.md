# Kubernetes Deployment

Kubernetes provides declarative deployment, scaling, and self-healing for containerized workloads. Combined with Helm for chart management, it enables blue-green/canary strategies with built-in health probing and rollback mechanisms.

## Immutable artifacts

Build the image with a unique git SHA tag and reference it explicitly in manifests. Never use `:latest`.

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: app
          image: registry.example.com/myapp:a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t-20260531T120000Z
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 15
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 10
            failureThreshold: 2
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 3
            periodSeconds: 5
            failureThreshold: 30
```

Build and push:
```bash
GIT_SHA=$(git rev-parse HEAD)
BUILD_TS=$(date -u +%Y%m%dT%H%M%SZ)
IMAGE_TAG="${GIT_SHA}-${BUILD_TS}"
docker build -t myapp:$IMAGE_TAG .
docker tag myapp:$IMAGE_TAG registry.example.com/myapp:$IMAGE_TAG
docker push registry.example.com/myapp:$IMAGE_TAG
```

## Blue-green deployment

Two Deployments with a shared Service. Switch the Service's selector to flip traffic.

```yaml
# deployment-blue.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp-blue
  labels:
    version: blue
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: blue
  template:
    metadata:
      labels:
        app: myapp
        version: blue
    spec:
      containers:
        - name: app
          image: registry.example.com/myapp:${NEW_TAG}
          # probes as above
```

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: myapp
spec:
  selector:
    app: myapp
    version: blue  # ← toggle between "blue" and "green"
  ports:
    - port: 80
      targetPort: 3000
```

Switch command:
```bash
# Deploy green (idle)
kubectl apply -f deployment-green.yaml

# Wait for readiness
kubectl wait --for=condition=Ready pods -l app=myapp,version=green --timeout=120s

# Switch traffic
kubectl patch svc myapp -p '{"spec":{"selector":{"app":"myapp","version":"green"}}}'
```

## Canary deployment

Weighted routing using Istio VirtualService or progressive delivery tools.

```yaml
# istio-virtualservice.yaml
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: myapp
spec:
  hosts:
    - myapp
  http:
    - route:
        - destination:
            host: myapp-stable
          weight: 95
        - destination:
            host: myapp-canary
          weight: 5
```

For Flagger or Argo Rollouts, define a progressive delivery pipeline that automatically promotes or rolls back based on metrics.

```yaml
# flagger canary
apiVersion: flagger.app/v1beta1
kind: Canary
metadata:
  name: myapp
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: myapp
  service:
    port: 80
  analysis:
    interval: 1m
    maxWeight: 50
    stepWeight: 5
    metrics:
      - name: request-success-rate
        threshold: 99
      - name: request-duration-p99
        threshold: 500
```

## Database migration sequencing

Use init containers for expand migrations and post-deploy Jobs for contract migrations.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
spec:
  template:
    spec:
      initContainers:
        - name: migrate-expand
          image: registry.example.com/myapp:${TAG}
          command: ["node", "dist/migrate-expand.js"]
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: db-credentials
                  key: url
      containers:
        - name: app
          image: registry.example.com/myapp:${TAG}
```

```yaml
# post-deploy migrate-contract Job
apiVersion: batch/v1
kind: Job
metadata:
  name: migrate-contract
  annotations:
    "helm.sh/hook": post-install,post-upgrade
    "helm.sh/hook-weight": "10"
spec:
  template:
    spec:
      restartPolicy: OnFailure
      containers:
        - name: migrate-contract
          image: registry.example.com/myapp:${TAG}
          command: ["node", "dist/migrate-contract.js"]
```

## Health gates

Three probe types provide layered health gating:

- **livenessProbe** (httpGet `/health`): restarts the container if the process is deadlocked or unresponsive. FailureThreshold: 3, PeriodSeconds: 15.
- **readinessProbe** (httpGet `/ready`): controls whether the Pod receives traffic. Returns 200 only when the service is ready to serve. Check DB connectivity, cache, and downstream dependencies.
- **startupProbe** (httpGet `/health`): prevents liveness from killing slow-starting containers. FailureThreshold: 30 (allows up to 150s startup).

The deploy pipeline should additionally run an external health check before updating the Service selector:
```bash
kubectl wait --for=condition=Ready pods -l app=myapp,version=new --timeout=180s
if kubectl exec deploy/myapp-new -- curl -sf http://localhost:3000/health; then
  echo "Health gate passed"
else
  kubectl rollout undo deployment/myapp-new
  exit 1
fi
```

## Rollback

Native Kubernetes rollback:
```bash
# Undo the last rollout
kubectl rollout undo deployment/myapp

# Rollback to a specific revision
kubectl rollout undo deployment/myapp --to-revision=3

# Verify rollback status
kubectl rollout status deployment/myapp
```

Helm rollback:
```bash
helm rollback myapp 2 --wait --timeout 5m
```

For database rollback with irreversible migrations, restore from backup:
```bash
# Rollback app first
kubectl rollout undo deployment/myapp

# Then restore database from pre-migration backup
# Use .pgpass file instead of PGPASSWORD env var to avoid credential exposure
# ~/.pgpass format: hostname:port:database:username:password
pg_restore -h $DB_HOST -U $DB_USER -d $DB_NAME ./backup-before-migration.dump
```
