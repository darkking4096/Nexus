# 🔄 Visual Design Squad — Workflows

**Fluxos de trabalho end-to-end para entregas visuais**

---

## Workflow 1: Page to Production (5-7 dias)

### Objetivo
Transformar design conceitual (wireframe) em página production-ready, testada, otimizada.

### Participantes
- Stella (Visual Designer)
- Iris (UX/Interaction Designer)
- Claude (Frontend Developer)
- Rio (Responsive Specialist)
- Nova (Performance & Accessibility)

### Timeline

```
Day 1-2: Design Phase (Stella)
  ├─ Receber wireframe + research de Uma
  ├─ Criar high-fidelity mockups
  ├─ Definir design tokens (DTCG)
  ├─ Criar typography scale
  ├─ Definir color palette
  └─ Output: design.figma + tokens.json

Day 3: Interaction Phase (Iris)
  ├─ Receber design de Stella
  ├─ Especificar micro-interações
  ├─ Definir states (hover/focus/active)
  ├─ Especificar animações
  └─ Output: interaction-spec.md

Day 4-5: Implementation Phase (Claude + Rio)
  ├─ Claude: Implementar HTML semântico
  ├─ Claude: Implementar CSS (Tailwind v4)
  ├─ Rio: Implementar responsividade
  ├─ Rio: Otimizar imagens
  ├─ Rio: Implementar lazy loading
  └─ Output: /pages/{name}/ (código pronto)

Day 6: Quality Phase (Nova)
  ├─ Audit performance (Lighthouse)
  ├─ Audit accessibility (WCAG 2.1 AA)
  ├─ Testar Core Web Vitals
  ├─ Gerar action items (se necessário)
  └─ Output: lighthouse-report.json + a11y-audit.md

Day 7: Launch Phase (Stella + Nova + Devops)
  ├─ Stella: Final visual check
  ├─ Nova: Final performance check
  ├─ Deploy to production
  ├─ Monitor Core Web Vitals
  └─ Output: Página live + monitoring dashboard
```

### Exemplo Prático: Landing Page

**Entrada:**
```
Uma deliverables:
  - user-research.md (personas, pain points)
  - wireframes.figma (low-fidelity)
  - flows.md (user journeys)
  - marketing-brief.md (copy, goals)
```

**Dia 1-2 (Stella):**
```bash
@visual-designer
Wireframe: [link figma]
Research: [user personas]
Brand: [guidelines]

*design-visual
*create-tokens
```

Deliverables:
- landing-page.figma (high-fidelity)
- design-tokens.json
  ```json
  {
    "colors": {
      "primary": "#2563EB",
      "surface": "#FFFFFF",
      ...
    },
    "typography": {
      "heading-1": { "size": "2rem", "weight": 700, ... },
      ...
    }
  }
  ```

**Dia 3 (Iris):**
```bash
@ux-interaction-designer
Design: [figma link]
Target: landing-page

*design-interactions
*define-states
```

Deliverables:
- interaction-spec.md
  ```markdown
  # Button
  - Default: gray background
  - Hover: darker gray, shadow elevation
  - Focus: outline 2px
  - Active: scale 0.98
  - Disabled: opacity 50%
  ```

**Dia 4 (Claude):**
```bash
@frontend-developer
Design: [specs + tokens]
Page: landing-page

*build-page
*apply-tokens
```

Deliverables:
- /pages/landing-page/index.html
- /styles/landing-page.css (com CSS variables dos tokens)
- /components/button.html
- /components/card.html

**Dia 5 (Rio):**
```bash
@responsive-specialist
Page: [from Claude]

*responsive-audit
*optimize-images
*mobile-test
```

Deliverables:
- responsive-tested.md
  ```markdown
  # Breakpoint Testing
  - 320px (iPhone SE): PASS
  - 768px (iPad): PASS
  - 1024px (Desktop): PASS
  - 1440px (Wide): PASS
  ```
- /images/optimized/ (WebP + AVIF)
- lighthouse-images: 95/100

**Dia 6 (Nova):**
```bash
@performance-a11y-specialist
Page: [from Rio]

*audit-performance
*audit-a11y
*quality-gate-visual
```

Deliverables:
- lighthouse-report.json
  ```json
  {
    "performance": 92,
    "accessibility": 95,
    "best_practices": 90,
    "seo": 100
  }
  ```
- a11y-audit.md: WCAG 2.1 AA ✅

**Dia 7 (Launch):**
```bash
@visual-designer
Final visual check: APPROVED

@devops
Deploy to production: DONE
```

