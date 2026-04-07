---
task:
  id: frontend-apply-tokens
  name: Apply Design Tokens to CSS
  description: |
    Integrate design tokens (colors, typography, spacing) into CSS variables.
    Ensures consistency between design and implementation.
    Output: CSS with design tokens applied, token validation report
  agent: frontend-developer
  status: available
  
inputs:
  - design-tokens: "design-tokens.json (from visual-tokens-create)"
  - page-css: "Existing CSS files to update"
  - component-styles: "Component CSS files"
  - token-mapping: "Token → CSS variable mapping"

outputs:
  - css-with-tokens: "Updated CSS files using CSS variables"
  - tokens-css: "tokens.css (generated CSS variables)"
  - validation-report: "token-application-report.md"
  - unused-values: "List of hardcoded values to replace"

elicit: true
elicit-format: |
  **Step 1: Token Audit**
  - Which CSS files need token integration?
  - Are there any hardcoded colors, sizes, spacing?
  - Which values should be tokenized?

  **Step 2: CSS Variable Strategy**
  - Root variables (:root) or scoped to components?
  - Naming convention for variables?
  - Should we support light/dark mode variants?

  **Step 3: Fallback Strategy**
  - What should be the fallback value for variables?
  - Should we keep old values as reference?

dependencies:
  - requires: [visual-tokens-create, frontend-implement-page, frontend-implement-component]
  - blocks: [responsive-audit, performance-audit]

checklist:
  - [ ] Design tokens reviewed
  - [ ] CSS files audited for hardcoded values
  - [ ] CSS variables strategy defined
  - [ ] tokens.css file generated
  - [ ] All hardcoded colors replaced with token variables
  - [ ] All hardcoded sizes replaced with token variables
  - [ ] All hardcoded spacing replaced with token variables
  - [ ] Typography values replaced with token variables
  - [ ] Shadow values replaced with token variables
  - [ ] Border values replaced with token variables
  - [ ] Token naming consistent throughout CSS
  - [ ] Fallback values provided for variables
  - [ ] Validation report generated
  - [ ] No unused variables
  - [ ] CSS variable support checked (browser compatibility)
  - [ ] Token consistency verified
  - [ ] Ready for testing

tools-required:
  - css-editor
  - token-validator
  - browser-dev-tools
  - regex-search-replace

success-criteria:
  - All design tokens applied to CSS
  - No hardcoded colors in CSS (all use token variables)
  - No hardcoded spacing in CSS (all use token variables)
  - CSS variables properly scoped and named
  - Fallback values provided
  - Token changes automatically reflect in CSS
  - Validation report shows 100% compliance
  - CSS is more maintainable and scalable
  - No visual changes from original implementation

time-estimate: "1-2 days"

example: |
  ### Before: Hardcoded CSS
  ```css
  .button {
    background-color: #2563EB;
    color: white;
    padding: 12px 16px;
    font-size: 1rem;
    border-radius: 6px;
  }

  .button:hover {
    background-color: #1D4ED8;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .card {
    background-color: #FFFFFF;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  ```

  ### After: Token-based CSS
  ```css
  :root {
    /* Colors */
    --color-primary: #2563EB;
    --color-primary-hover: #1D4ED8;
    --color-surface: #FFFFFF;
    
    /* Typography */
    --typography-body-size: 1rem;
    --typography-body-weight: 400;
    
    /* Spacing */
    --spacing-unit: 8px;
    --spacing-2: 16px;
    --spacing-3: 24px;
    
    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.15);
    
    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
  }

  .button {
    background-color: var(--color-primary);
    color: white;
    padding: var(--spacing-2) calc(var(--spacing-2) * 1.5);
    font-size: var(--typography-body-size);
    border-radius: var(--radius-sm);
  }

  .button:hover {
    background-color: var(--color-primary-hover);
    box-shadow: var(--shadow-md);
  }

  .card {
    background-color: var(--color-surface);
    padding: var(--spacing-3);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-sm);
  }
  ```

  ### Output: token-application-report.md
  ```markdown
  # Token Application Report

  ## Summary
  - Total hardcoded values found: 24
  - Values replaced with tokens: 24
  - Compliance: 100%

  ## Breakdown
  - Colors: 8/8 replaced ✅
  - Spacing: 6/6 replaced ✅
  - Typography: 4/4 replaced ✅
  - Shadows: 3/3 replaced ✅
  - Border Radius: 3/3 replaced ✅

  ## Token Coverage
  - Color tokens: 12/12 used
  - Spacing tokens: 6/6 used
  - Typography tokens: 4/4 used

  ## Recommendations
  - All hardcoded values replaced
  - CSS is now 100% token-based
  - Changes to tokens will automatically reflect in CSS
  ```

---
**Version:** 1.0  
**Last Updated:** 2026-04-07
