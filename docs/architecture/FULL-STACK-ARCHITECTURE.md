# NEXUS Platform — Full-Stack Architecture (Completa)

**Status**: ✅ VALIDADO  
**Data**: 2026-04-07  
**Versão**: 1.0  
**Scope**: Frontend + Backend + Database + Intelligence + Integrations

---

## Executive Summary

NEXUS é uma **plataforma pessoal single-user** que orquestra um pipeline de inteligência de 3 camadas (Pesquisa → Análise → Geração) para automatizar criação estratégica de conteúdo no Instagram.

**Arquitetura: Monolítica Pragmática com clara separação de responsabilidades**

- **Frontend**: React 18 + Vite (Dashboard, Perfis, Geração, Analytics)
- **Backend**: Express v5 + Node.js 18+ (API, Orquestração, Business Logic)
- **Database**: SQLite (MVP) → Postgres (v2 SaaS)
- **Intelligence**: Claude (Haiku/Sonnet) + marketing-instagram-squad (MCP)
- **Integrations**: Instagram Graph API, Nando Banana, Playwright MCP, EXA Search, Instagrapi

---

## 1. System Architecture Overview

### 1.1 High-Level Layer Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│                   (React 18 + Vite)                             │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐ │
│  │  Dashboard   │  Profiles    │  Generator   │  Analytics   │ │
│  │  Management  │  Management  │  (Manual/    │  & Reports   │ │
│  │  (multi)     │  + Context   │   Autopilot) │  (Metrics)   │ │
│  └──────────────┴──────────────┴──────────────┴──────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
                                 │ REST API + WebSocket (real-time)
┌────────────────────────────────▼────────────────────────────────┐
│                    API GATEWAY LAYER                            │
│                  (Express v5 Middleware)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Auth (JWT) | CORS | Rate Limit | Error Handler | Logging  │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Route Handlers (REST endpoints organized by feature)      │ │
│  │ • /auth (login, register)                                 │ │
│  │ • /profiles (CRUD + context)                              │ │
│  │ • /content (generate, approve, schedule, list)            │ │
│  │ • /analytics (metrics, reports)                           │ │
│  │ • /admin (settings)                                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└────────────────────────────────┬────────────────────────────────┘
          │                       │                       │
          ▼                       ▼                       ▼
  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
  │   DATA LAYER     │  │ INTELLIGENCE L.  │  │ INTEGRATION L.   │
  │   (SQLite)       │  │ (Claude + Squad) │  │ (External APIs)  │
  └──────────────────┘  └──────────────────┘  └──────────────────┘
```

### 1.2 Technology Stack Decision Matrix

| Layer | Component | Technology | Why | Alternatives |
|-------|-----------|-----------|-----|--------------|
| **Frontend** | Framework | React 18 | Ecosystem maduro, Visual Squad integrada | Vue, Svelte |
| | Build | Vite | 10x mais rápido, HMR instant | Webpack, Esbuild |
| | Styling | Tailwind CSS | Utility-first, responsive, Visual Squad usa | CSS Modules, Styled |
| | State Mgmt | TanStack Query + Zustand | Server state (TQ) + UI state (Zustand) | Redux, Jotai |
| **Backend** | Runtime | Node.js 18+ | JavaScript unificado, event-driven I/O | Python, Go |
| | Framework | Express v5 | Lightweight, zero opinião, perfeito MCP | Fastify, Nest.js |
| | Async | async/await | Native, legível, fácil debug | Promises, callbacks |
| **Database** | MVP | SQLite (local) | Arquivo único, zero setup, backup fácil | sql.js, better-sqlite3 |
| | v2+ | Postgres | Quando migrar para SaaS multi-user | MySQL, MongoDB |
| | Encryption | AES-256-GCM | Native Node.js crypto, tokens seguros | TweetNaCl, libsodium |
| **Intelligence** | Text/Analysis | Claude (MCP) | Haiku para análise rápida, Sonnet para qualidade | GPT-4, Llama |
| | Squad Agents | marketing-instagram-squad | Especialistas integrados (copywriter, analyst) | Custom agents |
| | Web Search | EXA (MCP) | Pesquisa de tendências, concorrentes | Google Search API |
| **Integration** | Instagram | Graph API (official) | Seguro, rate-limited, zero risco banimento | Instagrapi automation |
| | Publishing | Playwright MCP | Automação com delays humanos (backup) | Instagrapi, Selenium |
| | Analytics | Instagrapi | Dados estruturados, fallback se Graph API cair | Direct scraping |
| | Image Gen | Nando Banana (API) | Vinculado via API, customizável | DALL-E 3, Midjourney |
| | Image Proc | sharp | Node.js native, SVG overlay, performance | ImageMagick, Pillow |

---

## 2. Frontend Architecture (React 18 + Vite)

### 2.1 Project Structure

```
packages/frontend/
├── public/
│   └── assets/          # Imagens, ícones
├── src/
│   ├── index.tsx        # Entry point (React.createRoot)
│   ├── App.tsx          # Root component + routing
│   ├── components/      # Reusable components
│   │   ├── Dashboard/        # Dashboard principal (4 seções)
│   │   │   ├── ProfileAnalysis.tsx
│   │   │   ├── ContentManagement.tsx
│   │   │   ├── Competitors.tsx
│   │   │   └── ProfileInfo.tsx
│   │   ├── ProfileSelector/  # Multi-profile switcher
│   │   ├── Generator/        # Content generation flow
│   │   │   ├── ResearchStep.tsx
│   │   │   ├── AnalysisStep.tsx
│   │   │   ├── CaptionStep.tsx
│   │   │   └── VisualStep.tsx
│   │   ├── Scheduler/        # Schedule/approve posts
│   │   ├── Analytics/        # Metrics, charts, reports
│   │   └── Common/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── ThemeToggle.tsx
│   ├── hooks/           # Custom hooks (useProfile, useContent, etc)
│   ├── services/        # API calls (apiClient.ts, profiles.ts, etc)
│   ├── store/           # Zustand stores (UI state)
│   │   ├── uiStore.ts       # Modals, filters, theme
│   │   └── userStore.ts     # Auth user info
│   ├── types/           # TypeScript interfaces (generated from backend)
│   │   ├── profile.ts
│   │   ├── content.ts
│   │   └── analytics.ts
│   ├── utils/           # Helpers (formatters, validators)
│   ├── styles/          # Global styles (Tailwind config)
│   └── queryClient.ts   # TanStack Query configuration
├── tailwind.config.ts   # Tailwind customization
├── vite.config.ts       # Vite build config
└── package.json         # Dependencies
```

### 2.2 Key Components & User Flows

#### Dashboard (4 Seções)

1. **Profile Analysis** 📊
   - Posicionamento (voz, tom, diferencial)
   - Público-alvo (demo, interesses, comportamento)
   - Performance histórica (top posts, padrões)
   - Oportunidades (tendências, gaps)
   - Refresh: 7 dias ou manual

2. **Content Management** 📝
   - Timeline semanal com posts gerados
   - Filtros: Tipo (Reel, Carrossel, Post, Story), Data, Status
   - Preview lado-a-lado com concorrentes
   - Clique em post → Ver pesquisa/análise por trás
   - Ações: Aprovar, editar, deletar, adiar

3. **Competitors** 👥
   - Posts recentes dos concorrentes cadastrados
   - Engajamento deles (benchmarking)
   - Tendências identificadas
   - Ação: Adicionar/remover

4. **Profile Info** ℹ️
   - Upload de mídia/contexto (fotos, vídeos, notícias)
   - Armazenado e referenciado durante geração
   - Exemplo: Cliente envia vídeo de "turma nova" → IA cria post relevante

#### Content Generation Flow (Manual Mode)

```
User clicks "Gerar" (ProfileSelector + Generate button)
        ↓
