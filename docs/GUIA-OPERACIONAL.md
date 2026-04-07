# NEXUS — Guia Operacional para Desenvolvimento

**Para**: Você (gestor e proprietário do projeto)  
**Objetivo**: Entender como operar a plataforma durante o desenvolvimento e como usar os agentes de IA

---

## O Processo em 6 Etapas (do conceito à produção)

### Etapa 1 — Planejamento ← **VOCÊ ESTÁ AQUI**

**Quem faz**: Morgan (@pm — Product Manager)

**O que acontece**:
- Morgan cria um documento detalhado (PRD — Product Requirements Document)
- Contém: objetivo, recursos, casos de uso, requisitos técnicos
- Inclui: critérios de sucesso, limitações, roadmap

**Seu papel**: Ler e aprovar o documento. Fazer perguntas. Clarificar qualquer coisa que não fique clara.

**Comando para começar**:
```
@pm *create-prd
```

---

### Etapa 2 — Validação das Histórias

**Quem faz**: Pax (@po — Product Owner)

**O que acontece**:
- Pax pega o PRD aprovado e quebra em "histórias" pequenas
- Uma história é uma tarefa pequena e bem-definida que um dev consegue implementar
- Exemplo de história: "Como usuário, quero adicionar um novo perfil clicando em um botão 'Novo Perfil'"
- Cada história tem critérios de aceição claros (AC)

**Seu papel**: Confirmar que as histórias fazem sentido. Se algo parecer fora de contexto, reportar.

**Comando para começar**:
```
@po *validate-story-draft
```

---

### Etapa 3 — Design das Interfaces

**Quem faz**: Stella (@visual-designer) + visual-design-squad

**O que acontece**:
- Stella e o time de design criam as telas e interfaces do NEXUS
- Você vê: mockups, fluxos de navegação, design system
- Eles garantem que o produto fica profissional e agradável

**Seu papel**: Aprovar layouts, cores, estrutura. Pedir ajustes se algo não fizer sentido.

**Comando para começar**:
```
@visual-designer *design-visual
```

---

### Etapa 4 — Desenvolvimento

**Quem faz**: Dex (@dev — Developer)

**O que acontece**:
- Dex implementa o código seguindo as histórias aprovadas
- Cria as APIs, banco de dados, lógica do backend
- Implementa a UI em React seguindo o design de Stella
- Integra o motor de inteligência (marketing-instagram-squad)

**Seu papel**: 
- Testar o que for entregue
- Reportar bugs ou funcionalidades que não funcionaram como esperado
- Aprovar antes de seguir para QA

**Comando para começar**:
```
@dev *develop
```

---

### Etapa 5 — Qualidade (QA)

**Quem faz**: Quinn (@qa — QA Engineer)

**O que acontece**:
- Quinn revisa todo o código
- Testa: funcionalidade, performance, segurança, acessibilidade
- Garante que está tudo funcionando corretamente

**Seu papel**: Confiar no processo. Se algo quebrar em produção, Quinn deveria ter encontrado. (Raramente acontece.)

**Comando para começar**:
```
@qa *qa-gate
```

---

### Etapa 6 — Publicação (Deploy)

**Quem faz**: Gage (@devops — DevOps Engineer)

**O que acontece**:
- Gage sobe a versão aprovada para o servidor
- Configura o ambiente de produção
- Garante que está rodando

**Seu papel**: Nenhum — você só vê a plataforma ao vivo.

**Comando para começar**:
```
@devops *push-to-production
```

---

## Como Usar os Squads

### marketing-instagram-squad
**Quando usar**: Quando você quer testar a geração de conteúdo ANTES de implementar tudo na plataforma.

Exemplo: Testar se o copywriter consegue gerar uma legenda boa para um perfil específico.

```
@profile-strategist *analyze-profile (analyzes a profile and creates strategy)
@copywriter *write-caption (generates a caption based on strategy)
@trend-researcher *find-trends (identifies trending content for the niche)
```

