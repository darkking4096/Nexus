# Story 7.1 — E2E Tests (End-to-End Testing)

Complete Playwright test suite for 5 critical user flows: signup → login → Instagram connection → content generation → approval → publish → metrics.

## Quick Start

### Prerequisites
- Node.js 18+
- Playwright installed: `npm install`
- Staging environment running (local or `staging.synkra.com`)
- Test Instagram account credentials

### Setup

1. **Create `.env.test` (gitignored)**
```bash
TEST_USER_EMAIL=qa-tester-e2e@synkra.test
TEST_USER_PASSWORD=SecureTestPassword123!
INSTAGRAM_TEST_HANDLE=synkra-e2e-test
INSTAGRAM_GRAPH_TOKEN=<your_test_token>
INSTAGRAM_BUSINESS_ACCOUNT_ID=<test_account_id>
STAGING_URL=http://localhost:3000
BASE_URL=http://localhost:3000
```

2. **Install dependencies**
```bash
npm install
```

3. **Start staging environment (if running locally)**
```bash
npm run dev
```

## Running Tests

### All E2E tests
```bash
npm run test:e2e
```

### Single test flow
```bash
npm run test:e2e -- --grep "E2E-1"  # Signup + Login
npm run test:e2e -- --grep "E2E-2"  # Instagram Connection
npm run test:e2e -- --grep "E2E-3"  # Content Generation
npm run test:e2e -- --grep "E2E-4"  # Approval + Publish
npm run test:e2e -- --grep "E2E-5"  # Metrics Verification
```

### Debug mode (headed browser)
```bash
npx playwright test tests/e2e/full-flow.spec.ts --headed
```

### Interactive debugging
```bash
npx playwright test tests/e2e/full-flow.spec.ts --debug
```

### Generate HTML report
```bash
npm run test:e2e
npx playwright show-report tests/e2e/reports
```

## File Structure

```
tests/e2e/
├── full-flow.spec.ts           # Main test suite (5 flows + integration)
├── fixtures.ts                 # Setup/teardown, database helpers
├── playwright.config.ts        # Playwright configuration
├── pages/
│   ├── LoginPage.ts           # Signup + Login page object
│   ├── ProfilesPage.ts        # Instagram connection page object
│   ├── ContentPage.ts         # Content generation page object
│   ├── ApprovalPanel.ts       # Approval workflow page object
│   └── MetricsPage.ts         # Metrics dashboard page object
├── utils/
│   ├── retry.ts               # Exponential backoff retry logic
│   ├── db-reset.ts            # Database cleanup helpers
│   └── instagram-helpers.ts   # Instagram OAuth mocking
├── README.md                  # This file
└── reports/                   # Test reports (generated)
    ├── index.html            # HTML test report
    └── results.json          # JSON test results
```

## Test Overview

### E2E-1: Signup + Login
**Objective:** Validate user registration and authentication

- Register new user
- Verify email (or auto-verify in test mode)
- Login with credentials
- Check JWT token storage
- Validate dashboard loads

**Duration:** ~30 seconds  
**Flakiness:** LOW

### E2E-2: Instagram Profile Connection
**Objective:** Validate OAuth flow and profile linking

- Login to app
- Click "Connect Instagram"
- Complete OAuth flow (real or mocked)
- Verify profile visible in UI
- Check API returns profile data

**Duration:** ~45 seconds  
**Flakiness:** MEDIUM (Instagram UI changes)

### E2E-3: Content Generation
**Objective:** Validate content creation with AI

- Login
- Navigate to content creation
- Enter caption manually
- Generate hashtags via AI
- Generate visual via AI
- Save as draft
- Verify in database

**Duration:** ~60 seconds  
**Flakiness:** MEDIUM (AI response time variable)

### E2E-4: Approval + Publish
**Objective:** Validate workflow state transitions

- Create and draft content
- Navigate to approval panel
- Click approve button
- Confirm approval
- Click publish
- Verify status changes to "published"
- Check Instagram post created

**Duration:** ~30 seconds  
**Flakiness:** MEDIUM (Instagram API rate limiting)

### E2E-5: Metrics Verification
**Objective:** Validate metrics display and sync

- Publish content (from E2E-4)
- Open metrics page
- Verify metrics displayed (likes, comments, impressions)
- Check backend API returns data
- Validate sync timestamp

**Duration:** ~60 seconds  
**Flakiness:** HIGH (Instagram UI, account suspension risk)

## Success Criteria

✅ All tests passing  
✅ >= 90% pass rate (max 1 failure per 10 runs)  
✅ Total execution < 15 minutes  
✅ HTML report with failure screenshots  
✅ No database orphaned records  

## Troubleshooting

### Tests failing on Instagram OAuth
Instagram test account might be rate-limited or suspended. Check:
- Account login credentials in `.env.test`
- Graph API token validity
- Instagram test account active status
- Rate limiting (90 requests/15 min)

**Fix:** Use mock OAuth in test mode (see `instagram-helpers.ts`)

### Email verification timing out
Test environment might not have email service configured.

**Fix:** Configure auto-email-verify in staging or mock email service

### Image generation timeouts
Claude AI generation can take 20-30 seconds.

**Fix:** Increase timeout or use pre-generated test images

### Database state inconsistency
Test data not properly cleaned between runs.

**Fix:** Run `await resetDatabase()` before each test (configured in `beforeEach`)

## Performance Metrics

Target performance for acceptance:

| Metric | Target | Actual |
|--------|--------|--------|
| Dashboard load | < 2s | — |
| Content generation | < 30s | — |
| API response | < 200ms p95 | — |
| Total E2E runtime | < 15 min | — |

## CI/CD Integration

Tests run automatically on:
- Pull requests to main
- Commits to main
- Manual trigger

Reports saved to: `tests/e2e/reports/`

### GitHub Actions
```yaml
# .github/workflows/e2e.yml
on: [pull_request, push]
jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - run: npm run test:e2e
      - if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: e2e-reports
          path: tests/e2e/reports/
```

## Contributing

When adding new tests:
1. Follow the 5-flow structure
2. Use page objects for UI interaction
3. Add meaningful assertions
4. Document test objectives
5. Estimate flakiness risk
6. Add to this README

## Next Steps

- [ ] Implement remaining Page Objects (ProfilesPage, ContentPage, etc.)
- [ ] Create Instagram mock helpers
- [ ] Configure email service or auto-verify
- [ ] Add retry logic for flaky steps
- [ ] Run baseline performance metrics
- [ ] Add to CI/CD pipeline
- [ ] Document known limitations

---

**Story:** 7.1  
**Owner:** @qa  
**Created:** 2026-04-15
