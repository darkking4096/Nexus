/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { PublishService } from '../PublishService';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Mock PlaywrightService
vi.mock('../PlaywrightService', () => ({
  PlaywrightService: vi.fn().mockImplementation(() => ({
    initialize: vi.fn(),
    loadSession: vi.fn(),
    publishPhoto: vi.fn(),
    publishCarousel: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock InstaService
vi.mock('../InstaService', () => ({
  InstaService: vi.fn().mockImplementation(() => ({
    getDecryptedSession: vi.fn().mockReturnValue({
      cookies: { session_id: 'test_session_value' },
    }),
  })),
}));

describe('PublishService', () => {
  let publishService: PublishService;
  let db: Database.Database;
  const testDbPath = path.join(process.cwd(), '.test-publish-service.db');
  const testEncryptionKey = 'test-encryption-key-32chars!!!!!';

  beforeAll(() => {
    // Create test database
    db = new Database(testDbPath);

    // Create test tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        username TEXT NOT NULL,
        instagram_session TEXT
      );

      CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        type TEXT NOT NULL,
        caption TEXT,
        hashtags TEXT,
        image_url TEXT,
        carousel_json TEXT,
        status TEXT DEFAULT 'draft',
        instagram_post_id TEXT,
        instagram_url TEXT,
        publish_error TEXT,
        retry_count INTEGER DEFAULT 0,
        published_at TEXT,
        updated_at TEXT,
        created_at TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id)
      );

      CREATE TABLE IF NOT EXISTS publish_logs (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        content_id TEXT NOT NULL,
        action TEXT,
        status TEXT,
        error_message TEXT,
        timestamp TEXT,
        FOREIGN KEY (profile_id) REFERENCES profiles(id),
        FOREIGN KEY (content_id) REFERENCES content(id)
      );
    `);

    // Insert test profile
    db.prepare(`
      INSERT INTO profiles (id, user_id, username, instagram_session)
      VALUES (?, ?, ?, ?)
    `).run('profile_123', 'user_123', 'test_user', JSON.stringify({
      cookies: { session_id: 'test_session_value' },
    }));

    // Initialize service
    publishService = new PublishService(db, testEncryptionKey);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('Single Photo Publishing', () => {
    it('should publish a single photo successfully', async () => {
      // Insert test content
      const contentId = 'content_single_photo_123';
      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'profile_123', 'photo', 'Test caption', '/path/to/image.jpg', 'draft', new Date().toISOString(), new Date().toISOString());

      // Mock successful publish
      const { PlaywrightService } = await import('../PlaywrightService');
      const mockInstance = vi.mocked(PlaywrightService).mock.results[0]?.value;
      if (mockInstance) {
        vi.mocked(mockInstance.publishPhoto).mockResolvedValueOnce({
          postId: 'insta_post_123',
          url: 'https://instagram.com/p/insta_post_123/',
          timestamp: new Date().toISOString(),
        });
      }

      // Test
      const result = await publishService.publish(contentId, 'profile_123');

      // Verify response
      expect(result.content_id).toBe(contentId);
      expect(result.instagram_post_id).toBe('insta_post_123');
      expect(result.instagram_url).toBe('https://instagram.com/p/insta_post_123/');
      expect(result.status).toBe('published');

      // Verify database update
      const published = db.prepare('SELECT * FROM content WHERE id = ?').get(contentId) as any;
      expect(published.status).toBe('published');
      expect(published.instagram_post_id).toBe('insta_post_123');
      expect(published.published_at).toBeTruthy();
    });
  });

  describe('Carousel Publishing', () => {
    it('should publish a carousel with multiple images successfully', async () => {
      // Insert test content with carousel
      const contentId = 'content_carousel_123';
      const carouselJson = JSON.stringify({
        images: ['/path/to/image1.jpg', '/path/to/image2.jpg', '/path/to/image3.jpg'],
      });

      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, carousel_json, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'profile_123', 'carousel', 'Test carousel caption', carouselJson, 'draft', new Date().toISOString(), new Date().toISOString());

      // Mock successful carousel publish
      const { PlaywrightService } = await import('../PlaywrightService');
      const mockInstance = vi.mocked(PlaywrightService).mock.results[0]?.value;
      if (mockInstance) {
        vi.mocked(mockInstance.publishCarousel).mockResolvedValueOnce({
          postId: 'insta_carousel_123',
          url: 'https://instagram.com/p/insta_carousel_123/',
          timestamp: new Date().toISOString(),
        });
      }

      // Test
      const result = await publishService.publish(contentId, 'profile_123');

      // Verify response
      expect(result.content_id).toBe(contentId);
      expect(result.instagram_post_id).toBe('insta_carousel_123');
      expect(result.status).toBe('published');

      // Verify database update
      const published = db.prepare('SELECT * FROM content WHERE id = ?').get(contentId) as any;
      expect(published.status).toBe('published');
      expect(published.instagram_post_id).toBe('insta_carousel_123');
    });
  });

  describe('Error Handling & Retry', () => {
    it('should handle publish failure and update error status', async () => {
      // Insert test content
      const contentId = 'content_fail_123';
      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'profile_123', 'photo', 'Test caption', '/path/to/image.jpg', 'draft', new Date().toISOString(), new Date().toISOString());

      // Mock failure
      const { PlaywrightService } = await import('../PlaywrightService');
      const mockInstance = vi.mocked(PlaywrightService).mock.results[0]?.value;
      if (mockInstance) {
        vi.mocked(mockInstance.publishPhoto).mockRejectedValueOnce(new Error('Instagram rate limit exceeded'));
      }

      // Test - should throw
      await expect(publishService.publish(contentId, 'profile_123')).rejects.toThrow(
        'Failed to publish content'
      );

      // Verify error is logged in database
      const logs = db.prepare('SELECT * FROM publish_logs WHERE content_id = ?').all(contentId) as any[];
      expect(logs.length).toBeGreaterThan(0);
      expect(logs.some((log) => log.action === 'FAILED')).toBe(true);

      // Verify error is stored
      const failed = db.prepare('SELECT * FROM content WHERE id = ?').get(contentId) as any;
      expect(failed.status).toBe('error');
      expect(failed.publish_error).toBeTruthy();
      expect(failed.retry_count).toBeGreaterThan(0);
    });
  });

  describe('Ownership Validation', () => {
    it('should reject publishing if content does not belong to profile', async () => {
      // Insert test content with different profile
      const contentId = 'content_wrong_profile_123';
      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'other_profile_id', 'photo', 'Test caption', '/path/to/image.jpg', 'draft', new Date().toISOString(), new Date().toISOString());

      // Test - should throw ownership error
      await expect(publishService.publish(contentId, 'profile_123')).rejects.toThrow(
        'Content does not belong to this profile'
      );
    });
  });

  describe('Content Not Found', () => {
    it('should throw error if content does not exist', async () => {
      // Test with non-existent content ID
      await expect(publishService.publish('non_existent_id', 'profile_123')).rejects.toThrow(
        'not found'
      );
    });
  });

  describe('Session Decryption', () => {
    it('should handle session decryption errors gracefully', async () => {
      // Insert test content
      const contentId = 'content_session_error_123';
      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'profile_123', 'photo', 'Test caption', '/path/to/image.jpg', 'draft', new Date().toISOString(), new Date().toISOString());

      // Mock session decryption error
      const { InstaService } = await import('../InstaService');
      const mockInstance = vi.mocked(InstaService).mock.results[0]?.value;
      if (mockInstance) {
        vi.mocked(mockInstance.getDecryptedSession).mockImplementationOnce(() => {
          throw new Error('Session decryption failed');
        });
      }

      // Test
      await expect(publishService.publish(contentId, 'profile_123')).rejects.toThrow(
        'Cannot access Instagram session'
      );
    });
  });

  describe('Logging', () => {
    it('should log publish attempts in publish_logs table', async () => {
      // Insert test content
      const contentId = 'content_logging_123';
      db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, image_url, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(contentId, 'profile_123', 'photo', 'Test caption', '/path/to/image.jpg', 'draft', new Date().toISOString(), new Date().toISOString());

      // Mock successful publish
      const { PlaywrightService } = await import('../PlaywrightService');
      const mockInstance = vi.mocked(PlaywrightService).mock.results[0]?.value;
      if (mockInstance) {
        vi.mocked(mockInstance.publishPhoto).mockResolvedValueOnce({
          postId: 'insta_post_logging_123',
          url: 'https://instagram.com/p/insta_post_logging_123/',
          timestamp: new Date().toISOString(),
        });
      }

      // Publish
      await publishService.publish(contentId, 'profile_123');

      // Verify logs
      const logs = db.prepare('SELECT * FROM publish_logs WHERE content_id = ?').all(contentId) as any[];
      expect(logs.length).toBeGreaterThanOrEqual(2); // START and PUBLISHED
      expect(logs.some((log) => log.action === 'START')).toBe(true);
      expect(logs.some((log) => log.action === 'PUBLISHED')).toBe(true);
    });
  });
});
