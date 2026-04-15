import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { DashboardService } from '../DashboardService.js';
import { AnalyticsService } from '../AnalyticsService.js';

describe('DashboardService', () => {
  let db: Database.Database;
  let analyticsService: AnalyticsService;
  let dashboardService: DashboardService;
  const testUserId = 'user-123';
  const profile1Id = 'profile-1';
  const profile2Id = 'profile-2';
  const profile3Id = 'profile-3';

  beforeEach(() => {
    // Create in-memory database
    db = new Database(':memory:');
    setupDatabase(db);

    // Insert test profiles
    insertTestProfile(db, profile1Id, testUserId, 'profile_one');
    insertTestProfile(db, profile2Id, testUserId, 'profile_two');
    insertTestProfile(db, profile3Id, testUserId, 'profile_three');

    // Create services
    analyticsService = new AnalyticsService(db, 'http://localhost:5001', 'test-key');
    dashboardService = new DashboardService(db, analyticsService);
  });

  describe('getDashboardOverview', () => {
    it('should aggregate metrics from all profiles', async () => {
      // Setup - insert metrics for 3 profiles
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });
      insertTestMetrics(db, profile2Id, { followers_count: 2000, engagement_rate: 7.0, reach: 10000, impressions: 15000 });
      insertTestMetrics(db, profile3Id, { followers_count: 1500, engagement_rate: 6.0, reach: 7500, impressions: 12000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify aggregation
      expect(overview.profiles).toHaveLength(3);
      expect(overview.total_followers).toBe(4500); // 1000 + 2000 + 1500
      expect(overview.avg_engagement).toBeCloseTo(6.0, 1); // (5 + 7 + 6) / 3
    });

    it('should calculate weekly growth correctly', async () => {
      // Setup - insert metrics from 7 days ago and today
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      insertTestMetricsWithDate(db, profile1Id, {
        followers_count: 900,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, sevenDaysAgo.toISOString());

      insertTestMetrics(db, profile1Id, {
        followers_count: 1000,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - weekly growth = 1000 - 900 = 100
      expect(overview.profiles[0].weekly_growth).toBe(100);
    });

    it('should count posts from last 30 days', async () => {
      // Setup - insert posts from various dates
      for (let i = 0; i < 5; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        insertTestPostMetricsWithDate(db, profile1Id, `post-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 20,
          reach: 1000,
        }, date.toISOString());
      }

      // Also insert a post from 40 days ago (should not be counted)
      const longAgo = new Date();
      longAgo.setDate(longAgo.getDate() - 40);
      insertTestPostMetricsWithDate(db, profile1Id, 'post-old', {
        likes: 100,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 1000,
      }, longAgo.toISOString());

      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - only 5 posts from last 30 days
      expect(overview.profiles[0].posts_30d).toBe(5);
    });

    it('should include last post date', async () => {
      // Setup
      const now = new Date().toISOString();
      insertTestPostMetricsWithDate(db, profile1Id, 'post-1', {
        likes: 100,
        comments: 10,
        shares: 5,
        saves: 20,
        reach: 1000,
      }, now);

      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify
      expect(overview.profiles[0].last_post_date).toBeDefined();
      expect(overview.profiles[0].last_post_date).not.toBeNull();
    });

    it('should return empty when user has no profiles', async () => {
      // Execute
      const overview = await dashboardService.getDashboardOverview('non-existent-user', 'engagement');

      // Verify
      expect(overview.profiles).toHaveLength(0);
      expect(overview.total_followers).toBe(0);
      expect(overview.avg_engagement).toBe(0);
      expect(overview.total_posts_30d).toBe(0);
    });

    it('should sort profiles by engagement', async () => {
      // Setup
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 3.0, reach: 5000, impressions: 8000 });
      insertTestMetrics(db, profile2Id, { followers_count: 2000, engagement_rate: 8.0, reach: 10000, impressions: 15000 });
      insertTestMetrics(db, profile3Id, { followers_count: 1500, engagement_rate: 5.0, reach: 7500, impressions: 12000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - sorted by engagement descending
      expect(overview.profiles[0].engagement_rate).toBe(8.0); // profile_two
      expect(overview.profiles[1].engagement_rate).toBe(5.0); // profile_three
      expect(overview.profiles[2].engagement_rate).toBe(3.0); // profile_one
    });

    it('should sort profiles by followers', async () => {
      // Setup
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });
      insertTestMetrics(db, profile2Id, { followers_count: 3000, engagement_rate: 7.0, reach: 10000, impressions: 15000 });
      insertTestMetrics(db, profile3Id, { followers_count: 2000, engagement_rate: 6.0, reach: 7500, impressions: 12000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'followers');

      // Verify - sorted by followers descending
      expect(overview.profiles[0].followers).toBe(3000); // profile_two
      expect(overview.profiles[1].followers).toBe(2000); // profile_three
      expect(overview.profiles[2].followers).toBe(1000); // profile_one
    });

    it('should sort profiles by growth', async () => {
      // Setup - set different growth rates
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      insertTestMetricsWithDate(db, profile1Id, {
        followers_count: 900,
        engagement_rate: 5.0,
        reach: 5000,
        impressions: 8000,
      }, sevenDaysAgo.toISOString());
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      insertTestMetricsWithDate(db, profile2Id, {
        followers_count: 1800,
        engagement_rate: 7.0,
        reach: 10000,
        impressions: 15000,
      }, sevenDaysAgo.toISOString());
      insertTestMetrics(db, profile2Id, { followers_count: 2100, engagement_rate: 7.0, reach: 10000, impressions: 15000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'growth');

      // Verify - sorted by growth descending
      // profile_two: 2100 - 1800 = 300, profile_one: 1000 - 900 = 100
      expect(overview.profiles[0].weekly_growth).toBe(300);
      expect(overview.profiles[1].weekly_growth).toBe(100);
    });

    it('should calculate total posts from all profiles', async () => {
      // Setup - insert posts for different profiles
      for (let i = 0; i < 3; i++) {
        insertTestPostMetrics(db, profile1Id, `profile1-post-${i}`, {
          likes: 100,
          comments: 10,
          shares: 5,
          saves: 20,
          reach: 1000,
        });
      }

      for (let i = 0; i < 2; i++) {
        insertTestPostMetrics(db, profile2Id, `profile2-post-${i}`, {
          likes: 150,
          comments: 15,
          shares: 7,
          saves: 25,
          reach: 1500,
        });
      }

      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });
      insertTestMetrics(db, profile2Id, { followers_count: 2000, engagement_rate: 7.0, reach: 10000, impressions: 15000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - total 5 posts (3 + 2)
      expect(overview.total_posts_30d).toBe(5);
    });

    it('should cache results for 15 minutes', async () => {
      // Setup
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute twice with same parameters
      const result1 = await dashboardService.getDashboardOverview(testUserId, 'engagement');
      const result2 = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - results should be identical (from cache)
      expect(result1.total_followers).toBe(result2.total_followers);
      expect(result1.profiles).toEqual(result2.profiles);
    });

    it('should use display_name if available', async () => {
      // Setup - update profile with display_name
      db.prepare(`UPDATE profiles SET display_name = ? WHERE id = ?`).run('Marina Estela', profile1Id);
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify
      expect(overview.profiles[0].name).toBe('Marina Estela');
    });

    it('should fall back to instagram_username if display_name is null', async () => {
      // Setup
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute
      const overview = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - uses instagram_username
      expect(overview.profiles[0].name).toBe('profile_one');
    });
  });

  describe('Cache clearing', () => {
    it('should clear cache when clearCache is called', async () => {
      // Setup
      insertTestMetrics(db, profile1Id, { followers_count: 1000, engagement_rate: 5.0, reach: 5000, impressions: 8000 });

      // Execute - get result once to cache it
      const result1 = await dashboardService.getDashboardOverview(testUserId, 'engagement');
      expect(result1.profiles[0].followers).toBe(1000);

      // Clear cache
      dashboardService.clearCache();

      // Update metrics
      insertTestMetrics(db, profile1Id, { followers_count: 1100, engagement_rate: 5.5, reach: 5500, impressions: 8500 });

      // Get result again - should fetch new data
      const result2 = await dashboardService.getDashboardOverview(testUserId, 'engagement');

      // Verify - second result has updated data
      expect(result2.profiles[0].followers).toBe(1100);
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
      display_name TEXT,
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
  userId: string,
  username: string
): void {
  const now = new Date().toISOString();
  db.prepare(`
    INSERT INTO profiles (id, user_id, instagram_username, followers_count, updated_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(profileId, userId, username, 0, now, now);
}

function insertTestMetrics(
  db: Database.Database,
  profileId: string,
  data: {
    followers_count: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  }
): void {
  insertTestMetricsWithDate(db, profileId, data, new Date().toISOString());
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

function insertTestPostMetrics(
  db: Database.Database,
  profileId: string,
  postId: string,
  data: {
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
  }
): void {
  insertTestPostMetricsWithDate(db, profileId, postId, data, new Date().toISOString());
}

function insertTestPostMetricsWithDate(
  db: Database.Database,
  profileId: string,
  postId: string,
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
  db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves, reach, collected_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, postId, profileId, data.likes, data.comments, data.shares, data.saves, data.reach, date, date);
}
