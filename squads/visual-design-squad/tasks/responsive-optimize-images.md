---
task:
  id: responsive-optimize-images
  name: Optimize Images for Responsive Web
  description: |
    Optimize images for different screen sizes using responsive image techniques.
    Creates multiple image variants (WebP, AVIF), implements srcset and sizes.
    Output: Optimized images and responsive image markup
  agent: responsive-specialist
  status: available
  
inputs:
  - original-images: "Original image files from design"
  - responsive-spec: "Responsive breakpoints and image requirements"
  - performance-budget: "Image size budget from performance config"
  - usage-context: "Where each image is used (hero, card, background, etc.)"

outputs:
  - optimized-images: "/images/optimized/ (WebP, AVIF, PNG variants)"
  - responsive-markup: "HTML with srcset and sizes attributes"
  - image-manifest: "image-manifest.json (image metadata)"
  - optimization-report: "image-optimization-report.md"

elicit: true
elicit-format: |
  **Step 1: Image Audit**
  - Which images need optimization?
  - Current image sizes and formats?
  - Usage context for each image?

  **Step 2: Optimization Strategy**
  - Target formats? (WebP, AVIF, PNG)
  - Compression level? (quality vs size trade-off)
  - Image sizes at different breakpoints?

  **Step 3: Lazy Loading**
  - Should images use lazy loading?
  - Which images are above-the-fold (should NOT lazy load)?
  - Fallback for browsers without lazy loading support?

dependencies:
  - requires: [frontend-implement-page, responsive-audit]
  - blocks: [performance-audit]

checklist:
  - [ ] Original images audited
  - [ ] Image sizes determined for each breakpoint
  - [ ] WebP variants created
  - [ ] AVIF variants created (modern browsers)
  - [ ] PNG fallbacks created
  - [ ] Image compression optimized
  - [ ] Responsive HTML markup created (srcset, sizes)
  - [ ] Lazy loading implemented where appropriate
  - [ ] Above-the-fold images excluded from lazy loading
  - [ ] Image alt text verified
  - [ ] Image dimensions set in HTML (CLS prevention)
  - [ ] Image manifests created with metadata
  - [ ] Optimization report generated
  - [ ] File size budget verified
  - [ ] Browser compatibility checked
  - [ ] Performance tested (Lighthouse)

tools-required:
  - image-optimizer (imagemin, squoosh)
  - webp-converter
  - avif-converter
  - responsive-image-tester

success-criteria:
  - All images optimized for web (< 1MB total for page)
  - Modern formats (WebP, AVIF) with fallbacks
  - Responsive srcset implemented correctly
  - Lazy loading improves performance
  - Image quality acceptable on all devices
  - File size budget respected
  - No layout shift (CLS) from images
  - Alt text present for all images
  - Optimization reduces Lighthouse score impact

time-estimate: "8-16 hours (varies by image count)"

example: |
  ### Output: Responsive Image Markup

  ```html
  <!-- Hero Image -->
  <picture>
    <source
      media="(min-width: 1024px)"
      srcset="
        /images/optimized/hero-desktop.avif 1024w,
        /images/optimized/hero-desktop@2x.avif 2048w
      "
      type="image/avif"
    />
    <source
      media="(min-width: 1024px)"
      srcset="
        /images/optimized/hero-desktop.webp 1024w,
        /images/optimized/hero-desktop@2x.webp 2048w
      "
      type="image/webp"
    />
    <source
      media="(min-width: 640px)"
      srcset="
        /images/optimized/hero-tablet.avif 640w,
        /images/optimized/hero-tablet@2x.avif 1280w
      "
      type="image/avif"
    />
    <source
      media="(min-width: 640px)"
      srcset="
        /images/optimized/hero-tablet.webp 640w,
        /images/optimized/hero-tablet@2x.webp 1280w
      "
      type="image/webp"
    />
    <img
      src="/images/optimized/hero-mobile.png"
      srcset="
        /images/optimized/hero-mobile.avif 320w,
        /images/optimized/hero-mobile@2x.avif 640w
      "
      alt="Hero: Our Product in Action"
      width="1024"
      height="512"
      loading="eager"
    />
  </picture>

  <!-- Card Image (with lazy loading) -->
  <img
    src="/images/optimized/card-thumb.webp"
    srcset="
      /images/optimized/card-mobile.webp 320w,
      /images/optimized/card-tablet.webp 640w,
      /images/optimized/card-desktop.webp 1024w
    "
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
    alt="Feature Card Description"
    width="400"
    height="300"
    loading="lazy"
  />
  ```

  ### Output: image-optimization-report.md

  ```markdown
  # Image Optimization Report

  ## Summary
  - Original total size: 5.2 MB
  - Optimized total size: 1.1 MB
  - Compression ratio: 78.8% reduction

  ## Per-Image Results
  | Image | Original | WebP | AVIF | Reduction |
  |-------|----------|------|------|-----------|
  | hero-1200.jpg | 2.4 MB | 580 KB | 420 KB | 82% |
  | card-1-1200.jpg | 1.8 MB | 410 KB | 310 KB | 83% |
  | card-2-1200.jpg | 1.0 MB | 220 KB | 160 KB | 84% |

  ## Formats Used
  - Primary: AVIF (best compression, modern browsers)
  - Fallback: WebP (wide browser support)
  - Legacy: PNG/JPG (older browsers)

  ## Responsive Strategy
  - Mobile (320px): 320w images
  - Tablet (640px): 640w images
  - Desktop (1024px+): 1024w images
  - Retina (@2x): 2x resolution for high-DPI devices

  ## Lazy Loading
  - Hero image: `loading="eager"` (above fold)
  - Card images: `loading="lazy"` (below fold)
  - Expected performance gain: 200-300ms faster initial load

  ## Quality Assurance
  - ✅ WebP fallback validated
  - ✅ Alt text verified on all images
  - ✅ Image dimensions set (prevents CLS)
  - ✅ Lighthouse image score: 92/100
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
