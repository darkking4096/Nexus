---
task:
  id: interaction-states-define
  name: Define Component States & Variations
  description: |
    Define all component state variations (default, hover, focus, active, 
    disabled, loading, error, success). Creates component state matrix.
    Output: Component state guide with visual/behavioral specifications
  agent: ux-interaction-designer
  status: available
  
inputs:
  - interaction-spec: "From interaction-design-spec task"
  - visual-spec: "Visual design specification"
  - component-inventory: "List of components to define states for"

outputs:
  - state-matrix: "states-matrix.md (all components × states)"
  - state-diagrams: "State transition diagrams (visual)"
  - state-guide: "component-states-guide.md"
  - state-figma: "Figma file with all state variations illustrated"

elicit: true
elicit-format: |
  **Step 1: Components to Define**
  - Which components need state definitions?
  - Buttons, inputs, cards, modals, etc.?
  - Any custom/unique components?

  **Step 2: State Types**
  - Which states apply to each component?
    - Default (initial state)
    - Hover (mouse over)
    - Focus (keyboard navigation)
    - Active (clicked/selected)
    - Disabled (not interactive)
    - Loading (async operation)
    - Error (validation failed)
    - Success (action completed)

  **Step 3: Visual Changes per State**
  - Color changes?
  - Size/scale changes?
  - Opacity changes?
  - Icon/indicator changes?
  - Cursor changes?

dependencies:
  - requires: interaction-design-spec
  - optional-requires: visual-tokens-create
  - blocks: [frontend-implement-component]

checklist:
  - [ ] Interaction spec reviewed
  - [ ] Component inventory compiled
  - [ ] State types identified for each component
  - [ ] Visual changes defined for each state
  - [ ] Color specifications from tokens applied
  - [ ] Animations defined for state transitions
  - [ ] Accessibility indicators included (focus visible, etc.)
  - [ ] State matrix created (component × state grid)
  - [ ] State diagrams drawn (transition flows)
  - [ ] Figma mockups showing all states
  - [ ] Edge cases identified and handled
  - [ ] Documentation formatted and clear
  - [ ] Ready for frontend implementation
  - [ ] Designer/developer alignment confirmed

tools-required:
  - figma-or-similar
  - state-diagram-tool
  - color-contrast-checker

success-criteria:
  - All components have complete state definitions
  - All states are visually distinct and clear
  - Transitions between states are smooth
  - Accessibility requirements met (focus visible, etc.)
  - State definitions match design tokens
  - Documentation is implementation-ready
  - No ambiguities in specifications

time-estimate: "1-2 days"

example: |
  ### Output: states-matrix.md
  ```markdown
  # Component State Matrix

  ## Button
  | State | Color | Size | Border | Cursor | Notes |
  |-------|-------|------|--------|--------|-------|
  | Default | Primary (token) | 44px h | None | pointer | Base state |
  | Hover | Primary-dark | 44px h | None | pointer | Darker background |
  | Focus | Primary + outline | 44px h | 2px outline | pointer | Keyboard focus |
  | Active | Primary-darker | 44px h | None | pointer | Scale 0.98 |
  | Disabled | Gray | 44px h | None | not-allowed | Opacity 50% |

  ## Text Input
  | State | Border | Background | Text Color | Icon | Notes |
  |-------|--------|------------|------------|------|-------|
  | Default | Light gray | White | Dark gray | - | No focus |
  | Focus | Primary blue | White | Dark gray | - | Blue outline |
  | Filled | Light gray | White | Black | - | Value entered |
  | Error | Red | White | Red (error text) | X icon | Validation failed |
  | Success | Green | White | Black | ✓ icon | Validation passed |
  | Disabled | Light gray | Gray bg | Gray text | - | Opacity 50% |

  ## Card
  | State | Shadow | Background | Border | Hover | Notes |
  |-------|--------|------------|--------|-------|-------|
  | Default | Small (elevation 1) | White | Light gray | None | Base card |
  | Hover | Medium (elevation 4) | White | Light gray | Slight lift | Clickable card |
  | Focus | Medium + outline | White | Primary outline | Keyboard focus | Tab navigation |
  | Selected | Medium | Light bg | Primary 2px | - | User selected |
  ```

  ### Output: State Diagram (Example)
  ```
  Button Component States:
  
  [DEFAULT]
      ↓ (mouse enter)
  [HOVER]
      ↓ (mouse down / keyboard space)
  [ACTIVE]
      ↓ (mouse up / space release)
  [DEFAULT]
  
  [ANY STATE]
      ↓ (disabled=true)
  [DISABLED]
      ↓ (disabled=false)
  [DEFAULT]
  
  [ANY STATE]
      ↓ (keyboard focus)
  [FOCUS] — Shows 2px outline
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
