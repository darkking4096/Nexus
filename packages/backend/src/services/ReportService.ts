import Database from 'better-sqlite3';
import { Profile } from '../models/Profile.js';

/**
 * Summary metrics for a period
 */
export interface PeriodSummary {
  followers_gained: number;
  followers_growth_pct: number;
  posts_published: number;
  avg_engagement_rate: number;
  total_reach: number;
  total_impressions: number;
}

/**
 * Comparison with previous period
 */
export interface PeriodComparison {
  followers_gain_delta: string;
  engagement_delta: string;
  reach_delta: string;
}

/**
 * Post summary for report
 */
export interface PostSummary {
  id: string;
  content_id: string;
  type: string | null;
  likes: number;
  comments: number;
  reach: number;
  engagement: number;
  posted_at: string | null;
}

/**
 * Performance report response
 */
export interface PerformanceReport {
  profile_id: string;
  period: string;
  date_range: { start: string; end: string };
  summary: PeriodSummary;
  vs_previous_period: PeriodComparison;
  top_posts: PostSummary[];
  bottom_posts: PostSummary[];
  key_insights: string[];
}

/**
 * Report service — generates consolidated performance reports
 */
export class ReportService {
  private db: Database.Database;
  private profileModel: Profile;

  constructor(db: Database.Database) {
    this.db = db;
    this.profileModel = new Profile(db);
  }

  /**
   * Generate performance report for a period
   */
  async generateReport(
    profileId: string,
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<PerformanceReport> {
    // Verify profile ownership
    const profile = this.profileModel.getById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new Error('Access denied: Profile not found or access denied');
    }

    // Get metrics for the period
    const summary = await this.getPeriodSummary(profileId, startDate, endDate);

    // Get metrics for previous period (same duration)
    const periodDays = this.getDateDifference(startDate, endDate);
    const prevStart = this.addDays(startDate, -periodDays - 1);
    const prevEnd = this.addDays(startDate, -1);
    const previousSummary = await this.getPeriodSummary(profileId, prevStart, prevEnd);

    // Calculate comparisons
    const comparison = this.calculateComparison(summary, previousSummary);

    // Get top and bottom posts
    const topPosts = await this.getTopPosts(profileId, startDate, endDate, 3, 'top');
    const bottomPosts = await this.getTopPosts(profileId, startDate, endDate, 3, 'bottom');

    // Get key insights
    const insights = this.generateInsights(summary, topPosts, bottomPosts);

    // Determine period label
    const periodLabel = this.getPeriodLabel(startDate, endDate);

    return {
      profile_id: profileId,
      period: periodLabel,
      date_range: { start: startDate, end: endDate },
      summary,
      vs_previous_period: comparison,
      top_posts: topPosts,
      bottom_posts: bottomPosts,
      key_insights: insights,
    };
  }

  /**
   * Get summary metrics for a period
   */
  private async getPeriodSummary(
    profileId: string,
    startDate: string,
    endDate: string
  ): Promise<PeriodSummary> {
    // Get follower metrics
    const followerStmt = this.db.prepare(`
      SELECT
        (SELECT followers_count FROM metrics WHERE profile_id = ? AND collected_at <= ? ORDER BY collected_at DESC LIMIT 1) as end_followers,
        (SELECT followers_count FROM metrics WHERE profile_id = ? AND collected_at < ? ORDER BY collected_at DESC LIMIT 1) as start_followers
    `);

    const followerData = followerStmt.get(profileId, endDate, profileId, startDate) as {
      end_followers: number | null;
      start_followers: number | null;
    };

    const startFollowers = followerData?.start_followers || 0;
    const endFollowers = followerData?.end_followers || startFollowers;
    const followersGained = endFollowers - startFollowers;
    const followersGrowthPct = startFollowers > 0 ? (followersGained / startFollowers) * 100 : 0;

    // Get post and engagement metrics
    const metricsStmt = this.db.prepare(`
      SELECT
        COUNT(DISTINCT c.id) as posts_published,
        AVG(COALESCE((
          SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0)) as avg_engagement,
        SUM(COALESCE((
          SELECT pm.reach
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0)) as total_reach,
        SUM(COALESCE((
          SELECT pm.reach
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0)) as total_impressions
      FROM content c
      WHERE c.profile_id = ? AND c.posted_at >= ? AND c.posted_at <= ?
    `);

    const metrics = metricsStmt.get(profileId, startDate, endDate) as {
      posts_published: number;
      avg_engagement: number | null;
      total_reach: number | null;
      total_impressions: number | null;
    };

    return {
      followers_gained: Math.round(followersGained),
      followers_growth_pct: Math.round(followersGrowthPct * 10) / 10,
      posts_published: metrics?.posts_published || 0,
      avg_engagement_rate: metrics?.avg_engagement ? Math.round(metrics.avg_engagement * 10) / 10 : 0,
      total_reach: metrics?.total_reach || 0,
      total_impressions: metrics?.total_impressions || 0,
    };
  }

