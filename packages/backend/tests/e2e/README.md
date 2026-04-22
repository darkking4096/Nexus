# E2E Testing Guide — NEXUS Platform

Comprehensive end-to-end testing using Playwright for Vercel + Supabase migration validation.

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+
- Backend running: `npm run dev`
- Frontend running (or Vercel preview deployed)

### Install Dependencies

```bash
# From project root or packages/backend
npm install
```

### Run E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode (step through)
npm run test:e2e:debug

# View test report after running
npm run test:e2e:report
```

## Test Structure

```
tests/e2e/
├── global-setup.ts          # Setup before all tests (verify browser, API)
├── global-teardown.ts       # Cleanup after all tests
├── base.fixture.ts          # Extended Playwright fixtures with utilities
├── helpers.ts               # Reusable E2E helper functions
├── happy-path.test.ts       # Happy path workflows (registration, login, content)
├── edge-cases.test.ts       # Edge cases & error handling
├── security.test.ts         # Authentication, authorization, RLS
├── regression.test.ts       # Backward compatibility, feature parity
└── README.md               # This file

tests/fixtures/
├── test-data.ts            # Test data fixtures and generators
└── [other fixtures]
```

## Writing Tests

### Basic Test Template

```typescript
import { test, expect } from '../base.fixture';
import { testUsers, testContent } from '../../fixtures/test-data';

test('User can register and login', async ({ page, auth, helpers }) => {
  // Arrange: Setup test data
  const testUser = { email: 'test@example.com', password: 'Test@123!' };

  // Act: Perform actions
  await page.goto('/register');
  await helpers.fillInput(page, 'input[name="email"]', testUser.email);
  // ... more actions

  // Assert: Verify results
  await expect(page).toHaveURL('/dashboard');
});
```

### Using Fixtures

```typescript
// auth fixture - login/logout
await auth.login('user@test.com', 'password');
const token = await auth.currentToken();

// testData fixture - create/delete test data
const user = await testData.createUser({ email: 'unique@test.com' });
await testData.deleteUser(user.id);

