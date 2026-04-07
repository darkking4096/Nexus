# NEXUS Platform — Arquitetura Técnica Completa

**Status**: ✅ VALIDADO pela Aria (Visionary Architect)  
**Data**: 2026-04-07  
**Versão**: 1.0  
**Para**: Epic 1 → Epic 7 (Foundation to Polish)

---

## Sumário Executivo

NEXUS é uma plataforma **pessoal single-user** que orquestra um pipeline de inteligência de 3 camadas (Pesquisa → Análise → Geração) para automatizar a criação estratégica de conteúdo Instagram. A arquitetura é **monolítica pragmática** com clara separação entre frontend (React), backend (Express), banco de dados (SQLite), e orquestração de agentes IA (marketing-instagram-squad via MCP).

**Pillares arquiteturais:**
- 🎯 **User-Centric**: Dois modos de operação (Autopilot e Manual) refletem padrões reais de trabalho
- 🔒 **Security-First**: Credenciais criptografadas (AES-256-GCM), OAuth 2.0, zero logs de tokens
- ⚡ **Performance-Conscious**: <30s geração, <2s dashboard, análise paralela via squad
- 🤖 **Intelligence-Layered**: Não é IA genérica — pesquisa específica, análise profunda, geração estratégica
- 🏗️ **Horizontally Scalable**: SQLite para MVP, pronto para Postgres se crescer para SaaS

---

## 1. Visão de Camadas (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                  PRESENTATION LAYER                         │
│                  (React 18 + Vite)                          │
│  Dashboard | Profile Config | Content Generation | Analytics │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/WebSocket
┌──────────────────────────▼──────────────────────────────────┐
│                  API GATEWAY LAYER                          │
│              (Express v5 + Auth Middleware)                 │
│  Routes | Business Logic | Orchestration | Error Handling   │
└──────────────────────────┬──────────────────────────────────┘
                           │ (Internal + MCP calls)
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼─────┐  ┌────────▼────────┐  ┌──────▼──────────┐
│   DATA       │  │  INTELLIGENCE   │  │  INTEGRATION    │
│   LAYER      │  │    LAYER        │  │    LAYER        │
│              │  │                 │  │                 │
│  • SQLite    │  │  • Claude       │  │  • Instagram    │
│  • Encryption│  │    Haiku/Sonnet │  │    Graph API    │
│  • Schema    │  │  • Marketing    │  │  • Nando Banana │
│              │  │    Squad (MCP)  │  │  • Playwright   │
│              │  │  • EXA Search   │  │    (MCP)        │
│              │  │  • Research DB  │  │  • Instagrapi   │
└──────────────┘  └─────────────────┘  └─────────────────┘
```

---

## 2. Decisões Tecnológicas (Rationale Completa)

### 2.1. Backend: Node.js 18+ + Express v5

| Critério | Decisão | Por Quê |
|----------|---------|---------|
| **Runtime** | Node.js 18+ | Acho que é overkill para MVP. Alternativa seria Python. Mas: JavaScript unificado (frontend + backend), event-driven para I/O, comunidade NPM. |
| **Framework** | Express v5 | Lightweight, estabelecido, zero overhead de opinião, perfeito para orch MCP. Express 5 = performance melhor. |
| **Async Pattern** | async/await | Native, legível, fácil debug. |
| **Secrets** | dotenv (local) + .env.example | Desenvolvimento. Em produção, env vars no servidor ou vault. |

**Alternativas rejeitadas:**
- ❌ Fastify: Overkill para single-user, ~5ms mais rápido não justifica complexidade
- ❌ Nest.js: TS obrigatório, overhead, aprende-se muito aqui já
- ❌ Python (Django): Backend em linguagem diferente do frontend prejudica DX

### 2.2. Frontend: React 18 + Vite + Tailwind CSS

| Critério | Decisão | Por Quê |
|----------|---------|---------|
| **Framework** | React 18 | Ecosystem maduro, Visual Squad integrada já, component patterns são claros. |
| **Build Tool** | Vite | 10x mais rápido que Webpack, HMR instant, é a norma em 2026. |
| **Styling** | Tailwind CSS | Utility-first acelera iteração design, Visual Squad usa isso, responsive built-in. |
| **State Mgmt** | TanStack Query (data) + Zustand (UI state) | TQ para server state (perfis, posts, analytics). Zustand para UI (modals, filters). |
| **Validation** | Zod + React Hook Form | Type-safe forms, lightweight, zero deps desnecessárias. |
| **Dark Mode** | Tailwind CSS + next-themes | Toggle via `theme-toggle` component, persiste em localStorage. |

**Alternativas rejeitadas:**
- ❌ Vue: Menor ecosystem, visual squad é React
- ❌ Redux: Overhead desnecessário, TQ+Zustand é mais pragmático
- ❌ CSS Modules: Tailwind é mais produtivo

### 2.3. Database: SQLite (local) → Postgres (se SaaS v2)

| Aspecto | Decision | Rationale |
|--------|----------|-----------|
| **MVP** | sql.js (SQLite em memória) ou melhor Bun SQLite | Não precisa servidor DB, zero setup, arquivo único `.nexus.db`. Perfeito para pessoal. |
| **Quando migrar** | Postgres se → SaaS multi-user v2 | Migrations simples, schema idêntico, apenas trocar driver. |
| **Encryption** | AES-256-GCM para Instagram tokens | `crypto.createCipheriv()` native Node.js, chave em .env. |
| **Backups** | Daily dump do `.nexus.db` | Simples: `cp .nexus.db .nexus.backup.db` cronado. |

**Schema highlights:**
```sql
-- Users (MVP: apenas 1)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  passwordHash TEXT,
  createdAt DATETIME
);

