import { Router, Response, RequestHandler } from 'express';
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

  return router;
}
