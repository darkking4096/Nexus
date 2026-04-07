# 🎨 Visual Design Squad

**Entrega de páginas web pixel-perfect, responsivas, acessíveis e performáticas**

---

## 📋 Overview

O **Visual Design Squad** é um sistema de 5 agentes especializados para transformar design conceitual (de Uma, ux-design-expert) em **páginas production-ready** com:

✅ **Design pixel-perfect** — 100% fidelidade visual  
✅ **Responsividade garantida** — Mobile-first, todos breakpoints testados  
✅ **Performance excepcional** — Lighthouse >= 90, Core Web Vitals GREEN  
✅ **Acessibilidade AA** — WCAG 2.1 compliant  
✅ **Design tokens** — Modernos (DTCG) e reutilizáveis  
✅ **Código mantível** — HTML semântico, CSS avançado (Tailwind v4)  

### Operação
- **Domínio:** Visual Design + Frontend
- **Modo:** Colaborativo (5 agentes + handoff protocol)
- **Integração:** Uma (ux-design-expert) → Visual Design Squad → Produção
- **Status:** 🟢 Active (pronto para uso em desenvolvimento)

---

## 🎯 Os 5 Agentes

### 1️⃣ **Stella** — Visual Designer
Maestria em tipografia, cores, composição, design tokens

**Pensa como:** Sally Ride (UX empático) + Bruno Bergert (design language)

**Especialidades:**
- Tipografia (scale, hierarchy, pairing)
- Paleta de cores (contrast, psychology, a11y)
- Composição visual (grid, white space)
- Identidade de marca
- Design Tokens (DTCG format)

**Usa quando:** Transformar wireframe em mockup, criar design system

**Saída esperada:** 
- High-fidelity mockups (Figma/Sketch)
- design-tokens.json (DTCG)
- Brand guide + visual specs
- Color palette + typography scale

---

### 2️⃣ **Iris** — UX/Interaction Designer
Especialista em fluxos, micro-interações, feedback visual

**Pensa como:** Jared Spool (user research) + Mike Monteiro (UX critic)

**Especialidades:**
- User flows e jornadas
- Micro-interações (hover, focus, transitions)
- Animações (entrance, feedback, state changes)
- Feedback visual (loading, errors, success)
- States e edge cases
- Accessibility interactions

**Usa quando:** Especificar como componentes se comportam

**Saída esperada:**
- interaction-spec.md
- States diagram (empty, loading, error, success, disabled)
- Animation guide (timing, easing, duration)
- Keyboard navigation spec

---

### 3️⃣ **Claude** — Frontend Developer (CSS Expert)
HTML semântico, CSS avançado, Tailwind CSS v4

**Pensa como:** Kyle Simpson (JS fundamentals) + Kevin Powell (CSS mastery)

**Especialidades:**
- HTML semântico (a11y, SEO)
- CSS avançado (Grid, Flexbox, custom properties)
- Tailwind CSS v4 (moderno, customizado)
- Shadcn/Radix components
- CSS-in-JS patterns
- Performance CSS (critical path, paint optimization)

**Usa quando:** Implementar página ou componente em código

**Saída esperada:**
- /pages/{name}/index.html
- /styles/{name}.css (ou Tailwind)
- /components/{name}/ (reutilizáveis)
- Code review checklist passed

---

### 4️⃣ **Rio** — Responsive Specialist
Breakpoints, layout fluido, mobile-first, imagens adaptativas

**Pensa como:** Brad Frost (design systems) + Jen Simmons (layout innovation)

**Especialidades:**
- Mobile-first approach (320px → desktop)
- Breakpoint strategy (xs/sm/md/lg/xl/2xl)
- Fluid typography & spacing
- Responsive images (srcset, sizes, picture)
- Layout fluid (aspect-ratio, container queries)
- Lazy loading & image optimization
- Touch targets & mobile UX

**Usa quando:** Testar responsividade, otimizar imagens

**Saída esperada:**
- responsive-tested.md (all breakpoints)
- optimized-images/ (WebP, AVIF)
- lighthouse-images-score >= 90
- mobile-ux-checklist passed

---

### 5️⃣ **Nova** — Performance & Accessibility Specialist
Core Web Vitals, WCAG 2.1 AA, otimizações

**Pensa como:** Addy Osmani (performance) + Léonie Watson (accessibility)

**Especialidades:**
- Core Web Vitals (LCP, CLS, FID/INP)
- WCAG 2.1 AA compliance
- Lighthouse audits (100 ideal, >=90 required)
- Performance optimization (CSS, images, fonts)
- Accessibility testing (ARIA, keyboard nav, screen readers)
- SEO basics (schema, meta, Core Web Vitals)

**Usa quando:** Validar qualidade final, auditar compliance

**Saída esperada:**
- lighthouse-report.json (>= 90)
- a11y-audit.md (WCAG AA passed)
- performance-budget.md (within limits)
- quality-gate-pass.md (ou recommendations)

---

## 🚀 Como Usar

### Quick Start (30 min)

**Ativar Stella:**
```bash
@visual-designer
Preciso transformar este wireframe em design.
Brand: [detalhes]
Audience: [quem]

Crie visual spec completo + design tokens.
```

**Resultado:** design-tokens.json + mockups + visual specs

---

### Workflow Típico — Página Completa (5-7 dias)

**Dia 1-2: Design**
```bash
@visual-designer
Wireframe: [link/arquivo]
Brand guidelines: [guia]
Target audience: [persona]

*design-visual
```
Output: High-fidelity mockups + design tokens

