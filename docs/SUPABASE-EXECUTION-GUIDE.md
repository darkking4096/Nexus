# Supabase Migration Execution Guide

**Story:** 8.1.1 — Supabase Setup & Database Migration  
**Status:** Ready for Manual Execution  
**Date:** 2026-04-22

## Quick Summary

Você tem **credenciais Supabase prontas**. Agora precisa:
1. Executar SQL schema/RLS no Supabase Dashboard
2. Executar script de migração de dados SQLite → PostgreSQL
3. Validar com testes

## Step 1: Execute SQL Setup no Supabase Dashboard

### 1.1 Abra o SQL Editor

```
Supabase Dashboard → SQL Editor → New query
```

### 1.2 Copie & Cole o Script Completo

Arquivo: `packages/backend/migrations/supabase-complete-setup.sql`

Este arquivo contém **TUDO**:
- ✅ 16 tabelas (users, profiles, content, workflow_states, metrics, etc)
- ✅ 25 índices (otimizados)
- ✅ 40+ RLS policies (security)
- ✅ Migration tracking

### 1.3 Execute (Ctrl+Enter)

Aguarde 10-30 segundos para completar.

**Sucesso:** 
```
Schema and RLS setup complete!
tables_created: 14
```

### 1.4 Verifique Tabelas Criadas

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Deve listar 14 tabelas + schema_migrations.

## Step 2: Executar Data Migration (SQLite → PostgreSQL)

### 2.1 Verifique Credenciais

```bash
cat packages/backend/.env.local

# Deve conter:
# DB_HOST=db.lxhxstsibzmiufiacmfi.supabase.co
# DB_PORT=5432
# DB_NAME=postgres
# DB_USER=postgres
# DB_PASSWORD=Darkking4096.
```

### 2.2 Instale Dependências

```bash
cd packages/backend
npm install pg dotenv
```

### 2.3 Prepare Migration Script

Execute script de migração:

```bash
# Dry-run (teste sem modificar dados)
npm run migrate:data -- --dry-run

# Verificar resultados
cat migration-log.json | jq .
```

Se sucesso (row counts match):
```json
{
  "status": "completed",
  "totalSQLiteRows": 1250,
  "totalPostgresRows": 1250,
  "tables": [
    { "table": "users", "sqliteRows": 50, "postgresRows": 50, "match": true },
    { "table": "profiles", "sqliteRows": 100, "postgresRows": 100, "match": true },
    ...
  ]
}
```

### 2.4 Executar Migração Real

```bash
npm run migrate:data
```

Aguarde 1-5 minutos dependendo do volume de dados.

**Sucesso:**
```
✅ All migrations completed successfully
Total rows migrated: 1250
```

## Step 3: Validar Setup

### 3.1 Executar Testes de Schema

```bash
npm run test:migrations -- schema-validation.test.ts
```

**Esperado:** 18/18 testes PASS

```
✓ Should have all required tables (1)
✓ Should have users table with correct columns (2)
✓ Should have RLS enabled on all tables (3)
... (18 total)
```

### 3.2 Verificar RLS Policies

No Supabase Dashboard → SQL Editor:

```sql
-- Contar políticas RLS criadas
SELECT tablename, COUNT(*) as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Deve mostrar ~3 policies por tabela (service, user, operations)
```

### 3.3 Testar RLS Manualmente

```sql
-- Teste 1: Service role (acesso total)
SET app.current_user_role = 'service';
SELECT COUNT(*) FROM users;  -- Deve retornar count

-- Teste 2: User role isolado
SET app.current_user_role = 'user';
SET app.current_user_id = 'user-123';
SELECT COUNT(*) FROM users;  -- Retorna 0 (RLS ativo!)
```

## Step 4: Backup Configuration

### 4.1 Ativar Backups Automáticos

No Supabase Dashboard:

```
Settings → Backups → Enable daily backups
```

Configure:
- **Frequency:** Daily
- **Time:** 02:00 UTC (off-peak)
- **Retention:** 30 days

### 4.2 Testar Restore Procedure

```bash
# Criar backup manual
supabase db backup create --db-url $DB_CONNECTION

# Listar backups
supabase db backup ls --db-url $DB_CONNECTION

# (No staging) Testar restore
supabase db backup restore --backup-id <id> --db-url $DB_STAGING
```

## Step 5: Performance Baseline

### 5.1 Medir Query Performance

No Supabase SQL Editor:

```sql
-- Query 1: User profiles
EXPLAIN ANALYZE
SELECT p.* FROM profiles p 
WHERE p.user_id = 'user-123'
LIMIT 10;

-- Query 2: Content by status
EXPLAIN ANALYZE
SELECT c.* FROM content c 
WHERE c.profile_id = 'profile-456'
AND c.status = 'published'
ORDER BY c.published_at DESC
LIMIT 10;

-- Anotar execution time (Planning + Execution)
```

Salve como baseline em `docs/PERFORMANCE-BASELINES.md`:

```markdown
## Query Performance Baselines (2026-04-22)

| Query | Planning | Execution | Total | Notes |
|-------|----------|-----------|-------|-------|
| User profiles | 0.2ms | 1.2ms | 1.4ms | Single index lookup |
| Content by status | 0.3ms | 2.1ms | 2.4ms | Two index scans |
```

## Troubleshooting

### ❌ "connection refused" / "connection timeout"

```bash
# Verificar credenciais
echo $DB_HOST
echo $DB_PASSWORD

# Testar conexão diretamente
psql -h $DB_HOST -U postgres -d postgres -c "SELECT 1"
# (Instale psql se necessário)
```

### ❌ "Row count mismatch in migration"

```bash
# Verificar a tabela problemática
sqlite3 packages/backend/data/nexus.db "SELECT COUNT(*) FROM <table>"

# PostgreSQL
psql $DB_CONNECTION -c "SELECT COUNT(*) FROM <table>"

# Se diferente: restaurar backup SQLite e retry
```

### ❌ "RLS policy violates..."

Significa RLS está funcionando (bloqueando acesso não autorizado). Teste:

```sql
-- Defina contexto explicitamente
SET app.current_user_id TO 'user-123';
SET app.current_user_role TO 'user';

-- Agora deve funcionar
SELECT * FROM profiles WHERE user_id = 'user-123';
```

## Checklist de Conclusão

- [ ] SQL setup executado no Supabase Dashboard
- [ ] 14 tabelas criadas (verificar com `\dt`)
- [ ] RLS policies ativas (verificar com `SELECT * FROM pg_policies`)
- [ ] Data migration completo (verificar migration-log.json)
- [ ] Schema validation tests PASS (18/18)
- [ ] Backup schedule configurado
- [ ] Performance baseline medido
- [ ] Documentação atualizada

## Próximos Passos

✅ Story 8.1.1 Completo!

→ Proceda com **Story 8.1.2**: Backend Supabase Connection

## Files Reference

| File | Purpose | Status |
|------|---------|--------|
| `supabase-complete-setup.sql` | Combined schema + RLS setup | ✅ Ready |
| `migrate-data.ts` | SQLite → PostgreSQL migration | ✅ Ready |
| `schema-validation.test.ts` | Validation tests | ✅ Ready |
| `.env.local` | Credentials (configured) | ✅ Ready |

## Support

Problemas? Verifique:
1. `docs/SUPABASE-SETUP.md` — Documentação completa
2. `migration-log.json` — Log de migração de dados
3. Supabase Dashboard → Logs
4. Supabase Documentation: https://supabase.com/docs