-- Instagram Profiles (múltiplos)
CREATE TABLE instagram_profiles (
  id TEXT PRIMARY KEY,
  userId TEXT,
  instagramUserId TEXT,
  username TEXT,
  accessToken TEXT (encrypted),
  refreshToken TEXT (encrypted),
  context JSON, -- voz, tom, público, objetivos
  mode TEXT, -- 'autopilot' | 'manual'
  isConnected BOOLEAN,
  createdAt DATETIME,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Generated Content
CREATE TABLE generated_content (
  id TEXT PRIMARY KEY,
  profileId TEXT,
  researchData JSON,
  analysisData JSON,
  caption TEXT,
  hashtags TEXT,
  hooks JSON, -- 3 opções
  imageUrl TEXT,
  status TEXT, -- 'draft' | 'scheduled' | 'published' | 'failed'
  scheduledFor DATETIME,
  publishedAt DATETIME,
  createdAt DATETIME,
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id)
);

-- Competitors
CREATE TABLE competitors (
  id TEXT PRIMARY KEY,
  profileId TEXT,
  competitorUsername TEXT,
  competitorUserId TEXT,
  analysis JSON,
  syncedAt DATETIME,
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id)
);

-- Media Uploads
CREATE TABLE media_uploads (
  id TEXT PRIMARY KEY,
  profileId TEXT,
  filename TEXT,
  mimeType TEXT,
  url TEXT,
  uploadedAt DATETIME,
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id)
);
```

### 2.4. Intelligence Layer: Claude (MCP) + Marketing Squad

| Layer | Tool | Justificativa |
|-------|------|---------------|
| **Text Generation** | Claude Haiku (fast) + Sonnet (quality) | Haiku para drafts/análises, Sonnet para captions finais. Via MCP para orchestração limpa. |
| **Squad Orchestration** | marketing-instagram-squad | Agents especializados: profile-strategist (análise), copywriter (captions), analytics-agent (scoring). Em paralelo para RNF2.2 (<30s). |
| **Web Research** | EXA via MCP | Busca tendências reais do nicho, análise de concorrentes. Cacheia resultados por 24h. |
| **Cache** | In-memory (Redis simples) | Análises de concorrentes, pesquisas web, contexto de perfil. Evita custo IA. |

**Fluxo Orquestração (Autopilot)**:
```
┌─────────────────────────────────────────────┐
│  User clicks "Generate" (Autopilot mode)    │
└────────────────────┬────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  RESEARCH PHASE (1/3)   │
        │  ─────────────────────  │
        │ • Fetch profile context │
        │ • Analyze competitors   │ (parallel)
        │ • Web search trends     │
        │ • Profile history       │
        └────────────┬────────────┘
                     │ (await all)
        ┌────────────▼────────────┐
        │  ANALYSIS PHASE (2/3)   │
        │  ─────────────────────  │
        │ • profile-strategist    │
        │   → positioning         │ (parallel)
        │ • analytics-agent       │
        │   → engagement score    │
        │ • content-planner       │
        │   → framework selection │
        └────────────┬────────────┘
                     │ (await all)
        ┌────────────▼────────────┐
        │  GENERATION PHASE (3/3) │
        │  ─────────────────────  │
        │ • copywriter → caption  │
        │ • Claude Haiku → hooks  │
        │ • Nando Banana → image  │ (parallel)
        │ • SVG overlay → text    │
        └────────────┬────────────┘
                     │ (await all)
        ┌────────────▼────────────┐
        │  Auto-Publish (if time) │
        │  ─────────────────────  │
        │ • Check schedule        │
        │ • Publish via Playwright│
        │ • Log metrics           │
        └────────────────────────┘
