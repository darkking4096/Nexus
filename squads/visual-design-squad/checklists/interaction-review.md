# ✨ Interaction Design Review Checklist

**Page/Component:** ________________  
**Reviewer:** ________________  
**Date:** ________________  
**Status:** ☐ PASS  ☐ NEEDS FIXES  ☐ FAIL

---

## Interaction State Machine

### 8-State System Coverage
- [ ] Default state defined and styled
- [ ] Hover state defined and styled
- [ ] Focus state defined and styled (keyboard navigation)
- [ ] Active/Pressed state defined and styled
- [ ] Filled state defined and styled
- [ ] Error state defined and styled
- [ ] Disabled state defined and styled
- [ ] Loading state defined and styled (if applicable)

### State Transitions
- [ ] Transitions are smooth (100-600ms duration)
- [ ] All transitions have appropriate easing (ease-in-out, ease-out)
- [ ] State changes are instantaneous or animated appropriately
- [ ] No jarring or sudden visual shifts
- [ ] Loading spinners/indicators animate at consistent speed

---

## Animation & Motion

### Animation Principles
- [ ] Animations enhance user understanding (not just decoration)
- [ ] Animation duration: 100-600ms (critical interactions at lower end)
- [ ] Easing functions consistent (ease-out for entrances, ease-in-out for transitions)
- [ ] Animations have purpose and intent
- [ ] No overly complex or confusing animations
- [ ] Motion aligns with user expectations

### Specific Interactions
- [ ] Button press has visual feedback (50-200ms)
- [ ] Form input focus has visual transition (200-300ms)
- [ ] Dropdown open/close animated (200-400ms)
- [ ] Modal entrance has transition (300ms)
- [ ] Page transitions smooth (300-500ms)
- [ ] Loading indicators animated (1-2s loops)
- [ ] Success/error messages have entrance animation (200-300ms)

### Motion Accessibility
- [ ] `prefers-reduced-motion` respected in all animations
- [ ] Animations disabled for users who prefer reduced motion
- [ ] No parallax or distracting background movements
- [ ] No auto-playing videos or animated ads (except essential UI)
- [ ] Animations do not cause seizure risk (no flashing > 3Hz)

---

## Feedback & Affordances

### Visual Feedback
- [ ] Buttons visibly change on click
- [ ] Form inputs show focus state clearly
- [ ] Links are clearly interactive (underlined, colored, or styled differently)
- [ ] Hover states visible for all interactive elements
- [ ] Feedback is immediate (< 100ms)
- [ ] Feedback is obvious and distinctive

### Affordances (Don Norman)
- [ ] Buttons "look" clickable
- [ ] Links "look" clickable
- [ ] Inputs "look" editable
- [ ] Disabled elements look disabled
- [ ] Draggable items show drag affordance
- [ ] Swipeable elements indicate direction
- [ ] Scrollable areas show scroll hint (if needed)

### Success/Confirmation
- [ ] Form submission shows success message
- [ ] Delete/critical actions ask for confirmation
- [ ] Undo available for destructive actions (if applicable)
- [ ] Toast/notification placement non-intrusive
- [ ] Success indicator (checkmark, color) visible for 2-3 seconds

---

## Micro-interactions

### Button Interactions
- [ ] Click/tap feedback immediate
- [ ] Focus ring visible (keyboard nav)
- [ ] Disabled state prevents interaction
- [ ] Loading state shows progress indicator
- [ ] Hover state visible on desktop
- [ ] Touch target >= 44px

### Form Interactions
- [ ] Input focus shows clear focus ring
- [ ] Typing provides visual feedback
- [ ] Error state shows immediately on validation failure
- [ ] Helper text visibility clear
- [ ] Label interaction accessible
- [ ] Autocomplete shows suggestions clearly

### Dropdown/Menu Interactions
- [ ] Open animation smooth (200-400ms)
- [ ] Close animation smooth
- [ ] Hover over options shows selection state
- [ ] Arrow icon rotates or changes on open/close
- [ ] Keyboard navigation works (arrow keys, enter)
- [ ] Escape key closes menu

### Modal/Overlay Interactions
- [ ] Entrance animation (fade in, scale in)
- [ ] Backdrop (if used) appears with entrance
- [ ] Close button clearly visible
- [ ] Escape key closes modal
- [ ] Focus trapped inside modal (accessibility)
- [ ] Exit animation smooth

---

## Accessibility of Interactions

### Keyboard Navigation
- [ ] Tab order is logical
- [ ] Tab order follows visual reading direction
- [ ] All interactive elements accessible by keyboard
- [ ] No keyboard trap (can escape any element)
- [ ] Keyboard shortcuts documented (if custom)
- [ ] Focus indicator always visible

### Screen Reader
- [ ] Button purpose clear from text/aria-label
- [ ] Link destination/purpose clear
- [ ] Form labels properly associated with inputs
- [ ] Error messages announced to screen readers
- [ ] Loading state announced (role="status")
- [ ] Success messages announced
- [ ] Interactive state changes announced

