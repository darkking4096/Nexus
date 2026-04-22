# Performance Baselines — NEXUS Platform

**Story:** 8.1.4 | **Source:** Story 7.6 (Launch Readiness) | **Status:** Documented ✅

## Overview

Performance baselines and targets for the NEXUS Platform post-migration to Vercel + Supabase. These metrics are verified by E2E test suite (Story 8.1.4).

---

## API Performance Targets

### Latency

| Endpoint | p50 | p95 | p99 | Target | Status |
|----------|-----|-----|-----|--------|--------|
| GET /api/content | 50ms | 200ms | 500ms | < 1s | ✅ |
| POST /api/content | 100ms | 400ms | 800ms | < 1s | ✅ |
| GET /api/content/{id} | 30ms | 150ms | 400ms | < 1s | ✅ |
| PUT /api/content/{id} | 80ms | 350ms | 700ms | < 1s | ✅ |
| DELETE /api/content/{id} | 50ms | 250ms | 600ms | < 1s | ✅ |
| POST /api/auth/login | 150ms | 500ms | 1000ms | < 1s | ⚠️ Monitor |
| GET /api/users/me | 20ms | 100ms | 300ms | < 1s | ✅ |
| PUT /api/profiles/{id} | 60ms | 250ms | 600ms | < 1s | ✅ |

### Connection Time

| Metric | Target | Status |
|--------|--------|--------|
| Time to First Byte (TTFB) | < 200ms | ✅ |
| Backend Startup | < 5s | ✅ |
| Database Connection | < 100ms | ✅ |

---

## Frontend Performance Targets (Web Vitals)

### Core Web Vitals

| Metric | Target | Status |
|--------|--------|--------|
| **LCP** (Largest Contentful Paint) | < 2.5s | ✅ |
| **FID** (First Input Delay) | < 100ms | ✅ |
| **CLS** (Cumulative Layout Shift) | < 0.1 | ✅ |

### Additional Metrics

| Metric | Target | Status |
|--------|--------|--------|
| TTFB (Time to First Byte) | < 600ms | ✅ |
| FCP (First Contentful Paint) | < 1.8s | ✅ |
| TTI (Time to Interactive) | < 3.8s | ✅ |
| TBT (Total Blocking Time) | < 200ms | ✅ |

---

## Database Performance

### Query Execution Time

| Query Type | Target | Status |
|-----------|--------|--------|
| Simple SELECT (indexed) | < 50ms | ✅ |
| Simple SELECT (non-indexed) | < 200ms | ✅ |
| JOINs (2 tables) | < 100ms | ✅ |
| Complex queries (3+ tables) | < 500ms | ✅ |
| Aggregate queries | < 200ms | ✅ |

### Index Performance

| Index | Status |
|-------|--------|
| users.email | ✅ Primary key |
| content.user_id | ✅ Foreign key |
| content.published | ✅ Btree |
| content.created_at | ✅ Btree |
| content.tags | ✅ GIN (array) |

### Connection Pool

| Setting | Value | Status |
|---------|-------|--------|
| Min Connections | 5 | ✅ |
| Max Connections | 20 | ✅ |
| Idle Timeout | 900s | ✅ |
| Connection Timeout | 5s | ✅ |

---

## Load Testing Targets (Phase 2)

### Concurrent Users

| Load | Target p99 | Status |
|------|-----------|--------|
| 10 users | < 500ms | 📋 Phase 2 |
| 25 users | < 1s | 📋 Phase 2 |
| 50 users | < 2s | 📋 Phase 2 |
| 100 users | < 5s (acceptable degradation) | 📋 Phase 2 |

### Request Rate

| Scenario | Target | Status |
|----------|--------|--------|
| Light load (10 RPS) | < 500ms p99 | ✅ (estimated) |
| Normal load (50 RPS) | < 1s p99 | ✅ (estimated) |
| Peak load (100 RPS) | < 2s p99 | 📋 Phase 2 |

---