[1] RESEARCH STEP
    └─ System: Pesquisa concorrentes + web + histórico
    └─ UI: Mostra dados de pesquisa
    └─ User: Aprova continuar
        ↓
[2] ANALYSIS STEP
    └─ System: Análise de viralidade, alinhamento, insights
    └─ UI: Mostra scores, framework recomendado
    └─ User: Aprova continuar
        ↓
[3] CAPTION STEP
    └─ System: Gera caption + hooks + hashtags
    └─ UI: Apresenta proposta com 3 opções de hooks
    └─ User: Aprova, edita ou descarta
        ↓
[4] VISUAL STEP
    └─ System: Gera imagem com Nando Banana
    └─ UI: Preview exato (como fica no Instagram)
    └─ User: Aprova ou regenera
        ↓
[5] SCHEDULE STEP
    └─ System: Sugere melhor horário (com base em histórico)
    └─ UI: Pick date/time ou usar sugestão
    └─ User: Aprova publicação
        ↓
POST SCHEDULED / PUBLISHED (depending on mode)
```

### 2.3 State Management Strategy

**TanStack Query (Server State)**
```typescript
// In services/profiles.ts
import { useQuery, useMutation } from '@tanstack/react-query';

export const useProfiles = (userId: string) => {
  return useQuery({
    queryKey: ['profiles', userId],
    queryFn: () => apiClient.get(`/profiles`),
    staleTime: 5 * 60 * 1000, // 5 min
  });
};

export const useGenerateContent = () => {
  return useMutation({
    mutationFn: (data: GenerateRequest) => 
      apiClient.post('/content/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content'] });
    },
  });
};
```

**Zustand (UI State)**
```typescript
// In store/uiStore.ts
import create from 'zustand';

interface UIState {
  selectedProfileId: string | null;
  setSelectedProfileId: (id: string) => void;
  
  isGeneratorOpen: boolean;
  setGeneratorOpen: (open: boolean) => void;
  
  currentStep: 'research' | 'analysis' | 'caption' | 'visual' | 'schedule';
  setCurrentStep: (step: UIState['currentStep']) => void;
  
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  selectedProfileId: null,
  setSelectedProfileId: (id) => set({ selectedProfileId: id }),
  
  // ... more
}));
```

### 2.4 Styling Strategy (Tailwind CSS)

```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        nexus: {
          50: '#F0F9FF',   // Lightest
          600: '#0EA5E9',  // Primary (Instagram blue-ish)
          900: '#0C2340',  // Darkest
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};
```

---

## 3. Backend Architecture (Express v5 + Node.js 18+)

### 3.1 Project Structure

```
packages/backend/
├── src/
│   ├── index.ts          # App entry + server startup
│   ├── config/
│   │   ├── env.ts        # Environment variables
│   │   └── mcp.ts        # MCP client configuration
│   ├── middleware/
│   │   ├── auth.ts       # JWT verification
│   │   ├── errorHandler.ts
│   │   └── requestLogger.ts
│   ├── routes/
│   │   ├── auth.ts       # Login, register, logout
│   │   ├── profiles.ts   # CRUD profiles, context update
│   │   ├── content.ts    # Generate, approve, schedule, list
│   │   ├── analytics.ts  # Metrics, reports
│   │   └── admin.ts      # Settings, logs
│   ├── controllers/      # Route handlers (business logic)
│   │   ├── authController.ts
│   │   ├── profileController.ts
│   │   ├── contentController.ts
│   │   └── analyticsController.ts
│   ├── services/         # Core business logic
│   │   ├── authService.ts        # Password hash, JWT
│   │   ├── profileService.ts     # Profile CRUD, context mgmt
│   │   ├── contentService.ts     # Orchestrate: research → analysis → gen
│   │   ├── intelligenceService.ts # Call Claude + marketing-squad (MCP)
│   │   ├── publishingService.ts   # Publish via Playwright MCP
│   │   ├── analyticsService.ts    # Fetch metrics via Instagrapi
│   │   └── instagramAuthService.ts # OAuth 2.0 flow
│   ├── db/
│   │   ├── init.ts       # SQLite initialization
│   │   ├── schema.sql    # DDL (all tables)
│   │   ├── encryption.ts # AES-256-GCM token encryption
│   │   └── queries/      # Prepared statements (optional)
│   ├── mcp/              # MCP client wrappers
│   │   ├── claude.ts     # Claude API calls (Haiku, Sonnet)
│   │   ├── squad.ts      # marketing-instagram-squad orchestration
│   │   ├── exa.ts        # EXA web search
│   │   └── playwright.ts # Playwright publishing
│   ├── types/            # TypeScript interfaces
│   │   └── index.ts      # All types
│   ├── utils/
│   │   ├── logger.ts
│   │   ├── errors.ts
│   │   └── validators.ts
│   └── workers/          # Background jobs
│       ├── autopilotWorker.ts     # Cron: autopilot generation
│       ├── publishingWorker.ts    # Cron: publish scheduled
│       └── analyticsWorker.ts     # Cron: fetch metrics
├── docker-compose.yml    # Local dev (if needed)
├── .env.example          # Template
└── package.json
```

### 3.2 Core Service: Content Generation Orchestration

**contentService.ts — Orquestra o pipeline Pesquisa → Análise → Geração**

```typescript
// Pseudo-code (real TypeScript será fornecido durante development)

