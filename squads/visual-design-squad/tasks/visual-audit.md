---
task:
  id: visual-audit
  name: Visual Design Audit
  description: |
    Audit existing visual implementation against design system.
    Checks consistency, token compliance, hierarchy, accessibility contrast.
    Output: audit report with findings and recommendations
  agent: visual-designer
  status: available
  
inputs:
  - page-url: "Live page URL or file path"
  - design-tokens: "Reference design-tokens.json"
  - visual-spec: "Original design specification"
  - audit-scope: "Specific areas to focus on or full audit"

outputs:
  - audit-report: "visual-audit.md"
  - findings: "Issues categorized by severity (critical/high/medium/low)"
  - recommendations: "Specific fixes for each issue"
  - compliance-score: "Percentage compliance with design system"

elicit: true
elicit-format: |
  **Step 1: Scope Definition**
  - Which components/sections to audit?
  - Are we checking full-page or specific areas?
  - Is this post-implementation audit or mid-development?

  **Step 2: Focus Areas**
  - Check typography consistency? (Yes/No)
  - Check color palette compliance? (Yes/No)
  - Check spacing/grid adherence? (Yes/No)
  - Check component state variations? (Yes/No)
  - Check accessibility contrast? (Yes/No)

  **Step 3: Comparison Baseline**
  - Compare against original design spec?
  - Compare against design tokens?
  - Compare against design system standards?

dependencies:
  - optional-requires: [visual-tokens-create, visual-design-create-spec]
  - independent: true

checklist:
  - [ ] Audit scope clearly defined
  - [ ] Page/implementation reviewed visually
  - [ ] Typography checked (sizes, weights, line heights)
  - [ ] Color palette verified (primaries, secondaries, accents)
  - [ ] Spacing/grid consistency checked
  - [ ] Component variations audited (hover, active, disabled)
  - [ ] Accessibility contrast validated (WCAG AA minimum)
  - [ ] Design token compliance verified
  - [ ] Brand consistency checked
  - [ ] Findings categorized by severity
  - [ ] Recommendations provided with priority
  - [ ] Screenshots/evidence included in report
  - [ ] Audit report formatted and shared

tools-required:
  - browser-inspector
  - color-contrast-checker
  - design-comparison-tool
  - accessibility-scanner

success-criteria:
  - Comprehensive audit completed
  - All major issues identified
  - Recommendations are actionable
  - Report is clear and prioritized
  - Findings are documented with evidence
  - Compliance score calculated accurately

time-estimate: "4-6 hours"

example: |
  ### Input
  ```
  Page: /landing-page
  Design Tokens: design-tokens.json
  Audit Scope: Full page visual consistency
  ```

  ### Output: visual-audit.md
  ```markdown
  # Visual Audit Report — Landing Page
  **Date:** 2026-04-07  
  **Compliance Score:** 85%

  ## ✅ PASSES
  - H1 typography: 100% match (3.5rem, 700 weight)
  - Hero section spacing: Compliant with grid
  - Color palette: All primary colors correct

  ## ⚠️ WARNINGS (Medium Priority)
  - H2 heading: 1.8rem instead of 2rem (-10% variance)
  - Card padding: 12px instead of 16px (not on grid)
  - Button hover state: Color #1D4ED8 vs token #1D4ED8 ✓

  ## 🔴 CRITICAL (High Priority)
  - Feature grid spacing: 20px gap (should be 24px)
  - Testimonial section: Custom color #3B82F6 not in palette
  - CTA button: 40px height vs 44px standard

  ## Recommendations
  1. Update H2 size to 2rem
  2. Adjust card padding to 16px
  3. Fix feature grid gap to 24px
  4. Replace custom color with secondary token
  5. Update button height to 44px (touch target)
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
