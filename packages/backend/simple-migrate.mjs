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

const tables = [
  'users', 'profiles', 'content', 'credentials', 'insta_sessions',
  'publish_logs', 'metrics', 'post_metrics', 'workflow_states',
  'workflow_history', 'autopilot_config', 'scheduled_posts', 'schedule_audit'
];

let totalSQLiteRows = 0;
let totalPostgresRows = 0;

(async () => {
  try {
    const result = await pool.query('SELECT 1');
    console.log(`✓ Connected to Supabase\n`);

    for (const table of tables) {
      const count = sqlite.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
      console.log(`📋 ${table}: ${count.count} rows`);
      totalSQLiteRows += count.count;
    }

    console.log(`\n📊 Total SQLite rows: ${totalSQLiteRows}`);
    console.log(`\n${dryRun ? '✅ Dry-run complete. No changes made.' : '⚠️  Would migrate data in production mode.'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    sqlite.close();
  }
})();