import { IntelligenceService } from './intelligenceService';
import { PublishingService } from './publishingService';

export class ContentService {
  constructor(
    private intelligence: IntelligenceService,
    private publishing: PublishingService,
    private db: Database,
  ) {}

  async generateContent(
    profileId: string,
    approvalMode: 'manual' | 'autopilot',
  ): Promise<Content> {
    
    // Phase 1: RESEARCH
    const researchData = await this.research(profileId, approvalMode);
    
    // Phase 2: ANALYSIS (parallelizable)
    const analysisData = await this.intelligence.analyze(
      profileId,
      researchData,
      approvalMode,
    );
    
    // Phase 3: GENERATION
    const caption = await this.intelligence.generateCaption(
      profileId,
      researchData,
      analysisData,
      approvalMode,
    );
    
    const image = await this.intelligence.generateImage(
      profileId,
      caption,
      analysisData,
      approvalMode,
    );
    
    const hashtags = await this.intelligence.generateHashtags(
      profileId,
      caption,
      analysisData,
    );
    
    // Store content
    const content = await this.db.content.create({
      profileId,
      researchData,
      analysisData,
      caption,
      hashtags,
      imageUrl: image.url,
      status: approvalMode === 'manual' ? 'draft' : 'pending_publication',
    });
    
    return content;
  }

  private async research(
    profileId: string,
    approvalMode: string,
  ): Promise<ResearchData> {
    const profile = await this.db.profiles.findById(profileId);
    
    const [competitors, webTrends, profileHistory] = await Promise.all([
      this.intelligence.analyzeCompetitors(profile),
      this.intelligence.searchWebTrends(profile),
      this.intelligence.analyzeProfileHistory(profileId),
    ]);
    
    return { competitors, webTrends, profileHistory };
  }

  async approveResearch(contentId: string): Promise<void> {
    await this.db.content.update(contentId, {
      status: 'pending_analysis_approval',
    });
  }

  async publishContent(contentId: string): Promise<void> {
    const content = await this.db.content.findById(contentId);
    
    const result = await this.publishing.publishToInstagram(content);
    
    await this.db.content.update(contentId, {
      status: 'published',
      publishedAt: new Date(),
      instagramPostId: result.postId,
    });
  }

  async scheduleContent(
    contentId: string,
    scheduledFor: Date,
  ): Promise<void> {
    await this.db.content.update(contentId, {
      status: 'scheduled',
      scheduledFor,
    });
    
    // Add to cron queue
    await this.publishing.addToPublishingQueue(contentId, scheduledFor);
  }
}
```

### 3.3 API Endpoints (REST)

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| **POST** | `/auth/register` | Create user account | ❌ |
| **POST** | `/auth/login` | Login, return JWT | ❌ |
| **POST** | `/auth/logout` | Invalidate session | ✅ |
| **GET** | `/profiles` | List user's profiles | ✅ |
| **POST** | `/profiles` | Add new Instagram profile (OAuth) | ✅ |
| **GET** | `/profiles/:id` | Get profile details + context | ✅ |
| **PATCH** | `/profiles/:id` | Update context (voice, tone, etc) | ✅ |
| **DELETE** | `/profiles/:id` | Disconnect profile | ✅ |
| **POST** | `/content/generate` | Start generation (research phase) | ✅ |
| **POST** | `/content/:id/approve-research` | Approve research, continue to analysis | ✅ |
| **POST** | `/content/:id/approve-analysis` | Approve analysis, continue to generation | ✅ |
| **POST** | `/content/:id/approve-caption` | Approve caption, continue to visual | ✅ |
| **POST** | `/content/:id/approve-visual` | Approve visual, go to schedule | ✅ |
| **POST** | `/content/:id/schedule` | Schedule or publish immediately | ✅ |
| **POST** | `/content/:id/regenerate-caption` | Regenerate caption in manual mode | ✅ |
| **POST** | `/content/:id/regenerate-visual` | Regenerate visual in manual mode | ✅ |
| **GET** | `/content?profileId=X` | List content for profile (with filters) | ✅ |
| **GET** | `/content/:id` | Get content details (research, analysis, etc) | ✅ |
| **DELETE** | `/content/:id` | Delete draft/scheduled post | ✅ |
| **GET** | `/analytics?profileId=X` | Dashboard metrics | ✅ |
| **GET** | `/analytics/post/:postId` | Metrics for single post | ✅ |
| **PATCH** | `/profiles/:id/mode` | Toggle autopilot/manual | ✅ |
| **POST** | `/profiles/:id/media-upload` | Upload contextual media | ✅ |

### 3.4 Middleware Stack

```typescript
// src/index.ts

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'express-jwt';
import morgan from 'morgan';

import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profiles';
import contentRoutes from './routes/content';

const app = express();

// Security
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL }));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

// Routes
app.use('/auth', authRoutes);
app.use('/profiles', authMiddleware, profileRoutes);
app.use('/content', authMiddleware, contentRoutes);
app.use('/analytics', authMiddleware, analyticsRoutes);

// Error handling (LAST)
app.use(errorHandler);

app.listen(process.env.PORT || 3001, () => {
  console.log('NEXUS Backend running on port', process.env.PORT);
});
```

---

## 4. Database Layer (SQLite)

### 4.1 Schema Overview

**See `DATA-MODEL.md` for complete DDL**

Key tables:
- **users** — User account (MVP: single user)
- **instagram_profiles** — Connected Instagram accounts (multiple)
- **generated_content** — Posts (with research, analysis, caption, image)
- **competitors** — Competitor profiles tracked
- **media_uploads** — User-uploaded media (for reference during generation)
- **research_cache** — Cached research data (TTL-based)

### 4.2 Encryption for Instagram Tokens

```typescript
// src/db/encryption.ts

