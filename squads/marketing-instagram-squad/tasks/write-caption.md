# Task: Write Caption

## Agente
**Copywriter**

## Descrição
Escreve captions de posts usando a estrutura AIDA (Attention, Interest, Desire, Action) combinada com 5 Levels of Awareness de Eugene Schwartz. Cada caption é uma mini-sequência de persuasão.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (para context de core messages, voice, pillars)
2. Tema/tópico do post (ex: "5 níveis de consciência em copywriting")
3. Formato (reel, carousel, post)
4. Awareness level do público esperado (1-5)
5. Oferta/CTA desejada (se aplicável)
```

## Steps

### Step 1: Identificar Awareness Level do Público
- [ ] **Level 1 (Unaware):** Não sabe que tem problema. Ex: aspirante que pensa que precisa tráfego, não conversão
- [ ] **Level 2 (Problem Aware):** Sabe o problema, não sabe solução. Ex: "Tenho tráfego mas não converte"
- [ ] **Level 3 (Solution Aware):** Sabe solução, não sabe sua solução. Ex: "Sei que preciso de copy melhor, mas como?"
- [ ] **Level 4 (Product Aware):** Conhece você/produto, quer detalhe. Ex: "Qual é o preço? Quanto tempo dura?"
- [ ] **Level 5 (Most Aware):** Já é cliente/conhece bem, quer atualização. Ex: "Qual é a nova mudança?"
- [ ] Usar nível apropriado para o conteúdo deste post

### Step 2: Estrutura AIDA
- [ ] **Attention (Hook — 1-3 linhas):** Curiosidade, contraste, ou problema
- [ ] **Interest (Story — 2-4 linhas):** Contexto, prova social, ou exemplo
- [ ] **Desire (Transformation — 2-4 linhas):** Resultado, benefício, transformação esperada
- [ ] **Action (CTA — 1 linha):** Ação específica (comentar, seguir, visitar link, responder story)

### Step 3: Validação Contra Core Messages
- [ ] Caption referencia uma (ou mais) de seus 5 core messages?
- [ ] Tone está alinhado com estratégia?
- [ ] Faz sentido no pilar que foi planejado?

### Step 4: Criar 3 Variações de CTA
- [ ] **CTA 1 (Direct):** "Siga para não perder" / "Responda: qual?"
- [ ] **CTA 2 (Curiosity):** "Vi isso funcionando..." / "Tenho 1 pergunta..."
- [ ] **CTA 3 (Benefit):** "Economizei XXX com isso" / "Achei que..."

## Output

Entregar um arquivo chamado **`caption-{data}-{tema}.md`** com:

```markdown
# Caption — [Tema/Post] — [Data]

## Estrutura (AIDA)

### Attention (Hook)
[1-3 linhas de hook direto]

### Interest (Story)
[2-4 linhas de contexto / prova / exemplo]

### Desire (Transformation)
[2-4 linhas de resultado esperado / transformação]

### Action (CTA)
[1 linha de ação específica]

---

## Variações de CTA

### CTA 1 — Direct
[CTA direto]

### CTA 2 — Curiosity
[CTA curiosidade]

### CTA 3 — Benefit
[CTA baseado em benefício]

---

## Metadados
- **Post Type:** [reel | carousel | post]
- **Content Pillar:** [qual dos pillars]
- **Core Message:** [qual das 5]
- **Awareness Level:** [1-5]
- **Calls to Action Count:** [quantas CTAs há no corpo da caption]
- **Word Count:** [total]
- **Reading Time:** [~X minutos]

## Notas
[Qualquer observação: tom usado, frameworks aplicados, why este hook]

## Recomendações
- Melhor horário: [baseado em análise histórica]
- Melhor formato: [reel vai performar mais que carousel, baseado em dados]
```

## Frameworks Usados
- **5 Levels of Awareness (Eugene Schwartz):** Estruturar nível de consciência
- **AIDA (Gary Halbert):** Estrutura da caption
- **Curiosity Gaps:** Criar tensão entre problema e solução

## Sucesso Significa
✅ Caption segue estrutura AIDA completa  
✅ Referencia um dos 5 core messages  
✅ Tom alinhado com estratégia  
✅ 3 variações de CTA oferecidas  
✅ Awareness level considerado
