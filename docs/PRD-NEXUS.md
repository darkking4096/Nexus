# NEXUS — Product Requirements Document (PRD)

**Data de Criação**: 2026-04-07  
**Status**: ✅ VALIDADO  
**Proprietário**: Você (Gestor/Operador)  
**Versão**: 1.0 (Revisado: 2026-04-07)

---

## 1. Visão Executiva

**NEXUS** é uma plataforma pessoal (não SaaS) que centraliza o gerenciamento automatizado de múltiplos perfis do Instagram. O objetivo é permitir que um gestor de redes sociais (agência ou freelancer) administre todos os seus perfis clientes em um único lugar, com geração de conteúdo inteligente, análise profunda e publicação automatizada.

### Diferencial Competitivo
- **Inteligência em camadas**: Pesquisa → Análise → Geração (não é IA genérica)
- **Modo duplo**: Autopilot (totalmente automático) e Manual (com aprovação a cada passo)
- **Frameworks de especialistas**: Usa metodologias de Alex Hormozi, Russell Brunson, Gary Vaynerchuk, etc.
- **Publicação segura**: Playwright via MCP simula usuário real (zero detecção como robô)

---

## 2. Escopo & Definições

### Escopo Incluído (MVP)

#### Core Features
1. **Gerenciamento de Perfis**
   - Adicionar múltiplos perfis clientes (contas Business/Creator)
   - Conectar via Instagram Graph API + OAuth 2.0
   - Armazenar contexto e configurações por perfil

2. **Geração de Conteúdo (Motor de Inteligência)**
   - **Pesquisa**: Análise de concorrentes, busca web, histórico do perfil
   - **Análise**: Calcular probabilidade de engajamento, alinhamento com objetivos
   - **Geração**: Criar captions/legendas usando frameworks de especialistas
   - **Aprovação**: Em modo Manual, apresentar proposta para aprovação

3. **Criação Visual**
   - Gerar imagens com Nando Banana
   - Criar carrosséis com SVG overlay (copy + visual)
   - Compor stories com identidade do perfil

4. **Agendamento e Publicação**
   - Agendar posts para horários otimizados
   - Publicar via Playwright MCP (feed posts, carousels, stories)
   - Histórico de publicações

5. **Análise e Relatórios**
   - Puxar métricas via Instagrapi (dados estruturados)
   - Análise de performance por post
   - Recomendações de melhoria
   - Dashboard com métricas-chave

### Escopo Excluído (MVP)

- ❌ Multi-usuário / permissões granulares
- ❌ Gerenciamento de equipes
- ❌ Integração com outras redes (TikTok, YouTube, etc.) — só Instagram
- ❌ Community management / respostas automáticas
- ❌ Influencer collaboration features
- ❌ Publicidade / Meta Ads integration

---

## 3. Personas de Usuário

### Persona Principal: Gestor de Redes Sociais
- **Nome**: Marina (exemplo)
- **Idade**: 28-45 anos
- **Profissão**: Gerente de redes sociais em agência ou freelancer
- **Pain Points**:
  - Administra 5-15 perfis clientes
  - Gasta horas por semana criando conteúdo
  - Quer conteúdo profissional, não genérico de IA
  - Precisa de controle total ou automação (modo duplo)
  - Quer saber qual conteúdo vai engajar antes de publicar
- **Goals**:
  - Automatizar criação de conteúdo
  - Aumentar engajamento dos perfis
  - Entregar conteúdo estratégico (não genérico)
  - Economizar tempo (20-30h/mês)
  - Melhorar resultados dos clientes

### Casos de Uso Primários

**Caso 1: Geração de Conteúdo (Manual)**
```
Marina abre NEXUS → Clica "Gerar conteúdo" para perfil X →
NEXUS pesquisa (concorrentes, tendências, histórico) →
Apresenta análise + caption proposto →
Marina aprova ou pede ajustes →
Sistema publica no horário agendado
```

**Caso 2: Publicação Automática (Autopilot)**
```
Marina ativa "Autopilot" para perfil Y →
Configura calendário de publicação (ex: 3x semana) →
NEXUS roda autonomamente: pesquisa → análise → gera → publica →
Marina monitora métricas no dashboard
```

