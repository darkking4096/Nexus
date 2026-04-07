# Interaction Design Specification Template

**Project:** ________________  
**Component/Page:** ________________  
**Designer:** ________________  
**Date:** ________________  
**Version:** 1.0

---

## Overview

### Component Purpose
_What is the primary function of this component or page? What problem does it solve?_

### User Goal
_What does the user want to accomplish when interacting with this component?_

### Interaction Pattern
_What existing pattern does this follow? (Button, Form, Modal, Dropdown, etc.)_

---

## State Machine Definition

### States (8-State System)

#### 1. **Default State**
- **Visual appearance:** (Description of colors, typography, spacing)
- **Cursor:** pointer | default | text | ...
- **ARIA attributes:** (aria-label, aria-describedby, etc.)
- **Example:** [Placeholder for screenshot/mockup]

#### 2. **Hover State** (Desktop only)
- **Visual changes:** (Color change, shadow, scale, etc.)
- **Duration:** 200ms ease-out
- **CSS:** `transition: all 200ms ease-out;`
- **Example:** [Placeholder for screenshot/mockup]

#### 3. **Focus State** (Keyboard)
- **Visual changes:** (Focus ring, outline, highlight)
- **Focus ring:** 3px solid var(--color-focus), 2px offset
- **Visible:** Always (even on mouse/touch focus)
- **Example:** [Placeholder for screenshot/mockup]

#### 4. **Active/Pressed State**
- **Visual changes:** (Down state, pressed appearance)
- **Duration:** Immediate (0ms)
- **Feedback:** Visual change happens on click/tap
- **Example:** [Placeholder for screenshot/mockup]

#### 5. **Filled State** (Form inputs only)
- **Visual changes:** (Highlight, border color change)
- **When used:** When value is entered
- **Duration:** 200ms ease-out
- **Example:** [Placeholder for screenshot/mockup]

#### 6. **Error State**
- **Visual changes:** (Red border, error icon, error text color)
- **Text color:** var(--color-error)
- **Message:** Show error text below/above field
- **Duration:** Immediate appearance, 300ms animation if auto-triggered
- **Example:** [Placeholder for screenshot/mockup]

#### 7. **Disabled State**
- **Visual changes:** (Reduced opacity, gray out, cursor: not-allowed)
- **Opacity:** 50% or 60%
- **Cursor:** not-allowed
- **Interaction:** No response to clicks/taps
- **Example:** [Placeholder for screenshot/mockup]

#### 8. **Loading State** (If applicable)
- **Visual indicator:** Spinner, skeleton, or progress bar
- **Animation:** 1-2 second loop
- **Text:** "Loading..." or spinner icon
- **Duration:** Until action completes
- **Example:** [Placeholder for screenshot/mockup]

---

## State Transition Map

### Valid State Transitions

```
Default ──hover──> Hover
Default ──focus──> Focus
Default ──click──> Active ──release──> Default
Default ──type(fill)──> Filled
Default ──invalid──> Error
Default ──disable──> Disabled
Default ──submit──> Loading ──complete──> Success
Error ──clear──> Default
Disabled ──enable──> Default
```

### Transition Details

| From | To | Duration | Easing | Trigger |
|------|----|-----------|----|---------|
| Default | Hover | 200ms | ease-out | Mouse enter |
| Hover | Default | 200ms | ease-out | Mouse leave |
| Default | Focus | 0ms | — | Tab/Click |
| Focus | Default | 0ms | — | Blur |
| Default | Active | 50ms | ease-in | Mouse down / Touch |
| Active | Default | 100ms | ease-out | Mouse up / Touch end |
| Default | Filled | 200ms | ease-out | Input value change |
| Default | Error | 300ms | ease-out | Validation failure |
| Error | Default | 200ms | ease-out | Error cleared |
| Default | Disabled | 0ms | — | Disabled attribute set |
| Disabled | Default | 0ms | — | Disabled attribute removed |

---

## Animations

### Entrance Animation
- **Element:** [Component name]
- **Type:** Fade in, Scale in, Slide in, etc.
- **Duration:** 300ms
- **Easing:** ease-out
- **Direction:** [Top, bottom, left, right]
- **CSS:** `animation: slide-in-up 300ms ease-out forwards;`

### Exit Animation
- **Element:** [Component name]
- **Type:** Fade out, Scale out, Slide out, etc.
- **Duration:** 200ms
- **Easing:** ease-in
- **Direction:** [Top, bottom, left, right]
- **CSS:** `animation: slide-out-down 200ms ease-in forwards;`

### Micro-animation Loop (Loading)
- **Element:** [Spinner/Indicator name]
- **Type:** Rotate, bounce, pulse, etc.
- **Duration:** 1.5s
- **Easing:** linear
- **CSS:** `animation: spin 1.5s linear infinite;`

---

## Affordances (Visual Hints)

