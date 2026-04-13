import { logger } from '../utils/logger';
import { CaptionGenerationResponse, CaptionOption } from './CaptionGenerator';
import { HashtagGenerationResponse } from './HashtagGenerator';
import { VisualGenerationResponse } from './VisualGenerator';
import { CarouselGenerationResponse } from './CarouselGenerator';
import { StoryGenerationResponse } from './StoryGenerator';

/**
 * Unified output types
 */
export interface UnifiedMediaContent {
  feed_post?: string; // base64 encoded image
  carousel?: Array<{
    slideNumber: number;
    image: string; // base64 encoded image
    dimensions: {
      width: number;
      height: number;
    };
  }>;
  story?: string; // base64 encoded image
}

export interface UnifiedHashtag {
  tag: string;
  category: 'trending' | 'niche' | 'long-tail';
  status: 'approved' | 'flagged' | 'removed';
  recommendationScore?: number;
}

export interface UnifiedCaption {
  type: 'hook' | 'teaser' | 'cta';
  text: string;
  charCount: number;
  confidenceScore: number;
}

export interface UnifiedContentOutput {
  content: {
    caption?: UnifiedCaption;
    hashtags: UnifiedHashtag[];
    media: UnifiedMediaContent;
  };
  metadata: {
    generatedAt: string;
    components: {
      caption: boolean;
      hashtags: boolean;
      media: {
        feed_post: boolean;
        carousel: boolean;
        story: boolean;
      };
    };
    validationStatus: 'complete' | 'partial' | 'empty';
  };
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    component: string;
    severity: 'critical' | 'warning';
    message: string;
  }>;
  warnings: Array<{
    component: string;
    message: string;
  }>;
}

/**
 * OutputFormatter: Unifies outputs from all generation services
 * Consolidates: Caption + Hashtags + Visual + Carousel + Story
 */
export class OutputFormatter {
  /**
   * Format unified output from all generation services
   */
  public static formatUnifiedOutput(
    captionResponse?: CaptionGenerationResponse,
    hashtagResponse?: HashtagGenerationResponse,
    visualResponse?: VisualGenerationResponse,
    carouselResponse?: CarouselGenerationResponse,
    storyResponse?: StoryGenerationResponse
  ): UnifiedContentOutput {
    const generatedAt = new Date().toISOString();

    // Extract caption (prefer first hook or teaser)
    const caption = captionResponse?.captions
      ? this.selectBestCaption(captionResponse.captions)
      : undefined;

    // Extract and normalize hashtags
    const hashtags = this.normalizeHashtags(hashtagResponse);

    // Extract and encode media
    const media = this.encodeMedia(visualResponse, carouselResponse, storyResponse);

    // Determine validation status
    const hasCaption = !!caption;
    const hasHashtags = hashtags.length > 0;
    const hasMedia = Object.values(media).some(v => v !== undefined);

    const validationStatus =
      hasCaption && hasHashtags && hasMedia
        ? 'complete'
        : hasCaption || hasHashtags || hasMedia
          ? 'partial'
          : 'empty';

    const output: UnifiedContentOutput = {
      content: {
        caption: caption,
        hashtags,
        media,
      },
      metadata: {
        generatedAt,
        components: {
          caption: hasCaption,
          hashtags: hasHashtags,
          media: {
            feed_post: !!media.feed_post,
            carousel: !!media.carousel && media.carousel.length > 0,
            story: !!media.story,
          },
        },
        validationStatus,
      },
    };

    logger.debug('OutputFormatter: unified output formatted', {
      caption: hasCaption,
      hashtags: hasHashtags,
      media: Object.keys(media).filter(k => media[k as keyof UnifiedMediaContent] !== undefined),
    });

    return output;
  }

  /**
   * Validate all components of the unified output
   */
  public static validate(output: UnifiedContentOutput): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    const warnings: ValidationResult['warnings'] = [];

    // Validate caption if present
    if (output.content.caption) {
      if (!output.content.caption.text || output.content.caption.text.trim().length === 0) {
        errors.push({
          component: 'caption',
          severity: 'critical',
          message: 'Caption text is empty',
        });
      }
      if (output.content.caption.charCount > 2200) {
        warnings.push({
          component: 'caption',
          message: `Caption exceeds Instagram limit (${output.content.caption.charCount} > 2200 chars)`,
        });
      }
      if (output.content.caption.confidenceScore < 0.5) {
        warnings.push({
          component: 'caption',
          message: `Low confidence score: ${output.content.caption.confidenceScore}`,
        });
      }
    }

