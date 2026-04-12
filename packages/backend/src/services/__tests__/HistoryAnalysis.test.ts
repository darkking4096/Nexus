import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { HistoryAnalysis } from '../HistoryAnalysis.js';
import { Profile } from '../../models/Profile.js';

describe('HistoryAnalysis', () => {
  let db: Database.Database;
  let analysis: HistoryAnalysis;
  let profile: Profile;
  let testUserId: string;
  let testProfileId: string;

  beforeEach(() => {
    // Create temporary test database
    const tempDir = path.join(process.cwd(), '.test-db');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Use absolute path to avoid issues with relative paths
    const dbPath = path.resolve(path.join(tempDir, `test-history-${Date.now()}.db`));
    db = new Database(dbPath);

    // Initialize schema
    initializeTestDatabase(db);

    // Create models and service
    profile = new Profile(db);
    analysis = new HistoryAnalysis(db);

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
    db.close();
    // Clean up test db file
    const tempDir = path.join(process.cwd(), '.test-db');
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('should analyze profile history and return structured results', async () => {
    // Create test posts
    createTestPosts(db, testProfileId, 10);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result).toBeDefined();
    expect(result.total_posts).toBe(10);
    expect(result.avg_engagement).toBeGreaterThanOrEqual(0);
    expect(result.top_posts).toBeDefined();
    expect(result.posting_patterns).toBeDefined();
    expect(result.content_type_performance).toBeDefined();
  });

  it('should calculate average engagement correctly', async () => {
    // Create 5 posts with known engagement
    createTestPostsWithMetrics(db, testProfileId, 5);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.avg_engagement).toBeGreaterThan(0);
    expect(result.total_posts).toBe(5);
  });

  it('should identify top posts by engagement', async () => {
    // Create posts with varying engagement levels
    createTestPostsWithMetrics(db, testProfileId, 10);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.top_posts).toBeDefined();
    expect(result.top_posts.length).toBeGreaterThan(0);

    // Verify top posts are sorted by engagement descending
    for (let i = 1; i < result.top_posts.length; i++) {
      const prev = result.top_posts[i - 1].likes + result.top_posts[i - 1].comments;
      const curr = result.top_posts[i].likes + result.top_posts[i].comments;
      expect(prev).toBeGreaterThanOrEqual(curr);
    }
  });

  it('should analyze posting patterns by hour', async () => {
    // Create posts at different hours
    createTestPostsAtDifferentHours(db, testProfileId, 8);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.posting_patterns).toBeDefined();
    expect(result.posting_patterns.length).toBeGreaterThan(0);

    // Verify hour pattern structure
    for (const pattern of result.posting_patterns) {
      expect(pattern.hour).toBeGreaterThanOrEqual(0);
      expect(pattern.hour).toBeLessThan(24);
      expect(pattern.count).toBeGreaterThan(0);
      expect(pattern.avg_engagement).toBeGreaterThanOrEqual(0);
    }
  });

  it('should analyze content type performance', async () => {
    // Create posts of different types
    createTestPostsOfDifferentTypes(db, testProfileId);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.content_type_performance).toBeDefined();
    expect(result.content_type_performance.length).toBeGreaterThan(0);

    // Verify structure
    for (const perf of result.content_type_performance) {
      expect(perf.type).toBeDefined();
      expect(perf.count).toBeGreaterThan(0);
      expect(perf.avg_engagement).toBeGreaterThanOrEqual(0);
      expect(perf.top_post_id).toBeDefined();
    }
  });

  it('should identify best performing content type', async () => {
    createTestPostsOfDifferentTypes(db, testProfileId);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.best_performing_type).toBeDefined();
    expect(result.best_performing_type).not.toBe('N/A');
  });

  it('should throw error for invalid profile', async () => {
    await expect(async () => {
      await analysis.analyzeHistory('invalid-profile-id', testUserId);
    }).rejects.toThrow('Profile invalid-profile-id not found');
  });

  it('should throw error for access denied', async () => {
    const otherUserId = 'other-user-456';

    await expect(async () => {
      await analysis.analyzeHistory(testProfileId, otherUserId);
    }).rejects.toThrow('Access denied');
  });

  it('should return empty result when no posts exist', async () => {
    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.total_posts).toBe(0);
    expect(result.avg_engagement).toBe(0);
    expect(result.top_posts).toHaveLength(0);
    expect(result.posting_patterns).toHaveLength(0);
  });

  it('should limit analysis to last 100 posts', async () => {
    // Create 150 posts
    createTestPosts(db, testProfileId, 150);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.total_posts).toBeLessThanOrEqual(100);
  });

  it('should include analysis timestamp', async () => {
    createTestPosts(db, testProfileId, 5);

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.analysis_timestamp).toBeDefined();
    expect(new Date(result.analysis_timestamp)).toBeInstanceOf(Date);
  });

  it('should handle posts with null metrics gracefully', async () => {
    // Create post without metrics
    const contentStmt = db.prepare(`
      INSERT INTO content (id, profile_id, type, caption, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    contentStmt.run(
      'post-1',
      testProfileId,
      'image',
      'Test post',
      'published',
      new Date().toISOString()
    );

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.total_posts).toBe(1);
    expect(result.top_posts[0].likes).toBe(0);
    expect(result.top_posts[0].comments).toBe(0);
  });

  it('should handle posts with hashtags', async () => {
    const contentStmt = db.prepare(`
      INSERT INTO content (id, profile_id, type, caption, hashtags, status, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const hashtags = ['marketing', 'socialmedia'];
    contentStmt.run(
      'post-1',
      testProfileId,
      'image',
      'Test post',
      JSON.stringify(hashtags),
      'published',
      new Date().toISOString()
    );

    const result = await analysis.analyzeHistory(testProfileId, testUserId);

    expect(result.total_posts).toBe(1);
    expect(result.top_posts[0].hashtags).toEqual(hashtags);
  });
});

