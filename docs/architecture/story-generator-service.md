# Story Generator Service

**Story:** 3.8 — Story Generation (Branding)  
**Version:** 1.0  
**Date:** 2026-04-13

---

## Overview

The `StoryGenerator` service enables automated generation of Instagram Story frames (1080×1920 vertical format) with brand-consistent visual styling, text overlays, and optional brand logo embedding.

### Key Features
- **Instagram Story Format:** Exact 1080×1920px dimensions (no auto-resize)
- **Brand Color Application:** Background + text colors from brand config
- **Smart Text Overlay:** Headline, body, CTA with responsive positioning
- **Brand Logo Embedding:** Auto-scale with fallback handling
- **WCAG AA Contrast:** Automatic background application for readability
- **PNG Optimization:** < 500KB file size for fast upload

---

## Architecture

### Components

#### **StoryGenerator** (`services/StoryGenerator.ts`)
Main service orchestrating story frame generation workflow.

**Responsibilities:**
- Load brand configuration (colors, fonts, logo)
- Generate canvas/Sharp background (solid or gradient)
- Apply text overlays with brand styling
- Validate dimensions and export PNG

**Key Methods:**
```typescript
generateStory(request: GenerateStoryRequest): Promise<Buffer>
generateStoryWithProfile(profileId: string, content: StoryContent): Promise<Buffer>
```

#### **BrandConfigLoader** (`services/BrandConfigLoader.ts`)
Brand configuration management with fallback strategy.

**Responsibilities:**
- Load brand configs from database
- Merge custom colors with brand defaults
- Provide sensible defaults for missing configs
- Validate hex color codes

**Key Methods:**
```typescript
loadBrandConfig(brandId: string): Promise<BrandConfig>
loadProfileBrandConfig(profileId: string): Promise<BrandConfig>
mergeBrandConfig(baseBrand: BrandConfig, customColors?: Record<string, string>): BrandConfig
```

#### **SVG Story Overlay** (`utils/svg-story-overlay.ts`)
SVG-based text rendering optimized for vertical Story format.

**Responsibilities:**
- Generate SVG markup for headline, body, CTA
- Create gradient/solid backgrounds
- Apply text overlays with optimal positioning
- Handle font rendering for mobile viewports

**Key Methods:**
```typescript
generateStorySVG(width: number, height: number, options: StoryTextOverlayOptions): string
applyStoryOverlay(imageBuffer: Buffer, options: StoryTextOverlayOptions): Promise<Buffer>
generateStoryBackground(width: number, height: number, backgroundColor: string, gradientColor?: string): Promise<Buffer>
```

#### **Express Route Handler** (`routes/story.ts`)
HTTP endpoint for story generation API.

**Endpoint:**
```
POST /api/visual/generate-story
```

**Request Schema:**
```json
{
  "profileId": "inst_123",
  "brandId": "brand_456",
  "content": {
    "headline": "Limited offer",
    "body": "Get 30% off today",
    "cta": "Shop Now"
  },
  "customColors": {
    "primary": "#FF5733"
  }
}
```

**Response:**
```json
{
  "story": "buffer...",
  "metadata": {
    "dimensions": "1080x1920",
    "format": "PNG",
    "fileSize": "250KB",
    "processingTime": "850ms"
  }
}
```

---

## Data Flow

```
Input Request (profile, brand, content)
    ↓
Load Brand Config (colors, fonts, logo)
    ↓
Generate Background (solid or gradient)
    ↓
Apply Text Overlay:
    ├─ Headline (top, 32px bold)
    ├─ Body (middle, 18px regular)
    └─ CTA Button (bottom, 16px bold)
    ↓
Validate WCAG AA Contrast
    ├─ Apply semi-transparent background if needed
    └─ Re-validate
    ↓
Embed Brand Logo (optional)
    ├─ Auto-scale if dimensions inadequate
    └─ Skip with warning if error
    ↓
Optimize PNG
    ├─ Quantize colors if > 500KB
    └─ Compress
    ↓
Return PNG Buffer
```

---

## Layout Specifications

### Vertical Format Optimization (1080×1920)

```
┌─────────────────────────────────────┐
│                                     │
│       HEADLINE (32px, bold)         │  ← 20% from top
│                                     │
├─────────────────────────────────────┤
│                                     │
│  BODY TEXT                          │  ← 50% (center)
│  (18px, regular)                    │
│  (max 150 chars, 1.5 line height)   │
│                                     │
├─────────────────────────────────────┤
│                                     │
│       [CTA BUTTON]                  │  ← 85% from top
│       (brand color, 16px)           │
│                                     │
└─────────────────────────────────────┘
```

**Responsive Constraints:**
- Minimum font size: 16px (readable on mobile)
- Line height: 1.5 (accessibility)
- Padding: 20px all sides
- Button width: 60% of story (or max 200px)

