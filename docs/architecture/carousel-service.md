# Carousel Generation Service

**Story:** 3.7 — Carousel Generation (SVG Overlay)  
**Version:** 1.0  
**Date:** 2026-04-13

---

## Overview

The `CarouselGenerator` service enables automated generation of Instagram carousels from arrays of base images with text overlays, brand colors, and optional automatic numbering.

### Key Features
- **N-Slide Carousels:** Support for 1-5 slides per request
- **SVG Text Overlay:** Vector-based text rendering for quality preservation
- **WCAG AA Contrast Validation:** Automatic background application if contrast fails
- **Smart Numbering:** Optional auto-numbered slides (e.g., "1/5", "2/5")
- **Brand Color Integration:** Per-slide brand color application
- **Performance Optimized:** < 2s per 3-slide carousel

---

## Architecture

### Components

#### **CarouselGenerator** (`services/CarouselGenerator.ts`)
Main service orchestrating carousel generation workflow.

**Responsibilities:**
- Validate input (slides array, copy, brand colors)
- Process each slide through the generation pipeline
- Aggregate and return PNG buffers

**Key Methods:**
```typescript
generateCarousel(request: GenerateCarouselRequest): Promise<Buffer[]>
```

#### **ContrastValidator** (`services/ContrastValidator.ts`)
WCAG AA contrast validation engine.

**Responsibilities:**
- Calculate contrast ratio (pix-by-pix analysis)
- Detect low-contrast regions
- Apply semi-transparent backgrounds when needed

**Key Methods:**
```typescript
validateContrast(image: Buffer, textColor: string, backgroundColor: string): Promise<ValidationResult>
applyContrastBackground(image: Buffer, backgroundColor: string): Promise<Buffer>
```

#### **SVG Story Overlay** (`utils/svg-story-overlay.ts`)
SVG-based text rendering utilities for crisp, scalable overlays.

**Responsibilities:**
- Generate SVG markup for text layers
- Apply SVG overlays to image buffers
- Handle font rendering and positioning

**Key Methods:**
```typescript
generateStorySVG(width: number, height: number, options: StoryTextOverlayOptions): string
applyStoryOverlay(imageBuffer: Buffer, options: StoryTextOverlayOptions): Promise<Buffer>
```

#### **Express Route Handler** (`routes/carousel.ts`)
HTTP endpoint for carousel generation API.

**Endpoint:**
```
POST /api/visual/generate-carousel
```

**Request Schema:**
```json
{
  "slides": [
    { "imageBuffer": "...", "copyText": "..." },
    ...
  ],
  "brandColors": { "primary": "#FF5733", "background": "#FFFFFF" },
  "autoNumber": true
}
```

**Response:**
```json
{
  "carousels": ["buffer1", "buffer2", ...],
  "metadata": {
    "slideCount": 3,
    "dimensions": "1080x1350",
    "processingTime": "1200ms"
  }
}
```

---

## Data Flow

```
Input Request
    ↓
Validation (slides, copy, colors)
    ↓
For Each Slide:
    ├─ Generate SVG text overlay
    ├─ Apply overlay to base image
    ├─ Validate WCAG AA contrast
    ├─ Apply background if needed
    ├─ Add numbering (if enabled)
    └─ Export to PNG buffer
    ↓
Return Buffer Array
```

---

## Performance Tuning

### Image Processing Pipeline

1. **Sharp Library:** Single image processing pipeline per slide (optimal)
2. **Buffer Management:** Array of PNG buffers < 500KB total (5 slides)
3. **SVG Rendering:** Vector-based text prevents rasterization overhead
4. **Parallel Processing:** Each slide processed sequentially (minimal memory footprint)

### Benchmarks

| Scenario | Time | Memory |
|----------|------|--------|
| 1 slide (1080×1350) | < 400ms | ~100KB |
| 3 slides (1080×1350) | < 1200ms | ~300KB |
| 5 slides (1080×1350) | < 2000ms | ~500KB |

---

## Error Handling

### Validation Errors
- **Invalid dimensions:** Reject if not 1080×1350
- **Missing copy:** Allow (optional text overlay)
- **Invalid colors:** Fallback to default brand palette

### Processing Errors
- **Contrast validation failure:** Apply white/semi-transparent background + re-validate
- **SVG rendering failure:** Log error, continue with base image
- **PNG export failure:** Return error with diagnostic info

### Fallback Strategies
1. Default brand colors if custom colors invalid
2. System fallback fonts if custom fonts unavailable
3. Solid backgrounds if gradient generation fails

---

## Security Considerations

### Input Validation
- ✅ Slides array length (max 5)
- ✅ Image buffer validation (PNG/JPG)
- ✅ Color format validation (hex codes)

### SVG Injection Protection
- ✅ `escapeXML()` applied to all text content
- ✅ No user input in SVG element attributes
- ✅ Font family restricted to system fonts + Arial fallback

### Resource Limits
- ✅ Max 500KB per carousel (prevents memory exhaustion)
- ✅ Max 2s timeout per carousel (prevents DoS)
- ✅ No hardcoded secrets (brand colors from config)

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `sharp` | ^0.33.0 | Image processing, PNG export |
| `node-canvas` | ^2.11.0 | SVG/text rendering |
| `color-contrast-checker` | ^1.4.0 | WCAG AA validation |
| `better-sqlite3` | ^9.0.0 | Brand config storage |

---

## Testing

### Test Coverage
- ✅ 25/25 unit tests passing
- ✅ All 5 ACs covered
- ✅ Edge cases: 1, 3, 5 slides
- ✅ Contrast validation: pass/fail scenarios
- ✅ Error handling: missing copy, invalid colors

### Test Scenarios
1. **AC-1:** N-slide generation (1, 3, 5)
2. **AC-2:** SVG overlay with text rendering
3. **AC-3:** WCAG AA contrast validation + auto-background
4. **AC-4:** Automatic numbering on/off
5. **AC-5:** Error handling edge cases

---

## Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| GIF carousels | v2 | Video frame aggregation |
| Streaming response | v2 | Stream buffers instead of array |
| Cloud storage integration | v2 | Auto-upload to S3 |
| Analytics | v2 | Carousel performance tracking |
| Template system | v3 | Pre-designed slide templates |

---

## Monitoring & Debugging

### Key Metrics
- `[CarouselGenerator] Processing time: {ms}ms`
- `[CarouselGenerator] Contrast validation: {passed|failed}`
- `[CarouselGenerator] Background applied: {true|false}`

### Common Issues
- **Contrast failure on dark images:** Auto-background applied (white semi-transparent)
- **Font rendering inconsistent:** Fallback to Arial sans-serif
- **Numbering overlaps text:** Positioning calculated from text bounds

---

## Related Stories

- **Story 3.6:** Visual Generation Engine (base image generation)
- **Story 3.8:** Story Generation (similar SVG overlay patterns)
- **Story 3.10:** Asset Storage (carousel persistence)
