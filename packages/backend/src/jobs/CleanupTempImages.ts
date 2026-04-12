import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';
import os from 'os';

/**
 * CleanupTempImages: Scheduled job that runs every 6 hours
 * Removes temporary image files and expired cache entries
 * Prevents disk space issues from accumulated temp files
 */
export class CleanupTempImagesJob {
  private tempDir: string;
  private maxAgeMs: number = 6 * 60 * 60 * 1000; // 6 hours

  constructor(tempDir?: string) {
    this.tempDir = tempDir || path.join(os.tmpdir(), 'nexus-images');
  }

  /**
   * Execute cleanup job
   * Called every 6 hours via scheduler
   */
  async execute(): Promise<{ filesDeleted: number; spaceFreedMb: number }> {
    logger.info(`[CleanupTempImagesJob] Starting cleanup job`);

    try {
      if (!fs.existsSync(this.tempDir)) {
        logger.debug(`[CleanupTempImagesJob] Temp directory doesn't exist: ${this.tempDir}`);
        return { filesDeleted: 0, spaceFreedMb: 0 };
      }

      const files = fs.readdirSync(this.tempDir);
      const now = Date.now();
      let filesDeleted = 0;
      let spaceFreedBytes = 0;

      for (const file of files) {
        try {
          const filePath = path.join(this.tempDir, file);
          const stats = fs.statSync(filePath);

          // Delete if older than 6 hours
          if (now - stats.mtimeMs > this.maxAgeMs) {
            spaceFreedBytes += stats.size;
            fs.unlinkSync(filePath);
            filesDeleted++;

            logger.debug(
              `[CleanupTempImagesJob] Deleted: ${file} (${(stats.size / 1024).toFixed(2)}KB)`
            );
          }
        } catch (fileError) {
          logger.warn(
            `[CleanupTempImagesJob] Error processing file ${file}: ${fileError instanceof Error ? fileError.message : String(fileError)}`
          );
        }
      }

      const spaceFreedMb = Math.round(spaceFreedBytes / 1024 / 1024);
      logger.info(
        `[CleanupTempImagesJob] Cleanup complete: ${filesDeleted} files deleted, ${spaceFreedMb}MB freed`
      );

      return { filesDeleted, spaceFreedMb };
    } catch (error) {
      logger.error(
        `[CleanupTempImagesJob] Job failed: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }
  }

  /**
   * Schedule job to run every 6 hours
   */
  scheduleRecurring(intervalMs: number = 6 * 60 * 60 * 1000): NodeJS.Timeout {
    logger.info(
      `[CleanupTempImagesJob] Scheduled to run every ${intervalMs / 1000 / 60 / 60} hours`
    );

    // Run immediately on startup
    this.execute().catch((err) => {
      logger.error(`[CleanupTempImagesJob] Initial execution failed: ${err}`);
    });

    // Schedule recurring
    return setInterval(() => {
      this.execute().catch((err) => {
        logger.error(`[CleanupTempImagesJob] Scheduled execution failed: ${err}`);
      });
    }, intervalMs);
  }

  /**
   * Clean up specific file (called after image processing)
   */
  async cleanupFile(filePath: string): Promise<boolean> {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.debug(`[CleanupTempImagesJob] Cleaned up: ${filePath}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.warn(
        `[CleanupTempImagesJob] Error cleaning up ${filePath}: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}