### visual-design-squad
**Quando usar**: Durante a Etapa 3 (Design das Interfaces).

```
@visual-designer *design-visual (creates mockups and design system)
@ux-interaction-designer *design-interactions (defines user flows)
```

---

## Configuração Inicial (Antes de Tudo Começar)

### Passo 0: Configurar o Facebook App e Graph API

Antes de adicionar qualquer perfil no NEXUS, você precisa:

**1. Criar um Facebook App**
- Acesse [facebook.com/developers](https://facebook.com/developers)
- Crie uma nova app
- Selecione "Instagram Graph API" como produto
- Guarde o App ID e App Secret (você vai precisar)

**2. Criar uma Conta Business no Instagram** (se ainda não tiver)
- Vá para instagram.com e converta sua conta para Business ou Creator
- Isso habilita o acesso à Graph API

**3. Conectar o NEXUS ao App**
- No NEXUS, vá para Configurações → Conexão Instagram
- Cole o App ID e App Secret
- Clique "Autorizar"
- Você verá uma tela de permissão do Instagram
- Aprove para conectar

**4. Adicionar Perfis Clientes**
- Se os perfis são de clientes, você precisa da permissão deles
- Eles devem ter conta Business ou Creator
- Você pode gerenciar tudo via Facebook Business Manager

⚠️ **Importante**: Sem completar o Passo 0, o NEXUS não consegue publicar nada. Faça isso primeiro.

---

## Comandos Mais Usados (Dia a Dia)

| Comando | O que faz | Quem usa |
|---------|----------|---------|
| `@pm *create-prd` | Cria o documento de requisitos | Morgan |
| `@po *validate-story-draft` | Valida as histórias | Pax |
| `@visual-designer *design-visual` | Cria design das telas | Stella |
| `@dev *develop` | Implementa o código | Dex |
| `@qa *qa-gate` | Revisa qualidade | Quinn |
| `@devops *push-to-production` | Sobe para produção | Gage |
| `@profile-strategist *analyze-profile` | Analisa perfil (squad) | Marketing Squad |
| `@copywriter *write-caption` | Gera caption (squad) | Marketing Squad |

---

## Como Falar com os Agentes

Você pode ser natural. Exemplos:

```
"@dev, cria o dashboard da plataforma"
"@visual-designer, a interface tá muito branca, deixa mais colorida"
"@profile-strategist, que tipo de conteúdo funciona bem em karate?"
```

Os agentes vão entender e responder.

---

## Se Algo Quebrar (Troubleshooting)

| Problema | Solução |
|----------|---------|
| Esqueci qual é a próxima etapa | Leia este guia novamente |
| Uma história não faz sentido | Diga para Pax: "@po, essa história tá confusa" |
| O design não é o que eu queria | Diga para Stella: "@visual-designer, esse layout não funciona" |
| O código tá bugado | Diga para Dex: "@dev, encontrei um bug em [lugar]" |
| Não sei qual agente usar | Pergunte: "@aiox-master, qual agente eu preciso?" |

---

## Resumo Final

```
┌─────────────────────────────────────────────────┐
│ CRONOGRAMA DO DESENVOLVIMENTO DO NEXUS         │
├─────────────────────────────────────────────────┤
│ 1️⃣  Morgan cria PRD                             │
│ 2️⃣  Você aprova                                 │
│ 3️⃣  Pax valida as histórias                     │
│ 4️⃣  Stella + squad visual faz design            │
│ 5️⃣  Dex implementa (integra marketing-squad)   │
│ 6️⃣  Quinn faz QA                                │
│ 7️⃣  Gage sobe para produção                     │
│ 8️⃣  Você testa a plataforma ao vivo             │
└─────────────────────────────────────────────────┘
```

---

## Próximo Passo

Quando estiver pronto, execute:

```
@pm *create-prd
```

Morgan vai criar o documento detalhado do projeto e você aprova. Daí a gente segue!
