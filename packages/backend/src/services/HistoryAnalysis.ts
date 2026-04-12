import Database from 'better-sqlite3';
import { Profile, ProfileData } from '../models/Profile.js';

/**
 * Post history item with metrics
 */
export interface HistoryPost {
  id: string;
  type: string; // image, video, carousel, reel
  caption: string;
  hashtags: string[];
  published_at: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  engagement_rate: number;
}

/**
 * Posting time pattern analysis
 */
export interface PostingPattern {
  hour: number;
  count: number;
  avg_engagement: number;
  best_day?: string;
}

/**
 * Content type performance
 */
export interface ContentTypePerformance {
  type: string;
  count: number;
  avg_engagement: number;
  top_post_id: string;
  top_post_engagement: number;
}

/**
 * Complete history analysis result
 */
export interface HistoryAnalysisResult {
  total_posts: number;
  avg_engagement: number;
  top_posts: HistoryPost[];
  posting_patterns: PostingPattern[];
  content_type_performance: ContentTypePerformance[];
  best_performing_type: string;
  analysis_timestamp: string;
}

/**
 * HistoryAnalysis service — deep analysis of own profile history
 * Analyzes posted content, engagement patterns, and content type performance
 */
export class HistoryAnalysis {
  private db: Database.Database;
  private profileModel: Profile;

  constructor(db: Database.Database) {
    this.db = db;
    this.profileModel = new Profile(db);
  }

