# 📱 Responsive Design Review Checklist

**Page:** ________________  
**Reviewer:** ________________  
**Date:** ________________  
**Status:** ☐ PASS  ☐ NEEDS FIXES  ☐ FAIL

---

## Breakpoint Testing: 320px (Mobile)

### Layout
- [ ] Single-column layout
- [ ] No horizontal scrolling
- [ ] Content flows naturally top-to-bottom
- [ ] Full width minus padding (16px)
- [ ] Images scale to full width

### Typography
- [ ] Heading 1: 2.5rem (reduced from 3.5rem)
- [ ] Body text: readable at normal zoom
- [ ] Text contrast still >= 4.5:1
- [ ] No text cutoff or overflow

### Spacing
- [ ] Section padding: 16px
- [ ] Content padding: 16px
- [ ] Grid gap: 16px
- [ ] Spacing proportional to space available

### Components
- [ ] Buttons full width or clearly touchable
- [ ] Form inputs full width
- [ ] Touch targets all >= 44px
- [ ] Navigation stacked or hamburger menu

### Images
- [ ] Images scale to full width
- [ ] Aspect ratios maintained
- [ ] No pixelation or blur
- [ ] Loading state (if applicable)

### Issues Found at 320px
```
☐ None
☐ Issues: _________________________________
```

---

## Breakpoint Testing: 640px (Tablet Portrait)

### Layout
- [ ] 1-2 column layout appropriate
- [ ] Content centered with margins
- [ ] Full width padding: 20px
- [ ] No layout breaking

### Typography
- [ ] Heading sizes adjusted slightly
- [ ] Text readable without zoom
- [ ] Body text: 1rem

### Spacing
- [ ] Section padding: 24px
- [ ] Grid gap: 20px
- [ ] Spacing balanced for tablet width

### Components
- [ ] Buttons appropriately sized
- [ ] Form layout optimized for tablet
- [ ] Navigation accessible

### Images
- [ ] Images optimized for tablet width
- [ ] Maintain aspect ratios

### Issues Found at 640px
```
☐ None
☐ Issues: _________________________________
```

---

## Breakpoint Testing: 768px (Tablet Landscape)

### Layout
- [ ] Multi-column layout (2-3 columns)
- [ ] Maximum width enforced
- [ ] Padding: 24px
- [ ] Content centered

### Typography
- [ ] Heading 2: 1.875rem
- [ ] Heading 3: 1.375rem
- [ ] Body text comfortable reading width

### Spacing
- [ ] Grid gap: 24px
- [ ] Component spacing balanced

### Components
- [ ] Cards in 2-column grid
- [ ] Features in appropriate columns
- [ ] All interactive elements working

### Issues Found at 768px
```
☐ None
☐ Issues: _________________________________
```

---

## Breakpoint Testing: 1024px (Desktop)

### Layout
- [ ] Full multi-column layout (3-4 columns)
- [ ] Maximum width: 960px (enforced)
- [ ] Padding: 32px
- [ ] Centered with balanced whitespace

### Typography
- [ ] Heading 1: 3.25rem
- [ ] Heading 2: 2rem
- [ ] Body text: 1rem
- [ ] Comfortable reading width (50-75 chars)

### Spacing
- [ ] Grid gap: 32px
- [ ] Section padding: 48px
- [ ] Whitespace creates hierarchy

### Components
- [ ] Cards in appropriate grid
- [ ] Features displayed optimally
- [ ] Hero image properly sized

### Issues Found at 1024px
```
☐ None
☐ Issues: _________________________________
```

---

## Breakpoint Testing: 1280px+ (Large Desktop)

### Layout
- [ ] Full width maximized
- [ ] Maximum width: 1200px (enforced)
- [ ] Padding: 40px
- [ ] Whitespace balanced

### Typography
- [ ] Heading 1: 3.5rem
- [ ] Spacing appropriate for large screens

### Spacing
- [ ] Grid gap: 32px
- [ ] Section padding: 64px
- [ ] Visual hierarchy clear

### Components
- [ ] All elements properly spaced
- [ ] No content stretching across full width
- [ ] Whitespace utilized effectively

### Issues Found at 1280px+
```
☐ None
☐ Issues: _________________________________
```

---

## Responsive Images

