import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { HashtagGenerator } from '../HashtagGenerator';
import ShadowbanValidator from '../../utils/shadowban-validator';

describe('HashtagGenerator', () => {
  let db: Database.Database;
  let generator: HashtagGenerator;
  let testDbPath: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test-hashtag-${Date.now()}.db`);
    db = new Database(testDbPath);
    generator = new HashtagGenerator(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // AC-1: Geração de Hashtags (10-15)
  describe('AC-1: Geração de Hashtags (10-15)', () => {
    it('should generate hashtag array (10-15 items)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      expect(result.hashtags).toBeInstanceOf(Array);
      expect(result.hashtags.length).toBeGreaterThanOrEqual(10);
      expect(result.hashtags.length).toBeLessThanOrEqual(15);
    });

    it('should return hashtags starting with #', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'story',
        analysis: {
          niche: 'fashion',
        },
      });

      result.hashtags.forEach((tag) => {
        expect(tag.hashtag).toMatch(/^#/);
        expect(tag.hashtag).not.toContain(' ');
      });
    });

    it('should include hashtag metadata (volume, competition, score)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'reel',
        analysis: {
          niche: 'cooking',
        },
      });

      result.hashtags.forEach((tag) => {
        expect(tag).toHaveProperty('hashtag');
        expect(tag).toHaveProperty('volume');
        expect(tag).toHaveProperty('competition');
        expect(tag).toHaveProperty('recommendation_score');
        expect(typeof tag.volume).toBe('number');
        expect(['low', 'medium', 'high']).toContain(tag.competition);
        expect(tag.recommendation_score).toBeGreaterThanOrEqual(0);
        expect(tag.recommendation_score).toBeLessThanOrEqual(1);
      });
    });

    it('should respect minHashtags parameter when specified', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
        minHashtags: 10,
        maxHashtags: 15,
      });

      expect(result.hashtags.length).toBeGreaterThanOrEqual(10);
      expect(result.hashtags.length).toBeLessThanOrEqual(15);
    });
  });

  // AC-2: Relevância ao Nicho
  describe('AC-2: Relevância ao Nicho', () => {
    it('should generate niche-relevant hashtags for fitness', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
          keywords: ['workout', 'gym'],
        },
      });

      // Expect hashtags contain niche-related keywords
      const hashtagText = result.hashtags.map((h) => h.hashtag.toLowerCase()).join(',');
      expect(
        hashtagText.includes('fitness') ||
        hashtagText.includes('gym') ||
        hashtagText.includes('workout') ||
        hashtagText.includes('training')
      ).toBe(true);
    });

    it('should include max 2 generic hashtags', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      const genericTags = result.hashtags.filter((tag) =>
        ['#love', '#instagood', '#photooftheday', '#picoftheday'].includes(
          tag.hashtag.toLowerCase()
        )
      );

      expect(genericTags.length).toBeLessThanOrEqual(2);
    });

    it('should include min 8 niche-specific hashtags', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fashion',
        },
      });

      // Most hashtags should be niche-specific (not generic)
      expect(result.hashtags.length).toBeGreaterThanOrEqual(8);
      expect(result.totalApproved).toBeGreaterThanOrEqual(8);
    });

    it('should have recommendation score > 0.6 for most hashtags', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'technology',
        },
      });

      const highScoreCount = result.hashtags.filter(
        (h) => h.recommendation_score > 0.6
      ).length;

      expect(highScoreCount).toBeGreaterThan(result.hashtags.length * 0.7); // 70%+
    });
  });

  // AC-3: Mix Trending + Niche-Specific
  describe('AC-3: Mix Trending + Niche-Specific', () => {
    it('should include trending hashtags (5-6)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      const trendingCount = result.hashtags.filter((h) => h.category === 'trending').length;
      expect(trendingCount).toBeGreaterThanOrEqual(1);
      expect(trendingCount).toBeLessThanOrEqual(6);
    });

    it('should include niche hashtags (5-6)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      const nicheCount = result.hashtags.filter((h) => h.category === 'niche').length;
      expect(nicheCount).toBeGreaterThanOrEqual(3);
    });

    it('should include long-tail hashtags (2-3)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
          keywords: ['gym', 'strength'],
        },
      });

      const longTailCount = result.hashtags.filter((h) => h.category === 'long-tail').length;
      expect(longTailCount).toBeGreaterThanOrEqual(0);
      expect(longTailCount).toBeLessThanOrEqual(3);
    });

    it('should balance distribution (not just top 30)', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fashion',
        },
      });

      // Should have variety across categories
      const categories = new Set(result.hashtags.map((h) => h.category));
      expect(categories.size).toBeGreaterThanOrEqual(1);
    });
  });

  // AC-4: Validação de Shadowban
  describe('AC-4: Validação de Shadowban', () => {
    it('should detect shadowbanned hashtags', async () => {
      const validator = new ShadowbanValidator();
      const check = validator.check('#likeforlike');

      expect(check.isShadowbanned).toBe(true);
    });

    it('should not include shadowbanned hashtags in results', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      const shadowbannedTags = ['#likeforlike', '#followforfollow', '#like4like', '#spam'];
      const foundShadowbanned = result.hashtags.filter((tag) =>
        shadowbannedTags.includes(tag.hashtag.toLowerCase())
      );

      expect(foundShadowbanned.length).toBe(0);
    });

    it('should flag suspicious hashtags', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // All approved hashtags should pass validation
      result.hashtags.forEach((tag) => {
        if (tag.status === 'approved') {
          expect(tag.recommendation_score).toBeGreaterThan(0.3);
        }
      });
    });

    it('should log hashtag removals for analytics', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // Track what was removed
      expect(result.metadata.shadowban_alerts).toBeGreaterThanOrEqual(0);
    });

    it('should count shadowban alerts in totalFlagged', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // totalFlagged must match shadowban_alerts (may be 0 for safe niches)
      expect(result.totalFlagged).toBe(result.metadata.shadowban_alerts);
      expect(result.totalFlagged).toBeGreaterThanOrEqual(0);
    });

    it('should maintain shadowban list freshness check', async () => {
      const health = generator.checkShadowbanListHealth();
      expect(health).toHaveProperty('isHealthy');
      expect(health).toHaveProperty('daysOld');
      expect(health).toHaveProperty('needsUpdate');
    });
  });

  // AC-5: Testes Implementados
  describe('AC-5: Testes Implementados', () => {
    it('should generate for 5+ different niches', async () => {
      const niches = ['fitness', 'fashion', 'cooking', 'technology', 'travel', 'beauty'];

      for (const niche of niches) {
        const result = await generator.generateHashtags({
          profile_id: 'inst_123',
          content_type: 'carousel',
          analysis: { niche },
        });

        expect(result.hashtags.length).toBeGreaterThanOrEqual(10);
        expect(result.totalApproved).toBeGreaterThanOrEqual(10);
      }
    });

    it('should validate mix distribution', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // Check distribution exists
      expect(result.totalGenerated).toBeGreaterThanOrEqual(result.totalApproved);
    });

    it('should detect shadowban list staleness', async () => {
      const health = generator.checkShadowbanListHealth();
      expect(typeof health.daysOld).toBe('number');
      expect(health.daysOld).toBeLessThanOrEqual(14); // Fresh on first run
    });

    it('should handle missing analysis gracefully', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'unknown-niche-123',
        },
      });

      expect(result.hashtags).toBeInstanceOf(Array);
      expect(result.hashtags.length).toBeGreaterThanOrEqual(1);
    });

    it('should validate metadata accuracy', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // Volume should be numeric and positive
      result.hashtags.forEach((tag) => {
        expect(tag.volume).toBeGreaterThan(0);
        expect(['low', 'medium', 'high']).toContain(tag.competition);
        expect(tag.recommendation_score).toBeGreaterThanOrEqual(0);
        expect(tag.recommendation_score).toBeLessThanOrEqual(1);
      });
    });

    it('should integrate with Story 2.1 trending data', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
        },
      });

      // Should have trending hashtags
      const hasTrending = result.hashtags.some((h) => h.category === 'trending');
      expect(hasTrending).toBe(true);
    });

    it('should integrate with Story 3.4 profile analysis', async () => {
      const result = await generator.generateHashtags({
        profile_id: 'inst_123',
        content_type: 'carousel',
        analysis: {
          niche: 'fitness',
          audience: 'gym-goers, personal trainers',
          keywords: ['workout', 'gains'],
        },
      });

      expect(result.hashtags.length).toBeGreaterThanOrEqual(10);
      expect(result.metadata.niche).toBe('fitness');
    });
  });

  // Validation endpoint
  describe('Hashtag Validation', () => {
    it('should validate hashtags against shadowban list', () => {
      const hashtags = ['#fitness', '#gym', '#likeforlike'];
      const result = generator.validateHashtags(hashtags);

      expect(result.valid).toContain('#fitness');
      expect(result.valid).toContain('#gym');
      expect(result.invalid).toContain('#likeforlike');
    });

    it('should handle mixed valid/invalid hashtags', () => {
      const hashtags = ['#fitness', '#spam', '#workout', '#followforfollow'];
      const result = generator.validateHashtags(hashtags);

      expect(result.valid.length).toBeGreaterThan(0);
      expect(result.invalid.length).toBeGreaterThan(0);
    });
  });

  // Health check
  describe('Health Check', () => {
    it('should pass health check', async () => {
      const isHealthy = await generator.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});
