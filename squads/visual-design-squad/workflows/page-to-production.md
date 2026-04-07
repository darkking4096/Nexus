# Workflow: Page to Production (5-7 dias)

**Versão:** 1.0  
**Última atualização:** 2026-04-07  
**Duração:** 5-7 dias  
**Complexidade:** Alta

---

## Objetivo

Transformar design conceitual (wireframe) em página production-ready, testada, otimizada e deployada.

---

## Participantes

| Agente | Papel | Responsabilidade |
|--------|-------|------------------|
| **Stella** | Visual Designer | Design tokens, color, typography, mockups |
| **Iris** | UX/Interaction Designer | Micro-interactions, states, animations |
| **Claude** | Frontend Developer | HTML semântico, CSS, Tailwind v4 |
| **Rio** | Responsive Specialist | Mobile-first, breakpoints, image optimization |
| **Nova** | Performance & Accessibility | Lighthouse, WCAG 2.1 AA, Core Web Vitals |

---

## Timeline Detalhada

### **Day 1-2: Design Phase** (Stella)

#### Input
- Wireframe baixa fidelidade (de Uma/UX Designer)
- Research: personas, pain points, user flows
- Brand guidelines
- Marketing brief (copy, goals, CTAs)

#### Atividades
1. **Revisar wireframe e contexto**
   - Entender objetivos da página
   - Mapear hierarquia de conteúdo
   - Identificar componentes necessários

2. **Criar mockups alta fidelidade**
   - Em Figma usando design tokens
   - Todas as variantes de estados
   - Versões desktop, tablet, mobile

3. **Definir design tokens (DTCG)**
   - Colors: primária, secundária, status, neutros
   - Typography: font families, weights, sizes
   - Spacing: padding, margin, gaps
   - Border radius, shadows, transitions

4. **Criar escalas**
   - Typography scale (Modular Scale)
   - Color palette (com variantes)
   - Spacing scale (8px base unit)

5. **Documentação**
   - Component spec para cada elemento único
   - Interaction hints (deixar para Iris)

#### Output
```
deliverables/
├── {page-name}.figma (high-fidelity mockup)
├── design-tokens.json (DTCG format)
├── color-palette.json
├── typography-scale.json
├── spacing-scale.json
└── component-specs.md
```

#### Comandos
```bash
@visual-designer
Page: [page-name]
Wireframe: [figma-link]
Research: [research-doc]
Brand: [guidelines]

*design-visual
*create-tokens
```

---

### **Day 3: Interaction Phase** (Iris)

#### Input
- Design de Stella (Figma)
- Tokens JSON
- User flows/personas

#### Atividades
1. **Revisar design e contexto**
   - Entender cada componente interativo
   - Identificar estados necessários
   - Mapear user flows para interações

2. **Especificar 8 states**
   - Default (repouso)
   - Hover (desktop)
   - Focus (keyboard)
   - Active/Pressed
   - Filled (form inputs)
   - Error
   - Disabled
   - Loading

3. **Especificar micro-interações**
   - Entrance/exit animations
   - State transition durations (100-600ms)
   - Easing functions
   - Feedback visual

4. **Definir affordances**
   - O que "parece" clicável?
   - Indicadores visuais de estado
   - Touch targets (44px mínimo)

5. **Considerações accessibility**
   - Focus ring (WCAG)
   - prefers-reduced-motion
   - Color contrast (3:1 gráficos, 4.5:1 texto)

#### Output
```
deliverables/
├── interaction-spec.md
├── state-machine.md
├── animation-guide.md
└── accessibility-notes.md
```

#### Exemplo de interaction-spec.md
```markdown
# Button Component

## States

### 1. Default
- Background: var(--color-primary)
- Text: white
- Height: 44px
- Padding: 12px 24px

### 2. Hover
- Background: var(--color-primary-light)
- Duration: 200ms ease-out
- Cursor: pointer

### 3. Focus
- Outline: 3px solid var(--color-focus)
- Offset: 2px
- Always visible (keyboard)

### 4. Active
- Scale: 0.98
- Duration: immediate
- Feedback: visual press effect

### 5. Disabled
- Opacity: 50%
- Cursor: not-allowed
- No interaction
```

#### Comandos
```bash
@ux-interaction-designer
Design: [figma-link]
Target: [page-name]

*design-interactions
*define-states
*create-flow
*animation-spec
```

---

### **Day 4-5: Implementation Phase** (Claude + Rio)

#### Input
- Design tokens (Stella)
- Interaction spec (Iris)
- Design mockups (Figma)

#### Claude: HTML/CSS Implementation

**Atividades:**
1. **Estrutura HTML semântica**
   - Heading hierarchy (H1, H2, H3...)
   - Semantic elements (nav, main, section, article)
   - Form elements com labels
   - ARIA attributes conforme necessário

2. **CSS com Tailwind v4**
   - Design tokens como CSS variables
   - Responsive utility classes
   - State handling (hover, focus, active)
   - Animations

3. **Component implementation**
   - Button, forms, cards
   - Navigation
   - Hero sections
   - CTAs

#### Output
```
pages/{page-name}/
├── index.html (página completa)
├── styles.css (custom styles + Tailwind)
├── components/
│   ├── button.html
│   ├── form-field.html
│   ├── card.html
│   └── ...
└── assets/
    └── icons/ (SVGs)
```

#### Rio: Responsive & Images

**Atividades:**
1. **Implementar responsividade**
   - Mobile-first approach
   - Breakpoints: xs, sm, md, lg, xl, 2xl
   - Layout shifts testados
   - Touch targets verificados (44px)

