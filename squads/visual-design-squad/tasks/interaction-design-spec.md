---
task:
  id: interaction-design-spec
  name: Create Interaction Design Specification
  description: |
    Specify all interactions for the page: micro-interactions, animations, 
    state transitions, feedback patterns, loading states, error handling.
    Output: interaction-spec.md with detailed specifications
  agent: ux-interaction-designer
  status: available
  
inputs:
  - visual-spec: "From visual-designer (design specification)"
  - wireframe: "Original wireframe from Uma"
  - user-flows: "User journeys from Uma research"
  - component-list: "Components identified in visual spec"

outputs:
  - interaction-spec: "interaction-spec.md"
  - state-diagrams: "Visual diagrams of state transitions"
  - animation-guide: "Animation timings, easing, durations"
  - feedback-patterns: "Loading, error, success feedback specs"

elicit: true
elicit-format: |
  **Step 1: Component Interactions**
  - Which components have interactive states? (buttons, forms, cards, etc.)
  - What interactions are needed for each?
    - Hover states?
    - Focus states (keyboard)?
    - Click/active states?
    - Loading states?
    - Error/success states?

  **Step 2: Animation Strategy**
  - Should there be entrance animations?
  - Smooth transitions between states?
  - Any complex animations needed?
  - Animation duration preferences? (fast: 200ms, medium: 300ms, slow: 500ms)

  **Step 3: Feedback Patterns**
  - How should forms provide feedback? (inline, tooltip, error message)
  - Loading pattern? (spinner, skeleton, progress bar)
  - Success confirmation? (toast, modal, redirect)
  - Error handling? (alert, inline error, retry option)

dependencies:
  - requires: visual-design-create-spec
  - optional-requires: uma-user-flows
  - blocks: [interaction-states-define, frontend-implement-page]

checklist:
  - [ ] Visual spec reviewed for interactive elements
  - [ ] User flows analyzed for interaction points
  - [ ] All components identified and mapped
  - [ ] Interaction type identified for each component (hover, focus, click, etc.)
  - [ ] State transitions documented (default → hover → active)
  - [ ] Animation timings defined (entrance, transitions, feedback)
  - [ ] Accessibility interactions considered (keyboard navigation, focus visible)
  - [ ] Loading states specified for async operations
  - [ ] Error states specified with clear messaging
  - [ ] Success feedback patterns defined
  - [ ] Animation easing functions selected
  - [ ] Interaction spec document complete
  - [ ] State diagrams created
  - [ ] Ready for frontend implementation

tools-required:
  - figma-prototyping
  - state-diagram-tool
  - animation-preview-tool

success-criteria:
  - All interactive elements specified
  - State transitions are clear and logical
  - Animations enhance UX without being distracting
  - Feedback patterns are consistent
  - Accessibility interactions are included
  - Specification is implementation-ready
  - Designer/developer alignment confirmed

time-estimate: "1-2 days"

example: |
  ### Output: interaction-spec.md
  ```markdown
  # Interaction Specification — Landing Page

  ## Button Component

  ### States
  - **Default:** Gray background, black text, 44px height
  - **Hover:** Darker background (darker gray), subtle shadow
  - **Focus:** 2px outline, offset 2px
  - **Active/Pressed:** Scale 0.98 (slight compression)
  - **Disabled:** Opacity 50%, cursor not-allowed

  ### Animations
  - State transition: 150ms ease-out
  - No entrance animation (fast interaction feedback)

  ### Accessibility
  - Focus visible: 2px outline with 2px offset
  - Keyboard accessible: Space/Enter to activate
  - Screen reader: Announced as "button"

  ---

  ## Form Field Component

  ### States
  - **Default:** Empty, gray border
  - **Focus:** Blue border, outline color
  - **Filled:** Black text on white background
  - **Error:** Red border, error message shown, error icon
  - **Disabled:** Gray background, cursor not-allowed

  ### Interactions
  - Focus: Show blue outline + hint text (optional)
  - Validation: On blur or real-time (specify)
  - Error: Show inline error message, color red
  - Success: Show checkmark icon (optional)

  ### Animations
  - Error message: Slide in from top, 200ms ease-out
  - Success checkmark: Fade in, 200ms ease-out

  ---

  ## Loading State (Async Operations)

  ### Pattern
  - Show loading spinner (brand primary color)
  - Disable interactive elements (opacity 50%, cursor wait)
  - Show loading message: "Processing..."
  - Timeout after 30 seconds → error state

  ### Animation
  - Spinner rotation: Linear, 1 second per rotation
  - Fade in: 150ms ease-out

  ---

  ## Error Feedback

  ### Pattern
  - Toast notification (bottom-right)
  - Red background, white text, icon
  - Auto-dismiss after 5 seconds or manual close
  - Sound cue (optional accessibility): Error beep

  ### Animation
  - Slide in from right: 200ms ease-out
  - Slide out: 150ms ease-in (on dismiss)

  ---

  ## Success Feedback

  ### Pattern
  - Toast notification (bottom-right)
  - Green background, white text, checkmark icon
  - Auto-dismiss after 3 seconds
  - Optional confetti animation (not too long)

  ### Animation
  - Slide in from right: 200ms ease-out
  - Confetti: 1.5 second duration
  - Slide out: 150ms ease-in (on dismiss)
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
