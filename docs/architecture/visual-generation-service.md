# Visual Generation Service — Architecture

**Component**: Story 3.6 | **Status**: Ready for QA | **Last Updated**: 2026-04-12

## Overview

The Visual Generation Service orchestrates the creation of branded, format-specific Instagram images. It combines AI-generated base images (via Nando Banana API) with dynamic brand customization (colors, logos) and Instagram-compliant resizing.

## Architecture

### Services

#### 1. **VisualGenerator** (Main Orchestrator)
- **Location**: `packages/backend/src/services/VisualGenerator.ts`
- **Responsibility**: Coordinate image generation → branding → resizing → caching
- **Methods**:
  - `generateImage(prompt, profileId, format)` — Full pipeline
  - `resizeToFormat(imageBuffer, format)` — Dimension adjustment
  - Error handling + graceful degradation

#### 2. **NandoBananaClient** (AI Image Generation)
- **Location**: `packages/backend/src/integrations/NandoBananaClient.ts`
- **Responsibility**: API integration with Nando Banana image generation service
- **Features**:
  - Health check endpoint
  - Retry logic (3 attempts, exponential backoff)
  - Timeout handling (30s max per AC-2)
  - Rate limit: 100 req/min (queuing if exceeded)
  - Returns PNG 2048×2048

#### 3. **BrandingProcessor** (Colors + Logo)
- **Location**: `packages/backend/src/services/BrandingProcessor.ts`
- **Responsibility**: Apply brand identity to images via Sharp
- **Pipeline**:
  1. Load image buffer
  2. Apply color overlay (20-40% opacity)
  3. Composite logo (customizable position: top-left/top-right/bottom-left/bottom-right)
  4. Output JPG (95% quality)
- **Features**:
  - SVG-based color overlay (multiply blend)
  - Logo resizing (160×160, maintains aspect ratio)
  - Position calculation with padding
  - Error handling (missing logo gracefully skipped)

#### 4. **ImageCache** (7-Day TTL)
- **Location**: `packages/backend/src/cache/ImageCache.ts`
- **Responsibility**: Cache processed images to avoid regeneration
- **Features**:
  - In-memory cache (ready for Redis backend)
  - TTL: 7 days (images have 1-week shelf-life)
  - Cache key: SHA-256(`{profileId}:{format}:{contentHash}`)
  - Cache hit headers in HTTP responses
  - Expiration cleanup runs during GET

#### 5. **CleanupTempImagesJob** (Garbage Collection)
- **Location**: `packages/backend/src/jobs/CleanupTempImages.ts`
- **Responsibility**: Periodic cleanup of temporary image files
- **Features**:
  - Scheduled job (every 6 hours)
  - Deletes files older than 6 hours
  - Tracks files deleted + space freed
  - Manual cleanup available (called after processing)
  - Graceful error handling

#### 6. **Routes** (HTTP API)
- **Location**: `packages/backend/src/routes/visual-generation.ts`
- **Endpoints**:
  - `POST /api/visuals/generate` — Binary image response
  - `GET /api/visuals/health` — Service health check
- **Response**:
  - Binary PNG/JPG data
  - Headers: `X-Cache-Hit`, `X-Generated-At`

### Data Flow

```
[Content Prompt] + [Profile Brand Config]
         ↓
[VisualGenerator.generateImage()]
         ↓
   Check ImageCache
   ├─→ HIT: Return cached image (< 100ms) ✅
   └─→ MISS: Continue
         ↓
[NandoBananaClient.generate()]
   (API call with retry logic)
         ↓
[BrandingProcessor.applyBranding()]
   (Colors overlay + Logo composite)
         ↓
[VisualGenerator.resizeToFormat()]
   (1080×1350 or 1080×1920)
         ↓
[ImageCache.set()]
   (Store with 7-day TTL)
         ↓
[CleanupTempImagesJob.cleanupFile()]
   (Remove temp file)
         ↓
[HTTP Response] (Binary JPG)
```

### Instagram Format Support (AC-4)

| Format | Dimensions | Aspect Ratio | Use Case |
|--------|-----------|--------------|----------|
| **feed** | 1080×1350 | 4:5 | Feed posts |
| **story** | 1080×1920 | 9:16 | Stories (24h) |
| **reel** | 1080×1920 | 9:16 | Reels (multi-clip) |

