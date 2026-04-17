import { Request } from 'express';

export interface SecurityEvent {
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'UNAUTHORIZED_ACCESS' |
            'TOKEN_EXPIRED' | 'TOKEN_REFRESH' | 'RATE_LIMIT_HIT' | 'SIGNUP_SUCCESS';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, string | number | boolean>;
}

/**
 * Log security event to console and (in production) to centralized logging service
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const log = {
    timestamp: event.timestamp,
    eventType: event.eventType,
    userId: event.userId || '-',
    email: event.email || '-',
    ipAddress: event.ipAddress || '-',
    userAgent: event.userAgent || '-',
    details: event.details || {},
  };

  // Log to console (development)
  console.log(`[SECURITY] ${JSON.stringify(log)}`);

  // In production, send to centralized logging:
  // await cloudLogger.log(log);  // DataDog, Splunk, ELK, etc.
}

/**
 * Get client IP address from request (handles proxies)
 */
function getClientIp(req: Request): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor.split(',')[0];
    return ips.trim();
  }
  return req.socket.remoteAddress || '-';
}

/**
 * Get user agent from request
 */
function getUserAgent(req: Request): string {
  return req.headers['user-agent'] || '-';
}

/**
 * Create a security logger bound to a specific request
 * Provides methods to log different types of security events
 */
export function createSecurityLogger(req: Request) {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);

  return {
    /**
     * Log successful login
     */
    logLoginSuccess: (userId: string, email: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'LOGIN_SUCCESS',
        userId,
        email,
        ipAddress,
        userAgent,
      });
    },

    /**
     * Log failed login attempt
     */
    logLoginFailure: (email: string, reason: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'LOGIN_FAILURE',
        email,
        ipAddress,
        userAgent,
        details: { reason },
      });
    },

    /**
     * Log unauthorized access attempt
     */
    logUnauthorizedAccess: (userId: string | undefined, path: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'UNAUTHORIZED_ACCESS',
        userId: userId || undefined,
        ipAddress,
        userAgent,
        details: { path },
      });
    },

    /**
     * Log logout event
     */
    logLogout: (userId: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'LOGOUT',
        userId,
        ipAddress,
        userAgent,
      });
    },

    /**
     * Log successful signup
     */
    logSignupSuccess: (userId: string, email: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'SIGNUP_SUCCESS',
        userId,
        email,
        ipAddress,
        userAgent,
      });
    },

    /**
     * Log token refresh event
     */
    logTokenRefresh: (userId: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'TOKEN_REFRESH',
        userId,
        ipAddress,
        userAgent,
      });
    },

    /**
     * Log token expiration event
     */
    logTokenExpired: (userId: string | undefined) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'TOKEN_EXPIRED',
        userId: userId || undefined,
        ipAddress,
        userAgent,
      });
    },

    /**
     * Log rate limit hit
     */
    logRateLimitHit: (endpoint: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'RATE_LIMIT_HIT',
        ipAddress,
        userAgent,
        details: { endpoint },
      });
    },
  };
}
