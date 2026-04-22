import type { DatabaseAdapter } from '../config/database';
import { Profile, ProfileData } from '../models/Profile.js';
import type { HistoryAnalysisResult } from './HistoryAnalysis.js';
import type { AnalyzedCompetitor } from './CompetitorAnalysis.js';

/**
 * User objectives for analytics context
 */
export interface UserObjective {
  goal: string; // e.g., "maximize_reach", "increase_engagement", "grow_followers"
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Opportunity identified in analytics
 */
export interface Opportunity {
  type: 'content_gap' | 'posting_pattern' | 'trend_alignment' | 'engagement_opportunity';
  description: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  estimated_lift: string; // e.g., "15-20% engagement"
  data_source: string; // e.g., "competitor_analysis", "trend_analysis"
}

/**
 * Content type recommendation
 */
export interface ContentTypeRecommendation {
  type: string; // e.g., "reel", "carousel", "image", "video"
  virality_score: number; // 0-100
  alignment_score: number; // 0-100
  rationale: string;
  confidence: number; // 0-1
}

/**
 * Complete analytics result
 */
export interface AnalyticsResult {
  virality_score: number; // 0-100
  virality_reasoning: string;
  alignment_score: number; // 0-100
  alignment_reasoning: string;
  opportunities: Opportunity[];
  recommended_content_types: ContentTypeRecommendation[];
  profile_health_summary: {
    engagement_trajectory: 'rising' | 'stable' | 'declining';
    content_diversity: number; // 0-1
    optimization_potential: number; // 0-1
  };
  timestamp: string;
}

/**
 * Analytics input aggregating data from 3.1, 3.2, 3.3
 */
export interface AnalyticsInput {
  own_history: HistoryAnalysisResult;
  competitors: AnalyzedCompetitor[];
  trends: Array<{
    topic: string;
    momentum: number; // 0-100
    related_hashtags: string[];
  }>;
  user_objectives: UserObjective[];
}

/**
 * AnalyticsModule — integrated analytics for data-driven content strategy
 * Calculates virality scores, alignment scores, identifies opportunities,
 * and recommends content types based on historical data, competitor analysis, and trends
 */
export class AnalyticsModule {
  private profileModel: Profile;

  constructor(db: DatabaseAdapter) {
    this.profileModel = new Profile(db);
  }