```

**RNF2.2 Compliance (<30s)**:
- Pesquisa web + análise perfil: parallelismo total
- Squad chama 3 agents em paralelo
- Geração captions via Haiku (fast) + Nando Banana (cache)
- **Target**: ~20-25s para fluxo completo

### 2.5. Publishing: Playwright MCP (Human-like Automation)

| Aspecto | Solução | Rationale |
|---------|---------|-----------|
| **Por quê Playwright?** | Simula navegador real | Zero detecção bot, agendalabor com delays humanos (2-8s entre cliques). |
| **Qual MCP?** | Playwright MCP (via Claude) | Orquestração limpa, sem código scraping direto. |
| **Publicação de tipos** | Feed post, Carousel, Story | Playwright sabe clicar em upload, preencher caption, agendar. |
| **Delay strategy** | `delay = random(2000, 8000)ms` entre ações | Padrão humano, Instagram não detém. |
| **Retry logic** | Max 3 tentativas, exponential backoff | Se rede falha, tenta ~5s depois, ~15s depois. |

**Fluxo Publicação (Manual mode)**:
```
User approves post →
  Playwright starts browser session →
  Log in se needed (token do SQLite) →
  Click upload button →
    delay(2-4s)
  Select image/carousel →
    delay(1-2s)
  Fill caption + hashtags →
    delay(1-2s)
  Select time (se agendado) →
    delay(1-2s)
  Click publish →
    delay(2-3s)
  Verify published (screenshot) →
  Close browser →
  Store published_at + metrics
```

**Fallback**:
- Se Playwright falha 3x: mark content como "failed", notifica usuário no dashboard
- Usuário pode retentar ou editar

### 2.6. Analytics: Instagram Graph API + Instagrapi

| Fonte | O quê | Frequência | Limite |
|-------|-------|-----------|--------|
| **Graph API** | Likes, comments, reach, impressions (oficial) | 24h post publish | 200 req/h |
| **Instagrapi** | Followers, engagement rate histórico | Diário/semanal | ~500 req/h |
| **Cache** | Dashboard principal (KPIs) | Real-time (but server ~5min cache) | — |

**Padrão**:
- Background job roda 1x/dia às 10am (ler métricas de últimas 24h)
- Dashboard mostra cache em-memória
- Atualização manual via botão "Refresh analytics"

### 2.7. Image Generation: Nando Banana + sharp + SVG

| Componente | Tecnologia | O quê |
|-----------|-----------|-------|
| **Base image** | Nando Banana API | Gera imagem temática baseada em prompt |
| **Processing** | sharp (Node.js) | Resize, compress, format conversion (JPG/PNG) |
| **Text Overlay** | SVG + canvas | Overlay caption, hashtags, branding no topo/footer |
| **Carousels** | Sharp + SVG | Gera N slides, cada um com copy diferente |

**Pipeline**:
```
Geração de caption + análise →
  Nando Banana API: "Create image for [caption]" →
    await image.png
  sharp: resize(1080x1350) → JPG optimized
  Canvas SVG overlay: add copy at bottom
  Save to filesystem + CDN (ou base64 temp)
