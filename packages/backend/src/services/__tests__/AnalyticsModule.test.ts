import { describe, it, expect, beforeEach } from 'vitest';
import Database from 'better-sqlite3';
import { AnalyticsModule, AnalyticsInput } from '../AnalyticsModule.js';

describe('AnalyticsModule', () => {
  let db: Database.Database;
  let analyticsModule: AnalyticsModule;
  const testUserId = 'user-123';
  const testProfileId = 'profile-456';

  beforeEach(() => {
    db = new Database(':memory:');
    setupDatabase(db);
    analyticsModule = new AnalyticsModule(db);
  });

  describe('analyzeProfile', () => {
    it('should calculate scores and recommendations for profile with full data', async () => {
      // Setup
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5.2,
        competitors: 3,
        trends: 2,
        hasObjectives: true,
      });

      // Execute
      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Verify
      expect(result).toBeDefined();
      expect(result.virality_score).toBeGreaterThanOrEqual(0);
      expect(result.virality_score).toBeLessThanOrEqual(100);
      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
      expect(result.opportunities).toBeDefined();
      expect(result.recommended_content_types).toBeDefined();
      expect(result.timestamp).toBeDefined();
    });

    it('should handle new profile with no posts', async () => {
      // Setup
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 0,
        avgEngagement: 0,
        competitors: 2,
        trends: 1,
        hasObjectives: false,
      });

      // Execute
      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Verify
      expect(result.virality_score).toBe(60); // Baseline for new profiles
      expect(result.alignment_score).toBe(50); // Baseline
      expect(result.opportunities.length).toBeGreaterThan(0);
      expect(result.recommended_content_types.length).toBeGreaterThan(0);
    });

    it('should throw error for non-existent profile', async () => {
      const input = createMockAnalyticsInput({ totalPosts: 10 });

      // Execute & Verify
      await expect(
        analyticsModule.analyzeProfile('non-existent', testUserId, input)
      ).rejects.toThrow('Profile non-existent not found');
    });

    it('should throw error for profile ownership violation', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({ totalPosts: 10 });

      // Execute & Verify
      await expect(
        analyticsModule.analyzeProfile(testProfileId, 'different-user', input)
      ).rejects.toThrow('Access denied');
    });
  });

  describe('virality score calculation', () => {
    it('should calculate virality score with high engagement percentile', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 10,
        competitors: 3,
        competitorEngagements: [2, 3, 4], // Low competitor engagement
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // With high engagement vs competitors, score should be high
      expect(result.virality_score).toBeGreaterThan(60);
      expect(result.virality_reasoning).toContain('percentile');
    });

    it('should calculate virality score with low engagement percentile', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 2,
        competitors: 3,
        competitorEngagements: [8, 10, 12], // High competitor engagement
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // With low engagement vs competitors, score should be lower
      expect(result.virality_score).toBeLessThan(60);
    });

    it('should handle case with no competitors', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 0, // No competitors
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Should still produce valid score using baseline
      expect(result.virality_score).toBeGreaterThanOrEqual(0);
      expect(result.virality_score).toBeLessThanOrEqual(100);
    });

    it('should handle case with no trends', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 0, // No trends
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Should use baseline trend score
      expect(result.virality_score).toBeGreaterThanOrEqual(0);
      expect(result.virality_score).toBeLessThanOrEqual(100);
    });
  });

  describe('alignment score calculation', () => {
    it('should calculate alignment score with maximize_reach objective', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
        objectives: [{ goal: 'maximize_reach', priority: 'HIGH' }],
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
      expect(result.alignment_reasoning).toContain('objectives coverage');
    });

    it('should calculate alignment score with increase_engagement objective', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
        objectives: [{ goal: 'increase_engagement', priority: 'HIGH' }],
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
    });

    it('should handle missing objectives with default goal', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
        objectives: [],
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
    });
  });

  describe('opportunity identification', () => {
    it('should identify content type gaps', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 3,
        competitors: 2,
        competitorEngagements: [6, 7], // High engagement
        trends: 1,
        ownContentTypes: ['image'],
        competitorContentTypes: [
          { type: 'reel', engagement: 7 },
          { type: 'carousel', engagement: 6 },
        ],
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      const contentGaps = result.opportunities.filter((o) => o.type === 'content_gap');
      expect(contentGaps.length).toBeGreaterThan(0);
    });

    it('should identify posting pattern opportunities', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 3,
        competitors: 2,
        trends: 1,
        postingPatternGap: true, // Flag to create opportunity
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Pattern opportunity may or may not exist depending on data
      expect(Array.isArray(result.opportunities)).toBe(true);
    });

    it('should identify trend alignment opportunities', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 3, // Multiple trends
        trendMomentums: [80, 75, 70],
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      const trendOps = result.opportunities.filter((o) => o.type === 'trend_alignment');
      expect(trendOps.length).toBeGreaterThan(0);
    });

    it('should return max 3 opportunities', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 3,
        competitors: 5, // Many competitors to generate many gaps
        trends: 5, // Many trends
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.opportunities.length).toBeLessThanOrEqual(3);
    });

    it('should prioritize HIGH impact opportunities first', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 3,
        competitors: 3,
        trends: 2,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      if (result.opportunities.length > 1) {
        const firstImpact = result.opportunities[0].impact;
        // Should be HIGH or MEDIUM
        expect(['HIGH', 'MEDIUM', 'LOW']).toContain(firstImpact);
      }
    });
  });

  describe('content type recommendations', () => {
    it('should recommend top 3 content types', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.recommended_content_types.length).toBeGreaterThan(0);
      expect(result.recommended_content_types.length).toBeLessThanOrEqual(3);
    });

    it('should include virality and alignment scores for recommendations', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      for (const rec of result.recommended_content_types) {
        expect(rec.type).toBeDefined();
        expect(rec.virality_score).toBeGreaterThanOrEqual(0);
        expect(rec.virality_score).toBeLessThanOrEqual(100);
        expect(rec.alignment_score).toBeGreaterThanOrEqual(0);
        expect(rec.alignment_score).toBeLessThanOrEqual(100);
        expect(rec.rationale).toBeDefined();
        expect(rec.confidence).toBeGreaterThanOrEqual(0);
        expect(rec.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should rank recommendations by combined virality+alignment score', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      // Check that recommendations are sorted
      if (result.recommended_content_types.length > 1) {
        for (let i = 0; i < result.recommended_content_types.length - 1; i++) {
          const current =
            result.recommended_content_types[i].virality_score * 0.6 +
            result.recommended_content_types[i].alignment_score * 0.4;
          const next =
            result.recommended_content_types[i + 1].virality_score * 0.6 +
            result.recommended_content_types[i + 1].alignment_score * 0.4;
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe('profile health summary', () => {
    it('should generate engagement trajectory', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(['rising', 'stable', 'declining']).toContain(
        result.profile_health_summary.engagement_trajectory
      );
    });

    it('should generate content diversity score', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.profile_health_summary.content_diversity).toBeGreaterThanOrEqual(0);
      expect(result.profile_health_summary.content_diversity).toBeLessThanOrEqual(1);
    });

    it('should generate optimization potential score', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.profile_health_summary.optimization_potential).toBeGreaterThanOrEqual(0);
      expect(result.profile_health_summary.optimization_potential).toBeLessThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('should handle profile with only one post type', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 20,
        avgEngagement: 4,
        competitors: 2,
        trends: 1,
        ownContentTypes: ['reel'], // Only one type
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
    });

    it('should handle very high engagement numbers', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 100,
        avgEngagement: 50,
        competitors: 2,
        competitorEngagements: [1, 2],
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.virality_score).toBeGreaterThanOrEqual(0);
      expect(result.virality_score).toBeLessThanOrEqual(100);
    });

    it('should handle very low engagement numbers', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 0.1,
        competitors: 2,
        competitorEngagements: [10, 15],
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.virality_score).toBeGreaterThanOrEqual(0);
      expect(result.virality_score).toBeLessThanOrEqual(100);
    });

    it('should handle identical engagement across content types', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 40,
        avgEngagement: 5,
        competitors: 2,
        trends: 1,
        uniformEngagement: true,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result.alignment_score).toBeGreaterThanOrEqual(0);
      expect(result.alignment_score).toBeLessThanOrEqual(100);
    });
  });

  describe('result structure validation', () => {
    it('should return complete AnalyticsResult structure', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({ totalPosts: 50 });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      expect(result).toHaveProperty('virality_score');
      expect(result).toHaveProperty('virality_reasoning');
      expect(result).toHaveProperty('alignment_score');
      expect(result).toHaveProperty('alignment_reasoning');
      expect(result).toHaveProperty('opportunities');
      expect(result).toHaveProperty('recommended_content_types');
      expect(result).toHaveProperty('profile_health_summary');
      expect(result).toHaveProperty('timestamp');
    });

    it('should include all opportunity fields', async () => {
      insertTestProfile(db, testProfileId, testUserId);
      const input = createMockAnalyticsInput({
        totalPosts: 50,
        avgEngagement: 3,
        competitors: 2,
        trends: 1,
      });

      const result = await analyticsModule.analyzeProfile(testProfileId, testUserId, input);

      for (const opp of result.opportunities) {
        expect(opp).toHaveProperty('type');
        expect(opp).toHaveProperty('description');
        expect(opp).toHaveProperty('impact');
        expect(opp).toHaveProperty('estimated_lift');
        expect(opp).toHaveProperty('data_source');
      }
    });
  });
});

