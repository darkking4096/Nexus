# QA Fix Request — Story 7.3 Phase 2

**From:** Quinn (@qa)  
**To:** Dex (@dev)  
**Story:** 7.3 (Security Audit & Remediation) — Phase 2  
**Date:** 2026-04-17  
**Priority:** BLOCKING (Critical for launch)  
**Review Report:** docs/OWASP-CODE-REVIEW.md

---

## Summary

Phase 1 (dependency audit) is complete. Phase 2 code review found **3 blocking issues** preventing gate pass:

1. **Security Headers Missing (CRITICAL)** — OWASP A05
2. **Token Blacklist / Logout Revocation (HIGH)** — OWASP A07
3. **Security Event Logging (HIGH)** — OWASP A09

All issues are code-level, not configuration. Estimated effort: ~2-3 hours.

---

## Issue 1: Security Headers (CRITICAL) 🚨

**File:** packages/backend/src/index.ts  
**Severity:** CRITICAL — Blocks launch  
**OWASP:** A05 (Security Misconfiguration)

### Current State
Missing HTTP security headers that prevent:
- XSS attacks (no CSP)
- Clickjacking (no X-Frame-Options)
- MIME-sniffing attacks (no X-Content-Type-Options)
- Man-in-the-middle attacks (no HSTS)

### What Needs Fixing

Add security header middleware to index.ts (before routes). Insert after line 59 (compression middleware):

```typescript
// Security Headers Middleware
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Content Security Policy: Restrict script/style sources to self + necessary CDNs
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:"
  );

  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Force HTTPS (HSTS: 1 year including subdomains)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // XSS protection (deprecated but good fallback for older browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer behavior
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Disable dangerous browser features
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()'
  );

  next();
});
```

### Testing

After implementation, verify:
- [ ] `curl -I http://localhost:5000/health` includes all headers
- [ ] CSP blocks inline scripts (open DevTools console, no warnings about CSP)
- [ ] HSTS header present: `Strict-Transport-Security: max-age=31536000`
- [ ] X-Frame-Options: `DENY`
- [ ] X-Content-Type-Options: `nosniff`

---

## Issue 2: Token Blacklist / Logout Revocation (HIGH) 🔐

**File:** packages/backend/src/routes/auth.ts + new service  
**Severity:** HIGH — Logout doesn't actually revoke tokens  
**OWASP:** A07 (Authentication Failures)

### Current State
- POST /auth/logout returns 200 but does nothing
- Tokens remain valid forever (until expiry)
- Users can continue using old tokens after logout
- **Security Risk:** Account takeover if token is compromised

### What Needs Fixing

**Option A: Redis-based Token Blacklist (Recommended)**

1. Create new service: `packages/backend/src/services/tokenBlacklist.service.ts`

```typescript
import redis from 'redis';

let redisClient: redis.RedisClient;

export function initializeTokenBlacklist(host: string, port: number) {
  redisClient = redis.createClient({ host, port });
  redisClient.on('error', (err) => console.error('Redis error:', err));
  return redisClient;
}

export async function blacklistToken(token: string, expiresInSeconds: number): Promise<void> {
  if (!redisClient) {
    throw new Error('Token blacklist not initialized');
  }
  
  // Store token with TTL = token expiry time
  // When token expires naturally, Redis auto-deletes it
  return new Promise((resolve, reject) => {
    redisClient.setex(`blacklist:${token}`, expiresInSeconds, '1', (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function isTokenBlacklisted(token: string): Promise<boolean> {
  if (!redisClient) return false;
  
  return new Promise((resolve, reject) => {
    redisClient.exists(`blacklist:${token}`, (err, reply) => {
      if (err) reject(err);
      else resolve(reply === 1);
    });
  });
}
```

2. Update middleware: `packages/backend/src/middleware/authMiddleware.ts`

In `verifyAccessToken()` function, after line 30 (jwt.verify), add:

```typescript
// Check if token is blacklisted (logged out)
const isBlacklisted = await isTokenBlacklisted(token);
if (isBlacklisted) {
  res.status(401).json({ error: 'Token has been revoked' });
  return;
}
```

3. Update logout route: `packages/backend/src/routes/auth.ts` (line 117-122)

```typescript
router.post('/logout', async (req: AuthRequest, res: Response) => {
  try {
    const token = req.token;
    
    if (token) {
      // Get token expiry from JWT claims
      const decoded = jwt.decode(token) as any;
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      
      // Add to blacklist with TTL = time until natural expiry
      await blacklistToken(token, expiresIn);
    }
    
    res.json({ message: 'Logout successful — token revoked' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});
```

### Testing

After implementation, verify:
- [ ] User logs in, gets token
- [ ] POST /auth/logout succeeds
- [ ] Using old token on protected route returns 401 "Token has been revoked"
- [ ] Token is removed from Redis after expiry time
- [ ] Multiple simultaneous logouts don't cause errors

---

## Issue 3: Security Event Logging (HIGH) 📊

