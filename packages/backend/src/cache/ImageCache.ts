import { logger } from '../utils/logger';
import crypto from 'crypto';

export interface CacheEntry {
  imageBuffer: Buffer;
  format: 'png' | 'jpg';
  createdAt: string;
  expiresAt: string;
}

/**
 * ImageCache: Manages image caching with Redis backend (or in-memory fallback)
 * Provides 7-day TTL for processed images
 */
export class ImageCache {
  private cache: Map<string, CacheEntry> = new Map(); // In-memory fallback
  private readonly TTL_DAYS = 7;
  private readonly TTL_MS = this.TTL_DAYS * 24 * 60 * 60 * 1000;
  // private redisClient: RedisClient; // TODO(human): Initialize when redis installed

  constructor() {
    logger.info(
      `[ImageCache] Initialized with ${this.TTL_DAYS}-day TTL (fallback: in-memory)`
    );
  }

  /**
   * Generate cache key from profile, format, and content hash
   */
  generateCacheKey(
    profileId: string,
    format: 'feed' | 'story' | 'reel',
    contentHash: string
  ): string {
    const key = `visual:${profileId}:${format}:${contentHash}`;
    return key;
  }

  /**
   * Compute hash of content (prompt + branding config)
   */
  computeHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get image from cache
   */
  async get(key: string): Promise<CacheEntry | null> {
    try {
      logger.debug(`[ImageCache] GET ${key}`);

      const entry = this.cache.get(key);

      if (!entry) {
        logger.debug(`[ImageCache] MISS ${key}`);
        return null;
      }

      // Check expiration
      if (new Date() > new Date(entry.expiresAt)) {
        logger.debug(`[ImageCache] EXPIRED ${key}`);
        this.cache.delete(key);
        return null;
      }

      logger.debug(`[ImageCache] HIT ${key}`);
      return entry;
    } catch (error) {
      logger.error(
        `[ImageCache] Error getting from cache: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Store image in cache
   */
  async set(
    key: string,
    imageBuffer: Buffer,
    format: 'png' | 'jpg'
  ): Promise<void> {
    try {
      logger.debug(`[ImageCache] SET ${key}`);

      const now = new Date();
      const expiresAt = new Date(now.getTime() + this.TTL_MS);

      const entry: CacheEntry = {
        imageBuffer,
        format,
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
      };

      this.cache.set(key, entry);

      logger.debug(
        `[ImageCache] Cached ${key} (expires ${expiresAt.toISOString()})`
      );
    } catch (error) {
      logger.error(
        `[ImageCache] Error setting cache: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Remove specific cache entry
   */
  async delete(key: string): Promise<void> {
    try {
      logger.debug(`[ImageCache] DELETE ${key}`);
      this.cache.delete(key);
    } catch (error) {
      logger.error(
        `[ImageCache] Error deleting cache: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Clear expired entries (cleanup job)
   */
  async clearExpired(): Promise<number> {
    const now = new Date();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > new Date(entry.expiresAt)) {
        this.cache.delete(key);
        count++;
      }
    }

    logger.info(`[ImageCache] Cleared ${count} expired entries`);
    return count;
  }

  /**
   * Get cache stats (for monitoring)
   */
  getStats(): { size: number; ttlDays: number } {
    return {
      size: this.cache.size,
      ttlDays: this.TTL_DAYS,
    };
  }
}
