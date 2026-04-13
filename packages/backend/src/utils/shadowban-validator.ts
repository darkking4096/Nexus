import { logger } from './logger';

/**
 * Shadowban Validator
 * Validates hashtags against a list of shadowbanned tags
 * Shadowban list should be updated weekly
 */

export interface ShadowbanCheckResult {
  hashtag: string;
  isShadowbanned: boolean;
  lastUpdated: string;
  confidence: number; // 0-1, how confident we are
}

/**
 * Default shadowbanned hashtags
 * This list should be maintained externally and updated weekly
 * Sources: Instagram engagement communities, hashtag research tools
 *
 * Common shadowbanned patterns:
 * - Excessively popular but broken (engagement pods)
 * - Copyright-related
 * - Spam/manipulation indicators
 * - Adult content (inconsistently applied)
 */
const DEFAULT_SHADOWBAN_LIST = new Set([
  // Engagement pod indicators
  'likeforlike',
  'followforfollow',
  'like4like',
  'follow4follow',
  'f4f',
  'l4l',
  'tagsforlikes',
  'photooftheday', // Often abused
  'picoftheday', // Often abused

  // Spam indicators
  'spam',
  'scam',
  'bot',
  'autolike',
  'autofollower',
  'instagram_followers',
  'getfollowers',
  'buyersofinstagram',

  // Very generic (low engagement)
  'nofilter', // Ironically often shadowbanned
  'love',     // Too generic
  'instagood', // Mixed results
  'instalike',

  // Controversial (inconsistent)
  'adult',
  'sexy',
  'nsfw',
]);

/**
 * ShadowbanValidator: Check if hashtags are shadowbanned
 */
export class ShadowbanValidator {
  private shadowbanList: Set<string>;
  private lastUpdated: Date;

  constructor(customList?: string[]) {
    this.shadowbanList = new Set(DEFAULT_SHADOWBAN_LIST);
    if (customList) {
      customList.forEach((tag) => {
        this.shadowbanList.add(tag.toLowerCase().replace(/^#/, ''));
      });
    }
    this.lastUpdated = new Date();
  }

  /**
   * Check if a single hashtag is shadowbanned
   */
  check(hashtag: string): ShadowbanCheckResult {
    const tag = hashtag.toLowerCase().replace(/^#/, '');
    const isShadowbanned = this.shadowbanList.has(tag);

    return {
      hashtag: `#${tag}`,
      isShadowbanned,
      lastUpdated: this.lastUpdated.toISOString(),
      confidence: isShadowbanned ? 0.8 : 0.95, // Higher confidence if not shadowbanned
    };
  }

  /**
   * Check multiple hashtags
   */
  checkMultiple(hashtags: string[]): ShadowbanCheckResult[] {
    return hashtags.map((tag) => this.check(tag));
  }

  /**
   * Filter out shadowbanned hashtags
   */
  filter(hashtags: string[]): string[] {
    return hashtags.filter((tag) => !this.check(tag).isShadowbanned);
  }

  /**
   * Get shadowbanned hashtags from a list
   */
  getShadowbanned(hashtags: string[]): string[] {
    return hashtags.filter((tag) => this.check(tag).isShadowbanned);
  }

  /**
   * Update shadowban list (from external source)
   * Should be called weekly
   */
  updateList(newList: string[]): void {
    this.shadowbanList = new Set(newList.map((tag) => tag.toLowerCase().replace(/^#/, '')));
    this.lastUpdated = new Date();
    logger.info(
      `[ShadowbanValidator] Updated shadowban list: ${this.shadowbanList.size} entries`
    );
  }

  /**
   * Check if shadowban list is stale (older than 14 days)
   */
  isStale(maxAgeMs: number = 14 * 24 * 60 * 60 * 1000): boolean {
    const ageMs = Date.now() - this.lastUpdated.getTime();
    const isStale = ageMs > maxAgeMs;

    if (isStale) {
      logger.warn(
        `[ShadowbanValidator] Shadowban list is stale (${Math.floor(ageMs / (24 * 60 * 60 * 1000))} days old)`
      );
    }

    return isStale;
  }

  /**
   * Get last update timestamp
   */
  getLastUpdated(): Date {
    return this.lastUpdated;
  }

  /**
   * Get list size
   */
  getListSize(): number {
    return this.shadowbanList.size;
  }

  /**
   * Reset to default list
   */
  resetToDefaults(): void {
    this.shadowbanList = new Set(DEFAULT_SHADOWBAN_LIST);
    this.lastUpdated = new Date();
    logger.info(
      `[ShadowbanValidator] Reset to default shadowban list: ${this.shadowbanList.size} entries`
    );
  }
}

export default ShadowbanValidator;
