# Analytics Service Architecture

**Last Updated:** 2026-04-15  
**Owner:** @dev  
**Status:** Stable (Story 6.1)

## Overview

The `AnalyticsService` is the core data-collection layer for NEXUS's analytics module. It integrates with Instagram via Instagrapi (Python service) to fetch real-time metrics and historical data, providing endpoints for:

- **Current metrics** — followers count, engagement rate, reach, impressions
- **Historical metrics** — charting data with daily aggregation
- **Per-post metrics** — engagement data for individual content pieces
- **Recent posts** — last 30 posts with complete engagement analytics

## Design Principles

### 1. **Ownership Verification First**

All public methods enforce ownership checks before returning data. This prevents user A from querying user B's analytics:

```typescript
private getProfileWithOwnershipCheck(profileId: string, userId: string): ProfileData | null
```

Throws `'Access denied: profile belongs to another user'` if profile belongs to different user.

### 2. **Caching for Performance**

Instagram rate limits ~200 API calls/hour. To protect against rate limiting and improve performance:

- **1-hour TTL cache** stored in SQLite `metrics` table
- `getProfileMetricsWithCache()` checks if metrics are fresh before triggering collection
- Cache hit: returns existing record (no Python service call)
- Cache miss: triggers `collectMetricsForProfile()` which calls Python service

**Cache check logic:**
```typescript
const ageMs = now - collectedTime;
if (ageMs < this.CACHE_TTL_MS) {
  return cachedMetrics;
}
```

### 3. **Retry Logic with Exponential Backoff**

Network calls to Python service use `retryWithBackoff()` from `services/retry.ts`:

- **Max attempts:** 3
- **Backoff strategy:** exponential (1s, 2s, 4s)
- **Transient errors:** Network timeouts, 5xx responses, rate limiting (429)
- **Fatal errors:** Invalid credentials, malformed requests (4xx except 429)

Configured in `collectMetricsForProfile()`:

```typescript
await retryWithBackoff(
  async () => { /* call Python service */ },
  { maxAttempts: 3, onRetry: (attempt, error) => { ... } }
);
```

### 4. **Session Encryption**

Instagram session tokens are stored encrypted in `insta_sessions` table:

- **Encryption method:** AES-256-GCM (from `utils/encryption.ts`)
- **Key source:** `ENCRYPTION_KEY` environment variable
- **Decryption:** on-demand in `collectMetricsForProfile()` before Python call
- **Never logged:** session data excluded from console output

## Database Schema

### Tables

#### `metrics` — Profile-level aggregate metrics
```sql
CREATE TABLE metrics (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  followers_count INTEGER,
  engagement_rate REAL,
  reach INTEGER,
  impressions INTEGER,
  collected_at TEXT NOT NULL, -- ISO 8601 UTC
  created_at TEXT NOT NULL
);

CREATE INDEX idx_metrics_profile_date ON metrics(profile_id, collected_at DESC);
```

#### `post_metrics` — Per-content engagement data
```sql
CREATE TABLE post_metrics (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  content_id TEXT NOT NULL REFERENCES content(id),
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  saves INTEGER,
  reach INTEGER,
  collected_at TEXT NOT NULL, -- ISO 8601 UTC
  created_at TEXT NOT NULL
);

CREATE INDEX idx_post_metrics_profile_date ON post_metrics(profile_id, collected_at DESC);
```

#### `insta_sessions` — Encrypted Instagram session tokens
```sql
CREATE TABLE insta_sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  session_data TEXT NOT NULL, -- AES-256-GCM encrypted JSON
  created_at TEXT NOT NULL
);
```

## API Endpoints

### `GET /api/analytics/{profileId}/metrics`

Returns current metrics for a profile.

**Auth:** Requires profile ownership  
**Rate limit:** 100 req/min per user  
**Cache:** Yes (1 hour)

**Response:**
```json
{
  "id": "uuid",
  "profile_id": "profile-456",
  "followers_count": 12500,
  "engagement_rate": 4.2,
  "reach": 245300,
  "impressions": 1200000,
  "collected_at": "2026-04-15T14:30:00.000Z"
}
```

### `GET /api/content/{contentId}/metrics`

