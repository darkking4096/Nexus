import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

/**
 * Caption generation types and interfaces
 */
export type BrandTone = 'casual' | 'profissional' | 'viral';
export type CaptionType = 'hook' | 'teaser' | 'cta';

export interface CaptionRequest {
  profileId: string;
  captionTypes: CaptionType[];
  brandTone?: BrandTone;
  maxAttempts?: number;
}

export interface CaptionOption {
  type: CaptionType;
  text: string;
  charCount: number;
  hashtags: string[];
  confidenceScore: number;
}

export interface CaptionGenerationResponse {
  captions: CaptionOption[];
  metadata: {
    profileId: string;
    generatedAt: string;
    framework: string;
    confidenceAverage: number;
    brandTone: BrandTone;
  };
}

export interface GeneratedContent {
  id: string;
  profileId: string;
  analysisData?: {
    viralScore?: number;
    alignmentScore?: number;
    insights?: string[];
    recommendedFramework?: {
      framework: string;
      rationale: string;
      structure?: Record<string, string>;
    };
    bestPostingTime?: string;
    squadInput?: {
      profileStrategist?: string;
      contentPlanner?: string;
      analyticsAgent?: string;
    };
  };
}

export interface InstagramProfile {
  id: string;
  userId: string;
  username: string;
  context?: {
    voice?: string;
    tone?: string;
    targetAudience?: {
      ageRange?: string;
      interests?: string[];
      behaviors?: string;
    };
  };
}

/**
 * CaptionGenerator: Orchestrates caption generation with brand tone frameworks
 * Integrates with marketing-squad copywriter for refinement
 */
export class CaptionGenerator {
  private db: Database.Database;
  private confidenceThreshold: number = 50;
  private charLimits = {
    min: 50,
    max: 150,
  };

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Main entry point: Generate captions for a profile based on analysis
   */
  async generateCaptions(
    request: CaptionRequest
  ): Promise<CaptionGenerationResponse> {
    const {
      profileId,
      captionTypes,
      brandTone = 'casual',
      maxAttempts = 1,
    } = request;

    logger.info(`[CaptionGenerator] Starting generation for profile: ${profileId}`);

    // Step 1: Fetch profile and analysis data
    const profile = await this.fetchProfile(profileId);
    if (!profile) {
      throw new Error(
        `Profile not found: ${profileId}`
      );
    }

    const analysis = await this.fetchLatestAnalysis(profileId);
    if (!analysis) {
      logger.warn(
        `[CaptionGenerator] No analysis found for profile ${profileId}. Using defaults.`
      );
    }

    // Step 2: Generate captions using brand tone framework
    const generatedCaptions: CaptionOption[] = [];

    for (const captionType of captionTypes) {
      const caption = await this.generateSingleCaption(
        profile,
        analysis,
        captionType,
        brandTone,
        maxAttempts
      );

      if (caption && caption.confidenceScore >= this.confidenceThreshold) {
        generatedCaptions.push(caption);
      }
    }

    // Ensure we return at least 3 options total (across all types)
    if (generatedCaptions.length === 0) {
      throw new Error(
        `Failed to generate captions with confidence >= ${this.confidenceThreshold}%`
      );
    }

    const confidenceAverage =
      generatedCaptions.reduce((sum, c) => sum + c.confidenceScore, 0) /
      generatedCaptions.length;

    const response: CaptionGenerationResponse = {
      captions: generatedCaptions,
      metadata: {
        profileId,
        generatedAt: new Date().toISOString(),
        framework: analysis?.analysisData?.recommendedFramework?.framework || 'Default',
        confidenceAverage: Math.round(confidenceAverage),
        brandTone,
      },
    };

    logger.info(
      `[CaptionGenerator] Generation complete. ${generatedCaptions.length} captions generated.`
    );
    return response;
  }

  /**
   * Generate a single caption option with brand tone applied
   */
  private async generateSingleCaption(
    profile: InstagramProfile,
    analysis: GeneratedContent | null,
    captionType: CaptionType,
    brandTone: BrandTone,
    attempts: number
  ): Promise<CaptionOption | null> {
    logger.debug(
      `[CaptionGenerator] Generating ${captionType} caption (tone: ${brandTone})`
    );

    // Call copywriter squad (via Claude API integration)
    // TODO(human): Implement copywriter squad integration
    // For now, using template-based generation
    const caption = await this.generateFromTemplate(
      profile,
      analysis,
      captionType,
      brandTone
    );

    if (!caption) {
      return null;
    }

    // Validate caption
    const isValid = this.validateCaption(caption);
    if (!isValid && attempts > 1) {
      logger.warn(`[CaptionGenerator] Caption validation failed. Retrying...`);
      return this.generateSingleCaption(
        profile,
        analysis,
        captionType,
        brandTone,
        attempts - 1
      );
    }

    // Extract hashtags
    const hashtags = this.extractHashtags(caption, 5);

    // Calculate confidence score based on multiple factors
    const confidenceScore = this.calculateConfidenceScore(
      caption,
      analysis,
      brandTone
    );

    return {
      type: captionType,
      text: caption,
      charCount: caption.length,
      hashtags,
      confidenceScore,
    };
  }