```

---

## 3. Arquitetura de Diretórios (Project Structure)

```
nexus/
├── packages/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── index.ts              # Server entry
│   │   │   ├── middleware/           # Auth, error, logging
│   │   │   ├── routes/
│   │   │   │   ├── auth.ts           # Login/register
│   │   │   │   ├── profiles.ts       # Profile CRUD
│   │   │   │   ├── content.ts        # Generation, approval
│   │   │   │   ├── publishing.ts     # Schedule, publish
│   │   │   │   └── analytics.ts      # Metrics
│   │   │   ├── services/
│   │   │   │   ├── instagram.ts      # Graph API + Instagrapi
│   │   │   │   ├── intelligence.ts   # Squad orchestration
│   │   │   │   ├── research.ts       # EXA search + cache
│   │   │   │   ├── publication.ts    # Playwright orchestration
│   │   │   │   ├── image.ts          # Nando Banana + sharp
│   │   │   │   └── encryption.ts     # AES-256-GCM
│   │   │   ├── db/
│   │   │   │   ├── schema.sql        # Schema inicial
│   │   │   │   ├── init.ts           # SQLite setup
│   │   │   │   └── migrations/       # Versions
│   │   │   └── utils/
│   │   │       ├── validators.ts     # Zod schemas
│   │   │       ├── logger.ts         # Logging
│   │   │       └── types.ts          # Shared types
│   │   ├── .env.example
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── frontend/
│       ├── src/
│       │   ├── main.tsx              # Vite entry
│       │   ├── App.tsx               # Root component
│       │   ├── pages/
│       │   │   ├── Login.tsx
│       │   │   ├── ProfileList.tsx
│       │   │   ├── ProfileDashboard.tsx
│       │   │   ├── ContentGenerator.tsx
│       │   │   └── Analytics.tsx
│       │   ├── components/
│       │   │   ├── Header.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── ContentCard.tsx
│       │   │   ├── ApprovalFlow.tsx
│       │   │   └── DarkModeToggle.tsx
│       │   ├── hooks/
│       │   │   ├── useProfiles.ts
│       │   │   ├── useContent.ts
│       │   │   └── useAuth.ts
│       │   ├── stores/
│       │   │   ├── authStore.ts      # Zustand
│       │   │   └── uiStore.ts
│       │   ├── services/
│       │   │   └── api.ts            # HTTP client
│       │   └── styles/
│       │       └── globals.css       # Tailwind
│       ├── index.html
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       └── package.json
│
├── docs/
│   ├── stories/                      # AIOX stories
│   ├── prd/
│   │   └── PRD-NEXUS.md
│   ├── architecture/
│   │   ├── ARCHITECTURE.md           # Este arquivo
│   │   ├── DATA-MODEL.md             # ER diagram
│   │   └── API-SPEC.md               # Endpoints
│   └── guides/
│       ├── SETUP.md                  # Dev environment
│       ├── DEPLOYMENT.md             # Prod guide
│       └── TESTING.md                # Test strategy
│
├── .github/
│   └── workflows/                    # CI/CD (GitHub Actions)
│
├── .env.example                      # Template
├── .gitignore
├── docker-compose.yml                # Se needed
└── package.json                      # Monorepo root
```

---

## 4. API Routes (RESTful Specification)

### Auth
```
POST   /api/auth/register         # Criar conta local
POST   /api/auth/login            # Login
POST   /api/auth/logout           # Logout (zera cookie)
GET    /api/auth/me               # Current user
```

### Profiles
```
GET    /api/profiles              # List conectados
POST   /api/profiles              # Iniciar OAuth
GET    /api/profiles/:id          # Detail + contexto
PUT    /api/profiles/:id          # Update contexto
POST   /api/profiles/:id/disconnect
```

### Content Generation
```
POST   /api/content/generate      # Trigger (manual/autopilot)
  Body: { profileId, mode: 'manual'|'autopilot', ... }
  Response: { contentId, status: 'research_pending', ... }

POST   /api/content/:id/approve   # Approve fase (manual mode)
  Body: { phase: 'research'|'analysis'|'caption'|'publish' }

GET    /api/content/:id           # Fetch draft
PUT    /api/content/:id           # Edit caption/hashtags
DELETE /api/content/:id           # Discard

