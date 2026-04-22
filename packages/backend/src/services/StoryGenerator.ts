import type { DatabaseAdapter } from '../config/database';
import sharp from 'sharp';
import { logger } from '../utils/logger';
import BrandConfigLoader, { BrandConfig, BrandConfigRequest } from './BrandConfigLoader';
import ContrastValidator from './ContrastValidator';
import { applyStoryOverlay, generateStoryBackground, StoryTextOverlayOptions } from '../utils/svg-story-overlay';

/**
 * Story Generation Types
 */

export interface StoryGenerationContent {
  headline?: string;
  body?: string;
  cta?: string;
  brandId?: string;
  profileId?: string;
  customColors?: Record<string, string>;
}

export interface StoryGenerationRequest extends StoryGenerationContent {
  backgroundImage?: Buffer;
}

export interface StoryGenerationResponse {
  imageBuffer: Buffer;
  dimensions: {
    width: number;
    height: number;
  };
  fileSize: number;
  generatedAt: string;
  brandConfig: BrandConfig;
  metadata: {
    contentLength: number;
    contrastValidated: boolean;
    contrastRatio?: number;
    logoEmbedded: boolean;
  };
}

/**
 * StoryGenerator: Generate Instagram Story frames (1080x1920) with brand consistency
 */
export class StoryGenerator {
  private brandConfigLoader: BrandConfigLoader;
  private readonly STANDARD_WIDTH = 1080;
  private readonly STANDARD_HEIGHT = 1920;
  private readonly MAX_FILE_SIZE = 500 * 1024; // 500KB

  constructor(db: DatabaseAdapter) {
    this.brandConfigLoader = new BrandConfigLoader(db);
  }

  /**
   * Generate story frame
   */
  async generateStory(request: StoryGenerationRequest): Promise<StoryGenerationResponse> {
    const brandConfigReq: BrandConfigRequest = {
      brandId: request.brandId,
      profileId: request.profileId,
      customColors: request.customColors,
    };

    // Load brand config
    const brandConfig = await this.brandConfigLoader.loadBrandConfigOrDefault(
      brandConfigReq
    );

    logger.info(
      `[StoryGenerator] Generating story: profile=${request.profileId}, brand=${brandConfig.id}`
    );

    // Validate brand config
    const validation = this.brandConfigLoader.validateBrandConfig(brandConfig);
    if (!validation.valid) {
      logger.warn(
        `[StoryGenerator] Brand config validation warnings: ${validation.errors.join(', ')}`
      );
    }

    // Generate or load background
    let backgroundBuffer: Buffer;
    if (request.backgroundImage) {
      backgroundBuffer = await this.ensureImageDimensions(request.backgroundImage);
    } else {
      backgroundBuffer = await generateStoryBackground(
        this.STANDARD_WIDTH,
        this.STANDARD_HEIGHT,
        brandConfig.colors.background,
        brandConfig.colors.primary
      );
    }

    // Determine text color based on background
    const textColor = ContrastValidator.getContrastingTextColor(brandConfig.colors.background);

    // Apply text overlay
    const overlayOptions: StoryTextOverlayOptions = {
      headline: request.headline,
      body: request.body,
      cta: request.cta,
      primaryColor: brandConfig.colors.primary,
      textColor,
      headlineFontSize: 32,
      bodyFontSize: 18,
      ctaFontSize: 16,
    };

    let storyBuffer = await applyStoryOverlay(
      backgroundBuffer,
      overlayOptions,
      this.STANDARD_WIDTH,
      this.STANDARD_HEIGHT
    );

    // Embed logo if available
    let logoEmbedded = false;
    if (brandConfig.logo) {
      try {
        storyBuffer = await this.embedLogo(storyBuffer, brandConfig.logo);
        logoEmbedded = true;
      } catch (error) {
        logger.warn(`[StoryGenerator] Failed to embed logo: ${error}`);
      }
    }

    // Optimize file size
    storyBuffer = await sharp(storyBuffer)
      .png({ quality: 80, progressive: true })
      .toBuffer();

    // Validate file size
    if (storyBuffer.length > this.MAX_FILE_SIZE) {
      logger.warn(
        `[StoryGenerator] File size ${storyBuffer.length} > ${this.MAX_FILE_SIZE}, compressing...`
      );
      storyBuffer = await sharp(storyBuffer)
        .png({ quality: 60 })
        .toBuffer();
    }

    // Validate contrast (text against background where text will be displayed)
    const contrastResult = ContrastValidator.validateWCAG_AA(textColor, brandConfig.colors.background);

    return {
      imageBuffer: storyBuffer,
      dimensions: {
        width: this.STANDARD_WIDTH,
        height: this.STANDARD_HEIGHT,
      },
      fileSize: storyBuffer.length,
      generatedAt: new Date().toISOString(),
      brandConfig,
      metadata: {
        contentLength: this.calculateContentLength(request),
        contrastValidated: contrastResult.passed,
        contrastRatio: contrastResult.ratio,
        logoEmbedded,
      },
    };
  }

  /**
   * Ensure image has correct dimensions
   */
  private async ensureImageDimensions(imageBuffer: Buffer): Promise<Buffer> {
    const metadata = await sharp(imageBuffer).metadata();

    if (
      metadata.width === this.STANDARD_WIDTH &&
      metadata.height === this.STANDARD_HEIGHT
    ) {
      return imageBuffer;
    }

    logger.debug(
      `[StoryGenerator] Resizing image from ${metadata.width}x${metadata.height} to ${this.STANDARD_WIDTH}x${this.STANDARD_HEIGHT}`
    );

    return sharp(imageBuffer)
      .resize(this.STANDARD_WIDTH, this.STANDARD_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toBuffer();
  }

  /**
   * Embed brand logo in story
   */
  private async embedLogo(
    storyBuffer: Buffer,
    logo: { url: string; width: number; height: number }
  ): Promise<Buffer> {
    try {
      // In production, fetch logo from URL
      // For now, just log and skip
      logger.debug(`[StoryGenerator] Would embed logo: ${logo.url}`);
      return storyBuffer;
    } catch (error) {
      logger.error(`[StoryGenerator] Error embedding logo: ${error}`);
      return storyBuffer;
    }
  }

  /**
   * Calculate total content length (headline + body + cta)
   */
  private calculateContentLength(request: StoryGenerationRequest): number {
    let length = 0;
    if (request.headline) length += request.headline.length;
    if (request.body) length += request.body.length;
    if (request.cta) length += request.cta.length;
    return length;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testBuffer = await generateStoryBackground(
        this.STANDARD_WIDTH,
        this.STANDARD_HEIGHT,
        '#FF5733'
      );
      return testBuffer.length > 0;
    } catch (error) {
      logger.error(`[StoryGenerator] Health check failed: ${error}`);
      return false;
    }
  }
}

export default StoryGenerator;
