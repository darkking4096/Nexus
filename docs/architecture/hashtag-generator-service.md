# Hashtag Generator Service

**Story:** 3.9 — Caption & Hashtag Generation  
**Version:** 1.0  
**Date:** 2026-04-13

---

## Overview

The `HashtagGenerator` service enables intelligent generation of Instagram hashtags with automatic niche relevance detection, trending data integration, and shadowban detection to maximize post discoverability while maintaining quality.

### Key Features
- **Smart Generation:** 10-15 hashtags per request
- **Niche Relevance:** Minimum 8 niche-specific, maximum 2 generic
- **Trending Integration:** 5-6 trending, 5-6 niche-specific, 2-3 long-tail mix
- **Shadowban Detection:** Automatic validation against weekly-updated blocklist
- **Metadata:** Volume, competition score, recommendation confidence (0-1)
- **Integration Ready:** Compatible with Story 2.1 (trending) and Story 3.4 (profile analysis)

---

## Architecture

### Components

#### **HashtagGenerator** (`services/HashtagGenerator.ts`)
Main service orchestrating hashtag generation workflow.

**Responsibilities:**
- Load profile analysis (niche, audience size, vibe)
- Query trending hashtags from Story 2.1
- Score hashtags by relevance, volume, recency
- Filter shadowbanned hashtags
- Return top 10-15 with metadata

**Key Methods:**
```typescript
generateHashtags(request: GenerateHashtagsRequest): Promise<HashtagResult[]>
generateHashtagsForProfile(profileId: string, contentType: ContentType): Promise<HashtagResult[]>
scoreHashtag(hashtag: string, context: ScoringContext): number
```

#### **TrendingHashtagClient** (`services/TrendingHashtagClient.ts`)
Integration with Story 2.1 trending research service.

**Responsibilities:**
- Query trending hashtags by niche
- Cache results (max 24 hours)
- Handle rate limiting
- Provide fallback for unavailable data

**Key Methods:**
```typescript
getTrendingHashtags(niche: string, limit?: number): Promise<TrendingHashtag[]>
isCacheFresh(lastUpdate: Date): boolean
```

#### **ShadowbanValidator** (`utils/shadowban-validator.ts`)
Hashtag validation against shadowban blocklist.

**Responsibilities:**
- Check hashtag against weekly-updated shadowban list
- Flag suspicious hashtags with warning
- Automatically remove low-relevance shadowbanned tags
- Log removed hashtags for analytics

**Key Methods:**
```typescript
validateHashtag(hashtag: string): ValidationResult
isHashtagShadowbanned(hashtag: string): boolean
getShadowbanReason(hashtag: string): string | null
```

#### **Express Route Handler** (`routes/hashtags.ts`)
HTTP endpoint for hashtag generation API.

**Endpoint:**
```
POST /api/content/generate-hashtags
```

**Request Schema:**
```json
{
  "profileId": "inst_123",
  "contentType": "carousel|story|reel",
  "analysis": {
    "niche": "fitness",
    "audience": { "size": 25000, "engagement_rate": 0.04 },
    "vibe": "motivational"
  }
}
```

**Response:**
```json
{
  "hashtags": [
    {
      "hashtag": "#fitnessmotivation",
      "volume": 2500000,
      "competition": 0.85,
      "recommendationScore": 0.92,
      "category": "trending",
      "approved": true
    },
    ...
  ],
  "metadata": {
    "trendingCount": 6,
    "nicheCount": 6,
    "longTailCount": 2,
    "totalCount": 14,
    "shadowbanCount": 0,
    "generatedAt": "2026-04-13T14:30:00Z"
  }
}
```

---

## Scoring Algorithm

### Recommendation Score Formula

```
score = (relevance × 0.4) + (volume_fit × 0.3) + (recency × 0.2) + (not_shadowbanned × 0.1)

where:
  - relevance: niche match confidence (0-1)
  - volume_fit: optimal volume for account size (0-1)
  - recency: freshness if trending (0-1)
  - not_shadowbanned: binary (0 or 1)
```