GET    /api/content              # List drafts/scheduled/published
```

### Publishing
```
POST   /api/publishing/schedule   # Agendar post
  Body: { contentId, scheduledFor: ISO8601 }

POST   /api/publishing/publish    # Publicar agora
  Body: { contentId }

GET    /api/publishing/history    # Ver publicados
```

### Analytics
```
GET    /api/analytics/profile/:id           # Dashboard principal
GET    /api/analytics/profile/:id/posts     # Por-post metrics
GET    /api/analytics/profile/:id/growth    # Followers trend
POST   /api/analytics/profile/:id/refresh   # Força sync
```

### Competitors
```
GET    /api/competitors/:profileId
POST   /api/competitors                     # Add competitor
DELETE /api/competitors/:competitorId       # Remove
```

### Media Uploads
```
POST   /api/media/upload          # Upload mídia
GET    /api/media/:profileId      # List uploads
DELETE /api/media/:id
```

---

## 5. Data Flow Diagrams

### Fluxo 1: Geração Manual (User Approval em cada passo)

```
User clicks "Generate" (Manual mode)
         ↓
POST /api/content/generate
         ↓
[Backend] Service: intelligence.generateContent()
    ├─ Phase 1: Research
    │   ├─ Fetch profile context
    │   ├─ Search competitors (EXA)
    │   ├─ Analyze history (Instagrapi)
    │   └─ Cache result → DB (research_data JSON)
    │
    ├─ Phase 2: Analysis (pause for approval)
    │   → Return { contentId, status: 'research_pending' }
    │
[Frontend] Shows research data to user
User reviews → POST /api/content/:id/approve (phase: 'research')
    │
    ├─ Phase 2: Analysis
    │   ├─ Call squad (parallel):
    │   │   ├─ profile-strategist → positioning
    │   │   ├─ analytics-agent → viral score
    │   │   └─ content-planner → framework
    │   └─ Cache result → DB (analysis_data JSON)
    │   → Return { status: 'analysis_pending' }
    │
[Frontend] Shows analysis + recommendation
User approves → POST /api/content/:id/approve (phase: 'analysis')
    │
    ├─ Phase 3: Generation
    │   ├─ Claude Haiku → caption + hooks
    │   ├─ Nando Banana → base image
    │   ├─ sharp + SVG → overlay + final image
    │   └─ Save to DB (caption, hashtags, imageUrl)
    │   → Return { status: 'caption_pending' }
    │
[Frontend] Shows caption + image preview
User edits caption (optional) → PUT /api/content/:id
User approves → POST /api/content/:id/approve (phase: 'caption')
    │
    └─ Phase 4: Schedule
        ├─ User selects date/time
        ├─ Save scheduledFor
        └─ Return { status: 'scheduled' }

Background Job (cron @scheduledTime):
    → Playwright: publish via Playwright MCP
    → Mark as 'published'
    → Log metrics
```

### Fluxo 2: Geração Autopilot (Totalmente Automática)

```
User enables Autopilot for Profile X
Config: publish 3x/week, M/W/F at 9am
         ↓
Cron trigger: Every day at 2am
    → Check: Is today a publish day? (M/W/F)
    → If YES:
         ├─ Call intelligence.generateContent() [full pipeline, no pauses]
         ├─ Await Phases 1-3 complete
         ├─ Schedule for 9am today
         └─ Return success
    → Else: skip

At 9am (Cron):
    → Playwright: publish
    → Log metrics
    → Schedule next generation (after cooldown)
```

### Fluxo 3: Analytics Dashboard Load

```
User opens Profile Dashboard
         ↓
GET /api/analytics/profile/:id
         ↓
[Backend] analytics service:
    ├─ Fetch from cache (if <5min old)
    │   → Return cached data
    │
    └─ Else: fetch fresh
        ├─ Instagrapi: followers, engagement (1-2s)
        ├─ Graph API: last post metrics (1s)
        ├─ Update cache (expire 5min)
        └─ Return to frontend

[Frontend] Renders:
    ├─ KPI cards (followers, engagement rate, reach)
    ├─ Chart: weekly trend
    ├─ Top posts (by engagement)
    └─ Recommendations: "Post videos on Thursdays"
