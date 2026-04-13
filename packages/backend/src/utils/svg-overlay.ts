import sharp from 'sharp';
import { logger } from './logger';

/**
 * SVG Overlay Utilities
 * Creates and applies SVG text overlays to images using Sharp
 */

export interface TextOverlayOptions {
  text: string;
  fontSize?: number;
  fontColor?: string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  fontWeight?: 'normal' | 'bold';
  textAnchor?: 'start' | 'middle' | 'end';
  x?: number;
  y?: number;
  maxWidth?: number;
  lineHeight?: number;
  padding?: number;
}

export interface SVGOverlayPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Creates SVG with text overlay
 * Wordwrap and positioning handled by SVG text-anchor and line breaks
 */
export function generateTextSVG(
  imageWidth: number,
  imageHeight: number,
  options: TextOverlayOptions
): string {
  const {
    text,
    fontSize = 24,
    fontColor = '#FFFFFF',
    backgroundColor,
    backgroundOpacity = 0.5,
    fontWeight = 'normal',
    textAnchor = 'middle',
    x = imageWidth / 2,
    y = imageHeight / 2,
    maxWidth = imageWidth * 0.8,
    lineHeight = 1.5,
    padding = 10,
  } = options;

  // Break text into lines if needed
  const lines = text.split('\n');
  const lineHeightPx = fontSize * lineHeight;

  // Calculate background dimensions
  const bgHeight = lineHeightPx * lines.length + padding * 2;
  const bgY = y - bgHeight / 2;

  let svg = `<svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">`;

  // Add background rectangle if specified
  if (backgroundColor) {
    svg += `<rect
      x="${Math.max(0, x - maxWidth / 2 - padding)}"
      y="${Math.max(0, bgY)}"
      width="${Math.min(imageWidth, maxWidth + padding * 2)}"
      height="${bgHeight}"
      fill="${backgroundColor}"
      opacity="${backgroundOpacity}"
      rx="4"
    />`;
  }

  // Add text lines
  lines.forEach((line, index) => {
    const lineY = y + index * lineHeightPx - (lines.length - 1) * lineHeightPx / 2;

    svg += `<text
      x="${x}"
      y="${lineY}"
      text-anchor="${textAnchor}"
      font-size="${fontSize}"
      font-weight="${fontWeight}"
      fill="${fontColor}"
      font-family="Arial, sans-serif"
      dominant-baseline="middle"
    >${escapeXML(line)}</text>`;
  });

  svg += '</svg>';
  return svg;
}

/**
 * Escape special XML characters
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
 * Apply text overlay to image using Sharp
 * Returns buffer of composited image
 */
export async function applyTextOverlay(
  imageBuffer: Buffer,
  options: TextOverlayOptions,
  imageWidth: number = 1080,
  imageHeight: number = 1350
): Promise<Buffer> {
  try {
    const svg = generateTextSVG(imageWidth, imageHeight, options);
    const svgBuffer = Buffer.from(svg);

    logger.debug(`[svg-overlay] Applying text overlay: "${options.text.substring(0, 50)}..."`);

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
    logger.error(`[svg-overlay] Error applying text overlay: ${error}`);
    throw error;
  }
}

/**
 * Apply multiple text overlays (captions, numbers, etc.)
 */
export async function applyMultipleOverlays(
  imageBuffer: Buffer,
  overlays: TextOverlayOptions[],
  imageWidth: number = 1080,
  imageHeight: number = 1350
): Promise<Buffer> {
  let result = imageBuffer;

  for (const overlay of overlays) {
    result = await applyTextOverlay(result, overlay, imageWidth, imageHeight);
  }

  return result;
}

/**
 * Calculate text dimensions for positioning
 * Approximate calculation based on font size and character count
 */
export function estimateTextDimensions(
  text: string,
  fontSize: number,
  fontWeight: 'normal' | 'bold' = 'normal'
): { width: number; height: number } {
  const charWidth = fontSize * (fontWeight === 'bold' ? 0.6 : 0.55);
  const lines = text.split('\n');
  const maxLineLength = Math.max(...lines.map((l) => l.length));

  return {
    width: maxLineLength * charWidth,
    height: lines.length * fontSize * 1.5,
  };
}

/**
 * Generate slide number overlay (e.g., "1/5")
 */
export function generateSlideNumberOverlay(
  currentSlide: number,
  totalSlides: number,
  position: 'top-right' | 'bottom-right' | 'bottom-left' = 'bottom-right',
  fontSize: number = 16,
  brandColor: string = '#FFFFFF'
): TextOverlayOptions {
  const text = `${currentSlide}/${totalSlides}`;
  const padding = 20;

  let x: number;
  let y: number;

  switch (position) {
    case 'top-right':
      x = 1080 - padding - 30;
      y = padding + 20;
      break;
    case 'bottom-left':
      x = padding + 30;
      y = 1350 - padding - 20;
      break;
    case 'bottom-right':
    default:
      x = 1080 - padding - 30;
      y = 1350 - padding - 20;
  }

  return {
    text,
    fontSize,
    fontColor: brandColor,
    backgroundColor: '#000000',
    backgroundOpacity: 0.4,
    fontWeight: 'bold',
    textAnchor: 'middle',
    x,
    y,
    padding: 8,
  };
}

export default {
  generateTextSVG,
  applyTextOverlay,
  applyMultipleOverlays,
  estimateTextDimensions,
  generateSlideNumberOverlay,
};
