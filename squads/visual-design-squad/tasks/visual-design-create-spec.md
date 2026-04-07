---
task:
  id: visual-design-create-spec
  name: Create Visual Specification
  description: |
    Transform wireframe into high-fidelity visual specification.
    Includes typography hierarchy, color palette, composition, spacing.
    Deliverable: design spec (Figma/mock) + detailed visual requirements
  agent: visual-designer
  status: available
  
inputs:
  - wireframe: "Figma link or file"
  - brand-guidelines: "Brand context document"
  - target-audience: "User personas or audience description"
  - business-requirements: "Goals, messaging, call-to-actions"

outputs:
  - design-spec: "{page-name}-design-spec.md"
  - visual-requirements: "Typography scale, color palette, spacing grid"
  - mockup-link: "Figma/Sketch link (if applicable)"
  - design-tokens-sketch: "Preliminary token definitions"

elicit: true
elicit-format: |
  **Step 1: Understand Requirements**
  - What is the primary goal of this page? (e.g., convert, inform, engage)
  - Who is the target audience? (link to persona)
  - What is the brand tone? (professional, playful, minimal, bold)
  - Are there existing design guidelines to follow?

  **Step 2: Design Decisions**
  - Typography system? (modular scale, font stack)
  - Color palette? (primary, secondary, accents, neutrals)
  - Spacing/grid system? (8px, 16px, etc.)
  - Visual hierarchy approach? (size, weight, color, spacing)

  **Step 3: Component Inventory**
  - What components does this page need? (buttons, cards, forms, etc.)
  - Any special interactions? (hover states, animations, feedback)

dependencies:
  - requires: uma-wireframe
  - blocks: [interaction-design-spec, frontend-implement-page]

checklist:
  - [ ] Wireframe analyzed and understood
  - [ ] Brand guidelines reviewed
  - [ ] Typography scale defined (minimum 5 sizes: h1, h2, h3, body, small)
  - [ ] Color palette created (primary, secondary, accents, neutrals, status colors)
  - [ ] Spacing/grid system defined (base unit + multiples)
  - [ ] Visual hierarchy demonstrated (contrast, emphasis, flow)
  - [ ] Component variations sketched (default, hover, active, disabled states)
  - [ ] Accessibility contrast ratios verified (WCAG AA minimum)
  - [ ] Design spec document complete and clear
  - [ ] Mockup/design file created and shared
  - [ ] Ready for handoff to Iris (interaction designer)

tools-required:
  - figma-or-equivalent
  - color-contrast-checker
  - design-tokens-tool

success-criteria:
  - Design is pixel-perfect match to approved concept
  - Typography hierarchy is clear and consistent
  - Color palette has minimum 3:1 contrast ratio for text
  - Spacing follows defined grid system
  - All component states defined
  - Design is production-ready for implementation

time-estimate: "1-2 days"

example: |
  ### Input: Uma's Wireframe
  ```
  Landing page for SaaS product
  - Hero section with headline + CTA
  - 3-column feature grid
  - Testimonial carousel
  - Footer with links
  ```

  ### Output: Stella's Design Spec
  ```markdown
  # Landing Page Design Specification

  ## Typography
  - **H1 (Hero):** 3.5rem / 700 weight / brand-color
  - **H2 (Section):** 2rem / 600 weight
  - **Body:** 1rem / 400 weight
  - **Small:** 0.875rem / 400 weight

  ## Colors
  - Primary: #2563EB (brand blue)
  - Secondary: #10B981 (accent green)
  - Background: #FFFFFF
  - Text: #1F2937 (dark gray)
  - Border: #E5E7EB (light gray)

  ## Spacing Grid
  - Base: 8px
  - Multiples: 8, 16, 24, 32, 48, 64, 96

  ## Components
  - Button: 44px height, 16px padding, 6px radius
  - Card: 16px padding, shadow elevation 2
  - Input: 40px height, border 1px
  ```

  ### Mockup File
  - [Landing Page.figma](figma-link)

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
