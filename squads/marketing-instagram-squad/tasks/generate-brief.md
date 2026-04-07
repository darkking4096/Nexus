# Task: Generate Brief

## Agente
**Content Planner**

## Descrição
Cria um brief detalhado para um post específico, funcionando como "briefing executivo" que @copywriter e @designer/video-editor usam. Transforma "Tema: educação sobre copywriting" em "Aqui está o brief específico: hook type, tom, CTA, inspirações, formato".

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (core messages, pillars, voice)
2. calendar-{mes-ano}.md (linha específica do post)
3. Tema do post (ex: "5 níveis de consciência em copywriting")
4. Formato (reel, carousel, post)
5. Objetivos do post (engagement, awareness, leads?)
6. Dados históricos (se houver: como posts similares performaram?)
```

## Steps

### Step 1: Expandir Contexto do Tema
- [ ] Qual é a pergunta/problema que este post resolve?
- [ ] Qual é a transformação esperada? (conhecimento, insight, resultado)
- [ ] Por que é importante para seu público agora?

### Step 2: Definir Estratégia Micro
- [ ] Qual hook da estratégia usar?
- [ ] Qual core message será o fio condutor?
- [ ] Qual nível de awareness (1-5)?
- [ ] Qual é a CTA final?

### Step 3: Estruturar por Formato
- [ ] **Se reel:** storyboard de 5-7 cenas + áudio + hooks entre cenas
- [ ] **Se carousel:** 5-10 slides com progression lógica
- [ ] **Se post:** parágrafo 1, body, CTA com proporção

### Step 4: Inspirações Visuais/Referenciais
- [ ] Que posts similares funcionaram bem?
- [ ] Qual é a "mood" esperada? (motivacional, educativo, divertido?)
- [ ] Qual designer/creator tem estilo parecido?

### Step 5: Definir KPIs Esperados
- [ ] Este post deve gerar 50+ comments? 1k saves? 10k views?
- [ ] Baseado em historical performance de posts similares

## Output

Entregar um arquivo chamado **`brief-{tema}-{data}.md`** com:

```markdown
# Content Brief — [Tema] — [Data]

## Overview
- **Objetivo do Post:** [awareness | engagement | lead-gen | sales]
- **Tema:** [descrição]
- **Formato:** [reel | carousel | post]
- **Core Message:** [qual das 5]
- **Pilar:** [qual dos content pillars]

---

## Contexto & Why Now
**Pergunta que resolve:**
> [Qual pergunta/problema este post responde?]

**Transformação esperada:**
> [O que o audience saberá/acreditará depois?]

**Por que agora:**
> [Trends, seasonality, lógica sequencial na calendar]

---

## Estratégia Micro

### Hook Strategy
- **Hook Type:** [ex: curiosity gap]
- **Hook Text:** [sugestão de hook, ou direção]
- **Why It Works:** [por que funciona para este tema]

### Core Message
- **Message:** [qual das 5]
- **How to Reference:** [subtly ou explicitly?]

### Awareness Level
- **Target Level:** [1-5]
- **Language Calibration:** [muy technical? super simple?]

### CTA Strategy
- **Primary CTA:** [ex: "Salve essa para depois"]
- **Secondary CTA:** [ex: "Comente qual dos 5 você faz"]

---

## Format-Specific Brief

### [Se Reel]
**Storyboard:**
- Scene 1 (0-2s): [descrição + áudio cue]
- Scene 2 (2-5s): [descrição + áudio cue]
- Scene 3 (5-8s): [descrição + áudio cue]
- Scene 4 (8-12s): [descrição + áudio cue]
- Scene 5 (12-15s): [CTA scene]

**Visual Style:** [mood description]  
**Audio:** [song title, tempo, vibe]  
**Text Overlays:** [onde colocar hook, core message, CTA]

### [Se Carousel]
**Slide Progression:**
1. Hook slide (Curiosity/Problem)
2. Context slide (Story/Proof)
3. [Middle slides — 2-3 valor puro]
4. Transformation slide (Resultado)
5. CTA slide (Ação)

**Visual Consistency:** [cor, font, estilo]  
**Proporção Texto:** [muito texto? pouco? balanced?]

### [Se Post]
**Body Structure:**
- **P1 (Hook):** [1-3 linhas, grab attention]
- **Body (Value):** [2-4 parágrafos, educação/prova]
- **Closing:** [transformação esperada]
- **CTA:** [linha final]

**Character Count:** [limite para Instagram]

---

## Visual Inspirations

### Reference Accounts
- [@account_1](link) — por quê [visual style, tone match]
- [@account_2](link) — por quê [visual style, tone match]

### Color/Mood Palette
- **Primary Colors:** [RGB codes se conhecer]
- **Mood:** [energetic | calm | professional | playful]

---

## Success Metrics
- **Expected Engagement Rate:** [X% baseado em histórico]
- **Expected Saves:** [X estimado]
- **Expected Comments:** [Y estimado]
- **Success Threshold:** [qual é o "OK"? qual é "Great"?]

---

## Checklist for Creator
- [ ] Hook definido (can copypaste a variação)
- [ ] Core message clara
- [ ] CTA específico (não genérico)
- [ ] Inspirações visuais referenciadas
- [ ] Formato específico esclarecido
- [ ] Contexto do por quê deste tema

---

## Meta-informações
- Criado em: [data]
- Para: [quando publicar — date/day/time]
- Baseado em: calendar-{mes-ano}.md line [N]
```

## Frameworks Usados
- **StoryBrand 7-Point:** Estrutura do narrativa (se aplicável)
- **Hook-Story-Offer (Brunson):** Progressão lógica
- **Content Pillars:** Alinhamento ao pilar

## Sucesso Significa
✅ Brief claro o suficiente para @copywriter colar e escrever  
✅ Inspirações visuais específicas (não genéricas)  
✅ KPIs esperados definidos  
✅ Contexto do "por quê" documentado  
✅ Formato específico (não ambíguo)
