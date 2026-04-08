import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import rateLimit from 'express-rate-limit';
import { InstaService } from '../services/InstaService.js';
import { Profile, ProfileData } from '../models/Profile.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Strip sensitive data from profile response
 */
function stripSensitiveData(profile: ProfileData): Omit<ProfileData, 'access_token'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { access_token, ...safeProfile } = profile;
  return safeProfile;
}

export function createProfilesRoutes(
  db: Database.Database,
  connectLimiter?: RequestHandler
): Router {
  const router = Router();
  const profileModel = new Profile(db);
  const instaService = new InstaService(db);

  // Default rate limiter for connect endpoint: 3 attempts per 5 minutes
  const defaultConnectLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // 3 requests per window
    message: 'Too many connection attempts. Please try again later.',
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
  });

  const limiter = connectLimiter || defaultConnectLimiter;

  /**
   * POST /api/profiles/create
   * Create new profile with wizard data
   * Combines Instagram connection + context configuration in one step
   */
  router.post('/create', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const {
        instagram_username,
        instagram_password,
        display_name,
        voice_description,
        tone,
        audience,
        goals,
      } = req.body;

      // Validation
      if (!instagram_username || !instagram_password) {
        res.status(400).json({ error: 'Instagram username and password required' });
        return;
      }

      if (!display_name || typeof display_name !== 'string') {
        res.status(400).json({ error: 'Display name required' });
        return;
      }

      if (!voice_description || typeof voice_description !== 'string') {
        res.status(400).json({ error: 'Voice description required' });
        return;
      }

      if (!tone || !['professional', 'casual', 'friendly'].includes(tone)) {
        res.status(400).json({ error: 'Valid tone required (professional, casual, friendly)' });
        return;
      }

      if (!audience || typeof audience !== 'object') {
        res.status(400).json({ error: 'Audience configuration required' });
        return;
      }

      if (!goals || !Array.isArray(goals) || goals.length === 0) {
        res.status(400).json({ error: 'At least one goal required' });
        return;
      }

      // Connect Instagram account first
      const profile = await instaService.connectAccount(userId, instagram_username, instagram_password);

      // Update profile with context
      const updatedProfile = profileModel.updateContext(profile.id, {
        voice: voice_description,
        tone,
        audience: JSON.stringify(audience),
        goals: JSON.stringify(goals),
      });

      if (!updatedProfile) {
        res.status(500).json({ error: 'Failed to update profile context' });
        return;
      }

      res.status(201).json({
        message: 'Profile created successfully',
        profile_id: updatedProfile.id,
        profile: stripSensitiveData(updatedProfile),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Create profile error:', errorMessage);

      if (errorMessage.includes('PERSONAL_ACCOUNT_NOT_SUPPORTED')) {
        res.status(403).json({ error: errorMessage });
      } else if (errorMessage.includes('already connected')) {
        res.status(409).json({ error: errorMessage });
      } else if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Login failed')) {
        res.status(401).json({ error: 'Invalid Instagram credentials' });
      } else {
        res.status(500).json({ error: 'Failed to create profile' });
      }
    }
  });

  /**
   * POST /api/profiles/connect
   * Connect Instagram account to user profile
   * Rate limited: 3 attempts per 5 minutes
   */
  router.post('/connect', verifyAccessToken, limiter, async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { username, password } = req.body;

      // Validation
      if (!username || !password) {
        res.status(400).json({ error: 'Instagram username and password required' });
        return;
      }

      if (typeof username !== 'string' || typeof password !== 'string') {
        res.status(400).json({ error: 'Username and password must be strings' });
        return;
      }

      // Attempt to connect
      const profile = await instaService.connectAccount(userId, username, password);

      // Strip and return (without access_token)
      res.status(201).json({
        message: 'Instagram account connected successfully',
        profile: stripSensitiveData(profile),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Connect account error:', errorMessage);

      // Determine status code based on error
      if (errorMessage.includes('PERSONAL_ACCOUNT_NOT_SUPPORTED')) {
        res.status(403).json({ error: errorMessage });
      } else if (errorMessage.includes('already connected')) {
        res.status(409).json({ error: errorMessage });
      } else if (errorMessage.includes('Invalid email or password') || errorMessage.includes('Login failed')) {
        res.status(401).json({ error: 'Invalid Instagram credentials' });
      } else {
        res.status(500).json({ error: 'Failed to connect Instagram account' });
      }
    }
  });

  /**
   * GET /api/profiles
   * List all profiles for current user
   */
  router.get('/', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profiles = profileModel.getByUserId(userId);
      const safeProfiles = profiles.map(stripSensitiveData);

      res.json({
        count: safeProfiles.length,
        profiles: safeProfiles,
      });
    } catch (error) {
      console.error('List profiles error:', error);
      res.status(500).json({ error: 'Failed to list profiles' });
    }
  });

  /**
   * GET /api/profiles/:id
   * Get specific profile (with ownership check)
   */
  router.get('/:id', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profileId = req.params.id;
      const profile = profileModel.getById(profileId);

      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      // Check ownership
      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      res.json(stripSensitiveData(profile));
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to get profile' });
    }
  });

  /**
   * PATCH /api/profiles/:id/context
   * Update profile context (voice, tone, audience, goals)
   */
  router.patch('/:id/context', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profileId = req.params.id;
      const { voice, tone, audience, goals } = req.body;

      // Check ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Validate inputs
      if (voice !== undefined && typeof voice !== 'string') {
        res.status(400).json({ error: 'Voice must be a string' });
        return;
      }

      if (tone !== undefined && !['professional', 'casual', 'friendly'].includes(tone)) {
        res.status(400).json({ error: 'Valid tone required (professional, casual, friendly)' });
        return;
      }

      if (audience !== undefined && typeof audience !== 'object') {
        res.status(400).json({ error: 'Audience must be an object' });
        return;
      }

      if (goals !== undefined && (!Array.isArray(goals) || goals.length === 0)) {
        res.status(400).json({ error: 'Goals must be a non-empty array' });
        return;
      }

      // Update context
      const updatedProfile = profileModel.updateContext(profileId, {
        voice: voice || profile.voice,
        tone: tone || profile.tone,
        audience: audience ? JSON.stringify(audience) : profile.audience,
        goals: goals ? JSON.stringify(goals) : profile.goals,
      });

      if (!updatedProfile) {
        res.status(500).json({ error: 'Failed to update profile context' });
        return;
      }

      res.json({
        message: 'Profile context updated successfully',
        profile: stripSensitiveData(updatedProfile),
      });
    } catch (error) {
      console.error('Update context error:', error);
      res.status(500).json({ error: 'Failed to update profile context' });
    }
  });

  /**
   * PATCH /api/profiles/:id
   * Update profile (display_name, bio)
   */
  router.patch('/:id', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profileId = req.params.id;
      const { display_name, bio } = req.body;

      // Check ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Validate inputs
      if (display_name !== undefined && typeof display_name !== 'string') {
        res.status(400).json({ error: 'Display name must be a string' });
        return;
      }

      if (bio !== undefined && typeof bio !== 'string') {
        res.status(400).json({ error: 'Bio must be a string' });
        return;
      }

      // Update profile
      const updatedProfile = profileModel.updateProfile(profileId, {
        display_name: display_name || profile.display_name,
        bio: bio || profile.bio,
      });

      if (!updatedProfile) {
        res.status(500).json({ error: 'Failed to update profile' });
        return;
      }

      res.json({
        message: 'Profile updated successfully',
        profile: stripSensitiveData(updatedProfile),
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  /**
   * DELETE /api/profiles/:id
   * Delete profile with cascade cleanup
   */
  router.delete('/:id', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const profileId = req.params.id;

      // Check ownership
      const profile = profileModel.getById(profileId);
      if (!profile) {
        res.status(404).json({ error: 'Profile not found' });
        return;
      }

      if (profile.user_id !== userId) {
        res.status(403).json({ error: 'Access denied' });
        return;
      }

      // Delete profile (cascade cleanup handled by database)
      const deleted = profileModel.deleteProfile(profileId);

      if (!deleted) {
        res.status(500).json({ error: 'Failed to delete profile' });
        return;
      }

      res.json({ message: 'Profile deleted successfully' });
    } catch (error) {
      console.error('Delete profile error:', error);
      res.status(500).json({ error: 'Failed to delete profile' });
    }
  });

  return router;
}
