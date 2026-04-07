# Workflow: Optimize Existing Profile

## Overview
Fluxo mensal estruturado para otimizar um perfil já ativo, baseado em performance data. Análise + ajustes + testes para crescimento iterativo.

**Frequency:** Monthly (rerun every 30 days)  
**Duration:** 4 semanas  
**Team:** 5 agentes + user input  
**Output:** Strategy updates, new tests, adjusted calendar

---

## Week 1 — Analytics Deep Dive (@analytics-agent)

### Monday-Wednesday (5 horas)
**Task:** `analyze-performance`
- Coletar dados do mês anterior (Instagram Insights screenshots)
- Input: Performance data + strategy doc + historical baseline
- Run AARRR analysis (Acquisition → Referral)
- Identificar top performers e flops
- Output: `performance-report-{mes-ano}.md`

### Thursday-Friday (3 horas)
**Task:** `suggest-adjustments`
- Input: Performance report + strategy doc
- Propor 3-5 A/B tests específicos
- Define success metrics e sample sizes
- Output: `adjustments-proposal-{mes-ano}.md`

### Handoff to Week 2
**Pass to:** @profile-strategist  
**Context:**
```
Performance Analysis Completa:
- Engajamento: [atual vs target]
- Top performer: [tema X com Y% engagement]
- Gargalo: [conversões, apenas Z%]

Testes Propostos:
1. Hook refresh (+15% engagement expected)
2. Format shift (+20% growth expected)
3. CTA optimization (+25% clicks expected)
[...]

Próximo: revisar estratégia, validar tests
```

---

## Week 2 — Strategy Review (@profile-strategist)

### Monday-Wednesday (4 horas)
**Task:** `update-strategy`
- Input: Performance report + current strategy doc
- Validar: core messages ainda ressoam?
- Validar: content pillars ainda relevantes?
- Ajustar: quais pillars rebalancear?
- Output: `{handle}-strategy-update-{mes-ano}.md`

### Decision Checkpoint
- [ ] Strategy needs major revision? (>30% changes)
  - If YES: escalate, redo onboarding
  - If NO: continue
- [ ] Tests proposed are aligned with strategy?
  - If NO: adjust tests
  - If YES: continue

### Handoff to Week 3
**Pass to:** @copywriter + @content-planner  
**Context:**
```
Strategy Update Completa:
- Pillars rebalanceados: [novo % distribuição]
- Core messages: [mantidas | atualizadas]
- Learnings from month: [X, Y, Z]

Testes para rodar:
[Lista do adjustments proposal]

Próximo: new captions + adjusted calendar
```

---

## Week 3 — Content Creation (@copywriter + @content-planner in parallel)

### @copywriter: Monday-Wednesday (3 horas)
**Task:** `write-hook` + `write-caption`

Run tests according to `adjustments-proposal`:
- Test #1: Hook refresh
  - Write 5 new hook variations (STEPPS-based)
  - Output: `hooks-{tema}-{data}.md`
  
- Use new hooks in captions:
  - Write 3-5 captions per new hook
  - Output: 5x `caption-*.md`

### @content-planner: Monday-Friday (4 horas)
**Task:** `create-calendar`
- Input: Updated strategy + new pillar %
- Rebalanceam conteúdo para próximas 4 semanas
- Integrar tests na calendar (slot específico para cada variação)
- Output: `calendar-{proximo-mes}.md`

**Task:** `generate-brief`
- Run 5-10 times: briefs para novos posts
- Priorizar posts para tests
- Output: `brief-*.md` para cada novo post

### Parallel Handoff
**Pass to:** @trend-researcher  
**Context:**
```
Nova Calendar com Testes:
- Semanas 1-2: Test #1 (Hook), Test #2 (Format)
- Semana 3: Test #3 (CTA)
- Semana 4: Business as usual + monitor

Captions prontas:
[X novos captions com novos hooks]

Próximo: validate formatos, identify trending opportunities
```

---

## Week 4 — Trends & Finalization (@trend-researcher + @analytics-agent)

### @trend-researcher: Monday-Wednesday (3 horas)
**Task:** `find-trends`
- Pesquisar trends da próxima semana
- Identificar oportunidades que fit à estratégia
- Output: `trends-{proxima-periodo}.md`

**Task:** `suggest-format`
- Recomendar formatos para testes
- Validar: formatos estão alinhados com test specs?
- Output: `format-recommendation-*.md` para cada teste

### @analytics-agent: Thursday-Friday (2 horas)
**Task Implícita:** Test Setup
- Validar: cada test tem success metrics?
- Setup: tracking para distinguir control vs treatment
- Output: `test-tracking-setup-{mes-ano}.md`

