# 🚀 Squad Activation Guide — Zero Overhead

**NUNCA use `/Explore` para ativar squads.** Isso dispara pesquisa web global = 160.9K tokens desperdiçados.

**USE ISSO INSTEAD:** Commands diretos aos agentes = ~3-5K tokens por activation.

---

## Visual Design Squad — 5 Agentes

### Stella (Visual Designer)
Cria mockups, design tokens, audita visual.
```bash
@visual-designer
*task visual-design-create-spec    # Cria mockup + tokens
*task visual-tokens-create          # Gera design-tokens.json (DTCG)
*task visual-audit                  # Audita fidelidade visual
```

**Context load:** ~3.5K tokens  
**Inputs needed:** Wireframes, brand guidelines, design brief

---

### Iris (UX/Interaction Designer)
Fluxos, micro-interações, animation specs.
```bash
@ux-interaction-designer
*task interaction-design-spec       # Cria spec de interações
*task interaction-states-define     # Define states (hover, active, disabled, loading)
*task interaction-flow-create       # Cria user flow diagrams
```

**Context load:** ~3.2K tokens  
**Inputs needed:** Wireframes, user journeys, interaction patterns

---

### Claude (Frontend Developer)
HTML semântico, CSS/Tailwind, componentes.
```bash
@frontend-developer
*task frontend-implement-page       # Implementa página inteira
*task frontend-implement-component  # Implementa componente isolado
*task frontend-apply-tokens         # Aplica design tokens em CSS
```

**Context load:** ~4.1K tokens  
**Inputs needed:** Design tokens JSON, design specs, component definitions

---

### Rio (Responsive Specialist)
Mobile-first, breakpoints, imagens adaptativas.
```bash
@responsive-specialist
*task responsive-audit              # Audita layout em todos breakpoints
*task responsive-optimize-images    # Otimiza imagens responsivas
*task responsive-mobile-test        # Testa no mobile (375px, 768px, 1440px)
```

**Context load:** ~3.3K tokens  
**Inputs needed:** Implemented page/component, design specs, image assets

---

### Nova (Performance & Accessibility Specialist)
Core Web Vitals, WCAG 2.1 AA, auditorias.
```bash
@performance-a11y-specialist
*task audit-performance             # Lighthouse, Core Web Vitals
*task audit-a11y                    # WCAG 2.1 AA compliance
*task quality-gate-visual           # Final QA gate (passa/falha)
```

**Context load:** ~3.8K tokens  
**Inputs needed:** Deployed page, design specs, performance budget

---

## Marketing Instagram Squad — 5 Agentes

### Profile Strategist
Estratégia mestra, onboarding, updates.
```bash
@profile-strategist
*task onboard-profile               # Onboarding de novo perfil
*task define-strategy               # Define estratégia mestra (7-ponto StoryBrand)
*task update-strategy               # Atualiza estratégia (Week 2+)
```

**Context load:** ~3.6K tokens  
**Inputs needed:** Profile info, brand guidelines, audience research

---

### Copywriter
Captions, hooks, CTAs com psicologia.
```bash
@copywriter
*task write-caption                 # Escreve caption (emotional, hook + story + payoff)
*task write-hook                    # Escreve hook (0-3 segundos, pattern interrupt)
*task write-cta                     # Escreve CTA (psychological trigger)
```

**Context load:** ~3.4K tokens  
**Inputs needed:** Core messages, hooks, brand tone of voice

⚠️ **Requer strategy document:** Use modular version `{handle}-core-messages.md` (não o inteiro)

---

### Content Planner
Calendário editorial, content briefs.
```bash
@content-planner
*task create-calendar               # Cria calendário para 30 dias
*task generate-brief                # Gera brief para cada post (copy + format + timing)
```

**Context load:** ~3.2K tokens  
**Inputs needed:** Core messages, content pillars, publishing cadence

⚠️ **Requer strategy document:** Use modular version `{handle}-content-pillars.md`

---

### Trend Researcher
Monitora trends, busca referências virais.
```bash
@trend-researcher
*task find-trends                   # Escaneia trends (áudio, formatos, templates)
*task suggest-format                # Recomenda formato (reel, carousel, post, stories)
```