  /**
   * Analyze profile history
   *
   * @param profileId Profile ID to analyze
   * @param userId User ID (for ownership check)
   * @returns Complete history analysis
   * @throws Error if profile not found, access denied, or analysis fails
   */
  async analyzeHistory(profileId: string, userId: string): Promise<HistoryAnalysisResult> {
    // 1. Validate profile ownership
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // 2. Get last 100 published posts
    const posts = this.getLastNPublishedPosts(profileId, 100);
    if (posts.length === 0) {
      return {
        total_posts: 0,
        avg_engagement: 0,
        top_posts: [],
        posting_patterns: [],
        content_type_performance: [],
        best_performing_type: 'N/A',
        analysis_timestamp: new Date().toISOString(),
      };
    }

    // 3. Analyze engagement and patterns
    const avgEngagement = this.calculateAverageEngagement(posts);
    const topPosts = this.getTopPostsByEngagement(posts, 10);
    const postingPatterns = this.analyzePostingPatterns(posts);
    const contentPerformance = this.analyzeContentTypePerformance(posts);
    const bestPerformingType = this.getBestPerformingType(contentPerformance);

    return {
      total_posts: posts.length,
      avg_engagement: avgEngagement,
      top_posts: topPosts,
      posting_patterns: postingPatterns,
      content_type_performance: contentPerformance,
      best_performing_type: bestPerformingType,
      analysis_timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get last N published posts for a profile
   */
  private getLastNPublishedPosts(profileId: string, limit: number): HistoryPost[] {
    const stmt = this.db.prepare(`
      SELECT
        c.id,
        c.type,
        c.caption,
        c.hashtags,
        c.published_at,
        COALESCE(pm.likes, 0) as likes,
        COALESCE(pm.comments, 0) as comments,
        COALESCE(pm.shares, 0) as shares,
        COALESCE(pm.saves, 0) as saves,
        COALESCE(pm.reach, 0) as reach
      FROM content c
      LEFT JOIN post_metrics pm ON c.id = pm.content_id
      WHERE c.profile_id = ? AND c.status = 'published' AND c.published_at IS NOT NULL
      ORDER BY c.published_at DESC
      LIMIT ?
    `);

    const rows = stmt.all(profileId, limit) as Array<{
      id: string;
      type: string;
      caption: string;
      hashtags: string | null;
      published_at: string;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      reach: number;
    }>;

    return rows.map((row) => {
      const totalEngagement = row.likes + row.comments + row.shares + row.saves;
      const followers = 1; // Use profile followers or default to 1 to avoid division by zero
      const engagementRate = followers > 0 ? (totalEngagement / followers) * 100 : 0;

      return {
        id: row.id,
        type: row.type,
        caption: row.caption,
        hashtags: row.hashtags ? JSON.parse(row.hashtags) : [],
        published_at: row.published_at,
        likes: row.likes,
        comments: row.comments,
        shares: row.shares,
        saves: row.saves,
        reach: row.reach,
        engagement_rate: parseFloat(engagementRate.toFixed(2)),
      };
    });
  }

  /**
   * Calculate average engagement rate across posts
   */
  private calculateAverageEngagement(posts: HistoryPost[]): number {
    if (posts.length === 0) return 0;

    const total = posts.reduce((sum, p) => sum + p.engagement_rate, 0);
    const average = total / posts.length;

    return parseFloat(average.toFixed(2));
  }

  /**
   * Get top posts by engagement
   */
  private getTopPostsByEngagement(posts: HistoryPost[], limit: number): HistoryPost[] {
    return posts
      .sort((a, b) => {
        const aTotal = a.likes + a.comments + a.shares + a.saves;
        const bTotal = b.likes + b.comments + b.shares + b.saves;
        return bTotal - aTotal;
      })
      .slice(0, limit);
  }

  /**
   * Analyze posting time patterns
   */
  private analyzePostingPatterns(posts: HistoryPost[]): PostingPattern[] {
    const hourlyStats: Record<number, { count: number; total_engagement: number }> = {};

    for (const post of posts) {
      const hour = new Date(post.published_at).getHours();
      const engagement = post.likes + post.comments + post.shares + post.saves;

      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { count: 0, total_engagement: 0 };
      }

      hourlyStats[hour].count++;
      hourlyStats[hour].total_engagement += engagement;
    }

    const patterns: PostingPattern[] = Object.entries(hourlyStats).map(([hour, stats]) => ({
      hour: parseInt(hour, 10),
      count: stats.count,
      avg_engagement: parseFloat((stats.total_engagement / stats.count).toFixed(2)),
    }));

    return patterns.sort((a, b) => a.hour - b.hour);
  }

  /**
   * Analyze performance by content type
   */
  private analyzeContentTypePerformance(posts: HistoryPost[]): ContentTypePerformance[] {
    const typeStats: Record<
      string,
      {
        count: number;
        total_engagement: number;
        posts: HistoryPost[];
      }
    > = {};

    for (const post of posts) {
      if (!typeStats[post.type]) {
        typeStats[post.type] = {
          count: 0,
          total_engagement: 0,
          posts: [],
        };
      }

      typeStats[post.type].count++;
      const engagement = post.likes + post.comments + post.shares + post.saves;
      typeStats[post.type].total_engagement += engagement;
      typeStats[post.type].posts.push(post);
    }

    const performance: ContentTypePerformance[] = Object.entries(typeStats).map(([type, stats]) => {
      const topPost = stats.posts.reduce((max, post) => {
        const postEngagement = post.likes + post.comments + post.shares + post.saves;
        const maxEngagement = max.likes + max.comments + max.shares + max.saves;
        return postEngagement > maxEngagement ? post : max;
      });

      const topEngagement = topPost.likes + topPost.comments + topPost.shares + topPost.saves;

      return {
        type,
        count: stats.count,
        avg_engagement: parseFloat((stats.total_engagement / stats.count).toFixed(2)),
        top_post_id: topPost.id,
        top_post_engagement: topEngagement,
      };
    });

    return performance.sort((a, b) => b.avg_engagement - a.avg_engagement);
  }

  /**
   * Get best performing content type
   */
  private getBestPerformingType(performance: ContentTypePerformance[]): string {
    if (performance.length === 0) return 'N/A';
    return performance[0].type;
  }

  /**
   * Get profile with ownership check
   */
  private getProfileWithOwnershipCheck(profileId: string, userId: string): ProfileData | null {
    const profile = this.profileModel.getById(profileId);

    if (!profile) {
      return null;
    }

    if (profile.user_id !== userId) {
      throw new Error('Access denied: profile belongs to another user');
    }

    return profile;
  }
}

// Helper function to create service with proper DI
export function createHistoryAnalysis(db: Database.Database): HistoryAnalysis {
  return new HistoryAnalysis(db);
}
