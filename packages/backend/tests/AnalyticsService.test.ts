import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createMockDatabase } from './helpers/test-db';
import type { DatabaseAdapter } from '../src/config/database';
import { AnalyticsService } from '../src/services/AnalyticsService';
import { Profile } from '../src/models/Profile';

// Mock global fetch
vi.stubGlobal('fetch', vi.fn());

describe('AnalyticsService', () => {
  let db: DatabaseAdapter;
  let analyticsService: AnalyticsService;
  let profileModel: Profile;
  const testEncryptionKey = 'test-encryption-key-at-least-32-characters-long-for-aes';
  const testUserId = 'test-user-123';
  const testProfileId = 'test-profile-123';

  beforeAll(() => {
    // Use mock database for testing
    db = createMockDatabase();

    // NOTE: Schema setup has been moved to database initialization (Story 8.1.1)
    // Test data would be created via async queries in a real test database

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
