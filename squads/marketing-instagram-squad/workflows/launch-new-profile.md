# Workflow: Launch New Profile

## Overview
Fluxo estruturado de 5 dias para lançar um novo perfil de Instagram, saindo do zero até publicação dos primeiros posts com estratégia completa.

**Duration:** 5 dias  
**Team:** 5 agentes  
**Output:** Perfil pronto com 5 primeiros posts agendados + analytics setup

---

## Day 1 — Strategy Foundation (@profile-strategist)

### Morning (2 horas)
**Task:** `onboard-profile`
- Coletar informações: handle, nicho, audiência, objetivo, ofertas, competidores
- Input: Brief inicial do usuário
- Output: `{handle}-onboarding-brief.md`

### Afternoon (3 horas)
**Task:** `define-strategy`
- Input: `{handle}-onboarding-brief.md`
- Estruturar StoryBrand 7-Point completo
- Mapear content pillars com %
- Definir 5 core messages
- Criar 10 hook frameworks
- Output: `{handle}-strategy-document.md`

### Handoff to Day 2
**Pass to:** @copywriter  
**Context:**
```
Estratégia completa definida:
- 5 core messages: [lista]
- 3 content pillars: [% distribuição]
- 10 hook frameworks: [prontos para usar]
- Primeiro passo: escrever 5 captions baseadas nesta estratégia
```

---

## Day 2 — Copywriting (@copywriter)

### Morning (3 horas)
**Task:** `write-caption`
- Run 5 times: escrever 5 primeiras captions
- Input: Strategy doc + 5 temas (1 per core message, ideally)
- Output: 5 arquivos `caption-*.md`

### Afternoon (2 horas)
**Task:** `write-cta`
- Definir 3 variações de CTA para offers
- Input: Strategy doc + ofertas definidas
- Output: `cta-{objetivo}-{data}.md` (awareness, engagement, lead-gen)

### Handoff to Day 3
**Pass to:** @content-planner  
**Context:**
```
5 Captions prontas:
[lista com temas, hooks usados, pilar atribuído]

CTAs definidas:
- Awareness CTA: "[texto]"
- Lead-gen CTA: "[texto]"
- Sales CTA: "[texto]"

Próximo: criar calendário editorial de 4 semanas
```

---

## Day 3 — Calendar Planning (@content-planner)

### Morning (2 horas)
**Task:** `create-calendar`
- Input: Strategy doc + CTA options
- Estruturar 4 semanas com distribuição de pillars
- Jab/Right Hook ratio: 80/20
- Formatos variados (reel, carousel, post)
- Output: `calendar-{mes-ano}.md`

### Afternoon (2 horas)
**Task:** `generate-brief`
- Run 5 times: criar briefs para os 5 primeiros posts
- Input: Calendar + captions + strategy
- Output: 5 `brief-{tema}-{data}.md` files

### Handoff to Day 4
**Pass to:** @trend-researcher  
**Context:**
```
Calendário de 4 semanas criado.
Primeiros 5 posts:
[lista com datas, formatos, temas, briefs]

Próximo: identificar trends do nicho + recomendar formatos
```

---

## Day 4 — Trends & Formats (@trend-researcher)

### Morning (2 horas)
**Task:** `find-trends`
- Input: Strategy doc (nicho, competitors)
- Pesquisar 3-5 trends viralizando no nicho
- STEPPS analysis pra cada
- Output: `trends-{periodo}.md`

### Afternoon (1 hora)
**Task:** `suggest-format`
- Run 5 times: recomendar formato para cada um dos 5 primeiros posts
- Input: Brief + historical data (se houver)
- Validar recomendação de pilar + tema + formato
- Output: 5 `format-recommendation-*.md`

### Handoff to Day 5
**Pass to:** @analytics-agent  
**Context:**
```
Trends identificados para próximas semanas.
Formatos recomendados para cada post.

Próximo: setup tracking + definir baseline metrics
```

---

## Day 5 — Analytics Setup (@analytics-agent)

### Full Day (4 horas)

