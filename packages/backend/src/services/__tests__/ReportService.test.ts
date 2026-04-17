import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { ReportService } from '../ReportService.js';

describe('ReportService', () => {
  let db: Database.Database;
  let reportService: ReportService;
  const testUserId = 'user-123';
  const testProfileId = 'profile-456';

  beforeEach(() => {
    // Create in-memory database
    db = new Database(':memory:');
    setupDatabase(db);

    // Insert test profile
    insertTestProfile(db, testProfileId, testUserId);

    // Create service
    reportService = new ReportService(db);
  });

  describe('generateReport', () => {
    it('should generate report for a period', async () => {
      // Setup - insert metrics for a period
      const startDate = '2026-04-01T00:00:00Z';
      const endDate = '2026-04-30T23:59:59Z';

      // Insert follower metrics
      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1000,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, '2026-03-25T00:00:00Z');

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1420,
        engagement_rate: 5.5,
        reach: 6000,
        impressions: 9000,
      }, '2026-04-30T23:59:59Z');

      // Insert posts
      for (let i = 0; i < 5; i++) {
        const date = new Date(2026, 3, 5 + i); // April 5-9
        insertTestContent(db, `post-${i}`, testProfileId, 'carousel', date.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 100 + i * 20,
          comments: 10 + i * 2,
          shares: 5 + i,
          saves: 20 + i * 5,
          reach: 1000 + i * 200,
        }, date.toISOString());
      }

      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, startDate, endDate);

      // Verify
      expect(report.profile_id).toBe(testProfileId);
      expect(report.period).toContain('april');
      expect(report.date_range.start).toBe(startDate);
      expect(report.date_range.end).toBe(endDate);
      expect(report.summary).toBeDefined();
      expect(report.summary.followers_gained).toBeGreaterThan(0);
      expect(report.summary.posts_published).toBe(5);
    });

    it('should calculate followers gained correctly', async () => {
      // Setup
      const startDate = '2026-04-01T00:00:00Z';
      const endDate = '2026-04-30T23:59:59Z';

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1000,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, '2026-03-31T00:00:00Z');

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1500,
        engagement_rate: 5.5,
        reach: 6000,
        impressions: 9000,
      }, '2026-04-30T23:59:59Z');

      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, startDate, endDate);

      // Verify - gained 500 followers
      expect(report.summary.followers_gained).toBe(500);
      expect(report.summary.followers_growth_pct).toBe(50); // 500/1000 = 50%
    });

    it('should include top and bottom posts', async () => {
      // Setup
      const startDate = '2026-04-01T00:00:00Z';
      const endDate = '2026-04-30T23:59:59Z';

      const baseDate = new Date(2026, 3, 15); // April 15

      // High engagement post
      insertTestContent(db, 'top-post', testProfileId, 'carousel', baseDate.toISOString());
      insertTestPostMetricsWithDate(db, testProfileId, 'top-post', {
        likes: 500,
        comments: 50,
        shares: 25,
        saves: 100,
        reach: 5000,
      }, baseDate.toISOString());

      // Low engagement post
      insertTestContent(db, 'bottom-post', testProfileId, 'post', baseDate.toISOString());
      insertTestPostMetricsWithDate(db, testProfileId, 'bottom-post', {
        likes: 50,
        comments: 5,
        shares: 2,
        saves: 10,
        reach: 1000,
      }, baseDate.toISOString());

      // Medium posts to fill
      for (let i = 0; i < 5; i++) {
        insertTestContent(db, `medium-${i}`, testProfileId, 'reel', baseDate.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `medium-${i}`, {
          likes: 200,
          comments: 20,
          shares: 10,
          saves: 40,
          reach: 2500,
        }, baseDate.toISOString());
      }

      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, startDate, endDate);

      // Verify
      expect(report.top_posts.length).toBe(3);
      expect(report.bottom_posts.length).toBe(3);
      expect(report.top_posts[0].content_id).toBe('top-post');
      expect(report.bottom_posts[0].content_id).toBe('bottom-post');
    });

    it('should calculate comparison with previous period', async () => {
      // Setup - create two periods
      const currentStart = '2026-04-01';
      const currentEnd = '2026-04-30';

      // Previous period: 1000 to 1100 followers (100 gained, 10%)
      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1000,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, '2026-02-28T00:00:00Z');

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1100,
        engagement_rate: 5.0,
        reach: 5500,
        impressions: 8800,
      }, '2026-03-31T23:59:59Z');

      // Current period: 1100 to 1500 followers (400 gained, 36%)
      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1500,
        engagement_rate: 6.0,
        reach: 7000,
        impressions: 10000,
      }, '2026-04-30T23:59:59Z');

      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, currentStart, currentEnd);

      // Verify
      expect(report.vs_previous_period).toBeDefined();
      expect(report.vs_previous_period.followers_gain_delta).toContain('+');
      expect(report.vs_previous_period.engagement_delta).toContain('+');
    });

    it('should deny access if user does not own profile', async () => {
      // Execute & Verify
      await expect(
        reportService.generateReport(testProfileId, 'different-user', '2026-04-01', '2026-04-30')
      ).rejects.toThrow('Access denied');
    });

    it('should generate insights from data', async () => {
      // Setup
      const startDate = '2026-04-01T00:00:00Z';
      const endDate = '2026-04-30T23:59:59Z';

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1000,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, '2026-03-31T00:00:00Z');

      insertTestMetricsWithDate(db, testProfileId, {
        followers_count: 1200,
        engagement_rate: 8.0,
        reach: 7000,
        impressions: 10000,
      }, '2026-04-30T23:59:59Z');

      const baseDate = new Date(2026, 3, 15);

      for (let i = 0; i < 5; i++) {
        insertTestContent(db, `post-${i}`, testProfileId, 'carousel', baseDate.toISOString());
        insertTestPostMetricsWithDate(db, testProfileId, `post-${i}`, {
          likes: 200 + i * 50,
          comments: 20 + i * 5,
          shares: 10 + i * 2,
          saves: 40 + i * 10,
          reach: 2500 + i * 500,
        }, baseDate.toISOString());
      }

      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, startDate, endDate);

      // Verify
      expect(report.key_insights).toBeDefined();
      expect(report.key_insights.length).toBeGreaterThan(0);
      expect(report.key_insights.some((i) => i.includes('Crescimento'))).toBe(true);
    });

    it('should handle reports with no data', async () => {
      // Execute
      const report = await reportService.generateReport(testProfileId, testUserId, '2026-04-01T00:00:00Z', '2026-04-30T23:59:59Z');

      // Verify
      expect(report.summary.posts_published).toBe(0);
      expect(report.top_posts.length).toBe(0);
      expect(report.bottom_posts.length).toBe(0);
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

function insertTestMetricsWithDate(
  db: Database.Database,
  profileId: string,
  data: {
    followers_count: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  },
  date: string
): void {
  const id = `metrics-${Date.now()}-${Math.random()}`;
  db.prepare(`
    INSERT INTO metrics (id, profile_id, followers_count, engagement_rate, reach, impressions, collected_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, profileId, data.followers_count, data.engagement_rate, data.reach, data.impressions, date, date);
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