**Caso 3: Análise de Performance**
```
Marina abre dashboard → Vê métricas dos últimos 30 dias →
Identifica qual tipo de conteúdo funciona melhor →
Usa insights para ajustar estratégia dos próximos posts
```

---

## 4. Requisitos Funcionais

### RF1: Autenticação e Conexão de Perfis

**Objetivo**: Permitir que Marina conecte seus perfis clientes do Instagram ao NEXUS de forma segura.

**Requisitos Detalhados**:

| ID | Requisito | Descrição | Prioridade |
|----|-----------|-----------|-----------|
| RF1.1 | Autenticação Local | Usuário cria conta local no NEXUS (email + senha) | MUST |
| RF1.2 | Conectar Perfil | Adicionar perfil cliente (OAuth 2.0 via Instagram Graph API) | MUST |
| RF1.3 | Verificação Business/Creator | Validar que o perfil é Business ou Creator | MUST |
| RF1.4 | Múltiplos Perfis | Suportar no mínimo 10 perfis simultâneos | MUST |
| RF1.5 | Desconectar Perfil | Remover perfil da plataforma (limpar tokens) | SHOULD |
| RF1.6 | Contexto do Perfil | Armazenar voz, tom, público-alvo, objetivos por perfil | MUST |

**Fluxo Técnico**:
```
1. Usuário clica "Adicionar Perfil"
2. Redireciona para OAuth 2.0 do Instagram
3. Usuário autoriza acesso (Instagram Graph API)
4. NEXUS recebe access token
5. Valida que perfil é Business/Creator via Graph API
6. Extrai dados iniciais (bio, followers, category)
7. Salva no SQLite com tokens encriptados (AES-256-GCM)
8. Contexto vazio pronto para preencher
```

### RF2: Pipeline de Inteligência (Pesquisa → Análise → Geração)

**Objetivo**: Implementar o motor de inteligência que diferencia NEXUS de IA genérica.

#### RF2.1: Fase de Pesquisa

| ID | Requisito | Descrição | Fonte de Dados |
|----|-----------|-----------|--------|
| RF2.1.1 | Análise de Concorrentes | Listar perfis concorrentes + analisar top posts | Usuário cadastra URLs / Instagram Graph API |
| RF2.1.2 | Busca Web | Pesquisar tendências do nicho + notícias relevantes | Web Search (MCP: EXA) |
| RF2.1.3 | Histórico do Perfil | Analisar últimos 30-100 posts do próprio perfil | Instagram Graph API (dados estruturados) |
| RF2.1.4 | Análise Profunda | Extrair voz, tom, público-alvo, objetivos | Usuário input + Claude Vision + Graph API |

**Integração com marketing-instagram-squad**:
- `profile-strategist` conduz a análise profunda
- `trend-researcher` pesquisa tendências
- `analytics-agent` analisa histórico

#### RF2.2: Fase de Análise

| ID | Requisito | Descrição | Saída |
|----|-----------|-----------|-------|
| RF2.2.1 | Score de Viralidade | Calcular probabilidade de engajamento/viral | Score 0-100 |
| RF2.2.2 | Alinhamento | Verificar alinhamento com objetivos do perfil | % alignment |
| RF2.2.3 | Insights | Identificar oportunidades de tendência | Lista de insights |
| RF2.2.4 | Recomendação | Sugerir tipo de conteúdo ideal | Tipo + framework |

**Integração com marketing-instagram-squad**:
- `analytics-agent` calcula scores
- `content-planner` define framework ideal

#### RF2.3: Fase de Geração

| ID | Requisito | Descrição | Engine |
|----|-----------|-----------|--------|
| RF2.3.1 | Gerar Caption | Criar legenda usando framework selecionado | Claude Haiku + copywriter |
| RF2.3.2 | Gerar Hooks | Criar 3 opções de hook/CTA | Claude |
| RF2.3.3 | Gerar Hashtags | Criar 10-15 hashtags relevantes | Claude |
| RF2.3.4 | Gerar Imagem | Criar visual com Nando Banana | Nando Banana API + sharp |

