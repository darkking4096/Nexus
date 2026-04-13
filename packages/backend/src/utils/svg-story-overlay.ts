import sharp from 'sharp';
import { logger } from './logger';

/**
 * Story-specific overlay utilities
 * Optimized for 1080x1920 vertical format (Instagram Stories)
 */

export interface StoryTextOverlayOptions {
  headline?: string;
  body?: string;
  cta?: string;
  primaryColor: string;
  textColor: string;
  headlineFontSize?: number;
  bodyFontSize?: number;
  ctaFontSize?: number;
}

/**
 * Generate story frame SVG with text overlay
 * Layout: headline top-center, body middle, CTA bottom-center
 */
export function generateStorySVG(
  imageWidth: number,
  imageHeight: number,
  options: StoryTextOverlayOptions
): string {
  const {
    headline,
    body,
    cta,
    primaryColor,
    textColor,
    headlineFontSize = 32,
    bodyFontSize = 18,
    ctaFontSize = 16,
  } = options;

  const padding = 20;
  const maxWidth = imageWidth - padding * 2;

  let svg = `<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Headline (top, ~25% of height)
  if (headline) {
    const headlineY = imageHeight * 0.2;
    svg += `<text
      x="${imageWidth / 2}"
      y="${headlineY}"
      text-anchor="middle"
      font-size="${headlineFontSize}"
      font-weight="bold"
      fill="${textColor}"
      font-family="Arial, sans-serif"
      dominant-baseline="middle"
      max-width="${maxWidth}"
    >${escapeXML(headline)}</text>`;
  }

  // Body (middle, ~50% of height)
  if (body) {
    const bodyY = imageHeight * 0.5;
    const lines = body.split('\n');

    // Background for readability
    svg += `<rect
      x="${padding}"
      y="${bodyY - lines.length * bodyFontSize * 0.75 - 10}"
      width="${maxWidth}"
      height="${lines.length * bodyFontSize * 1.5 + 20}"
      fill="${primaryColor}"
      opacity="0.7"
      rx="8"
    />`;

    // Text lines
    lines.forEach((line, index) => {
      const lineY = bodyY + (index - (lines.length - 1) / 2) * bodyFontSize * 1.5;

      svg += `<text
        x="${imageWidth / 2}"
        y="${lineY}"
        text-anchor="middle"
        font-size="${bodyFontSize}"
        fill="${textColor}"
        font-family="Arial, sans-serif"
        dominant-baseline="middle"
      >${escapeXML(line)}</text>`;
    });
  }

  // CTA Button (bottom, ~80% of height)
  if (cta) {
    const ctaY = imageHeight * 0.85;
    const ctaWidth = Math.min(maxWidth * 0.6, 200);
    const ctaHeight = ctaFontSize + 16;

    // Button background
    svg += `<rect
      x="${imageWidth / 2 - ctaWidth / 2}"
      y="${ctaY - ctaHeight / 2}"
      width="${ctaWidth}"
      height="${ctaHeight}"
      fill="${primaryColor}"
      rx="8"
      stroke="${textColor}"
      stroke-width="2"
    />`;

    // Button text
    svg += `<text
      x="${imageWidth / 2}"
      y="${ctaY}"
      text-anchor="middle"
      font-size="${ctaFontSize}"
      font-weight="bold"
      fill="${textColor}"
      font-family="Arial, sans-serif"
      dominant-baseline="middle"
    >${escapeXML(cta)}</text>`;
  }

  svg += '</svg>';
  return svg;
}

/**
 * Apply story text overlay to image
 */
export async function applyStoryOverlay(
  imageBuffer: Buffer,
  options: StoryTextOverlayOptions,
  imageWidth: number = 1080,
  imageHeight: number = 1920
): Promise<Buffer> {
  try {
    const svg = generateStorySVG(imageWidth, imageHeight, options);
    const svgBuffer = Buffer.from(svg);

    logger.debug(`[svg-story-overlay] Applying story overlay: headline="${options.headline?.substring(0, 30)}..."`);

    const result = await sharp(imageBuffer)
      .composite([
        {
          input: svgBuffer,
          top: 0,
          left: 0,
        },
      ])
      .png()
      .toBuffer();

    return result;
  } catch (error) {
    logger.error(`[svg-story-overlay] Error applying overlay: ${error}`);
    throw error;
  }
}

/**
 * Generate story background (solid or gradient)
 */
export async function generateStoryBackground(
  width: number,
  height: number,
  backgroundColor: string,
  gradientColor?: string
): Promise<Buffer> {
  try {
    if (gradientColor && gradientColor !== backgroundColor) {
      // Create gradient background using SVG
      const gradientSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:${backgroundColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${gradientColor};stop-opacity:1" />
            </linearGradient>
          </defs>
          <rect width="${width}" height="${height}" fill="url(#grad)" />
        </svg>
      `;

      const sharpInput: Buffer = Buffer.from(gradientSvg);
      return sharp(sharpInput).png().toBuffer();
    } else {
      // Solid color background
      return sharp({
        create: {
          width,
          height,
          channels: 3,
          background: hexToRgb(backgroundColor),
        },
      })
        .png()
        .toBuffer();
    }
  } catch (error) {
    logger.error(`[svg-story-overlay] Error generating background: ${error}`);
    // Fallback to solid color
    return sharp({
      create: {
        width,
        height,
        channels: 3,
        background: hexToRgb(backgroundColor),
      },
    })
      .png()
      .toBuffer();
  }
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  };
  return text.replace(/[&<>"']/g, (char) => escapeMap[char]);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return { r: 255, g: 255, b: 255 };
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

export default {
  generateStorySVG,
  applyStoryOverlay,
  generateStoryBackground,
};
