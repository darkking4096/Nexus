import { Router, Response } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { QueueService } from '../services/QueueService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Content queue management routes
 * AC 1-6: View, reorder, delete, filter, paginate queue, real-time updates (optional)
 */
export function createQueueRoutes(db: DatabaseAdapter): Router {
  const router = Router();
  const queueService = new QueueService(db);

  /**
   * AC 1: GET /api/profiles/{profileId}/queue
   * Retrieve unified queue (scheduled + pending)
   */
  router.get('/profiles/:profileId/queue', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;
      const status = req.query.status as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(profileId, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Get queue
      const queue = queueService.getQueue(profileId, {
        status,
        page,
        limit,
      });

      res.status(200).json({
        data: queue.items,
        metadata: {
          total_count: queue.total,
          has_more: queue.has_more,
          current_page: queue.current_page,
        },
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get queue error:', errorMsg);
      res.status(500).json({ error: 'Failed to retrieve queue' });
    }
  });

  /**
   * AC 2: POST /api/profiles/{profileId}/queue/reorder
   * Reorder queue items (drag-drop)
   * Body: { reorders: [{ content_id, new_position }] }
   */
  router.post('/profiles/:profileId/queue/reorder', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;
      const { reorders } = req.body;

      // Validation
      if (!Array.isArray(reorders) || reorders.length === 0) {
        res.status(400).json({ error: 'reorders array is required' });
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

      // Reorder
      const updated = queueService.reorderQueue(profileId, reorders);

      res.status(200).json({
        message: 'Queue reordered successfully',
        data: updated,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Reorder queue error:', errorMsg);
      res.status(500).json({ error: 'Failed to reorder queue' });
    }
  });

  /**
   * AC 3: DELETE /api/profiles/{profileId}/queue/{contentId}
   * Delete post from queue (returns content to draft)
   */
  router.delete('/profiles/:profileId/queue/:contentId', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId, contentId } = req.params;

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(profileId, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Delete from queue
      queueService.deleteFromQueue(contentId, profileId);

      res.status(200).json({
        message: 'Content removed from queue',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Delete from queue error:', errorMsg);

      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'Content not found' });
      } else {
        res.status(500).json({ error: 'Failed to remove from queue' });
      }
    }
  });

  /**
   * AC 4: GET /api/profiles/{profileId}/queue?status=scheduled
   * Filter queue by status
   * Already implemented in getQueue above with ?status=scheduled|pending
   */

  /**
   * AC 5: GET /api/profiles/{profileId}/queue?page=1&limit=20
   * Pagination already implemented in getQueue above
   */

  return router;
}
