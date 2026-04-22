# Test Database Setup Guide

**For:** Story 8.1.2 PostgreSQL Integration Tests  
**Owner:** @dev (@Dex)  
**Blocking:** Test suite execution  
**Effort:** ~30 minutes

---

## Problem

Story 8.1.2 tests are blocked by PostgreSQL test database configuration:

```
Error: SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string
❯ ../../node_modules/pg-pool/index.js:45:11
```

Root cause: `DB_PASSWORD` environment variable is empty or missing.

---

## Solution

### Step 1: Install PostgreSQL Locally (if needed)

```bash
# Windows: Download from https://www.postgresql.org/download/windows/
# macOS: brew install postgresql
# Linux: apt-get install postgresql postgresql-contrib
```

Verify installation:
```bash
psql --version
```

### Step 2: Start PostgreSQL Service

```bash
# Windows (PowerShell as Admin)
Start-Service -Name postgresql-x64-*

# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

### Step 3: Configure Local Database

Connect to PostgreSQL:
```bash
psql -U postgres
```

Create test databases:
```sql
CREATE DATABASE nexus_dev;
CREATE DATABASE nexus_test;
\q
```

### Step 4: Update `.env.local`

Edit `.env.local` in project root:

```env
# Replace these placeholders with your actual PostgreSQL password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nexus_dev
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password

# For tests (separate database)
TEST_DB_HOST=localhost
TEST_DB_PORT=5432
TEST_DB_NAME=nexus_test
TEST_DB_USER=postgres
TEST_DB_PASSWORD=your_actual_postgres_password
```

### Step 5: Run Migrations

```bash
# From project root
supabase db push

# Or manually apply migrations
npm run migrate
```

### Step 6: Verify Connection

Test the connection:
```bash
npm test -- --run 2>&1 | grep "Test Files"
```

Expected output:
```
Test Files  4 passed | 35 failed (39)  ← Should improve after fix
```

---

## Test Files Using PostgreSQL

The following test files require PostgreSQL:

- `packages/backend/tests/migrations/schema-validation.test.ts` (14 tests)
- `packages/backend/tests/db/connection.test.ts` (integration tests)
- Other test fixtures using `createMockDatabase()` helper

---

## Environment Variables Required

| Variable | Required | Example | Purpose |
|----------|----------|---------|---------|
| `DB_HOST` | Yes | `localhost` | PostgreSQL server hostname |
| `DB_PORT` | Yes | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `nexus_dev` | Development database name |
| `DB_USER` | Yes | `postgres` | PostgreSQL user |
| `DB_PASSWORD` | **Yes** | `your_password` | PostgreSQL password (MUST NOT be empty) |
| `DB_SSL` | No | `false` | SSL connection (false for local) |

**CRITICAL:** `DB_PASSWORD` must be a non-empty string. Empty string causes SASL auth error.

---

## Troubleshooting

### Error: "SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string"

**Cause:** `DB_PASSWORD` is empty or not set  
**Fix:** Set actual password in `.env.local`:
```env
DB_PASSWORD=your_postgres_password
```

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Cause:** PostgreSQL service not running  
**Fix:** Start PostgreSQL:
```bash
# Windows
Start-Service -Name postgresql-x64-*

# macOS
brew services start postgresql
```

### Error: "database does not exist"

**Cause:** Database not created  
**Fix:** Create databases:
```bash
psql -U postgres -c "CREATE DATABASE nexus_dev;"
psql -U postgres -c "CREATE DATABASE nexus_test;"
```

---

## Next Steps After Setup

1. Run tests: `npm test -- --run`
2. All tests should pass (or at least not fail with auth errors)
3. Fix remaining test failures (if any)
4. Commit `.env.local` is **NOT** needed (already in .gitignore)
5. Notify @qa when tests pass

---

## Security Notes

- **Never commit `.env.local`** — it's in .gitignore for a reason
- **Use test database** (`nexus_test`) for automated tests
- **Use dev database** (`nexus_dev`) for manual testing
- For staging/production, use Supabase connection string

---

## References

- PostgreSQL documentation: https://www.postgresql.org/docs/
- pg (Node PostgreSQL) docs: https://node-postgres.com/
- Supabase connection strings: https://supabase.com/docs/guides/database/connecting-to-postgres