```

---

## 6. Error Handling & Resilience

### Error Categories

| Error | Status | Action | Retry? |
|-------|--------|--------|--------|
| **Instagram auth** | 401 | Re-prompt OAuth | No (user action) |
| **Instagram rate limit** | 429 | Exponential backoff | Yes (3x, 5s/15s/30s) |
| **Network timeout** | 504 | Exponential backoff | Yes (3x) |
| **Validation fail** | 400 | Return error msg | No |
| **Squad service error** | 500 | Log + fallback template | No (notify user) |
| **Image gen fail** | 500 | Retry once, then stock image | Yes (1x) |

**Middleware Error Handler**:
```javascript
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  // Log with context
  logger.error({
    status,
    message,
    path: req.path,
    userId: req.user?.id,
    stack: err.stack
  });
  
  // Send structured response
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      requestId: req.id // para debug
    }
  });
});
```

---

## 7. Security Architecture

### 7.1. Authentication & Secrets

```
┌────────────────────────────────────┐
│  User Login (email + password)     │
└─────────────┬──────────────────────┘
              ↓
     Validate email + hash password
     (bcrypt with salt rounds = 12)
              ↓
     Issue JWT token (HS256)
     Token claims:
       {
         sub: userId,
         iat: now,
         exp: now + 7 days,
         type: 'access'
       }
              ↓
     Store in HTTPOnly cookie (secure + sameSite=strict)
     + Refresh token rotation pattern
```

### 7.2. Instagram Token Encryption

```
Raw token from OAuth: "abc123def456..."
         ↓
Key: process.env.ENCRYPTION_KEY (32 bytes, base64)
IV: random 16 bytes (per token)
         ↓
cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
encrypted = cipher.update(token) + cipher.final()
authTag = cipher.getAuthTag()
         ↓
Store in DB: { iv, encrypted, authTag } (base64)
         ↓
On decrypt: decipher = crypto.createDecipheriv(..., key, iv)
decipher.setAuthTag(authTag)
token = decipher.update(encrypted) + decipher.final()
```

### 7.3. HTTPS & HSTS

```
All traffic: HTTPS only
Header: Strict-Transport-Security: max-age=31536000; includeSubDomains
Header: X-Content-Type-Options: nosniff
Header: X-Frame-Options: DENY
Header: Content-Security-Policy: default-src 'self'
```

### 7.4. Input Validation (Zod)

```javascript
const GenerateContentRequest = z.object({
  profileId: z.string().uuid(),
  mode: z.enum(['manual', 'autopilot']),
  // ... other fields
});

app.post('/api/content/generate', (req, res) => {
  const parsed = GenerateContentRequest.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }
  // proceed with parsed.data
});
```

---

## 8. Operações & Deployment

### 8.1. Development Setup

```bash
# Clone + setup
git clone <repo>
cd nexus
npm install

# .env file (copy from .env.example)
ENCRYPTION_KEY=<32-byte-base64>
JWT_SECRET=<long-random-string>
INSTAGRAM_APP_ID=<from-facebook-dev>
INSTAGRAM_APP_SECRET=<...>
NANDO_BANANA_API_KEY=<...>
EXA_API_KEY=<...>
CLAUDE_API_KEY=<...>

# Start dev servers
npm run dev              # Starts both backend + frontend with hot reload
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### 8.2. Production Deployment

**Option A: Deploy to your own server (VPS)**
```bash
# 1. Build
npm run build            # Outputs: backend/dist + frontend/dist

# 2. Deploy to server
scp -r dist/ user@host:/app/
ssh user@host "cd /app && npm install --production"

# 3. Run with process manager (PM2)
pm2 start backend/dist/index.js --name "nexus-backend"
pm2 start "npm run serve:frontend" --name "nexus-frontend"

# 4. Nginx reverse proxy
# Config proxies :3001 → backend, :5173 → frontend
# Also handles HTTPS (Let's Encrypt cert)
```

**Option B: Docker (if scaling later)**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm ci --production
EXPOSE 3001
CMD ["node", "packages/backend/dist/index.js"]
```

### 8.3. Database Backups

```bash
# Daily cron (3am UTC)
0 3 * * * /usr/local/bin/nexus-backup.sh

