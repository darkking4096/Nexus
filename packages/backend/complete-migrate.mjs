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

const dryRun = process.argv.includes('--dry-run');
const sqlitePath = path.join(__dirname, 'data', 'nexus.db');
const logFile = path.join(__dirname, 'migration-log.json');

const tables = [
  'users', 'profiles', 'content', 'credentials', 'insta_sessions',
  'publish_logs', 'metrics', 'post_metrics', 'workflow_states',
  'workflow_history', 'autopilot_config', 'scheduled_posts', 'schedule_audit'
];

const log = {
  startTime: new Date().toISOString(),
  dryRun,
  tables: [],
  totalSQLiteRows: 0,
  totalPostgresRows: 0,
  status: 'in-progress'
};

async function migrateTable(sqlite, pool, table) {
  try {
    const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
    console.log(`📋 Migrating table: ${table} (${count.count} rows)`);

    if (count.count === 0) {
      log.tables.push({ table, sqliteRows: 0, postgresRows: 0, match: true });
      return;
    }

    const rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    
    if (!dryRun && rows.length > 0) {
      const columns = Object.keys(rows[0]);
      const columnList = columns.join(', ');
      const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
      const insertSql = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

      for (let i = 0; i < rows.length; i += 100) {
        const chunk = rows.slice(i, i + 100);
        for (const row of chunk) {
          const values = columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return null;
            if (typeof val === 'boolean') return val;
            if (typeof val === 'number') return val;
            return String(val);
          });
          await pool.query(insertSql, values);
        }
      }

      const pgCount = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
      const pgRows = parseInt(pgCount.rows[0].count);
      
      const match = count.count === pgRows;
      log.tables.push({ table, sqliteRows: count.count, postgresRows: pgRows, match });
      log.totalSQLiteRows += count.count;
      log.totalPostgresRows += pgRows;
      
      if (!match) {
        throw new Error(`Row mismatch: SQLite=${count.count}, PostgreSQL=${pgRows}`);
      }
      console.log(`   ✓ ${pgRows} rows migrated`);
    } else {
      log.tables.push({ table, sqliteRows: count.count, postgresRows: 0, match: false });
      console.log(`   🧪 Would migrate ${count.count} rows (dry-run)`);
    }
  } catch (error) {
    throw new Error(`Failed to migrate ${table}: ${error.message}`);
  }
}

console.log('🚀 Starting SQLite → PostgreSQL Migration');
console.log(`📦 SQLite Database: ${sqlitePath}`);
console.log(`   Exists: ${fs.existsSync(sqlitePath)}`);
console.log(`🔌 PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
console.log(`${dryRun ? '🧪 DRY RUN MODE' : '⚠️  PRODUCTION MIGRATION'}\n`);

if (!fs.existsSync(sqlitePath)) {
  console.error(`❌ SQLite database not found at: ${sqlitePath}`);
  process.exit(1);
}

const sqlite = new Database(sqlitePath);
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const result = await pool.query('SELECT 1');
    console.log(`✓ Connected to Supabase\n`);

    for (const table of tables) {
      await migrateTable(sqlite, pool, table);
    }

    log.endTime = new Date().toISOString();
    log.duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
    log.status = 'completed';

    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));

    console.log(`\n📊 SUMMARY`);
    console.log(`=====================================`);
    console.log(`Status: ${log.status.toUpperCase()}`);
    console.log(`Total rows: ${log.totalSQLiteRows} → ${log.totalPostgresRows}`);
    console.log(`Duration: ${log.duration}ms`);
    console.log(`Log: ${logFile}`);
    console.log(`=====================================\n`);

    if (!dryRun && log.totalSQLiteRows === log.totalPostgresRows) {
      console.log('✅ Migration completed successfully - Zero data loss!');
    }

    process.exit(0);
  } catch (error) {
    log.error = error.message;
    log.status = 'failed';
    log.endTime = new Date().toISOString();
    log.duration = new Date(log.endTime).getTime() - new Date(log.startTime).getTime();
    fs.writeFileSync(logFile, JSON.stringify(log, null, 2));

    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    sqlite.close();
  }
})();
