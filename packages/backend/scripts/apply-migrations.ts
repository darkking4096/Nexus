/**
 * Story 8.1.1: Apply SQL Migrations to Supabase
 *
 * Usage:
 *   npx ts-node scripts/apply-migrations.ts [migration-file]
 *   npx ts-node scripts/apply-migrations.ts 001
 *   npx ts-node scripts/apply-migrations.ts all
 */

import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function applyMigration(migrationPath: string) {
  console.log(`📦 Applying migration: ${path.basename(migrationPath)}`);

  try {
    const sql = fs.readFileSync(migrationPath, 'utf8');

    // Execute entire migration file
    await pool.query(sql);

    console.log(`✅ Migration applied successfully`);
  } catch (error) {
    console.error(`❌ Migration failed:`, error);
    throw error;
  }
}

async function main() {
  const migrationArg = process.argv[2] || 'all';
  const migrationsDir = path.join(__dirname, '..', 'migrations');

  console.log('🚀 Supabase Migration Runner');
  console.log(`📍 Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  console.log('');

  try {
    // Test connection
    const result = await pool.query('SELECT NOW()');
    console.log(`✓ Connected to Supabase: ${result.rows[0].now}\n`);

    // Get migration files
    let migrations: string[] = [];

    if (migrationArg === 'all') {
      migrations = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();
    } else {
      const pattern = `${migrationArg}-*.sql`;
      migrations = fs.readdirSync(migrationsDir)
        .filter(f => f.match(new RegExp(`^${migrationArg}-`)));
    }

    if (migrations.length === 0) {
      console.warn(`⚠️  No migrations found matching: ${migrationArg}`);
      process.exit(1);
    }

    console.log(`📋 Found ${migrations.length} migration(s) to apply:\n`);
    migrations.forEach((m, i) => console.log(`  ${i + 1}. ${m}`));
    console.log('');

    // Apply migrations sequentially
    for (const migration of migrations) {
      await applyMigration(path.join(migrationsDir, migration));
    }

    console.log('\n🎉 All migrations applied successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed. Rolling back...');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
