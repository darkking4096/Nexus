---
epicId: "8.1"
title: "Migração Vercel + Supabase"
status: "Draft"
created: "2026-04-22"
owner: "Morgan (PM)"
---

# Epic 8.1: Migração Vercel + Supabase — Infrastructure Modernization

## Epic Goal

Modernizar a infraestrutura do NEXUS Platform para rodar **Frontend no Vercel** (URL pública) e **Backend local** com **PostgreSQL no Supabase**, eliminando dependências locais (SQLite) e habilitando deploy contínuo.

## Epic Description

### Existing System Context

- **Frontend:** React + Vite (localhost:5173), pronto para deploy
- **Backend:** Express API (localhost:5000), 30+ serviços complexos (Playwright, geração de conteúdo)
- **Database:** SQLite local com better-sqlite3 (não escalável para production)
- **Cache:** Redis local (será reconfigurado)
- **Deployment:** Nenhum (tudo local)

### Enhancement Details

**O que está sendo adicionado:**
1. PostgreSQL no Supabase como BD remoto
2. Vercel como host frontend com CI/CD automático
3. API backend exposta (local com ngrok ou similar para dev)
4. Migração zero-downtime de SQLite → PostgreSQL

**Como integra:**
- Frontend faz requests para API backend (mesmo em local, exposição via tunnel ou remoto)
- Backend conecta a Supabase via connection string
- Redis mantém função de cache (local ou remoto, TBD)
- Testes E2E validam fluxo completo

**Success Criteria:**
- [ ] Frontend rodando em URL Vercel pública
- [ ] Backend conectado a PostgreSQL Supabase
- [ ] Dados migrados sem perda
- [ ] API acessível do frontend
- [ ] Testes E2E passando
- [ ] Zero downtime durante migração

### Technology Stack

| Componente | Atual | Novo |
|-----------|-------|------|
| Frontend | React + Vite (local) | React + Vite (Vercel) |
| Backend | Express (localhost) | Express (localhost ou remoto) |
| Database | SQLite (local) | PostgreSQL (Supabase) |
| Cache | Redis (local) | Redis (TBD: local ou Upstash) |
| Deployment | Manual | CI/CD (Vercel + GitHub) |

### Integration Points

1. **Frontend → Backend:** CORS config, URL dinâmica
2. **Backend → Supabase:** Connection string, driver pg, migrations
3. **CI/CD:** GitHub Actions (Vercel auto-deploy)
4. **Secrets:** Environment variables (Vercel, .env local)

---

## Stories

### Story 8.1.1: Supabase Setup & Database Migration

**Description:**  
Criar projeto Supabase, migrar schema de SQLite → PostgreSQL, validar dados, configurar RLS policies.

**Executor Assignment:** `@data-engineer`  
**Quality Gate:** `@dev`  
**Quality Gate Tools:** `[schema_validation, migration_review, rls_test, performance_baseline]`

**Quality Gates:**
- **Pre-Commit:** Schema validation (tables, indexes, constraints)
- **Pre-PR:** Migration test (dry-run em staging), RLS policies review

**Risk Level:** HIGH (envolve migração de dados)  
**Complexity:** 13 points (schema reverse-engineering, data migration, testing)

**Dependencies:** None (primeira story)

---

### Story 8.1.2: Backend Supabase Connection & Environment Setup

**Description:**  
Substituir better-sqlite3 por driver PostgreSQL, atualizar connection string, configurar .env, testar conexão em dev e staging.

**Executor Assignment:** `@dev`  
**Quality Gate:** `@architect`  
**Quality Gate Tools:** `[code_review, security_scan, integration_test]`

**Quality Gates:**
- **Pre-Commit:** Security scan (sem hardcoded secrets), error handling
- **Pre-PR:** Integration test (backend conecta a Supabase), backward compatibility

**Risk Level:** MEDIUM (dependência no Supabase, fallback é SQLite local)  
**Complexity:** 8 points (driver swap, env config, test setup)