### Image Optimization
- [ ] Multiple sizes created (320px, 640px, 1024px)
- [ ] WebP format used
- [ ] AVIF format available
- [ ] srcset/sizes attributes implemented

### Above-the-fold Images
- [ ] `loading="eager"` or no lazy loading
- [ ] Critical CSS includes image styles

### Below-the-fold Images
- [ ] `loading="lazy"` implemented
- [ ] Proper width/height attributes set (prevents CLS)

### Image Issues
```
☐ None
☐ Issues: _________________________________
```

---

## Mobile-First Approach Verification

- [ ] CSS uses `max-width` media queries (not min-width only)
- [ ] Mobile styles as default, then enhanced for larger screens
- [ ] Progressive enhancement evident
- [ ] No unnecessary breakpoints

---

## Touch & Interaction Testing

### Touch Targets
- [ ] All buttons >= 44×44px
- [ ] Touch targets >= 44px minimum dimension
- [ ] Spacing between targets: >= 8px
- [ ] No tiny/hard-to-tap elements

### Touch Gestures (if applicable)
- [ ] Swipe implemented properly
- [ ] Double-tap functionality works
- [ ] Long-press works (if used)

### Keyboard Navigation (Mobile)
- [ ] Form fields accessible
- [ ] All buttons accessible
- [ ] Tab navigation works

---

## Performance on Mobile

### Network Conditions Tested
- [ ] Fast 4G
- [ ] Slow 4G (Lighthouse default)
- [ ] 3G (if target audience)

### Load Time
- [ ] LCP < 3s on slow 4G
- [ ] Page interactive within 5s
- [ ] Images load responsively

### Visual Stability
- [ ] No layout shifts (CLS < 0.15)
- [ ] Elements don't move after load
- [ ] Text doesn't reflow

---

## Orientation Testing

### Portrait Orientation
- [ ] Tested on actual devices
- [ ] Layout optimized for portrait

### Landscape Orientation
- [ ] Content visible without excessive scrolling
- [ ] Images not too tall
- [ ] Readable without rotating device

### Orientation Issues
```
☐ None
☐ Issues: _________________________________
```

---

## Device-Specific Testing

### iOS
- [ ] Tested in Safari
- [ ] Tested in Chrome
- [ ] Tested on iPhone SE (320px)
- [ ] Tested on iPhone 14 Pro (390px)
- [ ] Safe area (notch) respected
- [ ] Viewport fit configured

### Android
- [ ] Tested in Chrome
- [ ] Tested on Samsung Galaxy A series
- [ ] Tested on Google Pixel
- [ ] Layout stable across devices

### Device-Specific Issues
```
☐ None
☐ Issues: _________________________________
```

---

## Accessibility at All Breakpoints

- [ ] Focus indicators visible at all sizes
- [ ] Touch targets >= 44px at all sizes
- [ ] Text contrast >= 4.5:1 at all sizes
- [ ] Form labels associated at all sizes
- [ ] Keyboard navigation functional at all sizes

---

## Common Responsive Issues Checked

- [ ] ☐ Text cut off or overflowing
- [ ] ☐ Images stretched or squished
- [ ] ☐ Buttons too small to tap
- [ ] ☐ Horizontal scrolling (unintended)
- [ ] ☐ Layout breaking at any breakpoint
- [ ] ☐ Spacing too tight on mobile
- [ ] ☐ Navigation inaccessible
- [ ] ☐ Forms difficult to fill

---

## Reviewer Sign-off

**Reviewer:** ________________  
**Date:** ________________  

### Verdict
- ☐ **APPROVED** — Responsive design meets all criteria
- ☐ **APPROVED WITH NOTES** — Minor issues noted
- ☐ **NEEDS FIXES** — Issues found, see below
- ☐ **REJECTED** — Critical issues found

### Issues Summary
```
Total Issues: ___ Critical: ___ High: ___ Medium: ___ Low: ___
```

### Critical Issues
_____________________________________________________________________________
_____________________________________________________________________________

### High Priority Issues
_____________________________________________________________________________
_____________________________________________________________________________

### Medium Priority Issues
_____________________________________________________________________________
_____________________________________________________________________________

### Notes
_____________________________________________________________________________
_____________________________________________________________________________

**Sign:** ____________________________
