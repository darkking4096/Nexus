# Task: Update Strategy

## Agente
**Profile Strategist**

## Descrição
Revisão mensal da estratégia baseada em dados de performance. A estratégia não é imutável — deve evoluir conforme aprendemos o que funciona.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (versão anterior)
2. Performance report do mês anterior (de @analytics-agent)
3. Feedback qualitativo (comentários, perguntas recebidas, tendências observadas)
4. Qualquer mudança no mercado/nicho (novos competitors, trends virais?)
```

## Steps

### Step 1: Revisar Performance vs Expectativa
- [ ] Qual pilar teve melhor engajamento?
- [ ] Qual hook framework funcionou melhor?
- [ ] Qual hook framework decepcionou?
- [ ] Core messages foram reconhecidas pelo público?

### Step 2: Analisar Padrões de Resposta
- [ ] Que tipos de comentários aparecem? (perguntas, validação, críticas)
- [ ] Público está entendendo os 5 core messages?
- [ ] Há alinhamento entre planejado e resultado?

### Step 3: Decisão: Manter, Ajustar ou Pivotar
- [ ] **Manter:** se performance está > expectativa
- [ ] **Ajustar:** se um elemento (pilar, hook, tone) está underperforming (< 50% expectativa)
- [ ] **Pivotar:** se strategy está completamente desalinhada (< 30% expectativa)

### Step 4: Atualizar Componentes
Conforme necessário:
- [ ] Rebalancear % dos content pillars?
- [ ] Substituir 2-3 hook frameworks que não funcionaram?
- [ ] Manter ou revisar os 5 core messages?
- [ ] Timing: melhor dia/horário mudou?

### Step 5: Documentar Learnings
- [ ] O que aprendemos esse mês?
- [ ] Qual framework especialista funcionou melhor? (StoryBrand, Value Eq, HSO?)
- [ ] Que novos insights sobre público conseguimos?

## Output

Entregar um documento chamado **`{handle}-strategy-update-{mes-ano}.md`** com:

```markdown
# Strategy Update — @{handle} — {Mês/Ano}

## Performance Summary
- **Engajamento vs Target:** [atual vs esperado, % diferença]
- **Melhor Performer:** [pilar / hook / post type]
- **Underperformer:** [pilar / hook / post type]

## Key Insights This Month
- [Insight 1]
- [Insight 2]
- [Insight 3]

## Strategy Changes (Se Houver)

### Content Pillars
- [Antes: X% pilar 1] → [Depois: X% pilar 1]
- [Antes: X% pilar 2] → [Depois: X% pilar 2]

### Hook Frameworks
- **Removidas:** [frameworks que não funcionaram]
- **Mantidas:** [frameworks com alto engagement]
- **Adicionadas:** [novas ideias baseadas em dados]

### Core Messages
- **Revisadas?** [sim/não, quais mudaram?]
- **Reconhecidas pelo público?** [evidência]

### Timing & Frequency
- [Antes: X posts/semana] → [Depois: X posts/semana]
- [Antes: melhor hora X] → [Depois: melhor hora X]

## Framework Learning
- **StoryBrand 7-Point:** [O que aprendemos sobre o herói? Problema real?]
- **Value Equation:** [Conversão real vs esperada? Sacrifício era realista?]
- **Hook-Story-Offer:** [Qual tipo de hook ganhou? Por quê?]

## Next Month Recommendations
- [ ] Focar em [elemento que funciona]
- [ ] Testar [nova ideia]
- [ ] Pausar [elemento que não funciona]

## Próximos Passos
- [ ] @copywriter: teste novos hooks (com base em learnings)
- [ ] @content-planner: ajuste calendário com novos %

## Meta-informações
- Data da revisão: [data]
- Válido até: [data + 30 dias]
- Baseado em: [período analisado, ex: 2026-03-01 até 2026-03-31]
```

## Frameworks Usados
- **StoryBrand 7-Point:** Validar se o problema/solução ressoam com público
- **Value Equation:** Avaliar se conversão está acima/abaixo expectativa

## Sucesso Significa
✅ Documento de atualização claro com decisões explicadas  
✅ Decisões baseadas em dados (não opinião)  
✅ Novos hook frameworks propostos se necessário  
✅ Timestamp documentado para rastreabilidade histórica
