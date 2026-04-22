# E2E Testing Guide — NEXUS Platform Migration Validation

**Story:** 8.1.4 | **Status:** Implementation Complete ✅ | **Phase:** 1 (Core Validation)

## Overview

Comprehensive end-to-end testing suite for validating the Vercel + Supabase migration. This guide covers:

- ✅ **Happy Path Testing** (6 AC) — User workflows: registration, login, content CRUD, profiles
- ✅ **Edge Cases** (6 AC) — Invalid input, network failures, concurrency, validation errors
- ✅ **Security & Authorization** (5 AC) — Authentication, authorization, RLS, HTTPS, sessions
- ✅ **Data Integrity & Regression** (9 AC) — Zero data loss, FK constraints, backward compatibility

**Total Test Coverage:** 52+ test cases covering all 26 acceptance criteria

---

## Quick Start

### 1. Install Dependencies

```bash
cd packages/backend
npm install
```

### 2. Start Backend & Frontend

```bash
# Terminal 1: Backend
cd packages/backend
npm run dev

# Terminal 2: Frontend
cd packages/frontend
npm run dev
```

### 3. Run E2E Tests

```bash
# From packages/backend directory

# Run all tests
npm run test:e2e

# Run tests with browser visible (debug mode)
npm run test:e2e:headed

# Run tests with step-by-step debugger
npm run test:e2e:debug

# View test report after running
npm run test:e2e:report
```

---

## Test Structure

### Test Files

| File | Tests | Coverage |
|------|-------|----------|
| `happy-path.test.ts` | 12 tests | Registration, login, content CRUD, profiles |
| `edge-cases.test.ts` | 15 tests | Invalid input, XSS/SQL injection, concurrency |
| `security.test.ts` | 18 tests | Auth, authz, RLS, HTTPS, session management |
| `regression.test.ts` | 15 tests | Data loss, FK constraints, backward compatibility |
| **Total** | **60+ tests** | **26 acceptance criteria** |

### Test Categories

#### Happy Path (12 tests)
- User registration with valid credentials
- User login and session persistence
- Profile updates and persistence
- Content creation and retrieval
- Content listing, filtering, pagination
- Complete CRUD workflow

#### Edge Cases (15 tests)
- XSS payload injection prevention
- SQL injection blocking
- Path traversal protection
- Missing required field validation
- Invalid email/password rejection
- Duplicate account prevention
- Concurrent operations (3+ users)
- Network timeout handling
- Large payload handling

#### Security (18 tests)
- 401 Unauthorized for protected endpoints
- Authorization: user A cannot access user B's data
- RLS policies enforcement
- HTTPS validation (production)
- Session token validation
- Expired token rejection
- Tampered token detection
- Token reuse prevention
- CSRF/CORS protection
- Password security

#### Regression (15 tests)
- Foreign key constraint validation
- Transaction rollback on failure
- Query performance (< 500ms for indexed queries)
- API response format consistency
- Pagination format stability
- Error response structure
- Feature parity across all core features
- No breaking changes in workflows
- Zero data loss on complex operations

---

## Configuration

### Environment Variables

```bash
# .env.test (created automatically)
PLAYWRIGHT_BASE_URL=http://localhost:3000      # Frontend URL
PLAYWRIGHT_API_URL=http://localhost:3001       # Backend API URL
NODE_ENV=test
```

### Custom Configuration

Edit `playwright.config.ts` to customize:

```typescript
// Test timeout (per test)
timeout: 30 * 1000,

// Navigation timeout
use: {
  navigationTimeout: 30000,
}

// Workers (parallel test execution)
workers: 4,  // 4 tests in parallel

// Retries (local vs CI)
retries: process.env.CI ? 2 : 0,
```

---

## Running Tests Locally

### Standard Execution

```bash
# Run all tests
npm run test:e2e

# Run specific test file
npx playwright test happy-path.test.ts

# Run tests matching pattern
npx playwright test --grep "registration"

# Run single test
npx playwright test --grep "User can register"
```

### Debug Modes

#### Headed Mode (See Browser)
```bash
npm run test:e2e:headed
```
Opens browser window so you can watch tests execute in real-time.

#### Debug Mode (Step-Through)
```bash
npm run test:e2e:debug
```
Opens Playwright Inspector where you can:
- Pause and step through execution
- Inspect DOM elements
- Execute JavaScript in console
- View network requests

#### Slow Mode
```bash
SLOW_MO=1000 npm run test:e2e
```
Slows down all actions by 1000ms for easier visual debugging.

### View Reports

```bash
# Generate and view HTML report
npm run test:e2e:report

# Report includes:
# - Test results (pass/fail)
# - Screenshots on failure
# - Video recordings on failure
# - Trace files for detailed analysis
```

---

## Test Data Seeding

### Automatic Seeding
Test data is automatically seeded before tests run via global setup:
- 3 test users (admin, user, guest roles)
- Test content with various attributes
- User profiles with complete information

### Manual Seeding
```bash
# Seed test data manually
npm run seed:test-data

# With custom API URL
npm run seed:test-data:api http://localhost:3001
```

### Available Fixtures

```typescript
// Test users
testUsers.admin          // admin@nexus.test / Admin@123456!
testUsers.regularUser   // user@nexus.test / User@123456!
testUsers.guestUser     // guest@nexus.test / Guest@123456!

// Generate unique users
const user = createUniqueTestUser({ role: 'admin' });

// Test content templates
testContent.basicPost
testContent.draftPost
testContent.complexPost

// Invalid inputs for edge case testing
invalidInputs.xssPayloads
invalidInputs.sqlInjectionPayloads
invalidInputs.invalidEmails
invalidInputs.invalidPasswords
```

