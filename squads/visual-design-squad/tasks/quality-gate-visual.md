---
task:
  id: quality-gate-visual
  name: Final Quality Gate (Visual Design)
  description: |
    Final comprehensive quality gate before production deployment.
    Verifies all design, performance, accessibility, and responsiveness requirements.
    Output: Quality gate pass/fail verdict and final recommendations
  agent: performance-a11y-specialist
  status: available
  
inputs:
  - design-spec: "Original design specification"
  - performance-audit: "From performance-audit task"
  - a11y-audit: "From a11y-audit task"
  - responsive-audit: "From responsive-audit task"
  - mobile-test: "From responsive-mobile-test task"

outputs:
  - quality-gate-report: "quality-gate-PASS.md or quality-gate-FAIL.md"
  - final-verdict: "PASS | FAIL | PASS-WITH-EXCEPTIONS"
  - production-readiness: "Production readiness checklist"
  - final-recommendations: "Any remaining improvements"

elicit: true
elicit-format: |
  **Step 1: Quality Criteria**
  - Lighthouse score >= 90?
  - Core Web Vitals all green?
  - WCAG 2.1 AA compliant?
  - All responsive breakpoints tested?
  - All design specs matched?

  **Step 2: Exception Handling**
  - Are there acceptable exceptions? (e.g., non-critical medium-priority issues)
  - How many issues would require a FAIL verdict?

  **Step 3: Sign-off**
  - Who needs to approve before production?
  - What documentation is required?

dependencies:
  - requires: [performance-audit, a11y-audit, responsive-audit, responsive-mobile-test, visual-audit]
  - final-gate: true
  - blocks: []

checklist:
  - [ ] All prerequisite audits completed
  - [ ] Performance audit: Lighthouse >= 90 ✅
  - [ ] Performance audit: Core Web Vitals all GREEN ✅
  - [ ] Accessibility audit: WCAG 2.1 AA ✅
  - [ ] Accessibility audit: Zero critical violations ✅
  - [ ] Responsive audit: All breakpoints tested ✅
  - [ ] Responsive audit: No layout breaking ✅
  - [ ] Mobile test: Passed on iOS and Android ✅
  - [ ] Visual audit: 100% design spec match ✅
  - [ ] Visual audit: All design tokens applied ✅
  - [ ] Image optimization: File size within budget ✅
  - [ ] Security basics checked (no hardcoded secrets)
  - [ ] SEO basics checked (meta tags, schema, accessibility)
  - [ ] Cross-browser testing completed (Chrome, Firefox, Safari, Edge)
  - [ ] Code review passed
  - [ ] No console errors or warnings
  - [ ] Analytics tracking implemented (if required)
  - [ ] 404/error pages handled
  - [ ] Redirect strategy implemented
  - [ ] Documentation complete
  - [ ] Stakeholder review/approval obtained
  - [ ] Final verdict documented
  - [ ] Ready for deployment

tools-required:
  - quality-checklist
  - reporting-tool
  - stakeholder-communication

success-criteria:
  - Quality gate PASSED
  - All critical metrics within target
  - No critical accessibility violations
  - Page is production-ready
  - Documentation complete
  - Team approval obtained

time-estimate: "4-8 hours"

example: |
  ### Output: quality-gate-PASS.md

  ```markdown
  # FINAL QUALITY GATE REPORT
  **Date:** 2026-04-07  
  **Page:** Landing Page  
  **Verdict:** ✅ PASSED — READY FOR PRODUCTION

  ---

  ## Quality Checklist Summary

  ### 🎨 Design & Visual
  - ✅ Design spec 100% matched
  - ✅ Design tokens applied (24/24)
  - ✅ Visual audit: 95% compliance
  - ✅ Brand consistency: 100%
  - ✅ Color contrast: All >= 4.5:1

  ### ⚡ Performance
  - ✅ Lighthouse Score: 92/100
  - ✅ Performance: 92/100
  - ✅ LCP: 1.8s (target < 2.5s)
  - ✅ CLS: 0.05 (target < 0.1)
  - ✅ INP: 85ms (target < 200ms)
  - ✅ Performance budget: 300KB / 400KB

  ### ♿ Accessibility
  - ✅ WCAG 2.1 AA: COMPLIANT
  - ✅ Automated violations: 0
  - ✅ Keyboard navigation: PASS
  - ✅ Screen reader: PASS
  - ✅ Focus indicators: VISIBLE

  ### 📱 Responsiveness
  - ✅ 320px (mobile): PASS
  - ✅ 640px (tablet): PASS
  - ✅ 768px (iPad): PASS
  - ✅ 1024px (desktop): PASS
  - ✅ 1440px+ (wide): PASS
  - ✅ iOS devices: TESTED ✅
  - ✅ Android devices: TESTED ✅

  ### 🔧 Technical
  - ✅ Valid HTML
  - ✅ CSS follows BEM/Atomic design
  - ✅ Code review: PASSED
  - ✅ No console errors
  - ✅ No hardcoded secrets
  - ✅ SEO basics: PASS

  ---

  ## Final Verdict

  **✅ PRODUCTION READY**

  This page meets all quality criteria and is approved for production deployment.

  ---

  ## Deployment Checklist

  - [ ] Staging URL: https://staging.example.com/landing
  - [ ] Production URL: https://example.com/landing
  - [ ] DNS updated
  - [ ] CDN cache cleared
  - [ ] Analytics configured
  - [ ] Monitoring set up (error tracking, RUM)
  - [ ] Backup created
  - [ ] Rollback plan documented

  ---

  ## Post-Deployment Monitoring

  Monitor these metrics for 24 hours post-launch:

  ### Performance
  - Real User Monitoring (RUM) LCP
  - Real User Monitoring (RUM) CLS
  - Real User Monitoring (RUM) INP
  - Error tracking (JS errors, 404s)

  ### Accessibility
  - User feedback (a11y issues)
  - Automated monitoring (axe integration)

  ### User Experience
  - Page load time
  - User engagement metrics
  - Conversion funnel
  - Error rates

  ---

  ## Sign-off

  - **Design Review:** ✅ Stella — Approved 2026-04-07
  - **Performance Review:** ✅ Nova — Approved 2026-04-07
  - **Code Review:** ✅ Claude — Approved 2026-04-07
  - **Product Owner:** ⏳ Pending
  - **Stakeholder:** ⏳ Pending

  ---

  ## Deployment Ready

  **🚀 Approved for production deployment**

  Scheduled deploy time: 2026-04-08 14:00 UTC
  Deployment window: 30 minutes
  Rollback procedure: [link]
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
