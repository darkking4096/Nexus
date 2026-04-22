import { Response, Router } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { CarouselGenerator, CarouselGenerationRequest, CarouselSlide } from '../services/CarouselGenerator';
import { logger } from '../utils/logger';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware';

/**
 * Carousel generation routes: multi-slide Instagram carousel generation
 */
export function createCarouselRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const carouselGenerator = new CarouselGenerator(db);

  /**
   * POST /api/visual/generate-carousel
   * Generate Instagram carousel (multiple slides with SVG overlay)
   *
   * Request Body:
   * {
   *   "slides": [
   *     {
   *       "image": "<base64 or Buffer>",
   *       "copy": "Slide text here",
   *       "brandColor": "#FF5733" (optional)
   *     }
   *   ],
   *   "brandColors": {
   *     "primary": "#FF5733",
   *     "secondary": "#33FF57",
   *     "accent": "#3357FF"
   *   },
   *   "showNumbers": true,
   *   "numberPosition": "bottom-right",
   *   "ensureContrast": true
   * }
   *
   * Response: HTTP 200
   * {
   *   "slides": [
   *     {
   *       "slideNumber": 1,
   *       "imageBuffer": <Buffer>,
   *       "dimensions": { "width": 1080, "height": 1350 },
   *       "copyApplied": true,
   *       "numberApplied": true,
   *       "contrastValidated": true,
   *       "contrastRatio": 4.8
   *     }
   *   ],
   *   "totalSlides": 3,
   *   "generatedAt": "2026-04-12T10:30:00Z",
   *   "metadata": {...}
   * }
   */
  router.post(
    '/generate-carousel',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const {
          slides,
          brandColors,
          showNumbers = true,
          numberPosition = 'bottom-right',
          ensureContrast = true,
        } = req.body;

        // Validation
        if (!slides || !Array.isArray(slides)) {
          res.status(400).json({ error: 'slides (array) is required' });
          return;
        }

        if (slides.length === 0) {
          res.status(400).json({ error: 'At least 1 slide is required' });
          return;
        }

        if (slides.length > 10) {
          res.status(400).json({ error: 'Maximum 10 slides allowed' });
          return;
        }

        // Process slides: convert base64 to Buffer if needed
        const processedSlides: CarouselSlide[] = slides.map((slide, index) => {
          if (!slide.image) {
            throw new Error(`Slide ${index + 1}: image is required`);
          }

          let imageBuffer: Buffer;
          if (typeof slide.image === 'string') {
            // Assume base64 encoded
            imageBuffer = Buffer.from(slide.image, 'base64');
          } else if (Buffer.isBuffer(slide.image)) {
            imageBuffer = slide.image;
          } else {
            throw new Error(`Slide ${index + 1}: image must be Buffer or base64 string`);
          }

          return {
            image: imageBuffer,
            copy: slide.copy,
            brandColor: slide.brandColor,
          };
        });

        logger.info(
          `[POST /visual/generate-carousel] Generating carousel: ${slides.length} slides`
        );

        // Generate carousel
        const request: CarouselGenerationRequest = {
          slides: processedSlides,
          brandColors,
          showNumbers,
          numberPosition: numberPosition as 'top-right' | 'bottom-right' | 'bottom-left',
          ensureContrast,
        };

        const response = await carouselGenerator.generateCarousel(request);

        // Send response with image buffers
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Total-Slides', response.totalSlides.toString());
        res.setHeader('X-Generated-At', response.generatedAt);

        res.json({
          slides: response.slides.map((slide) => ({
            slideNumber: slide.slideNumber,
            imageBuffer: slide.imageBuffer.toString('base64'),
            dimensions: slide.dimensions,
            copyApplied: slide.copyApplied,
            numberApplied: slide.numberApplied,
            contrastValidated: slide.contrastValidated,
            contrastRatio: slide.contrastRatio,
          })),
          totalSlides: response.totalSlides,
          generatedAt: response.generatedAt,
          metadata: response.metadata,
        });
      } catch (error) {
        logger.error(`[POST /visual/generate-carousel] Error: ${error}`);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
          error: 'Failed to generate carousel',
          details: errorMessage,
        });
      }
    }
  );

  /**
   * GET /api/visual/carousel/health
   * Check carousel generation service health
   */
  router.get('/health', verifyAccessToken, async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
      const isHealthy = await carouselGenerator.healthCheck();

      res.status(isHealthy ? 200 : 503).json({
        status: isHealthy ? 'healthy' : 'degraded',
        service: 'carousel-generator',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error(`[GET /visual/carousel/health] Error: ${error}`);
      res.status(503).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  });

  return router;
}

export default createCarouselRoutes;