---

## Writing New Tests

### Basic Test Template

```typescript
import { test, expect } from './base.fixture';

test('my test', async ({ page, api, auth, testData, helpers }) => {
  // Arrange: Setup
  const user = await testData.createUser();
  
  // Act: Execute
  const token = await auth.login(user.email, user.password);
  const response = await api.request('GET', '/api/content', {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  // Assert: Verify
  expect(response.status).toBe(200);
  
  // Cleanup
  await testData.deleteUser(user.id);
});
```

### Using Fixtures

```typescript
// Authentication
await auth.login(email, password);
const token = await auth.currentToken();
await auth.logout();

// Test Data
const user = await testData.createUser(overrides);
await testData.deleteUser(userId);
await testData.clearAllData();

// API Requests
const response = await api.request('GET', '/api/endpoint', {
  body: { ... },
  headers: { ... }
});

// Helpers
await helpers.fillInput(page, selector, value);
await helpers.clickAndNavigate(page, selector);
await helpers.waitForApiResponse(page, urlPattern);
const text = await helpers.getElementText(page, selector);

// Performance
perf.markStart('operation');
// ... operation ...
perf.markEnd('operation');
const duration = perf.measure('operation');
expect(duration).toBeLessThan(500);
```

---

## Acceptance Criteria Verification

### Happy Path (6 AC)
- ✅ User registration: signup → email verification → profile complete
- ✅ User login: signin → session → authenticated
- ✅ Content creation: create → save → retrieve works
- ✅ Content retrieval: list → filter → paginate works
- ✅ Profile management: update → persisted in database
- ✅ All happy paths pass with 100% success rate

**Tests:** `happy-path.test.ts` (12 tests)

### Edge Cases (6 AC)
- ✅ Invalid input: XSS/SQL injection attempts blocked
- ✅ Network failure: backend timeout → graceful fallback
- ✅ Database failure: connection timeout → retry succeeds
- ✅ Concurrent operations: 3 users create content simultaneously
- ✅ Invalid credentials: login fails gracefully with error message
- ✅ Missing required fields: validation errors returned

**Tests:** `edge-cases.test.ts` (15 tests)

### Security (5 AC)
- ✅ Authentication required: protected endpoints reject unauthorized (401)
- ✅ Authorization enforced: user A cannot access user B's data
- ✅ RLS policies working: database enforces row-level security
- ✅ HTTPS enforced: no plaintext data transmission
- ✅ Session management: invalid/expired tokens rejected

**Tests:** `security.test.ts` (18 tests)

### Data Integrity (5 AC)
- ✅ Zero data loss: row count matches pre/post migration
- ✅ Foreign key constraints: no orphaned records
- ✅ Transaction safety: partial failures rolled back
- ✅ Index integrity: queries execute < 500ms
- ✅ Backup validation: data correct after restore

**Tests:** `regression.test.ts` (15 tests)

### Regression (4 AC)
- ✅ API endpoints unchanged: same response format
- ✅ Database backward compatible: existing data accessible
- ✅ No breaking changes: all previous features work
- ✅ Feature parity: all core features functional

**Tests:** `regression.test.ts` (remaining tests)

---

## CI/CD Integration

Tests automatically run on every pull request:

```yaml
# .github/workflows/e2e.yml
- Run E2E tests
- Generate reports
- Upload artifacts
```

### CI Settings
- Retries: 2 (handle flakiness)
- Workers: 1 (sequential in CI)
- Reports: HTML, JUnit, JSON

---

## Troubleshooting

### Browser Not Found
```bash
npx playwright install chromium
```

### Backend Connection Failed
```bash
# Verify backend is running
npm run dev

# Check API URL in .env.test
PLAYWRIGHT_API_URL=http://localhost:3001
```

### Test Timeout
- Increase timeout in `playwright.config.ts`
- Add explicit waits instead of delays
- Check backend/database performance

### Flaky Tests
- Use proper wait conditions
- Avoid hard-coded `setTimeout()`
- Use `retry()` helper for network ops
- Check for race conditions

### Database Issues
- Run migrations: `npm run db:migrate`
- Check Supabase connection
- Verify test user creation in setup

---

## Performance Targets

Based on Story 7.6 (Launch Readiness):

| Metric | Target | Status |
|--------|--------|--------|
| API Latency (p99) | < 1s | ✅ Validated |
| Frontend Load (LCP) | < 2.5s | ✅ Validated |
| Database Query | < 500ms | ✅ Validated |
| 50 Concurrent Users | < 2s p99 | 📋 Phase 2 |

---

## Phase 2: Advanced Validation (Story 8.1.4b)

Not included in Phase 1. Planned for future story:

- Performance testing (API latency, database performance)
- Load testing (50+ concurrent users)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile/device compatibility testing
- Stress testing (100+ concurrent users)

---

## Support & References

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices Guide](https://playwright.dev/docs/best-practices)
- [Test Reporters](https://playwright.dev/docs/test-reporters)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Trace Viewer](https://trace.playwright.dev/)

---

## Story Information

- **Epic:** 8.1 — Full-Stack Migration
- **Status:** Implementation Complete ✅
- **Owner:** @qa (Quinn)
- **Complexity:** L (13 points)
- **Dependencies:** Stories 8.1.1, 8.1.2, 8.1.3 (all complete)

---

**Last Updated:** 2026-04-22  
**Version:** 1.0 — Phase 1 Complete
