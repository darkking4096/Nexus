import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  token?: string;
  file?: Express.Multer.File;
}

/**
 * Verify JWT access token in Authorization header
 * Expected format: Authorization: Bearer <token>
 */
export function verifyAccessToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7); // Remove "Bearer " prefix
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    res.status(500).json({ error: 'JWT_ACCESS_SECRET not configured' });
    return;
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string; iat: number; exp: number };
    req.userId = decoded.userId;
    req.token = token;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
    } else {
      res.status(500).json({ error: 'Token verification failed' });
    }
  }
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(userId: string): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';

  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET not configured');
  }

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(userId: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  return jwt.sign({ userId }, secret, { expiresIn } as jwt.SignOptions);
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): string {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded.userId;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}
