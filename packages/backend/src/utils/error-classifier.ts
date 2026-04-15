/**
 * Error classification utilities for Instagram publishing
 * Separates transient errors (retry) from permanent errors (fail-fast)
 */

/**
 * Check if error is transient (should retry)
 * Transient errors are typically temporary network issues or rate limits
 */
export function isTransientError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Network errors
    if (isNetworkError(error)) return true;

    // Rate limit errors
    if (isRateLimitError(error)) return true;

    // Server errors (5xx)
    if (isServerError(error)) return true;

    // Browser/Playwright errors
    if (isBrowserError(error)) return true;

    // Instagram temporarily unavailable
    if (/temporarily.?unavailable|try.?again/.test(msg)) return true;
  }

  return false;
}

/**
 * Check if error is permanent (should not retry)
 * Permanent errors indicate the operation cannot succeed even with retries
 */
export function isPermanentError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();

    // Auth failures (401/403)
    if (/401|403|unauthorized|forbidden|session.?expired|not.?authenticated/.test(msg)) return true;

    // Validation failures
    if (/validation.?error|invalid|malformed/.test(msg)) return true;

    // Image issues
    if (/image.?too.?large|invalid.?format|dimensions?|aspect.?ratio/.test(msg)) return true;

    // Policy violations
    if (/duplicate|blocked|suspended|content.?policy|violat/.test(msg)) return true;

    // Account issues
    if (/account.?suspended|banned|restricted/.test(msg)) return true;

    // Session invalid
    if (/session.?invalid|decryption.?failed|decrypt/.test(msg)) return true;
  }

  return false;
}

/**
 * Classify error and return detailed categorization
 */
export function classifyError(error: unknown): {
  type: 'transient' | 'permanent' | 'unknown';
  category: string;
  retryable: boolean;
  message: string;
} {
  const message = error instanceof Error ? error.message : String(error);

  if (isNetworkError(error)) {
    return {
      type: 'transient',
      category: 'network',
      retryable: true,
      message,
    };
  }

  if (isRateLimitError(error)) {
    return {
      type: 'transient',
      category: 'rate_limit',
      retryable: true,
      message,
    };
  }

  if (isServerError(error)) {
    return {
      type: 'transient',
      category: 'server_error',
      retryable: true,
      message,
    };
  }

  if (isBrowserError(error)) {
    return {
      type: 'transient',
      category: 'browser_error',
      retryable: true,
      message,
    };
  }

  if (isPermanentError(error)) {
    return {
      type: 'permanent',
      category: 'permanent',
      retryable: false,
      message,
    };
  }

  return {
    type: 'unknown',
    category: 'unknown',
    retryable: false,
    message,
  };
}

/**
 * Helper: Check for network-related errors
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /econnrefused|etimedout|ehostunreach|enetunreach|network|timeout|socket/.test(msg);
  }
  return false;
}

/**
 * Helper: Check for rate limit errors
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /429|rate.?limit|too.?many.?requests|rate.?exceeded/.test(msg);
  }
  return false;
}

/**
 * Helper: Check for HTTP 5xx server errors
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /5\d\d|server.?error|service.?unavailable|temporarily.?unavailable/.test(msg);
  }
  return false;
}

/**
 * Helper: Check for browser/Playwright errors
 */
export function isBrowserError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /browser.?closed|browser.?crashed|page.?closed|playwright/.test(msg);
  }
  return false;
}

/**
 * Helper: Check for auth/session errors
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /401|403|unauthorized|forbidden|session.?expired|not.?authenticated/.test(msg);
  }
  return false;
}

/**
 * Helper: Check for validation/content errors
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    return /validation|invalid|malformed|dimensions?|aspect.?ratio|too.?large/.test(msg);
  }
  return false;
}

/**
 * Generate user-friendly error message based on error type
 */
export function getErrorMessage(error: unknown): {
  userMessage: string;
  suggestion: string;
} {
  const msg = error instanceof Error ? error.message : String(error);
  const classification = classifyError(error);

  switch (classification.category) {
    case 'network':
      return {
        userMessage: '⚠️ Network issue encountered. Retrying automatically...',
        suggestion: 'Check your internet connection and try again',
      };

    case 'rate_limit':
      return {
        userMessage: '⚠️ Instagram rate limit. Retrying with longer delay...',
        suggestion: 'Try again in a few minutes',
      };

    case 'server_error':
      return {
        userMessage: '⚠️ Instagram server error. Retrying automatically...',
        suggestion: 'Instagram may be temporarily unavailable. Try again later',
      };

    case 'browser_error':
      return {
        userMessage: '⚠️ Browser error. Retrying automatically...',
        suggestion: 'Try again',
      };

    default:
      if (isAuthError(error)) {
        return {
          userMessage: '❌ Authentication failed',
          suggestion: 'Please re-authenticate with Instagram',
        };
      }

      if (isValidationError(error)) {
        return {
          userMessage: `❌ Content validation failed: ${msg}`,
          suggestion: 'Check image format, size, and dimensions',
        };
      }

      return {
        userMessage: `❌ Failed to publish: ${msg}`,
        suggestion: 'Check logs for details and try again',
      };
  }
}