Monitor:
- Core Web Vitals (Real User Monitoring)
- Performance dashboard
- A11y compliance

---

## Workflow 2: Component Creation (2-3 dias)

### Objetivo
Criar um componente reutilizável que obedece design system

### Participantes
- Stella (Visual Designer)
- Claude (Frontend Developer)
- Rio (Responsive Specialist)
- Nova (Accessibility Specialist)

### Timeline

```
Day 1: Design (Stella)
  ├─ Definir variantes (default, loading, error, disabled, states)
  ├─ Specs: tamanhos, cores, spacing
  ├─ Criar design tokens para componente
  └─ Output: component-design.figma

Day 2: Implementation (Claude)
  ├─ Implementar HTML semântico
  ├─ Implementar CSS (Tailwind)
  ├─ Testar responsividade básica
  └─ Output: /components/{name}.html

Day 3: Quality (Rio + Nova)
  ├─ Rio: Responsive audit
  ├─ Nova: A11y audit
  ├─ Gerar documentation
  └─ Output: component-ready.md
```

### Exemplo: Form Field Component

**Dia 1 (Stella):**
```bash
@visual-designer
Component: form-field (label + input + error)
Variants: default, focus, error, disabled, loading
Use design tokens.

*design-visual
```

Deliverables:
- form-field-design.figma
- form-field tokens:
  ```json
  {
    "form-field": {
      "background": "var(--color-surface)",
      "border-radius": "0.5rem",
      "padding": "0.75rem",
      "font": "var(--typography-body)"
    }
  }
  ```

**Dia 2 (Claude):**
```bash
@frontend-developer
Component: form-field
Design: [specs]

*build-component
*apply-tokens
```

Deliverables:
- /components/form-field.html
  ```html
  <div class="form-field">
    <label for="input">Label</label>
    <input id="input" type="text" class="form-field__input" />
    <p class="form-field__error">Error message</p>
  </div>
  ```

- /styles/form-field.css
  ```css
  .form-field {
    background: var(--form-field-background);
    border-radius: var(--form-field-border-radius);
    padding: var(--form-field-padding);
  }
  ```

**Dia 3 (Rio + Nova):**
```bash
@responsive-specialist
Component: form-field

*responsive-audit

@performance-a11y-specialist
*audit-a11y
*quality-gate-visual
```

Deliverables:
- component-ready.md
  ```markdown
  # Form Field Component
  - Responsive: ✅ All breakpoints
  - A11y: ✅ WCAG 2.1 AA
  - States: ✅ All 5 variants tested
  - Performance: ✅ No layout shifts
  ```

---

## Workflow 3: Design Audit (1 dia)

### Objetivo
Auditar página existente por qualidade visual, performance, accessibility

### Participantes
- Stella (Visual Designer)
- Nova (Performance & Accessibility)

### Timeline

```
Session 1-2 (Stella): Visual audit
  ├─ Comparar com design system
  ├─ Verificar token compliance
  ├─ Checar hierarchy + spacing
  ├─ Identificar inconsistências
  └─ Output: visual-audit.md

Session 3-4 (Nova): Performance + A11y
  ├─ Lighthouse audit
  ├─ A11y scan (axe, WAVE)
  ├─ Core Web Vitals analysis
  └─ Output: audit-report.md
```

### Exemplo

```bash
@visual-designer
Page: /landing-page
Audit: Design consistency

*audit-visual
```

Output:
```markdown
# Visual Audit Report

## ✅ PASS
- Color palette: 100% compliant
- Typography: 100% scale used

## ⚠️ WARNINGS
- Spacing: 2 instances off-grid
- Button sizes: 1 custom size (not in tokens)

## Recommendations
- Update button size to token
- Recheck spacing grid
```

---

## Workflow 4: Design System Update (2 dias)

### Objetivo
Atualizar design system (tokens, components, guidelines)

### Participantes
- Stella (Visual Designer)
- Claude (Frontend Developer)
- Nova (A11y Specialist)

### Timeline

```
Day 1: Design (Stella)
  ├─ Revisar tokens atuais
  ├─ Propor mudanças
  ├─ Gerar novo tokens.json
  └─ Output: design-tokens-updated.json

Day 2: Implementation (Claude + Nova)
  ├─ Claude: Atualizar CSS variables
  ├─ Claude: Atualizar componentes base
  ├─ Nova: Validar a11y compliance
  └─ Output: design-system-updated.md
```

---

## Integration Point: Uma → Visual Design Squad

### Handoff Protocol

