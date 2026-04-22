import type { DatabaseAdapter } from '../config/database';
import { Anthropic } from '@anthropic-ai/sdk';
import { Profile } from '../models/Profile.js';
import { EngagementAnalysisService, EngagementAnalysis } from './EngagementAnalysisService.js';

/**
 * Recommendation impact estimate
 */
export interface RecommendationImpact {
  engagement_increase_pct: number;
  follower_impact: 'low' | 'moderate' | 'high';
  confidence?: 'high' | 'medium' | 'low';
}

/**
 * Single recommendation
 */
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: 'content_type' | 'publishing_schedule' | 'caption' | 'hashtags' | 'engagement_hooks' | 'audio_selection' | 'call_to_action';
  action: string;
  reasoning: string;
  data_backing: Record<string, unknown>;
  estimated_impact: RecommendationImpact;
}

/**
 * Recommendations response
 */
export interface RecommendationsResponse {
  profile_id: string;
  generated_at: string;
  recommendations: Recommendation[];
  next_steps: string;
}

/**
 * Recommendation service — generates AI-powered strategy recommendations via Claude API
 */
export class RecommendationService {
  private db: DatabaseAdapter;
  private profileModel: Profile;
  private engagementAnalysisService: EngagementAnalysisService;
  private claudeClient: Anthropic;
  private recommendationCache: Map<string, { data: RecommendationsResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly GENERIC_PATTERNS = [
    /^post more/i,
    /^use .+/i,
    /^research /i,
    /^try /i,
    /^test /i,
    /^improve /i,
    /^increase /i,
    /^boost /i,
    /^grow /i,
    /^best practice/i,
    /^follow best practices/i,
  ];

  constructor(db: DatabaseAdapter) {
    this.db = db;
    this.profileModel = new Profile(db);
    this.engagementAnalysisService = new EngagementAnalysisService(db);
    this.claudeClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  /**
   * Generate AI-powered recommendations for a profile via Claude API
   */
  async generateRecommendations(profileId: string, userId: string): Promise<RecommendationsResponse> {
    // Check cache
    const cacheKey = `${profileId}:recommendations`;
    const cached = this.recommendationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL_MS) {
      return cached.data;
    }

    // Verify profile ownership
    const profile = this.profileModel.getById(profileId);
    if (!profile || profile.user_id !== userId) {
      throw new Error('Access denied: Profile not found or access denied');
    }

    // Get engagement analysis (Story 6.4 dependency)
    const engagement = await this.engagementAnalysisService.getEngagementAnalysis(profileId, userId, 60);

    // Get recent posts for context
    const recentPosts = this.getRecentPostsForContext(profileId, 30);

    // Generate recommendations from Claude with fallback retry
    const profileContext = { handle: profile.instagram_username, username: profile.instagram_username };
    let recommendations = await this.generateWithClaude(profileContext, engagement, recentPosts, 0);

    // Validate and deduplicate
    const validated = recommendations
      .map(rec => this.validateRecommendation(rec))
      .filter(rec => rec !== null) as Recommendation[];

    const deduped = this.deduplicateRecommendations(validated);

    // If < 5 valid recs, retry once with explicit instruction
    if (deduped.length < 5) {
      console.log(`[RecommendationService] Only ${deduped.length}/5 valid recs. Retrying with MORE SPECIFIC instruction...`);
      recommendations = await this.generateWithClaude(profileContext, engagement, recentPosts, 1);
      const retried = recommendations
        .map(rec => this.validateRecommendation(rec))
        .filter(rec => rec !== null) as Recommendation[];
      const retryDeduped = this.deduplicateRecommendations(retried);
      recommendations = retryDeduped.length >= 5 ? retryDeduped : deduped;
    } else {
      recommendations = deduped;
    }

    // Sort by priority and impact
    recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return b.estimated_impact.engagement_increase_pct - a.estimated_impact.engagement_increase_pct;
    });

    // Limit to 10 recommendations
    const limitedRecommendations = recommendations.slice(0, 10);

    const response: RecommendationsResponse = {
      profile_id: profileId,
      generated_at: new Date().toISOString(),
      recommendations: limitedRecommendations,
      next_steps: 'Implemente as 2 principais recomendações esta semana. Meça o impacto na próxima semana.',
    };

    // Cache result
    this.recommendationCache.set(cacheKey, { data: response, timestamp: Date.now() });

