# Story 7.1 — E2E Test Plan

**Owner:** @qa  
**Story:** 7.1  
**Date:** 2026-04-15  
**Status:** Test Design Complete  

---

## Executive Summary

5 critical user flows will be tested end-to-end using Playwright browser automation:

1. **Signup + Login** — User registration, email validation, authentication
2. **Instagram Profile Connection** — OAuth flow, permission grants, profile link
3. **Content Generation** — Manual content creation with preview validation
4. **Approval + Publish** — Workflow state transitions, approval decision, publication
5. **Metrics Verification** — Feed validation, metrics sync with Instagram API

**Success Criteria:**
- ✅ All 5 flows pass end-to-end
- ✅ >= 90% test pass rate (max 1 failure in 10 runs)
- ✅ Total execution time < 15 minutes
- ✅ Real Instagram test account used
- ✅ Staging environment @ `staging.synkra.com`
- ✅ HTML report with failure screenshots

---

## Test Infrastructure

### Test Environment
- **URL:** `staging.synkra.com` (local Docker fallback)
- **Database:** SQLite with automatic reset between test suites
- **Instagram Account:** `@synkra-e2e-test` (Business account, Graph API enabled)
- **Test Data:** Isolated transactions, automatic cleanup
- **Parallel Execution:** Sequential (avoid rate limiting)

### Dependencies
- **Playwright:** ^1.42.0 (already installed)
- **Vitest:** ^1.1.0 (already installed)
- **dotenv:** Test credentials in `.env.test` (gitignored)

### Credentials Management
```
.env.test (GITIGNORED):
TEST_USER_EMAIL=qa-tester-e2e@synkra.test
TEST_USER_PASSWORD=SecureTestPassword123!
INSTAGRAM_TEST_HANDLE=synkra-e2e-test
INSTAGRAM_TEST_PASSWORD=TestAcctPassword123!
INSTAGRAM_GRAPH_TOKEN=<generated during test>
INSTAGRAM_BUSINESS_ACCOUNT_ID=<from test account>
STAGING_URL=http://localhost:3000 (dev) or staging.synkra.com (prod)
```

---

## Test Scenarios (5 Critical Flows)

### Flow 1: Signup + Login (E2E-1)

**Objective:** Validate user registration, email verification, and authentication

**Preconditions:**
- Clean test account (no prior registration with TEST_USER_EMAIL)
- Staging frontend accessible
- Email service configured (or mocked)

**Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1.1 | Navigate to `/signup` | Signup form displayed |
| 1.2 | Enter email: `qa-tester-e2e@synkra.test` | Email field populated |
| 1.3 | Enter password: `SecureTestPassword123!` | Password masked |
| 1.4 | Click "Create Account" | Success message OR verify email modal |
| 1.5 | Check email verification link (mock or real) | Verification link valid |
| 1.6 | Verify email (click link or auto-verify in test env) | Account activated |
| 1.7 | Navigate to `/login` | Login form displayed |
| 1.8 | Enter credentials | Login success → Dashboard redirects |
| 1.9 | Validate dashboard loaded | User name visible, navigation menu present |

**Assertions:**
- ✅ HTTP 200 for `/api/auth/signup` POST
- ✅ HTTP 200 for `/api/auth/verify-email` (or auto-verified in test mode)
- ✅ JWT token in localStorage or cookies
- ✅ Dashboard `/dashboard` renders without errors
- ✅ User name appears in header/profile menu

**Duration:** ~30 seconds  
**Flakiness Risk:** LOW (email mocking reduces failures)  
**Dependencies:** Email service or mock

---

### Flow 2: Instagram Profile Connection (E2E-2)

**Objective:** Validate OAuth flow and Instagram profile linking

**Preconditions:**
- User logged in (from Flow 1)
- Instagram test account credentials available
- Test account has Graph API permissions

**Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 2.1 | Navigate to `/settings/profiles` | Profiles page displayed, "Connect Instagram" button visible |
| 2.2 | Click "Connect Instagram" | Instagram OAuth consent screen (or modal) |
| 2.3 | Login to Instagram test account | Instagram credential modal (or redirect to instagram.com) |
| 2.4 | Enter test account: `synkra-e2e-test` | Login successful |
| 2.5 | Grant app permissions | "Approve" button click |
| 2.6 | Return to app (redirect callback) | Profile connection success modal |
| 2.7 | Verify profile in UI | Profile card shows: handle, follower count, profile picture |
| 2.8 | Check backend: GET `/api/profiles` | Profile data in response (id, instagram_username, access_token status) |

**Assertions:**
- ✅ OAuth redirect to Instagram login successful
- ✅ App receives authorization code in callback
- ✅ Access token stored securely (not in localStorage plaintext)
- ✅ Profile visible in `/api/profiles` response
- ✅ `access_token` field exists (not exposed in frontend)
- ✅ Profile status: "active" or "connected"

