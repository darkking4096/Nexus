/**
 * Test Database Helper
 * Provides mock DatabaseAdapter for testing without a real database
 */

import { DatabaseAdapter, DatabaseStatement } from '../../src/config/database';
import { vi } from 'vitest';

/**
 * Create a mock DatabaseAdapter for testing
 * Provides in-memory storage and basic SQL emulation
 */
export function createMockDatabase(): DatabaseAdapter {
  const tables: Map<string, Map<string, any>> = new Map();

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
      // INSERT implementation
      if (sql.includes('INSERT INTO')) {
        const tableMatch = sql.match(/INSERT INTO (\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const columnMatch = sql.match(/\((.*?)\)/);
          const columns = columnMatch ? columnMatch[1].split(',').map(c => c.trim()) : [];

          if (!tables.has(tableName)) {
            tables.set(tableName, new Map());
          }

          const tableData = tables.get(tableName)!;
          const row: any = {};
          columns.forEach((col, i) => {
            row[col] = params?.[i];
          });

          // UNIQUE constraint validation for email (users table)
          if (tableName === 'users' && row.email) {
            for (const existingRow of tableData.values()) {
              if (existingRow.email === row.email) {
                throw new Error(`duplicate key value violates unique constraint "users_email_key"`);
              }
            }
          }

          const id = row.id || row.user_id || `id_${Date.now()}`;
          tableData.set(String(id), row);
        }
        return [];
      }

      // UPDATE implementation
      if (sql.includes('UPDATE')) {
        const tableMatch = sql.match(/UPDATE (\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const tableData = tables.get(tableName);
          if (tableData && sql.includes('WHERE id = $') && params?.length) {
            const id = String(params[params.length - 1]);
            const row = tableData.get(id);
            if (row) {
              // Parse SET clause
              const setMatch = sql.match(/SET (.*?) WHERE/i);
              if (setMatch) {
                const setPairs = setMatch[1].split(',').map(p => p.trim());
                setPairs.forEach((pair, i) => {
                  const [col] = pair.split('=').map(s => s.trim());
                  if (i < params.length - 1) {
                    row[col] = params[i];
                  }
                });
              }
              tableData.set(id, row);
            }
          }
        }
        return [];
      }

      // DELETE implementation
      if (sql.includes('DELETE FROM')) {
        const tableMatch = sql.match(/DELETE FROM (\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const tableData = tables.get(tableName);
          if (tableData && sql.includes('WHERE id = $1') && params?.[0]) {
            const id = String(params[0]);
            const row = tableData.get(id);
            tableData.delete(id);

            // If RETURNING is specified, return the deleted row
            if (sql.includes('RETURNING')) {
              return row ? [row] : [];
            }
          }
        }
        return [];
      }

      // SELECT implementation
      if (sql.includes('SELECT')) {
        const tableMatch = sql.match(/FROM (\w+)/i);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const tableData = tables.get(tableName);
          if (!tableData) return [];

          let rows = Array.from(tableData.values());

          // Simple WHERE id = $1 parsing
          if (sql.includes('WHERE id = $1') && params?.[0]) {
            rows = rows.filter(r => r.id === params[0]);
          }
          // Simple WHERE email = $1 parsing
          else if (sql.includes('WHERE email = $1') && params?.[0]) {
            rows = rows.filter(r => r.email === params[0]);
          }

          return rows;
        }
        return [];
      }

      return [];
    },

    async _query(sql: string, params?: any[]): Promise<any> {
      const rows = await this.query(sql, params);
      return { rows };
    },

    async close(): Promise<void> {
      tables.clear();
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