Returns engagement metrics for a specific post.

**Auth:** Requires profile ownership  
**Cache:** Yes (1 hour)

**Response:**
```json
{
  "id": "uuid",
  "content_id": "post-789",
  "likes": 456,
  "comments": 23,
  "shares": 12,
  "saves": 89,
  "reach": 45000,
  "collected_at": "2026-04-15T14:30:00.000Z"
}
```

### `GET /api/analytics/{profileId}/posts?limit=30`

Returns recent posts with engagement metrics.

**Auth:** Requires profile ownership  
**Query params:** `limit` (default: 30, max: 100)  
**Cache:** Yes (1 hour)

**Response:**
```json
[
  {
    "id": "uuid",
    "content_id": "post-1",
    "timestamp": "2026-04-15T10:00:00.000Z",
    "media_type": "image",
    "likes": 456,
    "comments": 23,
    "shares": 12,
    "saves": 89,
    "reach": 45000,
    "engagement_rate": 2.58
  }
]
```

## Error Handling

### Ownership Violations
```
Status: 403 Forbidden
Message: "Access denied: profile belongs to another user"
```

### Rate Limiting (Instagram)
```
Status: 429 Too Many Requests
Message: "Instagram rate limit exceeded. Retry after 1 hour."
Action: Retry with exponential backoff (3 attempts)
```

### Python Service Down
```
Status: 503 Service Unavailable
Message: "Failed to collect metrics: [error details]"
Action: Retry with backoff, fallback to cache
```

### Missing Session
```
Status: 500 Internal Server Error
Message: "No Instagram session found for profile {profileId}"
Action: User must re-authenticate via OAuth flow
```

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| `getProfileMetrics()` | 5-10ms | SQLite lookup |
| `getProfileMetricsWithCache()` cache hit | 5-10ms | SQLite lookup + cache check |
| `getProfileMetricsWithCache()` cache miss | 2-5s | Python service call + 3 retries if needed |
| `getRecentPosts()` | 50-100ms | JOIN with content table |
| `getMetricsHistory()` | 100-200ms | 7-30 days of aggregated data |

## Security Considerations

### Authentication
- All endpoints require `userId` from JWT token in Authorization header
- `userId` matched against profile's `user_id` field

### Authorization
- Ownership check prevents cross-user data access
- No public endpoints exposing analytics data

### Data Protection
- Sensitive data (session tokens) encrypted at rest with AES-256-GCM
- Encryption key sourced from environment variable (never hardcoded)
- No session data logged in console output

### Rate Limiting
- Local Instagram API quota: ~200 calls/hour (enforced by 1h cache)
- HTTP rate limit: 100 req/min per authenticated user
- Retry logic prevents abuse from transient failures

## Integration with Story 6.1

This service fulfills Story 6.1 acceptance criteria:

- ✅ **Followers count correctly returned** — `getProfileMetrics()` → followers_count field
- ✅ **Engagement rate calculated** — Formula: `(likes + comments + shares) / reach * 100`
- ✅ **1-hour cache** — `CACHE_TTL_MS = 3600000ms` enforced in `getProfileMetricsWithCache()`
- ✅ **Rate-limiting retry** — `retryWithBackoff()` with 3x exponential backoff
- ✅ **Last 30 posts** — `getRecentPosts()` method with engagement metrics
- ✅ **ISO 8601 UTC timestamps** — All collected_at fields validated in tests

## Future Enhancements

1. **Background job for daily refresh** — Scheduled task to refresh historical data nightly
2. **Real-time webhooks** — Listen to Instagram webhooks for immediate metric updates
3. **Analytics aggregation** — Multi-profile rollup metrics (total followers across all profiles)
4. **Trend detection** — Alert on unusual engagement changes (spike/drop alerts)
5. **Competitor analytics** — Extend to track competitor profiles for Marina's insights

## References

- **Story:** `docs/stories/6.1.story.md`
- **Retry logic:** `packages/backend/src/utils/retry.ts` (Story 5.5)
- **Encryption:** `packages/backend/src/utils/encryption.ts`
- **Tests:** `packages/backend/src/services/__tests__/AnalyticsService.test.ts` (21 test cases)
