# ⚡♿ Performance & Accessibility Review Checklist

**Page:** ________________  
**Reviewer:** ________________  
**Date:** ________________  
**Status:** ☐ PASS  ☐ NEEDS FIXES  ☐ FAIL

---

## Performance Metrics (Lighthouse)

### Overall Scores
- [ ] Performance Score: >= 90 (Target: 90)
  - **Actual:** ___/100
- [ ] Accessibility Score: >= 90 (Target: 90)
  - **Actual:** ___/100
- [ ] Best Practices Score: >= 90 (Target: 90)
  - **Actual:** ___/100
- [ ] SEO Score: >= 90 (Target: 90)
  - **Actual:** ___/100

### Core Web Vitals

#### LCP (Largest Contentful Paint)
- [ ] LCP < 2.5s (GOOD)
  - **Actual:** ____s
  - **Status:** ☐ GOOD ☐ NEEDS IMPROVEMENT ☐ POOR

#### CLS (Cumulative Layout Shift)
- [ ] CLS < 0.1 (GOOD)
  - **Actual:** ____
  - **Status:** ☐ GOOD ☐ NEEDS IMPROVEMENT ☐ POOR

#### INP (Interaction to Next Paint)
- [ ] INP < 200ms (GOOD)
  - **Actual:** ____ms
  - **Status:** ☐ GOOD ☐ NEEDS IMPROVEMENT ☐ POOR

### Additional Metrics
- [ ] FCP (First Contentful Paint) < 1.5s
  - **Actual:** ____s
- [ ] TTFB (Time to First Byte) < 0.5s
  - **Actual:** ____s
- [ ] Speed Index < 2.5s
  - **Actual:** ____s
- [ ] Total Blocking Time < 100ms
  - **Actual:** ____ms

---

## File Size Budget Compliance

### JavaScript
- [ ] Total JS < 100 KB
  - **Actual:** ____ KB
  - **Status:** ☐ PASS ☐ OVER BUDGET

### CSS
- [ ] Total CSS < 50 KB
  - **Actual:** ____ KB
  - **Status:** ☐ PASS ☐ OVER BUDGET

### Images
- [ ] Total Images < 200 KB
  - **Actual:** ____ KB
  - **Status:** ☐ PASS ☐ OVER BUDGET

### Fonts
- [ ] Total Fonts < 50 KB
  - **Actual:** ____ KB
  - **Status:** ☐ PASS ☐ OVER BUDGET

### Total Page Size
- [ ] Total Page < 400 KB
  - **Actual:** ____ KB
  - **Status:** ☐ PASS ☐ OVER BUDGET

---

## Performance Optimization

### Images
- [ ] Images compressed (JPEG 80%, WebP 75%, AVIF 60%)
- [ ] WebP format used for modern browsers
- [ ] AVIF format available (next-gen compression)
- [ ] PNG used only when necessary
- [ ] Responsive images (srcset/sizes) implemented
- [ ] Lazy loading enabled for below-the-fold images
- [ ] Width/height attributes set (prevents CLS)
- [ ] Image optimization tool used (Squoosh, ImageMin, etc.)

### CSS
- [ ] Critical CSS inlined
- [ ] Non-critical CSS deferred
- [ ] Unused CSS removed or purged
- [ ] CSS minified
- [ ] No redundant styles
- [ ] CSS variables used efficiently
- [ ] Grid/Flexbox instead of floats
- [ ] No blocking CSS

### JavaScript
- [ ] Minimize JavaScript
- [ ] Defer non-critical JS
- [ ] No render-blocking scripts
- [ ] JavaScript minified
- [ ] No console errors
- [ ] No memory leaks detected
- [ ] Third-party scripts analyzed (impact assessed)
- [ ] Service worker configured (if applicable)

### Fonts
- [ ] Font-display: swap specified
- [ ] Font preload for critical fonts
- [ ] Limit to necessary font weights (400, 600, 700)
- [ ] WOFF2 format used
- [ ] Font subsetting (if Latin-only)
- [ ] No unused fonts

### Caching
- [ ] Browser caching configured
- [ ] Cache-control headers set
- [ ] CDN configured
- [ ] Static assets versioned (hash in filename)

---

## Accessibility (WCAG 2.1 AA)

### Automated Scanning
- [ ] axe DevTools: 0 critical violations
  - **Violations found:** ___
  - **Status:** ☐ PASS ☐ NEEDS FIXES
- [ ] WAVE: 0 errors
  - **Errors found:** ___
  - **Status:** ☐ PASS ☐ NEEDS FIXES
- [ ] Lighthouse A11y: >= 90
  - **Score:** ___/100
  - **Status:** ☐ PASS ☐ NEEDS FIXES

### Color & Contrast

#### Text Contrast
- [ ] Body text: >= 4.5:1 contrast
  - **Tested on:** ________________
  - **Actual:** ___:1
  - **Status:** ☐ PASS ☐ FAIL
- [ ] Large text (18pt+): >= 3:1 contrast
  - **Actual:** ___:1
  - **Status:** ☐ PASS ☐ FAIL
- [ ] UI components: >= 3:1 contrast
  - **Actual:** ___:1
  - **Status:** ☐ PASS ☐ FAIL

#### Color Not Only Indicator
- [ ] Error messages use color + icon/text
- [ ] Success states use color + icon/text
- [ ] Status indicators not color-only

### Keyboard Navigation

#### Operable by Keyboard
- [ ] Tab key navigates all interactive elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals/dropdowns
- [ ] Arrow keys work in dropdowns/tabs
- [ ] All functionality accessible by keyboard

