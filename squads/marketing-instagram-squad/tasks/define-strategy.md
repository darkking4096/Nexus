# Task: Define Strategy

## Agente
**Profile Strategist**

## Descrição
Transforma o brief de onboarding em uma estratégia completa e executável. Esta task cria o "blueprint" que todos os outros agentes usarão. É a decisão arquitetural do perfil.

## Inputs Esperados

```
Precisa de:
1. Arquivo {handle}-onboarding-brief.md (output da task anterior)
2. config/profile-context.yaml (parcialmente preenchido, será completado)
3. Link para inspiração accounts (handles de competidores / accounts admiradas)
```

## Steps

### Step 1: Estruturar com StoryBrand 7-Point
- [ ] **Herói:** Descrever a persona do público (como já feito em onboarding)
- [ ] **Problema:** O que o frustra/dói? (problema externo, interno, filosófico)
- [ ] **Guia:** Quem é você/seu perfil nesta história? Como você ajuda?
- [ ] **Plano:** Qual é o caminho que você oferece? (3-5 passos)
- [ ] **CTA:** Qual é a ação primeiro (seguir, visitar link, responder story?)
- [ ] **Sucesso:** Como o herói se vê após seguir seu conselho?
- [ ] **Fracasso:** O que acontece se NÃO seguir seu conselho?

### Step 2: Aplicar Value Equation (Alex Hormozi)
- [ ] **Desejo:** Quantificar o que o público quer (ex: "5kg, 6 meses")
- [ ] **Conversão:** Como seu conteúdo converte desire em crença? (social proof, exemplos)
- [ ] **Tempo:** Quanto tempo demora a transformação? (realista)
- [ ] **Sacrifício:** Qual é o esforço/custo esperado? (seja honesto)
- [ ] **Value = Desejo × Conversão / (Tempo × Sacrifício)**

### Step 3: Mapear Content Pillars (proporção)
- [ ] Definir 3-4 pillars principais (temas recorrentes)
- [ ] Para cada pilar: qual é o % de posts? (ex: 40% educação, 30% social proof, 30% offer)
- [ ] Documentar: qual pilar alimenta qual oferta?

### Step 4: Definir 5 Core Messages
- [ ] Que verdades você quer que seu público acredite?
- [ ] Ex: "Direct response funciona melhor que brand awareness" (se copwriting)
- [ ] Ex: "Flexibilidade é mais importante que força bruta" (se fitness)
- [ ] Estas 5 mensagens guiam TODOS os posts, captions, hooks

### Step 5: Esboçar Sequência de Hooks + Formatos
- [ ] Qual formato rola mais no seu nicho? (reels, carrosseis, posts)
- [ ] Que hooks funcionam para sua audiência? (curiosidade, problema, resultado)
- [ ] Criar 10 "hook frameworks" prontos para reutilizar

### Step 6: Recomendações de Frequência e Timing
- [ ] Quantos posts por semana? (baseado em capacidade)
- [ ] Que dias/horários melhor alcance?
- [ ] Qual é o mix ideal? (ex: 50% reel, 30% carousel, 20% post)

## Output

Entregar um documento completo chamado **`{handle}-strategy-document.md`** com:

```markdown
# Strategy Document — @{handle}

## StoryBrand 7-Point
- **Herói:** [Persona do público, aspirações]
- **Problema (Externo):** [O que o incomoda? Ex: "Não consigo gerar leads"]
- **Problema (Interno):** [Como se sente? Ex: "Inseguro, frustrado"]
- **Problema (Filosófico):** [O que acredita estar errado? Ex: "A maioria gasta em ads inúteis"]
- **Guia (Empatia):** [Você já sentiu/superou isso? Briefing pessoal]
- **Guia (Autoridade):** [Por que acreditar em você? Prova, credenciais, track record]
- **Plano (Passo 1):** [Ex: "Entender seu público"]
- **Plano (Passo 2):** [Ex: "Testar 3 hooks diferentes"]
- **Plano (Passo 3):** [Ex: "Iterar baseado em dados"]
- **CTA (Primeira Ação):** [Ex: "Siga + responda o story"]
- **Sucesso (If They Follow):** [Transformação esperada]
- **Fracasso (If They Don't):** [O que não muda]

## Value Equation (Hormozi)
- **Desejo Específico:** [Ex: "10k seguidores em 6 meses"]
- **Como Você Converte Desire:** [Ex: "Mostro passo-a-passo que usei, case studies"]
- **Tempo Realista:** [Ex: "6 meses com 4 posts/semana"]
- **Sacrifício Esperado:** [Ex: "30 min/dia para criar + publicar"]
- **Value Score:** [(Desejo × Conversão) / (Tempo × Sacrifício)]

## Content Pillars
- **Pilar 1: [Nome]** — XX% dos posts
  - Descrição: [O que entrega]
  - Exemplo de post: [Tema ou descrição]
  
- **Pilar 2: [Nome]** — XX% dos posts
  - Descrição: [O que entrega]
  - Exemplo de post: [Tema ou descrição]
  
- **Pilar 3: [Nome]** — XX% dos posts
  - Descrição: [O que entrega]
  - Exemplo de post: [Tema ou descrição]

(+ 4o pilar se aplicável)

## 5 Core Messages (Verdades)
1. "[Mensagem 1]"
2. "[Mensagem 2]"
3. "[Mensagem 3]"
4. "[Mensagem 4]"
5. "[Mensagem 5]"

*Todas as captions referenciarão uma destas 5 mensagens*

## 10 Hook Frameworks Ready-to-Use
1. Hook Type: [ex: curiosity] — "Todos fazem X, mas..."
2. Hook Type: [ex: problem] — "Você faz X? Erro #1 das people é..."
3. Hook Type: [ex: result] — "Consegui X em Y dias com..."
... (até 10)

## Recomendações Operacionais
- **Frequência:** X posts por semana
- **Melhor Timing:** [Dias/Horários]
- **Mix Ideal:** X% reels, X% carrosséis, X% posts
- **Capacidade Sustentável:** [realista]

## Próximos Passos
- [ ] @copywriter: write-caption (5 primeiras captions baseadas em pillars)
- [ ] @content-planner: create-calendar (4 semanas usando pillars + frameworks)

## Meta-informações
- Criado em: [data]
- Válido até: [data + 30 dias, quando reviewar]
- Baseado em: {handle}-onboarding-brief.md
```

## Frameworks Usados
- **StoryBrand 7-Point (Donald Miller):** Estrutura narrativa do posicionamento
- **Value Equation (Alex Hormozi):** Quantifica o valor oferecido
- **Hook-Story-Offer (Russell Brunson):** Estrutura de sequência de posts

## Sucesso Significa
✅ Documento claro e actionable para os outros agentes  
✅ Todos os 7 pontos do StoryBrand preenchidos  
✅ Content Pillars com % definidos  
✅ 5 Core Messages que guiarão todas as captions  
✅ 10 Hook Frameworks prontos para uso imediato
