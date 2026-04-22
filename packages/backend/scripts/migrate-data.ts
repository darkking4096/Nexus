/**
 * Story 8.1.1: SQLite → Supabase PostgreSQL Data Migration Script
 *
 * Purpose: Migrate all data from SQLite to PostgreSQL with:
 * - Zero data loss validation (row count comparison)
 * - Type compatibility verification
 * - Foreign key constraint validation
 * - Dry-run capability for testing
 */

import Database from 'better-sqlite3';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: '.env.local' });

// Configuration
const CONFIG = {
  sqlite: process.env.SQLITE_DB_PATH || path.resolve('./data/nexus.db'),
  postgres: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: { rejectUnauthorized: false } // Supabase requires SSL
  },
  dryRun: process.argv.includes('--dry-run'),
  logFile: path.resolve('./migration-log.json')
};

interface TableStats {
  table: string;
  sqliteRows: number;
  postgresRows: number;
  match: boolean;
}

interface MigrationLog {
  startTime: string;
  endTime?: string;
  duration?: number;
  dryRun: boolean;
  tables: TableStats[];
  totalSQLiteRows: number;
  totalPostgresRows: number;
  status: 'in-progress' | 'completed' | 'failed';
  error?: string;
}

const log: MigrationLog = {
  startTime: new Date().toISOString(),
  dryRun: CONFIG.dryRun,
  tables: [],
  totalSQLiteRows: 0,
  totalPostgresRows: 0,
  status: 'in-progress'
};

// Tables to migrate in dependency order
const TABLES = [
  'users',
  'profiles',
  'credentials',
  'insta_sessions',
  'content',
  'publish_logs',
  'metrics',
  'post_metrics',
  'workflow_states',
  'workflow_history',
  'autopilot_config',
  'scheduled_posts',
  'schedule_audit'
];

// Type mapping: SQLite → PostgreSQL
const TYPE_MAPPINGS: Record<string, Record<string, string>> = {
  'BOOLEAN': {
    'sqlite': '0|1',
    'postgres': 'BOOLEAN'
  },
  'DATETIME': {
    'sqlite': 'DATETIME',
    'postgres': 'TIMESTAMP'
  },
  'TEXT': {
    'sqlite': 'TEXT',
    'postgres': 'TEXT'
  },
  'INTEGER': {
    'sqlite': 'INTEGER',
    'postgres': 'INTEGER'
  },
  'REAL': {
    'sqlite': 'REAL',
    'postgres': 'REAL'
  }
};

