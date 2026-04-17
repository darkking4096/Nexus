# 🚨 Incident Response Procedure

**Owner:** @pm (Morgan)  
**Last Updated:** 2026-04-17  
**Severity Levels:** Critical, High, Medium, Low

---

## 🎯 Purpose

This document defines the procedures for detecting, responding to, and resolving incidents during production operation. All team members should be familiar with their roles.

---

## 👥 Incident Response Team

| Role | Name | Contact | On-Call Hours |
|------|------|---------|---------------|
| **Incident Commander** | Morgan (@pm) | morgan@synkra.com | 24/7 |
| **DevOps Lead** | Gage (@devops) | gage@synkra.com | 24/7 |
| **Technical Lead** | Aria (@architect) | aria@synkra.com | Business hours + on-call |
| **QA Lead** | Quinn (@qa) | quinn@synkra.com | Business hours |

---

## 📈 Severity Levels

### Critical (P1)
- **Impact:** Service completely down, > 100 users affected, revenue impact
- **Response Time:** < 15 minutes
- **Escalation:** Immediate (all hands on deck)
- **Examples:** Database down, API returns 500 for all requests, payment processing broken

### High (P2)
- **Impact:** Service degraded, 10-100 users affected, partial functionality lost
- **Response Time:** < 1 hour
- **Escalation:** Incident Commander + relevant team lead
- **Examples:** Search broken, specific feature returning errors, 50% error rate

### Medium (P3)
- **Impact:** Non-critical functionality broken, < 10 users affected
- **Response Time:** < 4 hours
- **Escalation:** Team lead + on-call rotation
- **Examples:** Admin panel slow, one user type can't login, minor UI bug in production

### Low (P4)
- **Impact:** Cosmetic issues, no functional impact
- **Response Time:** < 1 business day
- **Escalation:** Regular bug triage
- **Examples:** Typo, UI misalignment, analytics tracking minor issue

---

## 🚨 Incident Detection

### Automated Alerting

Alerts configured in monitoring stack (Sentry, Prometheus):
- **CPU > 80%** → High alert
- **Memory > 85%** → High alert
- **Error rate > 1%** → Medium alert
- **API latency p99 > 2s** → Medium alert
- **Database connection pool exhausted** → Critical alert
- **Service unhealthy (health check failing)** → Critical alert

### Manual Detection

Team members can report incidents directly:
1. **Slack channel:** `#incidents` (monitored by on-call)
2. **PagerDuty alert:** For critical issues
3. **Status page:** public.synkra.com/status

---

## 🔍 Incident Triage (First 15 min)

### Step 1: Acknowledge
- On-call engineer acknowledges incident in PagerDuty/Slack within 5 min
- Incident Commander declared (usually Incident Engineer if P1, otherwise @pm)

### Step 2: Assess
- Determine severity level based on impact:
  - Service availability (is product accessible?)
  - User impact (how many users affected?)
  - Data integrity (is data at risk?)
  - Revenue impact (is payment processing affected?)

### Step 3: Declare
- Post to `#incidents` Slack channel:
  ```
  🚨 INCIDENT DECLARED
  Severity: P1 | P2 | P3 | P4
  Description: [brief summary]
  Incident Commander: [name]
  Status Page: [link to update status.synkra.com]
  ```

### Step 4: Initial Investigation
- Check monitoring dashboards (CPU, memory, error rates)
- Check error tracking (Sentry) for error patterns
- Check recent deployments (did something just go live?)
- Check logs for errors or exceptions

---

## 🛠️ Incident Response

### For P1 (Critical) Incidents

1. **Immediate Actions (0-5 min):**
   - Page entire on-call team
   - Declare incident commander
   - Begin investigation
   - Start recording decision log

2. **Investigation (5-15 min):**
   - Identify root cause (deployment, infra, database, external service)
   - Assess if rollback is needed
   - Prepare fix or rollback plan

3. **Mitigation (15-30 min):**
   - Execute rollback if recent deployment caused it
   - OR apply hotfix if root cause identified
   - Verify fix in monitoring (error rate drops, latency normal)

4. **Communication (ongoing):**
   - Update status page every 10 min
   - Post to `#incidents` channel with updates
   - If > 5 min outage, notify customers via email

### For P2 (High) Incidents

1. **Investigate within 1 hour**
   - Identify root cause
   - Assess impact scope
   - Plan fix or workaround

2. **Implement fix within 2 hours**
   - Code fix, database query, configuration change
   - Deploy to prod with monitoring
   - Verify resolution

### For P3 & P4 Incidents

- Follow standard bug triage process
- Add to backlog for next development cycle
- Monitor for pattern (if same issue repeats → escalate severity)

---

## 🔄 Rollback Procedure

If incident was caused by recent deployment:

### Quick Rollback (< 15 min)

```bash
# 1. Identify last known good commit
git log --oneline | head -5

# 2. Rollback to previous version
git revert HEAD

# 3. Deploy rolled-back version
./deploy.sh --environment=prod

# 4. Verify
# - Check monitoring dashboards
# - Verify error rate drops
# - Confirm users can access service
```

**See ROLLBACK-PROCEDURE.md for detailed steps.**

---

## 📊 Post-Incident (After resolution)

### Immediate (within 1 hour)
- [ ] Create follow-up issue in GitHub
- [ ] Schedule post-mortem (if P1 or P2)
- [ ] Update incident status → "Resolved"
- [ ] Update status page → all green

### Post-Mortem (within 24 hours)
- [ ] Schedule 30-min team meeting
- [ ] Document: what happened, why, what we'll do to prevent
- [ ] Assign action items with owners
- [ ] Publish findings to team

### Follow-Up (within 1 week)
- [ ] Complete action items from post-mortem
- [ ] Deploy permanent fixes
- [ ] Update runbooks/procedures if needed
- [ ] Close incident tracking ticket

---

## 📋 Incident Log Template

```markdown
## Incident: [Brief Title]

**Severity:** P1 | P2 | P3  
**Start Time:** 2026-04-17 14:30 UTC  
**End Time:** 2026-04-17 14:45 UTC (15 min total)  
**Impact:** [X users affected, [X] feature broken, $X revenue impact]

### Timeline
- 14:30 — Alert triggered (error rate > 5%)
- 14:32 — On-call acknowledged, Incident Commander declared
- 14:35 — Root cause identified: database connection pool exhausted
- 14:40 — Fix deployed (scale database connections)
- 14:45 — Error rate normal, service stable

### Root Cause
New feature deployment increased database queries without pooling optimization.

### Resolution
Reverted feature deployment, then re-deployed with connection pool fix.

### Action Items
- [ ] Add database connection pooling monitoring
- [ ] Add pre-deployment load test requirement
- [ ] Document database scaling limits

### Post-Mortem
See: docs/incidents/2026-04-17-db-pool-exhaustion-postmortem.md
```

---

## 🔗 Related Documents

- **ROLLBACK-PROCEDURE.md** — How to rollback quickly
- **DEPLOYMENT-GUIDE.md** — Deployment process (understand it to rollback)
- **MONITORING-SETUP.md** — Where to find metrics and logs during incident
- **MONITORING.md** — Alert rules and dashboard queries

---

**Last Updated:** 2026-04-17  
**Next Review:** 2026-05-17 (monthly)
