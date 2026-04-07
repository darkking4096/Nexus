# Lighthouse Performance & Accessibility Report Template

**Page URL:** ________________  
**Date Audited:** ________________  
**Auditor:** ________________  
**Device:** ☐ Desktop ☐ Mobile ☐ Both  
**Throttling:** ☐ No throttle ☐ 4G (Slow 4G) ☐ 3G

---

## Executive Summary

### Overall Scores

| Metric | Score | Status | Target |
|--------|-------|--------|--------|
| **Performance** | — / 100 | ☐ Pass (≥90) ☐ Needs Work | 90+ |
| **Accessibility** | — / 100 | ☐ Pass (≥90) ☐ Needs Work | 90+ |
| **Best Practices** | — / 100 | ☐ Pass (≥90) ☐ Needs Work | 90+ |
| **SEO** | — / 100 | ☐ Pass (≥90) ☐ Needs Work | 90+ |
| **PWA** | — / 100 | ☐ Pass (≥90) ☐ Needs Work | 90+ |

### Core Web Vitals

| Metric | Value | Status | Target |
|--------|-------|--------|--------|
| **LCP** (Largest Contentful Paint) | — ms | ☐ Good (<2.5s) ☐ Needs Work | <2.5s |
| **FID** (First Input Delay) | — ms | ☐ Good (<100ms) ☐ Needs Work | <100ms |
| **CLS** (Cumulative Layout Shift) | — | ☐ Good (<0.1) ☐ Needs Work | <0.1 |
| **INP** (Interaction to Next Paint) | — ms | ☐ Good (<200ms) ☐ Needs Work | <200ms |
| **TTFB** (Time to First Byte) | — ms | ☐ Good (<600ms) ☐ Needs Work | <600ms |

---

## Performance Audit

### Metrics Breakdown

#### Loading Performance
- **First Contentful Paint (FCP):** — ms (Target: <1.8s)
  - Status: ☐ Good ☐ Needs Work
- **Largest Contentful Paint (LCP):** — ms (Target: <2.5s)
  - Status: ☐ Good ☐ Needs Work
  - Element: [Description of element]
- **Speed Index:** — ms (Target: <3.4s)
  - Status: ☐ Good ☐ Needs Work
- **Time to Interactive (TTI):** — ms (Target: <3.8s)
  - Status: ☐ Good ☐ Needs Work
- **Total Blocking Time (TBT):** — ms (Target: <200ms)
  - Status: ☐ Good ☐ Needs Work

#### Resource Metrics
- **Total JavaScript:** — KB
- **Unused JavaScript:** — KB
- **Total CSS:** — KB
- **Unused CSS:** — KB
- **Total Images:** — KB
- **Minified Resources:** ☐ Yes ☐ No
- **Compressed Resources:** ☐ gzip ☐ brotli ☐ None

#### Network Activity
- **Total Requests:** —
- **Total Bytes:** — KB
- **Critical Path Length:** — hops
- **Requests Blocked by Parser:** —

### Performance Issues Found

#### High Priority (Fix immediately)
```
[ ] Issue: _________________________________
    Impact: Page speed, UX
    Fix: _________________________________
    Effort: ☐ Quick (< 1h) ☐ Medium (1-4h) ☐ Large (>4h)
    
[ ] Issue: _________________________________
    Impact: Core Web Vitals
    Fix: _________________________________
    Effort: ☐ Quick ☐ Medium ☐ Large
```

#### Medium Priority (Fix soon)
```
[ ] Issue: _________________________________
    Fix: _________________________________
    Effort: ☐ Quick ☐ Medium ☐ Large
```

#### Low Priority (Consider for future)
```
[ ] Issue: _________________________________
    Fix: _________________________________
```

### Optimization Opportunities

| Opportunity | Savings | Effort |
|-------------|---------|--------|
| Minify CSS | — KB | Quick |
| Minify JavaScript | — KB | Quick |
| Remove unused CSS | — KB | Medium |
| Lazy load images | — KB | Medium |
| Optimize images | — KB | Medium |
| Code split | — KB | Large |
| Use modern image formats | — KB | Medium |
| Enable compression | — KB | Quick |

---

## Accessibility Audit

### WCAG 2.1 Level AA Compliance

#### Perceivable
- [ ] Color contrast >= 4.5:1 (normal text)
- [ ] Color contrast >= 3:1 (large text)
- [ ] Color not only means of conveyance
- [ ] Images have alt text
- [ ] Audio/video has captions
- [ ] Content can be displayed at 200% zoom
- [ ] Text can be resized without loss of content

#### Operable
- [ ] All functionality accessible by keyboard
- [ ] No keyboard trap (can escape any element)
- [ ] Focus indicator always visible
- [ ] Focus order logical
- [ ] No seizure risk (no > 3Hz flashing)
- [ ] No auto-playing audio/video
- [ ] Touch targets >= 44x44px

#### Understandable
- [ ] Page language declared
- [ ] Form labels properly associated
- [ ] Error messages clear
- [ ] Labels match instructions
- [ ] Consistent navigation
- [ ] Consistent component behavior

#### Robust
- [ ] Valid HTML (no major errors)
- [ ] ARIA attributes correct
- [ ] ARIA roles appropriate
- [ ] No screen reader conflicts

### Accessibility Issues Found

#### Critical (Blocks users)
```
[ ] Issue: _________________________________
    WCAG Guideline: _________________________
    Fix: _________________________________
    
[ ] Issue: _________________________________
    WCAG Guideline: _________________________
    Fix: _________________________________
```

