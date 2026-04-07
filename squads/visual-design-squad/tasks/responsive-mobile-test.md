---
task:
  id: responsive-mobile-test
  name: Mobile UX Testing & Validation
  description: |
    Test page on actual mobile devices and validate mobile-specific UX.
    Covers touch interactions, keyboard input, battery/bandwidth constraints.
    Output: Mobile testing report with issues and recommendations
  agent: responsive-specialist
  status: available
  
inputs:
  - page-implementation: "Complete page from frontend tasks"
  - mobile-ux-spec: "Mobile-specific UX requirements"
  - touch-targets: "Touch target specifications (>= 44px)"
  - mobile-breakpoints: "Mobile breakpoint sizes"

outputs:
  - mobile-test-report: "mobile-ux-report.md"
  - device-test-results: "Testing on iOS and Android devices"
  - issues-found: "Mobile-specific issues identified"
  - performance-on-mobile: "Mobile performance metrics"
  - recommendations: "Mobile optimization recommendations"

elicit: true
elicit-format: |
  **Step 1: Device Coverage**
  - Which devices to test? (iPhone SE, iPhone 14, Android phones)
  - Which OS versions? (Latest + one prior version)
  - Actual devices or browser emulation?

  **Step 2: Testing Scenarios**
  - Standard connection (WiFi, 4G)?
  - Slow connection (3G, 2G)?
  - Battery mode enabled?
  - Landscape orientation?

  **Step 3: Interaction Testing**
  - Touch interactions work correctly?
  - Keyboard input (on-screen keyboard)?
  - Scrolling performance?
  - Form input on mobile?

dependencies:
  - requires: [frontend-implement-page, responsive-audit]
  - blocks: [performance-audit, quality-gate-visual]

checklist:
  - [ ] Mobile devices identified for testing
  - [ ] Test scenario plan created
  - [ ] Tested on iOS (Safari, Chrome)
  - [ ] Tested on Android (Chrome, Firefox)
  - [ ] Touch targets verified >= 44px
  - [ ] Touch interactions tested (tap, scroll, swipe)
  - [ ] On-screen keyboard tested with forms
  - [ ] Landscape orientation tested
  - [ ] Page scrolls smoothly (60fps target)
  - [ ] Images load correctly on mobile
  - [ ] Forms are usable on mobile
  - [ ] Text is readable without zoom
  - [ ] Buttons accessible without pinch-zoom
  - [ ] Tested on slow connection (throttle)
  - [ ] Tested on low battery mode
  - [ ] Issues documented with severity
  - [ ] Recommendations provided
  - [ ] Report formatted and ready

tools-required:
  - actual-mobile-devices
  - browser-dev-tools (device emulation)
  - network-throttling
  - performance-metrics-tool
  - screenshot-tool

success-criteria:
  - Page is fully usable on mobile devices
  - No layout breaking on mobile
  - Touch interactions work smoothly
  - Forms are easy to fill on mobile
  - Text is readable without zoom
  - Images load and display correctly
  - Performance is acceptable on 3G/4G
  - No major issues found
  - Mobile UX meets standards

time-estimate: "1-2 days"

example: |
  ### Output: mobile-ux-report.md

  ```markdown
  # Mobile UX Testing Report
  **Date:** 2026-04-07  
  **Devices Tested:**
  - iPhone 14 (iOS 17)
  - iPhone SE (iOS 16)
  - Samsung Galaxy S23 (Android 14)
  - Google Pixel 7 (Android 14)

  **Status:** PASS with 3 minor recommendations

  ## Testing Results

  ### Touch Interactions ✅
  - All buttons responsive to touch
  - Touch targets >= 44px verified
  - No accidental touches on close buttons
  - Swipe interactions smooth

  ### Form Usability ✅
  - On-screen keyboard doesn't hide form
  - Input fields remain visible
  - Submit button accessible after filling
  - Error messages clear on mobile

  ### Performance on Mobile
  - Initial load: 2.3s (4G) — ✅ GOOD
  - Scroll FPS: 58-60fps — ✅ SMOOTH
  - Low battery mode: No performance loss — ✅ PASS

  ### Issues Found

  ### ⚠️ MINOR
  1. **Hero image height on landscape**
     - Context: iPhone landscape orientation
     - Issue: Image takes up too much vertical space
     - Fix: Reduce image height on landscape (max-height: 200px)

  2. **Button padding on small phones**
     - Context: iPhone SE (320px)
     - Issue: Button label close to edges
     - Fix: Add 8px horizontal padding buffer

  3. **Tap feedback visual**
     - Context: All devices
     - Issue: No visual feedback for tap (besides state change)
     - Recommendation: Add slight background darken on tap

  ## Mobile-Specific Recommendations
  1. Test with actual slow network (3G throttling)
  2. Consider safe-area insets for notched phones
  3. Test on more Android devices (fragmentation)
  4. Add pull-to-refresh on scrollable sections (if applicable)

  ## Accessibility on Mobile
  - ✅ Touch targets >= 44×44px
  - ✅ Text size readable without zoom
  - ✅ Focus indicators visible
  - ✅ Voice control compatible

  ## Battery & Data
  - ✅ No excessive requests
  - ✅ No autoplay videos
  - ✅ Lazy loading enabled
  - ✅ Efficient animations
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
