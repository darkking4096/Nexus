import { logger } from '../utils/logger';

/**
 * WCAG AA Contrast Validation
 * Ensures text contrast meets minimum 4.5:1 ratio for accessibility
 */

export interface ContrastCheckResult {
  passed: boolean;
  ratio: number;
  minRequired: number;
  foreground: string;
  background: string;
}

/**
 * ContrastValidator: Validates color contrast against WCAG AA standards
 * Reference: https://www.w3.org/WAI/test-evaluate/contrast-checker/
 */
export class ContrastValidator {
  private static readonly WCAG_AA_RATIO = 4.5; // 4.5:1 for normal text
  private static readonly WCAG_AAA_RATIO = 7; // 7:1 for enhanced

  /**
   * Parse hex color to RGB
   * @param hex Color in format #RRGGBB or #RGB
   * @returns {r, g, b} in 0-255 range
   */
  static parseHex(hex: string): { r: number; g: number; b: number } {
    let color = hex.replace('#', '');

    // Handle shorthand hex (#RGB -> #RRGGBB)
    if (color.length === 3) {
      color = color
        .split('')
        .map((c) => c + c)
        .join('');
    }

    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);

    return { r, g, b };
  }

  /**
   * Calculate relative luminance (WCAG formula)
   * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
   */
  static calculateLuminance(r: number, g: number, b: number): number {
    // Normalize to 0-1
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   * Result is always >= 1.0
   */
  static calculateContrast(
    foreground: string,
    background: string
  ): number {
    const fg = this.parseHex(foreground);
    const bg = this.parseHex(background);

    const L1 = this.calculateLuminance(fg.r, fg.g, fg.b);
    const L2 = this.calculateLuminance(bg.r, bg.g, bg.b);

    const lighter = Math.max(L1, L2);
    const darker = Math.min(L1, L2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Validate contrast meets WCAG AA standard (4.5:1)
   */
  static validateWCAG_AA(
    foreground: string,
    background: string
  ): ContrastCheckResult {
    const ratio = this.calculateContrast(foreground, background);

    return {
      passed: ratio >= this.WCAG_AA_RATIO,
      ratio: Math.round(ratio * 100) / 100,
      minRequired: this.WCAG_AA_RATIO,
      foreground,
      background,
    };
  }

  /**
   * Validate contrast meets WCAG AAA standard (7:1)
   */
  static validateWCAG_AAA(
    foreground: string,
    background: string
  ): ContrastCheckResult {
    const ratio = this.calculateContrast(foreground, background);

    return {
      passed: ratio >= this.WCAG_AAA_RATIO,
      ratio: Math.round(ratio * 100) / 100,
      minRequired: this.WCAG_AAA_RATIO,
      foreground,
      background,
    };
  }

  /**
   * Get best contrasting text color (white or black) for given background
   */
  static getContrastingTextColor(backgroundColor: string): string {
    const bg = this.parseHex(backgroundColor);
    const luminance = this.calculateLuminance(bg.r, bg.g, bg.b);

    // If background is dark, use white text; if light, use black
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }

  /**
   * Add semi-transparent overlay to ensure contrast
   * Returns modified background color or same if already passing
   */
  static ensureContrast(
    textColor: string,
    backgroundColor: string,
    overlayColor: 'white' | 'black' = 'black',
    startOpacity: number = 0.3
  ): { backgroundColor: string; opacity: number; required: boolean } {
    let result = this.validateWCAG_AA(textColor, backgroundColor);

    if (result.passed) {
      return { backgroundColor, opacity: 0, required: false };
    }

    // Try increasing overlay opacity until contrast passes
    for (let opacity = startOpacity; opacity <= 1.0; opacity += 0.1) {
      const overlayRGB = overlayColor === 'white'
        ? this.blendWithOpacity(backgroundColor, '#FFFFFF', opacity)
        : this.blendWithOpacity(backgroundColor, '#000000', opacity);

      result = this.validateWCAG_AA(textColor, overlayRGB);
      if (result.passed) {
        return { backgroundColor: overlayRGB, opacity, required: true };
      }
    }

    // Fallback: use full opacity
    return {
      backgroundColor: overlayColor === 'white' ? '#FFFFFF' : '#000000',
      opacity: 1.0,
      required: true,
    };
  }

  /**
   * Blend two colors with opacity
   * Result color = overlayColor with opacity over baseColor
   */
  private static blendWithOpacity(
    baseColor: string,
    overlayColor: string,
    opacity: number
  ): string {
    const base = this.parseHex(baseColor);
    const overlay = this.parseHex(overlayColor);

    const r = Math.round(overlay.r * opacity + base.r * (1 - opacity));
    const g = Math.round(overlay.g * opacity + base.g * (1 - opacity));
    const b = Math.round(overlay.b * opacity + base.b * (1 - opacity));

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
  }

  /**
   * Log contrast check result for debugging
   */
  static logResult(result: ContrastCheckResult, context: string = ''): void {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    logger.info(
      `[ContrastValidator${context}] ${status}: ratio=${result.ratio}:1 (min ${result.minRequired}:1) | FG=${result.foreground} BG=${result.background}`
    );
  }
}

export default ContrastValidator;
