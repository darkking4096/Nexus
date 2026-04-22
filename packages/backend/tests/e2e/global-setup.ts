import { chromium } from '@playwright/test';
import { initializeTestEnvironment } from './test-setup';

/**
 * Global setup for E2E tests
 * Runs once before all tests
 */
async function globalSetup() {
  console.log('🚀 Starting E2E test suite global setup...');

  try {
    // Verify browser is available
    const browser = await chromium.launch();
    await browser.close();
    console.log('✅ Browser (Chromium) verified');

    // Verify backend is reachable
    const apiUrl = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001';
    const maxRetries = 30; // 30 seconds
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await fetch(`${apiUrl}/health`, { timeout: 1000 });
        if (response.ok) {
          console.log(`✅ Backend API reachable at ${apiUrl}`);
          break;
        }
      } catch {
        retries++;
        if (retries < maxRetries) {
          console.log(`⏳ Waiting for backend... (${retries}/${maxRetries})`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (retries === maxRetries) {
      throw new Error(`Backend not reachable at ${apiUrl} after ${maxRetries}s`);
    }

    // Verify Supabase connection (from backend perspective)
    const supabaseCheck = await fetch(`${apiUrl}/api/health/db`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    }).catch(() => null);

    if (supabaseCheck?.ok) {
      console.log('✅ Database connection verified');
    } else {
      console.warn('⚠️  Database health check skipped (may not be ready)');
    }

    // Initialize test data (seed fixtures)
    console.log('\n📋 Setting up test data fixtures...');
    try {
      await initializeTestEnvironment();
      console.log('✅ Test data setup complete');
    } catch (error) {
      console.warn('⚠️  Test data setup failed (tests may still run):', error);
      // Don't exit - tests can still run without seeded data
    }

    console.log('✅ Global setup complete\n');
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    process.exit(1);
  }
}

export default globalSetup;
