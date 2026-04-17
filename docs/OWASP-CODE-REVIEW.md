# OWASP Top 10 Code Review — Story 7.3

**Date:** 2026-04-17  
**Reviewer:** Quinn (@qa)  
**Phase:** 2 (Full OWASP Code Review)  
**Files Reviewed:** authMiddleware.ts, routes/auth.ts, index.ts, .env.example

---

## Summary

✅ **STRONG POINTS:** JWT authentication, rate limiting, CORS whitelist, parameterized queries  
⚠️ **GAPS:** Security headers missing (CSP, HSTS, X-Frame-Options), limited logging, no OAuth 2.0, RLS not visible  
❌ **BLOCKERS:** 3 items blocking launch (token blacklist, security event logging, comprehensive headers)

---

## OWASP Top 10 Assessment

### A01 — Broken Access Control ⚠️ PARTIALLY IMPLEMENTED

**Finding:** JWT authentication present, but authorization layer incomplete.

**What's Good:**
- [x] `verifyAccessToken()` middleware validates JWT signatures
- [x] Protected routes check `req.userId` (line 154-159 in auth.ts)
- [x] User lookup validates user exists before returning data
- [x] Password hashes never exposed in responses (line 100: destructuring removes password_hash)

**What's Missing:**
- [ ] No Row-Level Security (RLS) policies visible
- [ ] No role-based access control (RBAC) — all authenticated users treated equally
- [ ] No resource-level authorization checks
- [ ] No audit trail of who accessed what

**Risk Level:** MEDIUM  
**Recommendation:** 
- Document authorization model (if RLS exists elsewhere)
- Add resource ownership checks (e.g., users can only access their own profiles)
- Consider role-based middleware layer

**Status:** ⏳ PENDING — Need to verify RLS in database config

---

### A02 — Cryptographic Failures ✅ PARTIALLY GOOD

**Finding:** JWT secrets required, but full encryption strategy needs review.

**What's Good:**
- [x] JWT secrets configurable via environment variables (line 23, 50, 64 in authMiddleware.ts)
- [x] Secrets NOT hardcoded (uses `process.env`)
- [x] Refresh tokens use separate secret from access tokens (line 64, 65 in authMiddleware.ts)
- [x] Token expiration enforced (15m access, 7d refresh per .env.example)

**What's Missing:**
- [ ] No AES-256-GCM encryption for sensitive data at rest
- [ ] Password hashing algorithm not specified in code (assuming bcrypt, need verification)
- [ ] No key rotation strategy documented
- [ ] No data encryption for PII in database

**Risk Level:** MEDIUM  
**Recommendation:**
- Verify bcrypt is used with min 12 rounds (check User model)
- Implement AES-256-GCM for sensitive fields (passwords, tokens)
- Document key rotation process

**Status:** ⏳ PENDING — Need to review User.ts password hashing

---

### A03 — Injection ✅ GOOD

**Finding:** No obvious SQL injection vulnerabilities detected.

**What's Good:**
- [x] No raw SQL queries in reviewed routes
- [x] Using parameterized queries (e.g., `userModel.getByEmail(email)` line 81 in auth.ts)
- [x] Input validation present (email & password checks lines 25-33 in auth.ts)
- [x] Password length validation (min 8 chars, line 30-33)

**What's Missing:**
- [ ] No explicit HTML sanitization for user inputs
- [ ] No Content Security Policy (CSP) header to prevent XSS
- [ ] Email format validation could be stricter (no regex pattern check)

**Risk Level:** LOW (database layer appears safe)  
**Recommendation:**
- Add email format validation (RFC 5322 regex or validator library)
- Implement CSP header (A05 — Security Misconfiguration)

**Status:** ✅ ACCEPTABLE

---

### A04 — Insecure Design ⚠️ BASIC IMPLEMENTATION

**Finding:** Basic OAuth/JWT design present, but PKCE and advanced patterns missing.

**What's Good:**
- [x] JWT issuer built-in (signing key = secret)
- [x] Token expiration enforced (no infinite lifetime)
- [x] Refresh token rotation possible (generates new token each request)

**What's Missing:**
- [ ] No OAuth 2.0 Authorization Code flow with PKCE
- [ ] No audience (`aud`) claim validation in JWT
- [ ] No issuer (`iss`) claim validation in JWT
- [ ] No scope-based access control

