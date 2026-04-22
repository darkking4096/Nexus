#!/usr/bin/env tsx

/**
 * Test Data Seeding Script
 * Run manually to populate test data for E2E testing
 *
 * Usage:
 *   npx tsx scripts/seed-test-data.ts
 *   npx tsx scripts/seed-test-data.ts --api http://localhost:3001
 *   npx tsx scripts/seed-test-data.ts --cleanup
 */

import { setupAllTestData, cleanupTestData, setupContext } from '../tests/e2e/fixtures.setup';

const API_URL = process.argv.includes('--api')
  ? process.argv[process.argv.indexOf('--api') + 1]
  : process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001';

const shouldCleanup = process.argv.includes('--cleanup');

async function main() {
  try {
    if (shouldCleanup) {
      console.log('🧹 Cleaning up test data...\n');
      const context = await setupContext(API_URL);
      // In a real implementation, you'd track seeded data
      // For now, just show a message
      console.log('To cleanup test data, use the database directly or API endpoints');
      return;
    }

    console.log(`📍 Target API: ${API_URL}\n`);

    // Wait for API to be ready
    let retries = 30;
    while (retries > 0) {
      try {
        const response = await fetch(`${API_URL}/health`, { timeout: 1000 });
        if (response.ok) break;
      } catch {
        retries--;
        if (retries > 0) {
          console.log(`⏳ Waiting for API (${retries}s remaining)...`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }

    if (retries === 0) {
      throw new Error(`API not reachable at ${API_URL}`);
    }

    // Seed all test data
    const context = await setupAllTestData(API_URL);

    // Show seeded data for reference
    console.log('📋 Seeded Users:');
    for (const user of context.seededUsers) {
      console.log(
        `   ${user.role.toUpperCase()}: ${user.email} (ID: ${user.id.substring(0, 8)}...)`
      );
    }

    console.log('\n✅ Test data seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
}

main();
