import { initializeDatabase, getDatabase } from '../db/connection';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Database adapter for Synkra backend
 *
 * Provides compatibility layer for PostgreSQL operations
 * Supports both legacy synchronous patterns and modern async/await
 */

export interface DatabaseStatement {
  run(...params: any[]): any;
  get(...params: any[]): any;
  all(...params: any[]): any;
  async?: boolean; // Flag indicating async support
}

export interface DatabaseAdapter {
  prepare(sql: string): DatabaseStatement;
  exec(sql: string): Promise<void> | void;
  transaction<T>(fn: (db: DatabaseAdapter) => T | Promise<T>): T | Promise<T>;
  close(): Promise<void>;
  query(sql: string, params?: any[]): Promise<any[]>;
  // Internal method for raw queries
  _query(sql: string, params?: any[]): Promise<any>;
}

class PostgreSQLAdapter implements DatabaseAdapter {
  private db = getDatabase();

  /**
   * Prepare a statement - returns async-capable object
   * WARNING: synchronous methods will NOT work with PostgreSQL
   * Use query() method instead for async operations
   */
  prepare(_sql: string): DatabaseStatement {
    // SQLite pattern compatibility stub
    // In production, all code should migrate to async query() calls
    return {
      async: true,
      run(..._params: any[]) {
        console.error(
          '❌ FATAL: prepare().run() called but PostgreSQL requires async calls. ' +
          'Use db.query(sql, params) instead.'
        );
        throw new Error(
          'Synchronous database operations are not supported with PostgreSQL. ' +
          'Please use await db.query() instead.'
        );
      },

      get(..._params: any[]) {
        console.error(
          '❌ FATAL: prepare().get() called but PostgreSQL requires async calls. ' +
          'Use db.query(sql, params) instead.'
        );
        throw new Error(
          'Synchronous database operations are not supported with PostgreSQL. ' +
          'Please use await db.query() instead.'
        );
      },

      all(..._params: any[]) {
        console.error(
          '❌ FATAL: prepare().all() called but PostgreSQL requires async calls. ' +
          'Use db.query(sql, params) instead.'
        );
        throw new Error(
          'Synchronous database operations are not supported with PostgreSQL. ' +
          'Please use await db.query() instead.'
        );
      },
    };
  }

  /**
   * Execute raw SQL (schema setup) - may be async
   * Schema is already set up in Supabase, so this is a no-op
   */
  async exec(_sql: string): Promise<void> {
    // Supabase schema is pre-created (Story 8.1.1)
    // Do not execute CREATE TABLE statements against existing schema
    console.log('📝 Schema already initialized in Supabase');
  }

  /**
   * Execute a function within a database transaction
   * Uses PostgreSQL native transactions
   */
  async transaction<T>(fn: (db: DatabaseAdapter) => T | Promise<T>): Promise<T> {
    return await this.db.transaction(async () => {
      return await fn(this);
    });
  }

  /**
   * Modern async query interface - PRIMARY METHOD
   * Use this for all database operations
   */
  async query(sql: string, params?: any[]): Promise<any[]> {
    try {
      const result = await this.db.query(sql, params);
      return result.rows || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  /**
   * Internal raw query - for custom operations
   */
  async _query(sql: string, params?: any[]): Promise<any> {
    return await this.db.query(sql, params);
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    await this.db.close();
  }
}

// Singleton instance
let adapterInstance: PostgreSQLAdapter | null = null;

/**
 * Initialize database (async)
 * Must be called during app startup
 */
export async function initializePostgresDatabase(): Promise<DatabaseAdapter> {
  try {
    await initializeDatabase();
    if (!adapterInstance) {
      adapterInstance = new PostgreSQLAdapter();
    }
    return adapterInstance;
  } catch (error) {
    console.error('Failed to initialize PostgreSQL database:', error);
    throw error;
  }
}

/**
 * Get the database adapter instance
 * Only works after initializePostgresDatabase() is called
 */
export function getAdapter(): DatabaseAdapter {
  if (!adapterInstance) {
    adapterInstance = new PostgreSQLAdapter();
  }
  return adapterInstance;
}

/**
 * Synchronous wrapper for backward compatibility with index.ts
 * WARNING: Does not actually initialize async connections
 * Call initializePostgresDatabase() before using any queries
 */
export function initializeDatabaseSync(): DatabaseAdapter {
  return getAdapter();
}

// Default export
export default initializeDatabaseSync;