**Dependencies:** Story 8.1.1 (Supabase pronto)

---

### Story 8.1.3: Frontend Vercel Deploy & CI/CD

**Description:**  
Conectar repositório GitHub a Vercel, configurar build/preview/production, testar CI/CD pipeline, validar URL pública.

**Executor Assignment:** `@devops`  
**Quality Gate:** `@architect`  
**Quality Gate Tools:** `[build_validation, environment_consistency, performance_monitoring]`

**Quality Gates:**
- **Pre-Commit:** Build validation (npm build sem erros)
- **Pre-PR:** Environment consistency (vars corretas em prod/preview)
- **Pre-Deployment:** Performance monitoring (Core Web Vitals baseline)

**Risk Level:** LOW (Vercel é robusto, rollback é trivial)  
**Complexity:** 5 points (Vercel config, GitHub integration, secrets)

**Dependencies:** None (pode rodar em paralelo com 8.1.2)

---

### Story 8.1.4: E2E Testing & Validation

**Description:**  
Validar fluxo completo: Frontend Vercel → Backend API → Supabase. Testes de integração, performance, edge cases.

**Executor Assignment:** `@qa`  
**Quality Gate:** `@dev`  
**Quality Gate Tools:** `[e2e_test_validation, performance_test, security_smoke_test]`

**Quality Gates:**
- **Pre-Commit:** E2E test coverage (happy path + edge cases)
- **Pre-PR:** Performance test (latency, load testing), security smoke test
- **Pre-Deployment:** Regression test (dados não perdidos)

**Risk Level:** MEDIUM (integração complexa, possível timeout/latency)  
**Complexity:** 8 points (Playwright tests, performance benchmarks)

**Dependencies:** Stories 8.1.1, 8.1.2, 8.1.3 (todas as partes prontas)

---

## Rollout Strategy

**Fase 1 (Backend-First):**
1. ✅ Story 8.1.1: Supabase setup (0-2 dias)
2. ✅ Story 8.1.2: Backend connection (1-2 dias)
3. ⏳ Story 8.1.3: Vercel deploy (pode rodar em paralelo, 1 dia)
4. ✅ Story 8.1.4: E2E tests (1 dia, após 1-3)

**Timeline:** ~5-7 dias (backend-first reduz risco de frontend quebrado)

---

## Compatibility Requirements

- [ ] Todas as APIs Express permanecem iguais (backward compat)
- [ ] Schema PostgreSQL é compatível com queries SQLite existentes (adaptar onde needed)
- [ ] Frontend usa mesmos endpoints (só muda URL/domínio)
- [ ] Sem downtime durante migração (dual-write pattern considerado)

---

## Risk Mitigation

| Risco | Impacto | Mitigação | Rollback |
|-------|--------|-----------|----------|
| Perda de dados SQLite → PG | CRÍTICO | Backup antes da migração, dry-run, validação pós-migração | Restaurar de backup |
| Backend não conecta a Supabase | CRÍTICO | Testes em staging, connection pooling, retry logic | Voltar para SQLite local |
| Vercel build falha | ALTO | Testes locais, staging preview antes de prod | Rollback automático (GitHub integration) |
| Performance degrada | MÉDIO | Load testing, index strategy, cache optimization | Upgrade Supabase plan ou voltar SQLite |
| CORS/API access fails | ALTO | Testar de diferentes origins, dev tunneling (ngrok) | Configurar CORS whitelist dinâmico |

**Quality Assurance Strategy:**
- **CodeRabbit Validation**: Todas as stories incluem reviews pré-commit
  - 8.1.1: Schema compliance, migration safety
  - 8.1.2: Security scan, error handling
  - 8.1.3: Build validation, environment consistency
  - 8.1.4: E2E coverage, performance baselines

