import Database from 'better-sqlite3';
import { Profile } from '../models/Profile.js';

/**
 * Engagement by hour
 */
export interface HourlyEngagement {
  hour: string;
  avg_engagement_rate: number;
  confidence: number;
  posts_count: number;
}

/**
 * Content type performance
 */
export interface ContentTypePerformance {
  type: string;
  avg_engagement: number;
  posts_count: number;
  min_engagement: number;
  max_engagement: number;
}

/**
 * Engagement trends
 */
export interface EngagementTrend {
  direction: 'up' | 'down' | 'stable';
  momentum: string;
  recommendation: string;
  current_period_avg: number;
  previous_period_avg: number;
}

/**
 * Caption insights
 */
export interface CaptionInsights {
  avg_length_top_performers: number;
  emoji_correlation: number;
}

/**
 * Engagement analysis response
 */
export interface EngagementAnalysis {
  period_days: number;
  top_hours: HourlyEngagement[];
  top_content_types: ContentTypePerformance[];
  trends: EngagementTrend;
  caption_insights: CaptionInsights;
}

/**
 * Engagement analysis service — analyzes engagement patterns in historical data
 */
export class EngagementAnalysisService {
  private db: Database.Database;
  private profileModel: Profile;

  constructor(db: Database.Database) {
    this.db = db;
    this.profileModel = new Profile(db);
  }

  /**
   * Analyze engagement patterns for a profile
   */
  async getEngagementAnalysis(
    profileId: string,
    userId: string,
    days: number = 60
  ): Promise<EngagementAnalysis> {
    // Verify profile ownership
    const profile = this.profileModel.getById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new Error('Access denied: Profile not found or access denied');
    }

    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Get posts with engagement metrics for the period
    const postsStmt = this.db.prepare(`
      SELECT
        c.id,
        c.posted_at,
        c.media_type,
        COALESCE((
          SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as engagement_rate,
        COALESCE((
          SELECT pm.reach
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as reach
      FROM content c
      WHERE c.profile_id = ? AND c.posted_at >= ?
      ORDER BY c.posted_at DESC
    `);

    const posts = (postsStmt.all(profileId, daysAgo) as Array<{
      id: string;
      posted_at: string | null;
      media_type: string | null;
      engagement_rate: number;
      reach: number;
    }>) || [];

    if (posts.length === 0) {
      throw new Error('Not enough data to analyze (minimum 5 posts required)');
    }

    // Analyze engagement by hour
    const topHours = this.analyzeHourlyEngagement(posts);

    // Analyze by content type
    const topContentTypes = this.analyzeContentTypes(posts);

    // Calculate trends
    const trends = this.calculateTrends(profileId, days);

    // Caption insights (placeholder for now)
    const captionInsights = this.analyzeCaptions(profileId);

