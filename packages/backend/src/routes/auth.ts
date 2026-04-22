import { Router, Request, Response, RequestHandler } from 'express';
import type { DatabaseAdapter } from '../config/database';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  AuthRequest,
} from '../middleware/authMiddleware';
import { blacklistToken } from '../services/tokenBlacklist.service';
import { createSecurityLogger } from '../services/securityLogger.service';

export function createAuthRoutes(db: DatabaseAdapter, loginLimiter?: RequestHandler): Router {
  const router = Router();
  const userModel = new User(db);

  /**
   * POST /auth/signup
   * Create new user account
   */
  router.post('/signup', async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;
      const logger = createSecurityLogger(req);

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
      }

      if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
      }

      // Check if email exists
      if (userModel.emailExists(email)) {
        logger.logLoginFailure(email, 'email_already_registered');
        res.status(409).json({ error: 'Email already registered' });
        return;
      }

      // Create user
      const user = await userModel.create({
        email,
        password,
        name: name || undefined,
      });

      // Generate tokens
      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      // Log successful signup
      logger.logSignupSuccess(user.id, user.email);

      res.status(201).json({
        userId: user.id,
        email: user.email,
        name: user.name,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  /**
   * POST /auth/login
   * Authenticate user with email and password
   * Rate limited: max 5 attempts per 5 minutes per IP (security)
   */
  router.post('/login', loginLimiter || ((_req, _res, next) => next()), async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const logger = createSecurityLogger(req);

      // Validation
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password required' });
        return;
      }

      // Get user by email
      const userWithHash = userModel.getByEmail(email);
      if (!userWithHash) {
        logger.logLoginFailure(email, 'user_not_found');
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Verify password
      const passwordValid = await User.verifyPassword(password, userWithHash.password_hash);
      if (!passwordValid) {
        logger.logLoginFailure(email, 'invalid_password');
        res.status(401).json({ error: 'Invalid email or password' });
        return;
      }

      // Generate tokens
      const accessToken = generateAccessToken(userWithHash.id);
      const refreshToken = generateRefreshToken(userWithHash.id);

      // Log successful login
      logger.logLoginSuccess(userWithHash.id, userWithHash.email);

      // Return user data (without password hash)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash: _passwordHash, ...userData } = userWithHash;

      res.json({
        ...userData,
        accessToken,
        refreshToken,
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  /**
   * POST /auth/logout
   * Logout user (revoke token via blacklist)
   */
  router.post('/logout', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const token = req.token;
      const logger = createSecurityLogger(req);

      if (token) {
        // Get token expiry from JWT claims
        const decoded = jwt.decode(token) as { exp?: number } | null;
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

          // Add to blacklist with TTL = time until natural expiry
          if (expiresIn > 0) {
            await blacklistToken(token, expiresIn);
          }
        }
      }

      if (req.userId) {
        logger.logLogout(req.userId);
      }

      res.json({ message: 'Logout successful — token revoked' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: 'Logout failed' });
    }
  });

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   */
  router.post('/refresh', (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const logger = createSecurityLogger(req);

      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token required' });
        return;
      }

      // Verify refresh token
      const userId = verifyRefreshToken(refreshToken);

      // Generate new access token
      const newAccessToken = generateAccessToken(userId);

      // Log token refresh
      logger.logTokenRefresh(userId);

      res.json({ accessToken: newAccessToken });
    } catch (error) {
      console.error('Refresh error:', error);
      res.status(401).json({ error: 'Invalid refresh token' });
    }
  });

  /**
   * GET /auth/me
   * Get current user info (protected route)
   */
  router.get('/me', verifyAccessToken, (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const user = userModel.getById(req.userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  });

  return router;
}
