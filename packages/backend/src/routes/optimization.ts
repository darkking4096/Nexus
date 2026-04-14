import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { OptimizationService } from '../services/OptimizationService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

interface ProfileRow {
  id: string;
  user_id: string;
}

/**
 * Optimization routes
 * AC: Best time analysis, confidence calculation, timezone handling
 */
export function createOptimizationRoutes(db: Database.Database): Router {
  const router = Router();
  const optimizationService = new OptimizationService(db);

  /**
   * GET /api/optimization/{profileId}/best-publish-time
   * Get recommended publish time based on historical engagement
   * Query params: timezone (optional), lookback (optional, default 30)
   */
  router.get(
    '/optimization/:profileId/best-publish-time',
    verifyAccessToken,
    async (req: AuthRequest, res: Response) => {
      try {
        const userId = req.userId;
        if (!userId) {
          res.status(401).json({ error: 'Unauthorized' });
          return;
        }

        const { profileId } = req.params;
        const { timezone, lookback } = req.query;

        // Verify profile belongs to user
        const profileStmt = db.prepare(`
          SELECT id, user_id FROM profiles WHERE id = ?
        `);
        const profile = profileStmt.get(profileId) as ProfileRow | undefined;

        if (!profile || profile.user_id !== userId) {
          res.status(403).json({ error: 'Profile not found or access denied' });
          return;
        }

        // Validate lookback parameter
        let lookbackDays = 30;
        if (lookback) {
          const parsed = parseInt(String(lookback), 10);
          if (isNaN(parsed) || parsed < 1 || parsed > 365) {
            res.status(400).json({
              error: 'Invalid lookback parameter',
              message: 'lookback must be between 1 and 365 days',
            });
            return;
          }
          lookbackDays = parsed;
        }

        // Get recommendation
        const recommendation = await optimizationService.getBestPublishTime(
          profileId,
          timezone ? String(timezone) : undefined,
          lookbackDays
        );

        res.status(200).json({
          success: true,
          data: recommendation,
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error('Optimization error:', errorMsg);

        if (errorMsg.includes('Invalid timezone')) {
          res.status(400).json({
            error: 'Invalid timezone',
            message: errorMsg,
          });
        } else if (errorMsg.includes('Insufficient data')) {
          res.status(400).json({
            error: 'Insufficient data for recommendation',
            message: errorMsg,
          });
        } else if (errorMsg.includes('No posts found')) {
          res.status(400).json({
            error: 'No posts found',
            message: errorMsg,
          });
        } else {
          res.status(500).json({
            error: 'Failed to get best publish time recommendation',
            message: errorMsg,
          });
        }
      }
    }
  );

  return router;
}
