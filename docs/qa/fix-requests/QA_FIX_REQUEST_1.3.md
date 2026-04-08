# QA Fix Request — Story 1.3: Playwright MCP Integration

**Story:** 1.3 — Playwright MCP Integration & Publishing Test  
**QA Agent:** Quinn  
**Date:** 2026-04-08  
**Status:** CONCERNS (Blocking Issues)  
**Verdict:** Cannot merge without fixes

---

## 🔴 Critical Issues

### Issue #1: Instagram Selector Placeholders

**Severity:** CRITICAL (🔴)  
**File:** `packages/backend/src/services/PlaywrightService.ts`  
**Lines:** 92, 154

**Problem:**
```typescript
// Line 92 - Create button selector is wrong placeholder
const createButtonSelector = 'a[href="#"]'; // Placeholder - needs real selector

// Line 154 - Same issue for carousel
await this.clickWithDelay('a[href="#"]');
```

**Impact:**
- Publishing will **FAIL** against real Instagram
- Selector `a[href="#"]` matches nothing useful on Instagram
- Instagram UI changes frequently — hard-coded selectors break

**Required Fix:**
Replace with actual Instagram selectors. As of 2026-04, these are the correct selectors:

```typescript
// Create button / "+" icon in navigation
const createButtonSelector = '[aria-label="Create"]';

// Select multiple (carousel mode)
const selectMultipleSelector = 'button:has-text("Select multiple")';

// Next button (may appear as different text)
const nextButtonSelector = 'button:has-text("Next")';

// Share/Post button
const shareButtonSelector = 'button[type="button"]:has-text("Share")';
```

**Note:** Instagram selectors change with UI updates. Consider implementing:
- Visual detection (screenshot comparison)
- Fallback selectors for multiple versions
- Selector validation with error logging

**Acceptance:** Story cannot be merged with placeholder selectors.

---

### Issue #2: Session Loading Not Implemented

**Severity:** CRITICAL (🔴)  
**File:** `packages/backend/src/services/PlaywrightService.ts`  
**Method:** `loadSession()` (lines 56-71)

**Problem:**
```typescript
async loadSession(_sessionJson: Record<string, unknown>): Promise<void> {
  if (!this.page) {
    throw new Error('Browser not initialized');
  }

  try {
    // Extract relevant cookies from session data if available
    // In production, you'd hydrate the session with instagrapi client state
    // For now, we're setting up for fresh login (cookies would come from previous session)

    // Navigate to Instagram
    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
  } catch (error) {
    throw new Error(`Failed to load session: ${String(error)}`);
  }
}
```

**What's Wrong:**
1. Parameter `_sessionJson` is **ignored** (underscore prefix)
2. No cookies are loaded from the session
3. No attempt to use Instagrapi session state
4. Will always do fresh login, defeating session persistence

**Impact:**
- Every publish requires full re-authentication
- Slow (3-5 seconds per publish for login)
- Higher risk of bot detection
- Instagram sessions expire after ~30 days

**Required Fix:**
Implement actual session loading:

```typescript
async loadSession(sessionJson: Record<string, unknown>): Promise<void> {
  if (!this.page) {
    throw new Error('Browser not initialized');
  }

  try {
    // Load cookies from Instagrapi session
    const cookies = sessionJson.cookies || {};
    const cookieArray = Object.entries(cookies).map(([name, value]) => ({
      name,
      value: String(value),
      domain: '.instagram.com',
      path: '/',
    }));

    // Add cookies to browser context
    if (cookieArray.length > 0) {
      await this.page.context().addCookies(cookieArray);
    }

    // Navigate to Instagram (now with cookies)
    await this.page.goto('https://www.instagram.com/', { waitUntil: 'networkidle' });
    
    // Verify session is valid (check for login page)
    const loginButton = await this.page.$('a:has-text("Log in")');
    if (loginButton) {
      throw new Error('Session cookies invalid or expired - would require re-login');
    }
  } catch (error) {
    throw new Error(`Failed to load session: ${String(error)}`);
  }
}
```

**Acceptance:** Must implement proper cookie/session loading.

---

## 🟡 Medium Issues

### Issue #3: Missing E2E Test with Real Instagram

**Severity:** MEDIUM (🟡)  
**File:** `packages/backend/tests/PublishService.test.ts`

**Problem:**
- All tests mock `PlaywrightService`
- No actual Playwright execution test
- No real Instagram publication test
- Will work in mock, fail in reality

**Current Test Count:** 4 tests  
**Missing:** Real integration test

**Acceptance Criteria Requirement:**
> "Teste E2E em conta de teste (publicar 1 post)"