// helpers fixture - common utilities
await helpers.fillInput(page, selector, value);
await helpers.waitForApiResponse(page, '/api/users');
```

### Performance Testing

```typescript
test('API response time is acceptable', async ({ page, perf, api }) => {
  perf.markStart('api-call');
  const response = await api.request('GET', '/api/content');
  perf.markEnd('api-call');

  const duration = perf.measure('api-call');
  expect(duration).toBeLessThan(500); // 500ms
});
```

## Test Coverage

### Phase 1: Core Validation (This Story)

**Happy Path Tests** (6 acceptance criteria)
- User registration → email verification → profile completion
- User login → session → authenticated state
- Content creation → save → retrieval
- Content listing → filtering → pagination
- Profile management → updates → persistence
- All workflows with 100% success rate

**Edge Cases** (6 acceptance criteria)
- Invalid input (XSS/SQL injection blocked)
- Network failures (timeout → graceful fallback)
- Database failures (timeout → retry succeeds)
- Concurrent operations (3 users simultaneously)
- Invalid credentials (graceful error message)
- Missing required fields (validation errors)

**Security & Authorization** (5 acceptance criteria)
- Authentication required (401 for unauthorized)
- Authorization enforced (user A cannot access B's data)
- RLS policies working (database enforces visibility)
- HTTPS enforced (no plaintext)
- Session management (invalid tokens rejected)

**Data Integrity** (5 acceptance criteria)
- Zero data loss (row counts match)
- Foreign key constraints (no orphaned records)
- Transaction safety (partial failures rollback)
- Index integrity (queries < 500ms)
- Backup validation (data correct after restore)

**Regression Testing** (4 acceptance criteria)
- API endpoints unchanged (same response format)
- Database backward compatible (existing data accessible)
- No breaking changes (all features work)
- Feature parity (core features functional)

### Phase 2: Advanced Validation (Story 8.1.4b)

- Performance testing (API latency, database performance)
- Load testing (50+ concurrent users)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile/device compatibility testing

## Configuration

### playwright.config.ts

Key settings:
- `baseURL`: Frontend base URL (default: http://localhost:3000)
- `testDir`: E2E test location (./tests/e2e)
- `workers`: Parallel test execution (default: auto)
- `timeout`: Per-test timeout (30 seconds)
- `retries`: Auto-retry on failure (0 locally, 2 in CI)

### Environment Variables

```
PLAYWRIGHT_BASE_URL=http://localhost:3000    # Frontend URL
PLAYWRIGHT_API_URL=http://localhost:3001     # Backend API URL
SLOW_MO=1000                                 # Slow down actions (for debugging)
CI=true                                      # Set in CI/CD to enable retries
```

## Debugging

### Run Tests in Debug Mode

```bash
npm run test:e2e:debug
```

Opens the Playwright Inspector where you can:
- Step through tests line-by-line
- Inspect DOM elements
- Execute JavaScript in the console
- View network requests

### Run Tests Headed (See Browser)

```bash
npm run test:e2e:headed
```

Runs tests with visible browser window for visual debugging.

### View Test Report

```bash
npm run test:e2e:report
```

Opens HTML report with:
- Test results (pass/fail)
- Screenshots on failure
- Video recordings on failure
- Trace files for detailed analysis

### Add Debugging Statements

```typescript
test('debug example', async ({ page }) => {
  // Print to console
  console.log('Current URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'debug.png' });

  // Pause execution
  await page.pause();
});
```

## Best Practices

### Test Independence
- ✅ Each test should be independent
- ✅ Setup test data in test or fixture
- ✅ Cleanup after test completes
- ❌ Don't depend on test execution order

### Flakiness Prevention
- ✅ Use explicit waits (`waitFor`, `waitForNavigation`)
- ✅ Avoid hard-coded delays (use `timeout` parameter)
- ✅ Use `retry()` helper for unreliable operations
- ❌ Don't use `page.waitForTimeout()` (hard delay)

### Maintainability
- ✅ Use helpers for common operations
- ✅ Use fixtures for test data
- ✅ Use selectors that won't break (stable IDs)
- ❌ Don't hardcode test data in test files

### Performance
- ✅ Parallel tests (default)
- ✅ Reuse browser context when possible
- ✅ Minimize API calls
- ❌ Don't spawn new browser per test

## Troubleshooting

### "Browser is not installed"
```bash
npx playwright install chromium
```

### "Connection to backend failed"
```bash
# Check backend is running
npm run dev

# Verify API URL in config
# Check .env.test has correct API_URL
```

### "Test timeout"
- Increase timeout in playwright.config.ts
- Add explicit waits with proper selectors
- Check if backend/DB is slow

### "Flaky tests"
- Add proper wait conditions instead of delays
- Use `retry()` helper for network operations
- Check for race conditions in test logic

## Performance Targets

Based on Story 7.6 (Launch Readiness):

- **API Latency:** p99 < 1s
- **Frontend Load:** LCP < 2.5s, CLS < 0.1, FID < 100ms
- **Database Queries:** < 500ms
- **Load Test:** 50 concurrent users with < 2s p99 latency

## CI/CD Integration

Tests automatically run in GitHub Actions:
- Trigger: Pull request to main
- Environment: Ubuntu latest
- Browsers: Chromium (Firefox/Safari in Phase 2)
- Retries: 2 (to handle flakiness)
- Report: HTML and JUnit formats

## References

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Test Report Generator](https://playwright.dev/docs/test-reporters)
- [Performance Testing](https://web.dev/performance/)

---

**Next Steps:**
- Run tests locally: `npm run test:e2e`
- Add more test scenarios as AC are implemented
- Monitor performance metrics
- Prepare for Phase 2 (advanced validation)
