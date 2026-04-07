# 📖 Visual Design Squad — Guia de Uso

**Entrega de páginas web pixel-perfect, responsivas, acessíveis e performáticas**

---

## 🚀 Quick Start (3 Passos)

### 1️⃣ Design Visual
```bash
@visual-designer

Wireframe: [link/arquivo]
Brand guidelines: [descrição]
Target audience: [persona]

*design-visual
```

**Output:** High-fidelity mockups + design-tokens.json

---

### 2️⃣ Implementar em Código
```bash
@frontend-developer

Design: [specs/mockups]
Tech: Tailwind CSS v4
Components: Shadcn/Radix

*build-page
```

**Output:** HTML + CSS production-ready

---

### 3️⃣ Auditar Qualidade
```bash
@responsive-specialist
@performance-a11y-specialist

Page: [URL/arquivo]

*responsive-audit
*audit-a11y
```

**Output:** Relatórios de responsividade e qualidade

---

## 🎨 Os 5 Agentes

| Agent | Persona | Especialidade | Comandos |
|-------|---------|---------------|----------|
| **Stella** | Visual Designer | Tipografia, cores, design tokens | `*design-visual`, `*create-tokens`, `*audit-visual`, `*brand-guide` |
| **Iris** | UX/Interaction Designer | Micro-interações, animações, states | `*design-interactions`, `*define-states`, `*create-flow`, `*animation-spec` |
| **Claude** | Frontend Developer | HTML, CSS, Tailwind, componentes | `*build-page`, `*build-component`, `*apply-tokens`, `*refactor-css` |
| **Rio** | Responsive Specialist | Breakpoints, imagens, layout fluido | `*responsive-audit`, `*optimize-images`, `*mobile-test`, `*fluid-design` |
| **Nova** | Performance & A11y Specialist | Core Web Vitals, WCAG 2.1 AA | `*audit-performance`, `*audit-a11y`, `*optimize-cwv`, `*a11y-fixes` |

---

## 📋 Fluxos Completos

### Página Completa (5-7 dias)

```
Dia 1-2:  Stella (*design-visual → *create-tokens)
Dia 3:    Iris (*design-interactions → *define-states)
Dia 4-5:  Claude (*build-page + *apply-tokens)
Dia 6:    Rio (*responsive-audit) + Nova (*audit-a11y)
Dia 7:    Nova (*audit-performance) + fixes finais
```

**Documentação completa:** `workflows/page-to-production.md`

---

### Componente Reutilizável (2-3 dias)

```
Dia 1: Stella (*design-visual)
Dia 2: Claude (*build-component)
Dia 3: Rio (*responsive-audit) + Nova (*audit-a11y)
```

**Documentação:** `workflows/component-creation.md`

---

### Auditar Página Existente (1 dia)

```
Stella: *audit-visual (2h)
Nova: *audit-performance + *audit-a11y (2-3h)
```

**Documentação:** `workflows/design-audit.md`

---

## 🎯 Success Criteria

| Métrica | Target | Validado Por |
|---------|--------|-------------|
| **Design Fidelity** | ≥95% vs mockup | Stella (audit-visual) |
| **Lighthouse Score** | ≥90 (perf, a11y, practices) | Nova (audit-performance) |
| **WCAG Compliance** | 2.1 AA | Nova (audit-a11y) |
| **Responsividade** | 6 breakpoints (xs→2xl) | Rio (responsive-audit) |
| **Core Web Vitals** | All Green (LCP, CLS, INP) | Nova (optimize-cwv) |

---

## 📁 Arquivos Importantes

- **`squad.yaml`** — Definição dos 5 agentes e comandos
- **`agents/*.md`** — Persona e frameworks de cada agente
- **`tasks/*.md`** — Tasks com input/output esperado
- **`workflows/*.md`** — Fluxos completos (page, component, audit)
- **`templates/*.md`** — Templates de saída (design tokens, components, pages)
- **`config/*.yaml`** — Padrões (Tailwind, breakpoints, performance budget)

---

## 💡 Pro Tips

1. **Sempre comece com Stella** — wireframe → design é o ponto de partida
2. **Iris vem antes de Claude** — interações especificadas = código melhor
3. **Mobile-first com Rio** — 320px primeiro, depois escala para desktop
4. **Nova é seu QA final** — performance + a11y = usuario feliz
5. **Reutilize componentes** — cada página bem-feita vira asset reutilizável

---

## 🤔 Comandos com `*`?

Todos os comandos em um agent começam com `*`. Exemplo:

```
Você está ativando @visual-designer. Os comandos disponíveis são:
  • *design-visual      → Criar mockup high-fidelity
  • *create-tokens      → Gerar design-tokens.json
  • *audit-visual       → Auditar fidelidade visual
  • *brand-guide        → Escrever brand guide

Escolha qual deseja executar — veja a seção "Comandos Disponíveis"
no arquivo agents/visual-designer.md para mais detalhes.
```

---

## 🚀 Próximas Etapas

- [ ] Ler `workflows/page-to-production.md` completo
- [ ] Ativar Stella com seu primeiro wireframe
- [ ] Acompanhar o fluxo de 7 dias
- [ ] Documentar resultados e lições

---

**Status:** 🟢 Production Ready | **Última atualização:** 2026-04-07
