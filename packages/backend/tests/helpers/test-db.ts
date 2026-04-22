/**
 * Test Database Helper
 * Provides mock DatabaseAdapter for testing without a real database
 * Supports both async query() and legacy prepare() interfaces
 */

import { DatabaseAdapter, DatabaseStatement } from '../../src/config/database';
import { vi } from 'vitest';

/**
 * Create a mock DatabaseAdapter for testing
 * Provides in-memory storage and basic SQL emulation
 * Supports both prepare().get/run/all and async query() methods
 */
export function createMockDatabase(): DatabaseAdapter {
  const tables: Map<string, Map<string, any>> = new Map();

  const db = {
    prepare(sql: string): DatabaseStatement {
      return {
        async: true,
        run(...params: any[]) {
          return executeStatement(sql, params, true);
        },
        get(...params: any[]) {
          const result = executeStatement(sql, params, false);
          return Array.isArray(result) ? result[0] : result;
        },
        all(...params: any[]) {
          const result = executeStatement(sql, params, false);
          return Array.isArray(result) ? result : [];
        },
      };
    },

    pragma(_pragma: string): any {
      // No-op for pragma statements
      return undefined;
    },

    async exec(sql: string): Promise<void> {
      // Process multiple SQL statements (separated by semicolons)
      const statements = sql.split(';').filter(s => s.trim());
      for (const stmt of statements) {
        const trimmed = stmt.trim();
        if (trimmed) {
          // Convert literal SQL to parameterized for query()
          await convertAndQuery(trimmed);
        }
      }
    },

    async transaction<T>(fn: (db: DatabaseAdapter) => T | Promise<T>): Promise<T> {
      return await fn(db as DatabaseAdapter);
    },

    async query(sql: string, params?: any[]): Promise<any[]> {
      return executeStatement(sql, params, false) as any[];
    },

    async _query(sql: string, params?: any[]): Promise<any> {
      const rows = executeStatement(sql, params, false) as any[];
      return { rows };
    },

    async close(): Promise<void> {
      tables.clear();
    },
  } as DatabaseAdapter;

  function executeStatement(sql: string, params: any[] | undefined, isWrite: boolean): any {
    // INSERT implementation
    if (sql.includes('INSERT INTO')) {
      const tableMatch = sql.match(/INSERT INTO (\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];

        // Extract columns from INSERT statement - handle multiline
        // Match pattern: ( col1, col2, ... )
        const columnMatch = sql.match(/\(\s*([\w\s,]+)\s*\)\s*VALUES/i);
        const columns = columnMatch
          ? columnMatch[1]
              .split(',')
              .map(c => c.trim())
              .filter(c => c.length > 0)
          : [];

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

        const id = row.id || row.user_id || row.profile_id || `id_${Date.now()}`;
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
        if (tableData) {
          // Parse SET clause to extract columns and values (allow multiline with [\s\S])
          const setMatch = sql.match(/SET\s+([\s\S]*?)\s+WHERE/i);
          if (setMatch) {
            const setPairs = setMatch[1].split(',').map(p => p.trim());
            const updates: Array<{col: string; paramIndex: number | null; literal?: string}> = [];
            let paramIndex = 0;

            // Parse each SET pair
            setPairs.forEach((pair) => {
              const [col, value] = pair.split('=').map(s => s.trim());

              // Check if it's a parameter (? or $N) or literal value
              if (value === '?' || value.match(/^\$\d+$/)) {
                updates.push({ col, paramIndex: paramIndex });
                paramIndex++;
              } else {
                // Literal value (e.g., 'published')
                updates.push({ col, paramIndex: null, literal: value.replace(/^'|'$/g, '') });
              }
            });

            // Parse WHERE clause to find which row to update
            let whereColumn = 'id';
            let whereParamIndex = paramIndex; // After all SET params

            if (sql.includes('WHERE id = $') || sql.includes('WHERE id = ?')) {
              whereColumn = 'id';
            } else if (sql.includes('WHERE content_id = $') || sql.includes('WHERE content_id = ?')) {
              whereColumn = 'content_id';
            } else if (sql.includes('WHERE profile_id = $') || sql.includes('WHERE profile_id = ?')) {
              whereColumn = 'profile_id';
            }

            const whereValue = params?.[whereParamIndex];
            if (whereValue !== undefined) {
              // Find and update the row
              for (const [key, row] of tableData.entries()) {
                if (row[whereColumn] === whereValue) {
                  updates.forEach(({col, paramIndex: idx, literal}) => {
                    if (idx !== null && params![idx] !== undefined) {
                      row[col] = params![idx];
                    } else if (literal !== undefined) {
                      row[col] = literal;
                    }
                  });
                  tableData.set(key, row);
                  break;
                }
              }
            }
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
        if (tableData && sql.includes('WHERE id = $') && params?.[0]) {
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
        if (!tableData) {
          if (tableName === 'content') {
            console.error(`[SELECT] No table data for ${tableName}`);
          }
          return [];
        }

        let rows = Array.from(tableData.values());

        // Parse WHERE clauses
        // Parameterized ($1, $2...) and positional (?) patterns
        if (sql.includes('WHERE id = $1') || sql.includes('WHERE id = ?')) {
          if (params?.[0]) rows = rows.filter(r => r.id === params[0]);
        } else if (sql.includes('WHERE id = $2') || sql.includes('WHERE id = ?, user_id = ?')) {
          if (params?.[1]) rows = rows.filter(r => r.id === params[1]);
        } else if (sql.includes('WHERE instagram_id = $1') || sql.includes('WHERE instagram_id = ?')) {
          if (params?.[0]) rows = rows.filter(r => r.instagram_id === params[0]);
        } else if (sql.includes('WHERE email = $1') || sql.includes('WHERE email = ?')) {
          if (params?.[0]) rows = rows.filter(r => r.email === params[0]);
        } else if (sql.includes('WHERE profile_id = ?') && params?.[0]) {
          rows = rows.filter(r => r.profile_id === params[0]);
        } else if (sql.includes('WHERE profile_id = $1') && params?.[0]) {
          rows = rows.filter(r => r.profile_id === params[0]);
        }

        // Handle collected_at filtering (for metrics history)
        if (sql.includes('collected_at >=')) {
          const paramIdx = sql.includes('$2') ? 1 : 1; // Second param is usually the date
          if (params?.[paramIdx]) {
            rows = rows.filter(r => {
              if (!r.collected_at) return false;
              return r.collected_at >= params[paramIdx];
            });
          }
        }

        // Handle combined WHERE id AND user_id
        if (sql.includes('WHERE id = $1 AND user_id = $2')) {
          rows = rows.filter(r => r.id === params?.[0] && r.user_id === params?.[1]);
        }

        // Apply aggregate functions (AVG, COUNT, etc)
        if (sql.includes('AVG(') || sql.includes('COUNT(') || sql.includes('SUM(')) {

          // Handle AVG(engagement_rate) as avg_engagement
          if (sql.includes('AVG(engagement_rate)')) {
            const values = rows.map(r => r.engagement_rate).filter(v => v !== undefined && v !== null);
            const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
            return [{ avg_engagement: avg }];
          }

          // Handle COUNT(*) as count
          if (sql.includes('COUNT(*)')) {
            return [{ count: rows.length }];
          }
        }

        // Apply ORDER BY
        if (sql.includes('ORDER BY')) {
          const orderMatch = sql.match(/ORDER BY\s+(\w+)\s+(ASC|DESC)?/i);
          if (orderMatch) {
            const [, orderCol, direction] = orderMatch;
            const isDesc = direction?.toUpperCase() === 'DESC';
            rows.sort((a, b) => {
              const aVal = a[orderCol];
              const bVal = b[orderCol];
              if (aVal === undefined || bVal === undefined) return 0;
              if (aVal < bVal) return isDesc ? 1 : -1;
              if (aVal > bVal) return isDesc ? -1 : 1;
              return 0;
            });
          }
        }

        // Apply column aliases from SELECT statement
        rows = rows.map(row => {
          const aliasedRow = { ...row };

          // Parse aliases from SELECT clause (e.g., "followers_count as followers")
          const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
          if (selectMatch) {
            const selectClause = selectMatch[1];
            const aliasMatches = selectClause.matchAll(/(\w+)\s+as\s+(\w+)/gi);

            for (const match of aliasMatches) {
              const [, originalCol, aliasCol] = match;
              if (aliasedRow.hasOwnProperty(originalCol)) {
                aliasedRow[aliasCol] = aliasedRow[originalCol];
              }
            }
          }

          // Handle DATE() function for collected_at
          if (sql.includes('DATE(collected_at)') && aliasedRow.collected_at) {
            aliasedRow.date = aliasedRow.collected_at.split('T')[0];
          }

          return aliasedRow;
        });

        return rows;
      }
    }

    return [];
  }

  async function convertAndQuery(sql: string): Promise<void> {
    // Convert literal SQL with string interpolation to parameterized
    // This is for db.exec() calls with literals like VALUES ('${userId}', ...)
    const params: any[] = [];
    let paramizedSql = sql;

    // For now, just try to execute as-is with empty params
    // The literal values are already in the SQL string
    // This is a limitation of supporting legacy db.exec() with literals

    // Actually, for INSERT statements with literal values, we need to parse them
    if (sql.includes('INSERT INTO')) {
      // Try to extract values from literal SQL
      // This is a simplified parser for VALUES ('val1', 'val2', ...)
      const valuesMatch = sql.match(/VALUES\s*\((.*?)\)/i);
      if (valuesMatch) {
        const valuesStr = valuesMatch[1];
        // Split by comma, but be careful with quoted strings
        const values = valuesStr.split(',').map(v => {
          v = v.trim();
          // Remove quotes if present
          if ((v.startsWith("'") && v.endsWith("'")) || (v.startsWith('"') && v.endsWith('"'))) {
            return v.slice(1, -1);
          }
          // Handle datetime('now') - return ISO string
          if (v.includes('datetime')) {
            return new Date().toISOString();
          }
          // Handle null
          if (v.toLowerCase() === 'null') {
            return null;
          }
          return v;
        });

        // Execute INSERT with extracted values
        executeStatement(sql, values, true);
      }
    }
  }

  return db;
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
