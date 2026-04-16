import compression from 'compression';
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * Enhanced compression middleware with custom configuration
 * Applies gzip/brotli compression to all responses
 * - Minimum 1KB for compression (saves overhead for small responses)
 * - Exclude binary formats (images, videos) already compressed
 * - Set aggressive compression level (9) for maximum efficiency
 */
export function createCompressionMiddleware() {
  return compression({
    // Compress only responses above 1KB
    threshold: 1024,

    // Compression level: 0-9 (9 = most compression, slowest)
    // Use 6 as sweet spot between compression ratio and speed
    level: 6,

    // Filter function to decide which content types to compress
    filter: (req: Request, res: Response): boolean => {
      // Don't compress if client doesn't support it
      const acceptEncoding = req.headers['accept-encoding'];
      if (!acceptEncoding || !acceptEncoding.includes('gzip')) {
        return false;
      }

      // Don't compress binary formats (already compressed)
      const contentType = res.getHeader('content-type');
      if (typeof contentType !== 'string') {
        return true;
      }

      // Compress text-based and JSON responses
      const shouldCompress =
        contentType.includes('application/json') ||
        contentType.includes('text/') ||
        contentType.includes('application/javascript') ||
        contentType.includes('application/xml');

      if (!shouldCompress) {
        logger.debug(
          `[Compression] Skipping compression for content-type: ${contentType}`
        );
      }

      return shouldCompress;
    },

  });
}

/**
 * Track compression metrics for monitoring
 */
export function createCompressionMetricsMiddleware() {
  return (_req: Request, res: Response, next: NextFunction) => {
    const originalSend = res.send;

    res.send = function (data: unknown) {
      const encoding = res.getHeader('content-encoding');
      if (encoding) {
        const size = typeof data === 'string' ? data.length : JSON.stringify(data).length;
        logger.debug(`[Compression] Compressed response (${encoding}): ~${size} bytes`);
      }

      return originalSend.call(this, data);
    };

    next();
  };
}