  /**
   * Template-based caption generation (fallback until copywriter integration is complete)
   * TODO(human): Replace with actual copywriter squad integration
   */
  private async generateFromTemplate(
    profile: InstagramProfile,
    analysis: GeneratedContent | null,
    captionType: CaptionType,
    brandTone: BrandTone
  ): Promise<string | null> {
    // Template placeholders - would be replaced by copywriter squad
    const templates = {
      casual: {
        hook: "😱 {{insight}}... and you probably didn't know this! 🤯",
        teaser: "Wait for it... 👀\n\n{{insight}}\n\n(Swipe for the full story →)",
        cta: 'Ready to level up? 🚀\n\n{{call-to-action}}\n\nLink in bio!',
      },
      profissional: {
        hook: 'Key Insight: {{insight}}',
        teaser: 'We uncovered something important.\n\n{{insight}}\n\nMore details coming...',
        cta: '{{call-to-action}}\n\nVisit the link in our bio to learn more.',
      },
      viral: {
        hook: "Here's what everyone gets wrong about {{topic}}... {{insight}}",
        teaser: 'This changed everything 👇\n\n{{insight}}\n\n(The ending will surprise you)',
        cta: "Stop scrolling and {{call-to-action}}\n\n(You won't regret it)",
      },
    };

    const template = templates[brandTone]?.[captionType];
    if (!template) {
      logger.error(
        `[CaptionGenerator] No template found for ${brandTone}/${captionType}`
      );
      return null;
    }

    // Simple placeholder replacement (would be enhanced by copywriter)
    const insight = analysis?.analysisData?.insights?.[0] || 'brand-relevant insight';
    const topic = profile.context?.targetAudience?.interests?.[0] || 'this topic';
    const cta = 'take action today';

    const caption = template
      .replace('{{insight}}', insight)
      .replace('{{topic}}', topic)
      .replace('{{call-to-action}}', cta);

    return caption;
  }

  /**
   * Validate caption against Instagram and brand guidelines
   */
  private validateCaption(caption: string): boolean {
    // Check character count (excluding hashtags)
    const textWithoutHashtags = caption.replace(/#\S+/g, '').trim();
    if (
      textWithoutHashtags.length < this.charLimits.min ||
      textWithoutHashtags.length > this.charLimits.max
    ) {
      logger.warn(
        `[CaptionGenerator] Caption length ${textWithoutHashtags.length} out of bounds`
      );
      return false;
    }

    // Check for blocked words (Instagram policies)
    const blockedWords = [
      'click here',
      'buy now',
      'free money',
      'guaranteed',
    ];
    const captionLower = caption.toLowerCase();
    if (blockedWords.some((word) => captionLower.includes(word))) {
      logger.warn(`[CaptionGenerator] Caption contains blocked word`);
      return false;
    }

    return true;
  }

  /**
   * Extract hashtags from caption or generate relevant ones
   */
  private extractHashtags(caption: string, limit: number): string[] {
    const hashtags = caption.match(/#\S+/g) || [];
    if (hashtags.length >= limit) {
      return hashtags.slice(0, limit);
    }

    // If not enough, add generic relevant hashtags
    const suggested = ['#marketing', '#instagram', '#content', '#strategy'];
    return [...hashtags, ...suggested].slice(0, limit);
  }

  /**
   * Calculate confidence score based on multiple factors
   */
  private calculateConfidenceScore(
    caption: string,
    analysis: GeneratedContent | null,
    brandTone: BrandTone
  ): number {
    let score = 50; // baseline

    // Boost based on caption length
    if (caption.length >= this.charLimits.min && caption.length <= this.charLimits.max) {
      score += 20;
    }

    // Boost based on framework alignment
    if (analysis?.analysisData?.recommendedFramework) {
      score += 15;
    }

    // Boost based on viral/alignment scores
    if (analysis?.analysisData?.viralScore) {
      const viralBoost = Math.min(15, analysis.analysisData.viralScore / 10);
      score += viralBoost;
    }

    // Brand tone consistency check
    const toneKeywords = {
      casual: ['love', 'awesome', 'amazing', '😊', '🎉'],
      profissional: ['strategic', 'insights', 'important'],
      viral: ['surprising', 'shocking', 'must-see', 'can\'t miss'],
    };

    const keywords = toneKeywords[brandTone];
    const matchCount = keywords.filter((kw) =>
      caption.toLowerCase().includes(kw)
    ).length;
    score += matchCount * 2;

    return Math.min(100, score);
  }

  /**
   * Fetch Instagram profile from database
   */
  private async fetchProfile(profileId: string): Promise<InstagramProfile | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, userId, username, context
        FROM instagram_profiles
        WHERE id = ?
      `);
      const profile = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (profile && profile.context) {
        profile.context = JSON.parse(profile.context);
      }

      return profile || null;
    } catch (error) {
      logger.error(`[CaptionGenerator] Error fetching profile: ${error}`);
      return null;
    }
  }

  /**
   * Fetch latest analysis for a profile
   */
  private async fetchLatestAnalysis(
    profileId: string
  ): Promise<GeneratedContent | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, profileId, analysisData
        FROM generated_content
        WHERE profileId = ? AND analysisData IS NOT NULL
        ORDER BY createdAt DESC
        LIMIT 1
      `);
      const content = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (content && content.analysisData) {
        content.analysisData = JSON.parse(content.analysisData);
      }

      return content || null;
    } catch (error) {
      logger.error(`[CaptionGenerator] Error fetching analysis: ${error}`);
      return null;
    }
  }
}