import crypto from 'crypto';

export class TokenEncryption {
  private key: Buffer;

  constructor(encryptionKey: string) {
    // Key must be 32 bytes for AES-256
    this.key = Buffer.from(encryptionKey, 'base64');
  }

  encrypt(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(token, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: base64(iv:encrypted:authTag)
    const combined = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    return Buffer.from(combined).toString('base64');
  }

  decrypt(encryptedToken: string): string {
    const combined = Buffer.from(encryptedToken, 'base64').toString();
    const [ivHex, encrypted, authTagHex] = combined.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted;
  }
}
```

### 4.3 Initial Setup (first run)

```typescript
// src/db/init.ts

import sqlite3 from 'better-sqlite3'; // Or sql.js
import fs from 'fs';

export async function initializeDatabase(dbPath: string) {
  const db = new sqlite3(dbPath);
  
  // Execute schema
  const schema = fs.readFileSync('./src/db/schema.sql', 'utf-8');
  db.exec(schema);
  
  console.log('✅ Database initialized');
  
  db.close();
}
```

---

## 5. Intelligence Layer (Claude + Marketing Squad)

### 5.1 Intelligence Service Orchestration

```typescript
// src/services/intelligenceService.ts

import { MCPClient } from '../mcp/claude';
import { SquadClient } from '../mcp/squad';
import { EXAClient } from '../mcp/exa';

export class IntelligenceService {
  constructor(
    private claude: MCPClient,
    private squad: SquadClient,
    private exa: EXAClient,
  ) {}

  // PHASE 1: RESEARCH
  async analyzeCompetitors(profile: Profile): Promise<CompetitorAnalysis[]> {
    const competitorUsernames = JSON.parse(profile.context).brandsToAnalyze;
    
    // Parallel calls to squad's trend-researcher + analytics-agent
    const results = await Promise.all(
      competitorUsernames.map((username: string) =>
        this.squad.call('trend-researcher', {
          action: 'analyze_competitor',
          username,
          targetAudience: profile.context.targetAudience,
        }),
      ),
    );
    
    return results;
  }

  async searchWebTrends(profile: Profile): Promise<TrendData[]> {
    const keywords = JSON.parse(profile.context).targetAudience.interests;
    
    // Use EXA to search trending content
    const trends = await this.exa.search({
      query: `trending ${keywords.join(', ')} instagram 2026`,
      numResults: 10,
      type: 'news', // or 'twitter', 'web'
    });
    
    return trends.map((t) => ({
      trend: t.title,
      volume: 'High', // Would be calculated
      momentum: 'Rising',
      sources: t.domain,
    }));
  }

  async analyzeProfileHistory(
    profileId: string,
  ): Promise<ProfileHistoryAnalysis> {
    // Fetch profile's last 30-100 posts from DB
    const posts = await this.db.content.findByProfile(profileId, {
      limit: 100,
      published: true,
    });
    
    // Calculate patterns
    const avgEngagement = posts.reduce(
      (sum, p) => sum + (p.metrics?.engagement || 0),
      0,
    ) / posts.length;
    
    const bestPerformingType = this.getMostCommonType(posts);
    
    return {
      lastPosts: posts.slice(0, 10),
      averageEngagement: avgEngagement,
      bestPerformingType,
      growthRate: '+5% followers/week', // Would calc from analytics
    };
  }

  // PHASE 2: ANALYSIS
  async analyze(
    profileId: string,
    researchData: ResearchData,
  ): Promise<AnalysisData> {
    const profile = await this.db.profiles.findById(profileId);
    
    // Call marketing-squad's profile-strategist + analytics-agent
    const squadAnalysis = await this.squad.call('profile-strategist', {
      action: 'comprehensive_analysis',
      profile,
      researchData,
    });
    
    return {
      viralScore: squadAnalysis.viralScore,
      viralScoreReasoning: squadAnalysis.reasoning,
      alignmentScore: squadAnalysis.alignmentScore,
      insights: squadAnalysis.insights,
      recommendedFramework: squadAnalysis.framework,
      bestPostingTime: this.calculateBestTime(researchData, profile),
    };
  }

  // PHASE 3: GENERATION
  async generateCaption(
    profileId: string,
    researchData: ResearchData,
    analysisData: AnalysisData,
  ): Promise<string> {
    const profile = await this.db.profiles.findById(profileId);
    
    // Use copywriter from marketing-squad
    const caption = await this.squad.call('copywriter', {
      action: 'generate_caption',
      profile,
      researchData,
      analysisData,
      framework: analysisData.recommendedFramework,
    });
    
    return caption.text;
  }

  async generateHashtags(
    profileId: string,
    caption: string,
    analysisData: AnalysisData,
  ): Promise<string[]> {
    // Use Claude Haiku for lightweight hashtag generation
    const result = await this.claude.call('haiku', {
      prompt: `Generate 15-20 relevant hashtags for this Instagram caption. Format: #hashtag1 #hashtag2...
      
Caption: "${caption}"
      
Trending: ${analysisData.insights.join(', ')}`,
      temperature: 0.7,
      max_tokens: 200,
    });
    
    // Parse hashtags from result
    const hashtags = result.text.match(/#\w+/g) || [];
    return hashtags.slice(0, 20);
  }

  async generateImage(
    profileId: string,
    caption: string,
    analysisData: AnalysisData,
  ): Promise<ImageData> {
    const profile = await this.db.profiles.findById(profileId);
    
    // Call Nando Banana API (external)
    const imageData = await nandoBananaAPI.generate({
      caption,
      style: profile.context.brandColors,
      dimensions: '1080x1350', // Instagram feed post
    });
    
    return {
      url: imageData.url,
      metadata: {
        width: 1080,
        height: 1350,
        format: 'jpeg',
      },
    };
  }
}
```

### 5.2 Marketing Squad Integration

**squad.ts — MCP Client for marketing-instagram-squad**

```typescript
// src/mcp/squad.ts

export class SquadClient {
  private mcpConnection: MCPConnection;

