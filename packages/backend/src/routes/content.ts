import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { PublishService } from '../services/PublishService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Content routes: publishing, research, etc.
 */
export function createContentRoutes(db: Database.Database): Router {
  const router = Router();
  const publishService = new PublishService(db);

  /**
   * POST /api/content/publish
   * Publish content to Instagram
   * Body: { contentId, profileId }
   */
  router.post('/publish', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { contentId, profileId } = req.body;

      // Validation
      if (!contentId || !profileId) {
        res.status(400).json({ error: 'contentId and profileId required' });
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

      // Publish
      const result = await publishService.publish(contentId, profileId);

      res.status(200).json({
        message: 'Content published successfully',
        data: result,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Publish error:', errorMsg);

      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: errorMsg });
      } else if (errorMsg.includes('access denied')) {
        res.status(403).json({ error: errorMsg });
      } else {
        res.status(500).json({ error: 'Failed to publish content' });
      }
    }
  });

  /**
   * GET /api/content/:contentId/status
   * Get publishing status and recent attempts for a piece of content
   */
  router.get('/:contentId/status', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { contentId } = req.params;

      // Get content
      const contentStmt = db.prepare(`
        SELECT * FROM content WHERE id = ?
      `);
      const content = contentStmt.get(contentId) as
        | { id: string; status: string; publish_error?: string; published_at?: string; instagram_url?: string; profile_id: string }
        | undefined;

      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      // Verify user owns this content via profile
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(content.profile_id, userId);
      if (!profile) {
        res.status(403).json({ error: 'Content not found or access denied' });
        return;
      }

      // Get recent publish attempts
      const logsStmt = db.prepare(`
        SELECT * FROM publish_logs
        WHERE content_id = ?
        ORDER BY timestamp DESC
        LIMIT 10
      `);
      const recentAttempts = logsStmt.all(contentId);

      res.json({
        content_id: contentId,
        status: content.status, // 'draft', 'publishing', 'retrying', 'error', 'published'
        error: content.publish_error || null,
        published_at: content.published_at || null,
        instagram_url: content.instagram_url || null,
        recent_attempts: recentAttempts,
      });
    } catch (error) {
      console.error('Get content status error:', error);
      res.status(500).json({ error: 'Failed to get content status' });
    }
  });

  /**
   * GET /api/content/:profileId
   * List content for profile
   */
  router.get('/:profileId', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(profileId, userId) as { id: string } | undefined;
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Get content
      const contentStmt = db.prepare(`
        SELECT * FROM content
        WHERE profile_id = ?
        ORDER BY created_at DESC
      `);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const content = contentStmt.all(profileId) as any[];

      res.json({
        count: content.length,
        content,
      });
    } catch (error) {
      console.error('List content error:', error);
      res.status(500).json({ error: 'Failed to list content' });
    }
  });

  return router;
}
