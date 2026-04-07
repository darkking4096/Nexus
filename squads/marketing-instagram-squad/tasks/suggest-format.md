# Task: Suggest Format

## Agente
**Trend Researcher**

## Descrição
Recomenda o melhor formato (reel, carousel, post, story) para um tema/trend específico, baseado em dados de performance histórica e padrões de plataforma. Ajuda @content-planner e @designer a decidir "qual formato usar?" antes de produzir.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (histórico de performance)
2. Tema/trend a cobrir (ex: "método de 5 níveis de consciência")
3. Objetivo do post (awareness, engagement, lead-gen, sales)
4. Dados históricos (ex: "últimos 3 meses, qual formato ganhou?")
5. Público características (ex: "gosta de educação longa vs snackable")
```

## Steps

### Step 1: Analisar Performance Histórica
- [ ] Último mês: qual formato teve melhor engagement rate?
- [ ] Último trimestre: qual formato gerou mais saves? Mais comments?
- [ ] Qual formato tem maior "watch time" (se reel)?

### Step 2: Aplicar Padrões de Plataforma (Instagram 2025)
- [ ] **Reels:** Prioridade máxima do algoritmo, 15-90s, hooking crucial
- [ ] **Carousels:** Menor prioridade, mas melhor para educação longa (5-10 slides)
- [ ] **Posts:** Muito menor alcance, melhor para pessoal/conversacional
- [ ] **Stories:** Não gera leads/sales direto, melhor para engagement/relationship building

### Step 3: Mapear Tema → Formato Ideal
- [ ] **Se "How-To / Educação":** Carousel (5-8 slides) ou Reel (se conseguir simplificar)
- [ ] **Se "Result / Transformação":** Reel (antes/depois é visualmente poderoso)
- [ ] **Se "Social Proof / Story":** Reel (engagement automático com narrativa)
- [ ] **Se "Oferta / CTA Direto":** Reel (maior reach) ou post (mais conversacional)
- [ ] **Se "Controversial / Debate":** Post (comments mais profundos)

### Step 4: Considerar Esforço de Produção
- [ ] **Reel:** Mais trabalho (roteiro, filmagem, áudio, edição) — 4-6 horas
- [ ] **Carousel:** Moderado (design, copy) — 2-3 horas
- [ ] **Post:** Menos trabalho (copy + 1 imagem) — 30-45 min
- [ ] Quanto esforço está disponível?

### Step 5: Analisar Trend Format Nativo
- [ ] Onde o trend originou? (TikTok = reel; Pinterest = carousel; Twitter = post)
- [ ] Qual formato mantém a "essência" do trend?

### Step 6: Fornecer Alternativas Ranked
- [ ] **Opção 1 (Recomendado):** Por quê
- [ ] **Opção 2 (Alternativa):** Por quê
- [ ] **Opção 3 (Se constraint X):** Por quê

## Output

Entregar um arquivo chamado **`format-recommendation-{tema}-{data}.md`** com:

```markdown
# Format Recommendation — [Tema] — [Data]

## Decision Context
- **Tema:** [descrição]
- **Objetivo:** [awareness | engagement | lead-gen | sales]
- **Effort Availability:** [low | medium | high]
- **Audience Preference:** [data-driven insight]

---

## Performance Historical Data

### Last 30 Days
| Format | Avg Eng. Rate | Saves/Post | Comments/Post | Watch Time | Win? |
|--------|---------------|-----------|---------------|-----------|------|
| Reel | X% | Y | Z | High | ✅ |
| Carousel | X% | Y | Z | Medium | — |
| Post | X% | Y | Z | Low | — |

### Last 90 Days
[Similar table, longer timeframe for trends]

### Winner Format: **[REEL | CAROUSEL | POST]** based on [métrica mais importante]

---

## Theme → Format Mapping

### This Theme ("Método de 5 Níveis")
- **Type:** [how-to | result | social proof | offer]
- **Natural Format:** [qual formato conta essa história melhor?]
- **Why:** [porque é how-to, carousel é ideal para step-by-step]
- **Platform Native:** [onde começou? TikTok = deve ser reel]

