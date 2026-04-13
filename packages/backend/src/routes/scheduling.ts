import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { SchedulingService } from '../services/SchedulingService.js';
import { BestTimesCalculator } from '../services/BestTimesCalculator.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Content scheduling routes
 * AC 1-6: Schedule creation, validation, best times, retrieval, update, cancel
 */
export function createSchedulingRoutes(db: Database.Database): Router {
  const router = Router();
  const schedulingService = new SchedulingService(db);
  const bestTimesCalculator = new BestTimesCalculator(db);

  /**
   * AC 1: POST /api/content/{contentId}/schedule
   * Schedule content for specific date/time
   * Body: { scheduled_at: ISO8601 }
   */
  router.post('/content/:contentId/schedule', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { contentId } = req.params;
      const { scheduled_at } = req.body;

      // Validation
      if (!scheduled_at) {
        res.status(400).json({ error: 'scheduled_at is required' });
        return;
      }

      // Get profile_id from content
      const contentStmt = db.prepare(`
        SELECT profile_id FROM content WHERE id = ?
      `);
      const content = contentStmt.get(contentId) as any;
      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(content.profile_id, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Create schedule
      const schedule = schedulingService.createSchedule(contentId, content.profile_id, { scheduled_at });

      res.status(200).json({
        message: 'Content scheduled successfully',
        data: schedule,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Scheduling error:', errorMsg);

      if (errorMsg.includes('past_date')) {
        res.status(400).json({ error: 'past_date', message: 'Scheduled date cannot be in the past' });
      } else if (errorMsg.includes('invalid_format')) {
        res.status(400).json({ error: 'invalid_format', message: 'Invalid ISO8601 date format' });
      } else if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'not_found', message: errorMsg });
      } else {
        res.status(500).json({ error: 'Failed to schedule content' });
      }
    }
  });

  /**
   * AC 3: GET /api/profiles/{profileId}/best-times?days=7
   * Get best posting times based on engagement history
   */
  router.get('/profiles/:profileId/best-times', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;
      const days = parseInt(req.query.days as string) || 7;

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(profileId, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Calculate best times
      const bestTimes = bestTimesCalculator.calculateBestTimes(profileId, days);

      res.status(200).json({
        data: bestTimes,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Best times error:', errorMsg);

      if (errorMsg.includes('insufficient_data')) {
        res.status(400).json({ error: 'insufficient_data', message: errorMsg });
      } else {
        res.status(500).json({ error: 'Failed to calculate best times' });
      }
    }
  });

  /**
   * AC 4: GET /api/profiles/{profileId}/scheduled
   * Retrieve active schedules for a profile
   */
  router.get('/profiles/:profileId/scheduled', verifyAccessToken, async (req: AuthRequest, res: Response) => {
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
      const profile = profileStmt.get(profileId, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Get scheduled posts
      const scheduled = schedulingService.getSchedulesByProfile(profileId);

      res.status(200).json({
        data: scheduled,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Get scheduled error:', errorMsg);
      res.status(500).json({ error: 'Failed to retrieve scheduled posts' });
    }
  });

  /**
   * AC 5: POST /api/content/{contentId}/schedule (update)
   * Update scheduled date/time — uses POST with new scheduled_at
   * Route: POST /api/content/{contentId}/schedule/update
   */
  router.post('/content/:contentId/schedule/update', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { contentId } = req.params;
      const { scheduled_at } = req.body;

      // Validation
      if (!scheduled_at) {
        res.status(400).json({ error: 'scheduled_at is required' });
        return;
      }

      // Get profile_id from content
      const contentStmt = db.prepare(`
        SELECT profile_id FROM content WHERE id = ?
      `);
      const content = contentStmt.get(contentId) as any;
      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(content.profile_id, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Update schedule
      const schedule = schedulingService.updateSchedule(contentId, content.profile_id, { scheduled_at });

      res.status(200).json({
        message: 'Schedule updated successfully',
        data: schedule,
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Update schedule error:', errorMsg);

      if (errorMsg.includes('past_date')) {
        res.status(400).json({ error: 'past_date', message: 'Scheduled date cannot be in the past' });
      } else if (errorMsg.includes('invalid_format')) {
        res.status(400).json({ error: 'invalid_format', message: 'Invalid ISO8601 date format' });
      } else if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'not_found', message: errorMsg });
      } else {
        res.status(500).json({ error: 'Failed to update schedule' });
      }
    }
  });

  /**
   * AC 6: DELETE /api/content/{contentId}/schedule
   * Cancel schedule and return content to draft state
   */
  router.delete('/content/:contentId/schedule', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { contentId } = req.params;

      // Get profile_id from content
      const contentStmt = db.prepare(`
        SELECT profile_id FROM content WHERE id = ?
      `);
      const content = contentStmt.get(contentId) as any;
      if (!content) {
        res.status(404).json({ error: 'Content not found' });
        return;
      }

      // Verify profile belongs to user
      const profileStmt = db.prepare(`
        SELECT id FROM profiles WHERE id = ? AND user_id = ?
      `);
      const profile = profileStmt.get(content.profile_id, userId);
      if (!profile) {
        res.status(403).json({ error: 'Profile not found or access denied' });
        return;
      }

      // Cancel schedule
      schedulingService.cancelSchedule(contentId, content.profile_id);

      res.status(200).json({
        message: 'Schedule cancelled successfully',
      });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Cancel schedule error:', errorMsg);

      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'not_found', message: errorMsg });
      } else {
        res.status(500).json({ error: 'Failed to cancel schedule' });
      }
    }
  });

  return router;
}
