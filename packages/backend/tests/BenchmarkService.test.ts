import { describe, it, expect, beforeEach, vi } from 'vitest';
import Database from 'better-sqlite3';
import { BenchmarkService } from '../src/services/BenchmarkService';
import { SearchService, CompetitorData } from '../src/services/SearchService';
import { AnalyticsService, Metrics } from '../src/services/AnalyticsService';

describe('BenchmarkService', () => {
  let db: Database.Database;
  let benchmarkService: BenchmarkService;
  let searchService: SearchService;
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    db = new Database(':memory:');
    searchService = new SearchService(db);
    analyticsService = new AnalyticsService(db, 'http://localhost:5001', 'test-key');
    benchmarkService = new BenchmarkService(db, searchService, analyticsService);
  });

  describe('getBenchmark', () => {
    it('should throw error if profile has no metrics', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      // Mock getProfileMetrics to return null
      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(null);

      await expect(benchmarkService.getBenchmark(profileId, userId, ['@competitor1'])).rejects.toThrow(
        'has no metrics available'
      );
    });

    it('should throw error if no competitors provided and none stored', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const mockMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(mockMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue([]);

      await expect(benchmarkService.getBenchmark(profileId, userId)).rejects.toThrow(
        'No competitor handles provided'
      );
    });

    it('should throw error if no competitor data found', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const mockMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(mockMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue([]);

      await expect(benchmarkService.getBenchmark(profileId, userId, ['@competitor1'])).rejects.toThrow(
        'No competitor data found'
      );
    });

    it('should calculate benchmark with provided competitor handles', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const profileMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      const competitorData: CompetitorData[] = [
        {
          handle: '@competitor1',
          followersEstimate: 13000,
          engagementRate: 3.5,
        },
        {
          handle: '@competitor2',
          followersEstimate: 25000,
          engagementRate: 6.1,
        },
      ];

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(profileMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue(competitorData);

      const result = await benchmarkService.getBenchmark(profileId, userId, ['@competitor1', '@competitor2']);

      expect(result).toBeDefined();
      expect(result.profile.followers).toBe(15000);
      expect(result.breakdown.competitors_analyzed).toBe(2);
      expect(result.breakdown.confidence).toBe('medium');
      expect(result.comparison.vs_avg.followers).toBeDefined();
    });
  });

  describe('calculateBenchmark (integration)', () => {
    it('should calculate and return BenchmarkResult with 3 competitors', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const profileMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      const competitorData: CompetitorData[] = [
        {
          handle: '@competitor1',
          followersEstimate: 13000,
          engagementRate: 3.5,
        },
        {
          handle: '@competitor2',
          followersEstimate: 25000,
          engagementRate: 6.1,
        },
        {
          handle: '@competitor3',
          followersEstimate: 12000,
          engagementRate: 2.8,
        },
      ];

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(profileMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue(competitorData);

      const result = await benchmarkService.getBenchmark(profileId, userId, [
        '@competitor1',
        '@competitor2',
        '@competitor3',
      ]);

      // Verify BenchmarkResult structure
      expect(result).toHaveProperty('profile');
      expect(result).toHaveProperty('competitors_avg');
      expect(result).toHaveProperty('competitors_best');
      expect(result).toHaveProperty('comparison');
      expect(result).toHaveProperty('breakdown');

      // Verify values
      expect(result.profile.followers).toBe(15000);
      expect(result.breakdown.competitors_analyzed).toBe(3);
      expect(result.breakdown.confidence).toBe('high');
      expect(result.comparison.vs_avg.followers).toContain('%');
      expect(result.comparison.vs_best.followers).toContain('%');
    });
  });

  describe('edge cases', () => {
    it('should handle single competitor (low confidence)', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const profileMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      const competitorData: CompetitorData[] = [
        {
          handle: '@competitor1',
          followersEstimate: 13000,
          engagementRate: 3.5,
        },
      ];

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(profileMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue(competitorData);

      const result = await benchmarkService.getBenchmark(profileId, userId, ['@competitor1']);
      expect(result.breakdown.confidence).toBe('low');
      expect(result.breakdown.competitors_analyzed).toBe(1);
    });

    it('should handle multiple competitors (3+) with high confidence', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const profileMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 15000,
        engagement_rate: 4.2,
        reach: 45000,
        impressions: 120000,
        collected_at: new Date().toISOString(),
      };

      const competitorData: CompetitorData[] = [
        { handle: '@comp1', followersEstimate: 13000, engagementRate: 3.5 },
        { handle: '@comp2', followersEstimate: 25000, engagementRate: 6.1 },
        { handle: '@comp3', followersEstimate: 12000, engagementRate: 2.8 },
        { handle: '@comp4', followersEstimate: 18000, engagementRate: 4.5 },
      ];

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(profileMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue(competitorData);

      const result = await benchmarkService.getBenchmark(profileId, userId, [
        '@comp1',
        '@comp2',
        '@comp3',
        '@comp4',
      ]);
      expect(result.breakdown.confidence).toBe('high');
      expect(result.breakdown.competitors_analyzed).toBe(4);
    });

    it('should handle zero metrics gracefully', async () => {
      const profileId = 'profile-1';
      const userId = 'user-1';

      const profileMetrics: Metrics = {
        id: 'metric-1',
        profile_id: profileId,
        followers_count: 0,
        engagement_rate: 0,
        reach: 0,
        impressions: 0,
        collected_at: new Date().toISOString(),
      };

      const competitorData: CompetitorData[] = [
        { handle: '@competitor1', followersEstimate: 0, engagementRate: 0 },
      ];

      vi.spyOn(analyticsService, 'getProfileMetrics').mockResolvedValue(profileMetrics);
      vi.spyOn(searchService, 'searchCompetitors').mockResolvedValue(competitorData);

      const result = await benchmarkService.getBenchmark(profileId, userId, ['@competitor1']);
      expect(result).toBeDefined();
      expect(result.profile.followers).toBe(0);
      expect(result.comparison.vs_avg.followers).toBe('0%');
    });
  });
});