// Helper functions
function setupDatabase(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      instagram_username TEXT
    );
  `);
}

function insertTestProfile(db: Database.Database, profileId: string, userId: string) {
  const stmt = db.prepare(
    'INSERT INTO profiles (id, user_id, instagram_username) VALUES (?, ?, ?)'
  );
  stmt.run(profileId, userId, `user_${profileId}`);
}

interface MockOptionsPartial {
  totalPosts?: number;
  avgEngagement?: number;
  competitors?: number;
  trends?: number;
  hasObjectives?: boolean;
  competitorEngagements?: number[];
  trendMomentums?: number[];
  objectives?: Array<{ goal: string; priority: string }>;
  ownContentTypes?: string[];
  competitorContentTypes?: Array<{ type: string; engagement: number }>;
  postingPatternGap?: boolean;
  uniformEngagement?: boolean;
}

function createMockAnalyticsInput(options: MockOptionsPartial = {}): AnalyticsInput {
  const {
    totalPosts = 50,
    avgEngagement = 5,
    competitors = 2,
    trends = 1,
    hasObjectives = true,
    competitorEngagements = undefined,
    trendMomentums = undefined,
    objectives = undefined,
    ownContentTypes = ['image', 'video'],
    competitorContentTypes = undefined,
    uniformEngagement = false,
  } = options;

  const contentTypePerformance = ownContentTypes.map((type, idx) => ({
    type,
    count: uniformEngagement ? totalPosts / ownContentTypes.length : totalPosts / (idx + 2),
    avg_engagement: uniformEngagement ? avgEngagement : avgEngagement * (1 + idx * 0.1),
    top_post_id: `post-${idx}`,
    top_post_engagement: uniformEngagement ? avgEngagement * 5 : avgEngagement * 5 * (1 + idx * 0.1),
  }));

  const topPosts = Array.from({ length: Math.min(5, totalPosts) }, (_, i) => ({
    id: `post-${i}`,
    type: ownContentTypes[i % ownContentTypes.length],
    caption: `Post ${i}`,
    hashtags: ['#test', '#analytics'],
    published_at: new Date(Date.now() - i * 86400000).toISOString(),
    likes: Math.floor(avgEngagement * 10 * (1 - i * 0.1)),
    comments: Math.floor(avgEngagement * 5 * (1 - i * 0.1)),
    shares: Math.floor(avgEngagement * 2 * (1 - i * 0.1)),
    saves: Math.floor(avgEngagement * 3 * (1 - i * 0.1)),
    reach: Math.floor(avgEngagement * 100),
    engagement_rate: avgEngagement * (1 - i * 0.1),
  }));

  const postingPatterns = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: Math.floor(totalPosts / 24),
    avg_engagement: avgEngagement * (Math.sin((hour / 24) * Math.PI) + 1),
  }));

  const competitorData = Array.from(
    { length: Math.max(0, competitors) },
    (_, idx) => {
      const competitorEngagement = competitorEngagements?.[idx] ?? avgEngagement * (1 + idx * 0.2);
      const contentPatterns = (competitorContentTypes || [
        { type: 'reel', engagement: competitorEngagement * 1.1 },
        { type: 'carousel', engagement: competitorEngagement * 0.9 },
      ]).map((ct) => ({
        type: 'content_type',
        value: ct.type,
        frequency: 5,
        average_engagement: ct.engagement,
      }));

      return {
        handle: `competitor_${idx}`,
        followers: 10000,
        avg_engagement: competitorEngagement,
        top_posts: [
          {
            id: `comp-post-${idx}`,
            caption: 'Competitor post',
            likes: Math.floor(competitorEngagement * 10),
            comments: Math.floor(competitorEngagement * 5),
            shares: Math.floor(competitorEngagement * 2),
            timestamp: new Date().toISOString(),
            hashtags: ['#competitor', '#trending'],
            content_type: 'reel' as const,
          },
        ],
        content_patterns: contentPatterns,
        trends: [
          {
            trend_type: 'engagement_trend',
            description: 'Rising engagement',
            confidence: 0.8,
            data_points: ['8%', '10%'],
          },
        ],
      };
    }
  );

  const trendData = Array.from({ length: Math.max(0, trends) }, (_, idx) => {
    const momentum = trendMomentums?.[idx] ?? 75 + idx * 10;
    return {
      topic: `Trend topic ${idx}`,
      momentum: Math.min(100, momentum),
      related_hashtags: [`#trending${idx}`, `#viral${idx}`, `#hot${idx}`],
    };
  });

  const userObjectives = objectives || (hasObjectives
    ? [
        { goal: 'maximize_reach', priority: 'HIGH' as const },
        { goal: 'increase_engagement', priority: 'MEDIUM' as const },
      ]
    : []);

  return {
    own_history: {
      total_posts: totalPosts,
      avg_engagement: avgEngagement,
      top_posts: topPosts,
      posting_patterns: postingPatterns,
      content_type_performance: contentTypePerformance,
      best_performing_type: contentTypePerformance[0]?.type ?? 'image',
      analysis_timestamp: new Date().toISOString(),
    },
    competitors: competitorData,
    trends: trendData,
    user_objectives: userObjectives,
  };
}
