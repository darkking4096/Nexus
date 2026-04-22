# Supabase Setup & Migration Guide

**Story:** 8.1.1 — Supabase Setup & Database Migration  
**Last Updated:** 2026-04-22  
**Status:** In Progress

## Quick Start

### 1. Create Supabase Project

```bash
# 1. Go to https://supabase.com
# 2. Sign in / Create account
# 3. Create new project:
#    - Name: NEXUS Marketing
#    - Database password: [generate strong password]
#    - Region: US-East (primary)
#    - Copy connection string
```

### 2. Configure Environment

```bash
# Copy .env.example to .env.local
cp packages/backend/.env.example packages/backend/.env.local

# Add Supabase credentials:
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=true
SQLITE_DB_PATH=packages/backend/data/nexus.db
```

### 3. Apply Schema Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Apply migrations
supabase migration up --db-url postgresql://user:pass@host/db
```

### 4. Run Data Migration (Dry-Run First)

```bash
# Test migration without modifying data
npm run migrate:data -- --dry-run

# If successful, run actual migration
npm run migrate:data
```

### 5. Enable RLS Policies

```bash
# Apply RLS policies (included in migration scripts)
# Policies are applied automatically during migration
```

## Detailed Setup Steps

### Phase 1: Supabase Account Setup

#### 1.1 Create Supabase Account

1. Visit https://supabase.com/dashboard
2. Click "New Project"
3. Enter project details:
   - **Organization:** Use existing or create new
   - **Project Name:** `NEXUS Marketing`
   - **Database Password:** Generate secure password (min 24 chars)
   - **Region:** `US East 1` (primary)
   - **PostgreSQL Version:** 15+
4. Click "Create new project" (5-10 minutes to initialize)

#### 1.2 Configure Connection

1. Navigate to project Settings → Database
2. Copy Connection String (Connection pooler):
   ```
   postgresql://postgres:[password]@[host].supabase.co:5432/postgres
   ```
3. Alternatively, use direct connection (without PgBouncer):
   ```
   postgresql://postgres:[password]@[host].db.supabase.co:5432/postgres
   ```

#### 1.3 Verify Connection from Development Machine

```bash
# Test connection
psql postgresql://user:pass@host/db -c "SELECT 1"

# Or use pg CLI
npm run db:test
```

### Phase 2: Schema Migration

#### 2.1 Backup Production SQLite

```bash
# Create backup before migration
cp packages/backend/data/nexus.db packages/backend/data/nexus.db.backup

# Verify backup
ls -lh packages/backend/data/nexus.db*
```

#### 2.2 Apply Initial Schema

```bash
# Load schema migration
psql $DB_CONNECTION -f packages/backend/migrations/001-initial-schema.sql

# Verify tables created
psql $DB_CONNECTION -c "\dt"
```

#### 2.3 Verify Schema Integrity

```bash
# Check for all expected tables
psql $DB_CONNECTION -c "
  SELECT table_name 
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
  ORDER BY table_name
"

# Check indexes
psql $DB_CONNECTION -c "
  SELECT indexname 
  FROM pg_indexes 
  WHERE schemaname = 'public' 
  ORDER BY indexname
"
```

### Phase 3: Data Migration

#### 3.1 Run Dry-Run Test

```bash
# Test without modifying data
cd packages/backend
npm run migrate:data -- --dry-run

# Check log
cat migration-log.json | jq .
```

#### 3.2 Run Actual Migration

```bash
# Migrate data (with validation)
npm run migrate:data

# Monitor progress in migration-log.json
tail -f migration-log.json
```

#### 3.3 Validate Data Integrity

```bash
# Run validation script
npm run validate:migration

# Should output:
# ✓ Row counts match (SQLite vs PostgreSQL)
# ✓ Foreign key constraints validated
# ✓ No orphaned records detected
# ✓ Data types verified
```

### Phase 4: Row-Level Security (RLS)

#### 4.1 Enable RLS on Tables

```bash
# Apply RLS policies
psql $DB_CONNECTION -f packages/backend/migrations/002-rls-policies.sql

# Verify RLS enabled
psql $DB_CONNECTION -c "
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname = 'public'
"
```

#### 4.2 Test RLS Policies

```bash
# Test service role (system operations)
psql $DB_CONNECTION \
  -v app_current_user_id="'00000000-0000-0000-0000-000000000000'" \
  -v app_current_user_role="'service'" \
  -c "SET app.current_user_id = current_setting('app_current_user_id');
       SELECT COUNT(*) FROM users"

# Test user role (app user access)
psql $DB_CONNECTION \
  -v app_current_user_id="'user-123'" \
  -v app_current_user_role="'user'" \
  -c "SELECT COUNT(*) FROM profiles WHERE user_id = current_setting('app.current_user_id')"