#### Major (Significant difficulty)
```
[ ] Issue: _________________________________
    Fix: _________________________________
```

#### Minor (Minor difficulty)
```
[ ] Issue: _________________________________
    Fix: _________________________________
```

### Common Issues Detected

#### Color & Contrast
- [ ] ☐ Text contrast insufficient
- [ ] ☐ Link contrast insufficient
- [ ] ☐ Icon contrast insufficient
- [ ] ☐ Color-only means of indication

#### Keyboard Navigation
- [ ] ☐ Focus ring missing (outline: none)
- [ ] ☐ Tab order incorrect
- [ ] ☐ Keyboard trap detected
- [ ] ☐ Shortcut conflicts

#### Images & Media
- [ ] ☐ Missing alt text
- [ ] ☐ Alt text not descriptive
- [ ] ☐ Missing image text alternative
- [ ] ☐ Video missing captions

#### Forms & Labels
- [ ] ☐ Form field not labeled
- [ ] ☐ Label not associated (aria-label missing)
- [ ] ☐ Error message not linked
- [ ] ☐ Required field not indicated

#### Screen Reader
- [ ] ☐ Missing aria-label
- [ ] ☐ Missing aria-describedby
- [ ] ☐ Incorrect role attribute
- [ ] ☐ Missing landmark regions

---

## Best Practices

### Security
- [ ] HTTPS enabled ✅
- [ ] No mixed content (HTTP assets)
- [ ] No insecure third-party scripts
- [ ] CSP header configured
- [ ] No known vulnerabilities in dependencies

### Browser Compatibility
- [ ] Works in Chrome/Edge 90+
- [ ] Works in Firefox 88+
- [ ] Works in Safari 14+
- [ ] Graceful degradation for older browsers
- [ ] No console errors/warnings

### Code Quality
- [ ] No JavaScript errors
- [ ] No DOM violations
- [ ] No layout thrashing
- [ ] No memory leaks detected
- [ ] Console clean (no warnings)

---

## SEO Audit

### Meta & Structured Data
- [ ] Page title present and descriptive
- [ ] Meta description present and descriptive
- [ ] OG tags present (sharing)
- [ ] Structured data (schema.org) implemented
- [ ] Mobile viewport tag present

### Content
- [ ] Meaningful page title
- [ ] Descriptive headings (H1 present)
- [ ] Content well-structured
- [ ] No duplicate content
- [ ] Images have descriptive alt text

### Links
- [ ] Internal links use descriptive text
- [ ] No "click here" links
- [ ] Links have proper HREF
- [ ] No broken internal links
- [ ] External links marked (if policy)

---

## PWA Checklist

- [ ] Web app manifest present
- [ ] Service worker registered
- [ ] Offline fallback page
- [ ] App icon (192px, 512px)
- [ ] Theme color defined
- [ ] Installable on home screen

---

## Mobile-Specific Audit

### Mobile Viewport
- [ ] Viewport meta tag present
- [ ] Proper zoom level
- [ ] Width = device-width
- [ ] Content fits mobile width (no horizontal scroll)

### Touch & Interaction
- [ ] Touch targets >= 44x44px
- [ ] Touch targets spaced >= 8px apart
- [ ] No double-tap delay (touch-action: manipulation)
- [ ] Hover states not triggered on mobile
- [ ] Swipe areas clear and intuitive

### Mobile Performance
- [ ] LCP optimized for mobile (< 2.5s)
- [ ] INP < 200ms on mobile
- [ ] Mobile-specific images (srcset)
- [ ] WebP images for modern browsers
- [ ] Minimal JavaScript for mobile

---

## Recommendations

### Quick Wins (< 1 hour each)
1. [ ] _________________________________
2. [ ] _________________________________
3. [ ] _________________________________

### Medium-term (1-4 hours each)
1. [ ] _________________________________
2. [ ] _________________________________

### Long-term (> 4 hours or strategic)
1. [ ] _________________________________
2. [ ] _________________________________

---

## Trend Analysis

### Previous Audits

| Date | Performance | Accessibility | Best Practices | SEO | Trend |
|------|-------------|----------------|----------------|-----|-------|
| [Date 1] | — | — | — | — | ↑ / ↓ / → |
| [Date 2] | — | — | — | — | ↑ / ↓ / → |
| [Date 3] | — | — | — | — | ↑ / ↓ / → |

---

## Sign-off

### Audit Status
- ☐ **PASS** — All scores ≥90, Core Web Vitals met, no critical A11y issues
- ☐ **PASS WITH NOTES** — Minor issues, action items identified
- ☐ **NEEDS WORK** — Critical issues found, cannot deploy
- ☐ **BLOCKED** — Accessibility blockers, must fix before release

### Auditor Sign-off
**Auditor:** ________________ **Date:** ________________  
**Verified by:** ________________ **Date:** ________________

### Action Items for Development

| Priority | Item | Owner | Target Date |
|----------|------|-------|-------------|
| Critical | | | |
| High | | | |
| Medium | | | |
| Low | | | |

---

## Next Steps

1. Assign critical issues to development
2. Schedule follow-up audit after fixes
3. Set up continuous monitoring (CWV metrics in Analytics)
4. Document solutions for future reference
5. Plan quarterly audits

---

## References

- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/
- **Web.dev metrics:** https://web.dev/metrics/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Core Web Vitals:** https://web.dev/vitals/
