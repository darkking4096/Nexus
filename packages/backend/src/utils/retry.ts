import { randomBytes } from 'crypto';

/**
 * Retry utility for resilient operations
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

/**
 * Execute a function with exponential backoff retry logic
 * @param fn Async function to retry
 * @param options Retry configuration
 * @returns Result of successful fn execution
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const { maxAttempts, baseDelayMs, maxDelayMs } = options;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts - 1) {
        throw error;
      }

      // Exponential backoff: baseDelay * 2^attempt, capped at maxDelay
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}

/**
 * Human-realistic random delay (cryptographically unpredictable)
 * Used to avoid bot detection by Instagram and similar services
 *
 * Why crypto.randomBytes? Instagram analyzes timing patterns.
 * Math.random() is predictable with enough samples.
 * crypto.randomBytes is cryptographically strong.
 *
 * TODO(human): Implement this function
 * - Use crypto.randomBytes(4) to generate unpredictable uint32
 * - Normalize to [0, 1] range
 * - Scale to [minMs, maxMs] range
 * - Return a Promise that resolves after that delay
 *
 * Signature:
 * export function humanDelay(minMs: number = 800, maxMs: number = 3000): Promise<void>
 *
 * Hints:
 * - randomBytes(4).readUInt32BE() gives uint32 [0, 2^32)
 * - Divide by 2^32 to normalize to [0, 1)
 * - Multiply by (maxMs - minMs) and add minMs to scale
 * - Use setTimeout() with the computed delay
 */
export function humanDelay(minMs: number = 800, maxMs: number = 3000): Promise<void> {
  // Generate cryptographically random delay to avoid bot detection
  // randomBytes(4).readUInt32BE() gives [0, 2^32) as uint32
  const randomUint32 = randomBytes(4).readUInt32BE();
  const normalized = randomUint32 / 0x100000000; // Normalize to [0, 1)
  const delay = minMs + normalized * (maxMs - minMs);

  return new Promise((resolve) => setTimeout(resolve, delay));
}