**Task Implícita:** Setup Tracking
- Definir tracking para cada post (qual métrica? qual baseline?)
- Setup links/UTM (se houver CTA com link)
- Criar dashboard visual (screenshot recommendations)
- Define success metrics por post type

**Output (não é formal task, mas precisa documentar):**
```markdown
# Tracking Setup — @{handle}

## Baseline Metrics (Day 1)
- Followers: [X]
- Avg Engagement Rate: [target Y%]

## Per-Post Tracking
- Post 1: [métrica X, baseline Y]
- Post 2: [métrica X, baseline Y]
...

## Weekly Pulse Check
- Every Sunday: report followers, avg engagement, top post
- Monthly: full analytics analysis
```

### Handoff to User
**Ready for Launch:**
- ✅ Estratégia completa documentada
- ✅ 5 primeiros captions prontos
- ✅ Calendário de 4 semanas mapeado
- ✅ Formatos recomendados
- ✅ Trends para próximas semanas identificados
- ✅ Tracking setup

---

## Pre-Launch Checklist

- [ ] Estratégia documentada e revisada
- [ ] 5 captions revisadas (ton, qualidade, hooks)
- [ ] Calendário validado (distribuição, formatos)
- [ ] Assets prontos (imagens, vídeos para primeiros 5 posts)
- [ ] CTAs testadas e prontas
- [ ] Tracking configurado
- [ ] Bio do perfil escrita e revisada

---

## Day 6+ — Ongoing Operations

**After Launch:**
- [ ] Publicar primeiros 5 posts (2-3 dias apart)
- [ ] Monitorar engajamento diariamente (primeiros 7 dias críticos)
- [ ] Responder comentários rapidamente
- [ ] Coletar data para baseline

**Week 2-4:**
- Continue calendar
- Gather performance data
- Prepare for Monthly Optimization Cycle

---

## Success Metrics

### Launch Success = ✅
- Strategy doc completo e claro
- 5 captions de qualidade (estrutura AIDA, hooks, CTAs)
- Calendário viável (80/20 jab/hook, pillar distribution)
- Primeira semana de posts publicados
- Tracking começou

### Post-Launch Targets (after 30 days)
- Followers: [depende do nicho, target X]
- Engagement Rate: [depende do nicho, target Y%]
- Link Clicks (se CTA): [Z% CTR]
- Saves: [W% save rate]

---

## Troubleshooting During Workflow

### If Day 1 Strategy Slips (3+ hours over)
- Consider: é estratégia muito complexa?
- Contingency: simplificar para 3 pillars, não 4
- Impact: continua em schedule

### If Day 2 Captions Take Longer
- Ask user: algum tema é mais importante? Focus ali primeiro
- Contingency: usar 3 captions prontas, não 5
- Impact: calendário pode usar captions reutilizadas

### If Day 3 Calendar Isn't Viable
- Issue: maybe pillars are too rigid?
- Solution: @content-planner + @profile-strategist sync (15 min call)
- Decision: ajustar pillars ou calendar constraints

### If Trends Aren't Relevant
- Fallback: se nenhum trend apelativo, use core content pillars
- Solution: pode adicionar trends depois quando aparecerem

---

## Roles & Handoff Protocol

Each agent has 1 day. Handoff happens at EOD with:
- Completed output files (listed above)
- 5-minute summary of what worked / what to watch
- Any blockers or decisions made
- Next agent gets everything needed to start immediately

**Principle:** Zero rework. Each agent's output is ready for next agent to use immediately.

---

## Timeline Overview

```
Day 1: @profile-strategist → Strategy Document ✅
       ↓
Day 2: @copywriter → 5 Captions + CTAs ✅
       ↓
Day 3: @content-planner → 4-Week Calendar + 5 Briefs ✅
       ↓
Day 4: @trend-researcher → Trends + Format Recs ✅
       ↓
Day 5: @analytics-agent → Tracking Setup ✅
       ↓
Day 6: PUBLISH → 5 Posts Go Live ✅
```

---

**Workflow Status:** Ready to Launch  
**Last Updated:** [data]
