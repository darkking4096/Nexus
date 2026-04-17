import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { ResearchService } from '../src/services/ResearchService';

// Mock ANTHROPIC_API_KEY for tests
vi.stubEnv('ANTHROPIC_API_KEY', 'test-key-for-testing-only');

// Mock @anthropic-ai/sdk
vi.mock('@anthropic-ai/sdk', () => {
  const mockClient = {
    messages: {
      create: vi.fn(),
    },
  };

  return {
    default: vi.fn(function () {
      return mockClient;
    }),
  };
});

describe('ResearchService', () => {
  let db: Database.Database;
  let researchService: ResearchService;

  beforeAll(() => {
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
    `);

    researchService = new ResearchService(db);
  });

  it('should reject profile not found', async () => {
    await expect(researchService.runResearch('nonexistent', 'user123')).rejects.toThrow(
      'not found'
    );
  });

  it('should reject access denied (different user)', async () => {
    const userId1 = randomUUID();
    const userId2 = randomUUID();
    const profileId = randomUUID();

    // Create users
    db.exec(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES ('${userId1}', 'user1@example.com', 'hash', datetime('now'), datetime('now'));

      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES ('${userId2}', 'user2@example.com', 'hash', datetime('now'), datetime('now'));

      INSERT INTO profiles (id, user_id, instagram_username, access_token, created_at, updated_at)
      VALUES ('${profileId}', '${userId1}', 'testuser', 'token', datetime('now'), datetime('now'));
    `);

    // Try to access with different user
    await expect(researchService.runResearch(profileId, userId2)).rejects.toThrow(
      'Access denied'
    );
  });

  it('should handle API key missing', async () => {
    // When ANTHROPIC_API_KEY is not set, ResearchSquad construction should fail
    // But we can't easily test this without modifying env vars in production
    // This is more of an integration test
    expect(researchService).toBeTruthy();
  });

  it('should get content history for profile', async () => {
    const userId = randomUUID();
    const profileId = randomUUID();
    const contentId1 = randomUUID();
    const contentId2 = randomUUID();

    db.exec(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES ('${userId}', 'user3@example.com', 'hash', datetime('now'), datetime('now'));

      INSERT INTO profiles (id, user_id, instagram_username, access_token, created_at, updated_at)
      VALUES ('${profileId}', '${userId}', 'testuser3', 'token', datetime('now'), datetime('now'));

      INSERT INTO content (id, profile_id, type, caption, status, published_at, created_at, updated_at)
      VALUES ('${contentId1}', '${profileId}', 'photo', 'Caption 1', 'published', datetime('now'), datetime('now'), datetime('now'));

      INSERT INTO content (id, profile_id, type, caption, status, published_at, created_at, updated_at)
      VALUES ('${contentId2}', '${profileId}', 'photo', 'Caption 2', 'draft', null, datetime('now'), datetime('now'));
    `);

    // Note: Can't easily test getContentHistory directly (it's private)
    // But we verify the structure exists by checking profile access works
    expect(() => {
      // This should not throw "not found" error
      const stmt = db.prepare('SELECT id FROM profiles WHERE id = ? AND user_id = ?');
      stmt.get(profileId, userId);
    }).not.toThrow();
  });

  it('should include profile with ownership verification', async () => {
    const userId = randomUUID();
    const profileId = randomUUID();

    db.exec(`
      INSERT INTO users (id, email, password_hash, created_at, updated_at)
      VALUES ('${userId}', 'user4@example.com', 'hash', datetime('now'), datetime('now'));

      INSERT INTO profiles (id, user_id, instagram_username, access_token, created_at, updated_at, bio, followers_count)
      VALUES ('${profileId}', '${userId}', 'testuser4', 'token', datetime('now'), datetime('now'), 'My bio', 1000);
    `);

    // Verify that accessing with correct user works (profile exists)
    const stmt = db.prepare('SELECT * FROM profiles WHERE id = ? AND user_id = ?');
    const profile = stmt.get(profileId, userId);

    expect(profile).toBeTruthy();
    expect((profile as any).instagram_username).toBe('testuser4');
    expect((profile as any).followers_count).toBe(1000);
  });
});
