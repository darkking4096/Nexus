import type { DatabaseAdapter } from '../config/database';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { PlaywrightService, PublishResult } from './PlaywrightService.js';
import { InstaService } from './InstaService.js';
import { retryWithBackoff } from '../utils/retry.js';
import { isTransientError } from '../utils/error-classifier.js';

/**
 * Content data from database
 */
export interface ContentData {
  id: string;
  profile_id: string;
  type: string;
  caption: string;
  hashtags: string | null;
  image_url: string;
  carousel_json: string | null;
  status: string;
}

/**
 * Publish result with tracking
 */
export interface PublishResponse {
  content_id: string;
  instagram_post_id: string;
  instagram_url: string;
  status: string;
  published_at: string;
  carousel_slide_ids?: string[];
}

export class PublishService {
  private encryptionKey: string;
  private instaService: InstaService;

  constructor(private db: DatabaseAdapter, encryptionKey?: string) {
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY || '';
    this.instaService = new InstaService(db, undefined, this.encryptionKey);

    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
  }

  /**
   * Publish content to Instagram
   *
   * @param contentId Content ID to publish
   * @param profileId Instagram profile ID
   * @returns Publication result
   */
  async publish(contentId: string, profileId: string): Promise<PublishResponse> {
    const content = this.getContent(contentId);
    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    if (content.profile_id !== profileId) {
      throw new Error('Content does not belong to this profile');
    }

    // Log attempt start
    this.logAttempt(profileId, contentId, 'START', 'Publishing started');

    let playwrightService: PlaywrightService | null = null;

    try {
      // Get decrypted session
      const sessionData = this.getDecryptedSession(profileId);

      // Determine content type and validate accordingly
      let publishResult: PublishResult;

      // Initialize Playwright and load session
      playwrightService = new PlaywrightService(
        process.env.HEADLESS !== 'false' // Default: headless
      );
      await playwrightService.initialize();
      await playwrightService.loadSession(sessionData);

      // Handle carousel content
      if (content.type === 'carousel') {
        const carouselPaths = this.getCarouselPaths(content);
        await this.validateCarousel(carouselPaths);

        publishResult = await retryWithBackoff(
          () => playwrightService!.publishCarousel(carouselPaths, content.caption),
          {
            maxAttempts: 3,
            baseDelayMs: 30000,
            maxDelayMs: 120000,
            jitterPercent: 10,
            isTransientError,
            onRetry: (attemptNum, error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              this.logAttempt(
                profileId,
                contentId,
                `RETRY-${attemptNum}`,
                `Attempt ${attemptNum + 1}/3: ${errorMsg}`
              );
            },
          }
        );
      }
      // Handle story content
      else if (content.type === 'story') {
        if (!content.image_url) {
          throw new Error('Story has no image');
        }
        await this.validateStory(content.image_url);

        publishResult = await retryWithBackoff(
          () => playwrightService!.publishStory(content.image_url),
          {
            maxAttempts: 3,
            baseDelayMs: 30000,
            maxDelayMs: 120000,
            jitterPercent: 10,
            isTransientError,
            onRetry: (attemptNum, error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              this.logAttempt(
                profileId,
                contentId,
                `RETRY-${attemptNum}`,
                `Attempt ${attemptNum + 1}/3: ${errorMsg}`
              );
            },
          }
        );
      }
      // Handle single photo (default)
      else {
        const imagePaths = this.getImagePaths(content);
        if (imagePaths.length === 0) {
          throw new Error('No images to publish');
        }

        publishResult = await retryWithBackoff(
          () => playwrightService!.publishPhoto(imagePaths[0], content.caption),
          {
            maxAttempts: 3,
            baseDelayMs: 30000,
            maxDelayMs: 120000,
            jitterPercent: 10,
            isTransientError,
            onRetry: (attemptNum, error) => {
              const errorMsg = error instanceof Error ? error.message : String(error);
              this.logAttempt(
                profileId,
                contentId,
                `RETRY-${attemptNum}`,
                `Attempt ${attemptNum + 1}/3: ${errorMsg}`
              );
            },
          }
        );
      }

      // Update content in database
      const now = new Date().toISOString();
      const stmt = this.db.prepare(`
        UPDATE content SET
          instagram_post_id = ?,
          instagram_url = ?,
          status = 'published',
          published_at = ?,
          updated_at = ?
        WHERE id = ?
      `);
      stmt.run(publishResult.postId, publishResult.url, now, now, contentId);

      // Log success
      this.logAttempt(profileId, contentId, 'PUBLISHED', `Post ID: ${publishResult.postId}`);

      return {
        content_id: contentId,
        instagram_post_id: publishResult.postId,
        instagram_url: publishResult.url,
        status: 'published',
        published_at: now,
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);

      // Increment retry count
      this.incrementRetryCount(contentId);

      // Log failure
      this.logAttempt(profileId, contentId, 'FAILED', errorMsg);

      // Update content with error
      const stmt = this.db.prepare(`
        UPDATE content SET
          publish_error = ?,
          status = 'error',
          updated_at = ?
        WHERE id = ?
      `);
      stmt.run(errorMsg, new Date().toISOString(), contentId);

      throw new Error(`Failed to publish content: ${errorMsg}`);
    } finally {
      // Always close browser
      if (playwrightService) {
        await playwrightService.close();
      }
    }
  }

