import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

/**
 * Database Connection Pool Manager
 * Handles PostgreSQL connection pooling with:
 * - Connection timeout configuration
 * - Idle timeout management
 * - Health checks
 * - Retry logic with exponential backoff
 * - Circuit breaker pattern for resilience
 */

interface PoolConfig {
  connectionString: string;
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface RetryConfig {
  maxAttempts: number;
  initialDelayMs: number;
  maxDelayMs: number;
}

interface CircuitBreakerState {
  isOpen: boolean;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

class DatabaseConnection {
  private pool: Pool;
  private circuitBreaker: CircuitBreakerState;
  private retryConfig: RetryConfig;
  private isInitialized = false;

  constructor() {
    const connectionString = this.validateConnectionString();

    const poolConfig: PoolConfig = {
      connectionString,
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '5', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '300000', 10), // 5 minutes
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000', 10), // 30 seconds
    };

    this.pool = new Pool(poolConfig);

    this.retryConfig = {
      maxAttempts: parseInt(process.env.DB_RETRY_MAX_ATTEMPTS || '3', 10),
      initialDelayMs: parseInt(process.env.DB_RETRY_INITIAL_DELAY || '100', 10),
      maxDelayMs: parseInt(process.env.DB_RETRY_MAX_DELAY || '5000', 10),
    };

    this.circuitBreaker = {
      isOpen: false,
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    };

    this.setupPoolListeners();
  }

  /**
   * Validate that required environment variables are set
   */
  private validateConnectionString(): string {
    const connectionString =
      process.env.DATABASE_URL ||
      process.env.DB_CONNECTION_STRING ||
      process.env.SUPABASE_URL;

    if (!connectionString) {
      throw new Error(
        'Database connection string not configured. ' +
        'Set DATABASE_URL, DB_CONNECTION_STRING, or SUPABASE_URL environment variable.'
      );
    }

    // Verify SSL is enabled for Supabase
    if (connectionString.includes('supabase')) {
      if (!connectionString.includes('sslmode=require')) {
        return `${connectionString}${connectionString.includes('?') ? '&' : '?'}sslmode=require`;
      }
    }

    return connectionString;
  }

  /**
   * Set up pool event listeners for error handling
   */
  private setupPoolListeners(): void {
    this.pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      // Don't block the pool, just log the error
    });

    this.pool.on('connect', () => {
      this.circuitBreaker.successCount++;
      if (this.circuitBreaker.successCount > 5) {
        this.circuitBreaker.failureCount = Math.max(0, this.circuitBreaker.failureCount - 1);
        this.circuitBreaker.successCount = 0;
      }
    });
  }

  /**
   * Initialize the connection pool and verify database accessibility
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      this.isInitialized = true;
      console.log('✅ Database connection pool initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize database connection:', error);
      throw new Error(`Database initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Execute a query with retry logic and circuit breaker
   */
  async query<T = any>(
    text: string,
    values?: any[]
  ): Promise<QueryResult<T>> {
    // Check circuit breaker status
    if (this.circuitBreaker.isOpen) {
      const timeSinceLastFailure = Date.now() - this.circuitBreaker.lastFailureTime;
      if (timeSinceLastFailure < 30000) { // 30 second timeout
        throw new Error(
          'Database circuit breaker is open. ' +
          'Database appears to be unavailable. Please try again later.'
        );
      }
      // Attempt to close circuit breaker
      this.circuitBreaker.isOpen = false;
      this.circuitBreaker.failureCount = 0;
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
      try {
        const result = await this.pool.query<T>(text, values);
        this.circuitBreaker.failureCount = 0;
        return result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Check if this is a transient error worth retrying
        const isTransient = this.isTransientError(lastError);

        if (isTransient && attempt < this.retryConfig.maxAttempts) {
          const delayMs = this.calculateBackoffDelay(attempt);
          console.warn(
            `Database query failed (attempt ${attempt}/${this.retryConfig.maxAttempts}). ` +
            `Retrying in ${delayMs}ms...`
          );
          await this.sleep(delayMs);
        } else {
          // Non-transient error or max attempts reached
          this.handleQueryError(error, isTransient);
          break;
        }
      }
    }

    throw lastError || new Error('Database query failed');
  }

  /**
   * Execute multiple queries in a transaction
   */
  async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get a client from the pool for advanced operations
   */
  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  /**
   * Health check for the connection pool
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      const result = await this.pool.query('SELECT NOW()');
      return {
        healthy: true,
        message: `Database healthy. Current time: ${result.rows[0].now}`,
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Database health check failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * Get pool statistics
   */
  getPoolStats() {
    return {
      totalCount: this.pool.totalCount,
      idleCount: this.pool.idleCount,
      waitingCount: this.pool.waitingCount,
    };
  }

  /**
   * Close the connection pool
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.isInitialized = false;
      console.log('Database connection pool closed');
    }
  }

  /**
   * Determine if an error is transient (retry-able)
   */
  private isTransientError(error: Error): boolean {
    const message = error.message.toLowerCase();

    // Transient errors that should trigger retry
    const transientErrors = [
      'econnrefused', // Connection refused
      'econnreset',   // Connection reset
      'etimedout',    // Timeout
      'pool is draining', // Pool draining
      'the client has already been released to the pool',
      'too many connections',
      'server closed the connection',
      'connection closed',
    ];

    return transientErrors.some(err => message.includes(err));
  }

  /**
   * Handle query errors with circuit breaker logic
   */
  private handleQueryError(error: unknown, isTransient: boolean): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();

    // Open circuit breaker if too many consecutive failures
    if (this.circuitBreaker.failureCount >= 5) {
      this.circuitBreaker.isOpen = true;
      console.error('⚠️ Circuit breaker opened - database appears unavailable');
    }

    // Log error without exposing sensitive information
    const errorMsg = error instanceof Error ? error.message : String(error);

    if (isTransient) {
      console.warn(`Transient database error (attempt ${this.circuitBreaker.failureCount}): ${errorMsg}`);
    } else {
      console.error(`Database error: ${errorMsg}`);
    }
  }

  /**
   * Calculate exponential backoff delay
   */
  private calculateBackoffDelay(attempt: number): number {
    const exponentialDelay = Math.min(
      this.retryConfig.initialDelayMs * Math.pow(2, attempt - 1),
      this.retryConfig.maxDelayMs
    );
    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * exponentialDelay;
    return Math.ceil(exponentialDelay + jitter);
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create singleton instance
let connectionInstance: DatabaseConnection | null = null;

export function getDatabase(): DatabaseConnection {
  if (!connectionInstance) {
    connectionInstance = new DatabaseConnection();
  }
  return connectionInstance;
}

export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();
  await db.initialize();
}

export type { PoolClient, QueryResult };
