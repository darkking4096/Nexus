---
task:
  id: frontend-implement-page
  name: Implement Complete Page (HTML + CSS)
  description: |
    Implement a complete page from design specs and tokens.
    Includes semantic HTML, CSS Grid/Flexbox, Tailwind CSS v4, component library.
    Output: Production-ready HTML and CSS files
  agent: frontend-developer
  status: available
  
inputs:
  - design-spec: "From visual-designer (visual design specification)"
  - design-tokens: "From visual-tokens-create task"
  - interaction-spec: "From interaction-designer (interaction specifications)"
  - state-definitions: "From interaction-states-define task"
  - component-inventory: "List of components needed"

outputs:
  - page-html: "/pages/{page-name}/index.html"
  - page-css: "/styles/{page-name}.css"
  - components-folder: "/components/ (reusable component files)"
  - build-config: "tailwind.config.js (if applicable)"
  - documentation: "PAGE-IMPLEMENTATION.md (structure notes)"

elicit: true
elicit-format: |
  **Step 1: Architecture Decisions**
  - Use Tailwind CSS v4 or custom CSS?
  - Need component library (Shadcn/Radix) or custom components?
  - Any special layout requirements? (Grid, Flexbox, CSS subgrid)

  **Step 2: Component Breakdown**
  - Which components are reusable?
  - Which are page-specific?
  - Any components that need variants?

  **Step 3: Performance Considerations**
  - Critical CSS? (above-the-fold styles)
  - Code splitting for components?
  - Image optimization strategy?
  - Font loading strategy?

dependencies:
  - requires: [visual-design-create-spec, visual-tokens-create, interaction-design-spec]
  - blocks: [responsive-audit, performance-audit]

checklist:
  - [ ] Design specification reviewed
  - [ ] Design tokens integrated (CSS variables)
  - [ ] Component inventory documented
  - [ ] HTML structure created (semantic tags)
  - [ ] CSS Grid/Flexbox layouts implemented
  - [ ] Tailwind CSS configured and applied
  - [ ] All components created (atoms → pages)
  - [ ] Default state for all components
  - [ ] Hover states implemented
  - [ ] Focus states implemented (keyboard navigation)
  - [ ] Active states implemented
  - [ ] Disabled states implemented
  - [ ] Loading states implemented
  - [ ] Error states implemented
  - [ ] Success states implemented
  - [ ] Component documentation written
  - [ ] Code review passed
  - [ ] No console errors
  - [ ] Accessibility basics checked (semantic HTML, alt text)
  - [ ] Ready for responsive testing

tools-required:
  - html-editor
  - css-preprocessor
  - tailwind-css-v4
  - browser-dev-tools
  - lighthouse

success-criteria:
  - All visual specs implemented pixel-perfectly
  - All design tokens applied correctly
  - All components are reusable and documented
  - Semantic HTML used throughout
  - CSS is well-organized and maintainable
  - No hardcoded colors (use tokens)
  - No hardcoded sizes (use tokens/scale)
  - All states visually distinct
  - Code passes linting
  - No accessibility violations in basic checks
  - Implementation is maintainable and scalable

time-estimate: "2-3 days"

example: |
  ### Output: Page Structure
  ```
  /pages/landing-page/
  ├── index.html              # Main page
  ├── styles.css              # Page-specific styles
  └── components.html         # Component library

  /components/
  ├── button.html
  ├── card.html
  ├── form-field.html
  ├── header.html
  └── footer.html
  ```

  ### Output: HTML Example
  ```html
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Landing Page</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <h1 class="hero__title">Welcome to Our Product</h1>
        <p class="hero__subtitle">The best solution for your needs</p>
        <button class="btn btn--primary">Get Started</button>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section__title">Features</h2>
        <div class="features-grid">
          <article class="card">
            <h3 class="card__title">Feature 1</h3>
            <p class="card__description">Description</p>
          </article>
          <!-- More cards -->
        </div>
      </div>
    </section>
  </body>
  </html>
  ```

  ### Output: CSS Example
  ```css
  :root {
    /* Import design tokens */
    --color-primary: #2563EB;
    --spacing-unit: 8px;
    --typography-heading-1-size: 3.5rem;
  }

  .hero {
    padding: calc(var(--spacing-unit) * 12);
    background: var(--color-surface);
  }

  .hero__title {
    font-size: var(--typography-heading-1-size);
    color: var(--color-primary);
    margin-bottom: calc(var(--spacing-unit) * 2);
  }

  .btn {
    padding: calc(var(--spacing-unit) * 1.5) calc(var(--spacing-unit) * 2);
    border-radius: 6px;
    cursor: pointer;
    transition: all 150ms ease-out;
  }

  .btn--primary {
    background: var(--color-primary);
    color: white;
  }

  .btn--primary:hover {
    background: var(--color-primary-hover);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn--primary:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
