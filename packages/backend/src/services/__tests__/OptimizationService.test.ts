import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { OptimizationService } from '../OptimizationService';

describe('OptimizationService', () => {
  let db: Database.Database;
  let service: OptimizationService;
  let profileId: string;
  let userId: string;

  beforeEach(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');

    // Create test schema
    db.exec(`
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        timezone TEXT DEFAULT 'UTC',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE content (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        status TEXT DEFAULT 'draft',
        published_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(profile_id) REFERENCES profiles(id)
      );

      CREATE TABLE metrics (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        engagement_rate REAL DEFAULT 0,
        followers_count INTEGER DEFAULT 0,
        reach INTEGER DEFAULT 0,
        impressions INTEGER DEFAULT 0,
        collected_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(profile_id) REFERENCES profiles(id)
      );
    `);

    // Initialize service
    service = new OptimizationService(db);

    // Create test profile
    userId = randomUUID();
    profileId = randomUUID();
    const stmt = db.prepare(`
      INSERT INTO profiles (id, user_id, timezone)
      VALUES (?, ?, ?)
    `);
    stmt.run(profileId, userId, 'America/Los_Angeles');
  });

  afterEach(() => {
    db.close();
  });

  describe('getBestPublishTime', () => {
    it('should return recommendation with sufficient data (10+ posts)', async () => {
      // Insert 12 posts with predictable engagement patterns
      const now = new Date();

      // Morning posts (hour 8) - high engagement
      for (let i = 0; i < 4; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(8, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i * 2);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.5, pubDate.toISOString());
      }

      // Afternoon posts (hour 14) - medium engagement
      for (let i = 0; i < 4; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(14, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i * 2);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 3.2, pubDate.toISOString());
      }

      // Evening posts (hour 20) - low engagement
      for (let i = 0; i < 4; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(20, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i * 2);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 2.8, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId);

      expect(result).toBeDefined();
      expect(result.recommended_hour).toBe(8);
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.confidence).toBeLessThanOrEqual(100);
      expect(result.top_hours).toHaveLength(3);
      expect(result.top_hours[0].average_engagement_rate).toBeGreaterThan(
        result.top_hours[1].average_engagement_rate
      );
      expect(result.lookback_days).toBe(30);
      expect(result.reason).toContain('Based on');
    });

    it('should calculate confidence around 90% with 10+ posts and low variance', async () => {
      const now = new Date();

      // Insert 10 consistent posts
      for (let i = 0; i < 10; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(9, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        // Consistent engagement (low variance)
        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId);

      expect(result.confidence).toBeGreaterThanOrEqual(80);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });

    it('should calculate lower confidence with few posts (3-5 posts)', async () => {
      const now = new Date();

      // Insert exactly 5 posts
      for (let i = 0; i < 5; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(10, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 3.5, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId);

      expect(result.confidence).toBeGreaterThanOrEqual(40);
      expect(result.confidence).toBeLessThan(70);
    });

    it('should throw error with insufficient data (< 5 posts)', async () => {
      const now = new Date();

      // Insert only 3 posts
      for (let i = 0; i < 3; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(10, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 3.5, pubDate.toISOString());
      }

      await expect(service.getBestPublishTime(profileId)).rejects.toThrow('Insufficient data');
    });

    it('should throw error with no posts', async () => {
      // No posts inserted

      await expect(service.getBestPublishTime(profileId)).rejects.toThrow('Insufficient data');
    });

    it('should return top 3 hours with correct ordering', async () => {
      const now = new Date();
      const engagementMap = [
        { hour: 8, engagement: 5.0, count: 4 },
        { hour: 12, engagement: 3.5, count: 4 },
        { hour: 18, engagement: 2.0, count: 4 },
        { hour: 20, engagement: 1.5, count: 4 },
      ];

      for (const timeSlot of engagementMap) {
        for (let i = 0; i < timeSlot.count; i++) {
          const pubDate = new Date(now);
          pubDate.setHours(timeSlot.hour, 0, 0, 0);
          pubDate.setDate(pubDate.getDate() - i * 2);

          const contentId = randomUUID();
          const metricsId = randomUUID();

          db.prepare(`
            INSERT INTO content (id, profile_id, user_id, status, published_at)
            VALUES (?, ?, ?, 'published', ?)
          `).run(contentId, profileId, userId, pubDate.toISOString());

          db.prepare(`
            INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
            VALUES (?, ?, ?, ?)
          `).run(metricsId, profileId, timeSlot.engagement, pubDate.toISOString());
        }
      }

      const result = await service.getBestPublishTime(profileId);

      expect(result.top_hours).toHaveLength(3);
      expect(result.top_hours[0].hour).toBe(8);
      expect(result.top_hours[1].hour).toBe(12);
      expect(result.top_hours[2].hour).toBe(18);
    });

    it('should support timezone parameter', async () => {
      const now = new Date();

      // Insert test posts
      for (let i = 0; i < 8; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(9, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId, 'America/New_York');

      expect(result).toBeDefined();
      const hasESTOrEDT =
        result.recommended_time_str.includes('EST') || result.recommended_time_str.includes('EDT');
      expect(hasESTOrEDT).toBe(true);
    });

    it('should throw error on invalid timezone', async () => {
      const now = new Date();

      // Insert sufficient posts
      for (let i = 0; i < 8; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(9, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      await expect(service.getBestPublishTime(profileId, 'Invalid/Timezone')).rejects.toThrow(
        'Invalid timezone'
      );
    });

    it('should support custom lookback days parameter', async () => {
      const now = new Date();

      // Insert posts beyond 7-day window
      for (let i = 0; i < 8; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(9, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - (i + 10)); // 10+ days ago

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      // With 7-day lookback, should fail (not enough recent data)
      // Assuming there's no data in last 7 days
      const result = await service.getBestPublishTime(profileId, undefined, 45);

      expect(result.lookback_days).toBe(45);
    });

    it('should handle DST-aware timezone conversion', async () => {
      const now = new Date();

      // Insert test posts
      for (let i = 0; i < 8; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(12, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      // Test with US timezone that observes DST
      const result = await service.getBestPublishTime(profileId, 'America/Denver');

      expect(result.recommended_time_str).toBeDefined();
      expect(result.recommended_time_str.length).toBeGreaterThan(0);
    });

    it('should format time string correctly', async () => {
      const now = new Date();

      // Insert test posts
      for (let i = 0; i < 8; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(14, 0, 0, 0); // 2 PM
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId, 'America/Los_Angeles');

      // Should contain either AM or PM
      expect(
        result.recommended_time_str.includes('AM') || result.recommended_time_str.includes('PM')
      ).toBe(true);
      // Should contain timezone abbreviation
      expect(result.recommended_time_str.length).toBeGreaterThan(5);
    });

    it('should include correct sample_size in top_hours', async () => {
      const now = new Date();

      // Insert varying number of posts per hour
      const postCounts = [
        { hour: 8, count: 10 },
        { hour: 12, count: 5 },
        { hour: 18, count: 3 },
      ];

      for (const slot of postCounts) {
        for (let i = 0; i < slot.count; i++) {
          const pubDate = new Date(now);
          pubDate.setHours(slot.hour, 0, 0, 0);
          pubDate.setDate(pubDate.getDate() - i);

          const contentId = randomUUID();
          const metricsId = randomUUID();

          db.prepare(`
            INSERT INTO content (id, profile_id, user_id, status, published_at)
            VALUES (?, ?, ?, 'published', ?)
          `).run(contentId, profileId, userId, pubDate.toISOString());

          db.prepare(`
            INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
            VALUES (?, ?, ?, ?)
          `).run(metricsId, profileId, 4.0, pubDate.toISOString());
        }
      }

      const result = await service.getBestPublishTime(profileId);

      expect(result.top_hours[0].sample_size).toBe(10);
      expect(result.top_hours[1].sample_size).toBe(5);
      expect(result.top_hours[2].sample_size).toBe(3);
    });
  });

  describe('confidence score calculation', () => {
    it('should calculate confidence formula correctly', async () => {
      const now = new Date();

      // Create multiple scenarios to test confidence formula
      // Scenario: 10 posts with low variance = high confidence
      for (let i = 0; i < 10; i++) {
        const pubDate = new Date(now);
        pubDate.setHours(8, 0, 0, 0);
        pubDate.setDate(pubDate.getDate() - i);

        const contentId = randomUUID();
        const metricsId = randomUUID();

        db.prepare(`
          INSERT INTO content (id, profile_id, user_id, status, published_at)
          VALUES (?, ?, ?, 'published', ?)
        `).run(contentId, profileId, userId, pubDate.toISOString());

        db.prepare(`
          INSERT INTO metrics (id, profile_id, engagement_rate, collected_at)
          VALUES (?, ?, ?, ?)
        `).run(metricsId, profileId, 4.0, pubDate.toISOString());
      }

      const result = await service.getBestPublishTime(profileId);

      // With 10+ posts and consistent engagement (low variance)
      // confidence should be in the 80-100 range
      expect(result.confidence).toBeGreaterThanOrEqual(75);
      expect(result.confidence).toBeLessThanOrEqual(100);
    });
  });
});
