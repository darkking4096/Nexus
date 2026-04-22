import type { DatabaseAdapter } from '../config/database';
import { logger } from '../utils/logger';
import TrendingHashtagClient, { HashtagMetadata } from './TrendingHashtagClient';
import ShadowbanValidator from '../utils/shadowban-validator';

/**
 * Hashtag Generation Types
 */

export interface ProfileAnalysis {
  niche: string;
  audience?: string;
  keywords?: string[];
}

export interface HashtagGenerationRequest {
  profile_id: string;
  content_type: 'carousel' | 'story' | 'reel';
  analysis: ProfileAnalysis;
  minHashtags?: number;
  maxHashtags?: number;
}

export interface GeneratedHashtag extends HashtagMetadata {
  category: 'trending' | 'niche' | 'long-tail';
  status: 'approved' | 'flagged' | 'removed';
}

export interface HashtagGenerationResponse {
  hashtags: GeneratedHashtag[];
  totalGenerated: number;
  totalApproved: number;
  totalFlagged: number;
  totalRemoved: number;
  generatedAt: string;
  metadata: {
    profile_id: string;
    content_type: string;
    niche: string;
    shadowban_alerts: number;
  };
}

/**
 * HashtagGenerator: Multi-source hashtag generation with quality validation
 * Combines: trending (from Story 2.1) + niche-specific + long-tail
 * Validates: against shadowban list + duplicate check + recommendation score
 */
export class HashtagGenerator {
  private trendingClient: TrendingHashtagClient;
  private shadowbanValidator: ShadowbanValidator;
  private readonly RECOMMENDATION_THRESHOLD = 0.3;

  constructor(db: DatabaseAdapter) {
    this.trendingClient = new TrendingHashtagClient(db);
    this.shadowbanValidator = new ShadowbanValidator();
  }

  /**
   * Generate hashtags for a profile
   */
  async generateHashtags(
    request: HashtagGenerationRequest
  ): Promise<HashtagGenerationResponse> {
    const { profile_id, content_type, analysis, minHashtags = 10, maxHashtags = 15 } = request;

    logger.info(
      `[HashtagGenerator] Generating hashtags: profile=${profile_id}, niche=${analysis.niche}, content_type=${content_type}`
    );

    const hashtags: GeneratedHashtag[] = [];
    let shadowbanAlerts = 0;

    // 1. Fetch trending hashtags (5-6)
    const trendingHashtags = await this.trendingClient.getTrendingHashtags(analysis.niche);
    for (const tag of trendingHashtags.slice(0, 6)) {
      const meta = this.trendingClient.createHashtagMetadata(tag.hashtag, tag.volume);
      const shadowbanCheck = this.shadowbanValidator.check(tag.hashtag);

      if (shadowbanCheck.isShadowbanned) {
        logger.warn(`[HashtagGenerator] Shadowbanned hashtag detected: ${tag.hashtag}`);
        shadowbanAlerts++;
        continue;
      }

      hashtags.push({
        ...meta,
        category: 'trending',
        status: 'approved',
      });
    }

    // 2. Add niche-specific hashtags (5-6)
    const nicheHashtags = this.trendingClient.getNicheSpecificHashtags(analysis.niche);
    for (const tag of nicheHashtags.slice(0, 6)) {
      const meta = this.trendingClient.createHashtagMetadata(tag, 50000); // Estimate 50K volume
      const shadowbanCheck = this.shadowbanValidator.check(tag);

      if (shadowbanCheck.isShadowbanned) {
        shadowbanAlerts++;
        continue;
      }

      if (meta.recommendation_score > this.RECOMMENDATION_THRESHOLD) {
        hashtags.push({
          ...meta,
          category: 'niche',
          status: 'approved',
        });
      }
    }

    // 3. Add long-tail hashtags (2-3)
    const keywords = analysis.keywords || [analysis.niche];
    const longTailHashtags = this.trendingClient.getLongTailHashtags(analysis.niche, keywords);
    for (const tag of longTailHashtags.slice(0, 3)) {
      const meta = this.trendingClient.createHashtagMetadata(tag, 5000); // Estimate 5K volume
      const shadowbanCheck = this.shadowbanValidator.check(tag);

      if (!shadowbanCheck.isShadowbanned) {
        hashtags.push({
          ...meta,
          category: 'long-tail',
          status: 'approved',
        });
      }
    }

    // 4. Sort by recommendation score descending
    hashtags.sort((a, b) => b.recommendation_score - a.recommendation_score);

    // 5. Select final hashtags (respect min/max)
    const finalHashtags = hashtags.slice(0, maxHashtags);
    const removedCount = hashtags.length - finalHashtags.length;

    // minHashtags enforcement: log warning if minimum not met
    if (finalHashtags.length < minHashtags) {
      logger.warn(
        `[HashtagGenerator] Could not meet minHashtags=${minHashtags} for niche=${analysis.niche}; only ${finalHashtags.length} passed validation`
      );
    }

    logger.info(
      `[HashtagGenerator] Generated ${finalHashtags.length} hashtags: ${finalHashtags.length} approved, ${shadowbanAlerts} shadowbanned`
    );

    return {
      hashtags: finalHashtags,
      totalGenerated: hashtags.length,
      totalApproved: finalHashtags.length,
      totalFlagged: shadowbanAlerts,
      totalRemoved: removedCount,
      generatedAt: new Date().toISOString(),
      metadata: {
        profile_id,
        content_type,
        niche: analysis.niche,
        shadowban_alerts: shadowbanAlerts,
      },
    };
  }

  /**
   * Validate all hashtags in a list
   */
  validateHashtags(hashtags: string[]): { valid: string[]; invalid: string[] } {
    const valid = this.shadowbanValidator.filter(hashtags);
    const invalid = this.shadowbanValidator.getShadowbanned(hashtags);

    logger.info(
      `[HashtagGenerator] Validation: ${valid.length} valid, ${invalid.length} shadowbanned`
    );

    return { valid, invalid };
  }

  /**
   * Check shadowban list staleness
   */
  public checkShadowbanListHealth(): {
    isHealthy: boolean;
    daysOld: number;
    needsUpdate: boolean;
  } {
    const lastUpdated = this.shadowbanValidator.getLastUpdated();
    const daysOld = Math.floor(
      (Date.now() - lastUpdated.getTime()) / (24 * 60 * 60 * 1000)
    );
    const isStale = this.shadowbanValidator.isStale();

    return {
      isHealthy: !isStale,
      daysOld,
      needsUpdate: isStale,
    };
  }

  /**
   * Update shadowban list (called by maintenance job)
   */
  updateShadowbanList(newList: string[]): void {
    this.shadowbanValidator.updateList(newList);
    logger.info(`[HashtagGenerator] Updated shadowban list: ${newList.length} entries`);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const shadowbanHealth = this.checkShadowbanListHealth();
      const canGenerate = await this.trendingClient.checkRateLimit('hashtag-gen-check');

      return !shadowbanHealth.needsUpdate && canGenerate;
    } catch (error) {
      logger.error(`[HashtagGenerator] Health check failed: ${error}`);
      return false;
    }
  }
}

export default HashtagGenerator;
