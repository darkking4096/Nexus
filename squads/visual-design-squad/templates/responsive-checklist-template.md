# Responsive Design Checklist Template

**Page/Component:** ________________  
**Designer:** ________________  
**Date Tested:** ________________  
**Status:** ☐ PASS ☐ NEEDS FIXES ☐ FAIL

---

## Breakpoint Testing

### Breakpoints Tested
- [ ] **xs** (320px) — Mobile
- [ ] **sm** (640px) — Mobile landscape / Small tablet
- [ ] **md** (768px) — Tablet
- [ ] **lg** (1024px) — Desktop
- [ ] **xl** (1280px) — Desktop large
- [ ] **2xl** (1536px) — Desktop extra large

### Testing Method
- [ ] Chrome DevTools responsive design mode
- [ ] Physical device testing
- [ ] BrowserStack / device lab
- [ ] Manual browser testing

### Testing Environment
- Browser: ________________
- OS: ☐ Windows ☐ macOS ☐ iOS ☐ Android
- Connection: ☐ WiFi ☐ Mobile network (specify: ____________)
- Device(s): ________________

---

## Mobile (320px) — Small Phone

### Layout
- [ ] Single column layout
- [ ] Content stacked vertically
- [ ] No horizontal scrolling
- [ ] All content visible without scroll-jacking
- [ ] Navigation accessible (hamburger menu or similar)

### Typography
- [ ] Text readable without zoom
- [ ] Heading sizes appropriate for mobile
- [ ] Line length comfortable (30-50 chars recommended)
- [ ] Line height >= 1.5 for body text
- [ ] Font size >= 16px (prevents auto-zoom on iOS)

### Spacing & Layout
- [ ] Padding adjusted for small screen (16-24px)
- [ ] Margins not excessive
- [ ] Button/link targets >= 44x44px
- [ ] Spacing between touch targets >= 8px
- [ ] Columns single-width or optional second narrow column

### Images
- [ ] Images fit screen width (100% max, not wider)
- [ ] Aspect ratios maintained
- [ ] No stretched/squished images
- [ ] Mobile-optimized image sizes (srcset)
- [ ] Background images mobile-friendly

### Navigation
- [ ] Navigation not intrusive
- [ ] Menu icon clear (hamburger, etc.)
- [ ] Hamburger menu opens/closes smoothly
- [ ] Menu items touch-friendly size
- [ ] Back button available (if needed)

### Forms
- [ ] Input fields full width or nearly full
- [ ] Input height >= 40px (touch friendly)
- [ ] Labels above inputs
- [ ] Error messages clear
- [ ] Submit button prominent

### Performance
- [ ] Page loads quickly (feel responsive)
- [ ] Images optimized for mobile
- [ ] JavaScript minimized
- [ ] No excessive animations
- [ ] Lazy loading for off-screen images

---

## Tablet (768px) — iPad / Medium Tablet

### Layout
- [ ] 2-3 column layout where appropriate
- [ ] Whitespace utilized effectively
- [ ] Content balanced across columns
- [ ] Navigation may change (drawer to sidebar option)
- [ ] Grid system consistent with desktop

### Typography
- [ ] Heading sizes intermediate between mobile/desktop
- [ ] Body text size 16-18px
- [ ] Line length 50-75 characters
- [ ] Line height >= 1.5
- [ ] Hierarchy still clear

### Touch Targets
- [ ] Touch targets still >= 44px
- [ ] Spacing between targets maintained
- [ ] Easy to tap without fat-fingering

### Images
- [ ] Images sized appropriately
- [ ] Aspect ratios maintained
- [ ] Tablet-optimized sizes (srcset breakpoints)
- [ ] Image quality good on tablet screens

### Navigation
- [ ] Navigation may show more items
- [ ] Navigation drawer or sidebar option
- [ ] Still accessible and not crowded
- [ ] Mobile menu still responsive if kept

### Forms
- [ ] Inputs appropriately sized
- [ ] Multi-column forms possible
- [ ] Labels still clearly associated
- [ ] Error messages clear

### Landscape Orientation
- [ ] Layout adapts for landscape
- [ ] Content not cut off
- [ ] No horizontal scroll in landscape
- [ ] Navigation accessible in landscape

---

## Desktop (1024px) — Full Desktop

### Layout
- [ ] Full-width layout utilized
- [ ] Sidebar or multi-column layout
- [ ] Whitespace used for visual hierarchy
- [ ] Content not cramped into narrow column
- [ ] Max-width appropriate (900-1200px common)

### Typography
- [ ] Heading sizes larger than tablet
- [ ] Body text 16-18px
- [ ] Line length 50-75 characters
- [ ] Hierarchy strong and clear
- [ ] No wall-of-text feeling

