---
task:
  id: a11y-audit
  name: Accessibility Audit (WCAG 2.1 AA)
  description: |
    Complete accessibility audit against WCAG 2.1 Level AA standards.
    Tests color contrast, keyboard navigation, screen reader compatibility.
    Output: Accessibility audit report with issues and remediation steps
  agent: performance-a11y-specialist
  status: available
  
inputs:
  - page-url: "Live or staging page URL"
  - wcag-standards: "WCAG 2.1 Level AA requirements"
  - accessibility-checklist: "Internal a11y checklist"

outputs:
  - a11y-audit-report: "a11y-audit.md"
  - violations-found: "WCAG violations (automated + manual)"
  - contrast-report: "Color contrast analysis"
  - keyboard-nav-report: "Keyboard navigation testing"
  - screen-reader-report: "Screen reader compatibility"
  - remediation-steps: "How to fix each violation"

elicit: true
elicit-format: |
  **Step 1: Audit Scope**
  - Full page or specific sections?
  - Which WCAG level? (AA or AAA)
  - Focus on critical issues?

  **Step 2: Testing Methods**
  - Automated tools? (axe, WAVE)
  - Manual testing with keyboard?
  - Screen reader testing? (NVDA, JAWS, VoiceOver)

  **Step 3: Priority Issues**
  - Critical accessibility blockers?
  - Common WCAG violations to focus on?

dependencies:
  - requires: [frontend-implement-page, responsive-audit]
  - blocks: [quality-gate-visual]

checklist:
  - [ ] Page URL ready for audit
  - [ ] WCAG 2.1 AA checklist prepared
  - [ ] Automated scanning completed (axe, WAVE)
  - [ ] Manual contrast checking (CCA, Color Contrast Analyzer)
  - [ ] Keyboard navigation tested (all interactive elements)
  - [ ] Focus visible states verified
  - [ ] Tab order logical and correct
  - [ ] Screen reader testing (NVDA/JAWS/VoiceOver)
  - [ ] Alt text presence and quality verified
  - [ ] Form labels and error messages tested
  - [ ] Semantic HTML verified
  - [ ] ARIA attributes correctly used
  - [ ] Links have descriptive text
  - [ ] Buttons have accessible names
  - [ ] Lists properly structured
  - [ ] Headings hierarchy correct (h1 → h2 → h3)
  - [ ] Images have proper alt text (decorative vs informative)
  - [ ] Video captions and transcripts present
  - [ ] Color not used as only indicator
  - [ ] Text size readable (minimum 12px)
  - [ ] Line spacing adequate (1.5x)
  - [ ] Motion/animation can be paused/disabled
  - [ ] Issues documented with WCAG reference
  - [ ] Remediation steps provided
  - [ ] Report formatted and ready

tools-required:
  - axe-devtools
  - wave-browser-extension
  - contrast-checker
  - lighthouse-a11y
  - nvda-or-jaws
  - voiceover-macos

success-criteria:
  - Zero critical accessibility violations
  - WCAG 2.1 AA compliant
  - All automated scanning issues resolved
  - Keyboard navigation fully functional
  - Screen reader compatible
  - Color contrast >= 4.5:1 for text
  - Alt text meaningful and descriptive
  - Form inputs properly labeled
  - No keyboard traps
  - Focus indicators visible
  - Document structure logical

time-estimate: "2-3 days"

example: |
  ### Output: a11y-audit.md

  ```markdown
  # Accessibility Audit Report (WCAG 2.1 AA)
  **Date:** 2026-04-07  
  **Page:** Landing Page  
  **Compliance Target:** WCAG 2.1 Level AA  
  **Result:** ✅ PASSED (0 violations)

  ## Summary
  - **Automated Violations:** 0
  - **Manual Testing Issues:** 0
  - **Contrast Issues:** 0
  - **Keyboard Navigation:** ✅ PASS
  - **Screen Reader:** ✅ PASS
  - **Overall Compliance:** ✅ 100% AA COMPLIANT

  ## WCAG 2.1 AA Criteria Checklist

  ### Perceivable
  - ✅ 1.1.1 Non-text Content (alt text present)
  - ✅ 1.4.3 Contrast (Minimum) — 4.5:1 for all text
  - ✅ 1.4.5 Images of Text (none used, pure text preferred)

  ### Operable
  - ✅ 2.1.1 Keyboard (all interactive elements keyboard accessible)
  - ✅ 2.1.2 No Keyboard Trap (focus can move freely)
  - ✅ 2.1.4 Character Key Shortcuts (none used)
  - ✅ 2.4.3 Focus Order (logical and intuitive)
  - ✅ 2.4.7 Focus Visible (clear focus indicators)

  ### Understandable
  - ✅ 3.1.1 Language of Page (lang="en" set)
  - ✅ 3.2.1 On Focus (no unexpected context changes)
  - ✅ 3.3.1 Error Identification (error messages clear)
  - ✅ 3.3.4 Error Prevention (confirmation for important actions)

  ### Robust
  - ✅ 4.1.1 Parsing (valid HTML)
  - ✅ 4.1.2 Name, Role, Value (proper ARIA)
  - ✅ 4.1.3 Status Messages (ARIA live regions used)

  ## Detailed Findings

  ### Color Contrast Analysis
  ```
  Heading 1 (#2563EB on #FFFFFF): 7.2:1 ✅ EXCEED
  Body text (#1F2937 on #FFFFFF): 12.1:1 ✅ EXCEED
  Button text (white on #2563EB): 6.8:1 ✅ EXCEED
  ```

  ### Keyboard Navigation
  - ✅ All buttons keyboard accessible
  - ✅ All form fields keyboard accessible
  - ✅ Tab order logical (left → right, top → bottom)
  - ✅ Focus indicators visible on all elements
  - ✅ No keyboard traps
  - ✅ Escape key closes modals

  ### Screen Reader Testing (NVDA)
  - ✅ Page title announced correctly
  - ✅ Headings structure correct
  - ✅ Links have descriptive text
  - ✅ Buttons have accessible names
  - ✅ Form labels associated correctly
  - ✅ Alt text for images present

  ### Example: Hero Section
  ```html
  <!-- Good semantic structure -->
  <section aria-label="Hero">
    <h1>Welcome to Our Product</h1>
    <p>The best solution for your needs</p>
    <button>Get Started</button>
  </section>
  ```

  ## Recommendations
  None — full WCAG 2.1 AA compliance achieved.

  ## Testing Tools Used
  - axe DevTools: 0 violations
  - WAVE: 0 errors
  - NVDA Screen Reader: Full compatibility
  - Color Contrast Analyzer: All ratios verified
  - Lighthouse A11y: 98/100

  ## Maintenance
  - Perform a11y audit on every update
  - Use axe DevTools in CI/CD pipeline
  - Train team on WCAG basics
  - Test with actual assistive technology monthly
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
