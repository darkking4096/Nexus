# Workflow: Component Creation (2-3 dias)

**Versão:** 1.0  
**Última atualização:** 2026-04-07  
**Duração:** 2-3 dias  
**Complexidade:** Média

---

## Objetivo

Criar um componente reutilizável seguindo design system, testado em todos os breakpoints, acessível e pronto para produção.

---

## Participantes

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| **Stella** | Visual Designer | Design, variantes, tokens |
| **Claude** | Frontend Developer | HTML, CSS, implementação |
| **Rio** | Responsive Specialist | Responsividade, mobile test |
| **Nova** | Accessibility Specialist | A11y compliance, quality gate |

---

## Timeline

### **Day 1: Design Phase** (Stella)

#### Input
- Componente necessário (requisição do squad ou projeto)
- Brand guidelines
- Design system tokens

#### Atividades

1. **Definir escopo**
   - Qual é o propósito do componente?
   - Onde será usado?
   - Quais variantes existem?

2. **Design todas as variantes**
   - **Default:** Estado normal
   - **Hover:** Desktop interação
   - **Focus:** Keyboard navigation
   - **Active:** Pressed state
   - **Disabled:** Não pode ser interagido
   - **Loading:** Se aplicável
   - **Error:** Estado de erro
   - **Empty state:** Se aplicável

3. **Especificar dimensões e espaçamento**
   - Tamanho mínimo (height, width)
   - Padding interno
   - Margins externas
   - Touch target (44px mínimo)

4. **Aplicar design tokens**
   - Colors: usar tokens
   - Typography: usar escala
   - Spacing: usar base 8px
   - Shadows: usar elevation system

5. **Criar documentação**
   - Spec document
   - Thumbnail/image de cada variante
   - Exemplo de uso (HTML structure)

#### Output
```
components/{component-name}/
├── design.figma (all variants)
├── component-spec.md
│   ├── Purpose
│   ├── Variants (with images)
│   ├── Sizing & spacing
│   ├── Color specs
│   ├── Typography specs
│   └── States detailed
├── tokens-used.json
└── usage-guidelines.md
```

#### Exemplo: Form Field Component Spec

```markdown
# Form Field Component

## Purpose
Input field with label, help text, and error state support.

## Variants

### 1. Default
- Label: Semibold 16px
- Input: 40px height, 12px padding
- Background: White
- Border: 1px solid var(--color-border)

### 2. Focused
- Border: 2px solid var(--color-primary)
- Outline: 3px var(--color-focus) 2px offset
- Duration: 200ms ease-out

### 3. Filled (with value)
- Border: 1px solid var(--color-primary)
- Background: Unchanged

### 4. Error
- Border: 2px solid var(--color-error)
- Error text: Visible below input
- Color: var(--color-error)

### 5. Disabled
- Background: var(--color-gray-100)
- Text: var(--color-gray-400)
- Cursor: not-allowed
- Opacity: 60%

### 6. Loading
- Spinner: 16px rotating
- Input: disabled appearance
- Duration: 1.5s spin

## Tokens Used
- --color-primary: #2563EB
- --color-error: #DC2626
- --font-size-body: 1rem
- --spacing-1: 8px
- --border-radius-md: 6px
```

#### Comandos
```bash
@visual-designer
Component: [component-name]
Type: [button|form|card|etc]
Variants: [list variants]

*design-visual
```

---

### **Day 2: Implementation** (Claude)

#### Input
- Design spec (Stella)
- Tokens JSON
- Figma mockup

#### Atividades

1. **HTML estrutura semântica**
   - Elementos semânticos corretos (button, input, label, etc)
   - ARIA attributes onde necessário
   - Labels associadas a inputs

2. **CSS com Tailwind v4**
   - CSS variables para tokens
   - Utility classes para layout
   - State handling (hover, focus, active, disabled)
   - Animations

3. **Testar variantes**
   - Default state
   - All state transitions
   - Keyboard navigation
   - Mouse/touch interaction

4. **Documentar componente**
   - HTML structure
   - CSS classes
   - Usage examples
   - Props/attributes

#### Output
```
components/{component-name}/
├── index.html (or .jsx/.tsx)
├── styles.css
├── component-usage.md
├── examples/
│   ├── default.html
│   ├── hover.html
│   ├── focus.html
│   ├── disabled.html
│   ├── error.html
│   └── loading.html
└── accessibility-notes.md
```

#### Exemplo: Form Field HTML

```html
<div class="form-field">
  <label for="username" class="form-field__label">
    Username
    <span class="form-field__required" aria-label="required">*</span>
  </label>
  
  <input
    id="username"
    type="text"
    class="form-field__input"
    placeholder="Enter your username"
    required
    aria-describedby="username-help"
  >
  
  <p id="username-help" class="form-field__help">
    3-20 characters, letters and numbers only
  </p>
  
  <p id="username-error" class="form-field__error" hidden>
    Username already taken
  </p>
</div>
```

#### Exemplo: Form Field CSS

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  font-family: var(--font-sans);
}

.form-field__label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.form-field__input {
  min-height: 40px;
  padding: var(--spacing-1) var(--spacing-2);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  font: inherit;
  color: var(--color-text-primary);
  transition: all 200ms ease-out;
}

.form-field__input:hover:not(:disabled) {
  border-color: var(--color-border-secondary);
}

