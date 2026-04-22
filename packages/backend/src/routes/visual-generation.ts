import { Response, Router } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { VisualGenerator } from '../services/VisualGenerator';
import { logger } from '../utils/logger';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware';

/**
 * Visual generation routes: image generation, formatting, caching
 */
export function createVisualGenerationRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const visualGenerator = new VisualGenerator(db);

  /**
   * POST /api/visuals/generate
   * Generate visual content (image) for Instagram
   *
   * Request Body:
   * {
   *   "profile_id": "inst_123",
   *   "prompt": "tech startup team meeting",
   *   "format": "feed" | "story" | "reel",
   *   "branding_config": { ... }  // optional
   * }
   *
   * Response: HTTP 200 (binary PNG/JPG)
   * Headers: Content-Type: image/jpeg, X-Cache-Hit: true|false
   */
  router.post(
    '/generate',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { profile_id, prompt, format, branding_config } = req.body;

        // Validation
        if (!profile_id) {
          res.status(400).json({ error: 'profile_id is required' });
          return;
        }

        if (!prompt || typeof prompt !== 'string') {
          res.status(400).json({ error: 'prompt (string) is required' });
          return;
        }

        const validFormats = ['feed', 'story', 'reel'];
        if (!format || !validFormats.includes(format)) {
          res.status(400).json({
            error: `format must be one of: ${validFormats.join(', ')}`,
          });
          return;
        }

        logger.info(
          `[POST /visuals/generate] Generating visual: ${profile_id}, format=${format}`
        );

        // Generate visual
        const response = await visualGenerator.generateVisual({
          profileId: profile_id,
          prompt,
          format: format as 'feed' | 'story' | 'reel',
          brandingConfig: branding_config,
        });

        // Send image as binary response
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('X-Cache-Hit', response.cacheHit ? 'true' : 'false');
        res.setHeader('X-Image-Dimensions', `${response.dimensions.width}x${response.dimensions.height}`);
        res.setHeader('X-Generated-At', response.generatedAt);

        res.send(response.imageBuffer);
      } catch (error) {
        logger.error(`[POST /visuals/generate] Error: ${error}`);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          error: 'Failed to generate visual',
          details: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/visuals/health
   * Check if visual generation services are ready
   */
  router.get('/health', verifyAccessToken, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const isHealthy = await visualGenerator.healthCheck();

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        nando_banana: isHealthy ? 'ready' : 'unavailable',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`[GET /visuals/health] Error: ${error}`);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

export default createVisualGenerationRoutes;
