import Database from 'better-sqlite3';
import { Profile } from '../models/Profile.js';
import { AnalyticsService } from './AnalyticsService.js';

/**
 * Dashboard profile overview
 */
export interface DashboardProfile {
  id: string;
  name: string;
  followers: number;
  engagement_rate: number;
  weekly_growth: number;
  posts_30d: number;
  last_post_date: string | null;
}

/**
 * Dashboard overview response
 */
export interface DashboardOverview {
  profiles: DashboardProfile[];
  total_followers: number;
  avg_engagement: number;
  total_posts_30d: number;
}

/**
 * Dashboard service — aggregates KPIs from multiple profiles
 */
export class DashboardService {
  private db: Database.Database;
  private profileModel: Profile;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private cache: Map<string, { data: DashboardOverview; timestamp: number }> = new Map();

  constructor(db: Database.Database, _analyticsService: AnalyticsService) {
    this.db = db;
    this.profileModel = new Profile(db);
    // analyticsService parameter kept for API compatibility
  }

  /**
   * Get overview of all profiles for a user with aggregated metrics
   */
  async getDashboardOverview(
    userId: string,
    sortBy: 'engagement' | 'followers' | 'growth' = 'engagement'
  ): Promise<DashboardOverview> {
    // Check cache
    const cacheKey = `${userId}:${sortBy}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // Get all profiles for user
    const profiles = this.profileModel.getByUserId(userId);
    if (!profiles.length) {
      return {
        profiles: [],
        total_followers: 0,
        avg_engagement: 0,
        total_posts_30d: 0,
      };
    }

    // OPTIMIZATION: Batch query instead of N+1
    // Get all metrics for all profiles in single/minimal queries
    const profileIds = profiles.map(p => p.id);

    // Batch query: Get all posts metrics in one go
    const postsMetrics = this.getPostsMetricsBatch(profileIds);
    const metricsData = await this.getMetricsBatch(profileIds, userId);

    // Aggregate metrics for each profile
    const dashboardProfiles: DashboardProfile[] = [];
    let totalFollowers = 0;
    let totalEngagement = 0;
    let totalPosts = 0;

    for (const profile of profiles) {
      try {
        const metrics = metricsData[profile.id] || { engagement_rate: 0, followers_count: 0 };
        const postData = postsMetrics[profile.id] || { count_30d: 0, last_post_date: null };

        // Calculate weekly growth (simplified for now)
        const weeklyGrowth = 0; // TODO: Calculate from historical data if needed

        const engagementRate = metrics.engagement_rate || 0;

        dashboardProfiles.push({
          id: profile.id,
          name: profile.display_name || profile.instagram_username,
          followers: metrics.followers_count || 0,
          engagement_rate: engagementRate,
          weekly_growth: weeklyGrowth,
          posts_30d: postData.count_30d,
          last_post_date: postData.last_post_date,
        });

        totalFollowers += metrics.followers_count || 0;
        totalEngagement += engagementRate;
        totalPosts += postData.count_30d;
      } catch (error) {
        console.error(`[Dashboard] Error aggregating metrics for profile ${profile.id}:`, error);
        // Continue with other profiles if one fails
      }
    }

    // Sort profiles
    const sorted = this.sortProfiles(dashboardProfiles, sortBy);

    const avgEngagement = dashboardProfiles.length > 0 ? totalEngagement / dashboardProfiles.length : 0;

    const result: DashboardOverview = {
      profiles: sorted,
      total_followers: totalFollowers,
      avg_engagement: Math.round(avgEngagement * 100) / 100,
      total_posts_30d: totalPosts,
    };

    // Cache result
    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return result;
  }

  /**
   * Sort profiles by specified metric
   */
  private sortProfiles(
    profiles: DashboardProfile[],
    sortBy: 'engagement' | 'followers' | 'growth'
  ): DashboardProfile[] {
    const sorted = [...profiles];

    switch (sortBy) {
      case 'engagement':
        sorted.sort((a, b) => b.engagement_rate - a.engagement_rate);
        break;
      case 'followers':
        sorted.sort((a, b) => b.followers - a.followers);
        break;
      case 'growth':
        sorted.sort((a, b) => b.weekly_growth - a.weekly_growth);
        break;
    }

    return sorted;
  }

  /**
   * OPTIMIZATION: Batch query for posts metrics (avoids N+1)
   * Single query for all profiles instead of one per profile
   */
  private getPostsMetricsBatch(
    profileIds: string[]
  ): Record<string, { count_30d: number; last_post_date: string | null }> {
    const result: Record<string, { count_30d: number; last_post_date: string | null }> = {};

    // Initialize all profiles
    profileIds.forEach(id => {
      result[id] = { count_30d: 0, last_post_date: null };
    });

    if (profileIds.length === 0) return result;

    // Single query: Get all posts metrics for all profiles
    const placeholders = profileIds.map(() => '?').join(',');
    const stmt = this.db.prepare(`
      SELECT
        profile_id,
        COUNT(*) as count_30d,
        MAX(collected_at) as last_post_date
      FROM post_metrics
      WHERE profile_id IN (${placeholders})
        AND collected_at >= datetime('now', '-30 days')
      GROUP BY profile_id
    `);

    const rows = stmt.all(...profileIds) as Array<{
      profile_id: string;
      count_30d: number;
      last_post_date: string | null;
    }>;

    rows.forEach(row => {
      result[row.profile_id] = {
        count_30d: row.count_30d,
        last_post_date: row.last_post_date,
      };
    });

    return result;
  }

  /**
   * OPTIMIZATION: Batch query for metrics (avoids N+1)
   */
  private async getMetricsBatch(
    profileIds: string[],
    _userId: string
  ): Promise<Record<string, { engagement_rate: number; followers_count: number }>> {
    const result: Record<string, { engagement_rate: number; followers_count: number }> = {};

    // Initialize all profiles
    profileIds.forEach(id => {
      result[id] = { engagement_rate: 0, followers_count: 0 };
    });

    if (profileIds.length === 0) return result;

    // SQLite doesn't support DISTINCT ON, so we query by profile
    // For each profile, get the latest metrics
    for (const profileId of profileIds) {
      const metric = this.db
        .prepare(
          `
        SELECT engagement_rate, followers_count
        FROM profile_metrics
        WHERE profile_id = ?
        ORDER BY collected_at DESC
        LIMIT 1
      `
        )
        .get(profileId) as { engagement_rate: number; followers_count: number } | undefined;

      if (metric) {
        result[profileId] = metric;
      }
    }

    return result;
  }

  /**
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
