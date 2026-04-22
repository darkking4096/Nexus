import type { DatabaseAdapter } from '../config/database';
import { AnalyticsService } from './AnalyticsService.js';
import { Profile } from '../models/Profile.js';

/**
 * Current metrics for a post
 */
export interface CurrentMetrics {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  engagement_rate: number;
}

/**
 * Historical metrics for a post (daily snapshot)
 */
export interface MetricsSnapshot {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  engagement_rate: number;
}

/**
 * Post metrics response
 */
export interface PostMetricsResponse {
  id: string;
  content_id: string;
  profile_id: string;
  media_type: string | null;
  posted_at: string | null;
  current_metrics: CurrentMetrics;
  historical: MetricsSnapshot[];
}

/**
 * Content metrics service — returns detailed post metrics with historical data
 */
export class ContentMetricsService {
  private db: DatabaseAdapter;
  private analyticsService: AnalyticsService;
  private profileModel: Profile;

  constructor(db: DatabaseAdapter, analyticsService: AnalyticsService) {
    this.db = db;
    this.analyticsService = analyticsService;
    this.profileModel = new Profile(db);
  }

  /**
   * Get metrics for a specific post including historical data
   */
  async getPostMetricsWithHistory(
    contentId: string,
    profileId: string,
    userId: string,
    days: number = 7
  ): Promise<PostMetricsResponse> {
    // Verify profile ownership
    const profile = this.profileModel.getById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new Error('Access denied: Profile not found or access denied');
    }

    // Get current post metrics
    const currentMetrics = await this.analyticsService.getPostMetrics(profileId, contentId, userId);
    if (!currentMetrics) {
      throw new Error(`Post metrics not found for contentId: ${contentId}`);
    }

    // Get content details (media type, posted_at)
    const contentStmt = this.db.prepare(`
      SELECT media_type, posted_at FROM content WHERE id = ? AND profile_id = ?
    `);
    const content = contentStmt.get(contentId, profileId) as {
      media_type: string | null;
      posted_at: string | null;
    } | undefined;

    // Get historical metrics (daily snapshots)
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const historyStmt = this.db.prepare(`
      SELECT
        DATE(collected_at) as date,
        likes,
        comments,
        shares,
        saves,
        reach,
        CASE
          WHEN (likes + comments + shares) > 0
          THEN ROUND(((likes + comments + shares) * 100.0 / NULLIF(reach, 0)), 1)
          ELSE 0
        END as engagement_rate
      FROM post_metrics
      WHERE content_id = ? AND profile_id = ? AND collected_at >= ?
      GROUP BY DATE(collected_at)
      ORDER BY collected_at ASC
    `);

    const historical = (historyStmt.all(contentId, profileId, daysAgo) as MetricsSnapshot[]) || [];

    // Calculate engagement rate for current metrics
    const currentEngagementRate =
      currentMetrics.reach > 0
        ? Math.round(((currentMetrics.likes + currentMetrics.comments + (currentMetrics.shares || 0)) / currentMetrics.reach) * 1000) / 10
        : 0;

    return {
      id: contentId,
      content_id: contentId,
      profile_id: profileId,
      media_type: content?.media_type || null,
      posted_at: content?.posted_at || null,
      current_metrics: {
        likes: currentMetrics.likes,
        comments: currentMetrics.comments,
        shares: currentMetrics.shares || 0,
        saves: currentMetrics.saves || 0,
        reach: currentMetrics.reach,
        engagement_rate: currentEngagementRate,
      },
      historical,
    };
  }

  /**
   * Get growth metrics for a post
   */
  async getPostGrowth(
    contentId: string,
    profileId: string,
    userId: string
  ): Promise<{
    likes_per_hour: number;
    comments_per_hour: number;
    growth_rate: string; // percentage
  }> {
    // Verify profile ownership
    const profile = this.profileModel.getById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new Error('Access denied: Profile not found or access denied');
    }

    // Get oldest and newest metrics for this post
    const stmt = this.db.prepare(`
      SELECT
        (SELECT likes FROM post_metrics WHERE content_id = ? AND profile_id = ? ORDER BY collected_at ASC LIMIT 1) as initial_likes,
        (SELECT likes FROM post_metrics WHERE content_id = ? AND profile_id = ? ORDER BY collected_at DESC LIMIT 1) as current_likes,
        (SELECT collected_at FROM post_metrics WHERE content_id = ? AND profile_id = ? ORDER BY collected_at ASC LIMIT 1) as first_recorded,
        (SELECT collected_at FROM post_metrics WHERE content_id = ? AND profile_id = ? ORDER BY collected_at DESC LIMIT 1) as last_recorded
    `);

    const growth = stmt.get(contentId, profileId, contentId, profileId, contentId, profileId, contentId, profileId) as {
      initial_likes: number | null;
      current_likes: number | null;
      first_recorded: string | null;
      last_recorded: string | null;
    };

    if (!growth.initial_likes || !growth.current_likes || !growth.first_recorded || !growth.last_recorded) {
      return {
        likes_per_hour: 0,
        comments_per_hour: 0,
        growth_rate: '0%',
      };
    }

    // Calculate hours between first and last recorded
    const firstDate = new Date(growth.first_recorded);
    const lastDate = new Date(growth.last_recorded);
    const hoursDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60);

    const likesPerHour = hoursDiff > 0 ? (growth.current_likes - growth.initial_likes) / hoursDiff : 0;
    const growthRate = growth.initial_likes > 0 ? ((growth.current_likes - growth.initial_likes) / growth.initial_likes * 100).toFixed(1) : '0';

    return {
      likes_per_hour: Math.round(likesPerHour * 100) / 100,
      comments_per_hour: 0, // Can be calculated similarly
      growth_rate: `${growthRate}%`,
    };
  }
}