- **Specialized Expertise:**
  - @data-engineer: Schema design, migration strategy
  - @dev: Connection logic, error handling, integration
  - @devops: CI/CD setup, environment management
  - @qa: Testing strategy, validation

- **Quality Gates Aligned with Risk:**
  - 8.1.1 (HIGH): Pre-Commit + Pre-PR + dry-run validation
  - 8.1.2 (MEDIUM): Pre-Commit + Pre-PR + integration test
  - 8.1.3 (LOW): Pre-Commit + Pre-PR
  - 8.1.4 (MEDIUM): Pre-Commit + Pre-PR + perf test

---

## Definition of Done

- [ ] Todos os dados migrados sem perda
- [ ] Frontend rodando em Vercel com URL pública
- [ ] Backend conectado a Supabase e funcional
- [ ] API acessível do frontend (CORS ok)
- [ ] Testes E2E passando (happy path + edge cases)
- [ ] Performance aceitável (latency < 200ms)
- [ ] Documentação atualizada (.env, secrets, procedures)
- [ ] Rollback plan documentado e testado

---

## Handoff to Story Manager (@sm)

"Por favor desenvolva histórias de usuário detalhadas para esta epic brownfield. Considerações-chave:

- Esta é uma migração de infraestrutura em um sistema existente (Express + React + SQLite)
- Pontos de integração críticos: Frontend → Backend → Supabase
- Padrões existentes a seguir: Estrutura monorepo, TypeScript, testes com Vitest
- Requisitos críticos de compatibilidade: Zero downtime, sem perda de dados
- Cada story deve incluir verificação que a funcionalidade existente permanece intacta

A epic deve manter a integridade do sistema enquanto entrega modernização de infraestrutura e deploy contínuo."

---

## Stories Created

✅ **2026-04-22:** All 4 user stories created and ready for @po validation:

1. **Story 8.1.1: Supabase Setup & Database Migration** — @data-engineer executes
   - File: `docs/stories/8.1.1.supabase-setup-and-migration.md`
   - Status: Draft (ready for @po validation)
   - Complexity: XL (13 points - HIGH risk)
   - AC: 22 items covering Supabase setup, schema migration, data migration, RLS, backup/restore

2. **Story 8.1.2: Backend Supabase Connection & Environment Setup** — @dev executes
   - File: `docs/stories/8.1.2.backend-supabase-connection.md`
   - Status: Draft (ready for @po validation)
   - Complexity: M (8 points - MEDIUM risk)
   - AC: 20 items covering driver migration, connection pooling, error handling, environment config
   - Depends: Story 8.1.1

3. **Story 8.1.3: Frontend Vercel Deploy & CI/CD** — @devops executes
   - File: `docs/stories/8.1.3.frontend-vercel-deploy.md`
   - Status: Draft (ready for @po validation)
   - Complexity: S (5 points - LOW risk)
   - AC: 27 items covering Vercel setup, CI/CD, performance monitoring, domain/SSL
   - Parallel: Can run alongside Story 8.1.2

4. **Story 8.1.4: E2E Testing & Validation** — @qa executes
   - File: `docs/stories/8.1.4.e2e-testing-validation.md`
   - Status: Draft (ready for @po validation)
   - Complexity: M (8 points - MEDIUM risk)
   - AC: 28 items covering E2E tests, performance testing, security testing, regression testing
   - Depends: Stories 8.1.1, 8.1.2, 8.1.3

## Change Log

- **2026-04-22:** All 4 user stories created by River (@sm) — Ready for @po validation
  - Story 8.1.1: Supabase Setup (13 points, @data-engineer)
  - Story 8.1.2: Backend Connection (8 points, @dev)
  - Story 8.1.3: Vercel Deploy (5 points, @devops)
  - Story 8.1.4: E2E Testing (8 points, @qa)
  - Total: 34 story points, ~5-7 days estimated

- **2026-04-22:** Epic criado por Morgan (PM) — Status Draft, 4 stories, backend-first rollout
