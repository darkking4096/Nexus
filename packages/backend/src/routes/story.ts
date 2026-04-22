import { Response, Router } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { StoryGenerator, StoryGenerationRequest } from '../services/StoryGenerator';
import { logger } from '../utils/logger';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware';

/**
 * Story generation routes: Instagram Story frame generation with branding
 */
export function createStoryRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const storyGenerator = new StoryGenerator(db);

  /**
   * POST /api/visual/generate-story
   * Generate Instagram Story frame (1080x1920) with brand colors
   *
   * Request Body:
   * {
   *   "headline": "Your Story Headline",
   *   "body": "Story body text\nwith multiple lines",
   *   "cta": "Learn More",
   *   "profile_id": "inst_123" (optional),
   *   "brand_id": "brand_456" (optional),
   *   "custom_colors": {
   *     "primary": "#FF5733",
   *     "background": "#FFFFFF"
   *   },
   *   "background_image": "<base64>" (optional)
   * }
   *
   * Response: HTTP 200
   * {
   *   "imageBuffer": "<base64>",
   *   "dimensions": { "width": 1080, "height": 1920 },
   *   "fileSize": 45234,
   *   "generatedAt": "2026-04-12T10:30:00Z",
   *   "brandConfig": {...},
   *   "metadata": {
   *     "contentLength": 145,
   *     "contrastValidated": true,
   *     "contrastRatio": 4.8,
   *     "logoEmbedded": false
   *   }
   * }
   */
  router.post(
    '/generate-story',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const {
          headline,
          body,
          cta,
          profile_id,
          brand_id,
          custom_colors,
          background_image,
        } = req.body;

        // Validation
        if (!headline && !body && !cta) {
          res.status(400).json({
            error: 'At least one of headline, body, or cta is required',
          });
          return;
        }

        // Validate dimensions: headline < 40 chars, body < 150 chars, cta < 30 chars
        if (headline && headline.length > 40) {
          res.status(400).json({
            error: 'Headline must be 40 characters or less',
          });
          return;
        }

        if (body && body.length > 150) {
          res.status(400).json({
            error: 'Body must be 150 characters or less',
          });
          return;
        }

        if (cta && cta.length > 30) {
          res.status(400).json({
            error: 'CTA must be 30 characters or less',
          });
          return;
        }

        logger.info(`[POST /visual/generate-story] Generating story: profile=${profile_id}`);

        // Parse background image if provided
        let bgBuffer: Buffer | undefined;
        if (background_image) {
          if (typeof background_image === 'string') {
            bgBuffer = Buffer.from(background_image, 'base64');
          } else if (Buffer.isBuffer(background_image)) {
            bgBuffer = background_image;
          }
        }

        // Generate story
        const request: StoryGenerationRequest = {
          headline,
          body,
          cta,
          profileId: profile_id,
          brandId: brand_id,
          customColors: custom_colors,
          backgroundImage: bgBuffer,
        };

        const response = await storyGenerator.generateStory(request);

        // Send response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-File-Size', response.fileSize.toString());
        res.setHeader('X-Generated-At', response.generatedAt);

        res.json({
          imageBuffer: response.imageBuffer.toString('base64'),
          dimensions: response.dimensions,
          fileSize: response.fileSize,
          generatedAt: response.generatedAt,
          brandConfig: {
            id: response.brandConfig.id,
            name: response.brandConfig.name,
            colors: response.brandConfig.colors,
          },
          metadata: response.metadata,
        });
      } catch (error) {
        logger.error(`[POST /visual/generate-story] Error: ${error}`);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          error: 'Failed to generate story',
          details: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/visual/story/health
   * Check story generation service health
   */
  router.get('/health', verifyAccessToken, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const isHealthy = await storyGenerator.healthCheck();

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'story-generator',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`[GET /visual/story/health] Error: ${error}`);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

export default createStoryRoutes;
