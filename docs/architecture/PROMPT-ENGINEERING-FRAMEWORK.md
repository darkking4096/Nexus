# Prompt Engineering Framework — Story 6.6

**Owner:** @architect (Aria)  
**Story:** 6.6 — AI-Powered Strategy Recommendations  
**Status:** Architecture Design (Blockers → Implementation)  
**Last Updated:** 2026-04-15

---

## Executive Summary

Story 6.6 generates strategic recommendations via Claude. **Risk: hallucinations + generic outputs** ("post more" instead of "post carousels 3x/week at 6pm").

This framework defines:
1. **Prompt Template** — Structured sections for maximum clarity
2. **Specificity Criteria** — What makes a recommendation "good"
3. **Validation Mechanism** — Automated checks before returning to user
4. **Test Strategy** — How to validate quality without manual review

---

## 1. Prompt Template Structure

### Section 1: Profile Context (Claude's "Understanding")

```
You are a strategic marketing advisor for Instagram growth.
You analyze Instagram performance data and generate actionable 
recommendations tailored to this specific profile's audience behavior.

CRITICAL: All recommendations MUST be specific to THIS profile's data.
Generic recommendations are unacceptable.
```

**Purpose:** Set role + constraints upfront. Prevent "I'll suggest generic best practices."

### Section 2: Profile Data (Claude's "Facts")

```
PROFILE ANALYSIS (Auto-populated from Stories 6.4 + 6.5):

Profile: {handle}
Analyzed Period: {date_range}
Total Posts: {count}
Avg Engagement Rate: {engagement}%

TOP PERFORMERS (Last 30 posts):
- Post A: {type}, Hook: {hook}, Engagement: 14.2%
- Post B: {type}, Hook: {hook}, Engagement: 12.8%
- Post C: {type}, Hook: {hook}, Engagement: 11.5%

BOTTOM PERFORMERS:
- Post X: {type}, Hook: {hook}, Engagement: 2.1%
- Post Y: {type}, Hook: {hook}, Engagement: 3.4%

ENGAGEMENT PATTERNS:
- Peak hour: 18:00 (avg engagement 12.5%)
- Lowest hour: 09:00 (avg engagement 7.2%)
- Carousel avg engagement: 14.2%
- Static post avg engagement: 8.5%
- Reel avg engagement: 9.8%
- Caption with emoji avg: 11.5%
- Caption without emoji avg: 9.7%

HISTORICAL CONTEXT:
- Follower growth trend: {trend}
- Engagement trend: {trend}
- Content pillar performance: {breakdown}
```

**Purpose:** Ground Claude in REAL DATA. No hallucination possible if facts are explicit.

### Section 3: Validation Instructions (Claude's "Constraints")

```
REQUIREMENTS FOR EACH RECOMMENDATION:

Every recommendation MUST have ALL of the following:
1. Priority: high | medium | low
2. Category: content_type | publishing_schedule | caption | hashtags | engagement_hooks | audio_selection | call_to_action
3. Action: Specific, measurable instruction (NOT generic)
4. Reasoning: Reference EXACT data points from the profile analysis
5. Data Backing: Show the numbers that support this recommendation
6. Estimated Impact: Quantify expected outcome

SPECIFICITY RULES (REQUIRED):
✅ GOOD: "Publish carousels 3x per week at 18:00. Last 3 carousels avg 14.2% engagement vs 8.5% for static posts."
❌ BAD: "Post more carousels"

✅ GOOD: "Shift publication time to 18:00-19:00 (peak engagement window). Posts at 18:00 avg 12.5% engagement vs 7.2% at 09:00."
❌ BAD: "Post at peak times"

✅ GOOD: "Include 2-3 emojis in captions. Posts with emojis avg 11.5% engagement vs 9.7% without."
❌ BAD: "Use emojis more"

✅ GOOD: "Replace current hashtag strategy with {specific_hashtags}. Your top post used these and reached {reach}."
❌ BAD: "Research better hashtags"

DEDUPLICATION RULE:
- Do NOT recommend the same action twice (even with different wording)
- If "post carousels" is already recommended, don't suggest it again
- If two recs target the same improvement, merge them or pick the higher-impact one

RANKING:
- Order recommendations by estimated_impact DESC (highest impact first)
- Top 2-3 should be quick wins (implementable this week)
- Max 10 recommendations (stop after 10 even if more exist)
```

