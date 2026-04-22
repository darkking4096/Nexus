import type { DatabaseAdapter } from '../config/database';

export interface BestTime {
  time: string;
  hour: number;
  engagement_score: number;
  posts_analyzed: number;
}

interface PostCountResult {
  cnt: number;
}

/**
 * BestTimesCalculator
 * Analyzes historical engagement data to suggest optimal posting times
 * AC 3: Suggest best times based on engagement history (7-30 days)
 */
export class BestTimesCalculator {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Calculate best times for a profile based on engagement history
   * Returns top 5 times with highest engagement scores
   */
  calculateBestTimes(profileId: string, daysBack: number = 7): BestTime[] {
    // Verify profile has sufficient historical data (>5 posts)
    const postCountStmt = this.db.prepare(`
      SELECT COUNT(*) as cnt FROM content WHERE profile_id = ? AND status IN ('published', 'scheduled')
    `);
    const postCountResult = postCountStmt.get(profileId) as PostCountResult | undefined;
    const postCount = postCountResult?.cnt || 0;

    if (postCount < 5) {
      throw new Error('insufficient_data: Profile requires at least 5 published posts');
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);
    const startDateStr = startDate.toISOString();

    // Get published posts with their engagement metrics
    const stmt = this.db.prepare(`
      SELECT
        c.id,
        c.published_at,
        COALESCE(pm.likes, 0) + COALESCE(pm.comments, 0) + COALESCE(pm.shares, 0) + COALESCE(pm.saves, 0) as engagement_score
      FROM content c
      LEFT JOIN post_metrics pm ON c.id = pm.content_id
      WHERE c.profile_id = ? AND c.status = 'published' AND c.published_at >= ?
      ORDER BY c.published_at DESC
    `);

    const posts = stmt.all(profileId, startDateStr) as Array<{
      id: string;
      published_at: string;
      engagement_score: number;
    }>;

    if (posts.length === 0) {
      return this.getDefaultBestTimes();
    }

    // Group by hour and calculate average engagement
    const hourlyStats: Record<
      number,
      { total_engagement: number; post_count: number; times: string[] }
    > = {};

    for (const post of posts) {
      const publishDate = new Date(post.published_at);
      const hour = publishDate.getUTCHours();

      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { total_engagement: 0, post_count: 0, times: [] };
      }

      hourlyStats[hour].total_engagement += post.engagement_score;
      hourlyStats[hour].post_count += 1;
      hourlyStats[hour].times.push(`${String(hour).padStart(2, '0')}:00`);
    }

    // Calculate scores and sort
    const bestTimes: BestTime[] = Object.entries(hourlyStats)
      .map(([hourStr, stats]) => ({
        hour: parseInt(hourStr),
        time: `${String(hourStr).padStart(2, '0')}:00`,
        engagement_score: stats.total_engagement / stats.post_count,
        posts_analyzed: stats.post_count,
      }))
      .sort((a, b) => b.engagement_score - a.engagement_score)
      .slice(0, 5);

    return bestTimes.length > 0 ? bestTimes : this.getDefaultBestTimes();
  }

  /**
   * Return default best times when insufficient data
   * Default to common posting times: 9am, 12pm, 3pm, 6pm, 8pm
   */
  private getDefaultBestTimes(): BestTime[] {
    const defaultHours = [9, 12, 15, 18, 20];

    return defaultHours.map(hour => ({
      hour,
      time: `${String(hour).padStart(2, '0')}:00`,
      engagement_score: 0,
      posts_analyzed: 0,
    }));
  }
}