  /**
   * Get content from database
   */
  private getContent(contentId: string): ContentData | null {
    const stmt = this.db.prepare('SELECT * FROM content WHERE id = ?');
    const row = stmt.get(contentId) as ContentData | undefined;
    return row || null;
  }

  /**
   * Get decrypted session for profile
   */
  private getDecryptedSession(profileId: string): Record<string, unknown> {
    try {
      return this.instaService.getDecryptedSession(profileId);
    } catch (error) {
      throw new Error(`Cannot access Instagram session for profile: ${String(error)}`);
    }
  }

  /**
   * Determine image file paths to publish
   */
  private getImagePaths(content: ContentData): string[] {
    const paths: string[] = [];

    // Single image
    if (content.image_url) {
      paths.push(content.image_url);
    }

    // Carousel images
    if (content.carousel_json) {
      try {
        const carousel = JSON.parse(content.carousel_json) as { images: string[] };
        if (Array.isArray(carousel.images)) {
          paths.push(...carousel.images);
        }
      } catch (e) {
        console.error('Failed to parse carousel JSON:', e);
      }
    }

    return paths;
  }

  /**
   * Log publish attempt
   */
  private logAttempt(profileId: string, contentId: string, action: string, status: string): void {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO publish_logs (id, profile_id, content_id, action, status, error_message, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, profileId, contentId, action, status, null, timestamp);
  }

  /**
   * Increment retry count for content
   */
  private incrementRetryCount(contentId: string): void {
    const stmt = this.db.prepare(`
      UPDATE content SET
        retry_count = retry_count + 1,
        updated_at = ?
      WHERE id = ?
    `);
    stmt.run(new Date().toISOString(), contentId);
  }

  /**
   * Extract carousel image paths from carousel_json
   */
  private getCarouselPaths(content: ContentData): string[] {
    if (!content.carousel_json) {
      return [];
    }

    try {
      const carousel = JSON.parse(content.carousel_json) as { images?: string[] };
      return carousel.images || [];
    } catch (e) {
      throw new Error(`Failed to parse carousel JSON: ${String(e)}`);
    }
  }

  /**
   * Validate carousel structure and images
   * @param imagePaths Array of image file paths
   */
  private async validateCarousel(imagePaths: string[]): Promise<void> {
    if (imagePaths.length < 2) {
      throw new Error('Carousel needs at least 2 images');
    }

    if (imagePaths.length > 10) {
      throw new Error('Instagram allows maximum 10 carousel slides');
    }

    // Validate each image
    for (const imagePath of imagePaths) {
      this.validateImageFile(imagePath);
      await this.validateImageDimensions(imagePath);
    }
  }

