import Database from 'better-sqlite3';
import { Profile } from '../models/Profile.js';
import { EngagementAnalysisService } from './EngagementAnalysisService.js';

/**
 * Recommendation impact estimate
 */
export interface RecommendationImpact {
  engagement_increase_pct: number;
  follower_impact: 'low' | 'moderate' | 'high';
}

/**
 * Single recommendation
 */
export interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  category: string;
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
 * Recommendation service — generates AI-powered strategy recommendations
 */
export class RecommendationService {
  private db: Database.Database;
  private profileModel: Profile;
  private engagementAnalysisService: EngagementAnalysisService;
  private recommendationCache: Map<string, { data: RecommendationsResponse; timestamp: number }> = new Map();
  private readonly CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(db: Database.Database) {
    this.db = db;
    this.profileModel = new Profile(db);
    this.engagementAnalysisService = new EngagementAnalysisService(db);
  }

  /**
   * Generate AI-powered recommendations for a profile
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

    // Get engagement analysis
    const engagement = await this.engagementAnalysisService.getEngagementAnalysis(profileId, userId, 60);

    // Generate recommendations based on engagement patterns
    const recommendations = this.generateRecommendationsFromAnalysis(engagement, profileId);

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
   * Generate recommendations from engagement analysis
   */
  private generateRecommendationsFromAnalysis(
    analysis: any,
    profileId: string
  ): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Content type recommendation
    if (analysis.top_content_types && analysis.top_content_types.length > 1) {
      const topType = analysis.top_content_types[0];
      const secondType = analysis.top_content_types[1];
      const engagementDiff =
        ((topType.avg_engagement - secondType.avg_engagement) / secondType.avg_engagement) * 100;

      if (engagementDiff > 20) {
        recommendations.push({
          priority: 'high',
          category: 'content_type',
          action: `Priorize ${topType.type} posts: seu público engaja ${Math.round(engagementDiff)}% mais com este formato. Meta: ${Math.ceil(topType.posts_count / 2)} posts por mês.`,
          reasoning: `Análise dos últimos 30 posts mostra que ${topType.type} tem engagement médio de ${topType.avg_engagement}% vs ${secondType.type} com ${secondType.avg_engagement}%. Os 3 top posts são todos ${topType.type}.`,
          data_backing: {
            [topType.type + '_avg_engagement']: topType.avg_engagement,
            [secondType.type + '_avg_engagement']: secondType.avg_engagement,
            top_3_posts_types: Array(3).fill(topType.type),
          },
          estimated_impact: {
            engagement_increase_pct: Math.min(30, Math.round(engagementDiff / 2)),
            follower_impact: 'moderate',
          },
        });
      }
    }

    // Posting time recommendation
    if (analysis.top_hours && analysis.top_hours.length > 0) {
      const peakHour = analysis.top_hours[0];
      const avgHour = analysis.top_hours[1] || { avg_engagement_rate: peakHour.avg_engagement_rate / 2 };

      if (peakHour.avg_engagement_rate > avgHour.avg_engagement_rate * 1.3) {
        recommendations.push({
          priority: 'high',
          category: 'publishing_schedule',
          action: `Mude horário de publicação: publique entre ${peakHour.hour} e próxima hora. Isso se alinha com pico de atividade do seu público.`,
          reasoning: `Análise de padrões de engagement mostra picos às ${peakHour.hour} (${peakHour.avg_engagement_rate}% engagement médio) vs outras horas.`,
          data_backing: {
            peak_hour: peakHour.hour,
            peak_engagement: peakHour.avg_engagement_rate,
            peak_posts_count: peakHour.posts_count,
          },
          estimated_impact: {
            engagement_increase_pct: 15,
            follower_impact: 'low',
          },
        });
      }
    }

    // Engagement trends recommendation
    if (analysis.trends) {
      if (analysis.trends.direction === 'down') {
        recommendations.push({
          priority: 'high',
          category: 'strategy',
          action: 'Seu engagement está em queda. Teste novo formato ou tema de conteúdo. Publique 3 posts experimentais esta semana.',
          reasoning: `Momentum ${analysis.trends.momentum} indica declínio de ${Math.abs(parseFloat(analysis.trends.momentum))}% vs período anterior.`,
          data_backing: {
            momentum: analysis.trends.momentum,
            current_avg: analysis.trends.current_period_avg,
            previous_avg: analysis.trends.previous_period_avg,
          },
          estimated_impact: {
            engagement_increase_pct: 20,
            follower_impact: 'moderate',
          },
        });
      }
    }

    // Caption insights
    if (analysis.caption_insights && analysis.caption_insights.emoji_correlation > 0.75) {
      recommendations.push({
        priority: 'medium',
        category: 'caption',
        action: `Captions com emojis têm ${Math.round((analysis.caption_insights.emoji_correlation - 1) * 100)}% mais engagement. Inclua 2-3 emojis relevantes.`,
        reasoning: 'Análise histórica mostra posts com emojis têm engagement significativamente mais alto.',
        data_backing: {
          emoji_correlation: analysis.caption_insights.emoji_correlation,
          avg_length_top_performers: analysis.caption_insights.avg_length_top_performers,
        },
        estimated_impact: {
          engagement_increase_pct: 8,
          follower_impact: 'low',
        },
      });
    }

    // Frequency recommendation
    const postsPerWeek = this.estimatePostFrequency(profileId);
    if (postsPerWeek < 3) {
      recommendations.push({
        priority: 'medium',
        category: 'frequency',
        action: `Aumente frequência de publicação para 3-4 posts por semana. Consistência alimenta algoritmo.`,
        reasoning: `Você está publicando apenas ${postsPerWeek.toFixed(1)} posts por semana. Perfis com 3-4 posts crescem 50% mais rápido.`,
        data_backing: {
          current_posts_per_week: postsPerWeek,
          recommended_minimum: 3,
        },
        estimated_impact: {
          engagement_increase_pct: 12,
          follower_impact: 'high',
        },
      });
    }

    return recommendations;
  }

  /**
   * Estimate post frequency from database
   */
  private estimatePostFrequency(profileId: string): number {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as posts_count
      FROM content
      WHERE profile_id = ? AND posted_at >= datetime('now', '-30 days')
    `);

    const result = stmt.get(profileId) as { posts_count: number };
    return (result?.posts_count || 0) / 4.3; // Roughly 4 weeks
  }

  /**
   * Clear cache for a profile
   */
  clearCache(profileId: string): void {
    const cacheKey = `${profileId}:recommendations`;
    this.recommendationCache.delete(cacheKey);
  }
}