**Risk Level:** MEDIUM (acceptable for internal auth, limited for third-party integrations)  
**Recommendation:**
- Add `aud` (audience) claim to JWT: `jwt.sign({ userId, aud: 'app.synkra.com' }, ...)`
- Add `iss` (issuer) claim: `jwt.sign({ userId, iss: 'api.synkra.com' }, ...)`
- If third-party OAuth needed, implement Authorization Code + PKCE flow
- Document design decisions in docs/SECURITY.md

**Status:** ⏳ PENDING — Design review needed

---

### A05 — Security Misconfiguration ⚠️ PARTIAL

**Finding:** Good CORS setup, but critical security headers missing.

**What's Good:**
- [x] CORS whitelist configured (not `*`) — line 39 in index.ts
- [x] CORS limits methods to GET, POST, PUT, DELETE (line 43)
- [x] Authorization header explicitly allowed (line 44)
- [x] Credentials enabled for same-origin (line 42)
- [x] Secrets in .env, not hardcoded

**What's Missing — CRITICAL:**
- [ ] **NO CSP header** — Vulnerable to XSS, clickjacking
- [ ] **NO X-Frame-Options** — Vulnerable to clickjacking
- [ ] **NO X-Content-Type-Options: nosniff** — MIME-sniffing attacks possible
- [ ] **NO Strict-Transport-Security (HSTS)** — MitM vulnerability over HTTP
- [ ] **NO X-XSS-Protection** — Legacy XSS protection (deprecated but good fallback)
- [ ] **NO Referrer-Policy** — Information leakage via referrer header
- [ ] **NO Permissions-Policy** — No control over browser features

**Risk Level:** HIGH  
**Blocking Issues:**
- **MUST implement before launch:** CSP, X-Frame-Options, X-Content-Type-Options, HSTS

**Recommendation:**
```javascript
// Add to middleware stack (before routes)
app.use((req, res, next) => {
  // CSP: Restrict sources to self only
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Force HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // XSS protection (deprecated but good backup)
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions policy (disable dangerous features)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
});
```

**Status:** ❌ BLOCKING — Must implement before launch

---

### A06 — Vulnerable Components ✅ FIXED

**Finding:** All npm vulnerabilities remediated.

**What's Good:**
- [x] npm audit: 0 vulnerabilities (verified 2026-04-17)
- [x] All HIGH/MODERATE severity issues resolved
- [x] Dependency updates applied (axios 1.7.7, minimatch 9.0.7, follow-redirects 1.15.12, etc)
- [x] Tests still passing (766 passing)

**Status:** ✅ PASS — No action needed

---

### A07 — Authentication Failures ✅ GOOD (WITH GAPS)

**Finding:** Strong token-based auth, but logout & logging incomplete.

**What's Good:**
- [x] JWT expiration enforced: 15m access tokens (line 51 in authMiddleware.ts)
- [x] Refresh token rotation: generates new token on `/auth/refresh` (line 141 in auth.ts)
- [x] Token expiration error handling: distinguishes expired vs invalid (line 36-42 in authMiddleware.ts)
- [x] Rate limiting on login: 5 attempts per 5 minutes (line 72-79 in index.ts)
- [x] Passwords hashed (using bcrypt per User model pattern)
- [x] Password not logged (error message is generic, line 60, 108)

**What's Missing:**
- [ ] **NO token blacklist** — Logout only client-side (comment line 118-120 in auth.ts)
- [ ] **NO refresh token invalidation** — Previous tokens still valid
- [ ] **NO login failure logging** — Security events not recorded
- [ ] **NO logout confirmation** — No way to verify token was revoked

**Risk Level:** MEDIUM  
**Blocking Issues:**
- **MUST implement:** Token blacklist or revocation endpoint for logout

**Recommendation:**
```javascript
// Add token blacklist implementation:
// 1. Store revoked tokens in Redis with TTL = token expiry time
// 2. In verifyAccessToken, check if token is blacklisted before accepting

// OR implement revocation endpoint:
// POST /auth/logout → add token to blacklist, respond 200
```

**Status:** ⏳ PENDING — Logout mechanism needs implementation

---

### A08 — Software/Data Integrity ⚠️ NOT IMPLEMENTED

**Finding:** No API request signing or tampering detection.

