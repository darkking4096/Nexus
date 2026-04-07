# Task: Analyze Performance

## Agente
**Analytics Agent**

## Descrição
Analisa métricas de performance (AARRR: Acquisition, Activation, Retention, Revenue, Referral) e identifica gargalos, wins, e oportunidades de otimização. Base para decisões de @profile-strategist, @copywriter e @content-planner.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (objetivos, core messages, ofertas)
2. Período a analisar (ex: "últimos 30 dias" ou "março 2026")
3. Analytics data (screenshots Instagram Insights, ou dados raw)
4. Historical baseline (números de mês anterior, para comparison)
5. Eventos/mudanças (ex: "Rodei novo hook em semana 2")
```

## Steps

### Step 1: Estruturar Dados com AARRR
- [ ] **Acquisition:** Novos followers? De onde vieram? (home feed, explore, hashtags, shares?)
- [ ] **Activation:** % de followers que engajam com posts? (30% view rate = boa)
- [ ] **Retention:** % de followers que engajam NOVAMENTE semana seguinte?
- [ ] **Revenue:** Sales / leads gerados? (CPA, LTV)
- [ ] **Referral:** % de shares / mentions / UGC gerado?

### Step 2: Validar Contra Benchmarks
- [ ] Instagram industry average (2025): 1-3% engagement rate
- [ ] Seu target: [baseado em nicho]
- [ ] Você está [acima | no target | abaixo] do esperado?

### Step 3: Identificar Top Performers
- [ ] Top 5 posts: qual tema? Qual formato? Qual hook? Por quê funcionou?
- [ ] Top hook framework: qual ganhou?
- [ ] Top pilar: qual pilar gerou mais engajamento?

### Step 4: Identificar Underperformers
- [ ] Flop posts: qual tema? Qual formato? Por quê falhou?
- [ ] Qual hook não funcionou?
- [ ] Qual pilar underperformed?

### Step 5: Análise de Funnel
- [ ] Views → Saves (qual % salva conteúdo?)
- [ ] Saves → Clicks em link (se tem CTA)
- [ ] Clicks → Conversão (email, purchase, lead)
- [ ] Onde está o maior vazamento?

### Step 6: Hipóteses de Causa
- [ ] Performance caiu? Por quê? (tempo de postagem mudou? tema mudou? competição subiu?)
- [ ] Performance subiu? Por quê? (qual mudança causou?)
- [ ] Dados suportam a hipótese? (ou é coincidência?)

### Step 7: Comparar com Período Anterior
- [ ] Semana 1-2 vs Semana 3-4: qual foi melhor?
- [ ] Mês anterior vs esse mês: qual direção?
- [ ] Trending up? Down? Plateaued?

## Output

Entregar um arquivo chamado **`performance-report-{mes-ano}.md`** com:

```markdown
# Performance Report — [Período: ex. Março 2026] — [Data]

## AARRR Summary

### Acquisition
- **New Followers:** [número] vs [month prior] = [+X% | -X%]
- **Follower Growth Rate:** [X% / month]
- **Source Analysis:**
  - Home Feed: [X%]
  - Explore Page: [X%]
  - Hashtags: [X%]
  - Shares: [X%]
- **Insight:** [melhor canal para crescimento?]

### Activation
- **Total Impressions:** [número]
- **Total Engagements:** [número]
- **Engagement Rate:** [X%] vs [industry avg 1-3%]
- **Performance:** [✅ above avg | ⚠️ at avg | ❌ below avg]

### Retention
- **Repeat Engagers:** [X% of followers engaged 2+ times]
- **Weekly Churn:** [X% of followers disappeared]
- **Insight:** [são audiences "sticky"? ou transient?]

### Revenue (If Applicable)
- **Sales Generated:** [$X]
- **Leads Generated:** [X]
- **CPA (Cost Per Acquisition):** [$X, if ads running]
- **LTV (Lifetime Value):** [$X estimated]

### Referral
- **Shares:** [X total shares]
- **Mentions:** [X in comments/DMs]
- **UGC:** [X user-generated content]
- **Net Promoter-ish:** [are people advocating?]

---

## Performance vs Target

| Metric | Target | Actual | Performance |
|--------|--------|--------|-------------|
| Followers | [goal] | [actual] | [✅/⚠️/❌] |
| Engagement Rate | [goal] | [actual] | [✅/⚠️/❌] |
| Saves/Post | [goal] | [actual] | [✅/⚠️/❌] |
| Comments/Post | [goal] | [actual] | [✅/⚠️/❌] |
| Clicks/Sales | [goal] | [actual] | [✅/⚠️/❌] |

---

## Top Performers — What Worked

### Top 5 Posts
| Rank | Theme | Format | Eng. Rate | Saves | Why? |
|------|-------|--------|-----------|-------|------|
| 1 | [tema] | Reel | X% | Y | [hook + pilar combination] |
| 2 | [tema] | Carousel | X% | Y | [step-by-step resonated] |
| 3 | [tema] | Post | X% | Y | [personal story connection] |
| 4 | [tema] | Reel | X% | Y | [trending hook adapted] |
| 5 | [tema] | Carousel | X% | Y | [education content] |