**Context load:** ~3.1K tokens  
**Inputs needed:** Nicho/industria, audience demographics

⚠️ **SEM pesquisa web automática:** Tasks só analisam trends conhecidos (STEPPS, Hook Engineering)

---

### Analytics Agent
Performance analysis, strategic adjustments.
```bash
@analytics-agent
*task analyze-performance           # Analisa métricas (reach, engagement, conversion)
*task suggest-adjustments           # Sugere ajustes na estratégia
```

**Context load:** ~3.5K tokens  
**Inputs needed:** Instagram Insights export (CSV), strategy document

---

## 🎯 Workflows Pré-Configurados

### Visual Design: Page to Production (5-7 dias)
```bash
@visual-designer *task visual-design-create-spec
@ux-interaction-designer *task interaction-design-spec
@frontend-developer *task frontend-implement-page
@responsive-specialist *task responsive-audit
@performance-a11y-specialist *task quality-gate-visual
```

**Total context:** ~17.5K tokens (5 agents × 3.5K avg)

---

### Marketing: Launch New Profile (5 dias)

**Day 1:**
```bash
@profile-strategist *task onboard-profile      # 2h
@profile-strategist *task define-strategy      # 3h
```

**Day 2 (parallel):**
```bash
@copywriter *task write-caption                 # 3h
@content-planner *task create-calendar          # 1h (in parallel with copywriter)
```

**Day 3 (parallel):**
```bash
@copywriter *task write-hook *task write-cta   # 2h
@trend-researcher *task find-trends             # 2h (in parallel)
```

**Day 4:**
```bash
@content-planner *task generate-brief           # 2h
```

**Day 5:**
```bash
@analytics-agent *task analyze-performance      # 1h
```

**Total context:** ~20K tokens (5 agents × 4K avg, sequential + some parallel)

---

## ⚠️ DO NOT DO THIS

❌ `/Explore visual-design-squad` — costs 160.9K tokens  
❌ `/Explore marketing-instagram-squad` — costs 160.9K tokens  
❌ Using MCP web search automatically in tasks — use local knowledge only

---

## ✅ DO THIS INSTEAD

✅ `@visual-designer` → `*task frontend-implement-page` (~3.5K tokens)  
✅ `@profile-strategist` → `*task define-strategy` (~3.6K tokens)  
✅ Use modular documents (not full strategy doc) — see notes above

---

## 📊 Cost Comparison

| Approach | Tokens | Time | Recommendation |
|----------|--------|------|-----------------|
| `/Explore + squad activation` | 160.9K | 2m 58s | ❌ **NEVER** |
| Direct agent activation | 3-4K | 15s | ✅ **ALWAYS** |
| **Savings per activation** | **156.9K** | **2m 43s** | **40x faster** |

---

## 🔄 Modular Document Strategy

To avoid context bloat, use these modular files instead of full strategy doc:

### Marketing Strategy (split into 4 modules)

Instead of: `{handle}-strategy-document.md` (2-3KB)

Use these separately:
- `{handle}-core-messages.md` (50 lines) — used by copywriter only
- `{handle}-hooks-framework.md` (300 lines) — used by copywriter + planner
- `{handle}-content-pillars.md` (100 lines) — used by planner + strategist
- `{handle}-operational-rec.md` (50 lines) — used by strategist only

**Result:** Tasks load 200-500 bytes instead of 2-3KB = ~70% context reduction per task

---

## 🚨 Bottleneck Alert

**@analytics-agent** is the bottleneck in optimize-existing-profile workflow:
- Week 1 (analyze + adjust) = 7 hours alone
- All other agents blocked until Week 1 complete

**Max concurrent profiles:** 2-3 per month per analyst

---

## 📝 Quick Reference

| Squad | Agents | Entry Point | Avg Context | Time to Activate |
|-------|--------|------------|-------------|------------------|
| **visual-design** | 5 | `@visual-designer` | 3.5K tokens | 15s |
| **marketing-ig** | 5 | `@profile-strategist` | 3.6K tokens | 15s |

---

*Last updated: 2026-04-07*  
*Optimization target: <10K tokens per squad activation (achieved ✅)*