---

## Brand Configuration Schema

```typescript
interface BrandConfig {
  id: string;
  name: string;
  colors: {
    primary: string;        // Primary brand color (buttons, accents)
    secondary: string;      // Secondary color (less prominent)
    accent: string;         // Highlight color
    background: string;     // Story background (solid or gradient base)
    text?: string;          // Text color (default: #000000)
  };
  fonts: {
    headline?: string;      // Font for headlines (default: Arial)
    body?: string;          // Font for body text (default: Arial)
  };
  logo?: {
    url: string;
    width: number;
    height: number;
  };
  watermark?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;        // 0-1
  };
}
```

---

## Performance Tuning

### Image Processing Pipeline

1. **Sharp Library:** Single pipeline for background + overlays
2. **Canvas Optimization:** Node-canvas for text rendering (no rasterization)
3. **PNG Compression:** Quantization for < 500KB constraint
4. **Memory Efficiency:** Single buffer at a time (not accumulated arrays)

### Benchmarks

| Component | Time |
|-----------|------|
| Background generation | < 100ms |
| Text overlay (headline+body+CTA) | < 200ms |
| Contrast validation | < 150ms |
| Logo embedding | < 100ms |
| PNG optimization | < 300ms |
| **Total per story** | **< 850ms** |

---

## Error Handling

### Input Validation
- ✅ Dimension validation (exactly 1080×1920, no resize)
- ✅ Brand config existence check with fallback
- ✅ Color format validation (hex codes)
- ✅ Logo dimensions validation

### Processing Errors
- **Contrast failure:** Apply white/semi-transparent background + re-validate
- **Font rendering failure:** Fallback to system sans-serif
- **Logo too large:** Auto-scale or skip with warning
- **PNG export > 500KB:** Quantize colors or reduce quality

### Fallback Strategy
1. Use default brand if custom not found
2. Use Arial fallback if custom font unavailable
3. Skip logo if dimensions invalid (log warning)
4. Apply white background if contrast fails

---

## Security Considerations

### Input Validation
- ✅ Dimensions strictly enforced (1080×1920 only)
- ✅ Color format validation (hex codes with regex)
- ✅ Logo URL validation (no external redirects)

### SVG Injection Protection
- ✅ `escapeXML()` applied to headline, body, CTA
- ✅ No user input in SVG attributes
- ✅ Font family restricted to system fonts

### Resource Limits
- ✅ Single story generation (no batch endpoint)
- ✅ PNG file size capped at 8MB (Instagram limit)
- ✅ Processing timeout: 5 seconds
- ✅ Logo max dimensions: 500×500px

---

## Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| `sharp` | ^0.33.0 | Background generation, PNG export |
| `node-canvas` | ^2.11.0 | Text rendering, SVG overlays |
| `color-contrast-checker` | ^1.4.0 | WCAG AA validation |
| `better-sqlite3` | ^9.0.0 | Brand config storage |

---

## Testing

### Test Coverage
- ✅ 5+ unit tests passing
- ✅ All 5 ACs covered
- ✅ Multiple brand palettes tested
- ✅ Contrast validation: pass/fail scenarios
- ✅ Error handling: missing brand, invalid dimensions

### Test Scenarios
1. **AC-1:** Frame generation with correct dimensions
2. **AC-2:** Brand color application (5 different palettes)
3. **AC-3:** Text overlay optimization for vertical format
4. **AC-4:** Brand consistency across multiple stories
5. **AC-5:** Error handling and PNG optimization

---

## Future Enhancements

| Feature | Priority | Notes |
|---------|----------|-------|
| Animated stories | v2 | GIF/WebP support |
| Custom templates | v2 | Design template system |
| A/B testing | v2 | Story variant generation |
| Analytics integration | v2 | Performance tracking |
| Batch processing | v2 | Multi-story generation |
| Cloud storage | v2 | Auto-upload to CDN |

---

## Monitoring & Debugging

### Key Metrics
- `[StoryGenerator] Processing time: {ms}ms`
- `[StoryGenerator] File size: {KB}KB`
- `[StoryGenerator] Contrast: {passed|failed}`
- `[StoryGenerator] Logo applied: {true|false}`

### Common Issues
- **Contrast failure on dark backgrounds:** White semi-transparent overlay applied
- **Font rendering inconsistent:** Fallback to Arial sans-serif
- **PNG file size > 500KB:** Quantization applied (quality reduced slightly)
- **Logo skipped:** Dimensions exceeded 500×500px limit

---

## Related Stories

- **Story 3.6:** Visual Generation Engine (base image generation)
- **Story 3.5:** Caption Generation (text content source)
- **Story 3.7:** Carousel Generation (similar SVG overlay patterns)
- **Story 3.10:** Asset Storage (story persistence)
- **Story 3.11:** Publishing (story upload automation)