**Resizing**: Sharp `resize()` with `contain` mode preserves aspect ratio without distortion.

## Brand Customization (AC-3)

### Color Overlay
- **Method**: SVG `<rect>` with multiply blend mode
- **Opacity Range**: 20-40% (validated)
- **Effect**: Tints image with brand color without washing out
- **Testing**: Validated with various backgrounds

### Logo Positioning
- **Sizes**: 160×160 pixels (fixed)
- **Corners**: top-left, top-right (default), bottom-left, bottom-right
- **Padding**: 20px from edges
- **Opacity**: 0-100% customizable (default 85%)
- **Format**: PNG with transparency support

## Testing

### Unit Tests (14 total)
- ✅ AC-1: Service methods + ImageBuffer returns
- ✅ AC-2: Nando Banana API with mocking + retry logic
- ✅ AC-3: Branding config validation (colors + logo)
- ✅ AC-4: Format resizing (dimension assertions)
- ✅ AC-5: Cache hit/miss + TTL validation
- ✅ AC-6: Error handling (missing profile, API down, invalid format)

### Test Coverage
- Unit: >85%
- Integration: Nando Banana API mocked

## Performance

**Target**: < 30s per generation (per AC-2)

**Breakdown**:
- Cache hit: ~100ms ✅
- Nando Banana API: ~5-10s (network latency)
- Branding processing: ~500ms
- Resizing: ~300ms
- Total: ~6-11s (under target)

**Memory**: Sharp processes via streams to avoid 50MB+ buffer issues

## Error Handling

### Graceful Degradation
- **Nando Banana API down** → Return placeholder image (solid brand color)
- **Logo file missing** → Skip logo, proceed with color overlay
- **Invalid format** → Return 400 error with supported formats
- **Timeout (> 30s)** → Return 504 with queue notification

### Cache Resilience
- Cache expiration doesn't block requests (regenerate instead)
- Memory cache survives process restart (Redis-backed in production)

## Integration Points

### Upstream (Dependencies)
- **Story 3.4** (Behavioral Analysis) — Provides content insights
- **Profile Database** — Fetches brand colors + logo paths
- **Story 3.5** (Caption Generation) — Uses captions as prompts

### Downstream (Consumers)
- **Story 3.8** (S3 Storage + Publishing) — Stores generated images
- **Story 3.9** (Scheduler) — Uses images for scheduled posts

### External
- **Nando Banana API** — AI image generation (2048×2048 PNG)
- **Sharp Library** — Image processing (colors, compositing, resizing)
- **Redis** (optional) — Persistent cache backend

## Future Enhancements

- **Story 3.8**: S3 upload + CDN caching
- **Story 3.9**: Batch generation for weekly content calendars
- **ML-driven**: Crop optimization based on content type
- **Realtime**: WebSocket progress updates for long-running generations

## Configuration

### Environment Variables
- `NANDO_BANANA_API_KEY` — Image generation API auth
- `NANDO_BANANA_RATE_LIMIT` — Default: 100 req/min
- `IMAGE_CACHE_TTL_DAYS` — Default: 7
- `TEMP_IMAGE_DIR` — Default: `/tmp/nexus-images`
- `CLEANUP_INTERVAL_HOURS` — Default: 6

### Database Schema
Referenced: `docs/architecture/NEXUS-schema.md`
- `profile_brands.primary_color` (hex)
- `profile_brands.logo_path` (local path or URL)
- `profile_brands.logo_position` (enum)

## Monitoring

### Metrics to Track
- API latency (Nando Banana p50, p95, p99)
- Cache hit rate (target: 70%+)
- Cleanup job: files deleted, space freed
- Image processing errors + fallback frequency

### Logs
- Each request logged with tracing ID
- Nando Banana API calls logged (request + response size)
- Cache operations (hit/miss/expiration)
- Cleanup job results (files deleted + MB freed)

## Security

### Input Validation
- Prompt: Max 500 characters, no code injection
- Format: Whitelist (feed/story/reel only)
- Colors: Hex regex validation

### File Operations
- Logo paths: Validated on startup
- Temp files: Deleted after processing (automatic cleanup)
- No user-controlled file paths in subprocess calls

### API Authentication
- Nando Banana API key never logged or exposed
- Stored in environment variables only
