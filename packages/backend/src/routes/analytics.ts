import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { SearchService } from '../services/SearchService.js';
import { BenchmarkService } from '../services/BenchmarkService.js';
import { ContentMetricsService } from '../services/ContentMetricsService.js';
import { EngagementAnalysisService } from '../services/EngagementAnalysisService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

export function createAnalyticsRoutes(db: Database.Database): Router {
  const router = Router();
  const analyticsService = new AnalyticsService(db);
  const searchService = new SearchService(db);
  const benchmarkService = new BenchmarkService(db, searchService, analyticsService);
  const contentMetricsService = new ContentMetricsService(db, analyticsService);
  const engagementAnalysisService = new EngagementAnalysisService(db);

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
   * GET /api/analytics/:profileId/posts
   * Get last 30 posts with engagement metrics
   * Query params:
   *   - limit: number of posts to return (default: 30, max: 100)
   */
  router.get('/:profileId/posts', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const userId = req.userId!;
      const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);

      const posts = await analyticsService.getRecentPosts(profileId, userId, limit);

      res.json({
        posts,
        count: posts.length,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] Posts error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found')) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.status(500).json({ error: 'Failed to fetch posts' });
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

  /**
   * GET /api/analytics/content/:contentId/metrics
   * Get detailed metrics for a specific post including historical data
   * Query params:
   *   - profileId: required, profile that owns this content
   *   - days: number of days to return history (default: 7, max: 90)
   */
  router.get('/content/:contentId/metrics', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      const userId = req.userId!;
      const profileId = req.query.profileId as string | undefined;
      const days = Math.min(parseInt(req.query.days as string) || 7, 90);

      if (!profileId) {
        return res.status(400).json({ error: 'profileId query parameter is required' });
      }

      const metrics = await contentMetricsService.getPostMetricsWithHistory(contentId, profileId, userId, days);

      res.json(metrics);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] Content metrics error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found')) {
        return res.status(404).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch content metrics' });
    }
  });

  /**
   * GET /api/analytics/content/:contentId/growth
   * Get growth metrics for a post (likes/hour, growth rate, etc.)
   * Query params:
   *   - profileId: required, profile that owns this content
   */
  router.get('/content/:contentId/growth', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { contentId } = req.params;
      const userId = req.userId!;
      const profileId = req.query.profileId as string | undefined;

      if (!profileId) {
        return res.status(400).json({ error: 'profileId query parameter is required' });
      }

      const growth = await contentMetricsService.getPostGrowth(contentId, profileId, userId);

      res.json(growth);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] Growth metrics error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found')) {
        return res.status(404).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch growth metrics' });
    }
  });

  /**
   * GET /api/analytics/:profileId/engagement
   * Get engagement pattern analysis (top hours, content types, trends)
   * Query params:
   *   - days: number of days to analyze (default: 60, max: 180)
   */
  router.get('/:profileId/engagement', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const userId = req.userId!;
      const days = Math.min(parseInt(req.query.days as string) || 60, 180);

      const analysis = await engagementAnalysisService.getEngagementAnalysis(profileId, userId, days);

      res.json(analysis);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Analytics] Engagement analysis error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found') || msg.includes('Not enough data')) {
        return res.status(404).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to fetch engagement analysis' });
    }
  });

  return router;
}
