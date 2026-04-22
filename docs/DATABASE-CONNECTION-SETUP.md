# Database Connection Setup Guide

## Overview

The backend API has been migrated from SQLite to PostgreSQL with Supabase hosting. This document describes the configuration, setup, and troubleshooting process.

## Architecture

### Components

1. **PostgreSQL Database** (Supabase) — Cloud-hosted PostgreSQL instance
2. **Connection Pool** (`packages/backend/src/db/connection.ts`) — Manages active connections
3. **Database Adapter** (`packages/backend/src/config/database.ts`) — Compatibility layer for existing code
4. **Type Definitions** (`packages/backend/src/types/db.ts`) — TypeScript interfaces

### Connection Pooling

- **Min connections**: 5 (default, configurable)
- **Max connections**: 20 (default, configurable)
- **Connection timeout**: 30 seconds
- **Idle timeout**: 5 minutes (connections reused across requests)
- **Retry strategy**: Exponential backoff with circuit breaker

## Setup Instructions

### 1. Environment Variables

Copy the example file and fill in your Supabase connection details:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Supabase connection string:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?sslmode=require
```

### 2. Database Schema

The schema is created and managed by Supabase. To verify your connection:

```bash
# Test connection
npm run db:test
```

This runs a health check to verify the database is accessible.

### 3. Install Dependencies

```bash
npm install
```

The `pg` package is already in package.json. Verify installation:

```bash
npm ls pg
```

### 4. Run Tests

```bash
# Run database connection tests
npm test -- tests/db/connection.test.ts

# Run all tests with coverage
npm run test:coverage
```

## Configuration

### Pool Configuration

Environment variables (in `.env.local`):

```
DB_POOL_MIN=5              # Minimum connections to keep open
DB_POOL_MAX=20             # Maximum connections in pool
DB_CONNECTION_TIMEOUT=30000    # Connection timeout in milliseconds
DB_IDLE_TIMEOUT=300000     # Idle connection timeout (5 minutes)
```

### Retry Configuration

```
DB_RETRY_MAX_ATTEMPTS=3    # Maximum retry attempts for transient errors
DB_RETRY_INITIAL_DELAY=100 # Initial retry delay in milliseconds
DB_RETRY_MAX_DELAY=5000    # Maximum retry delay in milliseconds
```

## Connection Monitoring

### Health Check

```typescript
import { getDatabase } from './src/db/connection';

const db = getDatabase();
const health = await db.healthCheck();
console.log(health);
// Output: { healthy: true, message: "Database healthy. Current time: 2026-04-22..." }
```

### Pool Statistics

```typescript
const db = getDatabase();
const stats = db.getPoolStats();
console.log(stats);
// Output: { totalCount: 10, idleCount: 8, waitingCount: 0 }
```

## Error Handling

### Common Errors and Solutions

#### 1. **Connection Refused**

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution**: Verify DATABASE_URL is set correctly and Supabase instance is running.

```bash
# Check environment variable
echo $DATABASE_URL
```

#### 2. **Authentication Failed**

```
Error: password authentication failed for user "postgres"
```

**Solution**: Verify PostgreSQL password in connection string.

#### 3. **SSL Error**

```
Error: self signed certificate
```

**Solution**: Add `?sslmode=require` to connection string for Supabase.

#### 4. **Connection Pool Exhausted**

```
Error: Connection pool exhausted. Client rejected due to pool exhaustion and no queue accepted.
```

**Solution**: 
- Check if connections are being released properly
- Increase `DB_POOL_MAX` if needed
- Review query execution time (long-running queries hold connections)

#### 5. **Circuit Breaker Open**

```
Error: Database circuit breaker is open. Database appears to be unavailable.
```

**Solution**:
- Circuit breaker opens after 5 consecutive failures
- Wait 30 seconds for automatic reset
- Check database connectivity and logs

## Backward Compatibility

The database adapter provides a compatibility layer to work with existing code:

### SQLite Pattern (Legacy)

```typescript
const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
const user = stmt.get(userId);
```

### PostgreSQL Pattern (Recommended)

```typescript
const users = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
const user = users[0];
```

⚠️ **Migration Note**: The synchronous `prepare().get()` pattern will log warnings. Migrate to async `query()` calls for better performance and reliability.

## Transactions

### Using Transactions

```typescript
import { getDatabase } from './src/db/connection';

