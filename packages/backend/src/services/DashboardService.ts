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
  private analyticsService: AnalyticsService;
  private readonly CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes
  private cache: Map<string, { data: DashboardOverview; timestamp: number }> = new Map();

  constructor(db: Database.Database, analyticsService: AnalyticsService) {
    this.db = db;
    this.profileModel = new Profile(db);
    this.analyticsService = analyticsService;
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

    // Aggregate metrics for each profile
    const dashboardProfiles: DashboardProfile[] = [];
    let totalFollowers = 0;
    let totalEngagement = 0;
    let totalPosts = 0;

    for (const profile of profiles) {
      try {
        const metrics = await this.analyticsService.getProfileMetrics(profile.id, userId);
        const history = await this.analyticsService.getMetricsHistory(profile.id, userId, 7);

        // Calculate weekly growth
        let weeklyGrowth = 0;
        if (history.length >= 2) {
          const oldFollowers = history[0].followers || 0;
          const newFollowers = history[history.length - 1].followers || 0;
          weeklyGrowth = newFollowers - oldFollowers;
        }

        // Get posts in last 30 days
        const postsStmt = this.db.prepare(`
          SELECT COUNT(*) as count
          FROM post_metrics
          WHERE profile_id = ? AND collected_at >= datetime('now', '-30 days')
        `);
        const postsResult = postsStmt.get(profile.id) as { count: number };
        const posts30d = postsResult?.count || 0;

        // Get last post date
        const lastPostStmt = this.db.prepare(`
          SELECT MAX(collected_at) as last_post_date
          FROM post_metrics
          WHERE profile_id = ?
        `);
        const lastPostResult = lastPostStmt.get(profile.id) as { last_post_date: string | null };

        const engagementRate = metrics?.engagement_rate || 0;

        dashboardProfiles.push({
          id: profile.id,
          name: profile.display_name || profile.instagram_username,
          followers: metrics?.followers_count || 0,
          engagement_rate: engagementRate,
          weekly_growth: weeklyGrowth,
          posts_30d: posts30d,
          last_post_date: lastPostResult?.last_post_date || null,
        });

        totalFollowers += metrics?.followers_count || 0;
        totalEngagement += engagementRate;
        totalPosts += posts30d;
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
   * Clear cache (for testing or manual refresh)
   */
  clearCache(): void {
    this.cache.clear();
  }
}