**Duration:** ~45 seconds (includes Instagram login)  
**Flakiness Risk:** MEDIUM (Instagram UI changes, rate limiting)  
**Dependencies:** Instagram test account, Graph API token

---

### Flow 3: Content Generation (E2E-3)

**Objective:** Validate manual content creation with AI-generated elements

**Preconditions:**
- User logged in (Flow 1)
- Instagram profile connected (Flow 2)
- AI generation endpoints operational

**Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 3.1 | Navigate to `/content/create` | Content creation form displayed |
| 3.2 | Select content type: "Feed Post" | Form adapts for feed post |
| 3.3 | Enter manual caption: "Test post from E2E" | Caption field populated |
| 3.4 | Click "Generate Hashtags" (AI) | Hashtags generated below caption |
| 3.5 | Validate hashtags present | Array of hashtags: ["#test", "#e2e", ...] |
| 3.6 | Click "Generate Visual" (AI) | Loading state, then image generated |
| 3.7 | Preview visual in modal | Image displays without error |
| 3.8 | Click "Save Draft" | Content saved, redirect to content detail page |
| 3.9 | Verify draft in `/api/content/{contentId}` | Status: "draft", all fields present |

**Assertions:**
- ✅ HTTP 200 for `POST /api/content/generate`
- ✅ Generated hashtags are valid (start with #, no special chars)
- ✅ Visual URL returns HTTP 200 (image accessible)
- ✅ Content status: "draft"
- ✅ All generated fields queryable in backend
- ✅ Preview modal closes without console errors

**Duration:** ~60 seconds (includes AI calls)  
**Flakiness Risk:** MEDIUM (AI response time variable)  
**Dependencies:** Claude API, image generation service

---

### Flow 4: Approval + Publish (E2E-4)

**Objective:** Validate workflow state transitions and publication

**Preconditions:**
- Content drafted (Flow 3)
- User has approve permission (or auto-approve enabled)

**Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 4.1 | Navigate to `/approval-panel` | All pending content listed |
| 4.2 | Find draft content from Flow 3 | Content card visible with buttons |
| 4.3 | Click "Approve" button | Approval confirmation modal |
| 4.4 | Confirm approval | Modal closes, status updates to "approved" |
| 4.5 | Click "Publish" button | Publish modal with schedule options |
| 4.6 | Click "Publish Now" (no schedule) | Loading spinner, publication in progress |
| 4.7 | Wait for API response | HTTP 200 from `POST /api/publish` |
| 4.8 | Verify workflow state backend | `current_step: "published"` |
| 4.9 | Check Instagram API response | Post ID returned, caption/image on Instagram |

**Assertions:**
- ✅ Workflow state: pending → approved → published
- ✅ HTTP 200 for `POST /api/approve`
- ✅ HTTP 200 for `POST /api/publish`
- ✅ Post ID in response (Instagram post ID)
- ✅ Workflow history logged (approval + publish events)
- ✅ Publication timestamp recorded

**Duration:** ~30 seconds (Instagram API call time)  
**Flakiness Risk:** MEDIUM (Instagram API rate limiting)  
**Dependencies:** Instagram API connectivity

---

### Flow 5: Metrics Verification (E2E-5)

**Objective:** Validate post visibility on Instagram feed and metrics sync

**Preconditions:**
- Content published (Flow 4)
- Instagram test account accessible
- Metrics API operational

**Steps:**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 5.1 | Navigate to Instagram test account profile (browser) | Profile loads with recent posts |
| 5.2 | Verify published post visible | Post from Flow 4 appears in feed (caption, image, hashtags) |
| 5.3 | Validate post elements | Caption matches generated text, hashtags present, image visible |
| 5.4 | Open app dashboard → `/metrics/{contentId}` | Metrics page for published post loaded |
| 5.5 | Check metrics data displayed | Likes, comments, impressions visible |
| 5.6 | Backend: GET `/api/content/{contentId}/metrics` | JSON response with metrics fields |
| 5.7 | Verify metrics sync | Data matches Instagram graph API (with small delay tolerance) |
| 5.8 | Validate metric timestamps | Updated timestamps are recent (< 5 min old) |

**Assertions:**
- ✅ Post visible on Instagram profile feed (visual confirmation)
- ✅ Caption matches exactly (with generated hashtags)
- ✅ Image URL in post valid (200 OK)
- ✅ Metrics API returns data (likes, comments, impressions)
- ✅ Metrics sync < 5 minute delay from publication
- ✅ No console errors on metrics page

**Duration:** ~60 seconds (includes Instagram load time)  
**Flakiness Risk:** HIGH (Instagram UI changes, account suspension risk)  
**Dependencies:** Instagram account active, rate limit headroom

---

## Test Execution Strategy

### Database Reset
```javascript
// Before each test suite
await resetDatabase();
  - Delete all test users/profiles
  - Delete all test content/workflow states
  - Reset sequences/IDs to zero
  - Verify clean state with query count
```

### Retry Logic
```javascript
// For Instagram-dependent flows (2, 4, 5)
const maxRetries = 3;
const delayMs = 2000;
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    await testStep();
    break;
  } catch (error) {
    if (attempt === maxRetries) throw error;
    await sleep(delayMs * attempt); // exponential backoff
  }
}
```

### Rate Limiting Handling
```
Instagram API: 90 requests/15 min
Strategy:
- Add 500ms delay between Flow 2, 4, 5 (Instagram API calls)
- Use request batching where possible
- Mock Instagram API for Flow 3 if real calls fail
```

### Parallel vs Sequential
- **Sequential:** Run flows 1-5 in order (dependencies)
- **Parallel:** Can run multiple test suites (different users) with 1s delays
- **Not Parallel:** Flows 2,4,5 (Instagram account single-threaded)

---

## Success Criteria & Pass/Fail Rules

### Mandatory Passes (ALL MUST PASS)
- [ ] Flow 1: Signup + Login — 100% pass rate
- [ ] Flow 2: Instagram connection — >= 95% pass rate (rate limiting tolerance)
- [ ] Flow 3: Content generation — 100% pass rate
- [ ] Flow 4: Approval + Publish — >= 95% pass rate
- [ ] Flow 5: Metrics verification — >= 90% pass rate (Instagram sync delay)

### Overall Pass Criteria
- [ ] Total pass rate >= 90% (max 1 failure per 10 runs)
- [ ] No CRITICAL errors (auth failures, 500 errors)
- [ ] Execution time < 15 minutes total
- [ ] HTML report generated with screenshots of failures
- [ ] All database cleanup successful (no orphaned records)

### Failure Classification

| Severity | Type | Example | Action |
|----------|------|---------|--------|
| **CRITICAL** | Auth, 500 error | Login fails, API 500 | FAIL gate, fix before merge |
| **HIGH** | Workflow broken | Publish fails | FAIL gate, fix before merge |
| **MEDIUM** | Flakiness | Instagram UI timing | Retry, document as debt |
| **LOW** | Display, minor UI | Alignment issue | Document, approve anyway |

---

## File Structure

```
tests/e2e/
├── full-flow.spec.ts         # Main test file (5 flows)
├── fixtures.ts               # Setup/teardown, database reset
├── instagram-helpers.ts      # Instagram API mocking/real calls
├── pages/                    # Playwright Page Object Model
│   ├── LoginPage.ts
│   ├── ProfilesPage.ts
│   ├── ContentPage.ts
│   ├── ApprovalPanel.ts
│   └── MetricsPage.ts
├── utils/
│   ├── db-reset.ts
│   ├── instagram-graph.ts
│   └── retry.ts
├── config.ts                 # Playwright config, timeouts
├── README.md                 # How to run, debug
└── screenshots/              # Failure screenshots (runtime)
```

---

## CI/CD Integration

### GitHub Actions Workflow
```yaml
name: E2E Tests (Story 7.1)
on: [pull_request, push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:e2e -- 7.1
      - if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-screenshots
          path: tests/e2e/screenshots/
```

### Command Reference
```bash
# Run all E2E tests
npm run test:e2e

# Run single flow
npm run test:e2e -- --grep "E2E-1"

# Run with headed browser (debugging)
npm run test:e2e:debug

# Generate coverage report
npm run test:e2e:coverage
```

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Instagram rate limiting | Tests fail randomly | MEDIUM | Add delays, batch requests, use mock |
| Instagram UI changes | Selector breakage | MEDIUM | Use `data-testid`, monitor, update selectors |
| Test account suspension | Full test suite blocked | LOW | Rotate test accounts, monitor usage |
| Email delivery timing | Email verification slow | MEDIUM | Use mock email service or auto-verify |
| Database transaction issues | Orphaned test data | LOW | Transaction rollback, hard reset |
| Network flakiness | API timeouts | LOW | Retry logic, increase timeouts to 10s |

---

## Deliverables

- [x] This test plan (7.1 test strategy)
- [ ] `full-flow.spec.ts` (5 test flows, 100+ assertions)
- [ ] `fixtures.ts` (setup, teardown, database reset)
- [ ] `instagram-helpers.ts` (OAuth mock, API calls)
- [ ] Page objects (LoginPage, ContentPage, etc.)
- [ ] `README.md` (how to run, debug, environment setup)
- [ ] `.env.test` (test credentials, gitignored)
- [ ] CI/CD workflow file (GitHub Actions)
- [ ] HTML report with screenshots
- [ ] QA gate validation (sign-off)

---

## Sign-Off

**Test Plan Created:** 2026-04-15  
**Planned Execution:** 2026-04-16  
**Target Completion:** 2026-04-17  

**Next Action:** Implement `full-flow.spec.ts` with all 5 flows
