import { Response, Router } from 'express';
import Database from 'better-sqlite3';
import { CaptionGenerator, CaptionRequest, BrandTone } from '../services/CaptionGenerator';
import { logger } from '../utils/logger';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware';

/**
 * Content generation routes: captions, hooks, CTAs
 */
export function createGenerationRoutes(db: Database.Database): Router {
  const router = Router();
  const captionGenerator = new CaptionGenerator(db);

  /**
   * POST /api/content/generate-caption
   * Generate captions for a profile based on analysis
   *
   * Request Body:
   * {
   *   "profile_id": "inst_123",
   *   "analysis": { ... },  // Optional, fetched from DB if not provided
   *   "caption_types": ["hook", "cta"],
   *   "brand_tone": "casual"  // Optional: 'casual' | 'profissional' | 'viral'
   * }
   *
   * Response: HTTP 200
   * {
   *   "captions": [
   *     {
   *       "type": "hook",
   *       "text": "...",
   *       "charCount": 75,
   *       "hashtags": ["#marketing", "#social"],
   *       "confidenceScore": 85
   *     }
   *   ],
   *   "metadata": {
   *     "profileId": "inst_123",
   *     "generatedAt": "2026-04-12T10:30:00Z",
   *     "framework": "Gary Vaynerchuk's Story-Telling",
   *     "confidenceAverage": 87,
   *     "brandTone": "casual"
   *   }
   * }
   */
  router.post(
    '/generate-caption',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { profile_id, caption_types, brand_tone } = req.body;

      // Validation
      if (!profile_id) {
        res.status(400).json({ error: 'profile_id is required' });
        return;
      }

      if (
        !caption_types ||
        !Array.isArray(caption_types) ||
        caption_types.length === 0
      ) {
        res.status(400).json({
          error:
            'caption_types must be a non-empty array of: hook, teaser, cta',
        });
        return;
      }

      // Validate caption types
      const validTypes = ['hook', 'teaser', 'cta'];
      const invalidTypes = caption_types.filter(
        (type: string) => !validTypes.includes(type)
      );
      if (invalidTypes.length > 0) {
        res.status(400).json({
          error: `Invalid caption_types: ${invalidTypes.join(', ')}. Valid: ${validTypes.join(
            ', '
          )}`,
        });
        return;
      }

      // Validate brand_tone if provided
      const validTones: BrandTone[] = ['casual', 'profissional', 'viral'];
      if (brand_tone && !validTones.includes(brand_tone)) {
        res.status(400).json({
          error: `Invalid brand_tone: ${brand_tone}. Valid: ${validTones.join(', ')}`,
        });
        return;
      }

      // Build request
      const generateRequest: CaptionRequest = {
        profileId: profile_id,
        captionTypes: caption_types,
        brandTone: brand_tone || 'casual',
      };

      logger.info(
        `[POST /generate-caption] Request for profile: ${profile_id}, types: ${caption_types.join(
          ', '
        )}`
      );

      // Generate captions
      const response = await captionGenerator.generateCaptions(generateRequest);

      // Ensure we return exactly 3 options per AC-2
      if (response.captions.length < 3) {
        logger.warn(
          `[POST /generate-caption] Generated only ${response.captions.length} captions, expected 3`
        );
      }

      res.status(200).json(response);
    } catch (error) {
      logger.error(`[POST /generate-caption] Error: ${error}`);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        error: 'Failed to generate captions',
        details: errorMessage,
      });
    }
  }
);

/**
 * GET /api/content/generate-caption/validate
 * Validate caption format without generating
 *
 * Query Params:
 * - caption: The caption text to validate
 * - length_min: Minimum length (default: 50)
 * - length_max: Maximum length (default: 150)
 *
 * Response: HTTP 200
 * {
 *   "valid": true,
 *   "charCount": 75,
 *   "hashtags": ["#marketing"],
 *   "warnings": []
 * }
 */
  router.get(
    '/generate-caption/validate',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { caption, length_min = 50, length_max = 150 } = req.query;

        if (!caption || typeof caption !== 'string') {
          res.status(400).json({ error: 'caption query parameter is required' });
          return;
        }

        const textWithoutHashtags = caption.replace(/#\S+/g, '').trim();
        const charCount = textWithoutHashtags.length;
        const hashtags = caption.match(/#\S+/g) || [];
        const warnings: string[] = [];

        let isValid = true;

        if (charCount < Number(length_min)) {
          warnings.push(
            `Caption too short: ${charCount}/${length_min} characters`
          );
          isValid = false;
        }

        if (charCount > Number(length_max)) {
          warnings.push(
            `Caption too long: ${charCount}/${length_max} characters`
          );
          isValid = false;
        }

        if (hashtags.length > 5) {
          warnings.push(`Too many hashtags: ${hashtags.length}/5`);
        }

        res.status(200).json({
          valid: isValid,
          charCount,
          hashtagCount: hashtags.length,
          hashtags,
          warnings,
        });
      } catch (error) {
        logger.error(`[GET /generate-caption/validate] Error: ${error}`);
        res.status(500).json({ error: 'Validation failed' });
      }
    }
  );

  return router;
}

export default createGenerationRoutes;