# Script: copy .nexus.db to S3 / rsync to NAS
```

### 8.4. Monitoring

- **Uptime**: UptimeRobot (external ping every 5min)
- **Logs**: Structured JSON logs to file + optional Datadog/Sentry
- **Metrics**: Prometheus + Grafana (optional, MVP uses dashboard metrics)

---

## 9. Performance Optimization Checklist

### Backend Optimizations
- [ ] Implement request-level cache (TanStack Query)
- [ ] Cache profile analysis (24h TTL)
- [ ] Parallelize squad calls (Promise.all())
- [ ] Index SQLite on frequently queried fields (profileId, scheduledFor)
- [ ] Compress HTTP responses (gzip)
- [ ] Batch Instagram Graph API calls (max 25 nodes per batch)
- [ ] Lazy-load image processing (on-demand, not pre-gen)

### Frontend Optimizations
- [ ] Code-split routes (Vite)
- [ ] Lazy-load images (IntersectionObserver)
- [ ] Memoize expensive components (React.memo)
- [ ] Debounce caption edits (save after 500ms idle)
- [ ] ServiceWorker for offline profile list
- [ ] Tailwind purge unused styles

### Database Optimizations
- [ ] EXPLAIN QUERY PLAN on slow queries
- [ ] Denormalize: cache `latestEngagementRate` on profiles table
- [ ] Archive old posts (>90 days) to separate table

---

## 10. Path to SaaS (v2+) — Architectural Decisions

**MVP é single-user. Se crescer para SaaS:**

| Aspecto | MVP | SaaS v2 | Change |
|--------|-----|---------|--------|
| **Database** | SQLite local | PostgreSQL | Swap driver + migrations |
| **Auth** | Local (email) | SSO (Google/GitHub) + API keys | Add OAuth providers |
| **Multi-tenancy** | N/A | Tenant ID in every query | Add tenant isolation + RLS |
| **Pricing** | N/A | Usage-based (API calls) + subscription | Add billing service |
| **Rate limits** | None | Per-user API limits | Add rate limiter middleware |
| **Storage** | Local filesystem | S3/Cloudflare R2 | Move image storage |

---

## 11. Key Architectural Decisions (CADs — Captured Architecture Decisions)

| CAD # | Título | Decisão | Alternativas |
|-------|--------|---------|--------------|
| **CAD-001** | Backend Framework | Express v5 | Fastify (rejected: overkill), Nest (rejected: TS overhead) |
| **CAD-002** | Database (MVP) | SQLite | PostgreSQL (rejected: server setup), MongoDB (rejected: wrong data model) |
| **CAD-003** | State Management | TanStack Query + Zustand | Redux (overkill), Context only (perf issues) |
| **CAD-004** | Image Gen | Nando Banana + sharp | DALL-E 3 direct (cost), stable-diffusion (setup overhead) |
| **CAD-005** | Publishing | Playwright MCP | Instagram APIs direct (limited), python-instagram (maintenance) |
| **CAD-006** | Intelligence | Squad + Claude | Single Claude call (less strategic), GPT-4 (cost) |

---

## 12. Next Steps para Stories (Epic 1)

Baseado nesta arquitetura, @sm deverá criar stories em ordem:

### Epic 1: Foundation & Setup (Semanas 1-2)
1. **1.1** Project setup (git, GitHub, CI/CD, linting, TS config)
2. **1.2** Backend: Express server + auth (local register/login)
3. **1.3** Frontend: React structure + login page
4. **1.4** Database: SQLite schema + encryption utilities
5. **1.5** Backend: Instagrapi + Instagram Graph API setup (tokens)
6. **1.6** Frontend: Dark mode toggle + Tailwind setup

### Epic 2: Profile Management (Semanas 2-3)
7. **2.1** OAuth flow: "Connect Instagram Profile" endpoint
8. **2.2** Frontend: Connect profile flow + profile list
9. **2.3** Profile context form (voz, tom, público, objetivos)
10. **2.4** Profile settings: disconnect, edit context

### Epic 3: Intelligence Pipeline (Semanas 3-5)
11. **3.1** Research service: fetch competitors + history (Instagrapi)
12. **3.2** EXA integration: web search para tendências
13. **3.3** Squad orchestration: call marketing-squad agents
14. **3.4** Caption generation: Claude Haiku + frameworks
15. **3.5** Nando Banana integration: gerar imagens
16. **3.6** SVG overlay: text no top/bottom
17. **3.7** Frontend: generation form + preview cards

### Epic 4: Dual Mode (Semanas 5-6)
18. **4.1** Manual mode: approval workflow (steps UI)
19. **4.2** Autopilot mode: toggle + scheduling config
20. **4.3** Generation queue: background jobs para autopilot

### Epic 5: Publishing (Semanas 6-7)
21. **5.1** Playwright MCP integration: publish feed post
22. **5.2** Carousel publishing: N slides com SVG
23. **5.3** Story publishing: 1080x1920 format
24. **5.4** Scheduling: agenda + best time suggestion

### Epic 6: Analytics (Semanas 7-8)
25. **6.1** Instagrapi metrics sync (background job)
26. **6.2** Dashboard: KPI cards + charts
27. **6.3** Per-post analytics: engagement breakdown
28. **6.4** Recommendations: insights baseados em dados

### Epic 7: Polish & QA (Semanas 8-9)
29. **7.1-7.N** Bug fixes, performance tuning, tests, docs, launch checklist

---

## 13. Arquitetura Visual (Deployment Diagram)

```
┌─────────────────────────────────────────────────────────┐
│                  Your VPS / Server                      │
│                                                         │
│  ┌────────────────────────────────────────────────┐   │
│  │  Nginx (HTTPS + reverse proxy)                 │   │
│  │  :443 → :5173 (frontend)                       │   │
│  │  :443/api → :3001 (backend)                    │   │
│  └────────┬─────────────────────┬─────────────────┘   │
│           │                     │                      │
│  ┌────────▼──────┐   ┌─────────▼──────────────┐       │
│  │  Frontend     │   │  Backend (Node.js)     │       │
│  │  (React 18)   │   │  (Express v5)          │       │
│  │  Vite build   │   │  • API routes          │       │
│  │  Static files │   │  • DB + encryption     │       │
│  │  + SW         │   │  • Squad orchestration │       │
│  │  Port :5173   │   │  • Background jobs     │       │
│  │               │   │  Port :3001            │       │
│  └───────────────┘   └──────────┬─────────────┘       │
│                                  │                      │
│                        ┌─────────▼──────────┐          │
│                        │  SQLite Database   │          │
│                        │  .nexus.db         │          │
│                        │  (encrypted tokens)│          │
│                        └────────────────────┘          │
│                                                         │
└─────────────────────────────────────────────────────────┘
         ↑
         │ (HTTPS)
         │
    ┌────▼──────────┐
    │   Your Client │
    │  (Browser)    │
    └───────────────┘