**Integração com marketing-instagram-squad**:
- `copywriter` gera captions com frameworks
- `trend-researcher` valida relevância

### RF3: Modos de Operação (Autopilot vs Manual)

**Objetivo**: Permitir que Marina alterne entre automático total e controle manual.

#### RF3.1: Modo Autopilot 🤖

| ID | Requisito | Comportamento |
|----|-----------|---------------|
| RF3.1.1 | Auto-Pesquisa | Sistema pesquisa autonomamente |
| RF3.1.2 | Auto-Análise | Sistema analisa sem intervenção |
| RF3.1.3 | Auto-Geração | Sistema gera conteúdo |
| RF3.1.4 | Auto-Publicação | Sistema publica no horário agendado |
| RF3.1.5 | Sem Aprovação | Zero passos de aprovação manual |

**Configuração**:
- Toggle por perfil
- Calendário de publicação (dias e horários)
- Intervalo entre posts (ex: 3x semana)

#### RF3.2: Modo Manual ✋

| ID | Requisito | Comportamento |
|----|-----------|---------------|
| RF3.2.1 | Aprovação de Pesquisa | Usuário vê análise de pesquisa, aprova continuar |
| RF3.2.2 | Aprovação de Análise | Usuário vê scores e recomendações, aprova |
| RF3.2.3 | Aprovação de Caption | Usuário vê proposta, aprova/edita/descarta |
| RF3.2.4 | Aprovação de Visual | Usuário vê imagem, aprova/regenera |
| RF3.2.5 | Aprovação de Publicação | Usuário aprova antes de publicar |

**Fluxo**:
```
Usuário clica "Gerar" →
[Pesquisa] Espera aprovação →
[Análise] Espera aprovação →
[Caption] Espera aprovação →
[Visual] Espera aprovação →
[Publicação] Espera aprovação →
Post ao vivo
```

### RF4: Criação Visual

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF4.1 | Feed Post Image | Gerar imagem com Nando Banana |
| RF4.2 | Carousel Slide | Gerar N slides com copy em SVG overlay |
| RF4.3 | Story Frame | Gerar story (1080x1920) com identidade do perfil |
| RF4.4 | Brand Colors | Usar palheta de cores do perfil |
| RF4.5 | Text Composition | Overlay de texto com contraste garantido |

**Integração**:
- Nando Banana API para geração de base
- sharp para processamento
- SVG overlay para text + styling

### RF5: Agendamento e Publicação

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RF5.1 | Schedule Post | Agendar feed post para data/hora específica |
| RF5.2 | Best Time | Sugerir horário otimizado (com base em histórico) |
| RF5.3 | Publish | Publicar via Playwright MCP (feed, carousel, story) |
| RF5.4 | History | Manter histórico de todas as publicações |
| RF5.5 | Retry | Retentar publicação se falhar (max 3x) |

### RF6: Analytics e Relatórios

| ID | Requisito | Descrição | Atualização |
|----|-----------|-----------|-------------|
| RF6.1 | Dashboard | Visão geral de todos os perfis + KPIs | Real-time via Instagrapi |
| RF6.2 | Metrics per Post | Likes, comments, shares, saves, reach | 24h após publicação |
| RF6.3 | Engagement Rate | ER% por post e por período | Diário |
| RF6.4 | Top Performing | Quais tipos de conteúdo performam melhor | Semanal |
| RF6.5 | Growth | Acompanhamento de crescimento (followers) | Semanal |
| RF6.6 | Recommendations | Sugestões de melhoria baseadas em dados | Após cada relatório |

---

## 5. Requisitos Não-Funcionais

### RNF1: Segurança

| ID | Requisito | Padrão |
|----|-----------|--------|
| RNF1.1 | OAuth 2.0 | Usar OAuth 2.0 para autenticação Instagram |
| RNF1.2 | HTTPS | Toda comunicação criptografada |
| RNF1.3 | Token Refresh | Refresh tokens automaticamente |
| RNF1.4 | Segurança de Credenciais | Armazenar credenciais com AES-256-GCM, NUNCA em plaintext |
| RNF1.5 | Dados Pessoais | Cumprir LGPD/GDPR para dados de usuários |

