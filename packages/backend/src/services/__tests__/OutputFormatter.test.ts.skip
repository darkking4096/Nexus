/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import {
  OutputFormatter,
  UnifiedContentOutput,
} from '../OutputFormatter';
import {
  CaptionGenerationResponse,
  CaptionOption,
} from '../CaptionGenerator';
import {
  HashtagGenerationResponse,
  GeneratedHashtag,
} from '../HashtagGenerator';
import {
  VisualGenerationResponse,
} from '../VisualGenerator';
import {
  CarouselGenerationResponse,
  CarouselSlideOutput,
} from '../CarouselGenerator';
import {
  StoryGenerationResponse,
} from '../StoryGenerator';

/**
 * Helper: Create mock image buffer
 */
function createMockImageBuffer(size: number = 1024): Buffer {
  return Buffer.alloc(size);
}

/**
 * Helper: Create mock caption response
 */
function createMockCaptionResponse(
  overrides?: Partial<CaptionGenerationResponse>
): CaptionGenerationResponse {
  const defaultCaptions: CaptionOption[] = [
    {
      type: 'hook',
      text: 'Discover the secret to viral Instagram content!',
      charCount: 45,
      hashtags: ['instagram', 'content', 'viral'],
      confidenceScore: 0.92,
    },
    {
      type: 'teaser',
      text: 'Wait until you see what happens next...',
      charCount: 38,
      hashtags: ['teaser', 'curiosity'],
      confidenceScore: 0.85,
    },
  ];

  return {
    captions: defaultCaptions,
    metadata: {
      profileId: 'profile_123',
      generatedAt: new Date().toISOString(),
      framework: 'AIDA',
      confidenceAverage: 0.88,
      brandTone: 'casual',
    },
    ...overrides,
  };
}

/**
 * Helper: Create mock hashtag response
 */
function createMockHashtagResponse(
  overrides?: Partial<HashtagGenerationResponse>
): HashtagGenerationResponse {
  const defaultHashtags: GeneratedHashtag[] = [
    {
      hashtag: 'instagram',
      volume: 1500000,
      competition: 'high',
      recommendation_score: 0.88,
      category: 'trending',
      status: 'approved',
    },
    {
      hashtag: 'contentmarketing',
      volume: 250000,
      competition: 'medium',
      recommendation_score: 0.85,
      category: 'niche',
      status: 'approved',
    },
    {
      hashtag: 'shadowbanned',
      volume: 0,
      competition: 'high',
      recommendation_score: 0.3,
      category: 'long-tail',
      status: 'flagged',
    },
  ];

  return {
    hashtags: defaultHashtags,
    totalGenerated: 30,
    totalApproved: 25,
    totalFlagged: 3,
    totalRemoved: 2,
    generatedAt: new Date().toISOString(),
    metadata: {
      profile_id: 'profile_123',
      content_type: 'carousel',
      niche: 'marketing',
      shadowban_alerts: 1,
    },
    ...overrides,
  };
}

/**
 * Helper: Create mock visual response
 */