  async call(
    agent: 'profile-strategist' | 'copywriter' | 'trend-researcher' | 'analytics-agent',
    request: Record<string, any>,
  ): Promise<any> {
    // MCP call to @{agent}
    const response = await this.mcpConnection.call(
      `@${agent}`,
      request.action,
      request,
    );
    
    return response;
  }
}
```

---

## 6. Integration Layer (External APIs)

### 6.1 Instagram Graph API Integration

**Purpose**: Authenticate profiles, fetch analytics, publish posts

```typescript
// src/services/instagramAuthService.ts

import { InstagrapiClient } from 'instagrapi';

export class InstagramAuthService {
  async startOAuthFlow(userId: string): Promise<{ url: string; state: string }> {
    // Redirect user to Instagram OAuth consent screen
    const state = crypto.randomBytes(16).toString('hex');
    
    const url = `https://api.instagram.com/oauth/authorize?client_id=${process.env.INSTAGRAM_APP_ID}&redirect_uri=${encodeURIComponent(process.env.INSTAGRAM_CALLBACK_URL)}&scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages&response_type=code&state=${state}`;
    
    // Store state in cache for verification
    await this.cache.set(`oauth_state_${state}`, userId, { ttl: 600 });
    
    return { url, state };
  }

  async handleOAuthCallback(
    code: string,
    state: string,
  ): Promise<{ userId: string; accessToken: string }> {
    // Verify state
    const userId = await this.cache.get(`oauth_state_${state}`);
    if (!userId) throw new Error('Invalid OAuth state');
    
    // Exchange code for access token
    const response = await fetch('https://graph.instagram.com/v19.0/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: process.env.INSTAGRAM_CALLBACK_URL!,
        code,
      }),
    });
    
    const data = await response.json();
    const accessToken = data.access_token;
    
    // Store in DB (encrypted)
    await this.db.profiles.create({
      userId,
      accessToken: this.encryption.encrypt(accessToken),
      // ... other fields
    });
    
    return { userId, accessToken };
  }

  async refreshAccessToken(profileId: string): Promise<void> {
    const profile = await this.db.profiles.findById(profileId);
    const decryptedToken = this.encryption.decrypt(profile.accessToken);
    
    // Graph API handles token refresh automatically
    // But we can check token expiry and refresh if needed
    if (new Date(profile.accessTokenExpiresAt) < new Date()) {
      // Token expired, user needs to re-authorize
      throw new Error('Token expired. Please reconnect your profile.');
    }
  }
}
```

**Publishing via Graph API**

```typescript
// src/services/publishingService.ts

import axios from 'axios';

export class PublishingService {
  async publishToInstagram(content: GeneratedContent): Promise<{ postId: string }> {
    const profile = await this.db.profiles.findById(content.profileId);
    const accessToken = this.encryption.decrypt(profile.accessToken);
    
    // Prepare media
    const imageBuffer = await this.downloadImage(content.imageUrl);
    const uploadResponse = await this.uploadMediaToGraph(
      profile.instagramUserId,
      imageBuffer,
      accessToken,
    );
    
    // Create caption with hashtags + engagement hook
    const fullCaption = `${content.caption}\n\n${content.hashtags}`;
    
    // Publish feed post
    const publishResponse = await axios.post(
      `https://graph.instagram.com/v19.0/${profile.instagramUserId}/media`,
      {
        image_url: uploadResponse.media_id,
        caption: fullCaption,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    
    // Publish (transition from scheduled to published)
    await axios.post(
      `https://graph.instagram.com/v19.0/${publishResponse.data.id}/publish`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    
    return { postId: publishResponse.data.id };
  }

  async uploadMediaToGraph(
    userId: string,
    imageBuffer: Buffer,
    accessToken: string,
  ): Promise<{ media_id: string }> {
    // Upload image to Graph API (temporary container)
    const formData = new FormData();
    formData.append('media_type', 'IMAGE');
    formData.append('image', new Blob([imageBuffer]));
    
    const response = await fetch(
      `https://graph.instagram.com/v19.0/${userId}/media`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
        body: formData,
      },
    );
    
    return response.json();
  }
}
```

### 6.2 Playwright MCP (Backup Publishing)

**Purpose**: Simulate human behavior if Graph API fails (optional)

```typescript
// src/mcp/playwright.ts

export class PlaywrightMCPClient {
  async publishViaPlaywright(
    username: string,
    password: string,
    post: {
      caption: string;
      imageUrl: string;
      hashtags: string[];
    },
  ): Promise<{ success: boolean; postUrl?: string }> {
    // Call Playwright MCP to:
    // 1. Login to Instagram.com as user
    // 2. Click "New Post"
    // 3. Upload image
    // 4. Enter caption
    // 5. Add hashtags
    // 6. Publish
    // 7. Add human-like delays (2-5 sec between actions)
    
    return await this.mcp.call('@playwright', 'publish_instagram_post', {
      username,
      password,
      caption: post.caption,
      imageUrl: post.imageUrl,
      hashtags: post.hashtags,
      delayMin: 2000, // 2 sec
      delayMax: 5000, // 5 sec
    });
  }
}
```

### 6.3 Nando Banana Image Generation

**Purpose**: Generate branded images with captions

```typescript
// src/services/imageGenerationService.ts

import axios from 'axios';

export class ImageGenerationService {
  async generateWithNandoBanana(
    caption: string,
    brandColors: string[],
    dimensions: { width: number; height: number } = { width: 1080, height: 1350 },
  ): Promise<{ url: string; localPath: string }> {
    // Call Nando Banana API
    const response = await axios.post(
      'https://api.nandoex.com/generate',
      {
        caption,
        colors: brandColors,
        width: dimensions.width,
        height: dimensions.height,
        template: 'instagram_feed', // or 'carousel', 'story'
      },
      {
        headers: { Authorization: `Bearer ${process.env.NANDO_BANANA_API_KEY}` },
      },
    );
    
    const imageUrl = response.data.image_url;
    
    // Download and save locally
    const imageBuffer = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
    });
    
    const filename = `content-${uuid()}.jpg`;
    const localPath = path.join(process.env.IMAGES_DIR || './images', filename);
    
    fs.writeFileSync(localPath, imageBuffer.data);
    
    return {
      url: `/images/${filename}`, // Serve locally or CDN
      localPath,
    };
  }

