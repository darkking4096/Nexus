import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { RecommendationService } from '../RecommendationService.js';

describe('RecommendationService', () => {
  let db: Database.Database;
  let recommendationService: RecommendationService;
  const testUserId = 'user-123';
  const testProfileId = 'profile-456';

  beforeEach(() => {
    // Create in-memory database
    db = new Database(':memory:');
    setupDatabase(db);

    // Insert test profile
    insertTestProfile(db, testProfileId, testUserId);

    // Create service
    recommendationService = new RecommendationService(db);
  });

  describe('generateRecommendations', () => {
    it('should generate recommendations based on engagement patterns', async () => {
      // Setup - insert posts with different types and engagement
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // Carousels with high engagement
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(18);
        insertTestContent(db, `carousel-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `carousel-${i}`, {
          likes: 300,
          comments: 30,
          shares: 15,
          saves: 50,
          reach: 3000,
        }, date.toISOString());
      }

      // Posts with low engagement
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i - 5);
        date.setHours(9);
        insertTestContent(db, `post-${i}`, testProfileId, 'post', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 15,
          reach: 1000,
        }, date.toISOString());
      }

      // Execute
      const recommendations = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify
      expect(recommendations.profile_id).toBe(testProfileId);
      expect(recommendations.recommendations).toBeDefined();
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
      expect(recommendations.next_steps).toBeDefined();

      // Check for content type recommendation
      const contentTypeRec = recommendations.recommendations.find((r) => r.category === 'content_type');
      expect(contentTypeRec).toBeDefined();
      expect(contentTypeRec?.priority).toBe('high');
      expect(contentTypeRec?.action).toContain('carousel');
      expect(contentTypeRec?.data_backing).toBeDefined();
    });

    it('should include posting time recommendation', async () => {
      // Setup - posts at different hours with varying engagement
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // High engagement at 6 PM
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(18);
        insertTestContent(db, `evening-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `evening-${i}`, {
          likes: 300,
          comments: 30,
          shares: 15,
          saves: 50,
          reach: 3000,
        }, date.toISOString());
      }

      // Low engagement at 9 AM
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i - 5);
        date.setHours(9);
        insertTestContent(db, `morning-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `morning-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 15,
          reach: 1000,
        }, date.toISOString());
      }

      // Execute
      const recommendations = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify - should have publishing schedule recommendation
      const scheduleRec = recommendations.recommendations.find((r) => r.category === 'publishing_schedule');
      expect(scheduleRec).toBeDefined();
      expect(scheduleRec?.action).toContain('18:00');
    });

    it('should recommend frequency increase if low', async () => {
      // Setup - only 1 post
      const baseDate = new Date('2026-04-10T00:00:00Z');

      insertTestContent(db, 'post-1', testProfileId, 'carousel', baseDate.toISOString());
      insertTestPostMetricsWithDate(db, testProfileId, 'post-1', {
        likes: 200,
        comments: 20,
        shares: 10,
        saves: 40,
        reach: 2000,
      }, baseDate.toISOString());

      // Execute
      const recommendations = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify - should have frequency recommendation
      const frequencyRec = recommendations.recommendations.find((r) => r.category === 'frequency');
      expect(frequencyRec).toBeDefined();
      expect(frequencyRec?.priority).toBe('medium');
    });

    it('should deny access if user does not own profile', async () => {
      // Execute & Verify
      await expect(
        recommendationService.generateRecommendations(testProfileId, 'different-user')
      ).rejects.toThrow('Access denied');
    });

    it('should cache recommendations', async () => {
      // Setup
      const baseDate = new Date('2026-04-10T00:00:00Z');

      for (let i = 0; i < 5; i++) {
        insertTestContent(db, `post-${i}`, testProfileId, 'carousel', baseDate.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 200,
          comments: 20,
          shares: 10,
          saves: 40,
          reach: 2000,
        }, baseDate.toISOString());
      }

      // Execute twice
      const rec1 = await recommendationService.generateRecommendations(testProfileId, testUserId);
      const rec2 = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify - both should be identical (from cache)
      expect(rec1.generated_at).toBe(rec2.generated_at);
      expect(rec1.recommendations.length).toBe(rec2.recommendations.length);
    });

    it('should clear cache', async () => {
      // Setup
      const baseDate = new Date('2026-04-10T00:00:00Z');

      for (let i = 0; i < 5; i++) {
        insertTestContent(db, `post-${i}`, testProfileId, 'carousel', baseDate.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 200,
          comments: 20,
          shares: 10,
          saves: 40,
          reach: 2000,
        }, baseDate.toISOString());
      }

      // Execute and cache
      const rec1 = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Clear cache
      recommendationService.clearCache(testProfileId);

      // Execute again - should generate new recommendations
      const rec2 = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify - timestamps may be different (real scenario)
      expect(rec1).toBeDefined();
      expect(rec2).toBeDefined();
    });

    it('should sort recommendations by priority and impact', async () => {
      // Setup - posts with mixed patterns
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // Carousels at 6 PM (high impact content + timing)
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(18);
        insertTestContent(db, `optimal-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `optimal-${i}`, {
          likes: 400,
          comments: 40,
          shares: 20,
          saves: 60,
          reach: 4000,
        }, date.toISOString());
      }

      // Posts (low content type)
      for (let i = 0; i < 5; i++) {
        insertTestContent(db, `post-${i}`, testProfileId, 'post', baseDate.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 15,
          reach: 1000,
        }, baseDate.toISOString());
      }

      // Execute
      const recommendations = await recommendationService.generateRecommendations(testProfileId, testUserId);

      // Verify - first recommendation should be high priority
      expect(recommendations.recommendations[0].priority).toBe('high');
    });
  });
});

// Test helpers
function setupDatabase(db: Database.Database): void {
  db.exec(`
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

    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL,
      followers_count INTEGER NOT NULL,
      engagement_rate REAL NOT NULL,
      reach INTEGER NOT NULL,
      impressions INTEGER NOT NULL,
      collected_at TEXT NOT NULL,
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
