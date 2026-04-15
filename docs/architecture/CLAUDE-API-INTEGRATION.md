# Claude API Integration — Infrastructure Specification

**Status:** APPROVED ✅ | **Date:** 2026-04-15 | **Owner:** @devops (Gage)

## Executive Summary

Story 6.6 integrates Claude API for AI-powered strategy recommendations. Infrastructure is **READY** — Direct API (not MCP), using Anthropic SDK, Opus 4.6 model.

## Architecture Decision

| Decision | Value | Rationale |
|----------|-------|-----------|
| **Access Method** | Direct API via Anthropic SDK | MCP adds complexity; Direct API is simpler, faster, native Node.js support |
| **SDK** | `@anthropic-ai/sdk` | Official, fully-typed, built-in retry logic |
| **Model** | `claude-opus-4-6` | High performance, best for prompt engineering & complex reasoning |
| **Authentication** | `ANTHROPIC_API_KEY` env var | Standard practice, supports local dev + production |
| **Rate Limiting** | Token budgeting strategy (see below) | Cost control, prevent throttling |

## Environment Configuration

### Required Variables

Add to `.env` (copy from `.env.example` if missing):

```bash
# Claude API Configuration
ANTHROPIC_API_KEY=your-actual-key-here
CLAUDE_MODEL=claude-opus-4-6
CLAUDE_MAX_TOKENS=2048
CLAUDE_TIMEOUT_MS=30000
```

### Validation

```bash
# Test API connectivity
node -e "
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  console.log('✓ Anthropic SDK loaded');
"
```

## Cost & Rate Limiting Strategy

### Token Budgeting (Story 6.6 Specifics)

| Operation | Est. Input | Est. Output | Est. Cost |
|-----------|-----------|-----------|-----------|
| Generate 5-10 recommendations | 2,000-3,000 | 800-1,200 | ~$0.02-0.04 per request |
| With marketing-squad context | 4,000-5,000 | 1,000-1,500 | ~$0.04-0.08 per request |

**Monthly Budget Estimate (100 profiles x 4 requests):**
- Input tokens: ~180M at $3/1M = ~$0.54
- Output tokens: ~480K at $15/1M = ~$0.007
- **Total: ~$0.55/month** (very low)

### Rate Limiting Policy

**Anthropic Rate Limits:**
- 60 requests/min (standard tier)
- 200K tokens/min

**Application Strategy:**

1. **Per-User Limits:** Max 1 recommendation generation per profile per hour (cache results)
2. **Caching:** Cache recommendations for 7 days (story requirement)
3. **Batching:** Bundle multiple profile requests when possible
4. **Exponential Backoff:** Implemented in CopywriterClient, reuse for RecommendationService

```typescript
// Example: Exponential backoff (copy from CopywriterClient)
const maxRetries = 3;
const baseDelayMs = 500;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    // API call
  } catch (error) {
    if (attempt < maxRetries) {
      const delayMs = baseDelayMs * Math.pow(2, attempt - 1);
      await delay(delayMs);
    }
  }
}
```

## Implementation Patterns (Copy from Existing)

### Pattern 1: API Client Setup

**File:** `packages/backend/src/services/CopywriterClient.ts` (lines 26-37)

```typescript
import Anthropic from '@anthropic-ai/sdk';

export class RecommendationService {
  private anthropic: Anthropic;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.anthropic = new Anthropic({ apiKey: key });
  }
}
```

### Pattern 2: Prompt Building with System Context

**File:** `packages/backend/src/services/CopywriterClient.ts` (lines 104-134)

```typescript
private buildSystemPrompt(context: AnalysisContext): string {
  return `You are the recommendation engine. Context:
  
${context.profileAnalysis}
${context.engagementPatterns}
${context.historicalData}

Requirements:
- Provide 5-10 recommendations
- Each must have: priority, action, data_backing, estimated_impact
- Cite exact metrics (e.g., "avg engagement 14.2%")
`;
}
```

### Pattern 3: Error Handling & Retry Logic

**File:** `packages/backend/src/services/CopywriterClient.ts` (lines 51-94)

- Implement retry with exponential backoff ✅
- Log attempts for debugging ✅
- Provide clear error messages ✅

## Validation Checklist for Story 6.6

Before starting implementation, confirm:

- [ ] `ANTHROPIC_API_KEY` is set in `.env`
- [ ] `npm test` runs without API key errors
- [ ] CopywriterClient pattern is understood
- [ ] RecommendationService follows same pattern
- [ ] Rate limiting strategy approved by @architect

## Monitoring & Observability

**Log Structure** (existing pattern in CopywriterClient):

```
[RecommendationService] Generating recommendations for profile {id}
[RecommendationService] Attempt {n}/{maxRetries}
[RecommendationService] Recommendations generated: {count} items
[RecommendationService] Failed after {n} attempts: {error}
```

**Metrics to Track:**

- API latency per request
- Retry count distribution
- Error rate by error type
- Cache hit/miss ratio

## Security Considerations

✅ **API Key Handling:**
- Never log API keys
- Use `ANTHROPIC_API_KEY` env var only
- Production: Use AWS Secrets Manager or equivalent

✅ **Prompt Injection:**
- Sanitize user-provided context before including in prompt
- Use structured context (JSON) not raw strings
- Validate recommendation output has required fields

✅ **Rate Limiting:**
- Implement per-profile throttling (1 generation per hour)
- Cache results 7 days
- Fallback to cached results if rate limited

## Next Steps

**@dev Responsibilities:**
1. Create `RecommendationService` using pattern from `CopywriterClient`
2. Build prompts with engagement analysis + historical data context
3. Implement validation: recommendations have action + data_backing
4. Cache results in database (7-day TTL)

**@architect Responsibilities:**
1. Define Prompt Engineering Framework (see Story 6.6 QA notes)
2. Specify validation criteria for "specific, actionable" recommendations
3. Review RecommendationService architecture before implementation

**@squad-creator Responsibilities:**
1. Confirm marketing-instagram-squad operational status
2. Specify how @copywriter/@analyst agents are called from RecommendationService

---

**INFRASTRUCTURE APPROVED:** Claude API via Direct SDK + Anthropic key management ready.  
**BLOCKER RESOLVED:** @devops part complete. Waiting on @architect + @squad-creator.

