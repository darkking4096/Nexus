import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { ContentMetricsService } from '../ContentMetricsService.js';
import { AnalyticsService } from '../AnalyticsService.js';

describe('ContentMetricsService', () => {
  let db: Database.Database;
  let analyticsService: AnalyticsService;
  let contentMetricsService: ContentMetricsService;
  const testUserId = 'user-123';
  const testProfileId = 'profile-456';
  const testContentId = 'content-789';

  beforeEach(() => {
    // Create in-memory database
    db = new Database(':memory:');
    setupDatabase(db);

    // Insert test profile
    insertTestProfile(db, testProfileId, testUserId);

    // Create services
    analyticsService = new AnalyticsService(db, 'http://localhost:5001', 'test-key');
    contentMetricsService = new ContentMetricsService(db, analyticsService);
  });

  describe('getPostMetricsWithHistory', () => {
    it('should return current metrics for a post', async () => {
      // Setup
      insertTestPostMetrics(db, testProfileId, testContentId, {
        likes: 450,
        comments: 32,
        shares: 8,
        saves: 120,
        reach: 5200,
      });

      // Execute
      const metrics = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify
      expect(metrics.id).toBe(testContentId);
      expect(metrics.content_id).toBe(testContentId);
      expect(metrics.profile_id).toBe(testProfileId);
      expect(metrics.current_metrics.likes).toBe(450);
      expect(metrics.current_metrics.comments).toBe(32);
      expect(metrics.current_metrics.shares).toBe(8);
      expect(metrics.current_metrics.saves).toBe(120);
      expect(metrics.current_metrics.reach).toBe(5200);
    });

    it('should calculate engagement rate correctly', async () => {
      // Setup - likes + comments + shares = 450 + 32 + 8 = 490
      // engagement_rate = 490 / 5200 * 100 = 9.42%
      insertTestPostMetrics(db, testProfileId, testContentId, {
        likes: 450,
        comments: 32,
        shares: 8,
        saves: 120,
        reach: 5200,
      });

      // Execute
      const metrics = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify
      expect(metrics.current_metrics.engagement_rate).toBeCloseTo(9.4, 1);
    });

    it('should include content details (media type, posted_at)', async () => {
      // Setup
      const now = new Date().toISOString();
      insertTestContent(db, testContentId, testProfileId, 'carousel', now);
      insertTestPostMetrics(db, testProfileId, testContentId, {
        likes: 450,
        comments: 32,
        shares: 8,
        saves: 120,
        reach: 5200,
      });

      // Execute
      const metrics = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify
      expect(metrics.media_type).toBe('carousel');
      expect(metrics.posted_at).toBe(now);
    });

    it('should return historical metrics (daily snapshots)', async () => {
      // Setup - insert metrics for 5 different days
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (4 - i)); // 4 days ago to today
        insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
          likes: 100 + i * 50,
          comments: 10 + i * 5,
          shares: 5 + i * 2,
          saves: 30 + i * 10,
          reach: 2000 + i * 500,
        }, date.toISOString());
      }

      // Execute
      const metrics = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify - should have 5 historical entries
      expect(metrics.historical.length).toBe(5);
      expect(metrics.historical[0].likes).toBe(100); // Oldest
      expect(metrics.historical[4].likes).toBe(300); // Newest
    });

    it('should calculate historical engagement rates', async () => {
      // Setup
      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 150,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 2500,
      }, new Date().toISOString());

      // Execute
      const metrics = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify - engagement = (150 + 10 + 5) / 2500 * 100 = 6.6%
      expect(metrics.historical[0].engagement_rate).toBeCloseTo(6.6, 1);
    });

    it('should deny access if user does not own profile', async () => {
      // Setup
      insertTestPostMetrics(db, testProfileId, testContentId, {
        likes: 450,
        comments: 32,
        shares: 8,
        saves: 120,
        reach: 5200,
      });

      // Execute & Verify
      await expect(
        contentMetricsService.getPostMetricsWithHistory(
          testContentId,
          testProfileId,
          'different-user',
          7
        )
      ).rejects.toThrow('Access denied');
    });

    it('should throw error if post metrics not found', async () => {
      // Execute & Verify
      await expect(
        contentMetricsService.getPostMetricsWithHistory(
          'non-existent',
          testProfileId,
          testUserId,
          7
        )
      ).rejects.toThrow('Post metrics not found');
    });

    it('should respect days parameter (max 90)', async () => {
      // Setup - insert metrics from 100 days ago
      const longAgo = new Date();
      longAgo.setDate(longAgo.getDate() - 100);
      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 100,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 2000,
      }, longAgo.toISOString());

      // Insert recent metrics
      insertTestPostMetrics(db, testProfileId, testContentId, {
        likes: 500,
        comments: 50,
        shares: 20,
        saves: 100,
        reach: 10000,
      });

      // Execute with days=7
      const metrics7 = await contentMetricsService.getPostMetricsWithHistory(
        testContentId,
        testProfileId,
        testUserId,
        7
      );

      // Verify - should not include metrics from 100 days ago
      expect(metrics7.historical.length).toBe(1); // Only recent
    });
  });

  describe('getPostGrowth', () => {
    it('should calculate likes per hour', async () => {
      // Setup - insert metrics at different times
      const firstDate = new Date();
      firstDate.setHours(firstDate.getHours() - 24); // 24 hours ago

      const lastDate = new Date();

      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 100,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 2000,
      }, firstDate.toISOString());

      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 148,
        comments: 15,
        shares: 8,
        saves: 30,
        reach: 3000,
      }, lastDate.toISOString());

      // Execute
      const growth = await contentMetricsService.getPostGrowth(
        testContentId,
        testProfileId,
        testUserId
      );

      // Verify - (148 - 100) / 24 = 2 likes/hour
      expect(growth.likes_per_hour).toBeCloseTo(2, 0);
    });

    it('should calculate growth rate percentage', async () => {
      // Setup
      const firstDate = new Date();
      firstDate.setHours(firstDate.getHours() - 24);

      const lastDate = new Date();

      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 100,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 2000,
      }, firstDate.toISOString());

      insertTestPostMetricsWithDate(db, testProfileId, testContentId, {
        likes: 200,
        comments: 20,
        shares: 10,
        saves: 40,
        reach: 4000,
      }, lastDate.toISOString());

      // Execute
      const growth = await contentMetricsService.getPostGrowth(
        testContentId,
        testProfileId,
        testUserId
      );

      // Verify - (200 - 100) / 100 * 100 = 100%
      expect(growth.growth_rate).toBe('100.0%');
    });

    it('should deny access if user does not own profile', async () => {
      // Execute & Verify
      await expect(
        contentMetricsService.getPostGrowth(testContentId, testProfileId, 'different-user')
      ).rejects.toThrow('Access denied');
    });

    it('should return zero values if no metrics found', async () => {
      // Execute
      const growth = await contentMetricsService.getPostGrowth(
        'non-existent',
        testProfileId,
        testUserId
      );

      // Verify
      expect(growth.likes_per_hour).toBe(0);
      expect(growth.comments_per_hour).toBe(0);
      expect(growth.growth_rate).toBe('0%');
    });
  });
});

