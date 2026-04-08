import Database from 'better-sqlite3';
import { AnalyticsService } from '../services/AnalyticsService.js';

/**
 * Scheduled job to collect metrics for all profiles daily
 * Call this from a cron job or scheduler (e.g., node-cron, AWS Lambda, etc.)
 */
export async function runMetricsCollectionJob(db: Database.Database): Promise<void> {
  const analyticsService = new AnalyticsService(db);

  console.log('[MetricsCollectionJob] Starting metrics collection...');

  try {
    const result = await analyticsService.collectMetricsForAllProfiles();
    console.log(`[MetricsCollectionJob] Completed: ${result.success} succeeded, ${result.failed} failed`);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('[MetricsCollectionJob] Fatal error:', msg);
    throw error;
  }
}

/**
 * Initialize scheduler (if using node-cron)
 * Called from main app entry point
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function initializeMetricsScheduler(_db: Database.Database): void {
  // Lazy load node-cron to avoid hard dependency
  // Can be imported conditionally: `import('node-cron').then(...)`
  console.log('[MetricsScheduler] Scheduler support available. Use external cron or import node-cron for automated scheduling.');

  // Example with node-cron (uncomment if installed):
  // import cron from 'node-cron';
  //
  // // Run metrics collection every day at 2 AM
  // cron.schedule('0 2 * * *', async () => {
  //   console.log('[MetricsScheduler] Running scheduled metrics collection...');
  //   await runMetricsCollectionJob(_db);
  // });
}