### Volume Fit Logic

| Account Size | Optimal Volume Range | Score |
|--------------|----------------------|-------|
| Micro (< 10K) | 10K - 500K | 1.0 |
| Small (10K-100K) | 100K - 2M | 1.0 |
| Medium (100K-1M) | 500K - 10M | 1.0 |
| Macro (> 1M) | > 5M | 1.0 |

**Penalty:** -0.5 for volume outside optimal range

### Trending Category Distribution

| Category | Count | Volume Range | Recency |
|----------|-------|--------------|---------|
| Trending | 5-6 | > 100K | < 7 days |
| Niche-Specific | 5-6 | 10K - 100K | Any |
| Long-Tail | 2-3 | < 10K | Any |

---

## Data Flow

```
Input Request (profile, content type)
    ↓
Load Profile Analysis (Story 3.4)
    ├─ Niche: fitness, fashion, cooking, etc.
    ├─ Audience size: followers
    └─ Engagement rate: historical data
    ↓
Query Trending Hashtags (Story 2.1)
    ├─ Cache check (max 24h)
    └─ Fetch if stale
    ↓
Score Hashtags:
    ├─ Niche database lookup
    ├─ Calculate relevance score
    ├─ Adjust for account size
    └─ Apply trending boost if recent
    ↓
Filter Shadowbanned
    ├─ Check against weekly list
    ├─ Remove if approve = false
    └─ Flag if confidence < 0.3
    ↓
Select Top 10-15 by Score
    ├─ Ensure 5-6 trending
    ├─ Ensure 5-6 niche-specific
    └─ Ensure 2-3 long-tail
    ↓
Return with Metadata
    └─ Volume, competition, score per hashtag
```

---

## Hashtag Database Schema

```typescript
interface HashtagEntry {
  hashtag: string;
  niche: string;           // "fitness", "fashion", "cooking", etc.
  volume: number;          // Posts using this hashtag (approx)
  competition: number;     // 0-1 (higher = more competitive)
  category: string;        // "trending", "niche-specific", "long-tail"
  recency?: Date;          // Last updated (for trending)
  confidence: number;      // 0-1 (data confidence)
  alternativeFor?: string; // Replacement if shadowbanned
}
```

---

## Shadowban List Management

### Weekly Update Process

**Data Source:** Community-curated shadowban lists (Instagram engagement forums)

**Update Strategy:**
- Weekly refresh every Sunday 00:00 UTC
- Merge multiple sources for validation
- Remove false positives (hashtags with activity)
- Alert if update stale > 14 days

**Structure:**
```json
{
  "hashtags": [
    {
      "hashtag": "#follow4follow",
      "status": "shadowbanned",
      "confidence": 0.95,
      "dateAdded": "2026-04-05",
      "reason": "engagement_manipulation"
    }
  ],
  "lastUpdated": "2026-04-13T00:00:00Z",
  "source": "instagram_engagement_communities"
}
```

---

## Performance Characteristics

### Processing Pipeline

| Step | Time | Cache Status |
|------|------|--------------|
| Profile analysis load | ~50ms | Hit/Miss |
| Trending query | ~200ms | Cached (24h) |
| Scoring (10K hashtags) | ~300ms | CPU bound |
| Shadowban check | ~100ms | In-memory |
| Result aggregation | ~50ms | N/A |
| **Total** | **~700ms** | **With cache hit** |

### Database Queries

| Query | Index | Time |
|-------|-------|------|
| Hashtags by niche | `niche` | ~50ms |
| Shadowban list | `hashtag` (hash lookup) | ~10ms |
| Trending data | `recency, niche` | ~100ms |

---

## Error Handling

### Input Validation
- ✅ Profile ID existence check
- ✅ Content type validation (carousel, story, reel)
- ✅ Niche recognition (fallback to generic defaults)