┌──────────────────────────────────────────┐
│     External Services (via HTTP/MCP)     │
├──────────────────────────────────────────┤
│ • Instagram Graph API (OAuth + metrics)  │
│ • Instagrapi (analytics)                 │
│ • Claude API (MCP orchestration)         │
│ • Nando Banana API (image gen)           │
│ • EXA (web search)                       │
│ • Playwright MCP (browser automation)    │
└──────────────────────────────────────────┘
```

---

## Conclusão

A arquitetura de NEXUS é **pragmática, single-user-focused, mas preparada para crescimento**. Cada decisão técnica valoriza:

1. **Velocidade de desenvolvimento** — Express + React + SQLite são bem conhecidos
2. **Performance** — Parallelismo na análise, caching agressivo
3. **Segurança** — OAuth + AES-256-GCM + HTTPS + input validation
4. **Escalabilidade futura** — Abstração de banco de dados, padrão stateless
5. **Developer Experience** — TypeScript, estrutura clara, logging estruturado

A próxima fase é **@sm criar histórias** com base nesta arquitetura, seguindo ordem de dependências (auth → profiles → intelligence → publishing → analytics).

---

**Assinado:** Aria the Visionary 🏗️  
**Data**: 2026-04-07  
**Status**: ✅ Ready for Story Creation