**Purpose:** Tell Claude EXACTLY what "good" looks like. Remove ambiguity.

### Section 4: Examples (Claude's "Calibration")

```
EXAMPLE OUTPUT (GOOD):

{
  "priority": "high",
  "category": "content_type",
  "action": "Prioritize carousel posts: publish 3 per week. Your last 5 carousels averaged 14.2% engagement vs 8.5% for static posts.",
  "reasoning": "Data shows carousel dominates your top 3 posts (all carousels). Clear format preference in your audience.",
  "data_backing": {
    "carousel_avg_engagement": 14.2,
    "static_post_avg_engagement": 8.5,
    "top_3_posts": ["carousel", "carousel", "carousel"],
    "sample_size": 30
  },
  "estimated_impact": {
    "engagement_increase_pct": 25,
    "follower_impact": "moderate",
    "confidence": "high"
  }
}

EXAMPLE OUTPUT (BAD — REJECT):

{
  "action": "Post more engaging content"  ← TOO VAGUE
}

{
  "action": "Use carousels",  ← MISSING: frequency, data backing
  "data_backing": null  ← REQUIRED FIELD
}

{
  "action": "Post carousels 3x/week",
  "reasoning": "Carousels are popular on Instagram"  ← NOT SPECIFIC TO THIS PROFILE
}
```

**Purpose:** Show Claude good vs bad patterns side-by-side.

### Full Prompt Template (Combined)

```
You are a strategic marketing advisor for Instagram growth.
You analyze Instagram performance data and generate actionable 
recommendations tailored to this specific profile's audience behavior.

CRITICAL: All recommendations MUST be specific to THIS profile's data.
Generic recommendations are unacceptable.

---

PROFILE ANALYSIS:

Profile: {handle}
Analyzed Period: {date_range}
Total Posts: {count}
Avg Engagement Rate: {engagement}%

[TOP PERFORMERS, BOTTOM PERFORMERS, PATTERNS - as above]

---

REQUIREMENTS FOR EACH RECOMMENDATION:

Every recommendation MUST have ALL of the following:
1. Priority: high | medium | low
2. Category: content_type | publishing_schedule | caption | hashtags | engagement_hooks | audio_selection | call_to_action
3. Action: Specific, measurable instruction (NOT generic)
4. Reasoning: Reference EXACT data points from the profile analysis
5. Data Backing: Show the numbers that support this recommendation
6. Estimated Impact: Quantify expected outcome

SPECIFICITY RULES:
✅ GOOD: "Publish carousels 3x per week at 18:00. Last 3 carousels avg 14.2% engagement vs 8.5% for static posts."
❌ BAD: "Post more carousels"

[Additional examples - as above]

DEDUPLICATION RULE:
- Do NOT recommend the same action twice
- Max 10 recommendations total

---

Generate 5-10 strategic recommendations for {handle}. 
Return as JSON array. Each object MUST include all required fields.

[EXAMPLE OUTPUT section - as above]

Return ONLY valid JSON. No preamble. No explanation. JSON array of recommendation objects.
```

---

## 2. Specificity Criteria (What Makes a Recommendation "Good")

| Criterion | Check | Example |
|-----------|-------|---------|
| **Data-backed** | Has `data_backing` object with ≥1 metric? | ✅ "14.2% avg for carousels" |
| **Actionable** | Can user implement this week? | ✅ "3 carousels/week at 18:00" ❌ "post more" |
| **Specific** | Mentions concrete numbers/times/frequencies? | ✅ "18:00-19:00" ❌ "peak hours" |
| **Unique** | Not a duplicate of another rec in the list? | ✅ First mention of carousels ❌ "Post carousels" twice |
| **Grounded** | References THIS profile's actual data? | ✅ "Your top posts are carousels" ❌ "Carousels are popular" |
| **Quantified** | Estimated impact is explicit? | ✅ "25% engagement increase" ❌ "better performance" |

---

## 3. Validation Mechanism (Automated Checks)

**Before returning recommendations to user, @dev MUST implement these checks:**

### 3.1 Schema Validation

