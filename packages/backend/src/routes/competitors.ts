import { Router, Response } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { Competitor } from '../models/Competitor.js';
import { Profile } from '../models/Profile.js';
import { CompetitorService } from '../services/CompetitorService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

export function createCompetitorsRoutes(db: DatabaseAdapter): Router {
  const router = Router({ mergeParams: true });
  const competitorModel = new Competitor(db);
  const profileModel = new Profile(db);

  /**
   * POST /api/profiles/:profileId/competitors
   * Add a new competitor
   */
  router.post('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;
      const { instagram_username } = req.body;

      // Validate input
      if (!instagram_username || typeof instagram_username !== 'string') {
        res.status(400).json({ error: 'Instagram username is required' });
        return;
      }

      // Validate Instagram username format
      if (!CompetitorService.validateInstagramUsername(instagram_username)) {
        res.status(400).json({ error: 'Invalid Instagram username format' });
        return;
      }

      // Check profile ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Check if competitor already exists
      if (competitorModel.existsByUsername(profileId, instagram_username)) {
        res.status(409).json({ error: 'Competitor already exists' });
        return;
      }

      // Fetch competitor data
      const competitorData = await CompetitorService.fetchCompetitorData(instagram_username);
      const formatted = CompetitorService.formatCompetitorData(competitorData);

      // Create competitor
      const competitor = competitorModel.create({
        profile_id: profileId,
        instagram_username,
        followers_count: formatted.followers_count,
        top_posts_data: formatted.top_posts_data,
      });

      res.status(201).json({
        message: 'Competitor added successfully',
        competitor,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Add competitor error:', errorMessage);
      res.status(500).json({ error: 'Failed to add competitor' });
    }
  });

  /**
   * GET /api/profiles/:profileId/competitors
   * List all competitors for a profile
   */
  router.get('/', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId } = req.params;

      // Check profile ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Get competitors
      const competitors = competitorModel.getByProfileId(profileId);

      res.json({
        count: competitors.length,
        competitors,
      });
    } catch (error) {
      console.error('List competitors error:', error);
      res.status(500).json({ error: 'Failed to list competitors' });
    }
  });

  /**
   * DELETE /api/profiles/:profileId/competitors/:competitorId
   * Delete a competitor
   */
  router.delete('/:competitorId', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { profileId, competitorId } = req.params;

      // Check profile ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Check competitor exists and belongs to profile
      const competitor = competitorModel.getById(competitorId);
      if (!competitor || competitor.profile_id !== profileId) {
        res.status(404).json({ error: 'Competitor not found' });
        return;
      }

      // Delete competitor
      const deleted = competitorModel.delete(competitorId);

      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete competitor' });
        return;
      }

      res.json({ message: 'Competitor deleted successfully' });
    } catch (error) {
      console.error('Delete competitor error:', error);
      res.status(500).json({ error: 'Failed to delete competitor' });
    }
  });

  return router;
}
