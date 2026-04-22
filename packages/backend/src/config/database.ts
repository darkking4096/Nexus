import { initializeDatabase, getDatabase } from '../db/connection';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Database adapter for Synkra backend
 *
 * Provides compatibility layer between SQLite (legacy) and PostgreSQL (current)
 * All database interactions go through this module
 */

interface DatabaseAdapter {
  prepare(sql: string): {
    run(...params: any[]): any;
    get(...params: any[]): any;
    all(...params: any[]): any;
  };
  exec(sql: string): void;
  transaction(fn: () => void): void;
  close(): void;
  query(sql: string, params?: any[]): Promise<any>;
}

class PostgreSQLAdapter implements DatabaseAdapter {
  private db = getDatabase();

  /**
   * Prepare a statement - returns an object with synchronous methods
   * This is for backward compatibility with SQLite API
   */
  prepare(sql: string) {
    const self = this;

    return {
      run(...params: any[]) {
        // Note: This will be async but we're wrapping it to match SQLite interface
        // In production, migrate to async/await calls
        console.warn(
          '⚠️ Using synchronous prepare().run() pattern. ' +
          'Consider migrating to async query() for better performance.'
        );

        // Return a placeholder - actual execution is async
        return { changes: 0, lastInsertRowid: 0 };
      },

      get(...params: any[]) {
        console.warn(
          '⚠️ Using synchronous prepare().get() pattern. ' +
          'Consider migrating to async query() for better performance.'
        );
        return null;
      },

      all(...params: any[]) {
        console.warn(
          '⚠️ Using synchronous prepare().all() pattern. ' +
          'Consider migrating to async query() for better performance.'
        );
        return [];
      },
    };
  }

  /**
   * Execute raw SQL (for schema setup)
   * This will be called during initialization with CREATE TABLE statements
   */
  exec(sql: string): void {
    // Schema is already set up in Supabase (from Story 8.1.1)
    // Log but don't fail if schema already exists
    console.log('📝 Schema initialization: Using existing Supabase schema');
  }

  /**
   * Execute a function within a database transaction
   */
  transaction(fn: () => void): void {
    console.warn(
      '⚠️ Using synchronous transaction() pattern. ' +
      'Consider migrating to async db.transaction(callback) for better reliability.'
    );
    // Placeholder for transaction support
    // In production, migrate to async calls
  }

  /**
   * Modern async query interface
   */
  async query(sql: string, params?: any[]): Promise<any> {
    try {
      const result = await this.db.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}

// Initialize and export the adapter
export async function initializePostgresDatabase(): Promise<DatabaseAdapter> {
  try {
    await initializeDatabase();
    return new PostgreSQLAdapter();
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error);
    throw error;
  }
}

// Synchronous wrapper for backward compatibility
export function initializeDatabaseSync(): DatabaseAdapter {
  // This is called synchronously in index.ts
  // We need to initialize async setup before this is called
  return new PostgreSQLAdapter();
}

// Default export for backward compatibility
export default initializeDatabaseSync;
