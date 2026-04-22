/**
 * Database Interface Types
 * Defines the public API for database operations
 */

export interface DatabaseStatement {
  run(...params: any[]): any;
  get(...params: any[]): any;
  all(...params: any[]): any;
}

export interface DatabaseAdapter {
  /**
   * Prepare a SQL statement
   * Returns an object with run, get, all methods
   */
  prepare(sql: string): DatabaseStatement;

  /**
   * Execute raw SQL (typically for schema setup)
   */
  exec(sql: string): void;

  /**
   * Execute a function within a database transaction
   */
  transaction(fn: () => void): void;

  /**
   * Modern async query interface
   * @param sql - SQL query string
   * @param params - Query parameters
   * @returns Array of result rows
   */
  query(sql: string, params?: any[]): Promise<any[]>;

  /**
   * Close database connection
   */
  close(): Promise<void>;
}

/**
 * Connection pool statistics
 */
export interface PoolStats {
  totalCount: number;
  idleCount: number;
  waitingCount: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  message: string;
}

/**
 * Database error types
 */
export enum DatabaseErrorType {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  QUERY_FAILED = 'QUERY_FAILED',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  POOL_EXHAUSTED = 'POOL_EXHAUSTED',
  TIMEOUT = 'TIMEOUT',
}

/**
 * Application context database interface
 * Used by routes and services
 */
export interface AppContextDatabase {
  prepare(sql: string): DatabaseStatement;
  exec(sql: string): void;
  transaction(fn: () => void): void;
  query(sql: string, params?: any[]): Promise<any[]>;
  close(): Promise<void>;
}
