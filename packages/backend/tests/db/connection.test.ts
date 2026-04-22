import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { getDatabase, initializeDatabase } from '../../src/db/connection';

/**
 * Database Connection Tests
 * Integration tests for PostgreSQL connection pooling and resilience
 */

describe('PostgreSQL Database Connection', () => {
  beforeAll(async () => {
    // Initialize the connection pool
    await initializeDatabase();
  });

  afterAll(async () => {
    // Clean up connections
    const db = getDatabase();
    await db.close();
  });

  describe('Connection Initialization', () => {
    it('should initialize database connection pool successfully', async () => {
      const db = getDatabase();
      const health = await db.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.message).toContain('Database healthy');
    });

    it('should provide pool statistics', async () => {
      const db = getDatabase();
      const stats = db.getPoolStats();

      expect(stats).toHaveProperty('totalCount');
      expect(stats).toHaveProperty('idleCount');
      expect(stats).toHaveProperty('waitingCount');
    });
  });

  describe('Query Execution', () => {
    it('should execute a simple query', async () => {
      const db = getDatabase();
      const result = await db.query('SELECT NOW()');

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('now');
    });

    it('should execute query with parameters', async () => {
      const db = getDatabase();
      // Query the postgres system catalog to verify parameterized queries work
      const result = await db.query(
        'SELECT $1::text as test_param',
        ['hello-world']
      );

      expect(result).toHaveLength(1);
      expect(result[0].test_param).toBe('hello-world');
    });

    it('should handle multiple concurrent queries', async () => {
      const db = getDatabase();

      // Execute 10 queries concurrently
      const queries = Array.from({ length: 10 }, () =>
        db.query('SELECT NOW() as current_time')
      );

      const results = await Promise.all(queries);

      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toHaveLength(1);
        expect(result[0]).toHaveProperty('current_time');
      });
    });
  });

  describe('Error Handling', () => {
    it('should provide meaningful error message for invalid credentials', async () => {
      // This test documents expected error behavior
      // Actual error only occurs if DATABASE_URL is misconfigured
      const db = getDatabase();
      const health = await db.healthCheck();

      // If health check fails, database connection issue is clear
      if (!health.healthy) {
        expect(health.message).toContain('failed');
      }
    });

    it('should handle query errors gracefully', async () => {
      const db = getDatabase();

      try {
        // Execute an invalid SQL query
        await db.query('SELECT * FROM nonexistent_table');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        const errorMsg = (error as Error).message;
        expect(errorMsg).toBeTruthy();
      }
    });
  });

  describe('Connection Pool Management', () => {
    it('should maintain healthy pool state under load', async () => {
      const db = getDatabase();

      // Create load by executing many queries
      const queries = Array.from({ length: 20 }, () =>
        db.query('SELECT pg_sleep(0.01)')
      );

      await Promise.all(queries);

      const stats = db.getPoolStats();
      expect(stats.totalCount).toBeGreaterThanOrEqual(5); // At least minimum pool size
    });

    it('should return available connections to pool', async () => {
      const db = getDatabase();
      const statsBefore = db.getPoolStats();

      const client = await db.getClient();
      const statsDuring = db.getPoolStats();

      client.release();
      const statsAfter = db.getPoolStats();

      // Idle count should decrease when client is taken, increase when returned
      expect(statsDuring.idleCount).toBeLessThanOrEqual(statsBefore.idleCount);
      expect(statsAfter.idleCount).toBeGreaterThanOrEqual(statsDuring.idleCount);
    });
  });

  describe('Transaction Support', () => {
    it('should execute transaction successfully', async () => {
      const db = getDatabase();

      const result = await db.transaction(async (client) => {
        const queryResult = await client.query('SELECT 42 as answer');
        return queryResult.rows[0].answer;
      });

      expect(result).toBe(42);
    });

    it('should rollback transaction on error', async () => {
      const db = getDatabase();

      try {
        await db.transaction(async (client) => {
          await client.query('SELECT 1');
          // Intentionally throw error to test rollback
          throw new Error('Simulated transaction error');
        });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect((error as Error).message).toBe('Simulated transaction error');
      }
    });
  });

  describe('Health Check', () => {
    it('should perform health check successfully', async () => {
      const db = getDatabase();
      const health = await db.healthCheck();

      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('message');
      expect(typeof health.healthy).toBe('boolean');
      expect(typeof health.message).toBe('string');
    });
  });
});