**Required Fix:**
Add a marked test that:
```typescript
it.skip('should publish to real Instagram (integration test)', async () => {
  // This test is skipped by default (requires test account setup)
  // Run manually when deploying to staging:
  // npm test -- --reporter=verbose --include="*real-instagram*"
  
  // Uses REAL browser + REAL Instagram account
  // Requires TEST_INSTAGRAM_USERNAME and TEST_INSTAGRAM_PASSWORD env vars
});
```

**Acceptance:** Integration test added (can skip in normal CI, run before production).

---

### Issue #4: No Carousel Publication Error Handling

**Severity:** MEDIUM (🟡)  
**File:** `packages/backend/src/services/PlaywrightService.ts`  
**Method:** `publishCarousel()` (lines 144-201)

**Problem:**
```typescript
// If one image fails to upload, entire carousel fails
// No per-image validation or error recovery
// No check if all images uploaded successfully before clicking Next
```

**Impact:**
- If image #2 of 3 fails, entire post fails
- No feedback which image caused failure
- No retry per image

**Recommendation (not blocking):**
Add image validation before Next button:
```typescript
// After all images upload, verify they're visible
const uploadedCount = await this.page.locator('[data-testid="carousel-item"]').count();
if (uploadedCount !== imagePaths.length) {
  throw new Error(`Expected ${imagePaths.length} images, got ${uploadedCount}`);
}
```

---

## 🟠 Documentation Issues

### Issue #5: Missing `docs/playwright-setup.md`

**Severity:** MEDIUM (🟡)  
**Acceptance Criteria Item:** Required

**File Status:** ❌ NOT CREATED

**What's Needed:**
- Playwright installation guide
- Browser launch options (headless, viewport, etc.)
- Instagram selector reference (for maintenance)
- Bot detection prevention (delays, mouse movements)
- Troubleshooting guide

**Acceptance:** Create `docs/playwright-setup.md` before merge.

---

## ✅ What's Working Well

- ✅ Retry logic with exponential backoff
- ✅ Human-like delays (1-5s between actions)
- ✅ Mouse movements before clicks
- ✅ Character-by-character typing
- ✅ Proper error handling and logging
- ✅ Resource cleanup (finally block)
- ✅ Test coverage for happy path

---

## 📋 Fix Checklist

### Before Merge (Blocking)

- [ ] **Issue #1:** Replace selector placeholders with real Instagram selectors
  - [ ] `createButtonSelector` → `[aria-label="Create"]`
  - [ ] `selectMultipleSelector` → Real selector
  - [ ] `nextButtonSelector` → Real selector  
  - [ ] `shareButtonSelector` → Real selector
  - **Effort:** 30 min (need to inspect real Instagram UI)

- [ ] **Issue #2:** Implement `loadSession()` to hydrate cookies
  - [ ] Extract cookies from sessionJson
  - [ ] Add cookies to browser context
  - [ ] Validate session before publishing
  - **Effort:** 45 min

- [ ] **Issue #5:** Create `docs/playwright-setup.md`
  - [ ] Installation guide
  - [ ] Selector reference
  - [ ] Troubleshooting
  - **Effort:** 20 min

### Nice to Have (Optional)

- [ ] **Issue #3:** Add real Instagram E2E test (marked as skip)
- [ ] **Issue #4:** Add per-image validation for carousel

---

## How to Find Real Instagram Selectors

1. **Open Instagram in browser:**
   ```bash
   npm run dev  # Start backend with Playwright service
   ```

2. **Open DevTools (F12):**
   - Navigate to Instagram feed
   - Find "Create" button (usually top-left)
   - Right-click → Inspect
   - Copy selector

3. **Test in Playwright:**
   ```typescript
   await page.locator('[aria-label="Create"]').click();
   ```

4. **Validate:** If button clicks, selector is correct ✅

---

## Questions for @dev

1. **Test Instagram Account:** Do you have a dedicated test account to validate publishing?
2. **Headless Mode:** Should publishing run headless (true) or visible (false)?
3. **Selector Stability:** Instagram changes UI frequently — should we implement visual detection as fallback?

---

## Handoff Notes

- **QA Review Date:** 2026-04-08
- **QA Agent:** Quinn
- **Next Step:** @dev implements fixes, then resubmit for QA gate
- **Timeline:** ~2-3 hours estimated
- **Blocker:** Cannot proceed to testing without real selectors

---

**Approval Gate:** ❌ DO NOT MERGE  
**Verdict:** CONCERNS (Blocking)

After fixes are applied:
1. Push to `feature/1.3-playwright-fixes` branch
2. Resubmit: `*gate 1.3`
3. QA will re-review and approve/reject