const db = getDatabase();
const result = await db.transaction(async (client) => {
  // All queries must use the provided client
  await client.query('INSERT INTO users VALUES ($1)', [newUser]);
  await client.query('INSERT INTO profiles VALUES ($1)', [newProfile]);
  return newUser.id;
});
```

### Transaction Behavior

- All queries within the transaction use the same client connection
- Automatic rollback on error
- Only the transaction result is returned

## Performance Tuning

### For Production

```
DB_POOL_MIN=10         # Keep more connections warm
DB_POOL_MAX=50         # Support more concurrent requests
DB_IDLE_TIMEOUT=600000 # 10 minutes (longer idle timeout for production)
```

### Query Optimization

1. **Use parameterized queries** to prevent SQL injection and improve caching:
   ```typescript
   // Good
   db.query('SELECT * FROM users WHERE email = $1', [email])
   
   // Bad
   db.query(`SELECT * FROM users WHERE email = '${email}'`)
   ```

2. **Create indexes** for frequently queried columns:
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   ```

3. **Monitor slow queries** using PostgreSQL logs.

## Security

### Credentials Management

✅ **DO**:
- Store connection strings in environment variables
- Use `.env.local` (gitignored) for development
- Rotate passwords regularly
- Use SSL/TLS for all connections (`?sslmode=require`)

❌ **DON'T**:
- Commit `.env.local` to version control
- Hardcode passwords in source code
- Log connection strings or credentials
- Use unencrypted connections

### Connection String Security

Supabase provides a secure connection string:

```
postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?sslmode=require
```

Never share this with anyone. If compromised:

1. Reset password in Supabase Dashboard
2. Update environment variables in all deployments
3. Verify no unauthorized access in logs

## Troubleshooting

### Debugging Connection Issues

Enable detailed logging:

```bash
# Set debug flag in .env.local
DEBUG=true
```

### Check Database Status

```bash
# From Supabase Dashboard
# 1. Go to Project Settings → Database
# 2. Check "Connection Info" tab
# 3. Verify connection string and credentials
```

### Test Connection Manually

```bash
# Using psql (if installed locally)
psql "postgresql://postgres:[PASSWORD]@[PROJECT].supabase.co:5432/postgres?sslmode=require"

# Query: \dt
# This lists all tables and verifies connection
```

### Monitor Connection Pool

```typescript
// In your route or service
const db = getDatabase();
console.log('Pool stats:', db.getPoolStats());
console.log('Health:', await db.healthCheck());
```

## Migration Checklist

- [ ] `.env.local` configured with DATABASE_URL
- [ ] `npm install` completed (pg package installed)
- [ ] Database health check passing: `npm run db:test`
- [ ] Connection tests passing: `npm test -- tests/db/connection.test.ts`
- [ ] All API endpoints tested with Supabase backend
- [ ] No hardcoded credentials in source code
- [ ] SSL/TLS enforced in connection string
- [ ] Error logging verified (no credentials in logs)
- [ ] Load testing completed (connection pool sizing validated)

## Support

For issues with:
- **Supabase setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **PostgreSQL**: Refer to [PostgreSQL Docs](https://www.postgresql.org/docs/)
- **pg library**: See [node-postgres Documentation](https://node-postgres.com/)
- **Application errors**: Check backend logs in `packages/backend/`

---

**Last Updated**: 2026-04-22  
**Version**: 1.0  
**Status**: Complete
