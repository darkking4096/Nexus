import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Database from 'better-sqlite3';
import { ResearchService } from '../ResearchService';
import type { ResearchResult } from '../ResearchSquad';

const mockResearchResult: ResearchResult = {
  competitors: [{ username: 'competitor1', top_posts: [] }],
  trends: [{ trend: 'fitness', relevance_score: 9.5, description: 'Growing fitness niche' }],
  history: {
    total_posts: 10,
    avg_engagement: 150,
    top_posts: [{ caption: 'Sample post', engagement: 500 }],
    patterns: ['morning posts work well'],
  },
  voice_analysis: {
    tone: 'professional',
    audience: 'fitness enthusiasts',
    key_themes: ['health', 'wellness'],
    language_style: 'educational',
  },
  insights: ['Create more educational content'],
};

// Mock ResearchSquad
vi.mock('../ResearchSquad', () => ({
  ResearchSquad: vi.fn(function () {
    return {
      runResearch: vi.fn().mockResolvedValue(mockResearchResult),
      client: {},
      agentsDir: '/mock/agents',
      model: 'claude-sonnet-4-5-20251001',
      runProfileStrategist: vi.fn(),
      runTrendAnalyzer: vi.fn(),
      runContentAnalyst: vi.fn(),
      runCompetitorAnalyzer: vi.fn(),
      runInsightGenerator: vi.fn(),
    };
  }),
}));

describe('ResearchService', () => {
  let db: Database.Database;
  let service: ResearchService;

  beforeAll(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');

    // Create required tables
    db.exec(`
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        instagram_username TEXT NOT NULL,
        instagram_id TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TEXT,
        display_name TEXT,
        bio TEXT,
        profile_picture_url TEXT,
        followers_count INTEGER DEFAULT 0,
        context_voice TEXT,
        context_tone TEXT,
        context_audience TEXT,
        context_goals TEXT,
        autopilot_enabled INTEGER DEFAULT 0,
        autopilot_schedule TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE content (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        caption TEXT,
        hashtags TEXT,
        status TEXT,
        published_at TEXT,
        created_at TEXT NOT NULL
      );
    `);

    service = new ResearchService(db);
  });

  afterAll(() => {
    db.close();
  });

  describe('runResearch', () => {
    it('should run research successfully for owned profile', async () => {
      // Setup test profile
      const profileId = 'profile-123';
      const userId = 'user-123';

      db.prepare(`
        INSERT INTO profiles (
          id, user_id, instagram_username, instagram_id, access_token,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(profileId, userId, '@testuser', 'ig-123', 'token-123', new Date().toISOString(), new Date().toISOString());

      // Add sample content
      db.prepare(`
        INSERT INTO content (id, profile_id, caption, status, published_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        'content-1',
        profileId,
        'Test post',
        'published',
        new Date().toISOString(),
        new Date().toISOString()
      );

      // Run research
      const result = await service.runResearch(profileId, userId);

      // Verify result is returned correctly
      expect(result).toEqual(mockResearchResult);
    });

    it('should throw error for non-existent profile', async () => {
      const profileId = 'non-existent';
      const userId = 'user-123';

      await expect(service.runResearch(profileId, userId)).rejects.toThrow(
        `Profile ${profileId} not found`
      );
    });

    it('should throw error for profile not owned by user', async () => {
      // Setup profile owned by different user
      const profileId = 'profile-456';
      const ownerId = 'user-456';
      const otherId = 'user-999';

      db.prepare(`
        INSERT INTO profiles (
          id, user_id, instagram_username, instagram_id, access_token,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(profileId, ownerId, '@otheruser', 'ig-456', 'token-456', new Date().toISOString(), new Date().toISOString());

      // Try to research as different user
      await expect(service.runResearch(profileId, otherId)).rejects.toThrow('Access denied');
    });

    it('should return empty content history for profile with no published posts', async () => {
      // Setup profile with no posts
      const profileId = 'profile-789';
      const userId = 'user-789';

      db.prepare(`
        INSERT INTO profiles (
          id, user_id, instagram_username, instagram_id, access_token,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(profileId, userId, '@emptyuser', 'ig-789', 'token-789', new Date().toISOString(), new Date().toISOString());

      // Run research
      const result = await service.runResearch(profileId, userId);

      // Verify result (squad runs even with empty history)
      expect(result).toEqual(mockResearchResult);
    });
  });
});
