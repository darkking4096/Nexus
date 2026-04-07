# 🎨 Visual Design Review Checklist

**Page:** ________________  
**Reviewer:** ________________  
**Date:** ________________  
**Status:** ☐ PASS  ☐ NEEDS FIXES  ☐ FAIL

---

## Design System Compliance

### Colors
- [ ] All colors match design tokens
- [ ] No hardcoded hex values (all use CSS variables)
- [ ] Primary color used consistently
- [ ] Secondary colors used appropriately
- [ ] Neutral colors follow palette
- [ ] Status colors (success/error/warning) used correctly
- [ ] Color psychology aligned with brand

### Typography
- [ ] H1 size and weight correct (3.5rem, 700)
- [ ] H2 size and weight correct (2rem, 600)
- [ ] H3 size and weight correct (1.5rem, 600)
- [ ] Body text size correct (1rem, 400)
- [ ] Small text size correct (0.875rem, 400)
- [ ] Font families consistent (Inter for sans-serif)
- [ ] Line heights appropriate for size
- [ ] Letter spacing applied where needed
- [ ] Heading hierarchy logical and clear

### Spacing & Layout
- [ ] Base spacing unit (8px) used throughout
- [ ] All margins use spacing tokens
- [ ] All padding uses spacing tokens
- [ ] Grid gaps consistent with token values
- [ ] Whitespace creates clear visual hierarchy
- [ ] Consistent padding on containers
- [ ] Component spacing proportional

### Visual Elements
- [ ] Shadows match elevation tokens
- [ ] Border radius consistent (md: 6px)
- [ ] Border colors match tokens
- [ ] Component states visually distinct (hover, active, disabled)
- [ ] Visual hierarchy clear (size, color, weight)
- [ ] Alignment consistent across page
- [ ] Icons sized appropriately
- [ ] Icons visually consistent with style

---

## Component Quality

### Buttons
- [ ] Button height >= 44px (touch target)
- [ ] Button padding consistent
- [ ] Hover state visible
- [ ] Focus state visible
- [ ] Active state visible
- [ ] Disabled state clearly distinguished
- [ ] Loading state implemented (if applicable)
- [ ] Text contrast >= 4.5:1

### Forms & Inputs
- [ ] Input height >= 40px
- [ ] Label position consistent
- [ ] Placeholder text visible but distinct
- [ ] Focus state visible
- [ ] Error state clearly shown
- [ ] Success state clearly shown
- [ ] Helper text visible
- [ ] Required indicator present

### Cards & Containers
- [ ] Card shadow elevation consistent
- [ ] Card spacing consistent
- [ ] Card borders (if used) consistent
- [ ] Card padding consistent
- [ ] Corner radius consistent
- [ ] Content alignment within cards

### Images
- [ ] Images properly sized (not stretched)
- [ ] Alt text present and descriptive
- [ ] Image aspect ratios appropriate
- [ ] Placeholder/loading state (if applicable)
- [ ] No pixelation or blur

---

## Responsiveness at Key Breakpoints

### Mobile (320px)
- [ ] Layout single-column
- [ ] Text readable without zoom
- [ ] Touch targets >= 44px
- [ ] No horizontal scroll
- [ ] Spacing adjusted for small screens

### Tablet (768px)
- [ ] Layout 2-3 columns
- [ ] Spacing appropriate
- [ ] Images scaled appropriately
- [ ] Navigation accessible

### Desktop (1024px+)
- [ ] Layout full width
- [ ] Whitespace utilized
- [ ] Multi-column grid functional
- [ ] Spacing balanced

---

## Brand & Voice Consistency

- [ ] Design aligns with brand guidelines
- [ ] Color palette matches brand
- [ ] Typography matches brand
- [ ] Visual tone matches brand voice
- [ ] No inconsistent style (Comic Sans, random colors, etc.)
- [ ] Imagery style consistent

---

## Accessibility Basics (Visual)

- [ ] Color contrast >= 4.5:1 for text
- [ ] Color contrast >= 3:1 for large text (18pt+)
- [ ] Color not used as only indicator
- [ ] Focus states visible
- [ ] Links distinguishable from body text
- [ ] Text resizable (no fixed sizes)
- [ ] Text spacing adjustable (line-height >= 1.5)

---

## Design Spec Comparison

### Compared to Original Design Spec
- [ ] Layout matches mockup
- [ ] Colors match palette
- [ ] Typography matches sizes/weights
- [ ] Spacing matches grid
- [ ] Components match variations
- [ ] Visual hierarchy matches design
- [ ] Pixel-perfect accuracy: 95%+

### Missing Elements
- [ ] All specified components present
- [ ] No extra/unspecified elements
- [ ] All pages/sections included

---

## Common Issues to Catch

### Color & Contrast
- [ ] ☐ Insufficient contrast
- [ ] ☐ Hardcoded colors instead of tokens
- [ ] ☐ Off-brand colors used

### Typography
- [ ] ☐ Wrong font family
- [ ] ☐ Wrong font size/weight
- [ ] ☐ Missing line spacing
- [ ] ☐ Inconsistent heading sizes

### Spacing
- [ ] ☐ Uneven spacing
- [ ] ☐ Not using grid system
- [ ] ☐ Overlapping elements

### Components
- [ ] ☐ Button size too small (< 44px)
- [ ] ☐ Touch targets too close
- [ ] ☐ Form fields not labeled
- [ ] ☐ Disabled state not clear

### Images
- [ ] ☐ Images not optimized
- [ ] ☐ Missing alt text
- [ ] ☐ Stretched/distorted images
- [ ] ☐ Inconsistent image sizes

---

## Final Review

### Overall Quality
- [ ] Design is cohesive and polished
- [ ] No visual glitches or artifacts
- [ ] Professional appearance
- [ ] Brand-appropriate
- [ ] User-friendly

### Production Readiness
- [ ] No temporary/placeholder design
- [ ] All states implemented
- [ ] All breakpoints tested
- [ ] Ready for developer handoff

---

## Reviewer Sign-off

**Reviewer:** ________________  
**Date:** ________________  

### Verdict
- ☐ **APPROVED** — Design meets all criteria, ready for implementation
- ☐ **APPROVED WITH MINOR NOTES** — Minor issues noted, acceptable
- ☐ **NEEDS FIXES** — Issues found, see below
- ☐ **REJECTED** — Critical issues, redesign needed

### Issues Found
(List any issues and recommendations)

```
1. Issue: _________________________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: _________________________________

2. Issue: _________________________________
   Severity: ☐ Critical ☐ High ☐ Medium ☐ Low
   Fix: _________________________________
```

### Notes
_____________________________________________________________________________
_____________________________________________________________________________
_____________________________________________________________________________

**Sign:** ____________________________