function createMockVisualResponse(
  overrides?: Partial<VisualGenerationResponse>
): VisualGenerationResponse {
  return {
    imageBuffer: createMockImageBuffer(2048),
    format: 'feed',
    dimensions: {
      width: 1080,
      height: 1080,
    },
    cacheHit: false,
    generatedAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Helper: Create mock carousel response
 */
function createMockCarouselResponse(
  slideCount: number = 3,
  overrides?: Partial<CarouselGenerationResponse>
): CarouselGenerationResponse {
  const slides: CarouselSlideOutput[] = Array.from({ length: slideCount }).map((_, i) => ({
    slideNumber: i + 1,
    imageBuffer: createMockImageBuffer(1536),
    dimensions: {
      width: 1080,
      height: 1350,
    },
    copyApplied: true,
    numberApplied: true,
    contrastValidated: true,
    contrastRatio: 4.5,
  }));

  return {
    slides,
    totalSlides: slideCount,
    generatedAt: new Date().toISOString(),
    metadata: {
      brandColors: {
        primary: '#FF6B6B',
        secondary: '#4ECDC4',
      },
      numberingEnabled: true,
      contrastValidation: true,
    },
    ...overrides,
  };
}

/**
 * Helper: Create mock story response
 */
function createMockStoryResponse(
  overrides?: Partial<StoryGenerationResponse>
): StoryGenerationResponse {
  return {
    imageBuffer: createMockImageBuffer(1024),
    dimensions: {
      width: 1080,
      height: 1920,
    },
    fileSize: 1024,
    generatedAt: new Date().toISOString(),
    brandConfig: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#4ECDC4',
      fontFamily: 'Arial',
    } as any,
    metadata: {
      contentLength: 45,
      contrastValidated: true,
      contrastRatio: 4.8,
      logoEmbedded: true,
    },
    ...overrides,
  };
}

describe('OutputFormatter', () => {
  describe('formatUnifiedOutput', () => {
    it('should format complete output with all components', () => {
      const caption = createMockCaptionResponse();
      const hashtags = createMockHashtagResponse();
      const visual = createMockVisualResponse();
      const carousel = createMockCarouselResponse(3);
      const story = createMockStoryResponse();

      const output = OutputFormatter.formatUnifiedOutput(
        caption,
        hashtags,
        visual,
        carousel,
        story
      );

      expect(output).toBeDefined();
      expect(output.content.caption).toBeDefined();
      expect(output.content.hashtags).toHaveLength(3);
      expect(output.content.media.feed_post).toBeDefined();
      expect(output.content.media.carousel).toHaveLength(3);
      expect(output.content.media.story).toBeDefined();
      expect(output.metadata.validationStatus).toBe('complete');
    });

    it('should format partial output with missing components', () => {
      const caption = createMockCaptionResponse();
      const hashtags = createMockHashtagResponse();

      const output = OutputFormatter.formatUnifiedOutput(caption, hashtags);

      expect(output.content.caption).toBeDefined();
      expect(output.content.hashtags).toHaveLength(3);
      expect(output.content.media.feed_post).toBeUndefined();
      expect(output.content.media.carousel).toBeUndefined();
      expect(output.content.media.story).toBeUndefined();
      expect(output.metadata.validationStatus).toBe('partial');
    });

    it('should format empty output when no components provided', () => {
      const output = OutputFormatter.formatUnifiedOutput();

      expect(output.content.caption).toBeUndefined();
      expect(output.content.hashtags).toHaveLength(0);
      expect(Object.keys(output.content.media).length).toBe(0);
      expect(output.metadata.validationStatus).toBe('empty');
    });

    it('should select best caption based on type and confidence', () => {
      const captions: CaptionOption[] = [
        {
          type: 'cta',
          text: 'Call to action',
          charCount: 20,
          hashtags: [],
          confidenceScore: 0.95,
        },
        {
          type: 'hook',
          text: 'Hook caption',
          charCount: 12,
          hashtags: [],
          confidenceScore: 0.85,
        },
        {
          type: 'hook',
          text: 'Better hook',
          charCount: 11,
          hashtags: [],
          confidenceScore: 0.92,
        },
      ];

      const response = createMockCaptionResponse({ captions });
      const output = OutputFormatter.formatUnifiedOutput(response);

      // Should select hook type with highest confidence
      expect(output.content.caption?.type).toBe('hook');
      expect(output.content.caption?.confidenceScore).toBe(0.92);
    });

    it('should encode images as base64 strings', () => {
      const visual = createMockVisualResponse();
      const carousel = createMockCarouselResponse(1);
      const story = createMockStoryResponse();

      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        undefined,
        visual,
        carousel,
        story
      );

      // Verify base64 encoding
      expect(output.content.media.feed_post).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(output.content.media.carousel?.[0].image).toMatch(/^[A-Za-z0-9+/=]+$/);
      expect(output.content.media.story).toMatch(/^[A-Za-z0-9+/=]+$/);
    });

    it('should preserve carousel slide structure and metadata', () => {
      const carousel = createMockCarouselResponse(5);
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        undefined,
        undefined,
        carousel
      );

      expect(output.content.media.carousel).toHaveLength(5);
      output.content.media.carousel?.forEach((slide, index) => {
        expect(slide.slideNumber).toBe(index + 1);
        expect(slide.dimensions).toEqual({
          width: 1080,
          height: 1350,
        });
        expect(slide.image).toBeTruthy();
      });
    });

    it('should normalize hashtags with missing optional fields', () => {
      const hashtags: GeneratedHashtag[] = [
        {
          hashtag: 'test',
          volume: 1000,
          competition: 'medium',
          recommendation_score: 0.7,
          category: 'trending',
          status: 'approved',
        },
      ];

      const response = createMockHashtagResponse({ hashtags });
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        response
      );

      const normalized = output.content.hashtags[0];
      expect(normalized.tag).toBe('test');
      expect(normalized.category).toBe('trending');
      expect(normalized.status).toBe('approved');
    });

    it('should track component availability in metadata', () => {
      const caption = createMockCaptionResponse();
      const carousel = createMockCarouselResponse(2);

      const output = OutputFormatter.formatUnifiedOutput(caption, undefined, undefined, carousel);

      expect(output.metadata.components.caption).toBe(true);
      expect(output.metadata.components.hashtags).toBe(false);
      expect(output.metadata.components.media.feed_post).toBe(false);
      expect(output.metadata.components.media.carousel).toBe(true);
      expect(output.metadata.components.media.story).toBe(false);
    });
  });

  describe('validate', () => {
    it('should validate complete valid output', () => {
      const caption = createMockCaptionResponse();
      const hashtags = createMockHashtagResponse();
      const visual = createMockVisualResponse();
      const carousel = createMockCarouselResponse(3);
      const story = createMockStoryResponse();

      const output = OutputFormatter.formatUnifiedOutput(
        caption,
        hashtags,
        visual,
        carousel,
        story
      );

      const validation = OutputFormatter.validate(output);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should flag empty caption text as critical error', () => {
      const caption = createMockCaptionResponse({
        captions: [
          {
            type: 'hook',
            text: '',
            charCount: 0,
            hashtags: [],
            confidenceScore: 0.8,
          },
        ],
      });

      const output = OutputFormatter.formatUnifiedOutput(caption);
      const validation = OutputFormatter.validate(output);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          component: 'caption',
          severity: 'critical',
          message: expect.stringContaining('empty'),
        })
      );
    });

    it('should warn on caption exceeding Instagram limit', () => {
      const caption = createMockCaptionResponse({
        captions: [
          {
            type: 'hook',
            text: 'A'.repeat(2300), // Over 2200 limit
            charCount: 2300,
            hashtags: [],
            confidenceScore: 0.8,
          },
        ],
      });

      const output = OutputFormatter.formatUnifiedOutput(caption);
      const validation = OutputFormatter.validate(output);

      expect(validation.warnings).toContainEqual(
        expect.objectContaining({
          component: 'caption',
          message: expect.stringContaining('exceeds Instagram limit'),
        })
      );
    });

    it('should warn on low confidence caption', () => {
      const caption = createMockCaptionResponse({
        captions: [
          {
            type: 'hook',
            text: 'Low confidence caption',
            charCount: 22,
            hashtags: [],
            confidenceScore: 0.3,
          },
        ],
      });

      const output = OutputFormatter.formatUnifiedOutput(caption);
      const validation = OutputFormatter.validate(output);

      expect(validation.warnings).toContainEqual(
        expect.objectContaining({
          component: 'caption',
          message: expect.stringContaining('Low confidence'),
        })
      );
    });

    it('should warn on flagged hashtags', () => {
      const hashtags = createMockHashtagResponse({
        hashtags: [
          {
            hashtag: 'flagged',
            volume: 1000,
            competition: 'medium',
            recommendation_score: 0.5,
            category: 'trending',
            status: 'flagged',
          },
          {
            hashtag: 'approved',
            volume: 1000,
            competition: 'medium',
            recommendation_score: 0.8,
            category: 'trending',
            status: 'approved',
          },
        ],
      });

      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        hashtags
      );
      const validation = OutputFormatter.validate(output);

      expect(validation.warnings).toContainEqual(
        expect.objectContaining({
          component: 'hashtags',
          message: expect.stringContaining('flagged'),
        })
      );
    });

    it('should detect invalid base64 encoding', () => {
      const output: UnifiedContentOutput = {
        content: {
          hashtags: [],
          media: {
            feed_post: 'not@valid#base64!!!',
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          components: {
            caption: false,
            hashtags: false,
            media: {
              feed_post: true,
              carousel: false,
              story: false,
            },
          },
          validationStatus: 'partial',
        },
      };

      const validation = OutputFormatter.validate(output);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          component: 'media.feed_post',
          severity: 'critical',
          message: expect.stringContaining('Invalid base64'),
        })
      );
    });

    it('should validate carousel structure', () => {
      const output: UnifiedContentOutput = {
        content: {
          hashtags: [],
          media: {
            carousel: [
              {
                slideNumber: 1,
                image: 'invalid',
                dimensions: { width: 1080, height: 1350 },
              },
            ],
          },
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          components: {
            caption: false,
            hashtags: false,
            media: {
              feed_post: false,
              carousel: true,
              story: false,
            },
          },
          validationStatus: 'partial',
        },
      };

      const validation = OutputFormatter.validate(output);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          component: 'media.carousel[0]',
          severity: 'critical',
        })
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle captions with special characters', () => {
      const caption = createMockCaptionResponse({
        captions: [
          {
            type: 'hook',
            text: '🚀 Discover the future of marketing! "Amazing" strategies & tips',
            charCount: 60,
            hashtags: [],
            confidenceScore: 0.88,
          },
        ],
      });

      const output = OutputFormatter.formatUnifiedOutput(caption);
      const validation = OutputFormatter.validate(output);

      expect(validation.valid).toBe(true);
      expect(output.content.caption?.text).toContain('🚀');
    });

    it('should handle carousel with single slide', () => {
      const carousel = createMockCarouselResponse(1);
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        undefined,
        undefined,
        carousel
      );

      expect(output.content.media.carousel).toHaveLength(1);
      expect(output.metadata.components.media.carousel).toBe(true);
    });

    it('should handle carousel with many slides', () => {
      const carousel = createMockCarouselResponse(10);
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        undefined,
        undefined,
        carousel
      );

      expect(output.content.media.carousel).toHaveLength(10);
      output.content.media.carousel?.forEach((slide, index) => {
        expect(slide.slideNumber).toBe(index + 1);
      });
    });

    it('should handle empty hashtag list', () => {
      const hashtags = createMockHashtagResponse({ hashtags: [] });
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        hashtags
      );

      expect(output.content.hashtags).toHaveLength(0);
    });

    it('should handle undefined responses gracefully', () => {
      const output = OutputFormatter.formatUnifiedOutput(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined
      );

      expect(output.metadata.validationStatus).toBe('empty');
      expect(output.content.caption).toBeUndefined();
      expect(output.content.hashtags).toHaveLength(0);
    });
  });
});