    // Validate hashtags
    if (output.content.hashtags.length === 0 && output.metadata.components.hashtags) {
      warnings.push({
        component: 'hashtags',
        message: 'No approved hashtags available',
      });
    }

    const flaggedCount = output.content.hashtags.filter(h => h.status === 'flagged').length;
    if (flaggedCount > 0) {
      warnings.push({
        component: 'hashtags',
        message: `${flaggedCount} hashtag(s) flagged - review before publishing`,
      });
    }

    // Validate media
    const mediaKeys = Object.keys(output.content.media) as Array<keyof UnifiedMediaContent>;
    const hasAnyMedia = mediaKeys.some(key => output.content.media[key] !== undefined);

    if (!hasAnyMedia && output.metadata.components.media.feed_post) {
      errors.push({
        component: 'media',
        severity: 'critical',
        message: 'No media content available',
      });
    }

    // Validate base64 encoding
    for (const key of mediaKeys) {
      const value = output.content.media[key];
      if (value && typeof value === 'string' && !this.isValidBase64(value)) {
        errors.push({
          component: `media.${key}`,
          severity: 'critical',
          message: 'Invalid base64 encoding detected',
        });
      }
    }

    // Validate carousel structure
    if (output.content.media.carousel) {
      if (!Array.isArray(output.content.media.carousel)) {
        errors.push({
          component: 'media.carousel',
          severity: 'critical',
          message: 'Carousel must be an array',
        });
      } else {
        for (let i = 0; i < output.content.media.carousel.length; i++) {
          const slide = output.content.media.carousel[i];
          if (!slide.image || !this.isValidBase64(slide.image)) {
            errors.push({
              component: `media.carousel[${i}]`,
              severity: 'critical',
              message: 'Invalid or missing slide image',
            });
          }
        }
      }
    }

    const valid = errors.length === 0;
    logger.debug('OutputFormatter validation complete', {
      valid,
      errors: errors.length,
      warnings: warnings.length,
    });

    return { valid, errors, warnings };
  }

  /**
   * Private helper: Select best caption from options
   */
  private static selectBestCaption(captions: CaptionOption[]): UnifiedCaption | undefined {
    if (!captions || captions.length === 0) return undefined;

    // Prioritize: hook > teaser > cta, then by confidence score
    const priorityOrder = { hook: 0, teaser: 1, cta: 2 };
    const sorted = [...captions].sort((a, b) => {
      const typePriority = (priorityOrder[a.type as keyof typeof priorityOrder] ?? 3) -
                          (priorityOrder[b.type as keyof typeof priorityOrder] ?? 3);
      if (typePriority !== 0) return typePriority;
      return (b.confidenceScore || 0) - (a.confidenceScore || 0);
    });

    const best = sorted[0];
    return {
      type: best.type,
      text: best.text,
      charCount: best.charCount,
      confidenceScore: best.confidenceScore,
    };
  }

  /**
   * Private helper: Normalize hashtags from response
   */
  private static normalizeHashtags(response?: HashtagGenerationResponse): UnifiedHashtag[] {
    if (!response || !response.hashtags) return [];

    return response.hashtags.map(h => ({
      tag: h.hashtag || '',
      category: h.category || 'trending',
      status: h.status || 'approved',
      recommendationScore: h.recommendation_score,
    }));
  }

  /**
   * Private helper: Encode media responses to unified format
   */
  private static encodeMedia(
    visualResponse?: VisualGenerationResponse,
    carouselResponse?: CarouselGenerationResponse,
    storyResponse?: StoryGenerationResponse
  ): UnifiedMediaContent {
    const media: UnifiedMediaContent = {};

    // Encode feed post
    if (visualResponse?.imageBuffer) {
      media.feed_post = visualResponse.imageBuffer.toString('base64');
    }

    // Encode carousel
    if (carouselResponse?.slides && carouselResponse.slides.length > 0) {
      media.carousel = carouselResponse.slides.map(slide => ({
        slideNumber: slide.slideNumber,
        image: slide.imageBuffer.toString('base64'),
        dimensions: slide.dimensions,
      }));
    }

    // Encode story
    if (storyResponse?.imageBuffer) {
      media.story = storyResponse.imageBuffer.toString('base64');
    }

    return media;
  }

  /**
   * Private helper: Validate base64 string
   */
  private static isValidBase64(str: string | undefined): boolean {
    if (!str) return false;
    try {
      return /^[A-Za-z0-9+/]*={0,2}$/.test(str) && str.length % 4 === 0;
    } catch {
      return false;
    }
  }
}