### Winning Patterns
- **Best Format:** [Reel dominates, 70% of top 5]
- **Best Pilar:** [Education pilar got X% engagement]
- **Best Hook:** [Hook type #3 — curiosity gap — won]
- **Best Time:** [Tuesday 10am got X% more reach]

---

## Underperformers — What Flopped

### Flop Posts
| Theme | Format | Eng. Rate | Why Failed? |
|-------|--------|-----------|-----------|
| [tema] | [format] | X% | [hook too generic] |
| [tema] | [format] | X% | [pilar not resonating] |

### Learning Patterns
- **Avoid:** [Post-only format got < 50% avg engagement]
- **Avoid:** [Hook type #7 consistently underperformed]
- **Fix:** [This pilar needs refresh]

---

## Funnel Analysis

### Views → Saves (Quality)
- **Total Views:** [X]
- **Total Saves:** [Y]
- **Save Rate:** [Y/X = Z%]
- **Target:** [3-5% for educational content]
- **Performance:** [Z% vs target]

### Saves → Clicks (If CTA)
- **Total Saves:** [X]
- **Total Link Clicks:** [Y]
- **Click Rate:** [Y/X = Z%]
- **Insight:** [people saving but not clicking = maybe offer not clear?]

### Clicks → Conversions
- **Total Clicks:** [X]
- **Total Leads/Sales:** [Y]
- **Conversion Rate:** [Y/X = Z%]
- **CPA:** [$Z / Y if ads running]

**Bottleneck Identified:** [Qual é o maior vazamento? Qual step precisa otimização?]

---

## Trends & Direction

### Week-by-Week Progression
| Week | Followers | Eng Rate | Top Post | Insight |
|------|-----------|----------|----------|---------|
| Week 1 | X | X% | [tema] | [estava lower] |
| Week 2 | X | X% | [tema] | [peak] |
| Week 3 | X | X% | [tema] | [stable] |
| Week 4 | X | X% | [tema] | [trending up/down?] |

### Overall Direction
- ✅ **Trending UP** — [X% growth week-over-week]
- ⚠️ **Plateaued** — [flat for 2 weeks]
- ❌ **Trending DOWN** — [X% decline]

### Comparison to Previous Month
- [Previous: X followers, Y% eng] → [This month: X followers, Y% eng]
- [Direction: +/- Z%]

---

## Hypothesis: Why Performance Happened

### If UP ⬆️
**Hypothesis:** [qual mudança causou isso?]
- [ ] Novo hook framework testado em Week 2?
- [ ] Mudança de tempo de postagem?
- [ ] Novo pilar resonou melhor?
- [ ] Competitors disappeared?
- [ ] Trend capturamos bem?

**Evidence:** [dados que suportam]

### If DOWN ⬇️
**Hypothesis:** [qual mudança causou isso?]
- [ ] Parei de postar em um pilar que funcionava?
- [ ] Audience mudou?
- [ ] Competitors intensificaram?
- [ ] Algoritmo mudou?
- [ ] Hook cansou?

**Evidence:** [dados que suportam]

### If FLAT →
**Hypothesis:** [qual é o ceiling?]
- [ ] Audiência esgotada nesse segmento?
- [ ] Preciso novo pilar / novo ângulo?
- [ ] Timing subótimo?

---

## Benchmarking (If Known)
| Metric | Our Account | Competitor A | Competitor B | Industry Avg |
|--------|-------------|--------------|--------------|--------------|
| Eng Rate | X% | Y% | Z% | 1-3% |
| Follower Growth | X%/mo | Y%/mo | Z%/mo | — |
| Saves/Post | X | Y | Z | — |

**Insight:** [estamos competitivos? Atrás? À frente?]

---

## Actionable Insights for Next Month

### ✅ Keep Doing
- [Post format que ganhou]
- [Hook type que funcionou]
- [Timing que trouxe melhor reach]
- [Pilar que resonou]

### 🔄 Adjust
- [Freq de posting — aumentar/diminuir?]
- [Mix de pilares — rebalancear?]
- [Timing — mudar para melhor hora?]

### ❌ Stop
- [Hook que não funciona mais]
- [Formato que flopu]
- [Pilar que não resonou]

### 🆕 Test
- [Novo hook type]
- [Novo formato / angle]
- [Novo timing]

---

## Next Steps
- [ ] @profile-strategist: `update-strategy` (se mudanças grandes)
- [ ] @copywriter: teste novos hooks (baseado em learnings)
- [ ] @content-planner: ajuste calendário (mais desse pilar)
- [ ] @trend-researcher: capture trends que performaram melhor

---

## Meta-informações
- Período analisado: [data range]
- Data do report: [data]
- Próxima análise: [em 7 dias? 30 dias?]
```

## Frameworks Usados
- **AARRR (Neil Patel):** Análise de funnel completa (Acquisition → Referral)
- **A/B Testing Mindset:** Comparar periods, identificar o que mudou
- **Funnel Analysis:** Onde está o maior vazamento?

## Sucesso Significa
✅ AARRR completo (todos 5 elementos analisados)  
✅ Comparação clara com período anterior  
✅ Top 5 e flop posts identificados com análise de "por quê"  
✅ Hipóteses sobre causas (não apenas números)  
✅ Recomendações acionáveis para próximo período  
✅ Benchmarking (se conhecer concorrentes)