**Dia 3: Interactions**
```bash
@ux-interaction-designer
Design from Stella received.
Page type: [landing/product/form]

*design-interactions
```
Output: interaction-spec.md + states

**Dia 4-5: Implementation**
```bash
@frontend-developer
Design + interaction specs received.
Use Tailwind CSS v4.

*build-page
```
Output: HTML + CSS production-ready

```bash
@responsive-specialist
Page from Claude.
Test all breakpoints.

*responsive-audit
```
Output: responsive-tested.md + optimized images

**Dia 6: Quality Gates**
```bash
@performance-a11y-specialist
Final page from Rio.
Run full audit.

*audit-performance
*audit-a11y
*quality-gate-visual
```
Output: lighthouse >= 90, WCAG AA passed ✅

**Dia 7: Launch**
- Stella: Final visual check
- Nova: Final performance check
- Deploy + monitoring

---

## 📁 Estrutura

```
squads/visual-design-squad/
├── squad.yaml                 # Manifest AIOX
├── README.md                  # Este arquivo
├── WORKFLOWS.md               # Workflows detalhados
│
├── agents/                    # 5 personas
│   ├── visual-designer.md
│   ├── ux-interaction-designer.md
│   ├── frontend-developer.md
│   ├── responsive-specialist.md
│   ├── performance-a11y-specialist.md
│   └── {agent}/MEMORY.md      # Persistent knowledge
│
├── tasks/                     # 14 tasks AIOX-compliant
│   ├── visual-design-create-spec.md
│   ├── visual-tokens-create.md
│   ├── visual-audit.md
│   ├── interaction-design-spec.md
│   ├── interaction-states-define.md
│   ├── interaction-flow-create.md
│   ├── frontend-implement-page.md
│   ├── frontend-implement-component.md
│   ├── frontend-apply-tokens.md
│   ├── responsive-audit.md
│   ├── responsive-optimize-images.md
│   ├── responsive-mobile-test.md
│   ├── performance-audit.md
│   ├── a11y-audit.md
│   └── quality-gate-visual.md
│
├── templates/                 # Reusable templates
│   ├── page-template.html
│   ├── component-template.html
│   ├── tailwind-config-base.js
│   ├── design-tokens-template.json
│   ├── interaction-spec-template.md
│   ├── lighthouse-template.md
│   └── responsive-checklist-template.md
│
├── workflows/                 # Multi-step workflows
│   ├── page-to-production.md
│   ├── component-creation.md
│   └── design-audit.md
│
├── config/                    # Configurations
│   ├── tailwind-base.config.js
│   ├── design-tokens-base.json
│   ├── breakpoints.yaml
│   ├── performance-budget.json
│   └── accessibility-standards.yaml
│
├── data/                      # Reference data
│   ├── color-palette-reference.json
│   ├── typography-scale.json
│   ├── spacing-scale.json
│   └── icon-library-reference.md
│
├── checklists/                # Validation checklists
│   ├── visual-review.md
│   ├── interaction-review.md
│   ├── responsive-review.md
│   ├── performance-review.md
│   ├── a11y-review.md
│   └── production-launch.md
```

---

## 🔄 Integrações

### Com Uma (ux-design-expert)
```
Uma: user research + wireframes
  ↓
Visual Design Squad: design → code
  ↓
Production: pixel-perfect page
```

Uma entrega wireframes. Visual Design Squad entrega código.

### Com Marketing Instagram Squad
```
Marketing Squad: copy + estratégia
  ↓
Visual Design Squad: landing page visual
  ↓
Instagram links: páginas que convertem
```

---

## 🎓 Frameworks Aplicados

| Framework | Uso |
|-----------|-----|
| **Atomic Design** | Estrutura Atoms→Molecules→Organisms→Pages |
| **Design Tokens (DTCG)** | Tokens modernos, reutilizáveis |
| **Mobile-First** | Web responsiva desde 320px |
| **WCAG 2.1 AA** | Acessibilidade mandatória |
| **Core Web Vitals** | Performance metrics (LCP/CLS/INP) |
| **Tailwind CSS v4** | CSS moderno e eficiente |
| **Shadcn/Radix** | Componentes accessible-first |

---

## ✅ Checklist Rápido para Página

- [ ] Design specs aprovados (Stella)
- [ ] Interaction specs definidas (Iris)
- [ ] HTML semântico + CSS completo (Claude)
- [ ] Testado em todos breakpoints (Rio)
- [ ] Lighthouse >= 90 (Nova)
- [ ] WCAG 2.1 AA passed (Nova)
- [ ] Core Web Vitals GREEN (Nova)
- [ ] Visual check final (Stella)
- [ ] Ready for production ✅

---

## 🔗 Referências

- `.aiox-core/development/agents/ux-design-expert.md` — Uma
- `../marketing-instagram-squad/README.md` — Marketing squad

---

## 🎯 Próximos Passos

1. ✅ Squad structure created
2. ✅ 5 agent personas implementadas (agents/*.md)
3. ✅ 15 tasks criadas (tasks/*.md)
4. ✅ Templates criados (templates/*)
5. ✅ Checklists de qualidade definidos (checklists/*)
6. ⏭️ Testar com projeto piloto (quando desenvolvimento começar)
7. ⏭️ Integrar com Uma (handoff protocol)
8. ⏭️ Production deployment

---

**Status:** 🟢 Active (ready for use)  
**Created:** 2026-04-07  
**Version:** 1.0.0 (Complete)  
**Maintainer:** Squad Creator  

**Squad visual pronto para desenvolvimento! 🎨**