2. **Otimizar imagens**
   - Converter para WebP
   - Implementar srcset
   - Picture element para art direction
   - Lazy loading (loading="lazy")

3. **Fluid design**
   - Typography scaling com clamp()
   - Spacing scaling
   - Container queries (if applicable)

4. **Teste mobile**
   - Safari iOS
   - Chrome Android
   - Firefox Mobile
   - Screen reader testing (NVDA, JAWS)

#### Output
```
pages/{page-name}/
├── images/optimized/
│   ├── hero.webp
│   ├── hero.jpg (fallback)
│   └── ...
├── responsive-tested.md
└── lighthouse-report-draft.json
```

#### Comandos
```bash
@frontend-developer
Design: [specs + tokens]
Page: [page-name]

*build-page
*apply-tokens

@responsive-specialist
Page: [from Claude]

*responsive-audit
*optimize-images
*mobile-test
```

---

### **Day 6: Quality Assurance Phase** (Nova)

#### Input
- Página implementada (Claude + Rio)
- Design tokens
- Specs de design

#### Atividades
1. **Lighthouse Audit**
   - Performance >= 90
   - Accessibility >= 90
   - Best Practices >= 90
   - SEO >= 90

2. **Core Web Vitals**
   - LCP <= 2.5s
   - CLS <= 0.1
   - INP <= 200ms
   - TTFB <= 600ms

3. **WCAG 2.1 AA Compliance**
   - Color contrast (4.5:1 normal, 3:1 large)
   - Keyboard navigation
   - Focus indicators
   - Screen reader testing
   - prefers-reduced-motion

4. **Gerar action items**
   - Issues críticos (bloqueia deploy)
   - Issues altos (deve consertar)
   - Issues médios (considerar)
   - Issues baixos (nice-to-have)

#### Output
```
deliverables/
├── lighthouse-report.json (scores >= 90)
├── a11y-audit.md (WCAG 2.1 AA PASSED)
├── performance-metrics.json
├── issues-found.md (se houver)
└── quality-gate-sign-off.md
```

#### Comandos
```bash
@performance-a11y-specialist
Page: [from Rio]

*audit-performance
*audit-a11y
*quality-gate-visual
```

---

### **Day 7: Launch Phase** (Stella + Nova + Devops)

#### Final Checks

**Stella (Visual):**
- [ ] Mockup vs. implementação: match 95%+
- [ ] Todos os tokens aplicados
- [ ] Spacing grid respeitado
- [ ] Color palette consistente
- [ ] Typography hierarchy correta
- **Verdict:** APPROVED

**Nova (Performance):**
- [ ] Lighthouse >= 90 all metrics
- [ ] WCAG 2.1 AA passed
- [ ] Core Web Vitals green
- **Verdict:** PRODUCTION READY

**Devops (Deploy):**
- [ ] Code review passed
- [ ] Tests passed
- [ ] Build succeeds
- [ ] Deploy to staging
- [ ] Smoke test on staging
- [ ] Deploy to production
- **Verdict:** LIVE

#### Post-Launch Monitoring

```
Monitor:
├── Real User Monitoring (Core Web Vitals)
├── Performance dashboard
├── A11y compliance (continuous)
├── Error tracking
├── User analytics
└── Visual regression (if set up)
```

#### Comandos
```bash
@visual-designer
Final check: [page-link]
*approve-visual

@performance-a11y-specialist
Final check: [page-link]
*approve-performance

@devops
Deploy to production
```

---

## Success Criteria

| Critério | Target | Status |
|----------|--------|--------|
| Lighthouse Performance | >= 90 | ✅ |
| Lighthouse Accessibility | >= 90 | ✅ |
| WCAG 2.1 AA | 100% pass | ✅ |
| Design fidelity | >= 95% | ✅ |
| All breakpoints tested | 100% | ✅ |
| Deploy timeline | 5-7 days | ✅ |

---

## Troubleshooting

### Performance Issues
- **LCP slow:** Optimize hero image, reduce JavaScript
- **CLS detected:** Check image dimensions, font loading
- **INP slow:** Debounce handlers, reduce JavaScript

### Accessibility Issues
- **Color contrast fail:** Use darker color or lighter background
- **Focus ring invisible:** Don't use `outline: none`
- **Keyboard navigation broken:** Check tab order, remove `pointer-events: none`

### Responsive Issues
- **Horizontal scroll on mobile:** Check width constraints
- **Overlapping elements:** Verify padding/margin
- **Touch targets too small:** Use minimum 44x44px

### Handoff Issues
- **Design mismatch:** Sync with Figma, verify tokens applied
- **Specs unclear:** Schedule call with Stella/Iris for clarification

---

## Dependencies

- Stella's design tokens (DTCG format)
- Iris's interaction specs
- Uma's wireframes and research
- Tailwind CSS v4
- Design system components (base)

---

## Tips for Success

1. **Daily standup:** Ensure alignment on progress
2. **Show and tell:** Demo at end of each day phase
3. **Docs first:** Document decisions as they're made
4. **Test early:** Mobile test on Day 4, not Day 6
5. **Monitor:** Set up monitoring day 1, not after deploy

---

## References

- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/
- **Core Web Vitals:** https://web.dev/vitals/
- **Tailwind CSS:** https://tailwindcss.com/docs/
- **DTCG Tokens:** https://tokens.studio/

---

**Last Updated:** 2026-04-07  
**Maintained by:** Visual Design Squad
