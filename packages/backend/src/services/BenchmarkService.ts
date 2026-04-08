import Database from 'better-sqlite3';
import { SearchService, CompetitorData } from './SearchService.js';
import { AnalyticsService, Metrics } from './AnalyticsService.js';

/**
 * Benchmark result: profile metrics vs competitors
 */
export interface BenchmarkResult {
  profile: {
    followers: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  };
  competitors_avg: {
    followers: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  };
  competitors_best: {
    followers: number;
    engagement_rate: number;
    reach: number;
    impressions: number;
  };
  comparison: {
    vs_avg: {
      followers: string; // "+15%"
      engagement_rate: string; // "+5.2%"
      reach: string;
      impressions: string;
    };
    vs_best: {
      followers: string; // "-8%"
      engagement_rate: string; // "+2.1%"
      reach: string;
      impressions: string;
    };
  };
  breakdown: {
    competitors_analyzed: number;
    data_collection_timestamp: string;
    confidence: 'high' | 'medium' | 'low';
  };
}

/**
 * Benchmark service — compare profile metrics against competitors
 * Integrates SearchService (to find competitors) and AnalyticsService (to collect metrics)
 */
export class BenchmarkService {
  private db: Database.Database;
  private searchService: SearchService;
  private analyticsService: AnalyticsService;

  constructor(
    db: Database.Database,
    searchService: SearchService,
    analyticsService: AnalyticsService
  ) {
    this.db = db;
    this.searchService = searchService;
    this.analyticsService = analyticsService;
  }

  /**
   * Get benchmark for a profile
   * If competitorHandles not provided, use stored competitors for the profile
   */
  async getBenchmark(
    profileId: string,
    userId: string,
    competitorHandles?: string[]
  ): Promise<BenchmarkResult> {
    // 1. Get profile metrics
    const profileMetrics = await this.analyticsService.getProfileMetrics(profileId, userId);
    if (!profileMetrics) {
      throw new Error(`Profile ${profileId} has no metrics available`);
    }

    // 2. Get competitor handles (from param or from profile context)
    let handles = competitorHandles || [];
    if (handles.length === 0) {
      // Try to get stored competitors from profile context
      handles = this.getStoredCompetitors(profileId);
    }

    if (handles.length === 0) {
      throw new Error('No competitor handles provided and no stored competitors found');
    }

    // 3. Search for competitor metrics
    const competitorDataList = await this.searchService.searchCompetitors(handles);
    if (competitorDataList.length === 0) {
      throw new Error('No competitor data found');
    }

    // 4. Convert competitor data to metrics format
    const competitorMetrics = this.convertCompetitorDataToMetrics(competitorDataList);

    // 5. Calculate benchmark
    const result = this.calculateBenchmark(profileMetrics, competitorMetrics);

    return result;
  }

