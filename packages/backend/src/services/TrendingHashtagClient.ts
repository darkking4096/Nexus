import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

/**
 * Trending Hashtag Client
 * Integrates with Story 2.1 (Trending Research) to get current trending hashtags
 */

export interface TrendingHashtag {
  hashtag: string;
  volume: number; // Search volume
  trend: 'rising' | 'stable' | 'declining';
  recency: number; // Days since last spike (0-7)
  relevanceScore: number; // 0-1
}

export interface HashtagMetadata {
  hashtag: string;
  volume: number;
  competition: 'low' | 'medium' | 'high'; // Based on volume
  recommendation_score: number; // 0-1
}

/**
 * TrendingHashtagClient: Fetch and cache trending hashtags
 */
export class TrendingHashtagClient {
  // Cache max age: 24 hours (used for future caching implementation)
  private localNicheDatabase: Record<string, string[]> = {
    fitness: [
      'fitnessmotivation',
      'fitnessgym',
      'fitnesscommunity',
      'fitnessgirl',
      'fitnessaddict',
      'fitnessjunkie',
      'fitnessbody',
      'fitnesschallenge',
      'fitnesstrainer',
      'fitnesstips',
    ],
    fashion: [
      'fashionblogger',
      'fashionista',
      'fashionstyle',
      'fashionweek',
      'fashionable',
      'fashiondiaries',
      'fashiontrend',
      'fashiondesigner',
      'fashionista',
      'fashionjunkie',
    ],
    cooking: [
      'foodblogger',
      'foodphotography',
      'homemade',
      'recipeoftheday',
      'easyrecipe',
      'healthyrecipe',
      'cookingathome',
      'foodlover',
      'delicious',
      'yummy',
    ],
    technology: [
      'technology',
      'tech',
      'gadget',
      'innovation',
      'startup',
      'coding',
      'programming',
      'webdeveloper',
      'softwareengineer',
      'digitaltransformation',
    ],
    travel: [
      'travelgram',
      'wanderlust',
      'traveladdict',
      'explorer',
      'adventure',
      'bucketlist',
      'instatravel',
      'traveldiaries',
      'vacationmode',
      'discoverhere',
    ],
    beauty: [
      'beautyblogger',
      'beautycare',
      'beautytips',
      'skincare',
      'makeuplover',
      'makeuptutorial',
      'beautyoftheday',
      'glowup',
      'beautycommunity',
      'selfcare',
    ],
  };

  constructor(_db: Database.Database) {
    // DB available for caching in future implementations
  }

  /**
   * Get trending hashtags for a niche
   * Returns trending hashtags (volume > 100K, recency < 7 days)
   */
  async getTrendingHashtags(niche: string): Promise<TrendingHashtag[]> {
    try {
      // In production, this would call Story 2.1 API
      // For now, return mock trending data
      const trending: TrendingHashtag[] = [
        {
          hashtag: `#trending${niche}1`,
          volume: 500000,
          trend: 'rising',
          recency: 1,
          relevanceScore: 0.95,
        },
        {
          hashtag: `#trending${niche}2`,
          volume: 250000,
          trend: 'rising',
          recency: 2,
          relevanceScore: 0.90,
        },
        {
          hashtag: `#trending${niche}3`,
          volume: 150000,
          trend: 'stable',
          recency: 3,
          relevanceScore: 0.85,
        },
      ];

      logger.debug(
        `[TrendingHashtagClient] Fetched ${trending.length} trending hashtags for niche: ${niche}`
      );
      return trending;
    } catch (error) {
      logger.error(`[TrendingHashtagClient] Error fetching trending hashtags: ${error}`);
      return [];
    }
  }

  /**
   * Get niche-specific hashtags
   * Returns hashtags relevant to a specific niche (volume 10K-100K)
   */
  getNicheSpecificHashtags(niche: string): string[] {
    const nicheKey = niche.toLowerCase();
    const hashtags = this.localNicheDatabase[nicheKey] || [];

    logger.debug(
      `[TrendingHashtagClient] Got ${hashtags.length} niche-specific hashtags for: ${niche}`
    );

    return hashtags.map((tag) => `#${tag}`);
  }

  /**
   * Get long-tail hashtags
   * Returns very specific hashtags (volume < 10K)
   */
  getLongTailHashtags(niche: string, keywords: string[]): string[] {
    // Create specific combinations
    const longTail: string[] = [];

    keywords.forEach((keyword) => {
      longTail.push(`#${niche}${keyword}`.replace(/\s+/g, ''));
      longTail.push(`#${keyword}${niche}`.replace(/\s+/g, ''));
    });

    logger.debug(`[TrendingHashtagClient] Generated ${longTail.length} long-tail hashtags`);
    return longTail;
  }

  /**
   * Create hashtag metadata with recommendation score
   */
  createHashtagMetadata(hashtag: string, volume: number): HashtagMetadata {
    // Determine competition level based on volume
    let competition: 'low' | 'medium' | 'high';
    if (volume < 10000) {
      competition = 'low';
    } else if (volume < 100000) {
      competition = 'medium';
    } else {
      competition = 'high';
    }

    // Calculate recommendation score (0-1)
    // Ideal: medium volume with low competition
    let score = 0.5;
    if (competition === 'medium') score += 0.3;
    if (competition === 'low') score += 0.1;
    if (volume > 50000 && volume < 500000) score += 0.1;

    return {
      hashtag,
      volume,
      competition,
      recommendation_score: Math.min(1, Math.max(0, score)),
    };
  }

  /**
   * Rate limit check for API calls
   * Returns true if ready to call API, false if should wait
   */
  async checkRateLimit(_key: string): Promise<boolean> {
    try {
      // In production, implement proper rate limiting
      // For now, always allow
      return true;
    } catch (error) {
      logger.error(`[TrendingHashtagClient] Rate limit check error: ${error}`);
      return false;
    }
  }
}

export default TrendingHashtagClient;