.form-field__input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-field__input:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.form-field__input[aria-invalid="true"] {
  border-color: var(--color-error);
}

.form-field__help {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.form-field__error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
  font-weight: var(--font-weight-medium);
}
```

#### Comandos
```bash
@frontend-developer
Component: [component-name]
Design: [specs]
Variants: [list]

*build-component
*apply-tokens
```

---

### **Day 3: Quality Assurance** (Rio + Nova)

#### Rio: Responsive Testing

**Atividades:**
1. **Test at all breakpoints**
   - xs (320px)
   - sm (640px)
   - md (768px)
   - lg (1024px)
   - xl (1280px)
   - 2xl (1536px)

2. **Mobile-specific testing**
   - Touch targets (44x44px)
   - Touch spacing (8px between targets)
   - No horizontal scroll
   - Swipe interactions (if applicable)

3. **Image optimization** (if component has images)
   - Responsive images with srcset
   - WebP format with fallback
   - Lazy loading

4. **Document findings**
   - Responsive audit report
   - Screenshots at each breakpoint
   - Any issues found

#### Output
```
components/{component-name}/
├── responsive-tested.md
├── screenshots/
│   ├── 320px-mobile.png
│   ├── 768px-tablet.png
│   └── 1024px-desktop.png
└── responsive-issues.md (if any)
```

#### Nova: Accessibility & Quality Gate

**Atividades:**
1. **Keyboard navigation**
   - Tab through component
   - All interactive elements accessible
   - No keyboard traps
   - Focus order logical

2. **Screen reader testing**
   - Component announced correctly
   - State changes announced
   - Labels/descriptions clear
   - Hidden content properly hidden

3. **Color & contrast**
   - Text contrast >= 4.5:1
   - Graphical objects >= 3:1
   - Color not only indicator

4. **State testing**
   - All 8 states tested
   - Transitions smooth
   - prefers-reduced-motion respected
   - No flashing (seizure risk)

5. **Quality gate checklist**
   - All variants working
   - A11y compliant
   - Responsive at all breakpoints
   - Performance acceptable
   - Performance budgets met
   - Production-ready

#### Output
```
components/{component-name}/
├── a11y-audit.md (WCAG 2.1 AA PASSED)
├── quality-gate-sign-off.md (APPROVED)
├── component-ready.md
│   ├── Purpose
│   ├── Variants: ✅ All tested
│   ├── Responsive: ✅ All breakpoints
│   ├── A11y: ✅ WCAG 2.1 AA
│   ├── Performance: ✅ Green
│   └── Production Status: READY
└── usage-examples/
    ├── react-example.jsx
    ├── vanilla-example.html
    └── tailwind-example.html
```

#### Comandos
```bash
@responsive-specialist
Component: [component-name]

*responsive-audit

@performance-a11y-specialist
Component: [component-name]

*audit-a11y
*quality-gate-visual
```

---

## Component Types & Examples

### Button Component
```
Variants: Primary, Secondary, Tertiary, Danger
Sizes: Small, Medium, Large
States: Default, Hover, Focus, Active, Disabled, Loading
Icon options: Left, Right, Only
```

### Form Field Component
```
Variants: Text, Email, Password, Number, Textarea
States: Default, Focus, Error, Disabled, Success, Loading
Support: Label, Help text, Error message, Required indicator
```

### Card Component
```
Variants: Elevated, Outlined, Filled
States: Default, Hover, Focus, Loading
Content: Title, Subtitle, Image, Actions, Meta
```

### Modal Component
```
Variants: Centered, Fullscreen, Drawer
States: Closed, Opening, Open, Closing
Features: Header, Body, Footer, Close button, Backdrop
```

---

## Success Criteria

| Critério | Target | Status |
|----------|--------|--------|
| All variants implemented | 100% | ✅ |
| Responsive at all breakpoints | 100% | ✅ |
| A11y compliant (WCAG 2.1 AA) | 100% | ✅ |
| Keyboard navigation | 100% | ✅ |
| Touch targets (44px) | 100% | ✅ |
| Performance budget met | 100% | ✅ |
| Production ready | YES | ✅ |

---

## Checklist

- [ ] All variants designed
- [ ] All states specified
- [ ] HTML implemented
- [ ] CSS applied with tokens
- [ ] Responsive tested (all breakpoints)
- [ ] Mobile-friendly (touch targets, spacing)
- [ ] Keyboard navigation tested
- [ ] Screen reader tested
- [ ] Color contrast verified
- [ ] prefers-reduced-motion respected
- [ ] Examples documented
- [ ] Usage guide created
- [ ] A11y audit PASSED
- [ ] Quality gate PASSED
- [ ] Component registered in library

---

## Tips for Success

1. **Start with default state** — Other states build from there
2. **Use design tokens** — Consistency across components
3. **Test keyboard navigation early** — Not a last step
4. **Document as you build** — Don't wait for end
5. **Get feedback** — Share draft with other squad members

---

## References

- **Component-driven development:** https://componentdriven.org/
- **Design systems:** https://uxdesign.cc/design-systems-101-edb1ea19cf7b
- **Tailwind CSS:** https://tailwindcss.com/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **State machine patterns:** https://www.smashingmagazine.com/2022/10/inline-validation-web-forms-ux/

---

**Last Updated:** 2026-04-07  
**Maintained by:** Visual Design Squad