  /**
   * Get actual image dimensions using Sharp
   */
  async getImageDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(imagePath).metadata();
      if (!metadata.width || !metadata.height) {
        throw new Error('Could not read image dimensions');
      }
      return {
        width: metadata.width,
        height: metadata.height,
      };
    } catch (error) {
      throw new Error(`Failed to read image dimensions for ${imagePath}: ${String(error)}`);
    }
  }

  /**
   * Validate carousel image dimensions (aspect ratio 1.91:1 ± 5% or 4:5 ± 5%)
   */
  async validateImageDimensions(imagePath: string): Promise<void> {
    const stats = fs.statSync(imagePath);
    if (!stats.isFile()) {
      throw new Error(`Image file does not exist: ${imagePath}`);
    }

    const dimensions = await this.getImageDimensions(imagePath);
    const aspectRatio = dimensions.width / dimensions.height;

    // Check landscape (1.91:1) ± 5%
    const landscape1_91Min = 1.91 * 0.95; // 1.8145
    const landscape1_91Max = 1.91 * 1.05; // 2.0055

    // Check portrait (4:5 = 0.8) ± 5%
    const portrait4_5Min = 0.8 * 0.95; // 0.76
    const portrait4_5Max = 0.8 * 1.05; // 0.84

    const isValidLandscape = aspectRatio >= landscape1_91Min && aspectRatio <= landscape1_91Max;
    const isValidPortrait = aspectRatio >= portrait4_5Min && aspectRatio <= portrait4_5Max;

    if (!isValidLandscape && !isValidPortrait) {
      throw new Error(
        `Image aspect ratio (${aspectRatio.toFixed(2)}:1) does not match Instagram carousel requirements. ` +
        `Expected 1.91:1 (±5%) or 4:5 (±5%). Image: ${dimensions.width}x${dimensions.height}`
      );
    }
  }

  /**
   * Validate carousel image file (size < 8MB, format JPEG/PNG)
   */
  private validateImageFile(imagePath: string): void {
    const stats = fs.statSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    if (stats.size > 8 * 1024 * 1024) {
      throw new Error(`Image exceeds 8MB limit: ${imagePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new Error(`Invalid image format for ${imagePath}: expected JPEG or PNG, got ${ext}`);
    }
  }

  /**
   * Validate story image (dimensions 1080x1920 ±2%, format, size < 4MB)
   */
  private async validateStory(imagePath: string): Promise<void> {
    this.validateStoryFile(imagePath);
    await this.validateStoryDimensions(imagePath);
  }

  /**
   * Validate story image dimensions (exactly 1080x1920 ±2% tolerance)
   */
  async validateStoryDimensions(imagePath: string): Promise<void> {
    const dimensions = await this.getImageDimensions(imagePath);
    const expectedWidth = 1080;
    const expectedHeight = 1920;
    const tolerance = 0.02; // 2%

    const widthTolerance = expectedWidth * tolerance;
    const heightTolerance = expectedHeight * tolerance;

    const isWidthValid = dimensions.width >= expectedWidth - widthTolerance &&
                        dimensions.width <= expectedWidth + widthTolerance;
    const isHeightValid = dimensions.height >= expectedHeight - heightTolerance &&
                         dimensions.height <= expectedHeight + heightTolerance;

    if (!isWidthValid || !isHeightValid) {
      throw new Error(
        `Story image dimensions (${dimensions.width}x${dimensions.height}) do not match Instagram story requirements. ` +
        `Expected 1080x1920 (±2% tolerance). Width tolerance: ${expectedWidth - widthTolerance}-${expectedWidth + widthTolerance}, ` +
        `Height tolerance: ${expectedHeight - heightTolerance}-${expectedHeight + heightTolerance}`
      );
    }
  }

  /**
   * Validate story image file (size < 4MB, format JPEG/PNG)
   */
  private validateStoryFile(imagePath: string): void {
    const stats = fs.statSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();

    if (stats.size > 4 * 1024 * 1024) {
      throw new Error(`Story image exceeds 4MB limit: ${imagePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      throw new Error(`Invalid image format for ${imagePath}: expected JPEG or PNG, got ${ext}`);
    }
  }

}
