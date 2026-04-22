/**
 * Test Setup and Fixtures Management
 * Runs before all E2E tests to prepare environment
 */

import { setupAllTestData, cleanupTestData, SetupContext } from './fixtures.setup';

// Global context for test data access
export let testContext: SetupContext | null = null;

/**
 * Initialize test environment
 * Called from global-setup.ts
 */
export async function initializeTestEnvironment(): Promise<SetupContext> {
  const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001';

  console.log('\n📋 Initializing test environment...');
  console.log(`   API URL: ${apiUrl}`);

  try {
    // Setup test data
    const context = await setupAllTestData(apiUrl);
    testContext = context;

    return context;
  } catch (error) {
    console.error('❌ Failed to initialize test environment:', error);
    throw error;
  }
}

/**
 * Cleanup test environment
 * Called from global-teardown.ts
 */
export async function cleanupTestEnvironment(): Promise<void> {
  if (!testContext) {
    console.log('⚠️  No test context to cleanup');
    return;
  }

  const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001';

  console.log('\n🧹 Cleaning up test environment...');

  try {
    await cleanupTestData(testContext);
    testContext = null;
  } catch (error) {
    console.error('⚠️  Cleanup error (tests may have succeeded):', error);
    // Don't throw - tests have already run
  }
}

/**
 * Get current test context
 * Used by tests to access seeded data
 */
export function getTestContext(): SetupContext {
  if (!testContext) {
    throw new Error(
      'Test context not initialized. Make sure tests are run through Playwright with proper setup.'
    );
  }
  return testContext;
}
