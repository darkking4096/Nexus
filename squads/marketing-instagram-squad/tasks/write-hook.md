# Task: Write Hook

## Agente
**Copywriter**

## Descrição
Gera 5 variações de hooks para um tema específico, usando diferentes técnicas de curiosidade e engatilhadores mentais. Hooks são a primeira linha de ataque — precisam fazer parar o scroll.

## Inputs Esperados

```
Precisa de:
1. {handle}-strategy-document.md (para context de audience, core messages)
2. Tema/tópico específico (ex: "Qual é o maior erro em copywriting?")
3. Formato do post (reel, carousel, post)
4. Qual é o objetivo? (curiosidade, problema, resultado, contraste)
5. Oferta/CTA final (se houver)
```

## Steps

### Step 1: Listar 5 Hook Frameworks (da estratégia)
- [ ] Buscar no `{handle}-strategy-document.md` os 10 hook frameworks
- [ ] Selecionar 5 que fazem sentido para este tema
- [ ] Anotar: tipo de cada um (curiosity, problem, result, contraste)

### Step 2: Aplicar Curiosity Gaps
- [ ] **Gap Framework:** Hook abre uma lacuna mental que só se fecha lendo todo o post
- [ ] Ex: "Descobri que..." (não fecha qual é o descoberta)
- [ ] Ex: "99% das pessoas fazem X, mas..." (não explica qual é a alternativa)
- [ ] Ex: "Você está fazendo isso errado. Aqui está por quê..." (não revela o "quê")

### Step 3: Aplicar Pattern Interrupt
- [ ] Hook quebra o padrão esperado
- [ ] Ex: "Não é sobre quantidade de seguidores. É sobre..." (subverte expectativa)
- [ ] Ex: "Todo mundo diz fazer isso. Eu descobri que é o oposto..." (subverte)

### Step 4: Validar Contra Core Messages
- [ ] Cada hook referencia ou sugere uma de seus 5 core messages?
- [ ] Tone está alinhado?

### Step 5: Testar Variação
- [ ] Se possível, anotar qual tipo de audience melhor responde (se dados históricos existem)

## Output

Entregar um arquivo chamado **`hooks-{tema}-{data}.md`** com:

```markdown
# 5 Hook Variations — [Tema] — [Data]

## Theme Context
- **Tema:** [descrição]
- **Core Message Covered:** [qual(is)]
- **Awareness Level Target:** [1-5]
- **Post Format:** [reel | carousel | post]

---

## Hook 1 — Curiosity Gap
**Hook Text:**
> [Hook aqui]

**Why It Works:**
- Usa curiosity gap (abre lacuna que só fecha lendo todo post)
- Pattern interrupt: [qual expectativa quebra?]
- Best for: [que tipo de audience?]

---

## Hook 2 — Problem Identification
**Hook Text:**
> [Hook aqui]

**Why It Works:**
- Identifica problema que audience não sabia que tinha
- Social validation: [por que acreditar?]
- Best for: [Level 1-2 awareness]

---

## Hook 3 — Result/Transformation
**Hook Text:**
> [Hook aqui]

**Why It Works:**
- Mostra resultado/transformação esperada
- FOMO/Desire trigger: [qual emoção ativa?]
- Best for: [Level 3-4 awareness]

---

## Hook 4 — Contraste/Contradiction
**Hook Text:**
> [Hook aqui]

**Why It Works:**
- Contradiz senso comum ("Não é X, é Y")
- Pattern interrupt strength: [baixa | média | alta]
- Best for: [Level 2-3 awareness]

---

## Hook 5 — Storytelling/Narrative
**Hook Text:**
> [Hook aqui]

**Why It Works:**
- Começa uma história que só resolve no corpo do post
- Engagement mechanism: [comment bait | save bait | share bait?]
- Best for: [Level 3-5 awareness]

---

## Framework Analysis

| Hook | Type | Framework Used | Strength | Best Audience |
|------|------|----------------|----------|---------------|
| 1 | Curiosity | [ex: "Você está fazendo errado"] | Alta | Level 2 |
| 2 | Problem | [ex: "Identificar dor"] | Média | Level 1 |
| 3 | Result | [ex: "Transformação"] | Alta | Level 3 |
| 4 | Contraste | [ex: "Subversão"] | Média | Level 2 |
| 5 | Story | [ex: "Narrativa"] | Alta | Level 4 |

## Recomendação
**Melhor para este tema:** Hook #[X], porque [razão]

## Test Notes
[Se rodou antes: qual engagement teve? Qual trouxe mais saves/comments?]

## Próximo Passo
Use hooks em `write-caption` task
```

## Frameworks Usados
- **Curiosity Gaps:** Estruturar lacunas mentais
- **Pattern Interrupt (MrBeast):** Quebra padrão de expectativa
- **5 Levels of Awareness (Schwartz):** Calibrar hook para nível de audience

## Sucesso Significa
✅ 5 hooks oferecidos com variação de técnicas  
✅ Cada hook análise de por que funciona  
✅ Classificação clara: tipo, força, melhor audience  
✅ Pronto para copiar-colar em captions
