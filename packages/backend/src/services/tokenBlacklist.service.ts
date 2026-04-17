import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;
const inMemoryBlacklist = new Map<string, number>(); // Fallback: token -> expiryTime

/**
 * Initialize token blacklist service with Redis
 * Falls back to in-memory store if Redis is unavailable
 */
export async function initializeTokenBlacklist(
  host: string = 'localhost',
  port: number = 6379
): Promise<RedisClientType | null> {
  try {
    redisClient = createClient({ socket: { host, port, reconnectStrategy: () => 1000 } });

    redisClient.on('error', (err) => {
      console.warn('Redis error in tokenBlacklist:', err);
      redisClient = null; // Fallback to in-memory
    });

    redisClient.on('connect', () => {
      console.log('✅ Token blacklist initialized with Redis');
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    console.warn('Failed to initialize Redis for token blacklist, using in-memory fallback:', err);
    return null;
  }
}

/**
 * Add token to blacklist (immediately revoked)
 * @param token JWT token to revoke
 * @param expiresInSeconds Time until token naturally expires
 */
export async function blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
  try {
    if (redisClient) {
      // Use Redis with TTL = token expiry time
      // When token expires naturally, Redis auto-deletes it
      await redisClient.setEx(`blacklist:${token}`, expiresInSeconds, '1');
    } else {
      // Use in-memory fallback
      inMemoryBlacklist.set(token, Date.now() + expiresInSeconds * 1000);
    }
  } catch (err) {
    console.error('Error blacklisting token:', err);
    // Always fallback to in-memory
    inMemoryBlacklist.set(token, Date.now() + expiresInSeconds * 1000);
  }
}

/**
 * Check if token is blacklisted (revoked)
 * @param token JWT token to check
 * @returns true if token is blacklisted, false otherwise
 */
export async function isTokenBlacklisted(token: string): Promise<boolean> {
  try {
    if (redisClient) {
      const result = await redisClient.exists(`blacklist:${token}`);
      return result === 1;
    } else {
      // Use in-memory fallback
      const expiryTime = inMemoryBlacklist.get(token);
      if (expiryTime === undefined) {
        return false;
      }
      const isBlacklisted = expiryTime > Date.now();
      if (!isBlacklisted) {
        // Cleanup expired token
        inMemoryBlacklist.delete(token);
      }
      return isBlacklisted;
    }
  } catch (err) {
    console.error('Error checking token blacklist:', err);
    // On error, assume token is not blacklisted (fail-open for UX)
    return false;
  }
}

/**
 * Clear all blacklisted tokens (for testing/reset)
 */
export async function clearBlacklist(): Promise<void> {
  try {
    if (redisClient) {
      const keys = await redisClient.keys('blacklist:*');
      if (keys && keys.length > 0) {
        await redisClient.del(keys);
      }
    }
    inMemoryBlacklist.clear();
  } catch (err) {
    console.error('Error clearing blacklist:', err);
    inMemoryBlacklist.clear();
  }
}
