import Database from 'better-sqlite3';
import { Profile, ProfileData } from '../models/Profile.js';
import { Competitor, CompetitorData } from '../models/Competitor.js';

/**
 * Post data structure for competitor analysis
 */
export interface Post {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  hashtags: string[];
  content_type: 'image' | 'video' | 'carousel' | 'reel';
}

/**
 * Engagement metrics for a post
 */
export interface EngagementMetrics {
  post_id: string;
  engagement_rate: number; // (likes + comments + shares) / followers * 100
  likes: number;
  comments: number;
  shares: number;
}

/**
 * Content pattern identified across posts
 */
export interface ContentPattern {
  type: string; // e.g., "hashtag", "content_type", "posting_time", "caption_length"
  value: string;
  frequency: number;
  average_engagement: number;
}

/**
 * Trend detected in competitor analysis
 */
export interface CompetitorTrend {
  trend_type: string; // e.g., "rising_hashtag", "content_shift", "engagement_trend"
  description: string;
  confidence: number; // 0-1 score
  data_points: string[];
}

/**
 * Analyzed competitor summary
 */
export interface AnalyzedCompetitor {
  handle: string;
  followers: number;
  avg_engagement: number;
  top_posts: Post[];
  content_patterns: ContentPattern[];
  trends: CompetitorTrend[];
}

/**
 * Complete competitor analysis result
 */
export interface CompetitorAnalysisResult {
  competitors: AnalyzedCompetitor[];
  analysis_timestamp: string;
  total_posts_analyzed: number;
}

/**
 * CompetitorAnalysis service — deep analysis of competitor data
 * Orchestrates post fetching, engagement calculation, and pattern detection
 */
export class CompetitorAnalysis {
  private profileModel: Profile;
  private competitorModel: Competitor;

  constructor(db: Database.Database) {
    this.profileModel = new Profile(db);
    this.competitorModel = new Competitor(db);
  }

  /**
   * Analyze competitors for a profile
   *
   * @param profileId Profile ID to analyze competitors for
   * @param userId User ID (for ownership check)
   * @returns Complete competitor analysis
   * @throws Error if profile not found, access denied, or analysis fails
   */
  async analyzeCompetitors(profileId: string, userId: string): Promise<CompetitorAnalysisResult> {
    // 1. Validate profile ownership
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // 2. Get all competitors for this profile
    const competitors = this.competitorModel.getByProfileId(profileId);
    if (competitors.length === 0) {
      return {
        competitors: [],
        analysis_timestamp: new Date().toISOString(),
        total_posts_analyzed: 0,
      };
    }

    // 3. Analyze each competitor
    const analyzedCompetitors: AnalyzedCompetitor[] = [];
    let totalPostsAnalyzed = 0;

    for (const competitor of competitors) {
      try {
        const analyzed = await this.analyzeCompetitor(competitor);
        analyzedCompetitors.push(analyzed);
        totalPostsAnalyzed += analyzed.top_posts.length;
      } catch (error) {
        console.error(`Failed to analyze competitor ${competitor.instagram_username}:`, error);
        // Continue with next competitor
      }
    }

    return {
      competitors: analyzedCompetitors,
      analysis_timestamp: new Date().toISOString(),
      total_posts_analyzed: totalPostsAnalyzed,
    };
  }

  /**
   * Analyze a single competitor
   */
  private async analyzeCompetitor(competitor: CompetitorData): Promise<AnalyzedCompetitor> {
    // Fetch last 20 posts
    const posts = this.getLastNPosts(competitor, 20);

    // Calculate engagement metrics
    const engagementMetrics = posts.map((post) => this.calculateEngagementMetrics(post, competitor.followers_count || 0));
    const avgEngagement = this.calculateAverageEngagement(engagementMetrics);

    // Identify content patterns
    const contentPatterns = this.identifyContentPatterns(posts, engagementMetrics);

    // Detect trends
    const trends = this.detectTrends(posts, engagementMetrics);

    return {
      handle: competitor.instagram_username,
      followers: competitor.followers_count || 0,
      avg_engagement: avgEngagement,
      top_posts: this.getTopPostsByEngagement(posts, engagementMetrics, 5),
      content_patterns: contentPatterns,
      trends: trends,
    };
  }

  /**
   * Get last N posts from competitor data
   * In production, this would fetch from Instagram API via Instagrapi or similar
   */
  private getLastNPosts(competitor: CompetitorData, count: number): Post[] {
    if (!competitor.top_posts_data) {
      return [];
    }

    try {
      const posts = JSON.parse(competitor.top_posts_data) as Post[];
      return posts.slice(0, count);
    } catch {
      return [];
    }
  }

  /**
   * Calculate engagement metrics for a single post
   */
  private calculateEngagementMetrics(post: Post, followers: number): EngagementMetrics {
    const totalEngagement = post.likes + post.comments + post.shares;
    const engagementRate = followers > 0 ? (totalEngagement / followers) * 100 : 0;

    return {
      post_id: post.id,
      engagement_rate: parseFloat(engagementRate.toFixed(2)),
      likes: post.likes,
      comments: post.comments,
      shares: post.shares,
    };
  }

  /**
   * Calculate average engagement rate across posts
   */
  private calculateAverageEngagement(metrics: EngagementMetrics[]): number {
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.engagement_rate, 0);
    const average = total / metrics.length;

