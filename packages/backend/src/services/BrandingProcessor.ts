import sharp from 'sharp';
import { logger } from '../utils/logger';
import fs from 'fs';

export interface BrandingConfig {
  primaryColor?: string; // hex: #FF6B6B
  secondaryColor?: string;
  logoPath?: string; // local path or URL
  logoOpacity?: number; // 0-100
  colorOverlayOpacity?: number; // 20-40 typical
  logoPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface BrandingResult {
  imageBuffer: Buffer;
  appliedBranding: {
    colors: boolean;
    logo: boolean;
    quality: number;
  };
}

/**
 * BrandingProcessor: Applies branding (colors, logo) to images using Sharp
 * Enhances base images with brand identity via color overlays and logo compositing
 */
export class BrandingProcessor {
  private readonly COLOR_OVERLAY_OPACITY = 30; // Default: 30%
  private readonly LOGO_OPACITY = 85; // Default: 85%
  private readonly OUTPUT_QUALITY = 95; // JPG quality

  /**
   * Apply branding to image buffer
   * Pipeline: Load → Apply color overlay → Composite logo → Output JPG
   */
  async applyBranding(
    imageBuffer: Buffer,
    config: BrandingConfig
  ): Promise<BrandingResult> {
    logger.info(
      `[BrandingProcessor] Applying branding: colors=${!!config.primaryColor}, logo=${!!config.logoPath}`
    );

    try {
      let pipeline = sharp(imageBuffer);
      let colorsApplied = false;
      let logoApplied = false;

      // Step 1: Apply color overlay if primary color provided
      if (config.primaryColor && this.isValidHexColor(config.primaryColor)) {
        logger.debug(
          `[BrandingProcessor] Applying color overlay: ${config.primaryColor}`
        );

        const opacity = config.colorOverlayOpacity || this.COLOR_OVERLAY_OPACITY;
        const opacityPercent = opacity / 100;

        // Create colored overlay with opacity
        const overlay = Buffer.from(
          `<svg><rect width="100%" height="100%" fill="${config.primaryColor}" opacity="${opacityPercent}"/></svg>`
        );

        pipeline = pipeline.composite([
          {
            input: overlay,
            blend: 'multiply',
          },
        ]);

        colorsApplied = true;
      }

      // Step 2: Composite logo if path provided
      if (config.logoPath) {
        logger.debug(`[BrandingProcessor] Compositing logo: ${config.logoPath}`);

        try {
          // Check if logo path is URL or local file
          let logoBuffer: Buffer;

          if (config.logoPath.startsWith('http')) {
            // TODO(human): Load from URL
            logger.warn(
              `[BrandingProcessor] URL logo loading not yet implemented`
            );
          } else if (fs.existsSync(config.logoPath)) {
            logoBuffer = fs.readFileSync(config.logoPath);

            const position = config.logoPosition || 'top-right';
            const logoOpacity = config.logoOpacity || this.LOGO_OPACITY;

            // Resize logo to ~15% of image width (assuming 1080px width)
            const logoResized = await sharp(logoBuffer)
              .resize(160, 160, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
              .composite([
                {
                  input: Buffer.from(
                    `<svg><rect width="100%" height="100%" fill="white" opacity="${(100 - logoOpacity) / 100}"/></svg>`
                  ),
                  blend: 'screen',
                },
              ])
              .toBuffer();

            // Position logo
            const logoPosition = this.getLogoPosition(position, 1080, 1350);

            pipeline = pipeline.composite([
              {
                input: logoResized,
                top: logoPosition.top,
                left: logoPosition.left,
              },
            ]);

            logoApplied = true;
          } else {
            logger.warn(
              `[BrandingProcessor] Logo path not found: ${config.logoPath}`
            );
          }
        } catch (logoError) {
          logger.warn(
            `[BrandingProcessor] Error loading logo: ${logoError instanceof Error ? logoError.message : String(logoError)}`
          );
          // Continue without logo on error
        }
      }

      // Step 3: Output as JPG with 95% quality
      const resultBuffer = await pipeline
        .jpeg({ quality: this.OUTPUT_QUALITY })
        .toBuffer();

      const result: BrandingResult = {
        imageBuffer: resultBuffer,
        appliedBranding: {
          colors: colorsApplied,
          logo: logoApplied,
          quality: this.OUTPUT_QUALITY,
        },
      };

      logger.info(
        `[BrandingProcessor] Branding applied: colors=${result.appliedBranding.colors}, logo=${result.appliedBranding.logo}`
      );
      return result;
    } catch (error) {
      logger.error(
        `[BrandingProcessor] Error applying branding: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new Error(
        `Failed to apply branding: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Calculate logo position based on corner preference
   */
  private getLogoPosition(
    position: string,
    imageWidth: number,
    imageHeight: number,
    logoSize: number = 160
  ): { top: number; left: number } {
    const padding = 20;

    switch (position) {
      case 'top-left':
        return { top: padding, left: padding };
      case 'top-right':
        return { top: padding, left: imageWidth - logoSize - padding };
      case 'bottom-left':
        return { top: imageHeight - logoSize - padding, left: padding };
      case 'bottom-right':
        return {
          top: imageHeight - logoSize - padding,
          left: imageWidth - logoSize - padding,
        };
      default:
        return { top: padding, left: imageWidth - logoSize - padding };
    }
  }

  /**
   * Validate branding configuration
   */
  validateBrandingConfig(config: BrandingConfig): boolean {
    if (config.primaryColor && !this.isValidHexColor(config.primaryColor)) {
      logger.warn(
        `[BrandingProcessor] Invalid primary color: ${config.primaryColor}`
      );
      return false;
    }

    if (config.secondaryColor && !this.isValidHexColor(config.secondaryColor)) {
      logger.warn(
        `[BrandingProcessor] Invalid secondary color: ${config.secondaryColor}`
      );
      return false;
    }

    if (config.colorOverlayOpacity !== undefined) {
      if (config.colorOverlayOpacity < 20 || config.colorOverlayOpacity > 40) {
        logger.warn(
          `[BrandingProcessor] Color opacity should be 20-40, got ${config.colorOverlayOpacity}`
        );
        return false;
      }
    }

    if (config.logoOpacity !== undefined) {
      if (config.logoOpacity < 0 || config.logoOpacity > 100) {
        logger.warn(
          `[BrandingProcessor] Logo opacity should be 0-100, got ${config.logoOpacity}`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Utility: Validate hex color
   */
  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}
