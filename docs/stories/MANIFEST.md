# NEXUS Stories Manifest

**Data**: 2026-04-07  
**Total**: 43 stories em 7 épicos  
**Status**: ✅ Draft completo

---

## 📁 Estrutura de Arquivos Criados

```
docs/stories/
├── README.md                    # Overview + próximos passos
├── INDEX.md                     # Timeline completa + status
├── MANIFEST.md                  # Este arquivo
├── Epic 1: Foundation (6 stories)
│   ├── 1.1.story.md            # Project setup
│   ├── 1.2.story.md            # Instagrapi
│   ├── 1.3.story.md            # Playwright
│   ├── 1.4.story.md            # Squad research
│   ├── 1.5.story.md            # EXA search
│   └── 1.6.story.md            # Analytics base
├── Epic 2: Profile Mgmt (5 stories)
│   ├── 2.1.story.md            # Setup wizard
│   ├── 2.2.story.md            # Context config
│   ├── 2.3.story.md            # Competitors
│   ├── 2.4.story.md            # Edit/delete
│   └── 2.5.story.md            # Assets upload
├── Epic 3: Intelligence (10 stories)
│   ├── 3.1.story.md            # Research base
│   ├── 3.2.story.md            # Competitor analysis
│   ├── 3.3.story.md            # History analysis
│   ├── 3.4.story.md            # Analytics module
│   ├── 3.5.story.md            # Caption generation
│   ├── 3.6.story.md            # Visual generation
│   ├── 3.7.story.md            # Carousel
│   ├── 3.8.story.md            # Story generation
│   ├── 3.9.story.md            # Hashtags
│   └── 3.10.story.md           # Output formatting
├── Epic 4: Dual Mode (6 stories)
│   ├── 4.1.story.md            # Manual workflow
│   ├── 4.2.story.md            # Approval UI
│   ├── 4.3.story.md            # Autopilot config
│   ├── 4.4.story.md            # Scheduler
│   ├── 4.5.story.md            # Queue mgmt
│   └── 4.6.story.md            # Mode toggle
├── Epic 5: Publishing (5 stories)
│   ├── 5.1.story.md            # Feed posts
│   ├── 5.2.story.md            # Carousels
│   ├── 5.3.story.md            # Stories
│   ├── 5.4.story.md            # Best time
│   └── 5.5.story.md            # Retry logic
├── Epic 6: Analytics (6 stories)
│   ├── 6.1.story.md            # Dashboard design
│   ├── 6.2.story.md            # Multi-profile view
│   ├── 6.3.story.md            # Post metrics
│   ├── 6.4.story.md            # Engagement analysis
│   ├── 6.5.story.md            # Performance reports
│   └── 6.6.story.md            # AI recommendations
└── Epic 7: Polish (6 stories)
    ├── 7.1.story.md            # E2E testing
    ├── 7.2.story.md            # Performance
    ├── 7.3.story.md            # Security audit
    ├── 7.4.story.md            # Documentation
    ├── 7.5.story.md            # Onboarding
    └── 7.6.story.md            # Launch checklist
```

---

## 🎯 Stories por Epic

### Epic 1: Foundation & Setup (6 stories)
- **1.1** Project Foundation & Local Auth
- **1.2** Instagrapi Integration & Profile Connection
- **1.3** Playwright MCP & Publishing Test
- **1.4** Marketing Instagram Squad Integration (Research)
- **1.5** EXA Web Search Integration
- **1.6** Analytics Base (Instagrapi metrics)

### Epic 2: Profile Management (5 stories)
- **2.1** Profile Setup Wizard
- **2.2** Context Configuration (voice, tone, audience, goals)
- **2.3** Competitor Management
- **2.4** Profile Editing & Deletion
- **2.5** Profile Assets Upload (media, context)

### Epic 3: Intelligence Pipeline (10 stories)
- **3.1** Research Module Base
- **3.2** Competitor Analysis
- **3.3** Profile History Analysis
- **3.4** Analytics Module (Scoring & Insights)
- **3.5** Content Generation Engine (Captions & Hooks)
- **3.6** Visual Generation (Nando Banana)
- **3.7** Carousel Generation (SVG Overlay)
- **3.8** Story Generation (Branding)
- **3.9** Caption & Hashtag Generation
- **3.10** Multi-Format Output

### Epic 4: Dual Mode (6 stories)
- **4.1** Manual Mode Workflow
- **4.2** Approval UI & UX
- **4.3** Autopilot Configuration
- **4.4** Scheduling Engine
- **4.5** Content Queue Management
- **4.6** Mode Toggle & UX

### Epic 5: Publishing & Scheduling (5 stories)
- **5.1** Feed Post Publishing
- **5.2** Carousel Publishing
- **5.3** Story Publishing
- **5.4** Best Time Optimization
- **5.5** Retry & Error Handling

### Epic 6: Analytics & Dashboard (6 stories)
- **6.1** Main Dashboard Design & Layout
- **6.2** Multi-Profile Overview
- **6.3** Per-Post Metrics
- **6.4** Engagement Analysis
- **6.5** Performance Report
- **6.6** AI Recommendations

