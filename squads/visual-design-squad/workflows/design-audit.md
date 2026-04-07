# Workflow: Design Audit (1 dia)

**Versão:** 1.0  
**Última atualização:** 2026-04-07  
**Duração:** 1 dia (4-8 horas)  
**Complexidade:** Média

---

## Objetivo

Auditar página existente ou componente para identificar issues de design visual, performance, e accessibility — gerando relatório priorizado com recomendações.

---

## Participantes

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| **Stella** | Visual Designer | Design consistency, tokens compliance |
| **Nova** | Performance & Accessibility | Lighthouse, WCAG 2.1, CWV metrics |

---

## Timeline

### **Session 1-2: Visual Design Audit** (Stella, ~2 horas)

#### Input
- URL ou screenshot da página/componente
- Design system tokens (para comparação)
- Design guidelines

#### Atividades

1. **Visual inspection**
   - Comparar com design mockups (se existem)
   - Verificar fidelidade (95%+?)
   - Identificar desvios

2. **Design system compliance**
   - Colors: Todos usam tokens?
   - Typography: Escala respeitada?
   - Spacing: Grid 8px respeitado?
   - Border radius: Tokens usados?
   - Shadows: Elevation system usado?

3. **Visual hierarchy**
   - Headings tamanhos corretos?
   - Contrast suficiente?
   - Whitespace apropriado?
   - Alignment consistente?

4. **Component consistency**
   - Buttons: Todos iguais?
   - Forms: Consistent styling?
   - Cards: Uniform spacing?
   - Icons: Consistent size/color?

5. **Brand consistency**
   - Brand colors used?
   - Typography matches brand?
   - Voice/tone reflected?

#### Issues Categories

**PASS ✅**
- Componente/página está 100% conforme
- Nenhuma ação necessária
- Pronto para produção

**WARNINGS ⚠️**
- Minor deviations (cor ligeiramente diferente)
- Doesn't affect functionality
- Nice-to-fix (can be scheduled)
- Low priority

**FAILS ❌**
- Significante deviation do design system
- Afeta brand consistency
- Medium-high priority
- Deve ser corrigido

**CRITICAL 🔴**
- Breaking brand guidelines
- Accessibility issue (visual)
- High priority
- Must fix before deploy

#### Output
```markdown
# Visual Design Audit Report

**Page:** [URL]
**Date:** 2026-04-07
**Auditor:** Stella
**Status:** PASS / WARNINGS / FAILS / CRITICAL

## Executive Summary
[1-3 line summary]

## ✅ PASS Items
- [ ] Color palette: 100% compliant
- [ ] Typography: 100% scale used
- [ ] Spacing: All items on-grid

## ⚠️ WARNINGS
- [ ] Issue: Button color slightly off (#2563EB vs #2461E0)
  - Severity: Low
  - Impact: Minor visual inconsistency
  - Recommendation: Update to exact token color

- [ ] Issue: Heading size inconsistent (one H2 is 34px vs 32px)
  - Severity: Low
  - Impact: Subtle hierarchy break
  - Recommendation: Standardize to 2rem token

## ❌ FAILS
- [ ] Issue: Input field padding non-standard (10px vs 8px)
  - Severity: Medium
  - Impact: Breaks grid alignment
  - Recommendation: Change to var(--spacing-1)

- [ ] Issue: Card shadow uses custom value (not elevation token)
  - Severity: Medium
  - Impact: Inconsistent elevation system
  - Recommendation: Use var(--shadow-md)

## 🔴 CRITICAL
(None found)

## Detailed Findings

### Colors
- Primary color: #2563EB ✅
- Secondary color: #10B981 ✅
- Error color: #DC2626 ⚠️ (used as #DC2728)

### Typography
- H1: 3.5rem, weight 700 ✅
- H2: 2rem, weight 600 ✅
- Body: 1rem, weight 400 ✅
- Small: 0.875rem, weight 400 ✅

### Spacing
- All padding: 8px multiples ✅
- All margins: 8px multiples ⚠️ (1 exception: 7px margin found)
- Gaps: 8px, 16px, 24px ✅

### Component Consistency
- Buttons: All match design ✅
- Form fields: All match design ✅
- Cards: All match design ✅
- Navigation: Match design ✅

## Recommendations by Priority

### High Priority (Do now)
1. Fix error color: #DC2728 → #DC2626
2. Standardize H2 size: 34px → 32px
3. Fix odd margin: 7px → 8px

### Medium Priority (Schedule soon)
1. Input field padding: 10px → 8px
2. Card shadow: custom → var(--shadow-md)

### Low Priority (Nice-to-have)
1. Update button color (very close match)

## Total Issues Found
- Critical: 0
- Fails: 2
- Warnings: 3
- Passes: 8

## Overall Status: WARNINGS
**Action Required:** Fix 2 fail items before deploy. Warnings can be addressed in next iteration.
```