**Uma termina com:**
```yaml
deliverables:
  - user-research.md (personas, pain points, quotes)
  - wireframes.figma (low-fidelity + annotations)
  - user-flows.md (journey maps)
  - brand-context.md (color palette sketch, typography hints)
```

**Visual Design Squad recebe:**
```yaml
handoff:
  from_agent: ux-design-expert
  to_squad: visual-design-squad
  inputs:
    research: docs/research/{project}/
    wireframes: [figma-link]
    flows: user-flows.md
    brand: brand-context.md
  process:
    day_1_2: Stella transforms wireframe → high-fidelity + tokens
    day_3: Iris specifies interactions
    day_4_5: Claude implements
    day_6: Nova validates
    day_7: Launch
  deliverables:
    - Pages in production
    - Design tokens (DTCG)
    - Component library (Shadcn/Radix based)
    - Performance dashboard
    - A11y compliance report
```

**Visual Design Squad handoff to Production:**
```yaml
deployment:
  pages: Production-ready HTML/CSS
  tokens: design-tokens.json (deployed)
  components: /components/ (reusable, registered)
  monitoring:
    - Real User Monitoring (performance)
    - A11y compliance checks
    - Visual regression testing (future)
```

---

## Task Dependencies Graph

```
Uma wireframes
  ↓
[visual-design-create-spec] (Stella)
  ↓
[visual-tokens-create] (Stella)
  ↓
[interaction-design-spec] (Iris)
  ├─ [interaction-states-define] (Iris)
  ├─ [interaction-flow-create] (Iris)
  ↓
[frontend-implement-page] (Claude)
  ↓
[frontend-apply-tokens] (Claude)
  ↓
[responsive-audit] (Rio)
  ├─ [responsive-optimize-images] (Rio)
  ├─ [responsive-mobile-test] (Rio)
  ↓
[performance-audit] (Nova)
  ├─ [a11y-audit] (Nova)
  ↓
[quality-gate-visual] (Nova)
  ↓
Production Deploy (Devops)
```

---

## Quick Command Reference

### Stella (Visual Designer)
```bash
@visual-designer *design-visual           # Create visual spec
@visual-designer *create-tokens           # Create design tokens
@visual-designer *audit-visual            # Audit consistency
@visual-designer *brand-guide             # Create/update brand guidelines
```

### Iris (UX/Interaction Designer)
```bash
@ux-interaction-designer *design-interactions    # Specify interactions
@ux-interaction-designer *define-states          # Define states
@ux-interaction-designer *create-flow            # Create user flows
@ux-interaction-designer *animation-spec        # Specify animations
```

### Claude (Frontend Developer)
```bash
@frontend-developer *build-page        # Implement full page
@frontend-developer *build-component   # Implement component
@frontend-developer *apply-tokens      # Apply design tokens
@frontend-developer *refactor-css      # Optimize CSS
```

### Rio (Responsive Specialist)
```bash
@responsive-specialist *responsive-audit        # Test breakpoints
@responsive-specialist *optimize-images         # Optimize images
@responsive-specialist *mobile-test             # Test mobile UX
@responsive-specialist *fluid-design           # Implement fluid design
```

### Nova (Performance & Accessibility)
```bash
@performance-a11y-specialist *audit-performance     # Lighthouse audit
@performance-a11y-specialist *audit-a11y           # WCAG audit
@performance-a11y-specialist *optimize-cwv        # Optimize Core Web Vitals
@performance-a11y-specialist *a11y-fixes          # Fix a11y issues
@performance-a11y-specialist *quality-gate-visual # Final gate
```

---

## Success Metrics

### For Each Workflow

**Page to Production:**
- ✅ Lighthouse >= 90
- ✅ WCAG 2.1 AA passed
- ✅ All breakpoints tested
- ✅ 100% design fidelity
- ✅ Deployed in 5-7 days

**Component Creation:**
- ✅ All variants tested
- ✅ A11y compliant
- ✅ Responsive at all breakpoints
- ✅ Registered in component library

**Design Audit:**
- ✅ Inconsistencies identified
- ✅ Recommendations provided
- ✅ Prioritized by impact

---

## Notes

- All workflows respect AIOX story-driven development
- Task-first architecture (defined in squad.yaml)
- Agent authority rules apply (no git push, no PR merge)
- Handoff protocol with Uma is critical for success
- Design tokens must be DTCG compliant for reusability
- All code must pass CodeRabbit review before merge

---

**Last Updated:** 2026-04-07  
**Status:** Planning  
**Maintainer:** Squad Creator