### Clickability Affordances
- [ ] Button "looks" pressable (shadow, depth, contrast)
- [ ] Link underlined or colored differently
- [ ] Icon indicates action (arrow, plus, download, etc.)
- [ ] Cursor changes to `pointer`

### Interaction Affordances
- [ ] Input field "looks" editable (border, background, placeholder text)
- [ ] Draggable elements have drag handle icon
- [ ] Swipeable elements show directional arrow/hint
- [ ] Scrollable areas show scroll indicator

### Feedback Affordances
- [ ] State changes are visually obvious
- [ ] Feedback is immediate (< 100ms)
- [ ] Feedback is distinguishable from normal state

---

## Accessibility Requirements

### Keyboard Navigation
- [ ] Component accessible via Tab key
- [ ] Tab order logical (left-to-right, top-to-bottom)
- [ ] Enter/Space triggers button action
- [ ] Arrow keys navigate menu/list items
- [ ] Escape closes modal/dropdown
- [ ] No keyboard traps

### Screen Reader
- [ ] Button purpose clear from text
- [ ] Form label associated with input (via `<label>` or `aria-label`)
- [ ] Error message announced (aria-invalid, aria-describedby)
- [ ] Loading state announced (role="status", aria-live)
- [ ] State changes announced

### Focus Management
- [ ] Focus indicator visible at all times
- [ ] Focus indicator meets 3:1 contrast
- [ ] Focus ring not outline: none (never remove!)
- [ ] Focus moves to new content when page updates
- [ ] Focus returns to trigger when modal closes

### Motion Preferences
- [ ] `prefers-reduced-motion: reduce` media query respected
- [ ] Animations disabled for users with motion preferences
- [ ] Essential animations kept (focus indication)
- [ ] Non-essential animations removed

---

## Mobile/Touch Considerations

### Touch Targets
- [ ] Minimum touch target size: 44x44px
- [ ] Spacing between targets: 8px minimum
- [ ] Hover states NOT shown on touch (use :not(:hover) or pointer-events)

### Touch Feedback
- [ ] Tap feedback immediate (50-200ms)
- [ ] Visual feedback clear on touch
- [ ] No "double-tap to zoom" conflicts

### Swipe/Gesture
- [ ] Swipe direction intuitive (left/right/up/down)
- [ ] Gesture visual feedback clear
- [ ] Velocity affects animation duration

---

## Error Handling

### Input Validation Errors
- [ ] Error shown immediately or on blur?
- [ ] Error message clear and actionable
- [ ] Error color used: var(--color-error)
- [ ] Error icon displayed (optional)

### Network/Async Errors
- [ ] Loading state shown during request
- [ ] Error message shown if request fails
- [ ] Retry option provided
- [ ] Toast/notification animation (slide in)

### Edge Cases
- [ ] Empty state (if applicable)
- [ ] Very long text handling
- [ ] Disabled state behavior

---

## Performance Considerations

### Animation Performance
- [ ] Animations run at 60fps (no jank)
- [ ] GPU acceleration: `will-change: transform;`
- [ ] CSS animations used (not JavaScript)
- [ ] No layout shifts during animation (CLS)

### Responsiveness
- [ ] Interaction responds in < 100ms
- [ ] No blocking operations during animation
- [ ] Loading indicators for slow actions

---

## Specification Comparison

| Element | Desktop | Tablet | Mobile |
|---------|---------|--------|--------|
| Touch target size | — | 44x44px | 44x44px |
| Hover state | Yes | Limited | No |
| Animation duration | 200-500ms | 200-500ms | 100-300ms |
| Breakpoint | 1024px+ | 768px-1023px | 320px-767px |

---

## Design Tokens Used

### Colors
- Primary: `var(--color-primary)` = #2563EB
- Error: `var(--color-error)` = #DC2626
- Text: `var(--color-text-primary)` = #1F2937
- Focus ring: `var(--color-focus)` = [Color]

### Typography
- Font family: `var(--font-sans)` = Inter
- Font size: `var(--font-size-body)` = 1rem
- Font weight: `var(--font-weight-medium)` = 500

### Spacing
- Unit: `var(--spacing-unit)` = 8px
- Gap: `var(--spacing-2)` = 16px

### Transitions
- Fast: `var(--transition-fast)` = 150ms ease-out
- Normal: `var(--transition-normal)` = 300ms ease-out

---

## Handoff to Development

### CSS Variables Required
```css
--color-primary: #2563EB;
--color-error: #DC2626;
--color-text-primary: #1F2937;
--color-focus: #2563EB;
--transition-fast: 150ms ease-out;
--transition-normal: 300ms ease-out;
```

### Component Files
- Component HTML: [file path]
- Component CSS: [file path]
- Design tokens: [file path]
- Accessibility checklist: [link]

### Developer Notes
_Any special considerations, gotchas, or implementation notes for the developer?_

---

## Approval

**Designer:** ________________ **Date:** ________________  
**Design Lead:** ________________ **Date:** ________________  
**Developer (Pre-review):** ________________ **Date:** ________________