    return response;
  }

  /**
   * Generate recommendations via Claude API with data grounding
   */
  private async generateWithClaude(
    profile: { handle?: string; username?: string },
    engagement: EngagementAnalysis,
    recentPosts: Array<{ media_type: string; engagement_rate: number }>,
    attemptNumber: number
  ): Promise<Recommendation[]> {
    const prompt = this.buildPrompt(profile, engagement, recentPosts, attemptNumber);

    try {
      const response = await this.claudeClient.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      // Parse JSON from Claude response
      const jsonMatch = content.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON array found in Claude response');
      }

      const recommendations: Recommendation[] = JSON.parse(jsonMatch[0]);
      return recommendations;
    } catch (error) {
      console.error('[RecommendationService] Claude API error:', error);
      // Return fallback heuristic recommendations
      return this.generateFallbackRecommendations(engagement);
    }
  }

  /**
   * Build prompt for Claude with framework guidelines
   */
  private buildPrompt(profile: { handle?: string; username?: string }, engagement: EngagementAnalysis, recentPosts: Array<{ media_type: string; engagement_rate: number }>, attemptNumber: number): string {
    const topContentTypes = engagement.top_content_types || [];
    const topHours = engagement.top_hours || [];
    const trends = engagement.trends || {};
    const postsSummary = recentPosts.slice(0, 3).map(p => `${p.media_type} (${p.engagement_rate}% engagement)`).join(', ');

    const prompt = `You are a strategic marketing advisor for Instagram growth.
You analyze Instagram performance data and generate actionable
recommendations tailored to this specific profile's audience behavior.

CRITICAL: All recommendations MUST be specific to THIS profile's data.
Generic recommendations are unacceptable.

---

PROFILE ANALYSIS:

Profile: ${profile.handle || profile.username}
Analyzed Period: Last 60 days
Recent Posts: ${postsSummary || 'See type performance below'}

Top Content Types:
${topContentTypes
  .map(
    ct =>
      `- ${ct.type}: ${ct.avg_engagement.toFixed(1)}% avg engagement (${ct.posts_count} posts)`
  )
  .join('\n')}

Peak Engagement Hours:
${topHours
  .slice(0, 3)
  .map(h => `- ${h.hour}: ${h.avg_engagement_rate.toFixed(1)}% avg engagement`)
  .join('\n')}

Engagement Trend: ${trends.direction || 'stable'}

---

REQUIREMENTS FOR EACH RECOMMENDATION:

Every recommendation MUST have ALL of the following:
1. Priority: high | medium | low
2. Category: content_type | publishing_schedule | caption | hashtags | engagement_hooks | audio_selection | call_to_action
3. Action: Specific, measurable instruction (NOT generic)
4. Reasoning: Reference EXACT data points from the profile analysis
5. Data Backing: Show the numbers that support this recommendation
6. Estimated Impact: Quantify expected outcome

SPECIFICITY RULES (REQUIRED):
✅ GOOD: "Publish carousels 3x per week at 18:00. Last 3 carousels avg 14.2% engagement vs 8.5% for static posts."
❌ BAD: "Post more carousels"

${attemptNumber > 0 ? 'RETRY INSTRUCTION: Your previous recommendations were too generic. Be MORE SPECIFIC. Include exact numbers, frequencies, and times.' : ''}

---

Generate 5-10 strategic recommendations for this profile.
Return as JSON array only. No preamble. No explanation. JSON array of recommendation objects.`;

    return prompt;
  }

  /**
   * Validate recommendation schema and constraints
   */
  private validateRecommendation(rec: unknown): Recommendation | null {
    try {
      // Type guard: ensure rec is an object with properties
      if (typeof rec !== 'object' || rec === null) {
        console.warn(`[RecommendationService] Recommendation is not an object`);
        return null;
      }

      const recObj = rec as Record<string, unknown>;
      const required = ['priority', 'category', 'action', 'reasoning', 'data_backing', 'estimated_impact'];
      const missing = required.filter(field => !recObj[field]);

      if (missing.length > 0) {
        console.warn(`[RecommendationService] Recommendation missing fields: ${missing.join(', ')}`);
        return null;
      }

      if (!['high', 'medium', 'low'].includes(String(recObj.priority))) {
        console.warn(`[RecommendationService] Invalid priority: ${recObj.priority}`);
        return null;
      }

      if (typeof recObj.action !== 'string' || recObj.action.length < 20) {
        console.warn(`[RecommendationService] Action too short: "${recObj.action}"`);
        return null;
      }

      const dataBacking = recObj.data_backing as Record<string, unknown>;
      if (!dataBacking || Object.keys(dataBacking).length === 0) {
        console.warn(`[RecommendationService] data_backing is empty`);
        return null;
      }

      // Generic-ness check
      if (this.isGeneric(recObj.action)) {
        console.warn(`[RecommendationService] Recommendation is too generic: "${recObj.action}"`);
        return null;
      }

      return recObj as unknown as Recommendation;
    } catch (error) {
      console.error('[RecommendationService] Validation error:', error);
      return null;
    }
  }

  /**
   * Check if action is generic (not specific)
   */
  private isGeneric(action: string): boolean {
    return this.GENERIC_PATTERNS.some(pattern => pattern.test(action));
  }

  /**
   * Deduplicate recommendations using Levenshtein similarity
   */
  private deduplicateRecommendations(recs: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    return recs.filter(rec => {
      const normalized = rec.action.toLowerCase().replace(/[^\w\s]/g, '');

      for (const s of seen) {
        const similarity = this.levenshteinSimilarity(normalized, s);
        if (similarity > 0.85) {
          return false; // Likely duplicate
        }
      }

      seen.add(normalized);
      return true;
    });
  }

  /**
   * Calculate Levenshtein similarity ratio
   */
  private levenshteinSimilarity(a: string, b: string): number {
    const distance = this.levenshteinDistance(a, b);
    return 1 - distance / Math.max(a.length, b.length);
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Get recent posts for context
   */
  private getRecentPostsForContext(profileId: string, limit: number): Array<{ id: string; media_type: string; caption: string; engagement_rate: number }> {
    const stmt = this.db.prepare(`
      SELECT
        c.id,
        c.media_type,
        c.caption,
        COALESCE((
          SELECT ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / NULLIF(pm.reach, 0)), 1)
          FROM post_metrics pm
          WHERE pm.content_id = c.id
          ORDER BY pm.collected_at DESC
          LIMIT 1
        ), 0) as engagement_rate
      FROM content c
      WHERE c.profile_id = ?
      ORDER BY c.posted_at DESC
      LIMIT ?
    `);

    return (stmt.all(profileId, limit) as Array<{ id: string; media_type: string; caption: string; engagement_rate: number }>) || [];
  }

  /**
   * Generate fallback recommendations when Claude fails
   */
  private generateFallbackRecommendations(engagement: EngagementAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Content type recommendation
    if (engagement.top_content_types && engagement.top_content_types.length > 1) {
      const topType = engagement.top_content_types[0];
      const secondType = engagement.top_content_types[1];
      const engagementDiff =
        ((topType.avg_engagement - secondType.avg_engagement) / secondType.avg_engagement) * 100;

      if (engagementDiff > 20) {
        recommendations.push({
          priority: 'high',
          category: 'content_type',
          action: `Publish ${topType.type} content 3x per week. Your audience engages ${Math.round(engagementDiff)}% more with this format compared to ${secondType.type}.`,
          reasoning: `Analysis of last 30 posts shows ${topType.type} averages ${topType.avg_engagement}% engagement vs ${secondType.type} at ${secondType.avg_engagement}%.`,
          data_backing: {
            [topType.type + '_avg_engagement']: topType.avg_engagement,
            [secondType.type + '_avg_engagement']: secondType.avg_engagement,
            sample_size: topType.posts_count,
          },
          estimated_impact: {
            engagement_increase_pct: Math.min(30, Math.round(engagementDiff / 2)),
            follower_impact: 'moderate',
          },
        });
      }
    }

    // Posting time recommendation
    if (engagement.top_hours && engagement.top_hours.length > 0) {
      const peakHour = engagement.top_hours[0];
      const avgEngagement =
        engagement.top_hours.length > 1 ? engagement.top_hours[1].avg_engagement_rate : peakHour.avg_engagement_rate / 2;

      if (peakHour.avg_engagement_rate > avgEngagement * 1.3) {
        recommendations.push({
          priority: 'high',
          category: 'publishing_schedule',
          action: `Shift publishing time to ${peakHour.hour}:00. Posts at this time average ${peakHour.avg_engagement_rate.toFixed(1)}% engagement.`,
          reasoning: `Peak activity occurs at ${peakHour.hour}:00 with ${peakHour.avg_engagement_rate}% avg engagement vs ${avgEngagement.toFixed(1)}% at other times.`,
          data_backing: {
            peak_hour: peakHour.hour,
            peak_engagement: peakHour.avg_engagement_rate,
            average_engagement: avgEngagement,
          },
          estimated_impact: {
            engagement_increase_pct: 15,
            follower_impact: 'low',
          },
        });
      }
    }

    return recommendations;
  }

  /**
   * Clear cache for a profile
   */
  clearCache(profileId: string): void {
    const cacheKey = `${profileId}:recommendations`;
    this.recommendationCache.delete(cacheKey);
  }
}