    return parseFloat(average.toFixed(2));
  }

  /**
   * Identify content patterns across posts
   */
  private identifyContentPatterns(posts: Post[], metrics: EngagementMetrics[]): ContentPattern[] {
    const patterns: ContentPattern[] = [];

    // 1. Content type patterns
    const contentTypeFreq = this.countFrequency(posts.map((p) => p.content_type));
    for (const [type, count] of Object.entries(contentTypeFreq)) {
      const typeMetrics = posts
        .map((p, i) => (p.content_type === type ? metrics[i] : null))
        .filter((m) => m !== null) as EngagementMetrics[];

      const avgEngagement = typeMetrics.length > 0 ? this.calculateAverageEngagement(typeMetrics) : 0;

      patterns.push({
        type: 'content_type',
        value: type,
        frequency: count,
        average_engagement: avgEngagement,
      });
    }

    // 2. Hashtag patterns
    const allHashtags: string[] = [];
    for (const post of posts) {
      allHashtags.push(...post.hashtags);
    }

    const hashtagFreq = this.countFrequency(allHashtags);
    const topHashtags = Object.entries(hashtagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    for (const [hashtag, count] of topHashtags) {
      const hashtagMetrics = posts
        .map((p, i) => (p.hashtags.includes(hashtag) ? metrics[i] : null))
        .filter((m) => m !== null) as EngagementMetrics[];

      const avgEngagement = hashtagMetrics.length > 0 ? this.calculateAverageEngagement(hashtagMetrics) : 0;

      patterns.push({
        type: 'hashtag',
        value: hashtag,
        frequency: count,
        average_engagement: avgEngagement,
      });
    }

    // 3. Caption length patterns
    const captionLengths = posts.map((p) => p.caption.length);
    const shortCaptions = captionLengths.filter((l) => l < 100).length;
    const mediumCaptions = captionLengths.filter((l) => l >= 100 && l < 300).length;
    const longCaptions = captionLengths.filter((l) => l >= 300).length;

    const captionPatterns = [
      { range: 'short', count: shortCaptions },
      { range: 'medium', count: mediumCaptions },
      { range: 'long', count: longCaptions },
    ];

    for (const pattern of captionPatterns) {
      const captionMetrics = posts
        .map((p, i) => {
          const len = p.caption.length;
          if (
            (pattern.range === 'short' && len < 100) ||
            (pattern.range === 'medium' && len >= 100 && len < 300) ||
            (pattern.range === 'long' && len >= 300)
          ) {
            return metrics[i];
          }
          return null;
        })
        .filter((m) => m !== null) as EngagementMetrics[];

      const avgEngagement = captionMetrics.length > 0 ? this.calculateAverageEngagement(captionMetrics) : 0;

      patterns.push({
        type: 'caption_length',
        value: pattern.range,
        frequency: pattern.count,
        average_engagement: avgEngagement,
      });
    }

    // Sort by frequency descending
    return patterns.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Detect trends in competitor data
   */
  private detectTrends(posts: Post[], metrics: EngagementMetrics[]): CompetitorTrend[] {
    const trends: CompetitorTrend[] = [];

    // 1. Detect engagement trend (rising or falling)
    if (posts.length >= 3) {
      const recentMetrics = metrics.slice(0, 3);
      const olderMetrics = metrics.slice(Math.max(0, posts.length - 3));

      const recentAvg = this.calculateAverageEngagement(recentMetrics);
      const olderAvg = this.calculateAverageEngagement(olderMetrics);

      const trendDirection = recentAvg > olderAvg ? 'rising' : 'falling';
      const changePercent = Math.abs((recentAvg - olderAvg) / (olderAvg || 1)) * 100;

      trends.push({
        trend_type: 'engagement_trend',
        description: `Engagement is ${trendDirection} (${changePercent.toFixed(1)}% change)`,
        confidence: Math.min(1, changePercent / 50), // Confidence based on magnitude
        data_points: recentMetrics.map((m) => `${m.engagement_rate}%`),
      });
    }

    // 2. Detect rising hashtags
    const allHashtags: string[] = [];
    for (const post of posts) {
      allHashtags.push(...post.hashtags);
    }

    const hashtagFreq = this.countFrequency(allHashtags);
    const risingHashtags = Object.entries(hashtagFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (risingHashtags.length > 0) {
      trends.push({
        trend_type: 'rising_hashtags',
        description: `Top hashtags: ${risingHashtags.map((h) => h[0]).join(', ')}`,
        confidence: 0.8,
        data_points: risingHashtags.map((h) => `${h[0]} (${h[1]}x)`),
      });
    }

    // 3. Detect content type preference
    const contentTypeFreq = this.countFrequency(posts.map((p) => p.content_type));
    const preferredType = Object.entries(contentTypeFreq).sort((a, b) => b[1] - a[1])[0];

    if (preferredType) {
      const preference = (preferredType[1] / posts.length) * 100;
      trends.push({
        trend_type: 'content_type_preference',
        description: `Favors ${preferredType[0]} content (${preference.toFixed(0)}% of posts)`,
        confidence: Math.min(1, preference / 100),
        data_points: Object.entries(contentTypeFreq).map((c) => `${c[0]}: ${c[1]}`),
      });
    }

    return trends;
  }

  /**
   * Get top posts by engagement
   */
  private getTopPostsByEngagement(posts: Post[], metrics: EngagementMetrics[], limit: number): Post[] {
    return posts
      .map((post, index) => ({ post, metric: metrics[index] }))
      .sort((a, b) => b.metric.engagement_rate - a.metric.engagement_rate)
      .slice(0, limit)
      .map((item) => item.post);
  }

  /**
   * Count frequency of items in array
   */
  private countFrequency(items: string[]): Record<string, number> {
    return items.reduce(
      (acc, item) => {
        acc[item] = (acc[item] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
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
export function createCompetitorAnalysis(db: Database.Database): CompetitorAnalysis {
  return new CompetitorAnalysis(db);
}
