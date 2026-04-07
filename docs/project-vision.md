# NEXUS — Visão do Produto

## O Que É

**NEXUS** é uma plataforma pessoal para gerenciar múltiplos perfis do Instagram de forma centralizada e automatizada. Não é um SaaS — é uma ferramenta operacional interna para o gestor cuidar de todos os perfis que administra em um único lugar.

## Perfil de Usuário

Gestor de redes sociais (agência ou freelancer) que cuida de múltiplos perfis clientes no Instagram e quer automatizar o processo de geração, análise e publicação de conteúdo.

## Os 4 Pilares

| Pilar | Responsabilidade | Powered By |
|-------|------------------|-----------|
| **Geração de Conteúdo** | Legendas, hooks, CTAs, captions alinhadas à voz de cada perfil | marketing-instagram-squad (copywriter) |
| **Estratégia & Análise** | Posicionamento, calendário editorial, análise de performance | marketing-instagram-squad (strategist, planner, analytics) |
| **Criação Visual** | Imagens, carrosséis, stories com identidade visual do perfil | IA (DALL-E + sharp) + composição |
| **Publicação & Agendamento** | Publica nos melhores horários, agenda posts | Instagram Graph API |

## O Diferencial: Pipeline de Inteligência

Não é geração de conteúdo "genérica de IA". Antes de criar qualquer coisa, o NEXUS pesquisa e analisa:

### [1] Pesquisa (Research Phase)
```
├── Perfis concorrentes → o que está funcionando no nicho do cliente
├── Busca web → tendências atuais, notícias, viral trends
├── Histórico do perfil → quais posts já geraram engajamento (pattern recognition)
└── Análise profunda do perfil → voz, tom, público-alvo, objetivos específicos
```

### [2] Análise e Síntese (Analysis Phase)
```
├── Probabilidade de engajamento/viralização
├── Alinhamento com objetivos atuais do perfil
└── Oportunidades de tendência identificadas
```

### [3] Geração (Generation Phase)
```
└── Conteúdo criado COM BASE em tudo acima (não é IA genérica)
    Usa frameworks de especialistas: Alex Hormozi, Russell Brunson, Gary Vaynerchuk,
    Donald Miller, Eugene Schwartz, Jonah Berger, e outros
```

## Modos de Operação (por perfil)

### 🤖 Autopilot
- NEXUS executa todo o ciclo sozinho: pesquisa → análise → gera → publica
- Zero intervenção manual necessária
- Roda automaticamente conforme o planejamento configurado

### ✋ Manual (Approval-Driven)
- Cada ação requer aprovação explícita do gestor
- Fluxo: Usuário aperta "Gerar" → sistema pesquisa e analisa → apresenta proposta → usuário aprova → publica
- Controle total sobre cada publicação

**Toggle**: O modo pode ser alternado a qualquer momento, para cada perfil individualmente.

## Stack Técnico

| Componente | Tecnologia |
|-----------|-----------|
| Backend | Node.js + Express v5 |
| Frontend | React 18 + Vite |
| Banco de Dados | SQLite |
| IA (Texto & Análise Visual) | Claude Haiku + Sonnet via MCP |
| Geração de Imagens | DALL-E 3 |
| Processamento de Imagens | sharp + SVG overlay |
| Instagram Publishing | Graph API oficial (100% seguro) |
| Autenticação & Dados | Instagram Graph API (OAuth 2.0) |

## Papel dos Squads

### marketing-instagram-squad
Opera **dentro da plataforma** como o motor de inteligência. Não é um time de planejamento separado — quando NEXUS precisa gerar conteúdo, ativa:

- **profile-strategist** → análise profunda do perfil e definição de objetivos
- **copywriter** → geração de captions e conteúdo
- **content-planner** → calendário editorial e pilares
- **trend-researcher** → pesquisa de tendências e análise de viralidade
- **analytics-agent** → análise de performance e recomendações

### visual-design-squad
Usado **durante o desenvolvimento** para criar as interfaces da plataforma:

- **visual-designer** → design system e identidade visual
- **ux-interaction-designer** → fluxos e interações
- **frontend-developer** → implementação React
- **responsive-specialist** → responsividade mobile/desktop
- **performance-a11y-specialist** → performance e acessibilidade

## Princípios

1. **Simples que funciona** — sem complexidade desnecessária
2. **API segura** — somente Graph API oficial, zero risco de banimento
3. **Modo duplo real** — Autopilot e Manual são first-class citizens, não afterthoughts
4. **Multi-perfil nativo** — cada perfil tem contexto, estratégia e configurações independentes
5. **Conteúdo estratégico** — usa frameworks de especialistas, não é IA genérica
6. **Inteligência em camadas** — pesquisa + análise + geração, sempre nessa ordem

## Conexão com o Instagram

O NEXUS usa **Instagram Graph API**, a forma oficial e segura de publicar e acessar dados.

### Requisitos
- Os perfis a gerenciar devem ser contas **Business ou Creator** no Instagram
- Cada conta precisa ser conectada via OAuth 2.0
- Requer um Facebook App configurado (detalhe no guia operacional)

### Por Que Graph API?
- ✅ 100% autorizado pelo Instagram (zero risco de banimento)
- ✅ Oficial e suportado
- ✅ Acesso a Insights (analytics)
- ✅ Publicação segura de posts, stories e reels

Contraste com automação por browser (ex: Playwright): ❌ Risco de banimento, ❌ Quebra a cada atualização do Instagram.

## Próximos Passos

1. PRD completo com especificações detalhadas
2. Épicos de desenvolvimento
3. Design das interfaces (visual-design-squad)
4. Implementação do backend e frontend
5. Testes e QA
6. Publicação da versão inicial