  /**
   * Calculate benchmark: compare profile metrics against competitors
   * Computes percentage differences vs average and vs best
   */
  private calculateBenchmark(
    profileMetrics: Metrics,
    competitorMetrics: Metrics[]
  ): BenchmarkResult {
    if (competitorMetrics.length === 0) {
      throw new Error('No competitor metrics to calculate benchmark');
    }

    // Calculate averages
    const competitors_avg = {
      followers: competitorMetrics.reduce((sum, m) => sum + m.followers_count, 0) / competitorMetrics.length,
      engagement_rate: competitorMetrics.reduce((sum, m) => sum + m.engagement_rate, 0) / competitorMetrics.length,
      reach: competitorMetrics.reduce((sum, m) => sum + m.reach, 0) / competitorMetrics.length,
      impressions: competitorMetrics.reduce((sum, m) => sum + m.impressions, 0) / competitorMetrics.length,
    };

    // Calculate best (maximum) values
    const competitors_best = {
      followers: Math.max(...competitorMetrics.map((m) => m.followers_count)),
      engagement_rate: Math.max(...competitorMetrics.map((m) => m.engagement_rate)),
      reach: Math.max(...competitorMetrics.map((m) => m.reach)),
      impressions: Math.max(...competitorMetrics.map((m) => m.impressions)),
    };

    // Helper to format percentage
    const formatPercentage = (value: number): string => {
      if (!isFinite(value)) {
        return 'N/A';
      }
      const rounded = Math.round(value * 10) / 10; // 1 decimal place
      return `${rounded > 0 ? '+' : ''}${rounded}%`;
    };

    // Helper to calculate percentage difference
    const calculateDifference = (profile: number, benchmark: number): string => {
      if (benchmark === 0) {
        return profile === 0 ? '0%' : 'N/A';
      }
      const percent = ((profile - benchmark) / benchmark) * 100;
      return formatPercentage(percent);
    };

    const result: BenchmarkResult = {
      profile: {
        followers: profileMetrics.followers_count,
        engagement_rate: profileMetrics.engagement_rate,
        reach: profileMetrics.reach,
        impressions: profileMetrics.impressions,
      },
      competitors_avg: {
        followers: Math.round(competitors_avg.followers),
        engagement_rate: Math.round(competitors_avg.engagement_rate * 10) / 10,
        reach: Math.round(competitors_avg.reach),
        impressions: Math.round(competitors_avg.impressions),
      },
      competitors_best: {
        followers: competitors_best.followers,
        engagement_rate: Math.round(competitors_best.engagement_rate * 10) / 10,
        reach: competitors_best.reach,
        impressions: competitors_best.impressions,
      },
      comparison: {
        vs_avg: {
          followers: calculateDifference(profileMetrics.followers_count, competitors_avg.followers),
          engagement_rate: calculateDifference(
            profileMetrics.engagement_rate,
            competitors_avg.engagement_rate
          ),
          reach: calculateDifference(profileMetrics.reach, competitors_avg.reach),
          impressions: calculateDifference(profileMetrics.impressions, competitors_avg.impressions),
        },
        vs_best: {
          followers: calculateDifference(profileMetrics.followers_count, competitors_best.followers),
          engagement_rate: calculateDifference(
            profileMetrics.engagement_rate,
            competitors_best.engagement_rate
          ),
          reach: calculateDifference(profileMetrics.reach, competitors_best.reach),
          impressions: calculateDifference(profileMetrics.impressions, competitors_best.impressions),
        },
      },
      breakdown: {
        competitors_analyzed: competitorMetrics.length,
        data_collection_timestamp: new Date().toISOString(),
        confidence: competitorMetrics.length >= 3 ? 'high' : competitorMetrics.length === 2 ? 'medium' : 'low',
      },
    };

    return result;
  }

  /**
   * Get stored competitors for a profile (from profile context)
   * For now, returns empty array (future: persist in profiles table)
   */
  private getStoredCompetitors(profileId: string): string[] {
    try {
      const stmt = this.db.prepare(`
        SELECT competitors_json FROM profiles WHERE id = ?
      `);
      const row = stmt.get(profileId) as { competitors_json?: string } | undefined;

      if (row?.competitors_json) {
        const stored = JSON.parse(row.competitors_json) as string[];
        return Array.isArray(stored) ? stored : [];
      }
    } catch (error) {
      console.warn(`[BenchmarkService] Failed to get stored competitors: ${error}`);
    }

    return [];
  }

  /**
   * Convert CompetitorData to Metrics format for benchmark calculation
   * Maps competitor handles to estimated metrics
   */
  private convertCompetitorDataToMetrics(competitorDataList: CompetitorData[]): Metrics[] {
    return competitorDataList.map((competitor) => ({
      id: `comp-${competitor.handle}`,
      profile_id: competitor.handle,
      followers_count: competitor.followersEstimate || 0,
      engagement_rate: typeof competitor.engagementRate === 'string'
        ? parseFloat(competitor.engagementRate)
        : competitor.engagementRate || 0,
      reach: 0, // Not always available from search results
      impressions: 0, // Not always available from search results
      collected_at: new Date().toISOString(),
    }));
  }
}

export function createBenchmarkService(
  db: Database.Database,
  searchService: SearchService,
  analyticsService: AnalyticsService
): BenchmarkService {
  return new BenchmarkService(db, searchService, analyticsService);
}