---

## Production Effort Analysis

| Format | Estimated Time | Complexity | Bottleneck |
|--------|----------------|-----------|-----------|
| Reel | 4-6 hours | High | Scriptwriting, filming |
| Carousel | 2-3 hours | Medium | Design, copy |
| Post | 30-45 min | Low | Caption writing |

**Current Bandwidth:** [low | medium | high]  
**Recommendation:** Use [format] to match available effort

---

## Platform Algorithm Insight (Instagram 2025)

### Reel Advantages
- ✅ 3x more likely to appear in Home feed
- ✅ Highest reach potential if good hook
- ✅ Reels with "stays" (people rewatch) boost algorithm
- ⚠️ Requires strong hook in first 1-2 seconds

### Carousel Advantages
- ✅ Best for sequential/step-by-step content
- ✅ Users spend more TIME on carousel (read all slides)
- ✅ Saves rate is usually higher (bookmarkable)
- ⚠️ Reach is 40% lower than reel

### Post Advantages
- ✅ Best for controversial/discussion (comments deeper)
- ✅ Least effort required
- ⚠️ Reach is 60% lower than reel
- ⚠️ Not algorithm-favored in 2025

---

## Format Recommendation — RANKED

### Option 1 (PRIMARY) — **[REEL]** ⭐⭐⭐
**Why:**
- Historical performance: [best engagement]
- Theme fit: [narrative/transformation suits motion]
- Effort: [manageable with current resources]
- Platform: [algorithm favors this format now]
- Expected performance: [X% better than carousel]

**Spec:**
- Duration: [15-30s | 30-60s]
- Hook placement: [0-2s critical]
- Call-to-action: [overlay or end-card]

### Option 2 (ALTERNATIVE) — **[CAROUSEL]** ⭐⭐
**Why:**
- Better for [detailed / educational content]
- Lower effort than reel
- Still gets [Y% engagement]
- Audience saves this format more

**Spec:**
- Slide count: [5-8 optimal]
- Progression: [step 1 → step N]
- CTA: [final slide]

### Option 3 (IF CONSTRAINT) — **[POST]** ⭐
**Why:**
- Only if [time is extremely limited]
- Or if [engagement depth matters more than reach]
- Minimal effort

**Spec:**
- [1 strong image OR carousel-first-slide]
- [Extended caption with story]

---

## Alternative Strategies

### If Reel Is Too Time-Consuming
- **Option A:** Simplify reel (use templates, stock footage)
- **Option B:** Repurpose carousel into video-form (add transitions, music)
- **Option C:** Pause and use carousel instead (still effective)

### If Algorithm Shifts
- **Monitor:** [Instagram's recent feature prioritization]
- **Flex:** If carousels suddenly favored, switch to carousel

---

## Success Metrics for This Format
- **Expected Engagement Rate:** [X% based on format + historical]
- **Expected Saves:** [Y per 100 views]
- **Expected Comments:** [Z per 100 views]
- **Success = Reaching [benchmark]**

---

## Checklist
- [ ] Format choice explained clearly
- [ ] Historical data supports choice
- [ ] Effort/resources alignment confirmed
- [ ] Production spec clear for designer
- [ ] Backup option provided

---

## Next Steps
- [ ] @content-planner: update calendar with this format
- [ ] @designer: start production with spec from Option 1
- [ ] @analytics-agent: track performance vs forecast

---

## Meta-informações
- Recomendação data: [data]
- Baseado em: performance histórica [date range]
- Válida até: [quando refazer análise — 30 dias]
```

## Frameworks Usados
- **Platform Algorithm Understanding:** Instagram 2025 prioritization rules
- **Performance Data Analysis:** Historical engagement by format
- **Effort Estimation:** Realistic production timelines

## Sucesso Significa
✅ Recomendação clara (não ambígua)  
✅ Suportada por dados históricos  
✅ 3 opções ranked com trade-offs explicados  
✅ Produção spec claro para designer/editor  
✅ Alinhado com effort disponível