### RNF2: Performance

| ID | Requisito | Limite |
|----|-----------|--------|
| RNF2.1 | Load Dashboard | < 2s |
| RNF2.2 | Generate Content | < 30s (após análise do squad; análise paralela) |
| RNF2.3 | API Response | < 1s para calls simples |
| RNF2.4 | Database Query | < 500ms |
| RNF2.5 | Simultaneous Profiles | Suportar geração para 2+ perfis em paralelo |

### RNF3: Disponibilidade

| ID | Requisito | SLA |
|----|-----------|-----|
| RNF3.1 | Uptime | 99% (máx 7h downtime/mês) |
| RNF3.2 | Recovery | RTO 15 min, RPO 5 min |
| RNF3.3 | Backup | Backup diário + replicação |

### RNF4: Usabilidade

| ID | Requisito | Descrição |
|----|-----------|-----------|
| RNF4.1 | UI Intuitiva | Gestor com pouco conhecimento técnico consegue usar |
| RNF4.2 | Dark Mode | Opção de dark mode |
| RNF4.3 | Mobile Responsive | Funcionar em mobile (tablets) |
| RNF4.4 | Acessibilidade | WCAG 2.1 AA (mínimo) |

---

## 6. Arquitetura Técnica (Alto Nível)

### Componentes

```
┌─────────────────────────────────────────────┐
│           NEXUS Frontend (React 18)         │
│  (Dashboard, Perfis, Geração, Publicação)   │
└──────────────┬──────────────────────────────┘
               │
┌──────────────▼──────────────────────────────┐
│      NEXUS Backend (Express v5)             │
│  (API Routes, Business Logic, Orchestration)│
└──────────────┬──────────────────────────────┘
               │
    ┌──────────┼──────────┬────────────┐
    │          │          │            │
┌───▼──┐ ┌────▼──┐ ┌────▼──┐ ┌──────▼──┐
│SQLite│ │Claude │ │DALL-E │ │Instagram│
│ (DB) │ │MCP    │ │  API  │ │Graph API│
└──────┘ └───────┘ └───────┘ └─────────┘

┌─────────────────────────────────────────────┐
│   marketing-instagram-squad (embedded)       │
│ (profile-strategist, copywriter, planner)   │
└─────────────────────────────────────────────┘
```

### Stack

| Layer | Tecnologia |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js 18+ + Express v5 |
| Database | SQLite (sql.js para simplicidade) |
| IA (Texto & Análise) | Claude Haiku + Sonnet via MCP |
| Image Generation | Nando Banana via API (vinculado diretamente) |
| Image Processing | sharp + SVG overlay |
| Instagram Publishing | Playwright MCP (automação com delays humanos) |
| Instagram Analytics | Instagram Graph API (oficial, rate limit 200/h) |
| Web Research | EXA via MCP (tendências, concorrentes) |
| Hosting | Your Server (backend + frontend) |

---

## 6.5. Dashboard por Perfil (4 Seções)

Quando o usuário entra em um perfil, vê:

### Seção 1: Análise do Perfil 📊
- **O que é**: Análise realizada pelo marketing-instagram-squad
- **Sub-abas**:
  - Posicionamento (voz, tom, diferencial)
  - Público-alvo (demografia, interesses, comportamento)
  - Performance histórica (posts top, padrões de engajamento)
  - Oportunidades (tendências, gaps de conteúdo)
- **Refresh**: A cada 7 dias ou manual
- **Integração**: Dados do marketing-squad, Instagrapi

### Seção 2: Gerenciamento de Conteúdo 📝
- **O que é**: Timeline de posts gerados + gerenciamento
- **Layout**:
  - Cronograma semanal (view tipo calendário)
  - Filtros: Tipo (Reel, Carrossel, Post, Story), Data, Status
  - Lado a lado com **comparação de concorrentes**
- **Clique em cada post**:
  - Preview exato (como fica no Instagram: media + caption)
  - Pesquisa/embasamento por trás (por que foi criado, fontes)
  - Ações: Aprovar, editar, deletar, adiar publicação
