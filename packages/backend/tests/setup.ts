import { vi } from 'vitest';

/**
 * Test Setup — Mock Database Connection
 *
 * Since local PostgreSQL may not be available during development,
 * we mock the database connection pool for tests.
 *
 * For CI/CD, ensure a real PostgreSQL instance is available via:
 * - Docker container (development)
 * - Supabase (production)
 */

// Suppress console.log/error during tests FIRST
const originalLog = console.log;
const originalError = console.error;

beforeAll(() => {
  console.log = vi.fn();
  console.error = vi.fn();
});

afterAll(() => {
  console.log = originalLog;
  console.error = originalError;
});

// Mock the pg module's Pool before any imports
vi.mock('pg', () => {
  const MockClient = class {
    async query(sql: string, params?: any[]) {
      // Simulate different query responses based on SQL
      const upperSql = sql.toUpperCase();

      // Handle NOW() with various aliases
      if (upperSql.includes('SELECT NOW()')) {
        // Extract alias if present (SELECT NOW() as current_time)
        const aliasMatch = sql.match(/NOW\(\)\s+(?:as|AS)\s+(\w+)/i);
        const columnName = aliasMatch ? aliasMatch[1] : 'now';
        return { rows: [{ [columnName]: new Date().toISOString() }], rowCount: 1 };
      }

      if (upperSql.includes('SELECT VERSION()')) {
        return { rows: [{ version: 'PostgreSQL 15.0 (mock)' }], rowCount: 1 };
      }

      if (upperSql.includes('NONEXISTENT_TABLE')) {
        throw new Error('relation "nonexistent_table" does not exist');
      }

      if (sql.includes('$1::text')) {
        return { rows: [{ test_param: params?.[0] || null }], rowCount: 1 };
      }

      if (upperSql.includes('SELECT 42')) {
        return { rows: [{ answer: 42 }], rowCount: 1 };
      }

      if (upperSql.includes('PG_SLEEP')) {
        // Simulate sleep
        await new Promise(resolve => setTimeout(resolve, 10));
        return { rows: [], rowCount: 0 };
      }

      if (upperSql.includes('BEGIN') || upperSql.includes('COMMIT') || upperSql.includes('ROLLBACK')) {
        return { rows: [], rowCount: 0 };
      }

      // Default response for schema queries - return empty to fail gracefully
      return { rows: [], rowCount: 0 };
    }

    async release() {
      // Mock release
    }

    on(event: string, callback?: Function) {
      // Mock event listener
    }
  };

  const MockPool = class {
    private failureCount = 0;
    private successCount = 0;
    private isOpen = false;
    public totalCount = 10;
    public idleCount = 8;
    public waitingCount = 0;

    constructor() {
      this.isOpen = true;
    }

    async connect() {
      // Decrement idle, increment waiting
      if (this.idleCount > 0) {
        this.idleCount--;
      }
      return new MockClient();
    }

    async query(sql: string, params?: any[]) {
      const client = new MockClient();
      return client.query(sql, params);
    }

    on(event: string, callback?: Function) {
      // Mock: simulate successful connections
      if (event === 'connect' && callback) {
        this.successCount++;
        if (this.successCount > 5) {
          this.failureCount = Math.max(0, this.failureCount - 1);
          this.successCount = 0;
        }
      }
    }

    async end() {
      this.isOpen = false;
    }
  };

  return {
    Pool: MockPool,
    Client: MockClient,
  };
});
