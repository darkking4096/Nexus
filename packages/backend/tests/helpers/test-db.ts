/**
 * Test Database Helper
 * Provides mock DatabaseAdapter for testing without a real database
 */

import { DatabaseAdapter, DatabaseStatement } from '../../src/config/database';
import { vi } from 'vitest';

/**
 * Create a mock DatabaseAdapter for testing
 * Provides basic in-memory storage for test scenarios
 */
export function createMockDatabase(): DatabaseAdapter {
  const mockData: Map<string, any[]> = new Map();

  return {
    prepare(sql: string): DatabaseStatement {
      return {
        async: true,
        run(..._params: any[]) {
          throw new Error('Use async query() method instead');
        },
        get(..._params: any[]) {
          throw new Error('Use async query() method instead');
        },
        all(..._params: any[]) {
          throw new Error('Use async query() method instead');
        },
      };
    },

    async exec(_sql: string): Promise<void> {
      // No-op for tests
    },

    async transaction<T>(fn: (db: DatabaseAdapter) => T | Promise<T>): Promise<T> {
      return await fn(this);
    },

    async query(sql: string, params?: any[]): Promise<any[]> {
      // Mock implementation for basic SELECT queries
      if (sql.includes('SELECT')) {
        return [];
      }
      return [];
    },

    async _query(sql: string, params?: any[]): Promise<any> {
      if (sql.includes('SELECT')) {
        return { rows: [] };
      }
      return { rows: [] };
    },

    async close(): Promise<void> {
      mockData.clear();
    },
  };
}

/**
 * Create a DatabaseAdapter mock with spy methods for testing
 * Allows verification of called queries
 */
export function createSpyDatabase(): DatabaseAdapter & { querySpy: any } {
  const db = createMockDatabase();
  const querySpy = vi.fn(db.query.bind(db));

  return {
    ...db,
    querySpy,
    async query(sql: string, params?: any[]): Promise<any[]> {
      querySpy(sql, params);
      return await db.query(sql, params);
    },
  };
}
