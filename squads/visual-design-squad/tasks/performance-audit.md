---
task:
  id: performance-audit
  name: Performance Audit (Lighthouse & Core Web Vitals)
  description: |
    Run comprehensive Lighthouse audit and measure Core Web Vitals.
    Validates performance score >= 90, all metrics in green.
    Output: Lighthouse report, Core Web Vitals data, optimization recommendations
  agent: performance-a11y-specialist
  status: available
  
inputs:
  - page-url: "Live or staging page URL"
  - performance-budget: "From config/performance-budget.json"
  - optimization-target: "Target metrics (e.g., LCP < 2.5s, CLS < 0.1)"

outputs:
  - lighthouse-report: "lighthouse-report.json"
  - performance-audit: "performance-audit.md"
  - cwv-metrics: "core-web-vitals.json (LCP, CLS, INP)"
  - optimization-recommendations: "Performance issues with severity"
  - performance-budget-report: "budget-compliance.md"

elicit: true
elicit-format: |
  **Step 1: Metrics Priority**
  - Which metrics are most important?
  - Performance score target? (90+)
  - Core Web Vitals all green?

  **Step 2: Testing Conditions**
  - Desktop, mobile, or both?
  - Network conditions? (4G, 3G)
  - Device simulation? (High-end, mid-range, low-end)

  **Step 3: Optimization Focus**
  - Focus on LCP (largest contentful paint)?
  - Focus on CLS (cumulative layout shift)?
  - Focus on INP (interaction to next paint)?

dependencies:
  - requires: [frontend-implement-page, responsive-audit, responsive-optimize-images]
  - blocks: [quality-gate-visual]

checklist:
  - [ ] Page URL ready for audit
  - [ ] Lighthouse audit completed (desktop)
  - [ ] Lighthouse audit completed (mobile)
  - [ ] Performance score >= 90 verified
  - [ ] LCP metric measured (target < 2.5s)
  - [ ] CLS metric measured (target < 0.1)
  - [ ] INP metric measured (target < 200ms)
  - [ ] FCP measured (first contentful paint)
  - [ ] TTFB measured (time to first byte)
  - [ ] Speed Index measured
  - [ ] Total Blocking Time measured
  - [ ] Core Web Vitals status: ALL GREEN
  - [ ] Performance budget compliance verified
  - [ ] Optimization issues identified
  - [ ] Recommendations prioritized (critical/high/medium)
  - [ ] Report formatted and shared
  - [ ] Screenshots of audit results included

tools-required:
  - lighthouse
  - google-chrome-dev-tools
  - core-web-vitals-api
  - performance-budget-calculator
  - speedcurve-or-similar

success-criteria:
  - Lighthouse performance score >= 90
  - Core Web Vitals all within "Good" range
  - LCP < 2.5 seconds
  - CLS < 0.1
  - INP < 200ms
  - All major performance issues identified
  - Optimization recommendations clear and actionable
  - Performance budget complied with
  - Metrics stable across multiple runs

time-estimate: "1-2 days"

example: |
  ### Output: Lighthouse Report Summary

  ```
  Lighthouse Score
  ================
  Performance:       92/100 ✅
  Accessibility:     98/100 ✅
  Best Practices:    95/100 ✅
  SEO:              100/100 ✅

  Core Web Vitals
  ===============
  LCP (Largest Contentful Paint): 1.8s ✅ GOOD
  CLS (Cumulative Layout Shift):  0.05 ✅ GOOD
  INP (Interaction to Next Paint): 85ms ✅ GOOD

  Metrics
  =======
  First Contentful Paint (FCP):    0.9s ✅
  Time to First Byte (TTFB):       0.3s ✅
  Speed Index:                     1.2s ✅
  Total Blocking Time (TBT):       45ms ✅
  ```

  ### Output: performance-audit.md

  ```markdown
  # Performance Audit Report
  **Date:** 2026-04-07  
  **Page:** Landing Page  
  **Target:** Lighthouse >= 90, CWV all GREEN  
  **Result:** ✅ PASSED

  ## Overall Score
  - **Performance:** 92/100 ✅
  - **Accessibility:** 98/100 ✅
  - **Best Practices:** 95/100 ✅
  - **SEO:** 100/100 ✅

  ## Core Web Vitals Status
  | Metric | Value | Target | Status |
  |--------|-------|--------|--------|
  | LCP | 1.8s | < 2.5s | ✅ GOOD |
  | CLS | 0.05 | < 0.1 | ✅ GOOD |
  | INP | 85ms | < 200ms | ✅ GOOD |

  ## Detailed Metrics
  - **FCP (First Contentful Paint):** 0.9s
  - **TTFB (Time to First Byte):** 0.3s
  - **Speed Index:** 1.2s
  - **TBT (Total Blocking Time):** 45ms
  - **CLS by Frame:** Max 0.08 on scroll

  ## Optimization Issues (by severity)

  ### 🟢 GREEN — No issues
  - All critical metrics within target
  - No render-blocking resources
  - Images properly optimized

  ### ⚠️ YELLOW — Minor optimization
  1. **Unused CSS (8 KB)**
     - Impact: Minor (0.02s LCP)
     - Fix: Remove unused Tailwind utilities
     - Priority: LOW

  2. **Unused JavaScript (12 KB)**
     - Impact: Minor (0.03s LCP)
     - Fix: Remove unused polyfills
     - Priority: LOW

  ## Performance Budget Compliance
  | Category | Budget | Actual | Status |
  |----------|--------|--------|--------|
  | JS | 100 KB | 87 KB | ✅ PASS |
  | CSS | 50 KB | 28 KB | ✅ PASS |
  | Images | 200 KB | 185 KB | ✅ PASS |
  | Total | 400 KB | 300 KB | ✅ PASS |

  ## Recommendations
  1. **Remove unused CSS** (low priority, minimal impact)
  2. **Monitor CLS on real devices** (current is excellent)
  3. **Continue image optimization** (excellent work)
  4. **Regular performance monitoring** (set up RUM)

  ## Testing Conditions
  - Device: Simulated Moto G4
  - Network: Slow 4G
  - CPU: 4× slowdown
  - Date: 2026-04-07
  - Multiple runs: 5 (average score: 92)
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