### Epic 7: Polish & QA (6 stories)
- **7.1** End-to-End Testing
- **7.2** Performance Optimization
- **7.3** Security Audit
- **7.4** Documentation
- **7.5** User Onboarding
- **7.6** Launch Checklist

---

## 🔗 Dependências Entre Stories

### Critical Path (sem estas, resto fica bloqueado)
```
1.1 → 1.2 → 1.3 → 1.4 → 3.1 → 3.4 → 3.10 → 4.1 → 4.2 → 5.1
     ↓
    2.1 → 2.2 → ... (Profile mgmt paralela)
     ↓
    6.1 (Dashboard pode começar dia 1.6)
```

### Parallelizáveis
- Epic 1: Stories 1.4, 1.5, 1.6 podem ser paralelas (após 1.1)
- Epic 2: Stories 2.2-2.5 paralelas após 2.1
- Epic 3: Stories 3.2-3.3 paralelas; depois 3.5-3.10 paralelas
- Epic 4 & 5 & 6: Podem começar antes que Epic 3 termine

---

## 📊 Distribuição de Trabalho

### Por Tipo
- **Backend (@dev)**: 28 stories
- **Frontend (@dev)**: 7 stories  
- **UX Design (@ux-design-expert)**: 5 stories
- **QA (@qa)**: 2 stories
- **PM (@pm)**: 1 story
- **PO (@po)**: Validação de todas

### Por Duração (estimativa)
- **P0 (MUST)**: 26 stories
- **P1 (SHOULD)**: 14 stories
- **P2 (NICE)**: 3 stories

### Por Complexidade
- **Simple (< 8h)**: ~15 stories
- **Medium (8-24h)**: ~20 stories
- **Complex (> 24h)**: ~8 stories

---

## ✅ Checklist Pré-Dev

Antes de começar implementação:

- [ ] @po valida todas as stories (validar 1-3 por dia)
- [ ] @architect revisa arquitectura em 3.x
- [ ] @ux-design-expert prepara wireframes para 4.2, 6.1, 7.5
- [ ] Setup inicial: repo, CI/CD, environments
- [ ] Test accounts prontos (Instagram, etc)
- [ ] MCPs configurados (Playwright, EXA)
- [ ] Equipe onboarded em AIOX + PRD

---

## 🚀 Execution Strategy

### Fase 1: Foundation (Semanas 1-2)
- Parallel: 1.1 (setup) + 1.4 (research) + 1.5 (search)
- Sequence: 1.1 → 1.2 → 1.3 → 1.6
- Result: Base funcional

### Fase 2: Profiles + Research (Semanas 2-4)
- Parallel: Epic 2 (2.1-2.5)
- Parallel: Epic 3 (3.1-3.4)
- Result: Pesquisa funcional

### Fase 3: Generation (Semanas 4-5)
- Sequence: 3.5 (caption) → 3.6 (visual) → 3.7-3.8 → 3.10
- Result: Conteúdo gerado

### Fase 4: Modes + Publishing (Semanas 5-7)
- Parallel: Epic 4 (4.1-4.6) + Epic 5 (5.1-5.5)
- Sequence: 4.1 → 4.2, 5.1 → 5.2 → 5.3
- Result: Manual + Autopilot + publicação

### Fase 5: Analytics + UX (Semanas 7-8)
- Parallel: Epic 6 (6.1-6.6)
- Design-first: 6.1 → 6.2 (backend)
- Result: Dashboard completo

### Fase 6: QA + Polish (Semanas 8-9)
- Sequence: 7.1 (E2E) → 7.3 (security) → 7.2 (perf) → 7.4 (docs)
- Result: MVP pronto para launch

---

## 📖 Como Usar Este Manifest

1. **Para começar**: Leia `README.md`
2. **Para roadmap**: Veja `INDEX.md`
3. **Para implementação**: Comece com `1.1.story.md`
4. **Para planejamento**: Use este arquivo

---

## 🎓 Learning Outcomes

Ao completar todas as stories, você terá aprendido:

- Full-stack JavaScript/TypeScript development
- Security (encryption, auth, tokens)
- Integration com APIs externas
- Browser automation (anti-bot)
- Real-time data sync
- Performance optimization
- UX/UI design patterns
- Automated testing (unit + E2E)
- DevOps & deployment
- AI integration (Claude API)
- Cloud MCPs (Playwright, EXA)

---

## 🔄 Próximos Passos

1. **@po** revisa stories em batches (1.1-1.3, depois 1.4-1.6, etc)
2. **@dev** cria branch e começa com 1.1
3. **@ux-design-expert** prepara designs para 4.2, 6.1
4. **@qa** prepara test infrastructure
5. **@pm** coordena timeline + recursos

---

**Criado por**: @sm (River)  
**Formato**: AIOX Story Format  
**Próxima atualização**: Após validação com @po