### Focus Management
- [ ] Focus indicator meets contrast requirements (3:1)
- [ ] Focus indicator is visible (not outline: none)
- [ ] Focus moves to new content when page updates
- [ ] Focus returns to trigger when modal closes
- [ ] Skip links present for keyboard users (if applicable)

### ARIA Attributes
- [ ] aria-label used for icon-only buttons
- [ ] aria-pressed for toggle buttons
- [ ] aria-expanded for collapsible sections
- [ ] aria-live used for dynamic content
- [ ] aria-disabled for disabled state
- [ ] role attributes appropriate

---

## Page-level Interactions

### Navigation
- [ ] Active page indicator clear
- [ ] Navigation items have hover/focus state
- [ ] Current page visually distinguished
- [ ] Mobile menu toggle has clear state
- [ ] Navigation transitions smooth

### Scrolling
- [ ] Sticky header (if used) doesn't obscure content
- [ ] "Back to top" button present (if long page)
- [ ] Infinite scroll has loading indicator
- [ ] Page sections clearly delineated
- [ ] Scroll position remembered (if applicable)

### Forms
- [ ] Clear visual focus on active field
- [ ] Required field indicators visible
- [ ] Error messages appear near fields
- [ ] Success confirmation after submission
- [ ] Form reset clears and resets state

---

## Consistency & Patterns

### Interaction Consistency
- [ ] All buttons behave the same way
- [ ] All inputs behave the same way
- [ ] All dropdowns behave the same way
- [ ] Hover/focus states consistent across page
- [ ] Interactive patterns match design system
- [ ] No unexpected behavior changes

### User Expectations
- [ ] Interactions match user mental models
- [ ] Behavior matches other websites/apps
- [ ] Familiar patterns used (no reinventing)
- [ ] Special interactions are exceptional (not default)

---

## Responsiveness of Interactions

### Touch Interactions (Mobile)
- [ ] Touch targets >= 44x44px
- [ ] Touch targets have spacing (8px minimum)
- [ ] Tap feedback immediate (50-200ms)
- [ ] No "double-tap to zoom" conflicts
- [ ] Long-press interactions clear
- [ ] Swipe direction intuitive

### Pointer Interactions (Desktop)
- [ ] Hover state visible on desktop only
- [ ] Hover provides useful information (tooltip, preview)
- [ ] Cursor changes appropriately (pointer, text, etc.)
- [ ] Right-click context menus (if custom) accessible

### Breakpoint Variations
- [ ] Mobile interactions optimized for touch
- [ ] Tablet interactions balanced (touch + pointer)
- [ ] Desktop interactions optimized for mouse
- [ ] Transitions smooth across breakpoints

---

## Performance of Interactions

### Animation Performance
- [ ] Animations run at 60fps (no jank)
- [ ] No layout shift during animations (CLS impact)
- [ ] CSS animations used (not JavaScript)
- [ ] GPU acceleration used where appropriate
- [ ] will-change property applied to animated elements

### Responsiveness
- [ ] User interactions respond in < 100ms
- [ ] No "laggy" feeling
- [ ] Loading states appear quickly
- [ ] No blocked interactions during load

---

## Spec Comparison

### Compared to Interaction Design Spec
- [ ] All specified interactions implemented
- [ ] Animation durations match spec
- [ ] State designs match spec
- [ ] Microinteraction details match spec
- [ ] Feedback mechanisms match spec

---

## Common Issues to Catch

### Missing Feedback
- [ ] ☐ No visual feedback on click
- [ ] ☐ No focus state for keyboard
- [ ] ☐ No loading indicator for slow actions
- [ ] ☐ Success not confirmed to user

### Accessibility Issues
- [ ] ☐ Focus ring removed (outline: none)
- [ ] ☐ Keyboard navigation broken
- [ ] ☐ Color only indicates state (no pattern/icon)
- [ ] ☐ Screen reader doesn't announce changes

### Animation Issues
- [ ] ☐ Animations too fast (< 100ms)
- [ ] ☐ Animations too slow (> 600ms)
- [ ] ☐ prefers-reduced-motion ignored
- [ ] ☐ Animations distract from content

### Responsiveness Issues
- [ ] ☐ Touch targets too small (< 44px)
- [ ] ☐ Hover-only interactions on mobile
- [ ] ☐ No mobile consideration for interactions
- [ ] ☐ Swipe direction counterintuitive

---

## Final Review

### Overall Interaction Quality
- [ ] Interactions feel polished and responsive
- [ ] No confusing or unexpected behaviors
- [ ] Consistent with design system
- [ ] Professional and intuitive
- [ ] Delightful without distraction

### Production Readiness
- [ ] All interactions tested on mobile and desktop
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Performance acceptable
- [ ] Ready for implementation

---

## Reviewer Sign-off

**Reviewer:** ________________  
**Date:** ________________  

### Verdict
- ☐ **APPROVED** — All interactions meet criteria, ready for implementation
- ☐ **APPROVED WITH MINOR NOTES** — Minor issues noted, acceptable
- ☐ **NEEDS FIXES** — Issues found, see below
- ☐ **REJECTED** — Critical interaction flaws, redesign needed

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
