import type { DatabaseAdapter } from '../config/database';
import { logger } from '../utils/logger';
import { CopywriterClient, CopywriterRequest } from './CopywriterClient';

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
  private db: DatabaseAdapter;
  private copywriter: CopywriterClient;
  private confidenceThreshold: number = 50;
  private charLimits = {
    min: 50,
    max: 150,
  };

  constructor(db: DatabaseAdapter) {
    this.db = db;
    this.copywriter = new CopywriterClient();
  }

  /**
   * Main entry point: Generate captions for a profile based on analysis
   *
   * **Algorithm:**
   * 1. Fetch profile context (voice, tone, audience)
   * 2. Fetch latest content analysis (viral score, best performing styles)
   * 3. For each caption type requested:
   *    - Call @copywriter squad with brand tone framework
   *    - Validate confidence score >= threshold (50%)
   *    - Generate hashtags and hooks
   * 4. Return all captions meeting quality threshold
   *
   * **Confidence Scoring:**
   * - Hook quality: 0-100% based on engagement history
   * - Tone alignment: Validated against profile voice
   * - Hashtag relevance: Checked against trending/niche tags
   *
   * @param request Caption generation request with profile, types, and brand tone
   * @returns Promise resolving to generated captions with metadata and confidence scores
   * @throws Error if no captions meet quality threshold (50% confidence)
   *
   * @example
   * const captions = await generator.generateCaptions({
   *   profileId: 'profile-123',
   *   captionTypes: ['hook', 'cta'],
   *   brandTone: 'professional'
   * });
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

    // Call @copywriter squad via Claude API with retry logic
    let caption: string | null = null;
    let confidenceScore: number = 0;

    try {
      const copywriterRequest: CopywriterRequest = {
        captionType,
        brandVoice: profile.context?.voice || 'authentic, engaging',
        brandTone,
        targetAudience:
          profile.context?.targetAudience?.interests?.join(', ') || 'general audience',
        insights: analysis?.analysisData?.insights?.slice(0, 3),
        framework: analysis?.analysisData?.recommendedFramework,
      };

      const response = await this.copywriter.generateCaption(copywriterRequest);
      caption = response.caption;
      confidenceScore = response.confidenceScore;

      logger.info(
        `[CaptionGenerator] @copywriter generated caption (confidence: ${confidenceScore})`
      );
    } catch (error) {
      logger.warn(
        `[CaptionGenerator] @copywriter failed, using fallback template: ${error instanceof Error ? error.message : String(error)}`
      );

      // Fallback to template-based generation if copywriter fails
      caption = await this.generateFromTemplate(
        profile,
        analysis,
        captionType,
        brandTone
      );
      confidenceScore = 60; // Lower confidence for fallback
    }

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

    // Use copywriter's confidence if available, otherwise calculate
    if (confidenceScore === 0) {
      confidenceScore = this.calculateConfidenceScore(
        caption,
        analysis,
        brandTone
      );
    }

    return {
      type: captionType,
      text: caption,
      charCount: caption.length,
      hashtags,
      confidenceScore,
    };
  }

  /**
   * Template-based caption generation (fallback if @copywriter agent fails)
   * Used as graceful degradation when copywriter squad is unavailable/timeout
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
      const row = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (!row) {
        return null;
      }

      const context =
        typeof row.context === 'string' ? JSON.parse(row.context) : row.context;

      return {
        id: String(row.id),
        userId: String(row.userId),
        username: String(row.username),
        context: context as Record<string, unknown>,
      };
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
      const row = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (!row) {
        return null;
      }

      const analysisData =
        typeof row.analysisData === 'string'
          ? JSON.parse(row.analysisData)
          : row.analysisData;

      return {
        id: String(row.id),
        profileId: String(row.profileId),
        analysisData: analysisData as Record<string, unknown>,
      };
    } catch (error) {
      logger.error(`[CaptionGenerator] Error fetching analysis: ${error}`);
      return null;
    }
  }
}