  /**
   * Run complete analytics for a profile
   *
   * @param profileId Profile ID to analyze
   * @param userId User ID (for ownership check)
   * @param analyticsInput Data from HistoryAnalysis, CompetitorAnalysis, ResearchService
   * @returns Complete analytics result with scores and recommendations
   * @throws Error if profile not found, access denied, or analysis fails
   */
  async analyzeProfile(
    profileId: string,
    userId: string,
    analyticsInput: AnalyticsInput
  ): Promise<AnalyticsResult> {
    // 1. Validate profile ownership
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // 2. Handle new profile edge case
    if (analyticsInput.own_history.total_posts === 0) {
      return this.generateNewProfileRecommendations(analyticsInput);
    }

    // 3. Calculate virality score
    const viralityScore = this.calculateViralityScore(analyticsInput);
    const viralityReasoning = this.generateViralityReasoning(analyticsInput);

    // 4. Calculate alignment score
    const alignmentScore = this.calculateAlignmentScore(analyticsInput);
    const alignmentReasoning = this.generateAlignmentReasoning(analyticsInput);

    // 5. Identify opportunities
    const opportunities = this.identifyOpportunities(analyticsInput);

    // 6. Recommend content types
    const recommendedContentTypes = this.recommendContentTypes(analyticsInput, viralityScore, alignmentScore);

    // 7. Generate profile health summary
    const healthSummary = this.generateHealthSummary(analyticsInput);

    return {
      virality_score: viralityScore,
      virality_reasoning: viralityReasoning,
      alignment_score: alignmentScore,
      alignment_reasoning: alignmentReasoning,
      opportunities,
      recommended_content_types: recommendedContentTypes,
      profile_health_summary: healthSummary,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Calculate virality score based on engagement history, competitor benchmarks, and trend alignment
   * Formula: (own_engagement_percentile * 0.4) + (competitor_benchmark * 0.3) + (trend_momentum * 0.3)
   */
  private calculateViralityScore(input: AnalyticsInput): number {
    const { own_history, competitors, trends } = input;

    // Component 1: Own engagement percentile (40%)
    // Percentile rank within competitive set
    const competitorAvgEngagements = competitors.map((c) => c.avg_engagement);
    const ownEngagement = own_history.avg_engagement;
    let engagementPercentile = 50; // Default for new profiles

    if (competitorAvgEngagements.length > 0) {
      const betterThanCount = competitorAvgEngagements.filter((e) => e < ownEngagement).length;
      engagementPercentile = (betterThanCount / competitorAvgEngagements.length) * 100;
    }

    // Component 2: Competitor benchmark (30%)
    // How well we compare to competitors
    let competitorScore = 50; // Default baseline
    if (competitorAvgEngagements.length > 0) {
      const avgCompetitorEngagement =
        competitorAvgEngagements.reduce((a, b) => a + b, 0) / competitorAvgEngagements.length;
      const benchmarkRatio = avgCompetitorEngagement > 0 ? ownEngagement / avgCompetitorEngagement : 1;
      competitorScore = Math.min(100, benchmarkRatio * 50); // Cap at 100
    }

    // Component 3: Trend momentum (30%)
    // How well content aligns with trending topics
    let trendScore = 50; // Default baseline
    if (trends.length > 0) {
      const avgMomentum = trends.reduce((sum, t) => sum + t.momentum, 0) / trends.length;
      trendScore = Math.min(100, avgMomentum); // Trend momentum already 0-100
    }

    // Weighted average
    const viralityScore =
      engagementPercentile * 0.4 + competitorScore * 0.3 + trendScore * 0.3;

    return Math.round(Math.min(100, Math.max(0, viralityScore)));
  }

  /**
   * Calculate alignment score based on user objectives, content type fit, and posting pattern efficiency
   * Formula: (objective_match * 0.5) + (content_type_fit * 0.3) + (pattern_efficiency * 0.2)
   */
  private calculateAlignmentScore(input: AnalyticsInput): number {
    const { own_history, user_objectives } = input;

    // Component 1: Objective match (50%)
    // How well current content matches user goals
    let objectiveScore = 50; // Default baseline
    if (user_objectives.length > 0) {
      // For "maximize_reach" goal: higher content diversity is better
      // For "increase_engagement" goal: content type concentration on top performers is better
      const hasReachGoal = user_objectives.some((o) => o.goal.includes('reach'));
      const hasEngagementGoal = user_objectives.some((o) => o.goal.includes('engagement'));

      let score = 50;
      if (hasReachGoal) {
        // Reward content diversity
        const contentTypeCount = own_history.content_type_performance.length;
        score = Math.min(100, (contentTypeCount / 4) * 100); // 4 types = perfect score
      } else if (hasEngagementGoal) {
        // Reward concentration on best performers
        if (own_history.content_type_performance.length > 0) {
          const topTypeEngagement = own_history.content_type_performance[0].avg_engagement;
          const avgEngagement = own_history.avg_engagement;
          score = Math.min(100, (topTypeEngagement / Math.max(avgEngagement, 1)) * 50 + 50);
        }
      }
      objectiveScore = score;
    }

    // Component 2: Content type fit (30%)
    // How well best content types align with overall performance
    let contentFitScore = 50; // Default baseline
    if (own_history.content_type_performance.length > 0) {
      const topType = own_history.content_type_performance[0];
      const avgEngagement = own_history.avg_engagement;
      const lift = avgEngagement > 0 ? (topType.avg_engagement / avgEngagement) * 100 : 100;
      contentFitScore = Math.min(100, lift);
    }

    // Component 3: Pattern efficiency (20%)
    // How optimized posting patterns are
    let patternScore = 50; // Default baseline
    if (own_history.posting_patterns.length > 0) {
      // Best efficiency = posting concentrated in high-engagement hours
      const topPattern = own_history.posting_patterns.reduce((max, p) =>
        p.avg_engagement > max.avg_engagement ? p : max
      );
      const avgEngagement = own_history.avg_engagement;
      const efficiency =
        avgEngagement > 0 ? (topPattern.avg_engagement / avgEngagement) * 100 : 100;
      patternScore = Math.min(100, efficiency);
    }

    // Weighted average
    const alignmentScore = objectiveScore * 0.5 + contentFitScore * 0.3 + patternScore * 0.2;

    return Math.round(Math.min(100, Math.max(0, alignmentScore)));
  }

  /**
   * Identify opportunities: gaps in content, posting patterns, trend alignment
   */
  private identifyOpportunities(input: AnalyticsInput): Opportunity[] {
    const opportunities: Opportunity[] = [];
    const { own_history, competitors, trends } = input;

    // Opportunity 1: Content type gaps
    if (competitors.length > 0 && own_history.content_type_performance.length > 0) {
      const ownTypes = own_history.content_type_performance.map((p) => p.type);
      const competitorTypesWithEngagement = this.getCompetitorContentMetrics(competitors);

      for (const [type, competitorAvgEng] of Object.entries(competitorTypesWithEngagement)) {
        const ownTypeData = own_history.content_type_performance.find((p) => p.type === type);
        const ownEngagement = ownTypeData?.avg_engagement ?? 0;

        // If competitor has high engagement but we underutilize it, flag as gap
        if (competitorAvgEng > ownEngagement * 1.2 && !ownTypes.includes(type)) {
          opportunities.push({
            type: 'content_gap',
            description: `Competitors focus on ${type} content (avg ${competitorAvgEng.toFixed(1)} engagement) but you don't use this type`,
            impact: 'HIGH',
            estimated_lift: '15-25% engagement',
            data_source: 'competitor_analysis',
          });
        } else if (ownTypeData && competitorAvgEng > ownEngagement * 1.2) {
          const currentPercent = (ownTypeData.count / own_history.total_posts) * 100;
          if (currentPercent < 30) {
            opportunities.push({
              type: 'content_gap',
              description: `${type} content underutilized: competitors avg ${competitorAvgEng.toFixed(1)} engagement vs your ${ownEngagement.toFixed(1)}, only ${currentPercent.toFixed(0)}% of posts`,
              impact: 'MEDIUM',
              estimated_lift: '10-15% engagement',
              data_source: 'competitor_analysis',
            });
          }
        }
      }
    }

    // Opportunity 2: Posting pattern optimization
    if (own_history.posting_patterns.length > 0) {
      const topPattern = own_history.posting_patterns.reduce((max, p) =>
        p.avg_engagement > max.avg_engagement ? p : max
      );
      const totalInTopWindow = own_history.posting_patterns
        .filter((p) => p.avg_engagement > own_history.avg_engagement)
        .reduce((sum, p) => sum + p.count, 0);

      const percentInTopWindow = (totalInTopWindow / own_history.total_posts) * 100;
      if (percentInTopWindow < 50) {
        opportunities.push({
          type: 'posting_pattern',
          description: `Best engagement at ${topPattern.hour}:00-${(topPattern.hour + 1) % 24}:00 UTC (${topPattern.avg_engagement.toFixed(1)} avg engagement), but only ${percentInTopWindow.toFixed(0)}% of posts in high-engagement hours`,
          impact: 'MEDIUM',
          estimated_lift: '8-12% engagement',
          data_source: 'history_analysis',
        });
      }
    }

    // Opportunity 3: Trend alignment
    if (trends.length > 0 && own_history.total_posts > 0) {
      const topTrends = trends.sort((a, b) => b.momentum - a.momentum).slice(0, 3);
      for (const trend of topTrends) {
        opportunities.push({
          type: 'trend_alignment',
          description: `Trend "${trend.topic}" has high momentum (${trend.momentum.toFixed(0)}/100) with related hashtags: ${trend.related_hashtags.slice(0, 3).join(', ')}`,
          impact: 'MEDIUM',
          estimated_lift: '20-30% reach',
          data_source: 'trend_analysis',
        });
      }
    }

    // Return top 3 opportunities sorted by impact
    const impactOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return opportunities
      .sort((a, b) => impactOrder[b.impact] - impactOrder[a.impact])
      .slice(0, 3);
  }

  /**
   * Recommend top 3 content types ranked by virality potential and alignment fit
   */
  private recommendContentTypes(
    input: AnalyticsInput,
    _viralityScore: number,
    _alignmentScore: number
  ): ContentTypeRecommendation[] {
    const recommendations: ContentTypeRecommendation[] = [];
    const { own_history, competitors } = input;

    // Build content type scores
    const contentTypeScores: Record<
      string,
      {
        virality: number;
        alignment: number;
        ownCount: number;
        confidence: number;
      }
    > = {};

    // Initialize with own content types
    for (const typePerf of own_history.content_type_performance) {
      const engagement = typePerf.avg_engagement;
      const engagementPercentile = (engagement / Math.max(...own_history.content_type_performance.map((p) => p.avg_engagement))) * 100;
      contentTypeScores[typePerf.type] = {
        virality: engagementPercentile,
        alignment: 75, // Good alignment with own history
        ownCount: typePerf.count,
        confidence: 0.85,
      };
    }

    // Add competitor-recommended types
    const competitorTypeMetrics = this.getCompetitorContentMetrics(competitors);
    for (const [type, avgEngagement] of Object.entries(competitorTypeMetrics)) {
      const percentile = (avgEngagement / Math.max(...Object.values(competitorTypeMetrics))) * 100;
      if (!contentTypeScores[type]) {
        contentTypeScores[type] = {
          virality: percentile,
          alignment: 60, // Lower alignment (new to us)
          ownCount: 0,
          confidence: 0.65,
        };
      } else {
        contentTypeScores[type].virality = Math.max(contentTypeScores[type].virality, percentile);
      }
    }

    // Convert to recommendations and sort
    for (const [type, scores] of Object.entries(contentTypeScores)) {
      recommendations.push({
        type,
        virality_score: Math.round(scores.virality),
        alignment_score: Math.round(scores.alignment),
        rationale: this.generateContentTypeRationale(type, scores),
        confidence: scores.confidence,
      });
    }

    // Return top 3
    return recommendations
      .sort((a, b) => (b.virality_score * 0.6 + b.alignment_score * 0.4) - (a.virality_score * 0.6 + a.alignment_score * 0.4))
      .slice(0, 3);
  }

  /**
   * Generate health summary: engagement trajectory, content diversity, optimization potential
   */
  private generateHealthSummary(input: AnalyticsInput): {
    engagement_trajectory: 'rising' | 'stable' | 'declining';
    content_diversity: number;
    optimization_potential: number;
  } {
    const { own_history } = input;

    // Engagement trajectory: analyze top 5 vs bottom 5 posts
    let trajectory: 'rising' | 'stable' | 'declining' = 'stable';
    if (own_history.top_posts.length > 0) {
      const recentTop = own_history.top_posts.slice(0, 2);
      const olderTop = own_history.top_posts.slice(-2);

      const recentAvg =
        recentTop.reduce((sum, p) => sum + (p.likes + p.comments + p.shares + p.saves), 0) /
        recentTop.length;
      const olderAvg =
        olderTop.reduce((sum, p) => sum + (p.likes + p.comments + p.shares + p.saves), 0) /
        olderTop.length;

      if (recentAvg > olderAvg * 1.15) {
        trajectory = 'rising';
      } else if (recentAvg < olderAvg * 0.85) {
        trajectory = 'declining';
      }
    }

    // Content diversity: 0-1 based on # content types vs possible types
    const contentDiversity = Math.min(1, own_history.content_type_performance.length / 4);

    // Optimization potential: 0-1 based on gap to best practices
    const topTypeEngagement = own_history.content_type_performance[0]?.avg_engagement ?? 0;
    const avgEngagement = own_history.avg_engagement;
    const optimizationPotential = avgEngagement > 0 ? 1 - avgEngagement / topTypeEngagement : 0.5;

    return {
      engagement_trajectory: trajectory,
      content_diversity: parseFloat(contentDiversity.toFixed(2)),
      optimization_potential: parseFloat(optimizationPotential.toFixed(2)),
    };
  }

  /**
   * Generate new profile recommendations when no posts exist
   */
  private generateNewProfileRecommendations(input: AnalyticsInput): AnalyticsResult {
    const { competitors, trends } = input;

    // Recommend based on competitor and trend data
    const competitorContentMetrics = this.getCompetitorContentMetrics(competitors);
    const topCompetitorTypes = Object.entries(competitorContentMetrics)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const recommendedContentTypes: ContentTypeRecommendation[] = topCompetitorTypes.map(
      ([type, engagement]) => ({
        type,
        virality_score: Math.round(Math.min(100, (engagement / 10) * 100)), // Normalized to 0-100
        alignment_score: 75,
        rationale: `Competitors excel with ${type} content; recommended for new profiles in this niche`,
        confidence: 0.8,
      })
    );

    const opportunities: Opportunity[] = trends.slice(0, 2).map((trend) => ({
      type: 'trend_alignment',
      description: `Trending topic: "${trend.topic}" (momentum ${trend.momentum.toFixed(0)}/100)`,
      impact: 'HIGH',
      estimated_lift: '25-40% reach',
      data_source: 'trend_analysis',
    }));

    return {
      virality_score: 60, // Neutral baseline for new profiles
      virality_reasoning: 'No historical data. Score based on niche benchmarks and trend analysis.',
      alignment_score: 50,
      alignment_reasoning: 'New profile. Recommendations based on competitor patterns and user objectives.',
      opportunities,
      recommended_content_types: recommendedContentTypes,
      profile_health_summary: {
        engagement_trajectory: 'stable',
        content_diversity: 0,
        optimization_potential: 0.8,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Helper: Extract content type metrics from competitor analysis
   */
  private getCompetitorContentMetrics(competitors: AnalyzedCompetitor[]): Record<string, number> {
    const metrics: Record<string, { total: number; count: number }> = {};

    for (const competitor of competitors) {
      for (const pattern of competitor.content_patterns) {
        if (pattern.type === 'content_type') {
          if (!metrics[pattern.value]) {
            metrics[pattern.value] = { total: 0, count: 0 };
          }
          metrics[pattern.value].total += pattern.average_engagement;
          metrics[pattern.value].count++;
        }
      }
    }

    // Average across competitors
    const result: Record<string, number> = {};
    for (const [type, data] of Object.entries(metrics)) {
      result[type] = data.total / data.count;
    }

    return result;
  }

  /**
   * Generate explanation for virality score
   */
  private generateViralityReasoning(input: AnalyticsInput): string {
    const { own_history, competitors } = input;
    const competitorAvgEngagements = competitors.map((c) => c.avg_engagement);

    const engagementPercentile = competitorAvgEngagements.length > 0
      ? ((competitorAvgEngagements.filter((e) => e < own_history.avg_engagement).length /
          competitorAvgEngagements.length) *
          100)
        .toFixed(0)
      : '50';

    return `Engagement history ${engagementPercentile}th percentile vs competitors + benchmark alignment + trend momentum`;
  }

  /**
   * Generate explanation for alignment score
   */
  private generateAlignmentReasoning(input: AnalyticsInput): string {
    const { user_objectives, own_history } = input;
    const goalDescriptions = user_objectives.map((o) => o.goal).join(', ');
    const contentMatchPercent = ((own_history.content_type_performance.length / 4) * 100).toFixed(0);

    return `Content type match ${contentMatchPercent}% + objectives coverage (${goalDescriptions || 'none specified'})`;
  }

  /**
   * Generate rationale for content type recommendation
   */
  private generateContentTypeRationale(
    type: string,
    scores: { virality: number; alignment: number; ownCount: number }
  ): string {
    if (scores.ownCount > 0) {
      return `Strong performance with ${type} (${scores.virality.toFixed(0)}/100 virality), aligns with your strategy`;
    }
    return `${type} drives high engagement; recommended to diversify content mix`;
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
export function createAnalyticsModule(db: DatabaseAdapter): AnalyticsModule {
  return new AnalyticsModule(db);
}