  async generateCarousel(
    slides: Array<{ caption: string; order: number }>,
    brandColors: string[],
  ): Promise<{ urls: string[]; localPaths: string[] }> {
    // Generate multiple slides with SVG overlay for consistency
    const results = [];
    
    for (const slide of slides) {
      const image = await this.generateWithNandoBanana(
        slide.caption,
        brandColors,
        { width: 1080, height: 1350 },
      );
      results.push(image);
    }
    
    return {
      urls: results.map((r) => r.url),
      localPaths: results.map((r) => r.localPath),
    };
  }
}
```

### 6.4 Instagrapi (Analytics Fallback)

**Purpose**: Fetch metrics if Graph API rate limit exceeded

```typescript
// src/services/analyticsService.ts

import { Client as InstagrapiClient } from 'instagrapi';

export class AnalyticsService {
  private instagrapi: InstagrapiClient;

  async fetchPostMetrics(
    profileId: string,
    instagramPostId: string,
  ): Promise<PostMetrics> {
    const profile = await this.db.profiles.findById(profileId);
    
    // Try Graph API first
    try {
      const metrics = await this.fetchFromGraphAPI(
        profile.accessToken,
        instagramPostId,
      );
      return metrics;
    } catch (error) {
      // Fallback to Instagrapi if Graph API fails
      console.warn('Graph API failed, falling back to Instagrapi');
      
      const metrics = await this.instagrapi.getMediaInfo(instagramPostId);
      return {
        likes: metrics.like_count,
        comments: metrics.comment_count,
        shares: 0, // Instagrapi may not provide
        saves: metrics.saved_count || 0,
        reach: 0, // Fallback won't have this
        impressions: 0,
      };
    }
  }

  private async fetchFromGraphAPI(
    accessToken: string,
    mediaId: string,
  ): Promise<PostMetrics> {
    const response = await axios.get(
      `https://graph.instagram.com/v19.0/${mediaId}/insights?metric=engagement,impressions,reach,saved&access_token=${accessToken}`,
    );
    
    const insights = response.data.data.reduce(
      (acc, metric) => ({ ...acc, [metric.name]: metric.values[0].value }),
      {},
    );
    
    return {
      likes: insights.engagement?.likes || 0,
      comments: insights.engagement?.comments || 0,
      shares: insights.engagement?.shares || 0,
      saves: insights.saved || 0,
      reach: insights.reach || 0,
      impressions: insights.impressions || 0,
    };
  }
}
```

### 6.5 EXA Web Search Integration

**Purpose**: Research trending content and competitor analysis

```typescript
// src/mcp/exa.ts

export class EXAClient {
  async search(
    query: string,
    options: {
      numResults?: number;
      type?: 'news' | 'twitter' | 'web';
      domain?: string[];
    } = {},
  ): Promise<SearchResult[]> {
    // Call EXA via MCP
    return await this.mcp.call('@exa', 'web_search', {
      query,
      numResults: options.numResults || 10,
      type: options.type || 'web',
      domain: options.domain,
    });
  }