- **Status**: Draft, Agendado, Publicado, Falhou

### Seção 3: Concorrentes 👥
- **Sub-aba**
- **O que mostra**: Perfis que você cadastrou como parâmetro
- **Dados**:
  - Posts recentes dos concorrentes
  - Engajamento deles (para benchmarking)
  - Tendências que identificamos neles
- **Ação**: Adicionar/remover concorrentes

### Seção 4: Informações do Perfil ℹ️
- **O que é**: Dados extras que você sobe para a IA usar
- **Tipos de informação**:
  - Fotos/vídeos do cliente (ex: aulas de Karatê, novidades)
  - Contexto textual (descrição do negócio, news, promoções)
  - Mídias brutas (para a IA usar como inspiração)
- **Como funciona**:
  - Você faz upload de mídia/texto
  - Sistema armazena e referencia ao gerar conteúdo
  - A IA usa isso como input adicional para ser mais relevante
- **Exemplo**: Cliente de Karatê envia vídeo de "turma nova iniciada" → IA gera post específico para isso

---

## 7. Roadmap (Épicos)

### Epic 1: Foundation & Setup
**Objetivo**: Estrutura base da plataforma  
**Stories**: 5-6  
**Timeline**: Semana 1-2  
**Escopo**: Configuração de projeto (git, CI/CD), autenticação local (email + senha), schema SQLite (perfis, conteúdos, credenciais encriptadas), UI base (React structure), integração Instagrapi + Playwright MCP

### Epic 2: Profile Management
**Objetivo**: Conectar e gerenciar perfis  
**Stories**: 4-5  
**Timeline**: Semana 2-3  
**Escopo**: Formulário para conectar perfil, validação com Instagrapi, armazenamento de contexto (voz, público, objetivos), listagem de perfis conectados, edição/deleção de configurações

### Epic 3: Intelligence Pipeline
**Objetivo**: Implementar pesquisa → análise → geração  
**Stories**: 8-10  
**Timeline**: Semana 3-5  
**Escopo**: Módulo de pesquisa (Instagrapi + web + user input), módulo de análise (scoring + insights via marketing-squad), integração com marketing-instagram-squad, geração de captions, geração de visuais (Nando Banana), carrosséis com SVG overlay, stories com branding

### Epic 4: Dual Mode (Autopilot + Manual)
**Objetivo**: Implementar os dois modos de operação  
**Stories**: 5-6  
**Timeline**: Semana 5-6  
**Escopo**: Modo Manual com workflow de aprovações, Modo Autopilot com agendamento, toggle entre modos, fila de publicação, histórico de operações

### Epic 5: Publishing & Scheduling
**Objetivo**: Publicar via Playwright MCP (simula usuário real)  
**Stories**: 4-5  
**Timeline**: Semana 6-7  
**Escopo**: Integração Playwright MCP, publicação de feed posts, publicação de carousels, publicação de stories, agendamento com horários otimizados, retry logic com delays humanos

### Epic 6: Analytics & Dashboard
**Objetivo**: Mostrar métricas via Instagrapi  
**Stories**: 5-6  
**Timeline**: Semana 7-8  
**Escopo**: Integração Instagrapi (pull de dados), dashboard principal multi-perfil, métricas por perfil (followers, engagement), métricas por post (likes, comments, reach), relatório de performance, recomendações baseadas em dados

### Epic 7: Polish & QA
**Objetivo**: Refinamento e testes  
**Stories**: Múltiplos  
**Timeline**: Semana 8-9  
**Escopo**: Bug fixes, performance tuning, testes unitários + E2E, documentação, launch checklist

---

## 8. Critérios de Sucesso (KPIs)

### Para o Usuário Final
- ✅ Gerador conteúdo usado 3+ vezes/semana
- ✅ Engajamento médio dos perfis aumenta 25%+
- ✅ Tempo gasto em criação de conteúdo reduz em 50%+
- ✅ Taxa de aprovação em modo Manual > 70%