  /**
   * Get top or bottom posts for a period
   */
  private async getTopPosts(
    profileId: string,
    startDate: string,
    endDate: string,
    limit: number,
    order: 'top' | 'bottom'
  ): Promise<PostSummary[]> {
    const orderClause = order === 'top' ? 'DESC' : 'ASC';

    const stmt = this.db.prepare(`
      SELECT
        c.id,
        c.id as content_id,
        c.media_type as type,
        c.posted_at,
        COALESCE((
          SELECT pm.likes
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as likes,
        COALESCE((
          SELECT pm.comments
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as comments,
        COALESCE((
          SELECT pm.reach
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as reach,
        COALESCE((
          SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as engagement
      FROM content c
      WHERE c.profile_id = ? AND c.posted_at >= ? AND c.posted_at <= ?
      ORDER BY engagement ${orderClause}
      LIMIT ?
    `);

    const posts = (stmt.all(profileId, startDate, endDate, limit) as PostSummary[]) || [];
    return posts;
  }

  /**
   * Calculate comparison with previous period
   */
  private calculateComparison(
    current: PeriodSummary,
    previous: PeriodSummary
  ): PeriodComparison {
    const followerDelta = previous.followers_gained > 0
      ? ((current.followers_gained - previous.followers_gained) / previous.followers_gained * 100)
      : 0;

    const engagementDelta = previous.avg_engagement_rate > 0
      ? ((current.avg_engagement_rate - previous.avg_engagement_rate) / previous.avg_engagement_rate * 100)
      : 0;

    const reachDelta = previous.total_reach > 0
      ? ((current.total_reach - previous.total_reach) / previous.total_reach * 100)
      : 0;

    return {
      followers_gain_delta: `${followerDelta > 0 ? '+' : ''}${Math.round(followerDelta * 10) / 10}%`,
      engagement_delta: `${engagementDelta > 0 ? '+' : ''}${Math.round(engagementDelta * 10) / 10}%`,
      reach_delta: `${reachDelta > 0 ? '+' : ''}${Math.round(reachDelta * 10) / 10}%`,
    };
  }

  /**
   * Generate key insights from data
   */
  private generateInsights(
    summary: PeriodSummary,
    topPosts: PostSummary[],
    bottomPosts: PostSummary[]
  ): string[] {
    const insights: string[] = [];

    // Growth insight
    if (summary.followers_growth_pct > 0) {
      insights.push(`Crescimento de ${summary.followers_growth_pct}% em seguidores este período.`);
    }

    // Engagement insight
    if (summary.avg_engagement_rate > 10) {
      insights.push(`Engagement excepcional: ${summary.avg_engagement_rate}% de taxa média.`);
    } else if (summary.avg_engagement_rate > 5) {
      insights.push(`Taxa de engagement saudável: ${summary.avg_engagement_rate}% de média.`);
    }

    // Content type insight
    if (topPosts.length > 0) {
      const topType = topPosts[0].type || 'post';
      insights.push(`Top performer foi ${topType} com ${topPosts[0].engagement}% de engagement.`);
    }

    // Publication frequency insight
    if (summary.posts_published > 0) {
      insights.push(`${summary.posts_published} posts publicados com ${summary.total_reach} alcance total.`);
    }

    // Underperformance insight
    if (bottomPosts.length > 0 && bottomPosts[0].engagement < summary.avg_engagement_rate / 2) {
      insights.push(`Revisar estratégia de alguns posts - ${bottomPosts[0].type} teve apenas ${bottomPosts[0].engagement}% de engagement.`);
    }

    return insights;
  }

  /**
   * Get period label (e.g., "march-2026", "apr-14-2026")
   */
  private getPeriodLabel(startDate: string, endDate: string): string {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const year = start.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth}-${year}`.toLowerCase();
    }

    const startDay = start.getDate();
    const endDay = end.getDate();
    return `${startMonth}-${startDay}-${year}-to-${endMonth}-${endDay}`.toLowerCase();
  }

  /**
   * Helper: get difference in days between two dates
   */
  private getDateDifference(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }

  /**
   * Helper: add days to a date
   */
  private addDays(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
}
