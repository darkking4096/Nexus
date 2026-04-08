import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { SearchService } from '../services/SearchService.js';
import { BenchmarkService } from '../services/BenchmarkService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

export function createAnalyticsRoutes(db: Database.Database): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);
  const searchService = new SearchService(db);
  const benchmarkService = new BenchmarkService(db, searchService, analyticsService);

  /**
   * GET /api/analytics/:profileId
   * Get current and historical metrics for a profile
   */
  router.get('/:profileId', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const userId = req.userId!;
      const days = parseInt(req.query.days as string) || 30;

      // Get current metrics
      const current = await analyticsService.getProfileMetrics(profileId, userId);
      if (!current) {
        return res.status(404).json({ error: 'Profile not found or no metrics available' });
      }

      // Get historical metrics
      const history = await analyticsService.getMetricsHistory(profileId, userId, days);

      // Get engagement rate
      const engagementRate = await analyticsService.getEngagementRate(profileId, userId, 7);

      res.json({
        current,
        history,
        engagementRate,
        period: days,
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] GET error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  });

  /**
   * GET /api/analytics/:profileId/posts/:postId
   * Get engagement metrics for a specific post
   */
  router.get('/:profileId/posts/:postId', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId, postId } = req.params;
      const userId = req.userId!;

      const metrics = await analyticsService.getPostMetrics(profileId, postId, userId);
      if (!metrics) {
        return res.status(404).json({ error: 'Post metrics not found' });
      }

      res.json(metrics);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] POST metrics error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch post metrics' });
    }
  });

  /**
   * GET /api/analytics/:profileId/benchmark
   * Get benchmark comparison vs competitors
   * Query params:
   *   - competitors: comma-separated handles (optional, uses stored if not provided)
   */
  router.get('/:profileId/benchmark', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const userId = req.userId!;
      const competitorsParam = req.query.competitors as string | undefined;
      const competitorHandles = competitorsParam ? competitorsParam.split(',').map((h) => h.trim()) : undefined;

      const benchmark = await benchmarkService.getBenchmark(profileId, userId, competitorHandles);

      res.json(benchmark);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] Benchmark error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found') || msg.includes('no metrics')) {
        return res.status(404).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch benchmark' });
    }
  });

  return router;
}