### Final Validation Checkpoint
- [ ] Todos os testes têm control + treatment claro?
- [ ] Sample size é realista?
- [ ] Calendar está pronto para próximas 4 semanas?
- [ ] Formatos alinhados com performance data?
- [ ] Tracking setup completo?

---

## Pre-Execution Checklist

Before going live with new calendar + tests:

- [ ] Performance report revisado e aprovado
- [ ] Strategy updates documentadas
- [ ] 3-5 A/B tests specificamente definidos
- [ ] New captions e hooks prontos
- [ ] Calendar de 4 semanas pronto
- [ ] Formatos validados
- [ ] Tracking configurado para testes
- [ ] Team está aligned (comunicação clara sobre testes)

---

## Execution Phase — Week 1-4 of Next Month

### Week 1
- [ ] Publicar primeiro bloco de posts (com Test #1 e #2 ativas)
- [ ] Monitor daily: alguma anomalia?
- [ ] Collect data (not final judgment yet)

### Week 2-3
- [ ] Publicar segundo/terceiro bloco
- [ ] Run Test #3 (CTA) conforme planejado
- [ ] Continue monitoring
- [ ] Coletar data

### Week 4
- [ ] Publicar quarto bloco
- [ ] Começar preliminary analysis (qual test está ganhando?)
- [ ] Prepare next month's optimization cycle

---

## Monthly Rhythm

```
Month N:
Week 1: @analytics-agent reviews Month N-1
Week 2: @profile-strategist updates strategy
Week 3: @copywriter + @content-planner refresh content
Week 4: @trend-researcher validates, @analytics-agent setups tests

Month N+1:
Weeks 1-4: Execute calendar + run tests
Collect performance data throughout

Month N+1 End:
Begin new optimization cycle (repeat above)
```

---

## Success Metrics for Optimization Cycle

### Success = ✅
- Performance report completed with 5+ insights
- Strategy updated with 1-3 meaningful changes
- 3-5 tests proposed with clear success criteria
- New calendar created with test allocation
- Tests begin execution on schedule

### Expected Outcomes (after 4 weeks of execution)
- 1-2 tests show +10% improvement (winners)
- 1-2 tests show no significant change (neutrals)
- 1 test shows -5% or worse (loser — stop quickly)

### Growth Expectations
- **Conservative:** +5-10% in primary metric
- **Expected:** +15-25% in primary metric
- **Optimistic:** +30%+ if multiple winners and good execution

---

## Contingencies

### If Performance Report Shows Stagnation
**Issue:** Engagement flat, followers flat, no clear insight  
**Action:**
- [ ] Dig deeper: which specific content type flopped?
- [ ] Interview audience (DM feedback, comments analysis)
- [ ] Consider: is audience saturated? Do we need pivot?
- [ ] Escalate to @profile-strategist for strategy review

### If Strategy Review Recommends Major Pivot
**Issue:** Pillars no longer resonate, core messages outdated  
**Action:**
- [ ] Decision: continue with current nicho, or pivot?
- [ ] If pivot: restart with `onboard-profile` task
- [ ] If refine: update strategy and continue

### If Test Setup Reveals Insufficient Sample Size
**Issue:** Only 10 followers, can't run meaningful tests  
**Action:**
- [ ] Pause testing
- [ ] Focus on content quality + fundamentals
- [ ] Reboot testing when followers >= 100-200

### If Team Capacity Insufficient
**Issue:** Can't produce content frequency required for calendar  
**Action:**
- [ ] Reduce calendar (3x/week instead of 4x/week)
- [ ] Adjust test allocation (fewer parallel tests)
- [ ] Prioritize quality over quantity

---

## Roles & Timing

**Week 1:** @analytics-agent (full week)  
**Week 2:** @profile-strategist (full week)  
**Week 3:** @copywriter + @content-planner (parallel, full week)  
**Week 4:** @trend-researcher + @analytics-agent (parallel, half-week each)

**Total team investment:** ~20 hours/month  
**Frequency:** Monthly (reoccurring)

---

## Integration with Launch-New-Profile Workflow

If launching **new profile** during optimization cycle:
- [ ] Delay optimization cycle 1 week (wait for new profile to establish)
- [ ] Or run in parallel (dedicate separate team)

---

## Documentation Requirements

At end of each optimization cycle, document:

1. **Performance Report:** What happened last month?
2. **Strategy Update:** What changed?
3. **Adjustments Proposal:** What are we testing?
4. **Calendar:** What's next month's plan?
5. **Test Setup:** How are we tracking?

Archive all in `docs/optimization-cycles/{mes-ano}/` for future reference.

---

**Workflow Status:** Ready to Optimize  
**Recommended Frequency:** Monthly (first Monday of month)  
**Last Updated:** [data]