### Spacing
- [ ] Generous margins/padding
- [ ] Whitespace creates breathing room
- [ ] Grid system clear (8px, 16px units)
- [ ] Vertical rhythm consistent

### Images
- [ ] Large, high-quality images
- [ ] Image galleries/carousels functional
- [ ] Responsive images (not stretched)
- [ ] Hero images optimized

### Navigation
- [ ] Full navigation visible (no hamburger needed)
- [ ] Navigation bar horizontal or sidebar
- [ ] Clear active state
- [ ] Hover states visible
- [ ] Navigation sticky (if applicable)

### Interactive Elements
- [ ] Hover states visible for buttons/links
- [ ] Tooltips may appear on hover
- [ ] Dropdowns functional
- [ ] Click targets obvious

### Performance
- [ ] Page loads quickly
- [ ] Interactive elements respond fast
- [ ] No layout shift with ads/images
- [ ] Smooth scrolling and animations

---

## Large Desktop (1280px+)

### Layout
- [ ] Full advantage of screen space
- [ ] Sidebar + main + related content
- [ ] Asymmetrical layouts possible
- [ ] Multi-column grids
- [ ] Max-width respected (1200-1400px)

### Typography
- [ ] Larger headings without overwhelming
- [ ] Generous whitespace
- [ ] Line length still comfortable
- [ ] Hierarchy very clear

### Features
- [ ] Advanced features may appear (filters, sidebar)
- [ ] Complex layouts fully visible
- [ ] Table viewing optimized
- [ ] Dashboard-type layouts functional

---

## Fluid Design (All Breakpoints)

### Typography Scaling
- [ ] Font sizes scale smoothly with viewport
- [ ] Using `clamp()` for fluid typography
- [ ] Heading scales: `clamp(1.5rem, 5vw, 3rem)`
- [ ] Body text scales appropriately
- [ ] No sudden jumps at breakpoints

### Spacing Scaling
- [ ] Padding/margin scales with viewport
- [ ] Using `clamp()` for fluid spacing
- [ ] Gaps between items scale
- [ ] Whitespace adaptive

### Image Responsiveness
- [ ] Images scale with viewport
- [ ] Aspect ratios maintained
- [ ] Using `max-width: 100%; height: auto;`
- [ ] `srcset` and `sizes` attributes
- [ ] WebP with fallbacks

---

## Responsive Images

### Image Optimization
- [ ] Images optimized for each breakpoint
- [ ] srcset provides multiple sizes
- [ ] sizes attribute for optimal width
- [ ] WebP format with JPEG fallback
- [ ] Lazy loading implemented (loading="lazy")

### Image Sizes (srcset examples)
```html
<!-- Mobile: 100vw -->
<!-- Tablet: 50vw -->
<!-- Desktop: 33vw -->
<img
  srcset="
    img-320w.jpg 320w,
    img-640w.jpg 640w,
    img-960w.jpg 960w,
    img-1280w.jpg 1280w"
  sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  src="img-960w.jpg"
  alt="description"
>
```

- [ ] Mobile image (320w, 640w)
- [ ] Tablet image (768w, 960w)
- [ ] Desktop image (1280w+)
- [ ] Correct `sizes` attribute
- [ ] Fallback `src` image

### Aspect Ratio & Container Queries
- [ ] aspect-ratio CSS property used (or padding-hack)
- [ ] Images not distorted
- [ ] Container Queries considered (if applicable)
- [ ] Image backgrounds responsive

---

## Navigation Responsiveness

### Mobile Navigation (< 768px)
- [ ] Hamburger menu or mobile nav
- [ ] Animated open/close
- [ ] Menu slides in/fades in
- [ ] Easy to dismiss
- [ ] Touch-friendly menu items

### Tablet Navigation (768px - 1024px)
- [ ] Navigation expanded slightly
- [ ] May show more items
- [ ] Hamburger menu still available (optional)
- [ ] Sidebar option

### Desktop Navigation (> 1024px)
- [ ] Full horizontal/sidebar navigation
- [ ] Dropdowns visible on hover
- [ ] No hamburger needed
- [ ] Navigation persistent

### Navigation Consistency
- [ ] Same menu items across breakpoints
- [ ] Active state clear
- [ ] Back navigation available (mobile)
- [ ] Breadcrumbs visible (desktop)

---

## Form Responsiveness

### Mobile Forms (< 768px)
- [ ] Single column layout
- [ ] Full-width inputs
- [ ] Labels above inputs
- [ ] Input height >= 40px
- [ ] Submit button prominent

