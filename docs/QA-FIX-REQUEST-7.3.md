# QA Fix Request — Story 7.3

**From:** Quinn (@qa)  
**To:** Dex (@dev)  
**Story:** 7.3 (Security Audit & Remediation)  
**Date:** 2026-04-17  
**Priority:** BLOCKING (Must complete before QA can proceed to Phase 2)

---

## Summary

OWASP A06 scan detected **12 vulnerabilities** in npm dependencies:
- **6 HIGH severity** — Blocking story completion
- **6 MODERATE severity** — Must remediate

All findings are in dependency chain, not application code. Remediation path is straightforward via `npm audit fix`.

---

## Issues to Fix

### 1. minimatch ReDoS Vulnerabilities (HIGH) ⚠️ 

**Severity:** HIGH  
**CVEs:** GHSA-3ppc-4f35-3m26 | GHSA-7r86-cg39-jmmj | GHSA-23c5-xmqv-rm74  
**Package:** minimatch 9.0.0-9.0.6  
**Issue:** Regular expression denial of service (ReDoS) via catastrophic backtracking

**What needs fixing:**
- Pattern matching in minimatch can hang server with crafted input
- Used indirectly via @typescript-eslint toolchain
- Requires breaking change to @typescript-eslint/parser

**Remediation:**
```bash
npm audit fix --force
# This will update @typescript-eslint/parser to 8.58.2+
# Run tests to verify no breaking changes
npm test
npm run lint
npm run typecheck
```

**Risk if not fixed:** Denial of service attacks possible

---

### 2. esbuild Development Server SSRF (HIGH) ⚠️ 

**Severity:** HIGH  
**CVE:** GHSA-67mh-4wv8-2f99  
**Package:** esbuild (via vite)  
**Issue:** Development server allows arbitrary requests from websites

**What needs fixing:**
- Any website can send HTTP requests to your dev server on `localhost:*`
- Responses are returned to the website
- Sensitive dev server data could be exfiltrated

**Remediation:**
```bash
npm audit fix --force
# May require vite update
npm test
```

**Risk if not fixed:** Sensitive local data exposure during development

---

### 3. axios SSRF & Cloud Metadata Exfiltration (MODERATE) ⚠️ 

**Severity:** MODERATE  
**CVEs:** GHSA-3p68-rc4w-qgx5 | GHSA-fvcv-3m26-pcqx  
**Package:** axios 1.0.0-1.14.0  
**Issue:** NO_PROXY bypass + AWS/GCP credential theft

**What needs fixing:**
- `NO_PROXY` environment variable can be bypassed
- Cloud metadata service (AWS/GCP) credentials could be stolen
- Potential impact: full cloud account compromise

**Remediation:**
```bash
npm audit fix
# Stable update available (no breaking changes expected)
npm test
```

**Risk if not fixed:** Credential theft in cloud deployments

---

### 4. follow-redirects Header Leakage (MODERATE) ⚠️ 

**Severity:** MODERATE  
**CVE:** GHSA-r4q5-vmmm-2653  
**Package:** follow-redirects  
**Issue:** Custom auth headers leaked to cross-domain redirects

**What needs fixing:**
- When HTTP redirect happens to different domain
- Authorization headers are sent to the new domain
- Attackers could redirect legitimate requests to capture tokens

**Remediation:**
```bash
npm audit fix
# Stable update available
npm test
```

**Risk if not fixed:** Authentication tokens exposed via redirect attacks

---

## Verification Checklist

After running `npm audit fix` and `npm audit fix --force`, verify:

- [ ] `npm audit` shows 0 vulnerabilities
- [ ] `npm test` passes (all tests green)
- [ ] `npm run lint` passes (no ESLint errors)
- [ ] `npm run typecheck` passes (no TypeScript errors)
- [ ] Application starts: `npm run dev`
- [ ] No console errors in browser/terminal during development

---

## Testing Notes

**Important:** The breaking change to @typescript-eslint/parser may affect linting. If tests fail:

1. Check TypeScript compilation errors first
2. Review any ESLint rule changes
3. Update `.eslintrc.json` if needed
4. Verify that security-related linting rules still work

---

## Definition of Done

✅ This fix request is complete when:
1. All `npm audit` vulnerabilities are resolved (0 high/critical/moderate)
2. All tests pass
3. Lint and typecheck pass
4. Development server starts without errors

---

## Next Phase

Once @dev completes these fixes and notifies @qa:

**@qa will:**
1. Re-run npm audit to verify 0 vulnerabilities
2. Begin Phase 2: Full OWASP Top 10 code review
3. Add security tests for each vulnerability type
4. Continue with remaining acceptance criteria

---

**Awaiting @dev action.** Please confirm when fixes are complete.