```javascript
function validateRecommendation(rec) {
  const required = ['priority', 'category', 'action', 'reasoning', 'data_backing', 'estimated_impact'];
  const missing = required.filter(field => !rec[field]);
  
  if (missing.length > 0) {
    throw new Error(`Recommendation missing required fields: ${missing.join(', ')}`);
  }
  
  if (!['high', 'medium', 'low'].includes(rec.priority)) {
    throw new Error(`Invalid priority: ${rec.priority}`);
  }
  
  if (typeof rec.action !== 'string' || rec.action.length < 20) {
    throw new Error(`Action too short or not a string: "${rec.action}"`);
  }
  
  if (!rec.data_backing || Object.keys(rec.data_backing).length === 0) {
    throw new Error(`data_backing is empty or missing metrics`);
  }
  
  return true;
}
```

**Stops:** Recommendations missing required fields, invalid priorities, empty data_backing.

### 3.2 Generic-ness Detection

```javascript
function isGeneric(action) {
  const genericPatterns = [
    /^post more/i,
    /^use .+/i,  // "Use hashtags", "Use emojis"
    /^research /i,
    /^try /i,
    /^test /i,
    /^improve /i,
    /^increase /i,
    /^boost /i,
    /^grow /i,
    /^best practice/i,
    /^follow best practices/i
  ];
  
  return genericPatterns.some(pattern => pattern.test(action));
}
```

**Stops:** Actions like "post more", "use hashtags", "improve engagement".

### 3.3 Data-Grounded Check