### Para o Produto
- ✅ Uptime > 99%
- ✅ Load time dashboard < 2s
- ✅ 95%+ taxa de sucesso em publicações
- ✅ Zero detecção como bot (Playwright com delays humanos)

---

## 9. Dependências Externas

| Dependência | Status | Requisito |
|------------|--------|-----------|
| Instagram Graph API | ✅ Confirmado | OAuth 2.0 + API key do Facebook Developer |
| Nando Banana API | ✅ Confirmado | API key de Nando Banana (vinculado via API) |
| Playwright MCP | ✅ Pronto | Para publicação via automação (simula usuário real) |
| Claude API (MCP) | ✅ Pronto | Haiku + Sonnet para análise e geração |
| EXA (Web Search MCP) | ✅ Pronto | Para pesquisa de tendências e concorrentes |

---

## 10. Equipe & Responsabilidades

### Desenvolvimento

| Papel | Agent | Responsabilidade |
|------|-------|------------------|
| Product Manager | @pm (Morgan) | Este PRD, estratégia, roadmap |
| Product Owner | @po (Pax) | Validação de histórias, aceitação |
| Architect | @architect (Aria) | Design técnico, decisões arquiteturais |
| Developer | @dev (Dex) | Implementação do código |
| QA Engineer | @qa (Quinn) | Testes, qualidade, bugs |
| DevOps | @devops (Gage) | Deploy, CI/CD, infraestrutura |

### Squads Integrados

| Squad | Papel | Quando |
|-------|-------|--------|
| marketing-instagram-squad | Motor de inteligência | Durante geração de conteúdo (runtime) |
| visual-design-squad | Design das interfaces | Epic 1 (design) + Epic 3 (visual generation) |

---

## 11. Riscos & Mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|------|---------------|--------|-----------|
| Instagrapi rate limiting | Média | Médio | Implementar backoff exponencial, rate limiting local |
| Credenciais comprometidas | Baixa | Crítico | AES-256-GCM, HTTPS, zero logs |
| Nando Banana API downtime | Baixa | Médio | Cache de imagens, fallback template |
| Detecção de bot (Playwright) | Baixa | Alto | Implementar delays humanos, rotate user-agents |
| Performance com múltiplos perfis | Média | Médio | Otimizar queries, fila de processamento |

---

## 12. Out of Scope (v2+)

- Multi-usuário (v2)
- Permissões granulares (v2)
- TikTok/YouTube (v2)
- Community management (v2)
- AI training customizado (v3+)
- White-label (v3+)

---

## Aprovação

| Stakeholder | Status | Data |
|------------|--------|------|
| Proprietário (Você) | ✅ APROVADO | 2026-04-07 |
| PM (Morgan) | ✅ VALIDADO | 2026-04-07 |
| @po (Pax) | ⏳ Próximo: Story Validation | — |
| @architect (Aria) | ⏳ Tech Review | — |

---

## Próximos Passos (Workflow AIOX)

1. ✅ **PRD VALIDADO** — Decisões confirmadas:
   - Instagram Graph API para analytics
   - Nando Banana vinculado via API
   - Análise do marketing-squad em paralelo (RNF2.2 viável)

2. **@architect (Aria)** — *create-full-stack-architecture
   - Tech review do PRD (Instagram Graph API setup, Nando Banana integration, performance planning)
   - Documento de arquitetura detalhado para guiar stories

3. **@sm (River)** — *draft de histórias para Epic 1 (Foundation & Setup)
   - Criar 5-6 stories baseado no PRD + feedback da arquitetura
   - Stories em `docs/stories/{epicNum}.{storyNum}.story.md`
   - Status inicial: `Draft`

4. **@po (Pax)** — *validate-story-draft
   - Validar cada story criada pelo @sm
   - Aplicar 10-point checklist
   - Atualizar status: `Draft` → `Ready` (se GO) ou retornar para @sm (se NO-GO)

5. **@dev (Dex)** — *develop (quando histórias são aprovadas)
   - Implementar stories do Epic 1 na sequência aprovada

---

*Documento criado por Morgan (@pm) em 2026-04-07*  
*Baseado em project-vision.md*
