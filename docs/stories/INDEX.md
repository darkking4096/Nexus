# NEXUS Stories Index

**Roadmap**: 7 Épicos, 43 Stories  
**Current Status**: All stories drafted ✅

---

## 📊 Story Timeline

### Epic 1: Foundation & Setup (Weeks 1-2)
🎯 **Objetivo**: Estrutura base + autenticação + integração com Instagram

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 1.1 | Project Foundation & Local Auth | Draft | @dev | — |
| 1.2 | Instagrapi Integration & Profile Connection | Draft | @dev | 1.1 |
| 1.3 | Playwright MCP & Publishing Test | Draft | @dev | 1.1, 1.2 |
| 1.4 | Marketing Squad Integration (Research) | Draft | @dev | 1.1, 1.2 |
| 1.5 | EXA Web Search Integration | Draft | @dev | 1.1 |
| 1.6 | Analytics Base (Instagrapi metrics) | Draft | @dev | 1.2 |

---

### Epic 2: Profile Management (Weeks 2-3)
🎯 **Objetivo**: Conectar, configurar e gerenciar perfis clientes

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 2.1 | Profile Setup Wizard | Draft | @dev | 1.1, 1.2 |
| 2.2 | Context Configuration (voice, tone, audience) | Draft | @dev | 2.1 |
| 2.3 | Competitor Management | Draft | @dev | 2.1 |
| 2.4 | Profile Editing & Deletion | Draft | @dev | 2.1 |
| 2.5 | Profile Assets Upload (media, context) | Draft | @dev | 2.1 |

---

### Epic 3: Intelligence Pipeline (Weeks 3-5)
🎯 **Objetivo**: Pesquisa → Análise → Geração de conteúdo

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 3.1 | Research Module Base | Draft | @dev | 1.4, 1.5 |
| 3.2 | Competitor Analysis | Draft | @dev | 3.1, 2.3 |
| 3.3 | Profile History Analysis | Draft | @dev | 3.1, 1.6 |
| 3.4 | Analytics Module (scoring) | Draft | @dev | 3.1, 3.2, 3.3 |
| 3.5 | Content Generation Engine | Draft | @dev | 3.4 |
| 3.6 | Visual Generation (Nando Banana) | Draft | @dev | 3.4 |
| 3.7 | Carousel Generation (SVG overlay) | Draft | @dev | 3.6 |
| 3.8 | Story Generation (branding) | Draft | @dev | 3.6 |
| 3.9 | Caption & Hashtag Generation | Draft | @dev | 3.5 |
| 3.10 | Multi-Format Output | Draft | @dev | 3.5, 3.6, 3.7, 3.8, 3.9 |

---

### Epic 4: Dual Mode (Weeks 5-6)
🎯 **Objetivo**: Modo Manual com aprovações + Modo Autopilot

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 4.1 | Manual Mode Workflow | Draft | @dev | 3.10 |
| 4.2 | Approval UI & UX | Draft | @ux-design-expert | 4.1 |
| 4.3 | Autopilot Configuration | Draft | @dev | 3.10 |
| 4.4 | Scheduling Engine | Draft | @dev | 4.3 |
| 4.5 | Content Queue Management | Draft | @dev | 4.4 |
| 4.6 | Mode Toggle & UX | Draft | @ux-design-expert | 4.1, 4.3 |

---

### Epic 5: Publishing & Scheduling (Weeks 6-7)
🎯 **Objetivo**: Publicação segura via Playwright + agendamento inteligente

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 5.1 | Feed Post Publishing | Draft | @dev | 1.3 |
| 5.2 | Carousel Publishing | Draft | @dev | 1.3, 3.7 |
| 5.3 | Story Publishing | Draft | @dev | 1.3, 3.8 |
| 5.4 | Best Time Optimization | Draft | @dev | 1.6 |
| 5.5 | Retry & Error Handling | Draft | @dev | 5.1 |

---

### Epic 6: Analytics & Dashboard (Weeks 7-8)
🎯 **Objetivo**: Métricas e insights via Instagrapi + recomendações

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 6.1 | Main Dashboard Design | Draft | @ux-design-expert | 1.6 |
| 6.2 | Multi-Profile Overview | Draft | @dev | 6.1, 1.6 |
| 6.3 | Per-Post Metrics | Draft | @dev | 1.6 |
| 6.4 | Engagement Analysis | Draft | @dev | 6.3 |
| 6.5 | Performance Report | Draft | @dev | 6.4 |
| 6.6 | AI Recommendations | Draft | @dev | 6.4, 6.5 |

---

### Epic 7: Polish & QA (Weeks 8-9)
🎯 **Objetivo**: Bug fixes, performance, documentação, launch

| ID | Título | Status | Owner | Depends On |
|----|--------|--------|-------|-----------|
| 7.1 | End-to-End Testing | Draft | @qa | All |
| 7.2 | Performance Optimization | Draft | @dev | All |
| 7.3 | Security Audit | Draft | @qa | All |
| 7.4 | Documentation | Draft | @dev | All |
| 7.5 | User Onboarding | Draft | @ux-design-expert | 2.1 |
| 7.6 | Launch Checklist | Draft | @pm | All |

---

## 📌 Legend

- **Draft**: Story criada, pronta para discussão com @po
- **Pending**: Aguardando story anterior ser concluída
- **In Progress**: @dev está implementando
- **Review**: Aguardando @qa ou @po
- **Done**: ✅ Completa

---

## 🔗 Próximas Ações

1. **@po**: Revisar stories 1.1, 1.2, 1.3 (validação *validate-story-draft)
2. **@dev**: Se aprovado, começar com story 1.1 (Setup de projeto)
3. **@pm**: Criar epic para Squad de Design Visual (Epic 1 precisa design)

---

## 📖 Convenções de Story

Cada story segue este padrão:
```
# Story X.Y: [Title]
Epic: X
Status: Draft/Pending/In Progress/Review/Done
Owner: @agent

## 📋 Descripción
Contexto + motivação

## 🎯 Critérios de Aceitação
[ ] Checklist de AC

## 📐 Escopo Técnico
Detalhes técnicos + decisões de design

## 📂 File List
Arquivos criados/modificados

## 🚀 Status Tracking
Progress em fases

## Próxima Story
Qual é a próxima naturalmente
```

---

**Last Updated**: 2026-04-07  
**Created By**: @sm (River — Scrum Master)