```javascript
function isDataGrounded(rec, profileData) {
  const action = rec.action.toLowerCase();
  const dataBackingStr = JSON.stringify(rec.data_backing).toLowerCase();
  
  // Action mentions a metric → data_backing MUST contain that metric
  if (action.includes('carousel') && !dataBackingStr.includes('carousel')) {
    throw new Error(`Action mentions carousels but data_backing doesn't`);
  }
  
  if (action.includes('18:00') && !dataBackingStr.includes('18:00')) {
    throw new Error(`Action mentions 18:00 but data_backing doesn't`);
  }
  
  // Data backing metrics MUST match profile data
  const metrics = rec.data_backing;
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === 'number' && !profileData.metrics[key]) {
      console.warn(`Metric ${key} not found in profile data (hallucination risk)`);
    }
  }
  
  return true;
}
```

**Warns:** Metric mismatches (e.g., action says "carousels" but data_backing doesn't mention them).

### 3.4 Deduplication Check

```javascript
function deduplicateRecommendations(recs) {
  const seen = new Set();
  return recs.filter(rec => {
    // Normalize action: lowercase, remove punctuation
    const normalized = rec.action.toLowerCase().replace(/[^\w\s]/g, '');
    
    // Check if similar action already seen
    for (const s of seen) {
      const similarity = levenshteinDistance(normalized, s) / Math.max(normalized.length, s.length);
      if (similarity > 0.85) {  // 85% similarity = likely duplicate
        return false;  // Reject this rec
      }
    }
    
    seen.add(normalized);
    return true;
  });
}
```

**Stops:** "Post carousels 3x/week" + "Include carousels in content" (duplicates).

### 3.5 Fallback: Request Regeneration

```javascript
async function generateRecommendations(profileData, analysisData) {
  let attempt = 0;
  const maxAttempts = 2;
  
  while (attempt < maxAttempts) {
    const recs = await claude.generate(prompt, { profile: profileData });
    const validated = recs.map(validateRecommendation);
    const deduped = deduplicateRecommendations(validated);
    
    if (deduped.length >= 5) {  // Minimum 5 valid recs
      return deduped;
    }
    
    // Too many rejections → ask Claude to try again
    attempt++;
    if (attempt < maxAttempts) {
      console.log(`Attempt ${attempt}: ${deduped.length}/5 recs valid. Retrying...`);
      // Append to prompt: "Previous attempt yielded too many generic recs. Be MORE SPECIFIC."
    }
  }
  
  throw new Error(`Could not generate 5+ valid recommendations after ${maxAttempts} attempts`);
}
```

**Behavior:** If Claude generates too many generic/invalid recs, retry once with explicit instruction "Be MORE SPECIFIC."

---

## 4. Test Strategy

### 4.1 Unit Tests: Validation Logic

```javascript
describe('Recommendation Validation', () => {
  test('rejects missing data_backing', () => {
    const rec = {
      priority: 'high',
      action: 'Post carousels 3x/week',
      // data_backing: missing
    };
    expect(() => validateRecommendation(rec)).toThrow();
  });
  
  test('rejects generic "post more"', () => {
    expect(isGeneric('Post more carousels')).toBe(true);
    expect(isGeneric('Post carousels 3x/week')).toBe(false);
  });
  
  test('deduplicates similar actions', () => {
    const recs = [
      { action: 'Post carousels 3x per week' },
      { action: 'Include carousels 3x/week' }  // 88% similar
    ];
    expect(deduplicateRecommendations(recs)).toHaveLength(1);
  });
});
```

### 4.2 Integration Tests: Claude Output + Validation

```javascript
describe('Recommendation Generation', () => {
  test('generates 5+ valid recommendations from real profile data', async () => {
    const mockProfile = {
      handle: 'test_account',
      engagement: 9.5,
      metrics: {
        carousel_avg: 14.2,
        static_avg: 8.5,
        peak_hour: 18
      }
    };
    
    const recs = await generateRecommendations(mockProfile, {});
    expect(recs).toHaveLength(expect.any(Number));
    expect(recs.length).toBeGreaterThanOrEqual(5);
    expect(recs.length).toBeLessThanOrEqual(10);
    
    recs.forEach(rec => {
      expect(rec).toHaveProperty('priority');
      expect(rec).toHaveProperty('action');
      expect(rec.data_backing).not.toBeNull();
      expect(isGeneric(rec.action)).toBe(false);
    });
  });
});
```

### 4.3 Acceptance Tests: "Golden Output" Samples

Create 5-10 sample profiles with manually-validated expected recommendations.

```javascript
describe('Golden Output Samples', () => {
  const goldenSamples = [
    {
      name: 'carousel-dominant-account',
      profile: { /* data */ },
      expectedRecs: [
        {
          action: 'Publish carousels 3x per week at 18:00',
          priority: 'high',
          expectedImpact: 25
        },
        // ...
      ]
    }
  ];
  
  goldenSamples.forEach(sample => {
    test(`generates correct recs for ${sample.name}`, async () => {
      const recs = await generateRecommendations(sample.profile, {});
      const topRec = recs[0];
      
      expect(topRec.action).toContain('carousel');
      expect(topRec.priority).toBe('high');
      expect(topRec.estimated_impact.engagement_increase_pct).toBe(sample.expectedRecs[0].expectedImpact);
    });
  });
});
```

---

## 5. Implementation Checklist (@dev)

- [ ] Implement `validateRecommendation()` — Schema + priority checks
- [ ] Implement `isGeneric()` — Pattern detection for generic actions
- [ ] Implement `isDataGrounded()` — Verify actions match data_backing
- [ ] Implement `deduplicateRecommendations()` — Levenshtein-based similarity (85%+)
- [ ] Implement `generateRecommendations()` — Main flow with fallback retry
- [ ] Build prompt template in `RecommendationService.ts` (context + data + constraints + examples)
- [ ] Unit tests for validation logic (75%+ coverage on validation functions)
- [ ] Integration tests with mock Claude responses
- [ ] Create 5-10 golden output samples + acceptance tests
- [ ] Lint + typecheck pass
- [ ] CodeRabbit review for prompt engineering best practices

---

## 6. Risk Mitigation

| Risk | Mitigation | Owner |
|------|-----------|-------|
| Claude hallucination | Explicit data sections + data_backing validation | @dev (validation) |
| Generic recommendations | Specificity patterns + `isGeneric()` detection | @dev (validation) |
| Duplicate recommendations | `deduplicateRecommendations()` at 85% similarity | @dev (validation) |
| Performance (slow Claude call) | Cached recommendations (7 days) + async endpoint option | @dev (caching) |
| Test coverage gaps | Golden output samples + acceptance tests | @qa (test strategy) |

---

## 7. Success Criteria

- ✅ All recommendations have `data_backing` with ≥1 metric
- ✅ All recommendations pass `isGeneric()` check (0 false positives)
- ✅ All recommendations are specific to profile's actual data (no hallucinations)
- ✅ No duplicate recommendations in response (deduplication 100%)
- ✅ 5-10 recommendations returned in <10s (can be async if >5s)
- ✅ Unit tests: 75%+ coverage on validation logic
- ✅ Integration tests: 5+ golden output samples passing
- ✅ Manual validation: Review 5 real responses, all recommendations actionable ✅

---

**Next Step:** @dev implements validation logic + prompt template (see Implementation Checklist).  
**Timeline:** 1-2 days for validation logic + tests, 1 day for integration with Claude API.

