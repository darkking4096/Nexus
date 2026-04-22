import { cleanupTestEnvironment } from './test-setup';

/**
 * Global teardown for E2E tests
 * Runs once after all tests
 */
async function globalTeardown() {
  console.log('\n🛑 E2E test suite teardown...');

  try {
    // Clean up test data (seeded fixtures)
    await cleanupTestEnvironment();

    console.log('✅ Teardown complete\n');
  } catch (error) {
    console.error('⚠️  Teardown error:', error);
    // Don't exit with error on teardown - tests have already run
  }
}

export default globalTeardown;
