# Task: Write CTA

## Agente
**Copywriter**

## Descrição
Cria CTAs (Calls to Action) específicas por objetivo do post. Diferentes objetivos (leads, sales, engagement, awareness) requerem diferentes chamadas — este task estrutura essa lógica.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (para context de ofertas, core messages)
2. Tipo de CTA desejado:
   - awareness (objetivo: mais seguidores)
   - engagement (objetivo: comentários, saves)
   - lead-gen (objetivo: coletar email)
   - sales (objetivo: venda direto)
3. Formato (reel, carousel, post, story)
4. Oferta específica (se vender: qual? preço?)
```

## Steps

### Step 1: Mapear Objetivo → Ação
- [ ] **Awareness:** CTA = "Siga para mais dicas"
- [ ] **Engagement:** CTA = "Responda nos comentários", "Marque um amigo"
- [ ] **Lead Gen:** CTA = "Clique no link", "Envie DM", "Visite o link na bio"
- [ ] **Sales:** CTA = "Clique aqui", "Últimas vagas", "Link na bio"

### Step 2: Aplicar Value Equation (Hormozi)
- [ ] Para cada CTA: qual é o VALUE que oferecemos?
- [ ] Quanto de ESFORÇO pedimos? (comentar é low effort, clicar link é medium, comprar é high)
- [ ] CTA deve ter valor ≥ esforço pedido

### Step 3: Criar 3 Variações de Frase
- [ ] **Formal/Direto:** "Clique aqui"
- [ ] **Curiosidade:** "Vem descobrir"
- [ ] **Benefício:** "Conseguir sua lista agora"

### Step 4: Considerar Urgência/Escassez (se aplicável)
- [ ] **Urgência:** "Últimas vagas", "Essa semana apenas"
- [ ] **Escassez:** "Limitado a X pessoas", "Preço vai subir"
- [ ] **IMPORTANTE:** Usar apenas se verdade, senão cria desconfiança

### Step 5: Estruturar Fluxo Pós-CTA
- [ ] Se clica em link: para onde vai? (landing page? link bio?)
- [ ] Se comenta: vou responder quando?
- [ ] Se envia DM: resposta automática ou manual?

## Output

Entregar um arquivo chamado **`cta-{objetivo}-{data}.md`** com:

```markdown
# CTA Strategy — [Objetivo] — [Data]

## Contexto
- **Objetivo Principal:** [awareness | engagement | lead-gen | sales]
- **Oferta (se aplicável):** [descrição]
- **Preço (se aplicável):** [valor]
- **Post Format:** [reel | carousel | post | story]

---

## Value Analysis (Hormozi)
- **Value Offered:** [o que customer ganha?]
- **Effort Required:** [low | medium | high]
- **Value Score:** [Value ÷ Effort = score]
- **Insight:** [Value >= Effort? Está balanceado?]

---

## 3 CTA Variations

### CTA 1 — Direct/Formal
**Text:**
> [CTA exato]

**Best For:** [audience tipo X] / [post format Y]  
**Psychology:** [por que funciona — comando claro, sem ambiguidade]

### CTA 2 — Curiosity/Casual
**Text:**
> [CTA exato]

**Best For:** [audience tipo X] / [post format Y]  
**Psychology:** [por que funciona — deixa aberto, convida, entertain]

### CTA 3 — Benefit-Driven
**Text:**
> [CTA exato]

**Best For:** [audience tipo X] / [post format Y]  
**Psychology:** [por que funciona — mostra resultado, motiva ação]

---

## Urgency/Scarcity (se houver)

### Option 1 — Soft Urgency
**Text:** "Essa semana apenas" / "Oferta especial até amanhã"  
**Truth Check:** ✅ (Verdade? Sim/Não)

### Option 2 — Soft Scarcity
**Text:** "Limitado a X spots" / "Vagas restantes: [N]"  
**Truth Check:** ✅ (Verdade? Sim/Não)

---

## Post-Click Flow

### If URL/Link CTA
- **Link:** [exato URL ou "Link na bio"]
- **Landing Page:** [descrição do que vai ver]
- **Expected Conversion Rate:** [seu histórico]
- **Follow-up:** [email? DM? nada?]

### If Comment CTA
- **Response Time:** [quando você responde?]
- **Response Template:** [ex: "Ótima pergunta! A resposta é..."]
- **How to Use Responses:** [Lead-gen? Engagement boost?]

### If DM CTA
- **Auto-response:** [sim/não]
- **Auto-response Text:** [mensagem automática]
- **Follow-up:** [quando você responde manual?]

---

## Framework Analysis
| CTA Variant | Objective Alignment | Effort Match | Psychology | Score |
|---|---|---|---|---|
| 1 | [✅/⚠️] | [✅/⚠️] | [força da persuasão] | [score] |
| 2 | [✅/⚠️] | [✅/⚠️] | [força da persuasão] | [score] |
| 3 | [✅/⚠️] | [✅/⚠️] | [força da persuasão] | [score] |

## Recomendação
**Use CTA #[X]** porque:
- Melhor alinhamento com objetivo
- Melhor match entre value e effort
- Histórico de performance

## Testing Notes
[Se testado antes: qual teve melhor performance? Por quê?]
```

## Frameworks Usados
- **Value Equation (Hormozi):** Value ≥ Effort required
- **AIDA (Halbert):** Action component da sequência

## Sucesso Significa
✅ 3 variações de CTA oferecidas  
✅ Análise Value/Effort para cada  
✅ Fluxo pós-CTA definido (onde vai, o que acontece depois)  
✅ Pronto para testar em posts reais
