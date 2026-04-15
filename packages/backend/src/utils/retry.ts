import { randomBytes } from 'crypto';

/**
 * Retry utility for resilient operations
 */

export interface RetryOptions {
  maxAttempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  jitterPercent?: number;
  isTransientError?: (err: unknown) => boolean;
  onRetry?: (attempt: number, error: unknown) => void;
}

/**
 * Execute a function with exponential backoff retry logic
 * @param fn Async function to retry
 * @param options Retry configuration (all optional, with sensible defaults)
 * @returns Result of successful fn execution
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = parseInt(process.env.PUBLISH_RETRY_MAX_ATTEMPTS || '3', 10),
    baseDelayMs = parseInt(process.env.PUBLISH_RETRY_BASE_DELAY_MS || '2000', 10),
    maxDelayMs = parseInt(process.env.PUBLISH_RETRY_MAX_DELAY_MS || '120000', 10),
    jitterPercent = parseInt(process.env.PUBLISH_RETRY_JITTER_PERCENT || '10', 10),
    isTransientError = defaultIsTransientError,
    onRetry = () => {},
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if error is transient
      if (!isTransientError(error)) {
        // Permanent error - fail immediately
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }

      // Calculate backoff with jitter
      const baseDelay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
      const jitterAmount = baseDelay * (jitterPercent / 100);
      const jitter = (Math.random() - 0.5) * 2 * jitterAmount; // ±jitterPercent
      const delayMs = Math.max(baseDelay + jitter, 0);

      // Invoke callback for logging
      onRetry(attempt, error);

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError || new Error('Max retries exceeded');
}

/**
 * Default error classifier for transient vs permanent errors
 * Can be overridden via options.isTransientError callback
 */
function defaultIsTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Network errors (transient)
    if (/econnrefused|etimedout|ehostunreach|enetunreach|network|timeout/.test(msg)) {
      return true;
    }

    // HTTP rate limit (transient)
    if (/429|rate.?limit|too.?many.?requests/.test(msg)) {
      return true;
    }

    // HTTP server errors (transient)
    if (/5\d\d|server.?error|temporarily.?unavailable/.test(msg)) {
      return true;
    }

    // Browser crash/closed (transient)
    if (/browser.?closed|page.?closed|crashed/.test(msg)) {
      return true;
    }
  }

  return false;
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