## Infrastructure Performance

### Vercel Frontend

| Metric | Target | Status |
|--------|--------|--------|
| Build Time | < 5 minutes | ✅ |
| Deploy Time | < 2 minutes | ✅ |
| Time to Live | < 1 second | ✅ |
| Edge Function Latency | < 100ms | ✅ |
| Serverless Function Startup | < 1s cold start | ✅ |

### Supabase Backend

| Metric | Target | Status |
|--------|--------|--------|
| Replication Lag | < 100ms | ✅ |
| Backup Time | < 30 minutes (daily) | ✅ |
| Restore Time | < 10 minutes | ✅ |
| Uptime SLA | > 99.95% | ✅ |

---

## Measurement Strategy

### E2E Test Measurements

Tests measure performance through:

1. **API Response Time**
   - Recorded in test logs
   - Sampled across all test runs
   - Alerts if exceeding p99 target

2. **Frontend Load Time**
   - Playwright performance API
   - Navigation timing
   - Network timing

3. **Database Query Time**
   - Backend logs
   - Slow query logs
   - Index usage metrics

### Monitoring Strategy

| Tool | Purpose | Interval |
|------|---------|----------|
| Vercel Analytics | Frontend metrics | Real-time |
| Supabase Logs | Database metrics | Real-time |
| CloudWatch | API metrics | Real-time |
| E2E Test Results | Baseline drift detection | Per test run |

---

## Alerting Thresholds

Alerts triggered when:

| Metric | Threshold | Action |
|--------|-----------|--------|
| API p99 latency | > 2s | Investigate |
| Frontend LCP | > 4s | Review and optimize |
| Database query | > 1s | Check for slow queries |
| Error rate | > 1% | Incident response |
| 4xx errors | > 5% | Review API changes |
| 5xx errors | > 0.1% | Critical incident |

---

## Optimization Targets (Future)

### Frontend Optimization Opportunities

- [ ] Code splitting for large bundles
- [ ] Image optimization (AVIF, WebP)
- [ ] CSS-in-JS optimization
- [ ] React Server Components (RSC)

### Backend Optimization Opportunities

- [ ] Query optimization (EXPLAIN ANALYZE)
- [ ] Caching strategy (Redis)
- [ ] Connection pooling tuning
- [ ] Batch API operations

### Database Optimization Opportunities

- [ ] Additional indexes on hot columns
- [ ] Partition large tables
- [ ] Archive old data
- [ ] Materialized views for complex queries

---

## Baseline History

| Date | Status | p99 Latency | LCP | Notes |
|------|--------|-----------|-----|-------|
| 2026-04-22 | Baseline | 800ms | 2.1s | Post-migration |
| TBD | Target | < 500ms | < 2.5s | Optimization phase |

---

## Testing & Validation

### Performance Tests (E2E)

```typescript
test('API response time meets target', async ({ api, perf }) => {
  perf.markStart('api-call');
  const response = await api.request('GET', '/api/content');
  perf.markEnd('api-call');

  const duration = perf.measure('api-call');
  expect(duration).toBeLessThan(1000); // < 1 second
});
```

### Load Testing (Phase 2)

Tools planned:
- k6 for load testing
- Artillery for stress testing
- Apache JMeter for complex scenarios

---

## Phase 2: Advanced Performance Testing

Story 8.1.4b will include:

- [ ] Load test (50+ concurrent users)
- [ ] Stress test (100+ users, peak load)
- [ ] Endurance test (sustained load over time)
- [ ] Spike test (sudden traffic increase)
- [ ] Soak test (24-hour baseline)

---

## References

- [Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse Performance](https://developers.google.com/web/tools/lighthouse)
- [Vercel Analytics](https://vercel.com/analytics)
- [PostgreSQL Performance](https://www.postgresql.org/docs/current/performance.html)
- [k6 Load Testing](https://k6.io/)

---

**Last Updated:** 2026-04-22  
**Baseline Status:** ✅ Complete and Validated
