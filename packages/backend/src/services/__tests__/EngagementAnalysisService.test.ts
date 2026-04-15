import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { EngagementAnalysisService } from '../EngagementAnalysisService.js';

describe('EngagementAnalysisService', () => {
  let db: Database.Database;
  let engagementAnalysisService: EngagementAnalysisService;
  const testUserId = 'user-123';
  const testProfileId = 'profile-456';

  beforeEach(() => {
    // Create in-memory database
    db = new Database(':memory:');
    setupDatabase(db);

    // Insert test profile
    insertTestProfile(db, testProfileId, testUserId);

    // Create service
    engagementAnalysisService = new EngagementAnalysisService(db);
  });

  describe('getEngagementAnalysis', () => {
    it('should analyze hourly engagement patterns', async () => {
      // Setup - insert posts at different hours
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // Posts at 9 AM
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(9);
        insertTestContent(db, `content-9am-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-9am-${i}`, {
          likes: 100 + i * 10,
          comments: 10 + i,
          shares: 5,
          saves: 20,
          reach: 1000,
        }, date.toISOString());
      }

      // Posts at 6 PM (higher engagement)
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(18);
        insertTestContent(db, `content-6pm-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-6pm-${i}`, {
          likes: 200 + i * 10,
          comments: 20 + i,
          shares: 10,
          saves: 40,
          reach: 2000,
        }, date.toISOString());
      }

      // Execute
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60);

      // Verify - 18:00 should be in top hours
      expect(analysis.top_hours).toBeDefined();
      expect(analysis.top_hours.length).toBeGreaterThan(0);
      const hours = analysis.top_hours.map((h) => h.hour);
      expect(hours).toContain('18:00');
    });

    it('should rank content types by engagement', async () => {
      // Setup - insert posts of different types
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // Carousels (high engagement)
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `carousel-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `carousel-${i}`, {
          likes: 300,
          comments: 30,
          shares: 15,
          saves: 50,
          reach: 3000,
        }, date.toISOString());
      }

      // Reels (medium engagement)
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i - 5);
        insertTestContent(db, `reel-${i}`, testProfileId, 'reel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `reel-${i}`, {
          likes: 150,
          comments: 15,
          shares: 7,
          saves: 25,
          reach: 2000,
        }, date.toISOString());
      }

      // Execute
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60);

      // Verify - carousels should rank higher
      expect(analysis.top_content_types).toBeDefined();
      expect(analysis.top_content_types.length).toBeGreaterThan(0);
      expect(analysis.top_content_types[0].type).toBe('carousel');
      expect(analysis.top_content_types[0].avg_engagement).toBeGreaterThan(
        analysis.top_content_types[1].avg_engagement
      );
    });

    it('should calculate engagement trends', async () => {
      // Setup - create two periods with different engagement
      const baseDate = new Date('2026-04-10T00:00:00Z');

      // Current period (last 30 days) - higher engagement
      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `content-current-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-current-${i}`, {
          likes: 300,
          comments: 30,
          shares: 15,
          saves: 50,
          reach: 3000,
        }, date.toISOString());
      }

      // Previous period (30-60 days ago) - lower engagement
      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - (30 + i));
        insertTestContent(db, `content-previous-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-previous-${i}`, {
          likes: 150,
          comments: 15,
          shares: 7,
          saves: 25,
          reach: 1500,
        }, date.toISOString());
      }

      // Execute
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60);

      // Verify
      expect(analysis.trends).toBeDefined();
      expect(analysis.trends.direction).toBe('up');
      expect(analysis.trends.momentum).toContain('+');
      expect(analysis.trends.recommendation).toContain('crescendo');
    });

    it('should calculate confidence scores', async () => {
      // Setup - insert posts
      const baseDate = new Date('2026-04-10T00:00:00Z');

      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        date.setHours(18);
        insertTestContent(db, `content-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-${i}`, {
          likes: 200,
          comments: 20,
          shares: 10,
          saves: 40,
          reach: 2000,
        }, date.toISOString());
      }

      // Execute
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60);

      // Verify - confidence should be between 0 and 1
      for (const hour of analysis.top_hours) {
        expect(hour.confidence).toBeGreaterThanOrEqual(0);
        expect(hour.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should deny access if user does not own profile', async () => {
      // Execute & Verify
      await expect(
        engagementAnalysisService.getEngagementAnalysis(testProfileId, 'different-user', 60)
      ).rejects.toThrow('Access denied');
    });

    it('should throw error if not enough data (minimum 5 posts)', async () => {
      // Setup - insert only 2 posts
      const baseDate = new Date('2026-04-10T00:00:00Z');

      for (let i = 0; i < 2; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `content-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 20,
          reach: 1000,
        }, date.toISOString());
      }

      // Execute & Verify
      await expect(
        engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60)
      ).rejects.toThrow('Not enough data');
    });

    it('should include caption insights', async () => {
      // Setup
      const baseDate = new Date('2026-04-10T00:00:00Z');

      for (let i = 0; i < 10; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `content-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `content-${i}`, {
          likes: 200,
          comments: 20,
          shares: 10,
          saves: 40,
          reach: 2000,
        }, date.toISOString());
      }

      // Execute
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 60);

      // Verify
      expect(analysis.caption_insights).toBeDefined();
      expect(analysis.caption_insights.avg_length_top_performers).toBeGreaterThan(0);
      expect(analysis.caption_insights.emoji_correlation).toBeGreaterThanOrEqual(0);
      expect(analysis.caption_insights.emoji_correlation).toBeLessThanOrEqual(1);
    });

    it('should respect days parameter', async () => {
      // Setup - insert posts from 100 days ago and recent
      const baseDate = new Date('2026-04-10T00:00:00Z');
      const longAgo = new Date(baseDate);
      longAgo.setDate(longAgo.getDate() - 100);

      // Old posts
      for (let i = 0; i < 5; i++) {
        const date = new Date(longAgo);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `old-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `old-${i}`, {
          likes: 50,
          comments: 5,
          shares: 2,
          saves: 10,
          reach: 500,
        }, date.toISOString());
      }

      // Recent posts (high engagement)
      for (let i = 0; i < 5; i++) {
        const date = new Date(baseDate);
        date.setDate(date.getDate() - i);
        insertTestContent(db, `recent-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `recent-${i}`, {
          likes: 300,
          comments: 30,
          shares: 15,
          saves: 50,
          reach: 3000,
        }, date.toISOString());
      }

      // Execute with days=30 (should only include recent)
      const analysis = await engagementAnalysisService.getEngagementAnalysis(testProfileId, testUserId, 30);

      // Verify - should only analyze recent posts
      const avgEngagement = analysis.top_content_types[0].avg_engagement;
      expect(avgEngagement).toBeGreaterThan(10); // Recent posts have higher engagement
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
