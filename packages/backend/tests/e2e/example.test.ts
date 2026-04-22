import { test, expect } from './base.fixture';
import { getTestContext } from './test-setup';

/**
 * Example E2E Test Suite
 * Shows how to use fixtures, helpers, and seeded test data
 *
 * Run with:
 *   npm run test:e2e
 *   npm run test:e2e:headed
 *   npm run test:e2e:debug
 */

test.describe('Example E2E Tests', () => {
  test('Access seeded test data', async ({ page, helpers }) => {
    // Get seeded test data from global context
    const context = getTestContext();
    const admin = context.seededUsers.find((u) => u.role === 'admin');

    expect(admin).toBeDefined();
    expect(admin?.email).toContain('@nexus.test');

    console.log(`Using admin user: ${admin?.email}`);
  });

  test('Navigate to home page', async ({ page }) => {
    // Navigate to app
    await page.goto('/');

    // Verify page loads
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('Test helper functions', async ({ page, helpers }) => {
    // Navigate
    await page.goto('/');

    // Check if element is visible
    const isVisible = await helpers.isVisible(page, 'body');
    expect(isVisible).toBe(true);

    // Get element text
    const bodyText = await helpers.getElementText(page, 'body', 5000);
    expect(bodyText).toBeTruthy();
  });

  test('API request example', async ({ api }) => {
    // Make API request
    const response = await api.request('GET', '/api/health');

    expect(response.status).toBe(200);
  });

  test('Measure performance', async ({ page, perf }) => {
    perf.markStart('page-load');
    await page.goto('/');
    perf.markEnd('page-load');

    const duration = perf.measure('page-load');
    console.log(`Page load took ${duration}ms`);

    // Assert within performance target
    expect(duration).toBeLessThan(5000); // 5 seconds
  });

  test('Handle dialogs', async ({ page, helpers }) => {
    // Setup dialog handler
    await helpers.handleDialog(page, 'accept');

    // Trigger dialog (example - adjust to your app)
    await page.evaluate(() => {
      // alert('Test dialog');
    });
  });

  test('Extract and verify data', async ({ page, helpers }) => {
    await page.goto('/');

    // Get all text from elements
    const allTexts = await helpers.getAllTexts(page, 'p');
    expect(Array.isArray(allTexts)).toBe(true);
  });

  test('Retry helper for flaky operations', async ({ helpers }) => {
    // Simulate a flaky API call
    const result = await helpers.retry(
      async () => {
        // Simulate operation that might fail
        const random = Math.random();
        if (random < 0.7) {
          throw new Error('Simulated failure');
        }
        return 'success';
      },
      { maxAttempts: 5, delayMs: 100 }
    );

    expect(result).toBe('success');
  });

  test('Clear and set storage', async ({ page, helpers }) => {
    // Set token
    await helpers.setAuthToken(page, 'test-token-123');

    // Get token
    const token = await helpers.getAuthToken(page);
    expect(token).toBe('test-token-123');

    // Clear all storage
    await helpers.clearStorage(page);

    // Verify cleared
    const clearedToken = await helpers.getAuthToken(page);
    expect(clearedToken).toBeNull();
  });
});

test.describe('Example: Happy Path Workflow', () => {
  test.skip('Complete user workflow', async ({ page, auth, testData, helpers }) => {
    // This test is skipped as an example - uncomment to enable
    // Shows a complete workflow: register → login → create content

    // Step 1: Register
    await page.goto('/register');
    const newUser = await testData.createUser();
    console.log(`Created user: ${newUser.email}`);

    // Step 2: Login
    const token = await auth.login(newUser.email, newUser.password);
    expect(token).toBeTruthy();

    // Step 3: Navigate to dashboard
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/dashboard');

    // Step 4: Create content (example)
    // await helpers.fillInput(page, 'input[name="title"]', 'Test Post');
    // await helpers.clickAndNavigate(page, 'button[type="submit"]');

    // Cleanup
    await testData.deleteUser(newUser.id);
  });
});
