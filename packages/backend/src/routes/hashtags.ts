import { Response, Router } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { HashtagGenerator, HashtagGenerationRequest } from '../services/HashtagGenerator';
import { logger } from '../utils/logger';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware';

/**
 * Hashtag generation routes: Instagram hashtag discovery and generation
 */
export function createHashtagRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const hashtagGenerator = new HashtagGenerator(db);

  /**
   * POST /api/content/generate-hashtags
   * Generate hashtags for Instagram post with trending + niche + long-tail mix
   *
   * Request Body:
   * {
   *   "profile_id": "inst_123",
   *   "content_type": "carousel|story|reel",
   *   "analysis": {
   *     "niche": "fitness",
   *     "audience": "gym-goers, personal training",
   *     "keywords": ["workout", "gains", "fitnessmotivation"]
   *   },
   *   "min_hashtags": 10,
   *   "max_hashtags": 15
   * }
   *
   * Response: HTTP 200
   * {
   *   "hashtags": [
   *     {
   *       "hashtag": "#fitnessmotivation",
   *       "volume": 750000,
   *       "competition": "high",
   *       "recommendation_score": 0.82,
   *       "category": "niche",
   *       "status": "approved"
   *     }
   *   ],
   *   "totalGenerated": 18,
   *   "totalApproved": 14,
   *   "totalFlagged": 0,
   *   "totalRemoved": 4,
   *   "generatedAt": "2026-04-12T10:30:00Z",
   *   "metadata": {
   *     "profile_id": "inst_123",
   *     "content_type": "carousel",
   *     "niche": "fitness",
   *     "shadowban_alerts": 0
   *   }
   * }
   */
  router.post(
    '/generate-hashtags',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const {
          profile_id,
          content_type,
          analysis,
          min_hashtags = 10,
          max_hashtags = 15,
        } = req.body;

        // Validation
        if (!profile_id) {
          res.status(400).json({ error: 'profile_id is required' });
          return;
        }

        if (!content_type || !['carousel', 'story', 'reel'].includes(content_type)) {
          res.status(400).json({
            error: 'content_type must be one of: carousel, story, reel',
          });
          return;
        }

        if (!analysis || !analysis.niche) {
          res.status(400).json({ error: 'analysis.niche is required' });
          return;
        }

        if (min_hashtags < 10 || max_hashtags > 30) {
          res.status(400).json({
            error: 'hashtags must be between 10-30 (Instagram max 30)',
          });
          return;
        }

        logger.info(
          `[POST /content/generate-hashtags] Generating hashtags: profile=${profile_id}, niche=${analysis.niche}`
        );

        // Generate hashtags
        const request: HashtagGenerationRequest = {
          profile_id,
          content_type: content_type as 'carousel' | 'story' | 'reel',
          analysis,
          minHashtags: min_hashtags,
          maxHashtags: max_hashtags,
        };

        const response = await hashtagGenerator.generateHashtags(request);

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Total-Hashtags', response.totalApproved.toString());
        res.setHeader('X-Shadowban-Alerts', response.metadata.shadowban_alerts.toString());
        res.setHeader('X-Generated-At', response.generatedAt);

        res.json(response);
      } catch (error) {
        logger.error(`[POST /content/generate-hashtags] Error: ${error}`);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          error: 'Failed to generate hashtags',
          details: errorMessage,
        });
      }
    }
  );

  /**
   * POST /api/content/validate-hashtags
   * Validate hashtags against shadowban list
   *
   * Request Body:
   * {
   *   "hashtags": ["#fitness", "#gym", "#workout"]
   * }
   *
   * Response: HTTP 200
   * {
   *   "valid": ["#fitness", "#workout"],
   *   "invalid": ["#gym"],
   *   "details": [
   *     { "hashtag": "#fitness", "isShadowbanned": false },
   *     { "hashtag": "#gym", "isShadowbanned": true }
   *   ]
   * }
   */
  router.post(
    '/validate-hashtags',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { hashtags } = req.body;

        if (!hashtags || !Array.isArray(hashtags)) {
          res.status(400).json({ error: 'hashtags (array) is required' });
          return;
        }

        logger.info(`[POST /content/validate-hashtags] Validating ${hashtags.length} hashtags`);

        const validation = hashtagGenerator.validateHashtags(hashtags);

        res.json({
          valid: validation.valid,
          invalid: validation.invalid,
          validCount: validation.valid.length,
          invalidCount: validation.invalid.length,
        });
      } catch (error) {
        logger.error(`[POST /content/validate-hashtags] Error: ${error}`);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          error: 'Failed to validate hashtags',
          details: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/content/hashtags/health
   * Check hashtag generation service health (shadowban list status)
   */
  router.get('/health', verifyAccessToken, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const isHealthy = await hashtagGenerator.healthCheck();
      const shadowbanHealth = hashtagGenerator.checkShadowbanListHealth();

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'hashtag-generator',
        shadowban_list: {
          age_days: shadowbanHealth.daysOld,
          needs_update: shadowbanHealth.needsUpdate,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`[GET /content/hashtags/health] Error: ${error}`);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

export default createHashtagRoutes;
