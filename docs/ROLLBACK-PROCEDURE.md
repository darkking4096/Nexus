# 🔙 Rollback Procedure

**Owner:** @devops (Gage)  
**Last Updated:** 2026-04-17  
**Target Time:** < 15 minutes

---

## 📋 When to Rollback

Initiate rollback immediately if:

- **Critical incident** detected within 15 minutes of deployment
- **Error rate spike** > 5% (deployment caused regression)
- **Service down** (deployment broke core functionality)
- **Database migration failed** and data is at risk
- **Memory leak** or resource exhaustion introduced
- **Security vulnerability** discovered post-deployment

---

## ⚡ Quick Rollback (< 15 min)

### For Kubernetes Deployments

```bash
# Check current deployment
kubectl rollout history deployment/api

# Rollback to previous version (automatic)
kubectl rollout undo deployment/api

# Verify rollback
kubectl rollout status deployment/api
# Expected: Deployment "api" successfully rolled out

# Check if service is healthy
curl https://api.synkra.com/health
# Expected: 200 OK
```

### For Container-Based Deployments

```bash
# Get previous image version
docker images synkra | head -2

# Rollback to previous version
docker stop synkra-prod
docker run -d \
  --name synkra-prod \
  --restart always \
  synkra:v1.9

# Verify health
curl https://api.synkra.com/health
```

### For Docker Compose

```bash
# Rollback services to previous state
docker-compose --file docker-compose.prod.yml down
docker-compose --file docker-compose.prod.yml up -d  # Re-starts containers with previous images

# Or explicitly set image version
docker-compose --file docker-compose.prod.yml set-image api=synkra:v1.9
docker-compose --file docker-compose.prod.yml up -d
```

---

## 🗄️ Database Rollback (if migration was the issue)

### If Migration Caused Issues

```bash
# Check current migration status
psql $DATABASE_URL -c "SELECT * FROM schema_migrations ORDER BY applied_at DESC LIMIT 5;"

# Identify problematic migration
# Example: v2.0_rename_users_table fails

# Option 1: Rollback the migration (if reversible)
./scripts/migrate-prod.sh --rollback --version=v2.0

# Option 2: Restore from pre-migration backup
./scripts/restore-from-backup.sh --backup=/backups/prod-2026-04-17-pre-deploy.sql

# Verify database integrity
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM profiles;"
```

### Verify Data Integrity Post-Rollback

```bash
# Check row counts are reasonable
psql $DATABASE_URL -c "SELECT tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) FROM pg_tables WHERE schemaname='public';"

# Run basic queries to verify data consistency
psql $DATABASE_URL -c "SELECT * FROM users LIMIT 1;"  # Verify users table is intact
```

---

## 📊 Monitoring During Rollback

Monitor metrics during and after rollback:

```bash
# Watch error rate (should drop immediately)
watch -n 5 'curl https://prometheus.synkra.com/metrics | grep error_rate'

# Watch latency (should return to normal)
watch -n 5 'curl https://prometheus.synkra.com/metrics | grep api_latency_p99'

# Watch memory usage (should stabilize)
watch -n 5 'kubectl top deployment/api'

# Check Sentry for any remaining errors
# https://sentry.synkra.com/synkra/api/issues/?statsPeriod=1h
```

---

## ✅ Rollback Success Criteria

After rollback, verify:

- [ ] Error rate drops to < 0.5% within 2 minutes
- [ ] API latency p99 returns to normal (< 2s) within 2 minutes
- [ ] CPU usage normalizes within 5 minutes
- [ ] Memory usage stable (no memory leaks)
- [ ] Health check endpoint returns 200 OK
- [ ] Key user flows tested manually:
  - [ ] User can login
  - [ ] User can access dashboard
  - [ ] Critical features work
- [ ] No error spikes in Sentry
- [ ] Database queries respond normally

---

## 🔍 Post-Rollback Actions

### Immediate (first hour)

1. **Declare incident resolved**
   ```bash
   ./scripts/update-status-page.sh --status=operational
   ```

2. **Create GitHub issue** for root cause investigation
   ```
   Title: "Investigate deployment v2.0 rollback cause"
   Labels: bug, deployment, urgent
   ```

3. **Notify team** in Slack `#incidents`
   ```
   Deployment v2.0 rolled back due to [reason].
   Service is now stable. Post-mortem scheduled for tomorrow.
   ```

4. **Document incident** (see INCIDENT-RESPONSE.md)

### Follow-Up (within 24 hours)

1. **Investigate root cause**
   - Run tests locally with v2.0 code
   - Check deployment logs for errors
   - Review database migration (if applicable)

2. **Create fix**
   - Fix the bug/issue
   - Add tests to prevent regression
   - Verify fix works in staging

3. **Schedule re-deployment**
   - Plan deployment for low-traffic time
   - Run full pre-deployment checklist
   - Deploy with monitoring enabled

---

## ⚠️ Emergency Rollback (data loss scenario)

If data integrity is at risk and quick rollback didn't work:

### 1. Immediately Shutdown Affected Service

```bash
kubectl delete deployment api
# OR
docker stop synkra-prod
```

### 2. Restore from Backup

```bash
# Find latest good backup
ls -lrt /backups/prod-*.sql | tail -1

# Restore to backup state
./scripts/restore-from-backup.sh --backup=/backups/prod-2026-04-17-12-00.sql

# Verify restore completed
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### 3. Restart Service with Previous Version

```bash
# Use previous stable version
kubectl apply -f k8s/manifests-v1.9.yaml
# OR
docker run -d --name synkra-prod synkra:v1.9
```

### 4. Monitor Carefully

```bash
# Watch for any issues
watch -n 5 'kubectl logs -f deployment/api'
```

---

## 📚 Related Documents

- **DEPLOYMENT-GUIDE.md** — Understand deployment process before rolling back
- **INCIDENT-RESPONSE.md** — Full incident handling procedures
- **BACKUP-RESTORE.md** — Backup management and restore procedures
- **MONITORING-SETUP.md** — Monitoring metrics to watch during rollback

---

## 🎯 Rollback Checklist Template

```markdown
## Rollback: [Version/Feature]

**Initiated At:** [timestamp]  
**Rollback Completed At:** [timestamp]  
**Total Time:** [minutes]

### Pre-Rollback Status
- Error rate: [X]%
- Affected users: [N]
- Incident severity: P1 | P2 | P3

### Rollback Steps Executed
- [ ] Stopped deployment/service
- [ ] Rolled back code to v[X]
- [ ] Rolled back database (if needed)
- [ ] Restarted service
- [ ] Verified health checks
- [ ] Monitored metrics for 10 min

### Post-Rollback Verification
- [ ] Error rate < 0.5%
- [ ] Latency p99 < 2s
- [ ] No Sentry errors
- [ ] Users report service working
- [ ] All critical features functional

### Root Cause
[Brief description of what caused the issue]

### Follow-Up
- [ ] GitHub issue created
- [ ] Post-mortem scheduled
- [ ] Fix deployed to v[X+1]
- [ ] Tests added to prevent regression
```

---

**Last Updated:** 2026-04-17  
**Practice Drill:** Quarterly rollback drills recommended
