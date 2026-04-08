# QA Fix Request — Story 1.7

**Story**: 1.7 — Analytics Benchmark vs. Competitors  
**Gate Verdict**: CONCERNS → Conditional Approval  
**Issued By**: Quinn (@qa)  
**Date**: 2026-04-08  
**Priority**: MEDIUM (3 observations, all non-blocking but recommended to fix before push)

---

## Overview

Story 1.7 passed all 7 quality checks mas tem 3 observações que é melhor corrigir AGORA do que deixar como tech debt. Nenhuma é blocking, mas valem 30 min de trabalho para deixar tudo robusto.

---

## Fix #1: Schema Validation — profiles.competitors_json

**Severity**: MEDIUM  
**Effort**: 5 min  
**Files to Change**: `packages/backend/src/services/BenchmarkService.ts`

### Problem
Linha 209-212, `getStoredCompetitors()` assume que a coluna `competitors_json` existe na tabela `profiles`:

```typescript
const stmt = this.db.prepare(`
  SELECT competitors_json FROM profiles WHERE id = ?
`);
```

Se a coluna não existir no schema de produção, causa erro em runtime.

### Solution
Adicionar verificação de schema no constructor ou startup:

**Option A (Recommended)**: Adicionar migration check na inicialização

```typescript
private validateSchema(): void {
  try {
    const stmt = this.db.prepare(`
      PRAGMA table_info(profiles)
    `);
    const columns = stmt.all() as Array<{ name: string }>;
    const hasCompetitorsJson = columns.some(col => col.name === 'competitors_json');
    
    if (!hasCompetitorsJson) {
      console.warn('[BenchmarkService] WARNING: profiles.competitors_json column not found. Stored competitors feature disabled.');
    }
  } catch (error) {
    console.warn('[BenchmarkService] Could not validate schema:', error);
  }
}
```

Chamar em constructor:
```typescript
constructor(...) {
  // ... existing code
  this.validateSchema();
}
```

**Option B (Simpler)**: Apenas adicionar try-catch melhor documentado (já existe, mas adicionar comment):

```typescript
private getStoredCompetitors(profileId: string): string[] {
  try {
    // Note: assumes profiles.competitors_json column exists (created in migration X)
    // If column missing, fallback to empty array
    const stmt = this.db.prepare(`
      SELECT competitors_json FROM profiles WHERE id = ?
    `);
    // ...rest unchanged
```

**Recommendation**: Option B (minimal change, schema é responsabilidade do @data-engineer). Apenas adicionar JSDoc comment.

---

## Fix #2: Timeout Protection — searchService.searchCompetitors()

**Severity**: MEDIUM  
**Effort**: 15 min  
**Files to Change**: `packages/backend/src/services/BenchmarkService.ts`

### Problem
Linha 94, `searchService.searchCompetitors()` chama API externa (EXA search) sem timeout:

```typescript
const competitorDataList = await this.searchService.searchCompetitors(handles);
```

Se EXA ficar lento ou down, `getBenchmark()` vai ficar pendurado indefinidamente.

### Solution
Adicionar timeout wrapper:

```typescript
/**
 * Helper: Execute promise with timeout
 */
private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
    ),
  ]);
}
```

Usar em `getBenchmark()`:

```typescript
// 3. Search for competitor metrics (with 10s timeout)
const COMPETITOR_SEARCH_TIMEOUT = 10000; // 10 seconds
const competitorDataList = await this.withTimeout(
  this.searchService.searchCompetitors(handles),
  COMPETITOR_SEARCH_TIMEOUT
);

if (competitorDataList.length === 0) {
  throw new Error('No competitor data found');
}
```

Alternativa: Tornar timeout configurável via constructor:

```typescript
constructor(
  db: Database.Database,
  searchService: SearchService,
  analyticsService: AnalyticsService,
  options?: { competitorSearchTimeoutMs?: number }
) {
  this.db = db;
  this.searchService = searchService;
  this.analyticsService = analyticsService;
  this.competitorSearchTimeoutMs = options?.competitorSearchTimeoutMs ?? 10000;
}
```

**Recommendation**: Implementar ambos (configurável + default 10s).

---

## Fix #3: Input Sanitization — Competitor Handles

**Severity**: MEDIUM  
**Effort**: 10 min  
**Files to Change**: `packages/backend/src/services/BenchmarkService.ts`

### Problem
Linha 230, `convertCompetitorDataToMetrics()` não valida handles de competidores:

```typescript
return competitorDataList.map((competitor) => ({
  id: `comp-${competitor.handle}`,  // ← handle não validado
  profile_id: competitor.handle,    // ← poderia conter XSS
  // ...
}));
```

Se `handle` contiver `<script>` ou outras payloads, API response fica vulnerable.

### Solution
Adicionar validação de whitelist:

```typescript
/**
 * Validate competitor handle format (alphanumeric + @ and _)
 */
private validateHandle(handle: string): boolean {
  return /^@?[a-zA-Z0-9_]{1,30}$/.test(handle.trim());
}

/**
 * Convert CompetitorData to Metrics format for benchmark calculation
 * Validates handles against whitelist
 */
private convertCompetitorDataToMetrics(competitorDataList: CompetitorData[]): Metrics[] {
  return competitorDataList
    .filter(competitor => {
      if (!this.validateHandle(competitor.handle)) {
        console.warn(`[BenchmarkService] Invalid handle format: ${competitor.handle}`);
        return false; // Skip invalid handles
      }
      return true;
    })
    .map((competitor) => ({
      id: `comp-${competitor.handle}`,
      profile_id: competitor.handle,
      followers_count: competitor.followersEstimate || 0,
      engagement_rate: typeof competitor.engagementRate === 'string'
        ? parseFloat(competitor.engagementRate)
        : competitor.engagementRate || 0,
      reach: 0,
      impressions: 0,
      collected_at: new Date().toISOString(),
    }));
}
```

Atualizar `getBenchmark()` para validar que temos dados suficientes após filter:

```typescript
const competitorMetrics = this.convertCompetitorDataToMetrics(competitorDataList);

if (competitorMetrics.length === 0) {
  throw new Error('No valid competitor data found');
}
```

**Recommendation**: Implementar validação com filter (silencioso) ou throw (explícito). Filter é mais resiliente.

---

## Implementation Checklist

- [ ] Fix #1: Adicionar comment JSDoc sobre schema dependency em `getStoredCompetitors()`
- [ ] Fix #2: Implementar `withTimeout()` helper + aplicar em `getBenchmark()`
- [ ] Fix #3: Implementar `validateHandle()` + aplicar em `convertCompetitorDataToMetrics()`
- [ ] Run `npm test` — todos 8 testes devem passar ainda
- [ ] Run `npm run lint` — 0 errors
- [ ] Run `npm run typecheck` — 0 errors
- [ ] Commit changes com mensagem:  
  `fix: Add schema validation, timeout protection, and handle sanitization [Story 1.7]`
- [ ] Ping Quinn (@qa) quando pronto, vou revisar e liberar para @devops push

---

## Effort Estimate

- **Total time**: ~30 min (5 + 15 + 10)
- **Complexity**: Low (pattern-based changes, no new logic)
- **Risk**: Minimal (all changes defensive, don't alter happy path)

---

## Questions?

Se algo não ficar claro, chama Quinn (@qa) antes de começar. Melhor perguntar do que interpretar errado.

**Ready?** Bora! 🚀