  async analyzeTrendingHashtags(niche: string): Promise<string[]> {
    const results = await this.search(
      `trending hashtags ${niche} instagram 2026`,
      { type: 'twitter', numResults: 20 },
    );
    
    // Extract hashtags from results
    const hashtags = results
      .flatMap((r) => r.text.match(/#\w+/g) || [])
      .filter((h, i, arr) => arr.indexOf(h) === i) // Unique
      .slice(0, 15);
    
    return hashtags;
  }
}
```

---

## 7. Data Flow Diagrams

### 7.1 Manual Mode Generation Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
└─────────────────────────────────────────────────────────────┘
                           │
                   User clicks "Gerar"
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/generate                                      │
│ ├─ ContentController.generate()                            │
│ └─ ContentService.generateContent(profileId, 'manual')    │
│                           │
│        ┌──────────────────┼──────────────────┐             │
│        │                  │                  │             │
│        ▼                  ▼                  ▼             │
│   ┌────────┐          ┌────────┐       ┌────────┐         │
│   │RESEARCH│          │ANALYSIS│       │GENERATE│         │
│   └────────┘          └────────┘       └────────┘         │
│        │                  │                  │             │
│   Get competitors    Call marketing-squad    │             │
│   + web trends      for analysis + scoring   │             │
│   + profile history                          │             │
│        │                  │                  │             │
│        ▼                  ▼                  ▼             │
│     ResearchData    AnalysisData      Caption + Image      │
│     (stored in DB)                                         │
└────────────────────┬──────────────────────────────────────┘
                     │
        Content saved: status = 'draft'
        Response to frontend: researchData
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
├─────────────────────────────────────────────────────────────┤
│ ResearchStep component shows:                              │
│ - Competitors analyzed                                     │
│ - Trending topics                                          │
│ - Profile history patterns                                │
│ - [Approve] [Discard] buttons                            │
└─────────────────────────────────────────────────────────────┘
                     │
            User clicks [Approve]
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/:id/approve-research                         │
│ └─ ContentService.approveResearch()                       │
│    ├─ Proceed to ANALYSIS phase                           │
│    ├─ Call marketing-squad for scoring                    │
│    └─ Update content status: 'pending_analysis_approval'  │
└────────────────────┬──────────────────────────────────────┘
                     │
        Response: analysisData + recommendedFramework
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
├─────────────────────────────────────────────────────────────┤
│ AnalysisStep component shows:                              │
│ - Viral score: 78/100                                      │
│ - Alignment score: 92%                                     │
│ - Recommended framework: Story-Telling                     │
│ - [Approve] [Adjust] buttons                              │
└─────────────────────────────────────────────────────────────┘
                     │
            User clicks [Approve]
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/:id/approve-analysis                         │
│ └─ ContentService (continue to GENERATION phase)           │
│    ├─ Call squad copywriter for caption                   │
│    ├─ Generate hashtags                                    │
│    ├─ Call Nando Banana for image                         │
│    └─ Update content: status = 'pending_caption_approval' │
└────────────────────┬──────────────────────────────────────┘
                     │
        Response: caption + hooks (3 options) + hashtags
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
├─────────────────────────────────────────────────────────────┤
│ CaptionStep component shows:                               │
│ - Main caption proposal                                    │
│ - 3 hook options (dropdown to select)                      │
│ - Hashtags (editable textarea)                             │
│ - [Approve] [Edit] [Regenerate] buttons                   │
└─────────────────────────────────────────────────────────────┘
                     │
            User clicks [Approve]
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/:id/approve-caption                          │
│ └─ ContentService (continue to VISUAL phase)               │
│    ├─ Generate image with Nando Banana                    │
│    └─ Update content: status = 'pending_visual_approval'  │
└────────────────────┬──────────────────────────────────────┘
                     │
        Response: imageUrl + preview
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
├─────────────────────────────────────────────────────────────┤
│ VisualStep component shows:                                │
│ - Exact preview (as it looks on Instagram)                 │
│ - Caption overlay on image                                 │
│ - [Approve] [Regenerate] buttons                           │
└─────────────────────────────────────────────────────────────┘
                     │
            User clicks [Approve]
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/:id/approve-visual                           │
│ └─ ContentService (go to SCHEDULE phase)                   │
│    └─ Calculate best posting time                          │
│       Status = 'ready_to_schedule'                         │
└────────────────────┬──────────────────────────────────────┘
                     │
        Response: suggestedTime + schedulerUI
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      USER FRONTEND                          │
├─────────────────────────────────────────────────────────────┤
│ ScheduleStep component shows:                              │
│ - Suggested time based on analysis                         │
│ - Calendar picker to override                              │
│ - [Schedule] [Publish Now] buttons                         │
└─────────────────────────────────────────────────────────────┘
                     │
    User chooses time & clicks [Schedule]
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                        │
├─────────────────────────────────────────────────────────────┤
│ POST /content/:id/schedule                                 │
│ └─ ContentService.scheduleContent(contentId, scheduledFor) │
│    ├─ Update DB: status = 'scheduled'                     │
│    ├─ Add to publishing queue (cron job)                  │
│    └─ Return confirmation                                  │
└────────────────────┬──────────────────────────────────────┘
                     │
                     ▼
        Content scheduled! Will publish at 2026-04-08 09:00
```

### 7.2 Autopilot Mode Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    CRON JOB (Autopilot)                    │
├─────────────────────────────────────────────────────────────┤
│ Runs every hour (or configurable interval)                 │
│                                                            │
│ 1. Check all profiles where mode = 'autopilot'            │
│ 2. Check if profile should generate (based on schedule)    │
│ 3. If yes, trigger generation WITHOUT waiting for approval │
│ 4. Skip all 5 steps: go straight through                   │
└────────────────────┬──────────────────────────────────────┘
                     │
          AutopilotWorker calls contentService.generateContent()
          But with mode='autopilot' (no approval steps)
                     │
        ┌────────────┼────────────┬────────────┐
        │            │            │            │
        ▼            ▼            ▼            ▼
    Research      Analysis    Generation   Publish
    (instant)     (instant)    (instant)    (queue)
        │            │            │            │
        └────────────┴────────────┴────────────┘
                     │
        Content created with status = 'scheduled'
        Added to publishing queue
                     │
                     ▼
        ┌─────────────────────────────────────────┐
        │   Publishing Cron Job (e.g., 8 min)     │
        ├─────────────────────────────────────────┤
        │ 1. Get all content with status='ready'  │
        │ 2. Call publishingService.publish()     │
        │ 3. Update status='published'            │
        │ 4. Schedule metrics fetch for tomorrow   │
        └─────────────────────────────────────────┘
                     │
        Post is LIVE on Instagram!
        Metrics fetched tomorrow (24h after publish)
```

---

## 8. Deployment Architecture

### 8.1 Production Environment

```
┌─────────────────────────────────────────────────┐
│          FRONTEND (React SPA)                   │
│  ├─ Hosted on: Vercel / Netlify / Your Server  │
│  ├─ Environment: Node 18+                      │
│  └─ Build: Vite (static HTML/CSS/JS)          │
└────────────────────────────┬────────────────────┘
                             │
                    HTTPS API calls
                             │
┌────────────────────────────▼────────────────────┐
│        BACKEND (Express Server)                 │
│  ├─ Hosted on: Your Server (VPS/Docker)        │
│  ├─ Process Manager: PM2 / systemd              │
│  ├─ Environment: Node 18+ LTS                   │
│  └─ Port: 3001 (with reverse proxy: nginx)     │
└────────────────────────────┬────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
   ┌──────────┐         ┌──────────┐      ┌──────────────┐
   │SQLite DB │         │  .env    │      │  MCP Clients │
   │.nexus.db │         │ Secrets  │      │ (via HTTP)   │
   └──────────┘         └──────────┘      └──────────────┘
        │                                        │
        │                            ┌───────────┼───────────┐
        │                            │           │           │
        ▼                            ▼           ▼           ▼
   ┌─────────┐                 ┌────────┐  ┌───────┐  ┌──────┐
   │  Daily  │                 │Claude  │  │EXA    │  │squad │
   │ Backup  │                 │(MCP)   │  │(MCP)  │  │(MCP) │
   └─────────┘                 └────────┘  └───────┘  └──────┘
```

### 8.2 Environment Variables

```bash
# .env (not committed)

# Database
DATABASE_URL=.nexus.db

# Auth
JWT_SECRET=<32-char-random-string>
JWT_EXPIRES_IN=7d

# Instagram OAuth
INSTAGRAM_APP_ID=<your-app-id>
INSTAGRAM_APP_SECRET=<your-app-secret>
INSTAGRAM_CALLBACK_URL=https://yourdomain.com/auth/instagram/callback

# Encryption
ENCRYPTION_KEY=<base64-32-bytes>

# MCP (Claude API)
ANTHROPIC_API_KEY=<your-api-key>
ANTHROPIC_MODEL_HAIKU=claude-haiku-4-5-20251001
ANTHROPIC_MODEL_SONNET=claude-sonnet-4-6

# Nando Banana
NANDO_BANANA_API_KEY=<your-api-key>

# EXA (if using directly)
EXA_API_KEY=<your-api-key>

# Environment
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
PORT=3001
```

### 8.3 Deployment Checklist

- [ ] Backend: Build & test (`npm run build`, `npm test`)
- [ ] Frontend: Build & test (`npm run build`, `npm run preview`)
- [ ] Database: Run migrations (if any) 
- [ ] Secrets: Load from secure vault (.env.production)
- [ ] Reverse proxy: Configure nginx/Apache with SSL
- [ ] Process manager: Start Express with PM2/systemd
- [ ] Monitoring: Setup uptime checks, error logging
- [ ] Backup: Configure daily DB backup + upload to S3
- [ ] CDN: Optional — serve static assets via Cloudflare

---

## 9. Security Architecture

### 9.1 Authentication & Authorization

```
┌───────────────────────────────────────────────────────┐
│                    USER LOGIN                         │
└───────────────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────┐
│  POST /auth/login                                     │
│  ├─ Validate email + password                        │
│  ├─ Compare passwordHash (bcrypt.compare)            │
│  └─ Generate JWT token (HS256)                       │
└───────────────────────────────────────────────────────┘
             │
             ▼ (JWT in response)
┌───────────────────────────────────────────────────────┐
│              FRONTEND (localStorage)                   │
│  localStorage.setItem('token', jwt)                  │
└───────────────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────┐
│   Subsequent API calls                                │
│   Authorization: Bearer {jwt}                        │
└───────────────────────────────────────────────────────┘
             │
             ▼
┌───────────────────────────────────────────────────────┐
│   Express authMiddleware                              │
│   ├─ Verify JWT signature                            │
│   ├─ Check expiration                                │
│   └─ Attach user to request                          │
└───────────────────────────────────────────────────────┘
             │
      ✅ Proceed to route handler
        or ❌ 401 Unauthorized
```

### 9.2 Token Encryption (Instagram Access Tokens)

**Never store plaintext. Always use AES-256-GCM.**

```typescript
// Store: plaintext → encrypted
const accessToken = 'IGQVJXdlRX...'; // From OAuth
const encrypted = encryptionService.encrypt(accessToken);
db.profiles.update(profileId, { accessToken: encrypted });

// Retrieve: encrypted → plaintext
const encrypted = db.profiles.findById(profileId).accessToken;
const plaintext = encryptionService.decrypt(encrypted);
// Use plaintext to call Graph API
```

### 9.3 HTTPS & CORS

```typescript
// Express setup (in index.ts)
import helmet from 'helmet';
import cors from 'cors';

app.use(helmet()); // Sets security headers
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // Only allow your frontend
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);
```

### 9.4 Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100, // 100 requests per window
  message: 'Too many requests',
});

// Apply to sensitive routes
app.post('/auth/login', limiter, authController.login);
app.post('/content/generate', limiter, contentController.generate);
```

### 9.5 SQL Injection Prevention

**Use parameterized queries (better-sqlite3 does this automatically)**

```typescript
// ✅ SAFE (parameterized)
const stmt = db.prepare('SELECT * FROM profiles WHERE userId = ? AND isConnected = ?');
const result = stmt.all(userId, true);

// ❌ UNSAFE (string concatenation)
const query = `SELECT * FROM profiles WHERE userId = '${userId}'`;
```

---

## 10. Performance Considerations

### 10.1 Load Times Target

| Page/Action | Target | Strategy |
|-----------|--------|----------|
| Dashboard load | < 2s | TanStack Query caching, pagination |
| Content generation | < 30s | Parallel research + analysis |
| API response | < 1s | Indexed DB queries, no N+1 |
| Image generation | < 10s | Nando Banana API, local caching |

### 10.2 Database Query Optimization

```typescript
// ✅ GOOD (indexed, parallelizable)
const [profiles, content, competitors] = await Promise.all([
  db.profiles.findByUserId(userId), // Indexed by userId
  db.content.findByProfileId(profileId, { limit: 50 }), // Indexed
  db.competitors.findByProfileId(profileId), // Indexed
]);

// ❌ BAD (N+1 problem)
const profiles = await db.profiles.findByUserId(userId);
for (const profile of profiles) {
  const content = await db.content.findByProfileId(profile.id); // Loop!
}
```

### 10.3 Caching Strategy

- **TanStack Query** (frontend): Cache API responses, stale time = 5 min
- **research_cache** (database): TTL = 24h for competitors, 12h for trends, 6h for history
- **Image CDN**: Cache generated images with 30-day TTL

---

## 11. Summary: Component Interaction

```
┌─────────────────────────────────────────────────────────┐
│                    USER BROWSER                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Dashboard (Vite SPA)                      │  │
│  │  • TanStack Query (server state)                 │  │
│  │  • Zustand (UI state)                           │  │
│  │  • Tailwind CSS (styling)                       │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────┘
                 │ REST API + WebSocket
                 │
┌────────────────▼─────────────────────────────────────────┐
│                  Express Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Route Handlers (auth, profiles, content, etc)   │  │
│  │ ├─ Controllers (request handling)               │  │
│  │ ├─ Services (business logic)                    │  │
│  │ └─ Middleware (auth, errors, logging)           │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────┬─────────────────────────────────────────┘
     ┌───────────┼───────────┬────────────┬────────────┐
     │           │           │            │            │
     ▼           ▼           ▼            ▼            ▼
 ┌────────┐ ┌────────┐ ┌────────┐  ┌────────┐  ┌─────┐
 │SQLite  │ │Claude  │ │Marketing   │Instag  │  │Other│
 │Local   │ │ MCP    │ │Squad MCP   │Graph   │  │APIs │
 │DB      │ │(Haiku) │ │            │API     │  │     │
 └────────┘ └────────┘ └────────┘  └────────┘  └─────┘
```

---

## Next Steps (Roadmap Integration)

After this architecture document:

1. **@sm (River)** — Draft stories from Epic 1 (Foundation) based on architecture details
2. **@po (Pax)** — Validate stories (10-point checklist)
3. **@visual-designer (Stella)** — Design UI mockups for 4 dashboard sections + generator flow
4. **@dev (Dex)** — Implement stories (Epic 1 → 7)
5. **@qa (Quinn)** — Test & quality gate
6. **@devops (Gage)** — Deploy to production

---

**Document by**: Aria (Architect)  
**Date**: 2026-04-07  
**Status**: ✅ READY FOR IMPLEMENTATION  
**Next Review**: Post-Epic 1 completion
