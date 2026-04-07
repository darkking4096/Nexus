---
task:
  id: visual-tokens-create
  name: Create Design Tokens (DTCG Format)
  description: |
    Generate design tokens from visual specification using DTCG format.
    Creates reusable, maintainable token definitions for colors, typography, spacing, shadows.
    Output: design-tokens.json (ready for CSS variables integration)
  agent: visual-designer
  status: available
  
inputs:
  - design-spec: "Visual design specification (from visual-design-create-spec task)"
  - color-palette: "Approved color palette"
  - typography-scale: "Approved typography definitions"
  - spacing-grid: "Spacing/grid system definitions"

outputs:
  - tokens-json: "design-tokens.json (DTCG format)"
  - tokens-css: "tokens.css (CSS variables)"
  - tokens-documentation: "TOKENS.md (how to use)"
  - token-mapping: "token-to-css-variable mapping"

elicit: true
elicit-format: |
  **Step 1: Token Categories**
  - Which token categories do you need? 
    - Colors (primary, secondary, accents, states)
    - Typography (sizes, weights, line heights, families)
    - Spacing (margins, padding, gaps)
    - Shadows (elevation levels)
    - Borders (widths, radiuses)
    - Other? (animations, durations, etc.)

  **Step 2: Token Naming Convention**
  - Follow pattern: {category}-{type}-{variant}
  - Example: color-primary-500, typography-heading-1, spacing-unit-2

  **Step 3: Scope & Reusability**
  - Are tokens global or component-specific?
  - Any tokens that need light/dark mode variants?

dependencies:
  - requires: visual-design-create-spec
  - blocks: [frontend-apply-tokens]

checklist:
  - [ ] Design spec reviewed
  - [ ] Color palette tokenized (with semantic names)
  - [ ] Typography tokens created (sizes, weights, line heights)
  - [ ] Spacing tokens defined (8px base + multiples)
  - [ ] Shadow/elevation tokens created (if applicable)
  - [ ] Border tokens created (widths, radiuses)
  - [ ] Component-specific tokens identified
  - [ ] design-tokens.json in DTCG format
  - [ ] CSS variables generated
  - [ ] Token documentation written (naming convention, usage examples)
  - [ ] Tokens validated for consistency
  - [ ] Ready for frontend implementation

tools-required:
  - dtcg-validator
  - token-transformer
  - json-editor

success-criteria:
  - All visual elements have corresponding tokens
  - Tokens follow DTCG standard format
  - CSS variables are correctly generated
  - Token names are semantic and clear
  - Documentation is complete and accessible
  - Zero token naming conflicts
  - Tokens are validated against specification

time-estimate: "4-8 hours"

example: |
  ### Output: design-tokens.json (DTCG Format)
  ```json
  {
    "colors": {
      "primary": {
        "$value": "#2563EB",
        "$type": "color"
      },
      "primary-hover": {
        "$value": "#1D4ED8",
        "$type": "color"
      },
      "surface": {
        "$value": "#FFFFFF",
        "$type": "color"
      }
    },
    "typography": {
      "heading-1": {
        "size": { "$value": "3.5rem", "$type": "dimension" },
        "weight": { "$value": "700", "$type": "fontWeight" },
        "lineHeight": { "$value": "1.2", "$type": "number" }
      },
      "body": {
        "size": { "$value": "1rem", "$type": "dimension" },
        "weight": { "$value": "400", "$type": "fontWeight" }
      }
    },
    "spacing": {
      "unit": { "$value": "8px", "$type": "dimension" },
      "2": { "$value": "{spacing.unit} * 2", "$type": "dimension" },
      "4": { "$value": "{spacing.unit} * 4", "$type": "dimension" }
    },
    "shadows": {
      "elevation-1": {
        "$value": "0 1px 3px rgba(0, 0, 0, 0.1)",
        "$type": "shadow"
      }
    }
  }
  ```

  ### Output: tokens.css
  ```css
  :root {
    --color-primary: #2563EB;
    --color-primary-hover: #1D4ED8;
    --color-surface: #FFFFFF;
    --typography-heading-1-size: 3.5rem;
    --typography-heading-1-weight: 700;
    --spacing-unit: 8px;
    --spacing-2: 16px;
    --shadow-elevation-1: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
