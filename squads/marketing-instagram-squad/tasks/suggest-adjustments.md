# Task: Suggest Adjustments

## Agente
**Analytics Agent**

## Descrição
Propõe experimentos específicos e ajustes na estratégia baseado em performance data. Transforma insights em testes A/B estruturados que os próximos ciclos podem rodar.

## Inputs Esperados

```
Precisa de:
1. {handle}-performance-report-{mes}.md (output da task anterior)
2. {handle}-strategy-document.md (estratégia atual)
3. Capacidade de teste (quanto do volume pode dedicar a experimentos?)
4. Restrições (ex: "não posso testar novo pilar agora")
5. Metas (ex: "aumentar engagement em 20%")
```

## Steps

### Step 1: Identificar Bloqueios
- [ ] Qual métrica é o MAIOR gargalo? (views, saves, clicks, conversões?)
- [ ] É problema de alcance? Ou de conversão?
- [ ] É problema de atração (hook)? Ou retenção (conteúdo)?

### Step 2: Priorizar Impacto Máximo
- [ ] Mover qual métrica teria maior impacto? (ex: +1% eng rate é +X followers?)
- [ ] Qual mudança é mais fácil de testar? (hook vs pilar vs timing)
- [ ] Qual mudança pode ser implementada rápido?

### Step 3: Estruturar A/B Tests
- [ ] **Control:** A situação atual (baseline)
- [ ] **Treatment A:** Mudança proposta
- [ ] **Treatment B (opcional):** Alternativa
- [ ] **Sample Size:** Quantos posts precisa testar? (3-5 por variação é mínimo)
- [ ] **Duration:** Quantas semanas precisa? (2-4 semanas / test é padrão)

### Step 4: Aplicar Value Equation (Hormozi)
- [ ] Se testando nova oferta: o value aumentou?
- [ ] Se testando novo hook: o desire layer got stronger?
- [ ] Se testando novo timing: alcance aumentou?

### Step 5: Definir Sucesso
- [ ] Qual é o resultado esperado? (ex: +15% engagement)
- [ ] Qual é o resultado "aceitável"? (ex: mínimo +5%)
- [ ] Qual é o resultado "fracasso"? (ex: se cair, para o test)

### Step 6: Planejar Rollout
- [ ] Se test ganhar: quando implementar em 100%?
- [ ] Se test empatar: o que fazer? (repeat? pivot?)
- [ ] Se test perder: volta ao control ou testa alternativa?

## Output

Entregar um arquivo chamado **`adjustments-proposal-{mes-ano}.md`** com:

```markdown
# Adjustment Proposals — [Período] — [Data]

## Executive Summary
- **Primary Bottleneck:** [métrica que mais limita crescimento]
- **Impact of Fixing:** [se fixar isso, crescimento esperado seria X%]
- **Number of Tests Proposed:** [3-5 experimentos]
- **Timeline to Results:** [2-4 semanas por test]

---

## Bottleneck Analysis

### Current Situation
- **Top Performing Metric:** [engajement, X%]
- **Worst Performing Metric:** [conversões, X%]
- **Biggest Leakage:** [views → saves, apenas Y%]
- **Improvement Opportunity:** [fixing this could yield +Z%]

### Root Cause Hypothesis
**Problema:** [ex: "Engagement caiu 30%"]  
**Possíveis causas:**
1. [ ] Hook cansou (audience viu 100+ variações)
2. [ ] Pilar não mais relevante
3. [ ] Timing mudou (novo algoritmo)
4. [ ] Competição aumentou
5. [ ] Audience mudou (followers menos qualificados)

**Most Likely Cause:** [baseado em dados]

---

## Test #1 — Hook Refresh

### Hypothesis
> "Testando novos hook frameworks vai aumentar engagement em +15%"

### Control (Current State)
- **Hooks Being Used:** [frameworks A, B, C]
- **Current Engagement:** [X%]
- **Baseline Sample:** [última 2 semanas, Y posts]

### Treatment A — New Hook Mix
- **New Hooks:** [frameworks D, E, F — que não foram testadas]
- **Why:** [baseado em trends analysis, ou STEPPS theory]
- **Expected Engagement:** [Y% = X% baseline + 15% improvement]

### Treatment B (Optional) — Hybrid
- **Hooks:** [mix de velhas + novas]
- **Why:** [conservative approach, menos risco]
- **Expected Engagement:** [Y% = X% baseline + 8% improvement]

### Sample Size & Duration
- **Posts to Test:** [3-5 com Treatment A, 3-5 com Treatment B]
- **Duration:** [2 semanas]
- **Success Threshold:** [+10% engagement vs baseline]

### Rollout Plan (If Test Wins)
```
Week 1-2: Run test
Week 3: Analyze
Week 4: If +10%+, use Treatment A in 100% of posts
```

### Success Metrics
| Metric | Baseline | Target | Success Criterion |
|--------|----------|--------|------------------|
| Engagement Rate | X% | Y% | >= X% + 10% |
| Saves/Post | X | Y | >= X + 20% |
| Comments/Post | X | Y | >= X + 15% |

---

## Test #2 — Format Optimization

### Hypothesis
> "Aumentar % de reels de 60% para 80% vai gerar +20% mais followers"

### Control (Current State)
- **Format Mix:** [60% reels, 30% carousel, 10% posts]
- **Current Follower Growth:** [X%/month]
- **Baseline Sample:** [última 4 semanas]

### Treatment — Reel Increase
- **New Mix:** [80% reels, 15% carousel, 5% posts]
- **Why:** [reels têm 3x mais reach que carousel]
- **Expected Growth:** [X% + 20%]

### Sample Size & Duration
- **Posts to Test:** [8-10 posts/week, 4 weeks]
- **Duration:** [4 weeks — need longer for follower growth signal]
- **Success Threshold:** [+15% follower growth vs last month]

### Rollout Plan
```
Week 1-4: 80% reel mix
Week 5: Analyze data
Week 6: If +15%+, keep 80% reel mix permanently
```

---

## Test #3 — CTA Optimization

### Hypothesis
> "CTAs benefit-driven vão gerar +25% mais clicks vs CTAs diretos"

### Control
- **CTA Type:** [Direct: "Clique aqui"]
- **Current CTR:** [X%]
- **Baseline:** [últimas Y conversões]

### Treatment A — Benefit-Driven CTA
- **CTA Examples:** 
  - "Descobre como consegui 10k em 6 meses"
  - "Salva essa para não esquecer"
  - "Manda DM pra ver a lista completa"
- **Expected CTR:** [X% + 25%]

### Treatment B — Curiosity CTA
- **CTA Examples:**
  - "Spoiler: é o oposto do que você pensa"
  - "Tipo... é bem simples na verdade"
- **Expected CTR:** [X% + 15%]

### Sample Size & Duration
- **Posts to Test:** [3-5 com cada CTA variation]
- **Duration:** [2 weeks]
- **Success Threshold:** [+15% CTR vs baseline]

### Rollout Plan
```
Week 1-2: Test all 3 variants
Week 3: Analyze
Week 4: Roll winner to all posts
```

---

## Test #4 — Content Pillar Rebalance

### Hypothesis
> "Pillar X (Education) vai melhor se aumentar de 40% para 50% do volume"

### Current Mix
| Pilar | % | Engagement |
|-------|---|------------|
| Education | 40% | X% |
| Social Proof | 30% | Y% |
| Offer | 30% | Z% |

### Proposed Mix
| Pilar | % | Rationale |
|-------|---|-----------|
| Education | 50% | (+25% engagement opportunity) |
| Social Proof | 25% | (still needed for trust) |
| Offer | 25% | (still monthly revenue generation) |

### Test Plan
- **Duration:** [4 weeks at new mix]
- **Success Threshold:** [Education pilar avg engagement >= Y% + 15%]
- **Risk:** [Offer pillar might drop — acceptable risk if education gains enough]

### Rollout Plan
```
Week 1-4: 50/25/25 mix
Week 5: Analyze
Week 6: If education +15% and overall engagement flat/up, keep it
```

---

## Test #5 — Posting Time Optimization

### Hypothesis
> "Posting 2 hours earlier (from 10am to 8am) vai aumentar reach em +20%"

### Control
- **Current Posting Time:** [10:00 AM]
- **Current Reach/Post:** [X]
- **Audience Active Times:** [histórico de Instagram Insights]

### Treatment
- **New Posting Time:** [08:00 AM]
- **Why:** [audience mais active cedo, menos competition]
- **Expected Reach:** [X + 20%]

### Sample Size & Duration
- **Posts to Test:** [3 posts à nova hora]
- **Duration:** [1 week]
- **Success Threshold:** [reach >= X + 15%]

### Rollout Plan
```
Week 1: Test 3 posts at 8am
Week 2: Analyze reach
Week 3: If +15%, change all to 8am; monitor for 2 more weeks
```

---

## Test Priority & Timeline

### Month Overview
```
Week 1-2: Test #1 (Hook) + Test #5 (Timing) [can run parallel]
Week 3-4: Test #2 (Format) [longer test]
Week 5-6: Test #3 (CTA)
Week 7-8: Test #4 (Pillar Rebalance)
```

### Resource Allocation
- **Total Posts This Month:** [120 posts if 4/week]
- **Allocated to Tests:** [30 posts, 25% of volume]
- **Allocated to Business as Usual:** [90 posts, 75% of volume]

---

## Success Criteria & Next Steps

### If Tests Win (3+ of 5 Positive)
- [ ] Implement winners in main calendar
- [ ] Re-run losers next month (maybe wrong timing)
- [ ] Expect 15-25% overall growth next month

### If Tests Mostly Lose (2 or fewer positive)
- [ ] Deep audit: is strategy wrong?
- [ ] Consider bigger pivot: new nicho? new audience? new offer?
- [ ] Call @profile-strategist for strategy update

### If Tests Show Mixed Results (2-3 positive)
- [ ] Implement winners
- [ ] Keep testing losers
- [ ] Expect 8-15% overall growth next month

---

## Framework Application

### Value Equation (Hormozi)
- **Hook Test:** Increasing desire layer (better hooks = more desire)
- **Offer Test:** Changing how we frame value (benefit-driven CTA = higher perceived value)
- **Pillar Test:** Shifting to what audience values most

### AARRR Optimization
- **Acquisition:** Hook + Format tests (more reach)
- **Activation:** CTA test (more clicks)
- **Retention:** Pilar test (more consistent value)
- **Revenue:** Timing test (catch audience at right moment)

---

## Risk Mitigation

### Downside Scenarios
| Risk | Probability | Mitigation |
|------|-------------|-----------|
| Hook test flops | Medium | Keep some old hooks as control |
| Format shift hurts quality | Low | 80/20 rule: 80% reels, 20% other |
| CTA too aggressive | Low | A/B test first, rollout slowly |
| Pillar rebalance alienates | Medium | Keep offer pilar at 25% minimum |
| Timing breaks engagement | Low | Can switch back in 1 week |

---

## Next Steps & Handoffs

### Immediately (This Week)
- [ ] @profile-strategist: review tests, approve Hook refresh (aligns with strategy?)
- [ ] @content-planner: reserve 30 posts for tests
- [ ] @copywriter: prepare new hooks for Test #1

### Week 1-2
- [ ] Launch Test #1 (Hook) + Test #5 (Timing)
- [ ] Monitor daily for anomalies
- [ ] Collect data

### Week 3-4
- [ ] Analyze Test #1 + #5 results
- [ ] Launch Test #2 (Format) + Test #3 (CTA)
- [ ] Prepare Test #4 (Pilar rebalance) calendar

### Week 5+
- [ ] Analyze all tests
- [ ] Implement winners
- [ ] Plan next month's tests

---

## Meta-informações
- Proposals criadas: [data]
- Baseado em: performance-report-{mes}.md
- Timeline: próximas 4 semanas
- Review em: [data + 4 semanas para resultados]
```

## Frameworks Usados
- **A/B Testing (Rigorous):** Control, Treatment, Sample Size, Duration, Success Metrics
- **Value Equation (Hormozi):** Aplicar conceito a cada test (demand, conversão, esforço)
- **AARRR (Neil Patel):** Teste é distribuído ao longo do funnel

## Sucesso Significa
✅ 3-5 tests específicos com control/treatment claro  
✅ Sample size e duration realista  
✅ Success criteria quantificado (não vago)  
✅ Rollout plan se test ganhar  
✅ Risk mitigation documentado  
✅ Timeline viável (não 20 tests em 4 semanas)
