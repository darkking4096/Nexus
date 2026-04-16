/**
 * E2E Test Fixtures
 * Setup, teardown, and database reset for E2E tests
 *
 * Usage:
 *   import { beforeAll, afterAll, context } from './fixtures'
 *   describe('Flow', () => {
 *     beforeAll(async () => { await setupTest() })
 *     afterAll(async () => { await teardownTest() })
 *   })
 */

import Database from 'better-sqlite3';
import path from 'path';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export interface TestContext {
  db: Database.Database;
  testUserId: string;
  testUserEmail: string;
  testUserPassword: string;
  testProfileId: string;
  testInstagramHandle: string;
  testInstagramToken: string;
  stagingUrl: string;
  baseUrl: string;
}

let globalContext: TestContext;

/**
 * Initialize test context with database and credentials
 */
export async function setupTest(): Promise<TestContext> {
  // Create test database (unique per test run)
  const testDbPath = path.join(process.cwd(), `.test-db-${randomUUID()}.db`);
  const db = new Database(testDbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Setup schema
  setupDatabase(db);

  // Create test user
  const testUserId = randomUUID();
  const testUserEmail = process.env.TEST_USER_EMAIL || 'qa-test@synkra.test';
  const testUserPassword = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

  db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    testUserId,
    testUserEmail,
    'hashed_password_placeholder', // In real tests, use bcrypt
    new Date().toISOString(),
    new Date().toISOString()
  );

  // Create test profile
  const testProfileId = randomUUID();
  const testInstagramHandle = process.env.INSTAGRAM_TEST_HANDLE || 'synkra-e2e-test';
  const testInstagramToken = process.env.INSTAGRAM_GRAPH_TOKEN || 'test_token_placeholder';

  db.prepare(`
    INSERT INTO profiles (
      id, user_id, instagram_username, access_token, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    testProfileId,
    testUserId,
    testInstagramHandle,
    testInstagramToken,
    new Date().toISOString(),
    new Date().toISOString()
  );

  // Build context
  globalContext = {
    db,
    testUserId,
    testUserEmail,
    testUserPassword,
    testProfileId,
    testInstagramHandle,
    testInstagramToken,
    stagingUrl: process.env.STAGING_URL || 'http://localhost:3000',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  };

  return globalContext;
}

/**
 * Cleanup test database
 */
export async function teardownTest(): Promise<void> {
  if (globalContext?.db) {
    try {
      // Verify all tables are empty (optional validation)
      const tables = ['content', 'workflow_states', 'profiles', 'users'];
      for (const table of tables) {
        const count = globalContext.db.prepare(`SELECT COUNT(*) as cnt FROM ${table}`).get() as { cnt: number };
        console.log(`[TEARDOWN] Table '${table}': ${count.cnt} records`);
      }

      // Close database
      globalContext.db.close();
    } catch (error) {
      console.error('[TEARDOWN] Error closing database:', error);
    }
  }
}

/**
 * Reset database between test suites
 */
export async function resetDatabase(): Promise<void> {
  if (!globalContext?.db) {
    throw new Error('Database not initialized. Call setupTest() first.');
  }

  const db = globalContext.db;

  // Disable foreign keys for cleanup
  db.pragma('foreign_keys = OFF');

  // Delete all test data
  db.prepare('DELETE FROM workflow_history').run();
  db.prepare('DELETE FROM workflow_states').run();
  db.prepare('DELETE FROM content').run();
  db.prepare('DELETE FROM profiles').run();
  db.prepare('DELETE FROM users').run();

  // Reset auto-increment counters
  db.prepare('DELETE FROM sqlite_sequence').run();

  // Re-enable foreign keys
  db.pragma('foreign_keys = ON');

  // Recreate test user and profile
  db.prepare(`
    INSERT INTO users (id, email, password_hash, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    globalContext.testUserId,
    globalContext.testUserEmail,
    'hashed_password_placeholder',
    new Date().toISOString(),
    new Date().toISOString()
  );

  db.prepare(`
    INSERT INTO profiles (
      id, user_id, instagram_username, access_token, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    globalContext.testProfileId,
    globalContext.testUserId,
    globalContext.testInstagramHandle,
    globalContext.testInstagramToken,
    new Date().toISOString(),
    new Date().toISOString()
  );
}

/**
 * Get current test context
 */
export function getContext(): TestContext {
  if (!globalContext) {
    throw new Error('Test context not initialized. Call setupTest() first.');
  }
  return globalContext;
}

/**
 * Database schema initialization
 */
function setupDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      instagram_username TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      created_at DATETIME,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      caption TEXT,
      hashtags TEXT,
      status TEXT DEFAULT 'draft',
      created_at DATETIME,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workflow_states (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL UNIQUE REFERENCES content(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      mode TEXT NOT NULL,
      current_step TEXT NOT NULL,
      schedule_data TEXT,
      content_data TEXT,
      publish_data TEXT,
      user_edits TEXT,
      auto_approve_enabled BOOLEAN DEFAULT 1,
      auto_approve_timeout_hours INTEGER DEFAULT 24,
      last_approval_at DATETIME,
      approved_by TEXT,
      rejected_at DATETIME,
      rejection_reason TEXT,
      created_at DATETIME,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS workflow_history (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      from_step TEXT,
      to_step TEXT,
      decision TEXT NOT NULL,
      user_id TEXT,
      reason TEXT,
      timestamp DATETIME
    );
  `);
}

/**
 * Helper: Insert test content
 */
export function insertTestContent(
  profileId: string,
  overrides?: Partial<{
    id: string;
    type: string;
    caption: string;
    hashtags: string;
    status: string;
  }>
): string {
  const contentId = overrides?.id || `content_${randomUUID()}`;
  const type = overrides?.type || 'feed';
  const caption = overrides?.caption || 'Test caption';
  const hashtags = overrides?.hashtags || JSON.stringify(['#test', '#e2e']);
  const status = overrides?.status || 'draft';

  const db = getContext().db;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO content (id, profile_id, type, caption, hashtags, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(contentId, profileId, type, caption, hashtags, status, now, now);

  return contentId;
}

/**
 * Helper: Insert workflow state
 */
export function insertWorkflowState(
  contentId: string,
  profileId: string,
  overrides?: Partial<{
    mode: string;
    current_step: string;
    schedule_data: Record<string, unknown>;
  }>
): string {
  const workflowId = randomUUID();
  const mode = overrides?.mode || 'manual';
  const current_step = overrides?.current_step || 'schedule_pending';
  const schedule_data = JSON.stringify(overrides?.schedule_data || {});

  const db = getContext().db;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO workflow_states (
      id, content_id, profile_id, mode, current_step, schedule_data,
      auto_approve_enabled, auto_approve_timeout_hours, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    workflowId,
    contentId,
    profileId,
    mode,
    current_step,
    schedule_data,
    1,
    24,
    now,
    now
  );

  return workflowId;
}

/**
 * Helper: Query workflow state
 */
export function queryWorkflowState(contentId: string): Record<string, unknown> | undefined {
  const db = getContext().db;
  return db.prepare(`
    SELECT * FROM workflow_states WHERE content_id = ?
  `).get(contentId) as Record<string, unknown> | undefined;
}