// Test helpers
function setupDatabase(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      instagram_username TEXT NOT NULL,
      followers_count INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      media_type TEXT,
      posted_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS post_metrics (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL,
      profile_id TEXT NOT NULL,
      likes INTEGER NOT NULL,
      comments INTEGER NOT NULL,
      shares INTEGER NOT NULL,
      saves INTEGER NOT NULL,
      reach INTEGER NOT NULL,
      collected_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
}

function insertTestProfile(
  db: Database.Database,
  profileId: string,
  userId: string
): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO profiles (id, user_id, instagram_username, followers_count, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(profileId, userId, 'test_user', 0, now, now);
}

function insertTestContent(
  db: Database.Database,
  contentId: string,
  profileId: string,
  mediaType: string,
  postedAt: string
): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO content (id, profile_id, media_type, posted_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(contentId, profileId, mediaType, postedAt, now);
}

function insertTestPostMetrics(
  db: Database.Database,
  profileId: string,
  contentId: string,
  data: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  }
): void {
  insertTestPostMetricsWithDate(db, profileId, contentId, data, new Date().toISOString());
}

function insertTestPostMetricsWithDate(
  db: Database.Database,
  profileId: string,
  contentId: string,
  data: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  },
  date: string
): void {
  const id = `post-metrics-${Date.now()}-${Math.random()}`;
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves, reach, collected_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, contentId, profileId, data.likes, data.comments, data.shares, data.saves, data.reach, date, now);
}
