import { describe, it, expect, beforeAll, vi } from 'vitest';
import Database from 'better-sqlite3';
import { AnalyticsService } from '../src/services/AnalyticsService';
import { Profile } from '../src/models/Profile';

// Mock global fetch
vi.stubGlobal('fetch', vi.fn());

describe('AnalyticsService', () => {
  let db: Database.Database;
  let analyticsService: AnalyticsService;
  let profileModel: Profile;
  const testEncryptionKey = 'test-encryption-key-at-least-32-characters-long-for-aes';
  const testUserId = 'test-user-123';
  const testProfileId = 'test-profile-123';

  beforeAll(() => {
    // In-memory database
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    // Create schema
    db.exec(`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        instagram_username TEXT UNIQUE NOT NULL,
        instagram_id TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at DATETIME,
        bio TEXT,
        profile_picture_url TEXT,
        followers_count INTEGER DEFAULT 0,
        context_voice TEXT,
        context_tone TEXT,
        context_audience TEXT,
        context_goals TEXT,
        autopilot_enabled BOOLEAN DEFAULT 0,
        autopilot_schedule TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE content (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        type TEXT NOT NULL,
        caption TEXT,
        hashtags TEXT,
        image_url TEXT,
        carousel_json TEXT,
        status TEXT DEFAULT 'draft',
        scheduled_at DATETIME,
        published_at DATETIME,
        instagram_post_id TEXT,
        instagram_url TEXT,
        publish_error TEXT,
        retry_count INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE insta_sessions (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        session_data TEXT NOT NULL,
        last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE metrics (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        followers_count INTEGER,
        engagement_rate REAL,
        reach INTEGER,
        impressions INTEGER,
        collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE post_metrics (
        id TEXT PRIMARY KEY,
        content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
        profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        shares INTEGER DEFAULT 0,
        saves INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_profiles_user_id ON profiles(user_id);
      CREATE INDEX idx_content_profile_id ON content(profile_id);
      CREATE INDEX idx_metrics_profile_id ON metrics(profile_id);
      CREATE INDEX idx_post_metrics_content_id ON post_metrics(content_id);
    `);

    // Create test user and profile
    const userStmt = db.prepare('INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)');
    userStmt.run(testUserId, 'test@example.com', 'hashed_password', 'Test User');

    const profileStmt = db.prepare(`
      INSERT INTO profiles (id, user_id, instagram_username, instagram_id, access_token, bio, followers_count)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    profileStmt.run(testProfileId, testUserId, 'testuser', 'insta-123', 'encrypted_token', 'Test bio', 1000);

    analyticsService = new AnalyticsService(db, 'http://localhost:5001', testEncryptionKey);
    profileModel = new Profile(db);
  });

  describe('getProfileMetrics', () => {
    it('should return null if profile not found', async () => {
      const result = await analyticsService.getProfileMetrics('non-existent', testUserId);
      expect(result).toBeNull();
    });

    it('should return null if no metrics collected', async () => {
      const result = await analyticsService.getProfileMetrics(testProfileId, testUserId);
      expect(result).toBeNull();
    });

    it('should return latest metrics for profile', async () => {
      // Insert test metrics
      const metricsStmt = db.prepare(`
        INSERT INTO metrics (id, profile_id, followers_count, engagement_rate, reach, impressions, collected_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      metricsStmt.run('metric-1', testProfileId, 1000, 4.5, 50000, 100000, now, now);

      const result = await analyticsService.getProfileMetrics(testProfileId, testUserId);

      expect(result).not.toBeNull();
      expect(result?.followers_count).toBe(1000);
      expect(result?.engagement_rate).toBe(4.5);
      expect(result?.reach).toBe(50000);
    });

    it('should throw error if user does not own profile', async () => {
      await expect(analyticsService.getProfileMetrics(testProfileId, 'other-user')).rejects.toThrow('Access denied');
    });
  });

  describe('getMetricsHistory', () => {
    it('should return empty array if no history', async () => {
      const result = await analyticsService.getMetricsHistory(testProfileId, testUserId, 30);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return historical metrics', async () => {
      const metricsStmt = db.prepare(`
        INSERT INTO metrics (id, profile_id, followers_count, engagement_rate, reach, impressions, collected_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      metricsStmt.run('metric-hist-1', testProfileId, 1000, 4.0, 50000, 100000, now, now);
      metricsStmt.run('metric-hist-2', testProfileId, 1050, 4.2, 52000, 102000, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), now);

      const result = await analyticsService.getMetricsHistory(testProfileId, testUserId, 30);

      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result[0]?.followers).toBe(1050);
    });
  });

  describe('getEngagementRate', () => {
    it('should throw if profile not found', async () => {
      await expect(analyticsService.getEngagementRate('no-metrics-profile', testUserId, 7)).rejects.toThrow('Profile no-metrics-profile not found');
    });

    it('should calculate average engagement rate', async () => {
      const metricsStmt = db.prepare(`
        INSERT INTO metrics (id, profile_id, followers_count, engagement_rate, reach, impressions, collected_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      const newProfileId = 'engagement-test-profile';

      // Create new profile for this test
      const profileStmt = db.prepare(`
        INSERT INTO profiles (id, user_id, instagram_username, instagram_id, access_token, bio, followers_count)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      profileStmt.run(newProfileId, testUserId, 'engtest', 'insta-eng-123', 'token', 'Bio', 1000);

      metricsStmt.run('eng-1', newProfileId, 1000, 5.0, 50000, 100000, now, now);
      metricsStmt.run('eng-2', newProfileId, 1100, 3.0, 52000, 102000, new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), now);

      const result = await analyticsService.getEngagementRate(newProfileId, testUserId, 7);

      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(5);
    });
  });
});
