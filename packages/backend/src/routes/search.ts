import { Router, Response, RequestHandler } from 'express';
import type { DatabaseAdapter } from '../config/database';
import rateLimit from 'express-rate-limit';
import { SearchService } from '../services/SearchService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

export function createSearchRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const searchService = new SearchService(db);

  // Rate limiter: 30 requests per 15 minutes per IP
  const searchLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: 'Too many searches. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  /**
   * POST /api/search
   * Search for trends, competitors, or content ideas
   *
   * Request: { "query": "...", "type": "trends|competitors|content" }
   * Response: { "results": [...], "cached": false }
   */
  router.post(
    '/',
    verifyAccessToken,
    searchLimiter as RequestHandler,
    async (req: AuthRequest, res: Response) => {
      try {
        const { query, type } = req.body as { query?: string; type?: string };

        // Validation
        if (!query || typeof query !== 'string' || query.trim().length === 0) {
          return res.status(400).json({ error: 'Query is required and must be non-empty' });
        }

        if (!type || !['trends', 'competitors', 'content'].includes(type)) {
          return res.status(400).json({ error: 'Type must be one of: trends, competitors, content' });
        }

        let results;
        const cached = false;

        // Route to appropriate search method
        switch (type) {
          case 'trends':
            results = await searchService.searchTrends(query);
            break;

          case 'competitors': {
            // For competitors, expect array of handles
            const handles = Array.isArray(query) ? query : [query];
            results = await searchService.searchCompetitors(handles);
            break;
          }

          case 'content':
            results = await searchService.searchContent(query);
            break;

          default:
            return res.status(400).json({ error: 'Invalid search type' });
        }

        res.json({
          query,
          type,
          results,
          cached,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[Search] Error:', msg);
        res.status(500).json({ error: 'Search failed', details: msg });
      }
    }
  );

  /**
   * GET /api/search/health
   * Health check for search service
   */
  router.get('/health', (_req, res: Response) => {
    res.json({
      status: 'ok',
      service: 'SearchService',
      mode: 'development (mock searches)',
      timestamp: new Date().toISOString(),
    });
  });

  return router;
}