**File:** New service + updates to routes/auth.ts  
**Severity:** HIGH — No audit trail for compliance  
**OWASP:** A09 (Logging/Monitoring)

### Current State
- Error logs written to console only
- No tracking of login attempts, failures, unauthorized access
- No audit trail for compliance (e.g., GDPR/HIPAA audit requirements)

### What Needs Fixing

1. Create logging service: `packages/backend/src/services/securityLogger.service.ts`

```typescript
export interface SecurityEvent {
  timestamp: string;
  eventType: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'UNAUTHORIZED_ACCESS' | 
            'TOKEN_EXPIRED' | 'TOKEN_REFRESH' | 'RATE_LIMIT_HIT' | 'SIGNUP_SUCCESS';
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

export function logSecurityEvent(event: SecurityEvent): void {
  const log = {
    timestamp: event.timestamp,
    eventType: event.eventType,
    userId: event.userId || '-',
    email: event.email || '-',
    ipAddress: event.ipAddress || '-',
    details: event.details || {},
  };
  
  // Log to console (development)
  console.log(`[SECURITY] ${JSON.stringify(log)}`);
  
  // In production, send to centralized logging:
  // await cloudLogger.log(log);  // DataDog, Splunk, ELK, etc.
}

function getClientIp(req: express.Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.socket.remoteAddress || 
         '-';
}

function getUserAgent(req: express.Request): string {
  return req.headers['user-agent'] || '-';
}

export function createSecurityLogger(req: express.Request) {
  const ipAddress = getClientIp(req);
  const userAgent = getUserAgent(req);
  
  return {
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
    
    logUnauthorizedAccess: (userId: string | undefined, path: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'UNAUTHORIZED_ACCESS',
        userId,
        ipAddress,
        userAgent,
        details: { path },
      });
    },
    
    logLogout: (userId: string) => {
      logSecurityEvent({
        timestamp: new Date().toISOString(),
        eventType: 'LOGOUT',
        userId,
        ipAddress,
        userAgent,
      });
    },
  };
}
```

2. Update auth routes to log events:

In `routes/auth.ts` login endpoint (after line 80):

```typescript
const logger = createSecurityLogger(req);

// After password verification fails:
logger.logLoginFailure(email, 'invalid_password');

// After successful login (line 95):
logger.logLoginSuccess(userWithHash.id, userWithHash.email);
```

In `routes/auth.ts` logout endpoint:

```typescript
const logger = createSecurityLogger(req);
logger.logLogout(req.userId || '-');
```

### Testing

After implementation, verify:
- [ ] Login success: `[SECURITY] {"eventType":"LOGIN_SUCCESS","email":"user@example.com",...}`
- [ ] Login failure: `[SECURITY] {"eventType":"LOGIN_FAILURE","email":"user@example.com",...}`
- [ ] Logout: `[SECURITY] {"eventType":"LOGOUT","userId":"123",...}`
- [ ] Each event includes timestamp, IP address, user agent
- [ ] Events are logged to both console and (in production) centralized log service

---

## Additional Medium-Priority Items

**Not blocking, but recommended:**

### JWT Claims Enhancement (A04 — Insecure Design)
Add `aud` (audience) and `iss` (issuer) claims to JWT tokens:

```typescript
// In authMiddleware.ts generateAccessToken():
return jwt.sign(
  { 
    userId,
    aud: 'app.synkra.com',  // Add audience
    iss: 'api.synkra.com',  // Add issuer
  },
  secret,
  { expiresIn }
);

// In verifyAccessToken():
const decoded = jwt.verify(token, secret, {
  audience: 'app.synkra.com',  // Validate audience
  issuer: 'api.synkra.com',    // Validate issuer
}) as { userId: string; aud: string; iss: string };
```

### Password Hashing Verification
Confirm `User.ts` uses bcrypt with 12+ rounds:

```typescript
// User.ts should have:
const saltRounds = 12; // or higher
const passwordHash = await bcrypt.hash(password, saltRounds);
```

---

## Verification Checklist

After implementing all fixes, verify:

**Security Headers:**
- [ ] CSP header present and valid
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] HSTS header present

**Token Blacklist:**
- [ ] Logout revokes token immediately
- [ ] Blacklisted tokens rejected with 401
- [ ] Redis working correctly

**Security Logging:**
- [ ] Login success logged
- [ ] Login failures logged with reason
- [ ] Unauthorized access logged
- [ ] All events include timestamp, IP, user agent

**Tests:**
- [ ] `npm test` passes (766+ passing)
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] No new security warnings from CodeRabbit

---

## Definition of Done

✅ This fix request is complete when:
1. Security headers middleware implemented and tested
2. Token blacklist/logout revocation working
3. Security event logging comprehensive (5+ event types)
4. All tests passing
5. Lint and typecheck passing
6. No security warnings from CodeRabbit

---

## Timeline

**Estimated effort:** 2-3 hours  
**Target completion:** 2026-04-18  
**Priority:** CRITICAL (blocks launch)

---

**Awaiting @dev action.** Please confirm when ready to begin.