### Processing Errors
- **Missing profile analysis:** Use generic niche defaults + confidence_score < 0.5 flag
- **Trending service unavailable:** Use cached data (up to 24h old)
- **Shadowban list stale:** Use with warning (log alert)
- **Hashtag database missing:** Return error with fallback

### Fallback Strategies
1. Generic niche defaults if analysis missing
2. Stale cache (24h) if trending service down
3. Manual shadowban list if auto-update failed
4. Safe mix (more long-tail) if trending data unavailable

---

## Security Considerations

### Input Validation
- ✅ Profile ID format validation
- ✅ Content type enum validation
- ✅ Niche string sanitization

### SQL Injection Prevention
- ✅ Parameterized queries for all database access
- ✅ No string concatenation in SQL

### Rate Limiting
- ✅ Story 2.1 integration caches trending (prevent API overload)
- ✅ Per-profile caching (5 min) to prevent duplicate queries
- ✅ Max 100 hashtag scores per minute per instance

---

## Testing

### Test Coverage
- ✅ 14/14 unit tests passing
- ✅ 85%+ code coverage
- ✅ All 5 ACs covered

### Test Scenarios
1. **AC-1:** Generation 10-15 hashtags across multiple niches
2. **AC-2:** Niche relevance validation (min 8 niche-specific, max 2 generic)
3. **AC-3:** Mix distribution (5-6 trending, 5-6 niche, 2-3 long-tail)
4. **AC-4:** Shadowban detection with mock blocklist
5. **AC-5:** Integration with Story 2.1 and Story 3.4

### Tested Niches
- Fitness
- Fashion
- Cooking
- Technology
- Travel

---

## Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| A/B testing | v2 | Test hashtag combinations |
| Predictive ranking | v2 | ML-based score optimization |
| Performance tracking | v2 | Per-hashtag engagement analytics |
| Custom blocklists | v2 | Brand-specific shadowban rules |
| Hashtag clustering | v2 | Group related hashtags |
| Real-time trending | v3 | Live trending data integration |

---

## Monitoring & Debugging

### Key Metrics
- `[HashtagGenerator] Processing time: {ms}ms`
- `[HashtagGenerator] Trending cache hit: {true|false}`
- `[HashtagGenerator] Shadowban count: {count}`
- `[HashtagGenerator] Average recommendation score: {score}`

### Alert Conditions
- Shadowban list stale > 14 days (HIGH priority)
- Trending service unavailable > 1 hour (MEDIUM priority)
- Hashtag database offline (CRITICAL priority)

### Common Issues
- **Cold-start new profile:** Generic defaults used, confidence_score < 0.5 flagged
- **Shadowban list outdated:** Weekly update job needs attention
- **Trending cache stale:** > 24h old data being used (check trending service)
- **All shadowbanned:** Niche too risky (consider alternative niches)

---

## Operational Requirements

### Data Ownership
- **Shadowban list:** Requires weekly update responsibility
- **Trending data:** Story 2.1 ownership (caching handled by HashtagGenerator)
- **Hashtag database:** Quarterly refresh recommended

### Configuration
```yaml
hashtag_generator:
  cache_ttl: 300           # Per-profile cache (seconds)
  trending_cache_ttl: 86400 # Trending data cache (24 hours)
  shadowban_refresh: weekly  # Every Sunday 00:00 UTC
  shadowban_warning_age: 14  # Days (alert if older)
  max_hashtags: 30          # Instagram limit
  min_recommendations: 10   # Minimum quality threshold
```

---

## Related Stories

- **Story 2.1:** Trend Research (trending hashtags source)
- **Story 3.4:** Profile Analysis (niche detection source)
- **Story 3.5:** Caption Generation (hashtags often paired with captions)
- **Story 3.10:** Asset Storage (hashtag set persistence)
- **Story 3.12:** Analytics (engagement per hashtag tracking)