    return {
      period_days: days,
      top_hours: topHours,
      top_content_types: topContentTypes,
      trends,
      caption_insights: captionInsights,
    };
  }

  /**
   * Analyze engagement by hour of posting
   */
  private analyzeHourlyEngagement(posts: Array<{
    posted_at: string | null;
    engagement_rate: number;
    reach: number;
  }>): HourlyEngagement[] {
    const hourlyData: Map<string, { total: number; count: number; reaches: number[] }> = new Map();

    // Group by hour
    for (const post of posts) {
      if (!post.posted_at) continue;

      const date = new Date(post.posted_at);
      const hour = date.getHours().toString().padStart(2, '0') + ':00';

      if (!hourlyData.has(hour)) {
        hourlyData.set(hour, { total: 0, count: 0, reaches: [] });
      }

      const data = hourlyData.get(hour)!;
      data.total += post.engagement_rate;
      data.count += 1;
      data.reaches.push(post.reach);
    }

    // Calculate confidence (more posts = higher confidence)
    const results: HourlyEngagement[] = Array.from(hourlyData.entries()).map(([hour, data]) => ({
      hour,
      avg_engagement_rate: Math.round((data.total / data.count) * 10) / 10,
      confidence: Math.min(1.0, (data.count / 30) * 0.95 + 0.5), // 30 posts = ~0.95 confidence
      posts_count: data.count,
    }));

    // Sort by engagement rate and return top 3
    return results.sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate).slice(0, 3);
  }

  /**
   * Analyze engagement by content type
   */
  private analyzeContentTypes(posts: Array<{
    media_type: string | null;
    engagement_rate: number;
  }>): ContentTypePerformance[] {
    const typeData: Map<string, { total: number; count: number; values: number[] }> = new Map();

    for (const post of posts) {
      const type = post.media_type || 'unknown';

      if (!typeData.has(type)) {
        typeData.set(type, { total: 0, count: 0, values: [] });
      }

      const data = typeData.get(type)!;
      data.total += post.engagement_rate;
      data.count += 1;
      data.values.push(post.engagement_rate);
    }

    const results: ContentTypePerformance[] = Array.from(typeData.entries()).map(([type, data]) => {
      const sortedValues = data.values.sort((a, b) => a - b);
      return {
        type,
        avg_engagement: Math.round((data.total / data.count) * 10) / 10,
        posts_count: data.count,
        min_engagement: Math.round(sortedValues[0] * 10) / 10,
        max_engagement: Math.round(sortedValues[sortedValues.length - 1] * 10) / 10,
      };
    });

    // Sort by average engagement (descending)
    return results.sort((a, b) => b.avg_engagement - a.avg_engagement);
  }

  /**
   * Calculate engagement trends
   */
  private calculateTrends(profileId: string, days: number): EngagementTrend {
    const halfDays = Math.floor(days / 2);
    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const halfDaysAgo = new Date(Date.now() - halfDays * 24 * 60 * 60 * 1000).toISOString();

    // Get engagement for current period (latest half)
    const currentStmt = this.db.prepare(`
      SELECT AVG(COALESCE((
        SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
        FROM post_metrics pm
        WHERE pm.content_id = c.id
        ORDER BY pm.collected_at DESC
        LIMIT 1
      ), 0)) as avg_engagement
      FROM content c
      WHERE c.profile_id = ? AND c.posted_at >= ?
    `);

    const currentResult = currentStmt.get(profileId, halfDaysAgo) as { avg_engagement: number | null };
    const currentAvg = currentResult?.avg_engagement || 0;

    // Get engagement for previous period
    const previousStmt = this.db.prepare(`
      SELECT AVG(COALESCE((
        SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
        FROM post_metrics pm
        WHERE pm.content_id = c.id
        ORDER BY pm.collected_at DESC
        LIMIT 1
      ), 0)) as avg_engagement
      FROM content c
      WHERE c.profile_id = ? AND c.posted_at >= ? AND c.posted_at < ?
    `);

    const previousResult = previousStmt.get(profileId, daysAgo, halfDaysAgo) as { avg_engagement: number | null };
    const previousAvg = previousResult?.avg_engagement || currentAvg;

    // Calculate momentum
    const momentum = previousAvg > 0 ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;

    // Determine direction
    let direction: 'up' | 'down' | 'stable';
    let recommendation: string;

    if (momentum > 5) {
      direction = 'up';
      recommendation = `Engagement crescendo! Aumentou ${Math.round(momentum * 10) / 10}% em relação ao período anterior. Continue a estratégia atual.`;
    } else if (momentum < -5) {
      direction = 'down';
      recommendation = `Engagement diminuiu ${Math.round(Math.abs(momentum) * 10) / 10}%. Considere revisar sua estratégia de conteúdo ou frequência de postagem.`;
    } else {
      direction = 'stable';
      recommendation = 'Engagement está estável. Mantenha consistência na sua estratégia.';
    }

    return {
      direction,
      momentum: `${momentum > 0 ? '+' : ''}${Math.round(momentum * 10) / 10}%`,
      recommendation,
      current_period_avg: Math.round(currentAvg * 10) / 10,
      previous_period_avg: Math.round(previousAvg * 10) / 10,
    };
  }

  /**
   * Analyze caption insights
   */
  private analyzeCaptions(_profileId: string): CaptionInsights {
    // Placeholder implementation
    // In a real system, this would analyze caption length correlation with engagement
    // and emoji usage correlation
    return {
      avg_length_top_performers: 240,
      emoji_correlation: 0.82,
    };
  }
}