/**
 * Helper functions for test data creation
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

    CREATE TABLE IF NOT EXISTS content (
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

    CREATE TABLE IF NOT EXISTS post_metrics (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL REFERENCES content(id),
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert test user to satisfy FOREIGN KEY constraint
  db.prepare(`
    INSERT INTO users (id, email)
    VALUES (?, ?)
  `).run('test-user-123', 'test@example.com');
}

function createTestPosts(db: Database.Database, profileId: string, count: number) {
  const contentStmt = db.prepare(`
    INSERT INTO content (id, profile_id, type, caption, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const metricsStmt = db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < count; i++) {
    const postId = `post-${i}`;
    const now = new Date();
    now.setDate(now.getDate() - i); // Stagger posts by day

    contentStmt.run(postId, profileId, 'image', `Post ${i}`, 'published', now.toISOString());

    metricsStmt.run(
      `metric-${i}`,
      postId,
      profileId,
      Math.floor(Math.random() * 500), // likes 0-500
      Math.floor(Math.random() * 100), // comments 0-100
      Math.floor(Math.random() * 50), // shares 0-50
      Math.floor(Math.random() * 200) // saves 0-200
    );
  }
}

function createTestPostsWithMetrics(db: Database.Database, profileId: string, count: number) {
  const contentStmt = db.prepare(`
    INSERT INTO content (id, profile_id, type, caption, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const metricsStmt = db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < count; i++) {
    const postId = `post-${i}`;
    const engagement = (i + 1) * 100; // Increasing engagement

    contentStmt.run(
      postId,
      profileId,
      'image',
      `Post ${i}`,
      'published',
      new Date().toISOString()
    );

    metricsStmt.run(`metric-${i}`, postId, profileId, engagement, engagement / 5, engagement / 10, engagement / 4);
  }
}

function createTestPostsAtDifferentHours(db: Database.Database, profileId: string, hourCount: number) {
  const contentStmt = db.prepare(`
    INSERT INTO content (id, profile_id, type, caption, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const metricsStmt = db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let h = 0; h < hourCount; h++) {
    for (let p = 0; p < 2; p++) {
      // 2 posts per hour
      const postId = `post-h${h}-p${p}`;
      const date = new Date();
      date.setHours(h, Math.floor(Math.random() * 60), 0);

      contentStmt.run(postId, profileId, 'image', `Hour ${h}`, 'published', date.toISOString());

      metricsStmt.run(
        `metric-${postId}`,
        postId,
        profileId,
        Math.floor(Math.random() * 300),
        Math.floor(Math.random() * 50),
        Math.floor(Math.random() * 30),
        Math.floor(Math.random() * 100)
      );
    }
  }
}

function createTestPostsOfDifferentTypes(db: Database.Database, profileId: string) {
  const contentTypes = ['image', 'video', 'carousel', 'reel'];
  const contentStmt = db.prepare(`
    INSERT INTO content (id, profile_id, type, caption, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const metricsStmt = db.prepare(`
    INSERT INTO post_metrics (id, content_id, profile_id, likes, comments, shares, saves)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (let i = 0; i < 20; i++) {
    const postId = `post-type-${i}`;
    const type = contentTypes[i % contentTypes.length];
    const baseEngagement = (i % contentTypes.length + 1) * 100; // Videos get more engagement

    contentStmt.run(postId, profileId, type, `Post type ${type}`, 'published', new Date().toISOString());

    metricsStmt.run(
      `metric-${postId}`,
      postId,
      profileId,
      baseEngagement,
      baseEngagement / 5,
      baseEngagement / 10,
      baseEngagement / 4
    );
  }
}
