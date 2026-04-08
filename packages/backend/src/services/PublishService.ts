import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { PlaywrightService, PublishResult } from './PlaywrightService.js';
import { InstaService } from './InstaService.js';
import { retryWithBackoff } from '../utils/retry.js';

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
}

export class PublishService {
  private encryptionKey: string;
  private instaService: InstaService;

  constructor(private db: Database.Database, encryptionKey?: string) {
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

      // Determine image paths
      const imagePaths = this.getImagePaths(content);
      if (imagePaths.length === 0) {
        throw new Error('No images to publish');
      }

      // Initialize Playwright and load session
      playwrightService = new PlaywrightService(
        process.env.HEADLESS !== 'false' // Default: headless
      );
      await playwrightService.initialize();
      await playwrightService.loadSession(sessionData);

      // Publish with retry logic
      let publishResult: PublishResult;
      if (imagePaths.length === 1) {
        publishResult = await retryWithBackoff(
          () => playwrightService!.publishPhoto(imagePaths[0], content.caption),
          {
            maxAttempts: 3,
            baseDelayMs: 30000, // 30 seconds base
            maxDelayMs: 120000, // Max 2 minutes
          }
        );
      } else {
        publishResult = await retryWithBackoff(
          () => playwrightService!.publishCarousel(imagePaths, content.caption),
          {
            maxAttempts: 3,
            baseDelayMs: 30000,
            maxDelayMs: 120000,
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
}