#### Focus Management
- [ ] Focus indicator visible on all elements
- [ ] Focus outline: >= 2px width
- [ ] Focus outline contrast: >= 3:1
- [ ] Focus indicator color: distinct from background
- [ ] No focus traps
- [ ] Tab order logical (top-to-bottom, left-to-right)
- [ ] Skip navigation link present
- [ ] Focus moves to modal when opened
- [ ] Focus returns when modal closes

### Screen Reader Compatibility

#### Semantic HTML
- [ ] Headings: `<h1>`, `<h2>`, etc. (not divs)
- [ ] Navigation: `<nav role="navigation">`
- [ ] Main content: `<main id="main-content">`
- [ ] Articles: `<article>` tags
- [ ] Lists: `<ul>`, `<ol>`, `<li>`
- [ ] Buttons: `<button>` elements (not divs)
- [ ] Links: `<a>` with href
- [ ] Form labels: `<label for="input-id">`
- [ ] Form errors: Associated with inputs
- [ ] Regions: `<section>`, `<aside>`, etc.

#### ARIA Usage
- [ ] ARIA only when necessary (semantic HTML preferred)
- [ ] No ARIA on semantic elements
- [ ] aria-label for icon buttons
- [ ] aria-describedby for error messages
- [ ] aria-expanded for collapsibles
- [ ] aria-live for dynamic content
- [ ] aria-invalid on invalid form fields
- [ ] role="main" or `<main>` for main content
- [ ] No contradictory ARIA

#### Headings
- [ ] H1 present (only one per page)
- [ ] Heading hierarchy logical (H1 → H2 → H3)
- [ ] No skipped levels (e.g., H1 → H3)
- [ ] Headings describe content

#### Links
- [ ] Link text descriptive
- [ ] No "click here" links
- [ ] No "link" links
- [ ] Title attribute if needed for context

#### Images
- [ ] Decorative images: alt="" (empty)
- [ ] Informative images: descriptive alt text
- [ ] Alt text < 125 characters
- [ ] No "image of" prefix (redundant)
- [ ] Complex images: long description provided

#### Forms
- [ ] All inputs have labels
- [ ] Labels associated: `<label for="id">`
- [ ] Required fields marked: `required` attribute
- [ ] Error messages associated: aria-describedby
- [ ] Instructions clear and accessible
- [ ] Validation feedback on blur or submit
- [ ] No auto-submit on change

#### Tables (if applicable)
- [ ] Header cells: `<th scope="col">` or `scope="row"`
- [ ] Data cells: `<td>`
- [ ] Caption: `<caption>`
- [ ] Accessible via keyboard

### Screen Reader Testing

#### Tested With
- ☐ NVDA (Windows)
- ☐ JAWS (Windows)
- ☐ VoiceOver (macOS/iOS)
- ☐ TalkBack (Android)

#### Results
- [ ] Page structure announced correctly
- [ ] All content accessible
- [ ] Navigation clear
- [ ] Forms usable
- [ ] Links understandable
- [ ] Interactions possible

### Other A11y Features

#### Motion & Animation
- [ ] No auto-playing videos
- [ ] Video has captions
- [ ] No flashing (> 3/second)
- [ ] prefers-reduced-motion respected
- [ ] Animation can be disabled

#### Text & Readability
- [ ] Text resizable to 200% without loss
- [ ] No fixed-height text containers
- [ ] Line spacing >= 1.5x
- [ ] Letter spacing >= 0.12em
- [ ] Word spacing >= 0.16em
- [ ] Justified text not used (or hyphenation disabled)
- [ ] Text color not black on black

#### Mobile & Touch
- [ ] Touch targets >= 44×44px
- [ ] Spacing between targets >= 8px
- [ ] Viewport meta tag set
- [ ] Safe area respected (notches)
- [ ] Mobile keyboard accessible

---

## Mobile Performance

### Slow Network (Slow 4G)
- [ ] Page loads in < 5s
- [ ] LCP < 3s
- [ ] Page usable before full load
- [ ] Images load responsively

### Slow Device (Moto G4)
- [ ] Interaction smooth (60fps target)
- [ ] No janky scrolling
- [ ] Buttons respond quickly to tap

---

## Accessibility Compliance Summary

| Criterion | Status | Notes |
|-----------|--------|-------|
| Perceivable | ☐ PASS | Color, contrast, text, images |
| Operable | ☐ PASS | Keyboard, focus, navigation |
| Understandable | ☐ PASS | Language, predictable, input |
| Robust | ☐ PASS | HTML, ARIA, compatibility |

---

## Common Performance Issues Checked

- [ ] ☐ Render-blocking CSS or JS
- [ ] ☐ Unoptimized images
- [ ] ☐ Missing lazy loading
- [ ] ☐ Large JS bundles
- [ ] ☐ Font loading issues
- [ ] ☐ Memory leaks
- [ ] ☐ Layout shifts (CLS)
- [ ] ☐ Slow LCP

---

## Common A11y Issues Checked

- [ ] ☐ Low color contrast
- [ ] ☐ No alt text on images
- [ ] ☐ Missing focus indicators
- [ ] ☐ Keyboard traps
- [ ] ☐ Missing form labels
- [ ] ☐ Poor heading hierarchy
- [ ] ☐ Invalid HTML
- [ ] ☐ Misused ARIA

---

## Reviewer Sign-off

**Reviewer:** ________________  
**Date:** ________________  

### Verdict
- ☐ **APPROVED** — Meets all performance & a11y criteria
- ☐ **APPROVED WITH NOTES** — Minor issues noted
- ☐ **NEEDS FIXES** — Issues found, see below
- ☐ **REJECTED** — Critical issues found

### Performance Issues Found
```
1. ________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: ________________

2. ________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: ________________
```

### Accessibility Issues Found
```
1. ________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: ________________

2. ________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: ________________
```

### Notes
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Sign:** ____________________________
