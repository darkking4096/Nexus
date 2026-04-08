import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { ResearchService } from '../services/ResearchService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Content research routes using Marketing Instagram Squad
 */
export function createResearchRoutes(db: Database.Database, squadsDir?: string): Router {
  const router = Router();
  const researchService = new ResearchService(db, squadsDir);

  /**
   * POST /api/content/research
   * Run AI research pipeline for a profile
   *
   * Note: This endpoint is synchronous and can take 30-60 seconds
   * due to multiple Claude API calls. Consider upgrading to async/polling
   * or streaming responses (tech debt).
   */
  router.post('/research', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.body;

      if (!profileId) {
        res.status(400).json({ error: 'profileId required' });
        return;
      }

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(profileId, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Run research (this can take 30-60 seconds)
      // In production, you'd run this async and return a job ID for polling
      const result = await researchService.runResearch(profileId, userId);

      res.status(200).json({
        message: 'Research complete',
        profile_id: profileId,
        data: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Research error:', errorMsg);

      if (errorMsg.includes('not found') || errorMsg.includes('Access denied')) {
        res.status(403).json({ error: errorMsg });
      } else if (errorMsg.includes('ANTHROPIC_API_KEY')) {
        res.status(500).json({ error: 'Research service not configured' });
      } else {
        res.status(500).json({ error: 'Research failed', detail: errorMsg });
      }
    }
  });

  return router;
}
