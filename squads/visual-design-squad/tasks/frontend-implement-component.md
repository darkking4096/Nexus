---
task:
  id: frontend-implement-component
  name: Implement Reusable Component
  description: |
    Implement a single reusable component (button, card, form field, etc.).
    Includes all variants, states, and accessibility features.
    Output: Component HTML/CSS with complete documentation
  agent: frontend-developer
  status: available
  
inputs:
  - component-spec: "Visual specification for component"
  - state-definitions: "All state variants (hover, focus, active, disabled, etc.)"
  - design-tokens: "Design tokens for colors, spacing, typography"
  - interaction-spec: "Interaction behaviors for component"

outputs:
  - component-html: "/components/{component-name}.html"
  - component-css: "/styles/components/{component-name}.css"
  - component-variants: "All variants documented"
  - usage-documentation: "COMPONENT-GUIDE.md"
  - accessibility-report: "A11y checks passed"

elicit: true
elicit-format: |
  **Step 1: Component Definition**
  - What is this component called?
  - What is its primary purpose?
  - What are the required props/attributes?

  **Step 2: Variants**
  - How many variants? (size, color, state)
  - Example: button-primary-large, button-secondary-small, etc.
  - Are all variants necessary or only key ones?

  **Step 3: Accessibility**
  - Is this interactive (button, input, link)?
  - What ARIA attributes are needed?
  - Keyboard navigation required?

dependencies:
  - requires: [visual-design-create-spec, visual-tokens-create, interaction-states-define]
  - can-block: frontend-implement-page

checklist:
  - [ ] Component specification understood
  - [ ] All variants identified
  - [ ] HTML structure created (semantic)
  - [ ] CSS for default state implemented
  - [ ] All variant styles implemented
  - [ ] Hover state implemented
  - [ ] Focus state implemented
  - [ ] Active state implemented
  - [ ] Disabled state implemented (if applicable)
  - [ ] Loading state implemented (if applicable)
  - [ ] Error state implemented (if applicable)
  - [ ] Design tokens applied (no hardcoded values)
  - [ ] Responsive considerations addressed
  - [ ] Accessibility attributes added (ARIA, semantic HTML)
  - [ ] Keyboard navigation tested
  - [ ] Documentation written (usage, variants, accessibility)
  - [ ] Code review passed
  - [ ] Ready for integration

tools-required:
  - html-editor
  - css-editor
  - browser-dev-tools
  - accessibility-checker

success-criteria:
  - All variants implemented and visually correct
  - All states clearly defined and working
  - Accessibility fully implemented
  - Component is reusable across pages
  - Documentation is complete
  - Code is maintainable and follows conventions
  - No hardcoded values (uses tokens)
  - Passes accessibility audit (WCAG AA)

time-estimate: "4-8 hours per component"

example: |
  ### Component: Button

  **Variants:**
  - Primary, Secondary, Tertiary (color)
  - Small, Medium, Large (size)
  - Combined: primary-large, secondary-small, etc.

  **States per Variant:**
  - Default
  - Hover
  - Focus (keyboard)
  - Active (clicked)
  - Disabled

  ### Output: /components/button.html
  ```html
  <button class="btn btn--primary btn--large" type="button">
    Click Me
  </button>

  <button class="btn btn--primary btn--large" disabled>
    Disabled Button
  </button>

  <button class="btn btn--secondary btn--medium">
    Secondary Button
  </button>
  ```

  ### Output: /styles/components/button.css
  ```css
  /* Base Button */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
    font-size: var(--typography-body-size);
    font-weight: 600;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 150ms ease-out;
    min-height: 44px; /* Touch target */
  }

  /* Variants: Color */
  .btn--primary {
    background-color: var(--color-primary);
    color: white;
  }

  .btn--primary:hover {
    background-color: var(--color-primary-hover);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn--primary:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .btn--primary:active {
    transform: scale(0.98);
  }

  .btn--primary:disabled {
    background-color: var(--color-disabled);
    cursor: not-allowed;
    opacity: 0.5;
  }

  /* Variants: Size */
  .btn--small {
    padding: calc(var(--spacing-unit) * 0.75) calc(var(--spacing-unit) * 1.5);
    font-size: 0.875rem;
    min-height: 36px;
  }

  .btn--large {
    padding: calc(var(--spacing-unit) * 2) calc(var(--spacing-unit) * 3);
    font-size: 1.125rem;
    min-height: 48px;
  }
  ```

  ### Output: COMPONENT-GUIDE.md
  ```markdown
  # Button Component Guide

  ## Usage
  ```html
  <button class="btn btn--primary">Primary Button</button>
  ```

  ## Variants
  - **Colors:** primary, secondary, tertiary
  - **Sizes:** small, medium, large
  - **States:** default, hover, focus, active, disabled

  ## Accessibility
  - Semantic `<button>` tag used
  - Focus state visible (outline)
  - Touch target minimum 44px
  - Disabled state with `disabled` attribute
  - Text contrast ratio >= 4.5:1

  ## Examples
  - Primary Large: `btn btn--primary btn--large`
  - Secondary Small: `btn btn--secondary btn--small`
  - Disabled: Add `disabled` attribute
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
