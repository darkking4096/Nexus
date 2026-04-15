import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { DashboardService } from '../services/DashboardService.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';
import { getCache } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';

export function createDashboardRoutes(db: Database.Database): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);
  const dashboardService = new DashboardService(db, analyticsService);

  /**
   * GET /api/dashboard/overview
   * Get consolidated overview of all profiles with KPIs
   * Query params:
   *   - sortBy: engagement (default), followers, or growth
   */
  router.get('/overview', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const sortBy = (req.query.sortBy as 'engagement' | 'followers' | 'growth') || 'engagement';

      // Validate sortBy parameter
      if (!['engagement', 'followers', 'growth'].includes(sortBy)) {
        return res.status(400).json({
          error: 'Invalid sortBy parameter. Must be one of: engagement, followers, growth',
        });
      }

      // Try to get from cache first (5min TTL for dashboard)
      const cache = getCache();
      const cacheKey = `dashboard:${userId}:${sortBy}`;
      const cached = await cache.get(cacheKey);

      if (cached) {
        logger.debug(`[Dashboard] Cache HIT for ${cacheKey}`);
        return res.json(cached);
      }

      const overview = await dashboardService.getDashboardOverview(userId, sortBy);

      // Cache the result
      await cache.set(cacheKey, overview, 5 * 60); // 5 minute TTL

      res.json(overview);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Dashboard] Overview error:', msg);

      res.status(500).json({ error: 'Failed to fetch dashboard overview' });
    }
  });

  return router;
}