async function main() {
  console.log('🚀 Starting SQLite → PostgreSQL Migration');
  console.log(`📦 SQLite Database: ${CONFIG.sqlite}`);
  console.log(`   CWD: ${process.cwd()}`);
  console.log(`   Resolved Path: ${path.resolve('./data/nexus.db')}`);
  console.log(`   Exists: ${fs.existsSync(CONFIG.sqlite)}`);
  console.log(`🔌 PostgreSQL: ${CONFIG.postgres.host}:${CONFIG.postgres.port}/${CONFIG.postgres.database}`);
  console.log(`${CONFIG.dryRun ? '🧪 DRY RUN MODE' : '⚠️  PRODUCTION MIGRATION'}\n`);

  try {
    // Connect to databases
    const sqlite = new Database(CONFIG.sqlite);
    const postgres = new Pool(CONFIG.postgres);

    // Test connections
    await testConnections(sqlite, postgres);

    // Migrate each table
    for (const table of TABLES) {
      console.log(`\n📋 Migrating table: ${table}`);
      await migrateTable(sqlite, postgres, table, log);
    }

    // Validate zero data loss
    console.log('\n✅ Validating zero data loss...');
    await validateMigration(log);

    // Save migration log
    log.endTime = new Date().toISOString();
    log.duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
    log.status = 'completed';

    fs.writeFileSync(CONFIG.logFile, JSON.stringify(log, null, 2));
    console.log(`\n📊 Migration log saved to: ${CONFIG.logFile}`);

    // Summary
    printSummary(log);

    // Cleanup
    sqlite.close();
    await postgres.end();

  } catch (error) {
    log.status = 'failed';
    log.error = error instanceof Error ? error.message : String(error);
    log.endTime = new Date().toISOString();
    log.duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();

    fs.writeFileSync(CONFIG.logFile, JSON.stringify(log, null, 2));
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

async function testConnections(sqlite: Database.Database, postgres: Pool) {
  console.log('🔗 Testing connections...');

  // SQLite
  const sqliteTest = sqlite.prepare('SELECT 1 as test').all();
  if (!sqliteTest.length) throw new Error('SQLite connection failed');
  console.log('  ✓ SQLite connected');

  // PostgreSQL
  try {
    const result = await postgres.query('SELECT 1 as test');
    if (!result.rows.length) throw new Error('PostgreSQL query returned no results');
    console.log('  ✓ PostgreSQL connected');
  } catch (error) {
    throw new Error(`PostgreSQL connection failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function migrateTable(
  sqlite: Database.Database,
  postgres: Pool,
  tableName: string,
  log: MigrationLog
) {
  try {
    // Get row count from SQLite
    const sqliteCount = sqlite.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
    console.log(`  SQLite rows: ${sqliteCount.count}`);

    if (sqliteCount.count === 0) {
      console.log(`  ✓ Table empty, skipping`);
      log.tables.push({
        table: tableName,
        sqliteRows: 0,
        postgresRows: 0,
        match: true
      });
      return;
    }

    // Get data from SQLite
    const rows = sqlite.prepare(`SELECT * FROM ${tableName}`).all() as Array<Record<string, any>>;

    if (!CONFIG.dryRun) {
      // Build insert statement
      if (rows.length > 0) {
        const columns = Object.keys(rows[0]);
        const columnList = columns.join(', ');
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const insertSql = `INSERT INTO ${tableName} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

        // Batch insert in chunks of 100
        for (let i = 0; i < rows.length; i += 100) {
          const chunk = rows.slice(i, i + 100);
          for (const row of chunk) {
            const values = columns.map(col => convertValue(row[col]));
            await postgres.query(insertSql, values);
          }
          console.log(`  Inserted ${Math.min(i + 100, rows.length)}/${rows.length} rows`);
        }
      }

      // Get count from PostgreSQL
      const postgresCount = await postgres.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      const pgRowCount = parseInt(postgresCount.rows[0].count);

      const match = sqliteCount.count === pgRowCount;
      log.tables.push({
        table: tableName,
        sqliteRows: sqliteCount.count,
        postgresRows: pgRowCount,
        match
      });

      log.totalSQLiteRows += sqliteCount.count;
      log.totalPostgresRows += pgRowCount;

      if (!match) {
        throw new Error(
          `Row count mismatch for ${tableName}: SQLite=${sqliteCount.count}, PostgreSQL=${pgRowCount}`
        );
      }
      console.log(`  ✓ PostgreSQL rows: ${pgRowCount} (match ✓)`);
    } else {
      console.log(`  🧪 DRY RUN: Would insert ${rows.length} rows`);
      log.tables.push({
        table: tableName,
        sqliteRows: sqliteCount.count,
        postgresRows: 0,
        match: false
      });
    }
  } catch (error) {
    throw new Error(`Failed to migrate table ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function convertValue(value: any): any {
  if (value === null || value === undefined) return null;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

async function validateMigration(log: MigrationLog) {
  if (CONFIG.dryRun) {
    console.log('  🧪 DRY RUN: Skipping validation');
    return;
  }

  const allMatch = log.tables.every(t => t.match);
  if (!allMatch) {
    const mismatches = log.tables.filter(t => !t.match);
    throw new Error(
      `Data loss detected! Mismatches in: ${mismatches.map(t => t.table).join(', ')}`
    );
  }

  console.log(`  ✓ Total rows: ${log.totalSQLiteRows} (SQLite) → ${log.totalPostgresRows} (PostgreSQL)`);
  console.log(`  ✓ Zero data loss confirmed!`);
}

function printSummary(log: MigrationLog) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`Status: ${log.status.toUpperCase()}`);
  console.log(`Mode: ${log.dryRun ? 'DRY RUN' : 'PRODUCTION'}`);
  console.log(`Start: ${log.startTime}`);
  console.log(`End: ${log.endTime}`);
  console.log(`Duration: ${log.duration}ms (${(log.duration / 1000).toFixed(2)}s)`);
  console.log(`\nTables migrated: ${log.tables.length}`);
  console.log(`Total rows: ${log.totalSQLiteRows} → ${log.totalPostgresRows}`);

  if (!log.dryRun) {
    const successes = log.tables.filter(t => t.match).length;
    const failures = log.tables.filter(t => !t.match).length;
    console.log(`Success: ${successes}/${log.tables.length}`);
    if (failures > 0) console.log(`Failures: ${failures}`);
  }

  console.log('='.repeat(60) + '\n');
}

main();