```

### Phase 5: Backup Configuration

#### 5.1 Configure Automated Backups

1. Go to Supabase Dashboard → Settings → Backups
2. Enable automated daily backups
3. Set retention: 30 days (or higher for prod)
4. Set backup time: off-peak hours (e.g., 2:00 AM UTC)

#### 5.2 Test Backup Restore

```bash
# Create test backup
supabase db backup create --db-url $DB_CONNECTION

# List backups
supabase db backup ls --db-url $DB_CONNECTION

# Test restore (in staging environment)
supabase db backup restore --backup-id <backup-id> --db-url $DB_STAGING
```

#### 5.3 Document Restore Procedure

See `BACKUP-RESTORE.md` for detailed restore instructions.

### Phase 6: Performance Baseline

#### 6.1 Measure Query Performance

```bash
# Run queries against PostgreSQL and measure latency

# Query 1: User profiles
psql $DB_CONNECTION -c "
  EXPLAIN ANALYZE
  SELECT p.* FROM profiles p 
  WHERE p.user_id = 'user-123'
"

# Query 2: Content by status
psql $DB_CONNECTION -c "
  EXPLAIN ANALYZE
  SELECT c.* FROM content c 
  WHERE c.profile_id = 'profile-456' 
  AND c.status = 'published'
  ORDER BY c.published_at DESC
  LIMIT 10
"
```

#### 6.2 Establish Baseline Metrics

Create `docs/PERFORMANCE-BASELINES.md` with:
- Average query latency (ms)
- P95/P99 latency
- Index utilization
- Connection pool usage
- CPU/Memory utilization

## Troubleshooting

### Connection Issues

**Error:** `ECONNREFUSED` or `Connection timeout`

```bash
# 1. Verify connection string
echo $DB_CONNECTION

# 2. Test basic connectivity
curl -v telnet://$DB_HOST:$DB_PORT

# 3. Check SSL certificate
openssl s_client -connect $DB_HOST:5432 -showcerts

# 4. Verify credentials
psql postgresql://postgres:$PASSWORD@$DB_HOST/$DB_NAME -c "SELECT 1"
```

### Data Loss

**Error:** `Row count mismatch in migration log`

```bash
# 1. Check migration log
cat migration-log.json | jq '.tables[] | select(.match == false)'

# 2. Compare row counts
# SQLite:
sqlite3 packages/backend/data/nexus.db "SELECT COUNT(*) FROM <table>"

# PostgreSQL:
psql $DB_CONNECTION -c "SELECT COUNT(*) FROM <table>"

# 3. If mismatch, restore backup and retry
cp packages/backend/data/nexus.db.backup packages/backend/data/nexus.db
```

### RLS Policy Errors

**Error:** `new row violates row-level security policy`

```bash
# 1. Verify app context variables are set
SELECT current_setting('app.current_user_id');
SELECT current_setting('app.current_user_role');

# 2. Check policy definition
SELECT * FROM pg_policies WHERE tablename = '<table>';

# 3. Test policy manually
psql $DB_CONNECTION -c "
  SET app.current_user_id = 'user-123';
  SET app.current_user_role = 'user';
  SELECT * FROM profiles LIMIT 1
"
```

## Environment Variables

### Required Variables

```bash
# Database Connection
DB_HOST=your-project.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=true

# Local SQLite (for migration)
SQLITE_DB_PATH=packages/backend/data/nexus.db

# API Configuration
API_URL=http://localhost:5000
API_ENVIRONMENT=development
```

### Example .env.local

```bash
# Database (Supabase)
DB_HOST=zxcvbnmasdf.supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_password
DB_SSL=true

# Backup
BACKUP_SCHEDULE=daily
BACKUP_RETENTION_DAYS=30

# SQLite (source for migration)
SQLITE_DB_PATH=packages/backend/data/nexus.db
```

## Monitoring & Maintenance

### Daily Checks

1. **Backup Status**
   ```bash
   supabase db backup ls --db-url $DB_CONNECTION
   ```

2. **Connection Pool Health**
   ```bash
   # Check active connections
   psql $DB_CONNECTION -c "
     SELECT state, count(*) 
     FROM pg_stat_activity 
     GROUP BY state
   "
   ```

3. **Database Size**
   ```bash
   psql $DB_CONNECTION -c "
     SELECT pg_size_pretty(pg_database_size('postgres'))
   "
   ```

### Weekly Tasks

1. Test restore procedure (in staging)
2. Review slow query logs
3. Analyze index usage
4. Check RLS policy compliance

## Next Steps

- [ ] Complete Phase 2: Schema Migration
- [ ] Complete Phase 3: Data Migration
- [ ] Complete Phase 4: RLS Setup
- [ ] Complete Phase 5: Backup Configuration
- [ ] Complete Phase 6: Performance Baseline
- [ ] Document restore procedures
- [ ] Train team on RLS policies
- [ ] Proceed to Story 8.1.2 (Backend Connection)

## References

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL 15 Docs](https://www.postgresql.org/docs/15/)
- [Row-Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Backup & Restore](https://supabase.com/docs/guides/database/backups)