### Tablet Forms (768px - 1024px)
- [ ] 2-column layout optional
- [ ] Inputs still touch-friendly
- [ ] Labels clear

### Desktop Forms (> 1024px)
- [ ] Multi-column layout
- [ ] Horizontal label layout option
- [ ] Logical grouping

---

## Responsive Tables

### Mobile Tables (< 768px)
- [ ] Stacked card layout
- [ ] No horizontal scroll
- [ ] Row labels visible
- [ ] Data readable
- [ ] Or: scrollable table with sticky header

### Tablet Tables (768px - 1024px)
- [ ] Partial table visible
- [ ] Scrollable with sticky header/column
- [ ] Key columns visible

### Desktop Tables (> 1024px)
- [ ] Full table visible
- [ ] Sticky header (optional)
- [ ] Sortable columns
- [ ] Pagination clear

---

## Viewport & Orientation

### Portrait Orientation (Mobile)
- [ ] Content fits without scroll
- [ ] No horizontal scroll
- [ ] Typography comfortable
- [ ] Touch targets reachable

### Landscape Orientation (Mobile/Tablet)
- [ ] Layout adapts (often narrower columns)
- [ ] Navigation still accessible
- [ ] Touch targets still comfortable
- [ ] Content fully visible

### Meta Viewport Tag
- [ ] Present: `<meta name="viewport" content="width=device-width, initial-scale=1">`
- [ ] Not preventing zoom: No `user-scalable=no`
- [ ] Font size not too small: No `font-size: 10px` without scales

---

## Cross-browser Responsive Testing

### Chrome/Edge
- [ ] ☐ Desktop: Works correctly
- [ ] ☐ Mobile: Responsive mode shows correct layout
- [ ] ☐ Tablet: Responsive mode shows correct layout

### Firefox
- [ ] ☐ Desktop: Works correctly
- [ ] ☐ Responsive design mode: All breakpoints work

### Safari (macOS)
- [ ] ☐ Desktop: Works correctly
- [ ] ☐ Responsive design mode: Works correctly

### Safari (iOS)
- [ ] ☐ Mobile: Responsive
- [ ] ☐ Landscape: Rotates correctly
- [ ] ☐ Touch targets accessible
- [ ] ☐ No viewport override issues

### Android Chrome
- [ ] ☐ Mobile: Responsive
- [ ] ☐ Touch targets work
- [ ] ☐ Pinch-to-zoom works
- [ ] ☐ Orientation change works

---

## Common Responsive Issues

### Layout Issues
- [ ] ☐ Content too wide for mobile
- [ ] ☐ Navigation broken at breakpoints
- [ ] ☐ Images overflowing container
- [ ] ☐ Text overlapping other content

### Typography Issues
- [ ] ☐ Text too small on mobile (< 16px)
- [ ] ☐ Line length too long (> 100 chars)
- [ ] ☐ Line height insufficient (< 1.5)
- [ ] ☐ Heading hierarchy broken

### Image Issues
- [ ] ☐ Images stretched/distorted
- [ ] ☐ Images not lazy-loaded
- [ ] ☐ Mobile image sizes too large
- [ ] ☐ Missing alt text (accessibility)

### Touch Issues
- [ ] ☐ Touch targets too small (< 44px)
- [ ] ☐ Touch targets too close (< 8px apart)
- [ ] ☐ Hover-only interactions on mobile
- [ ] ☐ No mobile menu

### Performance Issues
- [ ] ☐ Large images slowing mobile
- [ ] ☐ JavaScript not optimized for mobile
- [ ] ☐ CSS not minified
- [ ] ☐ Lazy loading not implemented

---

## Final Review

### Overall Responsive Quality
- [ ] Layout adapts smoothly across breakpoints
- [ ] No sudden jumps or layout shifts
- [ ] Typography scaling is smooth
- [ ] Images responsive and optimized
- [ ] Touch targets appropriate for device

### Production Readiness
- [ ] Tested on multiple devices
- [ ] Tested in multiple browsers
- [ ] Performance acceptable on mobile
- [ ] No responsive design issues
- [ ] Ready for deployment

---

## Reviewer Sign-off

**Reviewer:** ________________ **Date:** ________________

### Verdict
- ☐ **APPROVED** — Design is fully responsive, ready for implementation
- ☐ **APPROVED WITH NOTES** — Minor responsive issues, acceptable
- ☐ **NEEDS FIXES** — Responsive issues found, see below
- ☐ **REJECTED** — Critical responsive failures, redesign needed

### Issues Found

```
1. Issue: _________________________________
   Breakpoint(s): ____________________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: _________________________________

2. Issue: _________________________________
   Breakpoint(s): ____________________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: _________________________________
```

### Notes
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Sign:** ____________________________
