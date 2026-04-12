import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { CompetitorAnalysis, Post } from '../CompetitorAnalysis.js';
import { Profile } from '../../models/Profile.js';
import { Competitor } from '../../models/Competitor.js';

describe('CompetitorAnalysis', () => {
  let db: Database.Database;
  let dbPath: string;
  let analysis: CompetitorAnalysis;
  let profile: Profile;
  let competitor: Competitor;
  let testUserId: string;
  let testProfileId: string;

  beforeEach(() => {
    // Create temporary test database with unique identifier
    const tempDir = path.join(process.cwd(), '.test-db');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Use unique identifier (timestamp + random) to avoid file conflicts
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    dbPath = path.join(tempDir, `test-competitor-${uniqueId}.db`);
    db = new Database(dbPath);

    // Initialize schema
    initializeTestDatabase(db);

    // Create models and service
    profile = new Profile(db);
    competitor = new Competitor(db);
    analysis = new CompetitorAnalysis(db);

    // Create test data
    testUserId = 'test-user-123';
    testProfileId = profile.create({
      user_id: testUserId,
      instagram_username: 'myprofile',
      access_token: 'test-token-123',
      instagram_id: 'ig-123',
      bio: 'Test profile',
    }).id;
  });

  afterEach(() => {
    // Close database connection
    if (db) {
      try {
        db.close();
      } catch (error) {
        // Database already closed or error closing
      }
    }

    // Clean up specific test db file with retries
    if (dbPath && fs.existsSync(dbPath)) {
      let retries = 3;
      while (retries > 0) {
        try {
          fs.unlinkSync(dbPath);
          break;
        } catch (error) {
          retries--;
          if (retries === 0) {
            // Silently ignore cleanup errors - file will be cleaned up eventually
            return;
          }
          // Brief delay before retry
          setTimeout(() => {}, 50);
        }
      }
    }

    // Clean up empty .test-db directory if it exists
    try {
      const tempDir = path.join(process.cwd(), '.test-db');
      const files = fs.readdirSync(tempDir);
      if (files.length === 0) {
        fs.rmdirSync(tempDir);
      }
    } catch {
      // Directory not empty or doesn't exist - that's fine
    }
  });

  it('should analyze competitors and return structured results', async () => {
    // Create test competitor
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        caption: 'Great content! #marketing #socialmedia',
        likes: 150,
        comments: 25,
        shares: 10,
        timestamp: new Date().toISOString(),
        hashtags: ['marketing', 'socialmedia'],
        content_type: 'image',
      },
      {
        id: 'post-2',
        caption: 'Check this out #content #engagement',
        likes: 200,
        comments: 40,
        shares: 15,
        timestamp: new Date().toISOString(),
        hashtags: ['content', 'engagement'],
        content_type: 'video',
      },
      {
        id: 'post-3',
        caption: 'Long caption that explains everything about this amazing product and service #marketing #business #growth',
        likes: 180,
        comments: 35,
        shares: 12,
        timestamp: new Date().toISOString(),
        hashtags: ['marketing', 'business', 'growth'],
        content_type: 'carousel',
      },
    ];

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor1',
      followers_count: 10000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);

    expect(result).toBeDefined();
    expect(result.competitors).toHaveLength(1);
    expect(result.total_posts_analyzed).toBe(3);

    const analyzed = result.competitors[0];
    expect(analyzed.handle).toBe('competitor1');
    expect(analyzed.followers).toBe(10000);
    expect(analyzed.avg_engagement).toBeGreaterThan(0);
    expect(analyzed.content_patterns).toBeDefined();
    expect(analyzed.trends).toBeDefined();
  });

  it('should calculate engagement metrics correctly', async () => {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        caption: 'Test post',
        likes: 100,
        comments: 20,
        shares: 5,
        timestamp: new Date().toISOString(),
        hashtags: ['test'],
        content_type: 'image',
      },
    ];

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor2',
      followers_count: 1000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);
    const analyzed = result.competitors[0];

    // Engagement rate = (100 + 20 + 5) / 1000 * 100 = 12.5%
    expect(analyzed.avg_engagement).toBe(12.5);
  });

  it('should identify content patterns across posts', async () => {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        caption: 'Image post #trending #marketing',
        likes: 100,
        comments: 20,
        shares: 5,
        timestamp: new Date().toISOString(),
        hashtags: ['trending', 'marketing'],
        content_type: 'image',
      },
      {
        id: 'post-2',
        caption: 'Video post #trending #viral',
        likes: 200,
        comments: 40,
        shares: 15,
        timestamp: new Date().toISOString(),
        hashtags: ['trending', 'viral'],
        content_type: 'video',
      },
      {
        id: 'post-3',
        caption: 'Another image #marketing #socialmedia',
        likes: 150,
        comments: 30,
        shares: 10,
        timestamp: new Date().toISOString(),
        hashtags: ['marketing', 'socialmedia'],
        content_type: 'image',
      },
    ];

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor3',
      followers_count: 5000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);
    const analyzed = result.competitors[0];

    expect(analyzed.content_patterns.length).toBeGreaterThan(0);

    // Should detect content_type patterns
    const contentTypePatterns = analyzed.content_patterns.filter((p) => p.type === 'content_type');
    expect(contentTypePatterns.length).toBeGreaterThan(0);

    // Should detect hashtag patterns
    const hashtagPatterns = analyzed.content_patterns.filter((p) => p.type === 'hashtag');
    expect(hashtagPatterns.length).toBeGreaterThan(0);

    // #trending should be detected (appears 2x)
    const trendingPattern = hashtagPatterns.find((p) => p.value === 'trending');
    expect(trendingPattern).toBeDefined();
    expect(trendingPattern?.frequency).toBe(2);
  });

  it('should detect trends in competitor data', async () => {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        caption: 'Old post #trending',
        likes: 50,
        comments: 10,
        shares: 2,
        timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
        hashtags: ['trending'],
        content_type: 'image',
      },
      {
        id: 'post-2',
        caption: 'Older post #trending',
        likes: 60,
        comments: 12,
        shares: 3,
        timestamp: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
        hashtags: ['trending'],
        content_type: 'image',
      },
      {
        id: 'post-3',
        caption: 'Oldest post #trending',
        likes: 55,
        comments: 11,
        shares: 2,
        timestamp: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(), // 25 days ago
        hashtags: ['trending'],
        content_type: 'image',
      },
      {
        id: 'post-4',
        caption: 'Recent post #viral',
        likes: 300,
        comments: 60,
        shares: 20,
        timestamp: new Date().toISOString(),
        hashtags: ['viral'],
        content_type: 'video',
      },
      {
        id: 'post-5',
        caption: 'Recent post 2 #trending',
        likes: 250,
        comments: 50,
        shares: 18,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        hashtags: ['trending'],
        content_type: 'video',
      },
      {
        id: 'post-6',
        caption: 'Recent post 3 #viral',
        likes: 320,
        comments: 65,
        shares: 25,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        hashtags: ['viral'],
        content_type: 'video',
      },
    ];

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor4',
      followers_count: 10000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);
    const analyzed = result.competitors[0];

    expect(analyzed.trends.length).toBeGreaterThan(0);

    // Should detect engagement trend
    const engagementTrend = analyzed.trends.find((t) => t.trend_type === 'engagement_trend');
    expect(engagementTrend).toBeDefined();
    expect(engagementTrend?.confidence).toBeGreaterThan(0);

    // Should detect content type preference
    const contentPref = analyzed.trends.find((t) => t.trend_type === 'content_type_preference');
    expect(contentPref).toBeDefined();
  });

  it('should return top 5 posts by engagement', async () => {
    const mockPosts: Post[] = Array.from({ length: 10 }, (_, i) => ({
      id: `post-${i}`,
      caption: `Post ${i}`,
      likes: 100 + i * 50, // Increasing engagement
      comments: 20 + i * 10,
      shares: 5 + i * 2,
      timestamp: new Date().toISOString(),
      hashtags: ['test'],
      content_type: 'image' as const,
    }));

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor5',
      followers_count: 10000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);
    const analyzed = result.competitors[0];

    expect(analyzed.top_posts).toBeDefined();
    expect(analyzed.top_posts.length).toBeLessThanOrEqual(5);
  });

  it('should throw error for invalid profile', async () => {
    await expect(async () => {
      await analysis.analyzeCompetitors('invalid-profile-id', testUserId);
    }).rejects.toThrow('Profile invalid-profile-id not found');
  });

  it('should throw error for access denied', async () => {
    const otherUserId = 'other-user-456';

    await expect(async () => {
      await analysis.analyzeCompetitors(testProfileId, otherUserId);
    }).rejects.toThrow('Access denied');
  });

  it('should return empty result when no competitors exist', async () => {
    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);

    expect(result.competitors).toHaveLength(0);
    expect(result.total_posts_analyzed).toBe(0);
  });

  it('should handle empty post data gracefully', async () => {
    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor_no_posts',
      followers_count: 1000,
      top_posts_data: undefined,
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);

    expect(result.competitors).toHaveLength(1);
    expect(result.competitors[0].top_posts).toHaveLength(0);
    expect(result.total_posts_analyzed).toBe(0);
  });

  it('should include analysis timestamp', async () => {
    const mockPosts: Post[] = [
      {
        id: 'post-1',
        caption: 'Test',
        likes: 100,
        comments: 20,
        shares: 5,
        timestamp: new Date().toISOString(),
        hashtags: ['test'],
        content_type: 'image',
      },
    ];

    competitor.create({
      profile_id: testProfileId,
      instagram_username: 'competitor6',
      followers_count: 5000,
      top_posts_data: JSON.stringify(mockPosts),
    });

    const result = await analysis.analyzeCompetitors(testProfileId, testUserId);

    expect(result.analysis_timestamp).toBeDefined();
    expect(new Date(result.analysis_timestamp)).toBeInstanceOf(Date);
  });
});

/**
 * Initialize test database with required schema
 */
function initializeTestDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      instagram_username TEXT NOT NULL,
      instagram_id TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at DATETIME,
      display_name TEXT,
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

    CREATE TABLE IF NOT EXISTS competitors (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      instagram_username TEXT NOT NULL,
      followers_count INTEGER,
      top_posts_data TEXT,
      last_updated DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert test user to satisfy FOREIGN KEY constraint
  db.prepare(`
    INSERT INTO users (id, email)
    VALUES (?, ?)
  `).run('test-user-123', 'test@example.com');
}
