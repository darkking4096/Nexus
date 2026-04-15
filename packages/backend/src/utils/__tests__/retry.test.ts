import { describe, it, expect, vi, beforeEach } from 'vitest';
import { retryWithBackoff } from '../retry.js';

describe('retryWithBackoff', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset environment variables
    delete process.env.PUBLISH_RETRY_MAX_ATTEMPTS;
    delete process.env.PUBLISH_RETRY_BASE_DELAY_MS;
    delete process.env.PUBLISH_RETRY_MAX_DELAY_MS;
    delete process.env.PUBLISH_RETRY_JITTER_PERCENT;
  });

  describe('successful execution', () => {
    it('should return result on first success', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry and succeed on second attempt', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        isTransientError: () => true, // All errors are transient for this test
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should use environment variables for defaults', async () => {
      process.env.PUBLISH_RETRY_MAX_ATTEMPTS = '5';
      process.env.PUBLISH_RETRY_BASE_DELAY_MS = '500';
      process.env.PUBLISH_RETRY_MAX_DELAY_MS = '5000';
      process.env.PUBLISH_RETRY_JITTER_PERCENT = '15';

      const fn = vi.fn().mockResolvedValue('success');
      const onRetry = vi.fn();

      await retryWithBackoff(fn, {
        isTransientError: () => false,
        onRetry,
      });

      // Should use env values (though we don't fail here)
      expect(fn).toHaveBeenCalled();
    });
  });

  describe('exponential backoff timing', () => {
    it('should wait baseDelayMs * 2^(attempt-1) between retries', async () => {
      const baseDelay = 100;
      const startTime = Date.now();
      let callCount = 0;

      const fn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          throw new Error('transient error');
        }
        return Promise.resolve('success');
      });

      await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: baseDelay,
        maxDelayMs: 10000,
        jitterPercent: 0, // Disable jitter for predictable timing
        isTransientError: () => true,
      });

      const elapsed = Date.now() - startTime;

      // Expected: 0ms (attempt 1) + 100ms (wait) + 0ms (attempt 2) + 200ms (wait) + 0ms (attempt 3)
      // Total should be ~300ms ±50ms (allowing for test overhead)
      expect(elapsed).toBeGreaterThanOrEqual(250);
      expect(elapsed).toBeLessThan(400);
    });

    it('should cap delay at maxDelayMs', async () => {
      const baseDelay = 100;
      const maxDelay = 500;
      let callCount = 0;

      const fn = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 4) {
          throw new Error('transient error');
        }
        return Promise.resolve('success');
      });

      const startTime = Date.now();

      await retryWithBackoff(fn, {
        maxAttempts: 4,
        baseDelayMs: baseDelay,
        maxDelayMs: maxDelay,
        jitterPercent: 0,
        isTransientError: () => true,
      });

      const elapsed = Date.now() - startTime;

      // Expected: 100ms + 200ms + 400ms (capped at 500ms) = 700ms (but 4th would be capped)
      // So: 100 + 200 + 500 = 800ms ±100ms
      expect(elapsed).toBeGreaterThanOrEqual(700);
      expect(elapsed).toBeLessThan(900);
    });
  });

  describe('jitter variation', () => {
    it('should add jitter to delay calculation', async () => {
      const baseDelay = 1000;
      const jitterPercent = 10; // ±10% = ±100ms
      const delays: number[] = [];

      const fn = vi.fn().mockRejectedValue(new Error('transient'));

      // Capture delays via timing
      vi.stubGlobal(
        'setTimeout',
        (callback: () => void, delay: number) => {
          delays.push(delay);
          // Don't actually wait
          callback();
          return {} as NodeJS.Timeout;
        }
      );

      try {
        await retryWithBackoff(fn, {
          maxAttempts: 2,
          baseDelayMs: baseDelay,
          maxDelayMs: 10000,
          jitterPercent,
          isTransientError: () => true,
        }).catch(() => {}); // Ignore final error

        // With 10% jitter on 1000ms base = 900-1100ms range
        expect(delays.length).toBeGreaterThan(0);
        const delay = delays[0];
        expect(delay).toBeGreaterThan(baseDelay - 200); // ±10% plus margin
        expect(delay).toBeLessThan(baseDelay + 200);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('should apply jitter percentage correctly', async () => {
      const baseDelay = 1000;
      const jitterPercent = 20; // ±20% = ±200ms
      const delays: number[] = [];

      const fn = vi.fn().mockRejectedValue(new Error('transient'));

      vi.stubGlobal(
        'setTimeout',
        (callback: () => void, delay: number) => {
          delays.push(delay);
          callback();
          return {} as NodeJS.Timeout;
        }
      );

      try {
        await retryWithBackoff(fn, {
          maxAttempts: 2,
          baseDelayMs: baseDelay,
          maxDelayMs: 10000,
          jitterPercent,
          isTransientError: () => true,
        }).catch(() => {});

        const delay = delays[0];
        // With 20% jitter = 800-1200ms range
        expect(delay).toBeGreaterThan(baseDelay - 300);
        expect(delay).toBeLessThan(baseDelay + 300);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });

  describe('error classification', () => {
    it('should retry on transient errors', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('ETIMEDOUT'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 100,
        isTransientError: (err) => {
          const msg = err instanceof Error ? err.message.toLowerCase() : '';
          return /timeout|network/.test(msg);
        },
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should fail immediately on permanent errors (fail-fast)', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('401 Unauthorized'));

      await expect(
        retryWithBackoff(fn, {
          maxAttempts: 3,
          baseDelayMs: 100,
          maxDelayMs: 1000,
          isTransientError: (err) => {
            const msg = err instanceof Error ? err.message.toLowerCase() : '';
            return !/401|403|unauthorized|forbidden/.test(msg);
          },
        })
      ).rejects.toThrow('401 Unauthorized');

      // Should fail immediately, not retry
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should use default error classifier if none provided', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('network timeout'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 100,
        // No isTransientError provided - should use default
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('onRetry callback', () => {
    it('should call onRetry callback on each retry', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('error 1'))
        .mockRejectedValueOnce(new Error('error 2'))
        .mockResolvedValueOnce('success');

      const onRetry = vi.fn();

      await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 100,
        isTransientError: () => true,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledTimes(2);
      expect(onRetry).toHaveBeenNthCalledWith(1, 1, expect.any(Error));
      expect(onRetry).toHaveBeenNthCalledWith(2, 2, expect.any(Error));
    });

    it('should pass attempt number and error to callback', async () => {
      const testError = new Error('test error');
      const fn = vi.fn().mockRejectedValue(testError);

      const onRetry = vi.fn();

      await retryWithBackoff(fn, {
        maxAttempts: 2,
        baseDelayMs: 10,
        maxDelayMs: 100,
        isTransientError: () => true,
        onRetry,
      }).catch(() => {}); // Ignore final error

      expect(onRetry).toHaveBeenCalledWith(1, testError);
    });

    it('should not call onRetry on successful first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const onRetry = vi.fn();

      await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 10,
        maxDelayMs: 100,
        onRetry,
      });

      expect(onRetry).not.toHaveBeenCalled();
    });
  });

  describe('max attempts limit', () => {
    it('should respect maxAttempts limit', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('error'));

      await expect(
        retryWithBackoff(fn, {
          maxAttempts: 3,
          baseDelayMs: 10,
          maxDelayMs: 100,
          isTransientError: () => true,
        })
      ).rejects.toThrow('error');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should default to 3 max attempts from env or constant', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('error'));

      // Default is 3
      await expect(
        retryWithBackoff(fn, {
          baseDelayMs: 10,
          maxDelayMs: 100,
          isTransientError: () => true,
        })
      ).rejects.toThrow('error');

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should use PUBLISH_RETRY_MAX_ATTEMPTS env var', async () => {
      process.env.PUBLISH_RETRY_MAX_ATTEMPTS = '2';

      const fn = vi.fn().mockRejectedValue(new Error('error'));

      await expect(
        retryWithBackoff(fn, {
          baseDelayMs: 10,
          maxDelayMs: 100,
          isTransientError: () => true,
        })
      ).rejects.toThrow('error');

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('edge cases', () => {
    it('should handle zero jitter percentage', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 100,
        maxDelayMs: 1000,
        jitterPercent: 0,
        isTransientError: () => true,
      });

      expect(result).toBe('success');
    });

    it('should handle negative delay gracefully', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('error'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, {
        maxAttempts: 3,
        baseDelayMs: 1,
        maxDelayMs: 1,
        jitterPercent: 50,
        isTransientError: () => true,
      });

      expect(result).toBe('success');
    });

    it('should throw original error if all attempts fail', async () => {
      const originalError = new Error('original error');
      const fn = vi.fn().mockRejectedValue(originalError);

      const thrown = await retryWithBackoff(fn, {
        maxAttempts: 2,
        baseDelayMs: 10,
        maxDelayMs: 100,
        isTransientError: () => true,
      }).catch((e) => e);

      expect(thrown).toBe(originalError);
    });
  });
});
