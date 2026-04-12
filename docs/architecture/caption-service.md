# Caption Generation Service — Architecture

**Component**: Story 3.5 | **Status**: Ready for QA | **Last Updated**: 2026-04-12

## Overview

The Caption Generation Service (`CaptionGenerator.ts`) orchestrates the conversion of Instagram profile behavioral analysis into multiple creative caption options. It integrates with the @copywriter marketing squad agent via Claude API to ensure editorial quality and framework alignment.

## Architecture

### Services

#### 1. **CaptionGenerator** (Main Orchestrator)
- **Location**: `packages/backend/src/services/CaptionGenerator.ts`
- **Responsibility**: Coordinate profile analysis → caption generation → copywriter refinement
- **Methods**:
  - `generateCaptions(profileId, analysisData, captionTypes)` — Main entry point
  - Fetches profile branding tone from database
  - Calls CopywriterClient for AI-powered generation
  - Applies fallback templates if API unavailable
  - Validates output against Instagram guidelines

#### 2. **CopywriterClient** (Squad Integration)
- **Location**: `packages/backend/src/services/CopywriterClient.ts`
- **Responsibility**: Claude API integration with marketing frameworks
- **Frameworks Embedded**:
  - AIDA (Attention → Interest → Desire → Action)
  - 5 Levels of Awareness (Eugene Schwartz)
  - Value Equation (Alex Hormozi)
  - Emotional triggers & curiosity gaps
- **Features**:
  - Exponential backoff retry (500ms → 1s → 2s)
  - Timeout handling (~1s per call)
  - Confidence scoring (0-100)
  - Graceful fallback to templates

#### 3. **Routes** (HTTP API)
- **Location**: `packages/backend/src/routes/generation.ts`
- **Endpoint**: `POST /api/content/generate-caption`
- **Request Schema**:
  ```typescript
  {
    profile_id: string,
    analysis: BehavioralAnalysis,
    caption_types: ["hook" | "teaser" | "cta"],
    include_hashtags: boolean
  }
  ```
- **Response Schema**:
  ```typescript
  {
    captions: Caption[],
    metadata: {
      brand_tone: string,
      copywriter_confidence: number,
      generated_at: timestamp
    }
  }
  ```

### Data Flow

```
[Instagram Profile Analysis] (from Story 3.4)
         ↓
[CaptionGenerator.generateCaptions()]
         ↓
   ┌─────┴─────┐
   ↓           ↓
[CopywriterClient]  [Template Fallback]
   ↓           ↓
   └─────┬─────┘
         ↓
  [Caption Validation]
    - Length: 50-150 chars (non-hashtag)
    - Hashtags: 3-5 max
    - Blocked words check
         ↓
  [HTTP Response]
```

## Brand Tones (AC-3)

### Casual
- Emojis: 1-2 per caption
- Tone: Friendly, approachable
- CTAs: Soft ("Swipe up", "Tag a friend")
- Example: "🎉 New vibes unlocked! What do you think? 👇"

### Profissional
- Emojis: None
- Tone: Formal, authoritative
- CTAs: Direct ("Learn more", "Contact us")
- Example: "Introducing our latest enterprise solution. Industry-leading performance."

### Viral
- Emojis: 3-5 per caption
- Tone: Provocative, FOMO-driven
- CTAs: Urgent ("Limited time", "Don't miss out")
- Example: "This won't last long 🔥 Are you in or out? 🚀"

## Integration Points

### Upstream (Dependencies)
- **Story 3.4** (Behavioral Analysis) — Provides analysis data
- **Profile Database** — Fetches brand tone + hashtag rules

### Downstream (Consumers)
- **Story 3.7** (Caption Storage) — Accepts generated captions
- **Story 3.8** (Publishing Pipeline) — Uses captions for scheduling

### External
- **Claude API** (Opus 4.6) — AI-powered caption refinement
- **Marketing Squad** (@copywriter agent) — Framework alignment

## Testing

### Unit Tests (13 total)
- ✅ AC-1: Endpoint functional
- ✅ AC-2: Multiple options (3 captions per request)
- ✅ AC-3: Brand tones (casual, profissional, viral)
- ✅ AC-4: Copywriter integration + confidence scoring
- ✅ AC-5: Validation (length, hashtags, blocked words)
- ✅ Error handling (missing profile, API failures)

### Test Coverage
- Unit: >85%
- Integration: CopywriterClient mocked (ready for e2e)

## Performance

**Target**: < 3s per generation (including copywriter call)

**Breakdown**:
- Profile fetch: ~100ms
- Copywriter API: ~1-2s (with retry backoff)
- Validation: ~50ms
- Total: ~1.2-2.2s (under target)

**Caching**: Not implemented in this story (delegated to Story 3.7)

## Error Handling

### Graceful Degradation
- If copywriter squad unavailable → Use template-based captions (60% confidence)
- If database connection fails → Return 500 with retry guidance
- If Instagram guidelines validation fails → Return 400 with specific constraint violation

### Confidence Scoring
- Copywriter-based: 70-95 (AI-generated + framework aligned)
- Template-based: 60 (pre-written fallback)
- Threshold: If < 50%, return error (requires manual review)

## Future Enhancements

- **Story 3.7**: Cache generated captions by brand tone
- **Story 3.8**: A/B testing framework (track caption performance)
- **Story 3.9**: Auto-scheduling based on optimal posting times
- **ML-driven**: Sentiment analysis + emotional tone prediction

## Configuration

### Environment Variables
- `CLAUDE_API_KEY` — Anthropic API authentication
- `COPYWRITER_MODEL` — Default: `claude-opus-4-6`
- `RETRY_BACKOFF_MS` — Default: `[500, 1000, 2000]`

### Database Schema
Referenced: `docs/architecture/NEXUS-schema.md` (profile_brands table)

## Monitoring

### Metrics to Track
- API latency (p50, p95, p99)
- Caption quality (confidence score distribution)
- Copywriter API success rate
- Template fallback frequency

### Logs
- Each call logged with request ID for tracing
- Errors include stack trace + context for debugging
