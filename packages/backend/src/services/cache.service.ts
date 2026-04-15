import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

export interface CacheConfig {
  host?: string;
  port?: number;
  ttlSeconds?: {
    profiles: number;
    content: number;
    default: number;
  };
}

/**
 * CacheService: Redis-backed cache with TTL management
 * Provides efficient caching for profiles (5min TTL) and content (1h TTL)
 * Falls back to in-memory cache if Redis unavailable
 */
export class CacheService {
  private redisClient: RedisClientType | null = null;
  private inMemoryCache: Map<string, { value: unknown; expiresAt: number }> =
    new Map();
  private readonly ttl: { profiles: number; content: number; default: number };
  private isConnected = false;

  constructor(config?: CacheConfig) {
    this.ttl = config?.ttlSeconds || {
      profiles: 5 * 60, // 5 minutes
      content: 60 * 60, // 1 hour
      default: 10 * 60, // 10 minutes
    };

    // Initialize Redis client (async, will connect in separate method)
    this.initializeRedis(config);
  }

  /**
   * Initialize Redis connection
   */
  private async initializeRedis(config?: CacheConfig): Promise<void> {
    try {
      const host = config?.host || process.env.REDIS_HOST || 'localhost';
      const port = config?.port || parseInt(process.env.REDIS_PORT || '6379');

      this.redisClient = createClient({
        socket: {
          host,
          port,
          reconnectStrategy: (retries) => Math.min(retries * 50, 500),
        },
      });

      this.redisClient.on('error', (err) =>
        logger.error(`[CacheService] Redis error: ${err.message}`)
      );

      this.redisClient.on('connect', () => {
        this.isConnected = true;
        logger.info(`[CacheService] Connected to Redis at ${host}:${port}`);
      });

      this.redisClient.on('disconnect', () => {
        this.isConnected = false;
        logger.warn('[CacheService] Disconnected from Redis, using in-memory fallback');
      });

      await this.redisClient.connect();
    } catch (error) {
      logger.warn(
        `[CacheService] Failed to initialize Redis: ${error instanceof Error ? error.message : String(error)}. Using in-memory fallback.`
      );
      this.isConnected = false;
    }
  }

  /**
   * Get value from cache
   */
  async get<T = unknown>(key: string): Promise<T | null> {
    try {
      logger.debug(`[CacheService] GET ${key}`);

      // Try Redis first if connected
      if (this.isConnected && this.redisClient) {
        const value = await this.redisClient.get(key);
        if (value) {
          logger.debug(`[CacheService] HIT (Redis) ${key}`);
          return JSON.parse(value) as T;
        }
      }

      // Fallback to in-memory cache
      const entry = this.inMemoryCache.get(key);
      if (!entry) {
        logger.debug(`[CacheService] MISS ${key}`);
        return null;
      }

      // Check expiration
      if (Date.now() > entry.expiresAt) {
        logger.debug(`[CacheService] EXPIRED ${key}`);
        this.inMemoryCache.delete(key);
        return null;
      }

      logger.debug(`[CacheService] HIT (in-memory) ${key}`);
      return entry.value as T;
    } catch (error) {
      logger.error(
        `[CacheService] Error getting ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number
  ): Promise<void> {
    try {
      const ttl = ttlSeconds || this.ttl.default;
      const jsonValue = JSON.stringify(value);

      logger.debug(`[CacheService] SET ${key} (TTL: ${ttl}s)`);

      // Store in Redis if connected
      if (this.isConnected && this.redisClient) {
        await this.redisClient.setEx(key, ttl, jsonValue);
      }

      // Also store in in-memory cache as fallback
      this.inMemoryCache.set(key, {
        value,
        expiresAt: Date.now() + ttl * 1000,
      });
    } catch (error) {
      logger.error(
        `[CacheService] Error setting ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Delete cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      logger.debug(`[CacheService] DELETE ${key}`);

      if (this.isConnected && this.redisClient) {
        await this.redisClient.del(key);
      }

      this.inMemoryCache.delete(key);
    } catch (error) {
      logger.error(
        `[CacheService] Error deleting ${key}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear pattern (e.g., "profile:*")
   */
  async clearPattern(pattern: string): Promise<number> {
    try {
      logger.debug(`[CacheService] CLEAR PATTERN ${pattern}`);

      let deleted = 0;

      // Clear from Redis if connected
      if (this.isConnected && this.redisClient) {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          deleted += await this.redisClient.del(keys);
        }
      }

      // Clear from in-memory cache
      for (const key of this.inMemoryCache.keys()) {
        if (this.matchPattern(key, pattern)) {
          this.inMemoryCache.delete(key);
          deleted++;
        }
      }

      logger.info(`[CacheService] Cleared ${deleted} entries matching ${pattern}`);
      return deleted;
    } catch (error) {
      logger.error(
        `[CacheService] Error clearing pattern ${pattern}: ${error instanceof Error ? error.message : String(error)}`
      );
      return 0;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      logger.debug('[CacheService] CLEAR ALL');

      if (this.isConnected && this.redisClient) {
        await this.redisClient.flushDb();
      }

      this.inMemoryCache.clear();
      logger.info('[CacheService] Cache cleared');
    } catch (error) {
      logger.error(
        `[CacheService] Error clearing cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ inMemory: number; connected: boolean }> {
    return {
      inMemory: this.inMemoryCache.size,
      connected: this.isConnected,
    };
  }

  /**
   * Simple pattern matching (Redis-style wildcards)
   */
  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(`^${pattern.replace(/\*/g, '.*')}$`);
    return regex.test(key);
  }

  /**
   * Graceful shutdown
   */
  async disconnect(): Promise<void> {
    if (this.redisClient) {
      await this.redisClient.disconnect();
      logger.info('[CacheService] Disconnected from Redis');
    }
  }
}

// Singleton instance
let cacheInstance: CacheService | null = null;

export function initializeCache(config?: CacheConfig): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService(config);
  }
  return cacheInstance;
}

export function getCache(): CacheService {
  if (!cacheInstance) {
    cacheInstance = new CacheService();
  }
  return cacheInstance;
}