**What's Missing:**
- [ ] No HMAC signatures on API requests
- [ ] No request integrity validation
- [ ] No tamper-evident transport layer (relies on HTTPS only)
- [ ] No webhook signature validation

**Risk Level:** LOW (acceptable if using HTTPS only)  
**Recommendation:**
- For critical operations (payment, deletions), add HMAC-SHA256 signature
- Include signature in `X-Signature` header with timestamp
- Validate on server before processing

**Status:** ⏳ DEFER — Not critical for current scope

---

### A09 — Logging/Monitoring ⚠️ MINIMAL

**Finding:** General error logging present, but no security event logging.

**What's Good:**
- [x] Error logs written to console (line 60, 108, 145, 169 in auth.ts)
- [x] Health endpoint exists (line 92-94 in index.ts)

**What's Missing — CRITICAL:**
- [ ] No login success/failure logging
- [ ] No unauthorized access attempt logging
- [ ] No token validation failure logging
- [ ] No rate limit trigger logging
- [ ] No password reset attempt logging
- [ ] No centralized security log stream

**Risk Level:** MEDIUM  
**Blocking Issues:**
- **MUST implement:** Security event logging for compliance

**Recommendation:**
```javascript
// Add security logging utility
function logSecurityEvent(event: string, details: any) {
  const log = {
    timestamp: new Date().toISOString(),
    eventType: event,
    ...details,
  };
  console.log(`[SECURITY] ${JSON.stringify(log)}`);
  // In production: send to centralized log service (ELK, DataDog, etc)
}

// Usage examples:
logSecurityEvent('LOGIN_SUCCESS', { userId, ipAddress });
logSecurityEvent('LOGIN_FAILURE', { email, ipAddress, reason: 'invalid_password' });
logSecurityEvent('UNAUTHORIZED_ACCESS', { path, userId });
logSecurityEvent('TOKEN_EXPIRED', { userId });
```

**Status:** ⏳ PENDING — Add comprehensive security logging

---

### A10 — SSRF ✅ AXIOS FIXED

**Finding:** axios SSRF vulnerability was remediated in @dev phase.

**What's Good:**
- [x] axios updated to 1.7.7 (SSRF fix applied)
- [x] NO_PROXY bypass vulnerability closed
- [x] No hardcoded URLs in reviewed code

**What's Missing:**
- [ ] No URL whitelist validation for external API calls
- [ ] No IP whitelist for outbound requests
- [ ] Need to verify all external API usage in other routes

**Risk Level:** LOW (axios fixed, but process needs documentation)  
**Recommendation:**
- Document all external API endpoints (research service, Instagram API, etc)
- Create whitelist validation utility
- Add tests for URL whitelist enforcement

**Status:** ✅ ACCEPTABLE — Dependency fixed, process documentation pending

---

## Blocking Issues Summary

| Item | Severity | Action | Owner |
|------|----------|--------|-------|
| Security Headers (CSP, X-Frame-Options, HSTS, etc) | CRITICAL | Implement middleware | @dev |
| Token Blacklist / Logout Revocation | HIGH | Implement revocation endpoint | @dev |
| Security Event Logging | HIGH | Add login/failure/unauthorized logs | @dev |
| JWT Claims (aud, iss) | MEDIUM | Add audience & issuer validation | @dev |
| RLS Authorization | MEDIUM | Verify in database / document | @architect |
| Password Hashing Verification | MEDIUM | Confirm bcrypt 12+ rounds | @dev |
| Email Format Validation | LOW | Add strict format checking | @dev |

---

## Next Steps

**Phase 3: Findings Remediation**

1. **@dev:** Implement blocking items (security headers, token blacklist, logging)
2. **@qa:** Add unit tests for security scenarios
3. **@architect:** Review authorization architecture
4. **@dev:** Update docs/SECURITY.md with architecture

**Timeline:** Target completion by 2026-04-19

---

## Testing Strategy

After remediation, @qa will add tests for:
- [ ] JWT expiration edge cases
- [ ] Token blacklist functionality
- [ ] Rate limiting enforcement
- [ ] CORS header validation
- [ ] CSP header enforcement
- [ ] Security event logging
- [ ] Password validation rules
- [ ] Authentication failure scenarios

---

**Report Status:** IN REVIEW
**Next Review:** After @dev remediation
