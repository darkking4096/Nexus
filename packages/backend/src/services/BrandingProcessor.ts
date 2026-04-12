import { logger } from '../utils/logger';

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
 * Enhances base images with brand identity
 */
export class BrandingProcessor {
  /**
   * Apply branding to image buffer
   * Note: Sharp integration will be implemented when sharp is added to dependencies
   */
  async applyBranding(
    imageBuffer: Buffer,
    config: BrandingConfig
  ): Promise<BrandingResult> {
    logger.info(
      `[BrandingProcessor] Applying branding: colors=${!!config.primaryColor}, logo=${!!config.logoPath}`
    );

    try {
      // Placeholder for Sharp integration
      // TODO(human): Implement Sharp pipeline:
      // 1. Load image from buffer
      // 2. Apply color overlay (opacity: 20-40%)
      // 3. Composite logo (top-right corner, opacity: logoOpacity)
      // 4. Output JPG with 95% quality

      const result: BrandingResult = {
        imageBuffer, // For now, return original buffer
        appliedBranding: {
          colors: !!config.primaryColor,
          logo: !!config.logoPath,
          quality: 95,
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

    return true;
  }

  /**
   * Utility: Validate hex color
   */
  private isValidHexColor(color: string): boolean {
    return /^#[0-9A-F]{6}$/i.test(color);
  }
}
