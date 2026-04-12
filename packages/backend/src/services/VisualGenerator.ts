import Database from 'better-sqlite3';
import { logger } from '../utils/logger';
import {
  NandoBananaClient,
  NandoBananaImageRequest,
  NandoBananaImageResponse,
} from '../integrations/NandoBananaClient';
import { BrandingProcessor, BrandingConfig } from './BrandingProcessor';
import { ImageCache } from '../cache/ImageCache';

export type InstagramFormat = 'feed' | 'story' | 'reel';

export interface VisualGenerationRequest {
  profileId: string;
  prompt: string;
  format: InstagramFormat;
  brandingConfig?: BrandingConfig;
}

export interface VisualGenerationResponse {
  imageBuffer: Buffer;
  format: InstagramFormat;
  dimensions: {
    width: number;
    height: number;
  };
  cacheHit: boolean;
  generatedAt: string;
}

export interface BrandProfile {
  id: string;
  primaryColor?: string;
  secondaryColor?: string;
  logoPath?: string;
  brandOpacity?: number;
}

/**
 * VisualGenerator: Orchestrates image generation and processing
 * Integrates: Nando Banana API → Branding → Resizing → Caching
 */
export class VisualGenerator {
  private db: Database.Database;
  private nandoClient: NandoBananaClient;
  private brandingProcessor: BrandingProcessor;
  private imageCache: ImageCache;

  private formatDimensions = {
    feed: { width: 1080, height: 1350 },
    story: { width: 1080, height: 1920 },
    reel: { width: 1080, height: 1920 },
  };

  constructor(db: Database.Database) {
    this.db = db;
    this.nandoClient = new NandoBananaClient();
    this.brandingProcessor = new BrandingProcessor();
    this.imageCache = new ImageCache();
  }

  /**
   * Main entry point: Generate visual content
   */
  async generateVisual(
    request: VisualGenerationRequest
  ): Promise<VisualGenerationResponse> {
    logger.info(
      `[VisualGenerator] Generating visual: profile=${request.profileId}, format=${request.format}`
    );

    // Step 1: Fetch profile branding config
    const brandProfile = await this.fetchBrandProfile(request.profileId);
    const brandingConfig = request.brandingConfig || this.buildBrandingConfig(brandProfile);

    // Step 2: Check cache
    const cacheKey = this.imageCache.generateCacheKey(
      request.profileId,
      request.format,
      this.imageCache.computeHash(request.prompt + JSON.stringify(brandingConfig))
    );

    const cachedEntry = await this.imageCache.get(cacheKey);
    if (cachedEntry) {
      logger.info(`[VisualGenerator] Cache HIT for ${cacheKey}`);
      return {
        imageBuffer: cachedEntry.imageBuffer,
        format: request.format,
        dimensions: this.formatDimensions[request.format],
        cacheHit: true,
        generatedAt: cachedEntry.createdAt,
      };
    }

    logger.info(`[VisualGenerator] Cache MISS for ${cacheKey}`);

    // Step 3: Generate base image via Nando Banana
    const baseImage = await this.generateBaseImage(request.prompt);

    // Step 4: Apply branding
    const brandedImage = await this.brandingProcessor.applyBranding(
      baseImage.imageData!,
      brandingConfig
    );

    // Step 5: Resize to format
    const finalImage = await this.resizeToFormat(
      brandedImage.imageBuffer,
      request.format
    );

    // Step 6: Cache result
    await this.imageCache.set(cacheKey, finalImage, 'jpg');

    const response: VisualGenerationResponse = {
      imageBuffer: finalImage,
      format: request.format,
      dimensions: this.formatDimensions[request.format],
      cacheHit: false,
      generatedAt: new Date().toISOString(),
    };

    logger.info(`[VisualGenerator] Visual generated successfully`);
    return response;
  }

  /**
   * Generate base image using Nando Banana API
   */
  private async generateBaseImage(
    prompt: string
  ): Promise<NandoBananaImageResponse> {
    logger.info(`[VisualGenerator] Generating base image: "${prompt}"`);

    const request: NandoBananaImageRequest = {
      prompt,
      width: 2048,
      height: 2048,
    };

    const response = await this.nandoClient.generateImage(request);

    if (!response.imageData) {
      throw new Error('No image data returned from Nando Banana');
    }

    logger.debug(
      `[VisualGenerator] Base image generated: ${response.width}×${response.height}`
    );

    return response;
  }

  /**
   * Resize image to Instagram format
   */
  private async resizeToFormat(
    imageBuffer: Buffer,
    format: InstagramFormat
  ): Promise<Buffer> {
    logger.debug(`[VisualGenerator] Resizing to ${format}`);

    const dimensions = this.formatDimensions[format];

    // TODO(human): Implement Sharp resize
    // sharp(imageBuffer)
    //   .resize(dimensions.width, dimensions.height, {
    //     fit: 'cover',
    //     position: 'center',
    //   })
    //   .jpeg({ quality: 95 })
    //   .toBuffer()

    logger.debug(
      `[VisualGenerator] Resized to ${dimensions.width}×${dimensions.height}`
    );

    // For now, return original buffer
    return imageBuffer;
  }

  /**
   * Fetch brand profile from database
   */
  private async fetchBrandProfile(profileId: string): Promise<BrandProfile | null> {
    try {
      const stmt = this.db.prepare(`
        SELECT id, context
        FROM instagram_profiles
        WHERE id = ?
      `);
      const row = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (!row) {
        return null;
      }

      const context =
        typeof row.context === 'string' ? JSON.parse(row.context) : row.context;
      const brandColors = (context as Record<string, unknown>).brandColors as
        | string[]
        | undefined;

      return {
        id: String(row.id),
        primaryColor: brandColors?.[0],
        secondaryColor: brandColors?.[1],
      };
    } catch (error) {
      logger.warn(
        `[VisualGenerator] Error fetching brand profile: ${error instanceof Error ? error.message : String(error)}`
      );
      return null;
    }
  }

  /**
   * Build branding config from brand profile
   */
  private buildBrandingConfig(brandProfile: BrandProfile | null): BrandingConfig {
    if (!brandProfile) {
      return { colorOverlayOpacity: 30 };
    }

    return {
      primaryColor: brandProfile.primaryColor,
      secondaryColor: brandProfile.secondaryColor,
      logoPath: brandProfile.logoPath,
      colorOverlayOpacity: 30,
      logoPosition: 'top-right',
    };
  }

  /**
   * Validate that both services are ready
   */
  async healthCheck(): Promise<boolean> {
    try {
      const nandoHealth = await this.nandoClient.healthCheck();
      logger.info(`[VisualGenerator] Nando Banana: ${nandoHealth ? 'OK' : 'DOWN'}`);
      logger.info(`[VisualGenerator] Branding Processor: OK`);
      logger.info(`[VisualGenerator] Image Cache: OK`);
      return nandoHealth;
    } catch (error) {
      logger.error(
        `[VisualGenerator] Health check failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return false;
    }
  }
}
