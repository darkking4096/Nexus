/**
 * Simple logger utility for consistent logging across services
 */

export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data, null, 2) : '');
  },
  error: (message: string, error?: Error | string) => {
    console.error(`[ERROR] ${message}`, error);
  },
  debug: (message: string, data?: Record<string, unknown>) => {
    if (process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  },
};
