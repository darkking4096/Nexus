# 📦 Deployment Guide

**Owner:** @devops (Gage)  
**Last Updated:** 2026-04-17  
**Environment:** Production  

---

## 📋 Pre-Deployment Checklist

Before deploying to production, verify:

- [ ] All tests pass locally: `npm test`
- [ ] Linting passes: `npm run lint`
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Code review completed and approved
- [ ] Database migrations prepared and tested in staging
- [ ] Feature flags configured (if using feature toggles)
- [ ] Environment variables verified (.env.prod correct)
- [ ] Secrets rotated (JWT key, API keys if needed)
- [ ] Monitoring dashboards accessible
- [ ] On-call rotation confirmed
- [ ] Rollback procedure reviewed

---

## 🚀 Blue-Green Deployment (Recommended)

This strategy allows zero-downtime deployments.

### Phase 1: Prepare Green Environment (15 min)

```bash
# 1. Create new environment instance ("green")
./infrastructure/deploy-environment.sh green prod

# 2. Deploy application to green
docker build -t synkra:latest .
docker push synkra:latest
kubectl apply -f k8s/manifests-green.yaml

# 3. Run database migrations (if any)
./scripts/migrate-prod.sh --environment=green

# 4. Verify green is healthy
curl https://green-prod.internal/health
# Expected: 200 OK, all services healthy

# 5. Run smoke tests against green
npm run test:smoke -- https://green-prod.internal
```

### Phase 2: Route Traffic (5 min)

```bash
# 1. Update load balancer to route to green
./scripts/switch-load-balancer.sh green

# 2. Verify traffic is flowing to green
curl https://api.synkra.com/health
# Should route to green instance

# 3. Monitor error rates (should be 0 or very low)
# Check Sentry/Prometheus for 5 minutes
watch 'curl https://prometheus.synkra.com/metrics | grep error_rate'
```

### Phase 3: Cleanup (5 min)

```bash
# 1. Keep blue environment running for 30 min (emergency rollback)
# 2. Monitor green for issues
# 3. After 30 min, shutdown blue environment
./infrastructure/shutdown-environment.sh blue prod
```

### Total Deployment Time: ~25 min (zero downtime)

---

## 🔄 Canary Deployment (Alternative)

Release to small percentage of users first, then increase.

```bash
# Route 10% of traffic to new version
kubectl set image deployment/api api=synkra:v2.0 --record
kubectl rollout status deployment/api

# Monitor error rates for 5 min
# If OK, increase to 50%
kubectl patch deployment api -p '{"spec":{"strategy":{"canary":{"steps":[{"weight":50}]}}}}'

# Monitor for 10 min
# If OK, complete rollout
kubectl rollout resume deployment/api

# Total deployment time: 30+ min (safer, slower)
```

---

## 📝 Deployment Process Step-by-Step

### 1. Create Release Branch (if not already)

```bash
git checkout -b release/v2.0
git tag v2.0
git push origin release/v2.0 --tags
```

### 2. Build Docker Image

```bash
# Build image with version tag
docker build \
  --tag synkra:v2.0 \
  --tag synkra:latest \
  --build-arg VERSION=v2.0 \
  .

# Push to registry
docker push synkra:v2.0
docker push synkra:latest
```

### 3. Database Migrations (if applicable)

```bash
# Test migration on backup database first
./scripts/test-migration.sh --backup /backups/prod-2026-04-17.sql

# If OK, run on prod (this will take a backup automatically)
./scripts/migrate-prod.sh --environment=prod --version=v2.0

# Verify migration success
psql $DATABASE_URL -c "SELECT version, applied_at FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;"
```

### 4. Deploy Application

**Blue-Green deployment (recommended):**
```bash
./scripts/deploy-blue-green.sh --version=v2.0 --environment=prod
```

**OR direct deployment (downtime required):**
```bash
kubectl set image deployment/api api=synkra:v2.0 --record
kubectl rollout status deployment/api
```

### 5. Smoke Tests

```bash
# Run health checks
curl https://api.synkra.com/health

# Run smoke tests (basic functionality)
npm run test:smoke -- https://api.synkra.com

# Expected:
# - All health checks: ✓ PASS
# - Smoke tests: ✓ PASS
```

### 6. Monitor Post-Deployment

```bash
# Watch error rates for 30 minutes
watch -n 10 'curl https://metrics.synkra.com/errors_per_minute'

# Check specific metrics:
# - CPU usage (should be normal)
# - Memory usage (should be normal)
# - Database connections (should be stable)
# - Error rate (should be < 0.5%)
# - API latency p99 (should be < 2s)
```

### 7. Declare Success or Rollback

**If metrics look good after 30 min:**
```bash
# All clear! Deployment successful.
# Update status page
./scripts/update-status-page.sh --status=operational

# Clean up old environment (blue)
./infrastructure/cleanup-old-environment.sh
```

**If issues detected:**
```bash
# Immediately rollback
./scripts/rollback-deployment.sh --version=v1.9 --environment=prod

# Investigate root cause
# See ROLLBACK-PROCEDURE.md and INCIDENT-RESPONSE.md
```

---

## 🔐 Environment Variables

Production environment variables must be set before deployment:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | `postgresql://...` | Secrets manager (not versioned) |
| `ENCRYPTION_KEY` | Random 32+ char | Secrets manager (not versioned) |
| `JWT_SECRET` | Random token | Secrets manager (not versioned) |
| `API_KEY_STRIPE` | Stripe production key | Secrets manager (not versioned) |
| `NODE_ENV` | `production` | Set in deployment script |
| `LOG_LEVEL` | `info` | Set in deployment script |

**NEVER commit secrets to git. Use `./scripts/load-secrets.sh` to inject at deploy time.**

---

## 📊 Deployment Verification Checklist

After deployment, verify:

- [ ] Health check endpoint returns 200 OK
- [ ] All services starting up (check logs in Sentry)
- [ ] Database connectivity verified (queries work)
- [ ] User login flow working
- [ ] Critical features operational
- [ ] No Critical/High errors in Sentry
- [ ] API latency normal (< 2s p99)
- [ ] CPU/Memory/Disk usage normal
- [ ] Background jobs running (if applicable)
- [ ] Scheduled tasks executing

---

## 🆘 If Deployment Fails

### Immediate Actions

1. **Stop deployment in progress**
   ```bash
   kubectl rollout undo deployment/api
   ```

2. **Check logs for errors**
   ```bash
   kubectl logs -f deployment/api --tail=100
   ```

3. **Check database migration status**
   ```bash
   psql $DATABASE_URL -c "SELECT * FROM schema_migrations WHERE status='failed';"
   ```

4. **Restore from backup if data corruption**
   ```bash
   ./scripts/restore-from-backup.sh --backup=/backups/prod-2026-04-17.sql
   ```

### Investigation

1. Identify what went wrong (deployment logs, error messages)
2. Fix the issue (code, database, configuration)
3. Test fix in staging environment
4. Re-deploy with fix

**See INCIDENT-RESPONSE.md for full incident handling.**

---

## 📚 Related Documents

- **ROLLBACK-PROCEDURE.md** — How to quickly rollback if needed
- **INCIDENT-RESPONSE.md** — Handling deployment issues
- **MONITORING-SETUP.md** — Monitoring during deployment
- **BACKUP-RESTORE.md** — Backup procedures before deployment

---

**Last Updated:** 2026-04-17  
**Next Review:** 2026-05-17 (monthly)