#### Comandos
```bash
@visual-designer
Page: [URL or page name]

*audit-visual
```

---

### **Session 3-4: Performance & Accessibility Audit** (Nova, ~2-3 horas)

#### Input
- Live URL ou local instance
- Figma design (reference)
- Design tokens

#### Atividades

1. **Lighthouse audit**
   - Run desktop audit
   - Run mobile audit
   - Check all 5 metrics:
     - Performance
     - Accessibility
     - Best Practices
     - SEO
     - PWA (if applicable)

2. **Core Web Vitals**
   - LCP (Largest Contentful Paint)
   - CLS (Cumulative Layout Shift)
   - INP (Interaction to Next Paint)
   - TTFB (Time to First Byte)

3. **WCAG 2.1 AA compliance**
   - Use axe DevTools scan
   - Use WAVE
   - Manual testing:
     - Keyboard navigation
     - Screen reader (NVDA, JAWS)
     - Color contrast
     - Focus indicators

4. **Visual a11y**
   - Color contrast (text, UI, graphical)
   - Focus rings visible
   - Error states clear
   - Loading states indicated
   - Not relying on color alone

5. **Accessibility scan issues**
   - Color contrast violations
   - Missing labels
   - Missing alt text
   - Keyboard traps
   - Missing landmarks
   - ARIA misuse

#### Output

```markdown
# Performance & Accessibility Audit Report

**Page:** [URL]
**Date:** 2026-04-07
**Auditor:** Nova
**Device:** Desktop / Mobile
**Status:** PASS / NEEDS WORK / BLOCKED

## Executive Summary
[1-3 line summary of findings]

## Scores

### Lighthouse Scores
| Category | Score | Target | Status |
|----------|-------|--------|--------|
| Performance | 87 | 90+ | ⚠️ Needs work |
| Accessibility | 92 | 90+ | ✅ PASS |
| Best Practices | 88 | 90+ | ⚠️ Needs work |
| SEO | 95 | 90+ | ✅ PASS |

### Core Web Vitals
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| LCP | 2.8s | <2.5s | ❌ FAIL |
| CLS | 0.08 | <0.1 | ✅ PASS |
| INP | 180ms | <200ms | ✅ PASS |

## Accessibility Audit

### ✅ PASS
- [ ] All text has sufficient contrast (4.5:1+)
- [ ] All buttons have focus indicators
- [ ] All form fields properly labeled
- [ ] Page is keyboard navigable
- [ ] No keyboard traps detected

### ⚠️ WARNINGS
- [ ] 1 image missing alt text
  - Location: Hero section, 2nd image
  - Priority: High
  - Fix: Add descriptive alt text

- [ ] Some inputs lack error announcements
  - Location: Checkout form
  - Priority: Medium
  - Fix: Add aria-describedby for errors

### ❌ FAILURES
- [ ] 3 color contrast violations
  - Issue: Gray text (#9CA3AF) on light gray bg (#F3F4F6)
  - Ratio: 3.2:1 (need 4.5:1)
  - Fix: Darken text or lighten background

- [ ] Focus ring too subtle
  - Location: All buttons
  - Issue: 1px outline (should be 3px)
  - Fix: Increase outline-width

## Detailed Issues

### High Priority (Fix immediately)
1. **LCP slow (2.8s → target <2.5s)**
   - Cause: Hero image unoptimized
   - Fix: Convert to WebP, implement lazy loading
   - Effort: 30min

2. **Color contrast: Gray text on light gray**
   - Locations: 3 instances (sidebar links, captions)
   - Fix: Darken text color or change background
   - Effort: 15min

3. **Focus ring too subtle**
   - All interactive elements
   - Fix: Increase outline from 1px to 3px
   - Effort: 10min

### Medium Priority (Schedule soon)
1. **Missing alt text on images**
   - 1 image (hero section)
   - Effort: 10min

2. **Error messages not announced**
   - Form validation
   - Fix: Add aria-describedby
   - Effort: 20min

### Low Priority (Nice-to-have)
1. **Best Practices score: 88 → 90+**
   - Mixed content warning
   - Effort: TBD

## A11y Scan Results

**Tool:** axe DevTools  
**Issues Found:** 5
- Critical: 0
- Serious: 2
- Moderate: 2
- Minor: 1

**Tool:** WAVE  
**Alerts:** 3
- Redundant title
- Empty link
- Missing fieldset

## Keyboard Navigation Test

| Test | Result | Notes |
|------|--------|-------|
| Tab through all buttons | ✅ PASS | Order logical |
| Enter activates buttons | ✅ PASS | — |
| Escape closes modals | ✅ PASS | — |
| Arrow keys in dropdown | ⚠️ FAIL | Not implemented |
| Tab to form fields | ✅ PASS | — |

## Screen Reader Test (NVDA)

| Test | Result | Notes |
|------|--------|-------|
| Announcements correct | ✅ PASS | Button text clear |
| State changes announced | ⚠️ PARTIAL | Loading not announced |
| Form labels announced | ✅ PASS | — |
| Error messages announced | ⚠️ PARTIAL | Some missing |

## Overall Assessment

**Status:** NEEDS WORK  
**Blocker?:** No (can deploy with issues)  
**Recommendation:** Fix high priority items in next sprint

---

## Action Items

### Before Next Deploy (Required)
- [ ] Optimize hero image (LCP)
- [ ] Fix color contrast (3 items)
- [ ] Increase focus ring (all buttons)

### Next Sprint (Recommended)
- [ ] Add alt text (1 image)
- [ ] Add error announcements (form)
- [ ] Implement arrow keys (dropdown)

### Future (Nice-to-have)
- [ ] Improve Best Practices score
- [ ] Fix WAVE alerts (not blocking)

---

## Audit Sign-off

**Auditor:** Nova  
**Date:** 2026-04-07  
**Next Review:** 30 days or after fixes
```

