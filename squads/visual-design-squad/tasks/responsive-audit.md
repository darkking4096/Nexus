---
task:
  id: responsive-audit
  name: Responsive Design Audit
  description: |
    Test page responsiveness across all breakpoints (mobile-first approach).
    Validates layouts, typography, spacing, and touch targets at each breakpoint.
    Output: Responsive testing report with issues and recommendations
  agent: responsive-specialist
  status: available
  
inputs:
  - page-implementation: "HTML/CSS from frontend-implement-page task"
  - design-tokens: "Breakpoint definitions from config"
  - mobile-first-spec: "Mobile-first design requirements"
  - target-breakpoints: "Breakpoints to test (xs/sm/md/lg/xl/2xl)"

outputs:
  - audit-report: "responsive-audit.md"
  - breakpoint-test-results: "Testing results for each breakpoint"
  - issues-found: "List of responsive issues with severity"
  - screenshot-evidence: "Screenshots at each breakpoint"
  - recommendations: "Specific fixes needed"

elicit: true
elicit-format: |
  **Step 1: Breakpoint Strategy**
  - What are the target breakpoints?
  - Mobile-first approach or desktop-first?
  - Priority breakpoints? (mobile most important)

  **Step 2: Testing Scope**
  - Which elements to test at each breakpoint?
  - Focus on layout, typography, spacing, or all?
  - Test on actual devices or browser emulation?

  **Step 3: Touch Targets**
  - Verify touch targets are >= 44px?
  - Check spacing between interactive elements?
  - Mobile tap targets correct?

dependencies:
  - requires: frontend-implement-page
  - blocks: [performance-audit, quality-gate-visual]

checklist:
  - [ ] Page implementation reviewed
  - [ ] Target breakpoints identified
  - [ ] Mobile-first approach verified
  - [ ] Layout tested at xs (320px)
  - [ ] Layout tested at sm (640px)
  - [ ] Layout tested at md (768px)
  - [ ] Layout tested at lg (1024px)
  - [ ] Layout tested at xl (1280px)
  - [ ] Layout tested at 2xl (1536px)
  - [ ] Typography sizes scale appropriately
  - [ ] Spacing adjusts for screen size
  - [ ] Images are responsive (not stretched)
  - [ ] Touch targets >= 44px verified
  - [ ] No horizontal scrolling (except intentional)
  - [ ] Navigation adapts to screen size
  - [ ] Forms are usable on mobile
  - [ ] Breakpoint transitions are smooth
  - [ ] Issues documented with severity
  - [ ] Recommendations provided
  - [ ] Screenshots captured at each breakpoint
  - [ ] Report formatted and ready

tools-required:
  - browser-dev-tools (device emulation)
  - actual-mobile-devices (iOS/Android)
  - responsive-testing-tool
  - screenshot-tool

success-criteria:
  - Page is usable and looks good at all breakpoints
  - No layout breaking at any screen size
  - Typography is readable at all sizes
  - Touch targets are adequate for mobile
  - Images scale appropriately
  - Navigation is accessible at all sizes
  - Performance remains acceptable at all breakpoints
  - Mobile-first approach verified
  - All issues identified and documented
  - Recommendations are actionable

time-estimate: "1-2 days"

example: |
  ### Output: responsive-audit.md

  ```markdown
  # Responsive Design Audit Report
  **Date:** 2026-04-07  
  **Page:** Landing Page  
  **Status:** PASS with 2 minor issues

  ## Breakpoint Testing Results

  ### 320px (iPhone SE)
  - **Layout:** ✅ PASS (single column, stacked)
  - **Typography:** ✅ PASS (readable at 16px+)
  - **Spacing:** ✅ PASS (16px padding)
  - **Touch targets:** ✅ PASS (all >= 44px)
  - **Images:** ✅ PASS (responsive, no stretch)
  - **Issues:** None

  ### 640px (iPad Portrait)
  - **Layout:** ✅ PASS (2-column where appropriate)
  - **Issues:** None

  ### 768px (iPad Landscape)
  - **Layout:** ✅ PASS (3-column grid)
  - **Issues:** ⚠️ Button width too wide, overlaps text

  ### 1024px+ (Desktop)
  - **Layout:** ✅ PASS (full width utilized)
  - **Typography:** ✅ PASS (hierarchy clear)
  - **Spacing:** ✅ PASS (grid consistent)
  - **Issues:** ⚠️ Hero image height could be optimized

  ## Issues Found

  ### ⚠️ MEDIUM PRIORITY
  1. **Button width at 768px**
     - Issue: Button text wraps, layout breaks
     - Location: Hero CTA button
     - Fix: Add `width: auto` constraint or reduce button width

  2. **Hero image height optimization**
     - Issue: Image height not optimized for desktop
     - Location: Hero section
     - Fix: Use aspect-ratio and max-height

  ## Recommendations
  1. Add responsive width constraints to buttons
  2. Optimize image aspect ratios for different viewports
  3. Test on actual devices (currently tested in browser emulation)
  4. Consider landscape orientation for tablets

  ## Screenshots
  - [320px view](screenshot-320px.png)
  - [768px view](screenshot-768px.png)
  - [1024px view](screenshot-1024px.png)
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
