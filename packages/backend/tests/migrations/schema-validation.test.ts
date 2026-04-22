/**
 * Story 8.1.1: Schema Validation Tests
 *
 * Tests verify:
 * - All tables exist with correct schema
 * - Indexes are created
 * - Foreign key constraints are enforced
 * - Data types are correct
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';

const postgres = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// SKIPPED: These tests require a real PostgreSQL database
// To run: configure PostgreSQL in .env.test and set DATABASE_URL
describe.skip('Story 8.1.1: Schema Validation', () => {
  beforeAll(async () => {
    // Verify connections
    try {
      await postgres.query('SELECT 1');
    } catch (error) {
      console.warn('PostgreSQL connection failed. Some tests will be skipped.');
    }
  });

  afterAll(async () => {
    await postgres.end();
    // SQLite removed - migrated to PostgreSQL
  });

  describe('PostgreSQL Schema', () => {
    it('should have all required tables', async () => {
      const expectedTables = [
        'users', 'profiles', 'content', 'credentials',
        'insta_sessions', 'publish_logs', 'metrics', 'post_metrics',
        'workflow_states', 'workflow_history', 'autopilot_config',
        'scheduled_posts', 'schedule_audit', 'schema_migrations'
      ];

      const result = await postgres.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);

      const actualTables = result.rows.map((r) => r.table_name);
      expectedTables.forEach(table => {
        expect(actualTables).toContain(table);
      });
    });

    it('should have users table with correct columns', async () => {
      const result = await postgres.query(`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position
      `);

      const columns = result.rows.reduce((acc: Record<string, string>, row) => {
        acc[row.column_name] = row.data_type;
        return acc;
      }, {});

      expect(columns).toHaveProperty('id');
      expect(columns).toHaveProperty('email');
      expect(columns).toHaveProperty('password_hash');
      expect(columns).toHaveProperty('name');
      expect(columns).toHaveProperty('created_at');
      expect(columns).toHaveProperty('updated_at');
    });

    it('should have profiles table with foreign key to users', async () => {
      const result = await postgres.query(`
        SELECT constraint_name, constraint_type
        FROM information_schema.table_constraints
        WHERE table_name = 'profiles'
        AND constraint_type = 'FOREIGN KEY'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      const fkConstraints = result.rows.map(r => r.constraint_name);
      expect(fkConstraints.some(name => name.includes('user_id'))).toBe(true);
    });

    it('should have indexes on common query columns', async () => {
      const expectedIndexes = [
        'idx_users_email',
        'idx_profiles_user_id',
        'idx_content_profile_id',
        'idx_content_status',
        'idx_credentials_user_id',
        'idx_insta_sessions_profile_id',
        'idx_publish_logs_profile_id',
        'idx_metrics_profile_id',
        'idx_workflow_states_profile_id'
      ];

      const result = await postgres.query(`
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
      `);

      const actualIndexes = result.rows.map(r => r.indexname);
      expectedIndexes.forEach(idx => {
        expect(actualIndexes).toContain(idx);
      });
    });

    it('should enforce NOT NULL constraints on critical columns', async () => {
      const result = await postgres.query(`
        SELECT column_name, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'users'
        AND column_name IN ('email', 'password_hash')
      `);

      result.rows.forEach(row => {
        expect(row.is_nullable).toBe('NO');
      });
    });

    it('should have UNIQUE constraint on users.email', async () => {
      const result = await postgres.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'users'
        AND constraint_type = 'UNIQUE'
      `);

      const constraints = result.rows.map(r => r.constraint_name);
      expect(constraints.some(c => c.includes('email'))).toBe(true);
    });
  });

  // NOTE: SQLite compatibility tests removed - migration to PostgreSQL complete (Story 8.1.2)
  // describe('SQLite → PostgreSQL Data Compatibility', () => { ... });

  describe('Foreign Key Constraints', () => {
    it('should have profiles referencing users', async () => {
      const result = await postgres.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'profiles'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should have content referencing profiles', async () => {
      const result = await postgres.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE constraint_type = 'FOREIGN KEY'
        AND table_name = 'content'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should have referential integrity for all FK tables', async () => {
      const fkTables = [
        'profiles', 'content', 'credentials', 'insta_sessions',
        'publish_logs', 'metrics', 'post_metrics',
        'workflow_states', 'workflow_history', 'autopilot_config',
        'scheduled_posts', 'schedule_audit'
      ];

      for (const table of fkTables) {
        const result = await postgres.query(`
          SELECT COUNT(*)::int as fk_count
          FROM information_schema.table_constraints
          WHERE constraint_type = 'FOREIGN KEY'
          AND table_name = $1
        `, [table]);

        // Most tables should have at least one FK
        expect(result.rows[0].fk_count).toBeGreaterThan(0);
      }
    });
  });

  describe('Data Integrity Checks', () => {
    it('should not have orphaned profile records', async () => {
      // Profiles with non-existent user_id
      const result = await postgres.query(`
        SELECT COUNT(*)::int as orphan_count
        FROM profiles p
        LEFT JOIN users u ON p.user_id = u.id
        WHERE u.id IS NULL
      `);

      expect(result.rows[0].orphan_count).toBe(0);
    });

    it('should not have orphaned content records', async () => {
      // Content with non-existent profile_id
      const result = await postgres.query(`
        SELECT COUNT(*)::int as orphan_count
        FROM content c
        LEFT JOIN profiles p ON c.profile_id = p.id
        WHERE p.id IS NULL
      `);

      expect(result.rows[0].orphan_count).toBe(0);
    });

    it('should validate email uniqueness', async () => {
      // No duplicate emails
      const result = await postgres.query(`
        SELECT COUNT(*)::int as duplicate_count
        FROM (
          SELECT email, COUNT(*) as cnt
          FROM users
          GROUP BY email
          HAVING COUNT(*) > 1
        ) duplicates
      `);

      expect(result.rows[0].duplicate_count).toBe(0);
    });

    it('should validate instagram_username uniqueness', async () => {
      const result = await postgres.query(`
        SELECT COUNT(*)::int as duplicate_count
        FROM (
          SELECT instagram_username, COUNT(*) as cnt
          FROM profiles
          GROUP BY instagram_username
          HAVING COUNT(*) > 1
        ) duplicates
      `);

      expect(result.rows[0].duplicate_count).toBe(0);
    });
  });

  describe('Row-Level Security (RLS)', () => {
    it('should have RLS enabled on all user-facing tables', async () => {
      const userTables = [
        'users', 'profiles', 'content', 'credentials',
        'workflow_states', 'scheduled_posts', 'metrics'
      ];

      const result = await postgres.query(`
        SELECT tablename, rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = ANY($1::text[])
      `, [userTables]);

      result.rows.forEach(row => {
        expect(row.rowsecurity).toBe(true);
      });
    });

    it('should have RLS policies for service role', async () => {
      const result = await postgres.query(`
        SELECT COUNT(*)::int as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND policyname LIKE '%service%'
      `);

      expect(result.rows[0].policy_count).toBeGreaterThan(0);
    });

    it('should have RLS policies for user role', async () => {
      const result = await postgres.query(`
        SELECT COUNT(*)::int as policy_count
        FROM pg_policies
        WHERE schemaname = 'public'
        AND policyname LIKE '%user%'
      `);

      expect(result.rows[0].policy_count).toBeGreaterThan(0);
    });
  });

  describe('Migration Metadata', () => {
    it('should have schema_migrations table', async () => {
      const result = await postgres.query(`
        SELECT * FROM schema_migrations
        ORDER BY version
      `);

      expect(result.rows.length).toBeGreaterThan(0);
    });

    it('should have migration 001 recorded', async () => {
      const result = await postgres.query(`
        SELECT * FROM schema_migrations
        WHERE version = '001'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].description).toContain('schema');
    });

    it('should have migration 002 recorded', async () => {
      const result = await postgres.query(`
        SELECT * FROM schema_migrations
        WHERE version = '002'
      `);

      expect(result.rows.length).toBeGreaterThan(0);
      expect(result.rows[0].description).toContain('Row-Level Security');
    });
  });
});