#### Comandos
```bash
@performance-a11y-specialist
Page: [URL or page name]

*audit-performance
*audit-a11y
```

---

## When to Use This Workflow

✅ **When to audit:**
- Page before deploy to production
- Component before adding to library
- Existing page quarterly check
- After major update or redesign
- User reports accessibility issues
- Performance regression suspected

❌ **When not to audit:**
- During active development (too early)
- For internal tools (if business allows)
- For very simple pages (e.g., 404)

---

## Typical Findings

### Common Visual Issues
- [ ] Colors not using tokens
- [ ] Spacing off-grid
- [ ] Typography size inconsistent
- [ ] Shadows custom instead of tokens
- [ ] Border radius not standard
- [ ] Component styling inconsistent

### Common Performance Issues
- [ ] Large unoptimized images
- [ ] Missing lazy loading
- [ ] Too much JavaScript
- [ ] Poor font loading strategy
- [ ] Render blocking resources

### Common A11y Issues
- [ ] Color contrast fails
- [ ] Missing alt text
- [ ] Focus ring removed
- [ ] Form fields unlabeled
- [ ] Keyboard navigation broken
- [ ] prefers-reduced-motion ignored

---

## Success Criteria

| Critério | Target | Status |
|----------|--------|--------|
| Lighthouse Performance | >= 90 | ✅ or ⚠️ |
| Lighthouse Accessibility | >= 90 | ✅ or ⚠️ |
| WCAG 2.1 AA | 100% pass | ✅ or ⚠️ |
| Zero critical issues | 0 | ✅ |
| Actionable report | YES | ✅ |

---

## Tools Used

- **Lighthouse:** Built-in to Chrome DevTools
- **axe DevTools:** Browser extension
- **WAVE:** Browser extension (WebAIM)
- **Color Contrast Analyzer:** https://www.tpgi.com/color-contrast-checker/
- **Screen readers:** NVDA (free), JAWS, VoiceOver

---

## References

- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Core Web Vitals:** https://web.dev/vitals/
- **WebAIM:** https://webaim.org/

---

**Last Updated:** 2026-04-07  
**Maintained by:** Visual Design Squad
