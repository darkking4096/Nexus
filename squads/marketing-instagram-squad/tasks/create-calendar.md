# Task: Create Calendar

## Agente
**Content Planner**

## Descrição
Cria calendário editorial de 4 semanas com distribuição de content pillars, formatos, temas e timing. Este é o documento operacional que a @copywriter e @trend-researcher usam para saber o que produzir.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (pillars %, core messages, hooks frameworks)
2. Mês/período (ex: "Abril de 2026")
3. Frequência disponível (ex: 4 posts/semana)
4. Dados históricos (se houver: qual formato / dia / horário performou melhor)
5. Eventos/datas importantes (ex: lançamento de produto, feriados)
```

## Steps

### Step 1: Validar Distribuição de Pillars
- [ ] Reconfirmar % de cada pilar (deve somar 100%)
- [ ] Ex: 40% educação, 30% social proof, 30% offer
- [ ] Ex: 20 posts/mês → 8 educação, 6 social proof, 6 offer

### Step 2: Aplicar Jab Jab Right Hook (Vaynerchuk)
- [ ] Distribuir "jabs" (valor puro, 80%) vs "right hook" (oferta, 20%)
- [ ] Ex: Se 20 posts → 16 jabs, 4 right hooks
- [ ] Garantir que right hooks não concentram na mesma semana

### Step 3: Mapear Padrão Semanal
- [ ] Qual dia melhor desempenho? (ex: Tuesday 10am, Thursday 9pm)
- [ ] Variar formatos na semana (ex: Mon=reel, Wed=carousel, Fri=post)
- [ ] Considerar Soap Opera Sequence (histórias contínuas que se desdobram)

### Step 4: Designar Temas por Pilar
- [ ] Para cada post: qual pilar? Qual formato? Qual tema?
- [ ] Anotar qual core message será referenciada
- [ ] Incluir notas para @copywriter (ex: "use hook #3 da estratégia")

### Step 5: Considerar Flexibilidade
- [ ] Deixar 1-2 slots vazios para trending content (@trend-researcher prioridade)
- [ ] Deixar espaço para pivô se performance data pedir

### Step 6: Validar Dosagem
- [ ] Não fazer "tudo oferta" em uma semana
- [ ] Não fazer "tudo educação" em outra
- [ ] Mix variado e sustentável

## Output

Entregar um arquivo chamado **`calendar-{mes-ano}.md`** com:

```markdown
# Content Calendar — [Mês/Ano]

## Distribution Summary
- **Total Posts:** [número]
- **Pillar Distribution:** [40% educação, 30% social proof, 30% offer]
- **Jab vs Hook:** [80% value posts, 20% sales posts]
- **Format Mix:** [X% reel, X% carousel, X% post]

---

## Week 1 — [Datas]

| Day | Time | Format | Pillar | Theme | Core Message | Notes |
|-----|------|--------|--------|-------|--------------|-------|
| Mon | 9am | Reel | Education | [tema] | Message #1 | Use hook type #3 |
| Wed | 6pm | Carousel | Social Proof | [tema] | Message #2 | Personal story |
| Fri | 10am | Post | Offer | [tema] | Message #3 | CTA: Link na bio |

### Sequence Theme (Soap Opera Sequence)
[Se há uma sequência contínua essa semana: descrever o arco]

---

## Week 2 — [Datas]

[Similar structure]

---

## Week 3 — [Datas]

[Similar structure]

---

## Week 4 — [Datas]

[Similar structure]

---

## Framework Analysis

### Jab Jab Right Hook Distribution
- **Jabs (Value):** [X posts, datas]
- **Right Hooks (Offer):** [X posts, datas]
- **Balance Check:** ✅ (80/20 rule being followed?)

### Content Pillar Adherence
| Pillar | Target % | Actual # | Actual % | ✅/⚠️ |
|--------|----------|----------|----------|------|
| Education | 40% | 8 | 40% | ✅ |
| Social Proof | 30% | 6 | 30% | ✅ |
| Offer | 30% | 6 | 30% | ✅ |

### Format Diversity
- **Reels:** [X] — High engagement, short-form
- **Carousels:** [X] — Educational, higher quality
- **Posts:** [X] — Personal, conversational

---

## Trends & Flexibility
- **Trending Slots:** [Deixar 2 slots livres para @trend-researcher]
- **Flexible Buffer:** [Semana X tem flexibilidade se dados mudar]

---

## Success Checklist
- [ ] Pillar distribution está 80%+ alinhada com target
- [ ] Jab/Right Hook em 80/20
- [ ] Cada dia tem timing otimizado
- [ ] Temas variados e relevantes
- [ ] @copywriter tem notas suficientes
- [ ] Mix de formatos

---

## Próximos Passos
- [ ] @copywriter: `write-caption` para cada tema
- [ ] @trend-researcher: `find-trends` para slots de trending content
- [ ] @analytics-agent: `analyze-performance` (depois de rodado)

---

## Meta-informações
- Criado em: [data]
- Válido até: [data + 30 dias]
- Baseado em: {handle}-strategy-document.md
```

## Frameworks Usados
- **Jab Jab Right Hook (Gary Vaynerchuk):** 80% value, 20% sales
- **Content Pillars:** Distribuição balanceada
- **Soap Opera Sequence (Russell Brunson):** Histórias que se desdobram
- **Timing Optimization:** Baseado em dados históricos

## Sucesso Significa
✅ Calendário completo de 4 semanas  
✅ 80/20 jab/right hook respeitado  
✅ Distribuição de pillars alinhada (±10%)  
✅ Timing e formato variado  
✅ Notas para @copywriter claras e acionáveis
