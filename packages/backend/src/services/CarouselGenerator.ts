import sharp from 'sharp';
import { logger } from '../utils/logger';
import ContrastValidator from './ContrastValidator';
import {
  applyTextOverlay,
  generateSlideNumberOverlay,
  TextOverlayOptions,
} from '../utils/svg-overlay';

/**
 * Carousel Generation Types
 */

export interface CarouselSlide {
  image: Buffer;
  copy?: string;
  brandColor?: string;
}

export interface CarouselGenerationRequest {
  slides: CarouselSlide[];
  brandColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
  showNumbers?: boolean;
  numberPosition?: 'top-right' | 'bottom-right' | 'bottom-left';
  ensureContrast?: boolean;
}

export interface CarouselSlideOutput {
  slideNumber: number;
  imageBuffer: Buffer;
  dimensions: {
    width: number;
    height: number;
  };
  copyApplied: boolean;
  numberApplied: boolean;
  contrastValidated: boolean;
  contrastRatio?: number;
}

export interface CarouselGenerationResponse {
  slides: CarouselSlideOutput[];
  totalSlides: number;
  generatedAt: string;
  metadata: {
    brandColors: Record<string, string>;
    numberingEnabled: boolean;
    contrastValidation: boolean;
  };
}

/**
 * CarouselGenerator: Multi-slide carousel generation with SVG overlay and contrast validation
 * Processes array of images + copy → PNG carousel slides
 */
export class CarouselGenerator {
  private readonly STANDARD_WIDTH = 1080;
  private readonly STANDARD_HEIGHT = 1350;
  private readonly MAX_SLIDES = 10;

  constructor() {
    // DB available for caching in future implementations
  }

  /**
   * Generate carousel from slides array
   */
  async generateCarousel(
    request: CarouselGenerationRequest
  ): Promise<CarouselGenerationResponse> {
    const { slides, brandColors = {}, showNumbers = true, ensureContrast = true } = request;

    // Validation
    if (!slides || slides.length === 0) {
      throw new Error('At least 1 slide is required');
    }
    if (slides.length > this.MAX_SLIDES) {
      throw new Error(`Maximum ${this.MAX_SLIDES} slides allowed`);
    }

    logger.info(
      `[CarouselGenerator] Generating carousel: ${slides.length} slides, numbering=${showNumbers}`
    );

    const processedSlides: CarouselSlideOutput[] = [];
    const defaultBrandColor = brandColors.primary || '#FFFFFF';

    for (let i = 0; i < slides.length; i++) {
      const slideNumber = i + 1;
      const slide = slides[i];

      try {
        let buffer = slide.image;

        // Validate image dimensions
        const metadata = await sharp(buffer).metadata();
        if (!metadata.width || !metadata.height) {
          throw new Error(`Invalid image dimensions for slide ${slideNumber}`);
        }

        // Resize to standard carousel dimensions if needed
        if (
          metadata.width !== this.STANDARD_WIDTH ||
          metadata.height !== this.STANDARD_HEIGHT
        ) {
          logger.warn(
            `[CarouselGenerator] Slide ${slideNumber} resizing from ${metadata.width}x${metadata.height} to ${this.STANDARD_WIDTH}x${this.STANDARD_HEIGHT}`
          );
          buffer = await sharp(buffer)
            .resize(this.STANDARD_WIDTH, this.STANDARD_HEIGHT, {
              fit: 'cover',
              position: 'center',
            })
            .png()
            .toBuffer();
        }

        // Apply copy overlay if provided
        let copyApplied = false;
        let contrastRatio: number | undefined;

        if (slide.copy) {
          const overlayOptions = this.buildTextOverlay(
            slide.copy,
            slide.brandColor || defaultBrandColor,
            ensureContrast
          );

          const contrasts = this.validateTextContrast(
            overlayOptions.fontColor || '#FFFFFF',
            overlayOptions.backgroundColor || '#000000'
          );

          if (!contrasts.passed) {
            logger.warn(
              `[CarouselGenerator] Slide ${slideNumber} contrast failed: ${contrasts.ratio}:1 < 4.5:1`
            );
            if (ensureContrast) {
              // Auto-fix: add semi-transparent background
              const fixed = ContrastValidator.ensureContrast(
                overlayOptions.fontColor || '#FFFFFF',
                overlayOptions.backgroundColor || '#000000'
              );
              overlayOptions.backgroundColor = fixed.backgroundColor;
              overlayOptions.backgroundOpacity = fixed.opacity;
            }
          }

          contrastRatio = contrasts.ratio;
          buffer = await applyTextOverlay(
            buffer,
            overlayOptions,
            this.STANDARD_WIDTH,
            this.STANDARD_HEIGHT
          );
          copyApplied = true;
        }

        // Apply slide numbering if enabled
        let numberApplied = false;
        if (showNumbers) {
          const numberOverlay = generateSlideNumberOverlay(
            slideNumber,
            slides.length,
            request.numberPosition || 'bottom-right',
            16,
            defaultBrandColor
          );

          buffer = await applyTextOverlay(
            buffer,
            numberOverlay,
            this.STANDARD_WIDTH,
            this.STANDARD_HEIGHT
          );
          numberApplied = true;
        }

        processedSlides.push({
          slideNumber,
          imageBuffer: buffer,
          dimensions: {
            width: this.STANDARD_WIDTH,
            height: this.STANDARD_HEIGHT,
          },
          copyApplied,
          numberApplied,
          contrastValidated: ensureContrast,
          contrastRatio,
        });

        logger.debug(`[CarouselGenerator] Slide ${slideNumber} processed successfully`);
      } catch (error) {
        logger.error(`[CarouselGenerator] Error processing slide ${slideNumber}: ${error}`);
        throw error;
      }
    }

    return {
      slides: processedSlides,
      totalSlides: slides.length,
      generatedAt: new Date().toISOString(),
      metadata: {
        brandColors,
        numberingEnabled: showNumbers,
        contrastValidation: ensureContrast,
      },
    };
  }

  /**
   * Build text overlay options from copy and brand color
   */
  private buildTextOverlay(
    copy: string,
    brandColor: string,
    ensureContrast: boolean
  ): TextOverlayOptions {
    // Determine background and text colors based on brand color
    const contrastingColor = ContrastValidator.getContrastingTextColor(brandColor);
    const backgroundColor = brandColor;

    return {
      text: copy,
      fontSize: 24,
      fontColor: contrastingColor,
      backgroundColor,
      backgroundOpacity: ensureContrast ? 0.7 : 0.5,
      fontWeight: 'normal',
      textAnchor: 'middle',
      x: this.STANDARD_WIDTH / 2,
      y: this.STANDARD_HEIGHT / 2,
      maxWidth: this.STANDARD_WIDTH * 0.75,
      lineHeight: 1.5,
      padding: 15,
    };
  }

  /**
   * Validate text contrast (WCAG AA)
   */
  private validateTextContrast(foreground: string, background: string) {
    return ContrastValidator.validateWCAG_AA(foreground, background);
  }

  /**
   * Health check: verify Sharp is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const testBuffer = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .png()
        .toBuffer();

      return testBuffer.length > 0;
    } catch (error) {
      logger.error(`[CarouselGenerator] Health check failed: ${error}`);
      return false;
    }
  }
}

export default CarouselGenerator;
