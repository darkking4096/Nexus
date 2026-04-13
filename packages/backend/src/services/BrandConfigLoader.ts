import Database from 'better-sqlite3';
import { logger } from '../utils/logger';

/**
 * Brand configuration types
 */

export interface BrandConfig {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text?: string;
  };
  fonts: {
    headline?: string;
    body?: string;
  };
  logo?: {
    url: string;
    width: number;
    height: number;
  };
  watermark?: {
    url: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    opacity: number;
  };
}

export interface BrandConfigRequest {
  brandId?: string;
  profileId?: string;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
  };
}

/**
 * BrandConfigLoader: Load and merge brand configurations
 * Supports per-profile branding + defaults
 */
export class BrandConfigLoader {
  private db: Database.Database;
  private defaultBrand: BrandConfig = {
    id: 'default',
    name: 'Default Instagram Brand',
    colors: {
      primary: '#FF5733',
      secondary: '#33FF57',
      accent: '#3357FF',
      background: '#FFFFFF',
      text: '#000000',
    },
    fonts: {
      headline: 'Arial',
      body: 'Arial',
    },
  };

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * Load brand config by ID
   */
  async loadBrandConfig(brandId: string): Promise<BrandConfig> {
    try {
      // Try to fetch from database
      const stmt = this.db.prepare(`
        SELECT id, name, colors, fonts, logo, watermark
        FROM brands
        WHERE id = ?
      `);

      const result = stmt.get(brandId) as Record<string, unknown> | undefined;

      if (!result) {
        logger.warn(`[BrandConfigLoader] Brand ${brandId} not found, using defaults`);
        return this.defaultBrand;
      }

      return this.parseBrandResult(result);
    } catch (error) {
      logger.warn(`[BrandConfigLoader] Error loading brand ${brandId}: ${error}, using defaults`);
      return this.defaultBrand;
    }
  }

  /**
   * Load brand config for a profile
   */
  async loadProfileBrandConfig(profileId: string): Promise<BrandConfig> {
    try {
      // Try to fetch profile's associated brand
      const stmt = this.db.prepare(`
        SELECT b.id, b.name, b.colors, b.fonts, b.logo, b.watermark
        FROM brands b
        JOIN profiles p ON p.brand_id = b.id
        WHERE p.id = ?
      `);

      const result = stmt.get(profileId) as Record<string, unknown> | undefined;

      if (!result) {
        logger.debug(`[BrandConfigLoader] No brand found for profile ${profileId}, using defaults`);
        return this.defaultBrand;
      }

      return this.parseBrandResult(result);
    } catch (error) {
      logger.warn(
        `[BrandConfigLoader] Error loading profile brand ${profileId}: ${error}, using defaults`
      );
      return this.defaultBrand;
    }
  }

  /**
   * Merge custom colors into brand config
   */
  mergeBrandConfig(
    baseBrand: BrandConfig,
    customColors?: Record<string, string>
  ): BrandConfig {
    if (!customColors) {
      return baseBrand;
    }

    return {
      ...baseBrand,
      colors: {
        ...baseBrand.colors,
        ...Object.fromEntries(
          Object.entries(customColors).filter(([, v]) => v !== undefined)
        ),
      },
    };
  }

  /**
   * Load brand config with fallback to defaults
   */
  async loadBrandConfigOrDefault(request: BrandConfigRequest): Promise<BrandConfig> {
    let config: BrandConfig;

    // 1. Try brand ID first
    if (request.brandId) {
      config = await this.loadBrandConfig(request.brandId);
      if (config.id !== 'default') {
        // Successfully loaded
        return this.mergeBrandConfig(config, request.customColors);
      }
    }

    // 2. Try profile ID
    if (request.profileId) {
      config = await this.loadProfileBrandConfig(request.profileId);
      if (config.id !== 'default') {
        // Successfully loaded
        return this.mergeBrandConfig(config, request.customColors);
      }
    }

    // 3. Use default
    return this.mergeBrandConfig(this.defaultBrand, request.customColors);
  }

  /**
   * Parse database result into BrandConfig
   */
  private parseBrandResult(result: Record<string, unknown>): BrandConfig {
    const colors = typeof result.colors === 'string'
      ? JSON.parse(result.colors)
      : result.colors || {};
    const fonts = typeof result.fonts === 'string'
      ? JSON.parse(result.fonts)
      : result.fonts || {};
    const logo = typeof result.logo === 'string'
      ? JSON.parse(result.logo)
      : result.logo;
    const watermark = typeof result.watermark === 'string'
      ? JSON.parse(result.watermark)
      : result.watermark;

    return {
      id: result.id as string,
      name: result.name as string,
      colors: {
        primary: colors.primary || this.defaultBrand.colors.primary,
        secondary: colors.secondary || this.defaultBrand.colors.secondary,
        accent: colors.accent || this.defaultBrand.colors.accent,
        background: colors.background || this.defaultBrand.colors.background,
        text: colors.text || this.defaultBrand.colors.text,
      },
      fonts,
      logo,
      watermark,
    };
  }

  /**
   * Validate brand config
   */
  validateBrandConfig(config: BrandConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.colors.primary) {
      errors.push('Primary color is required');
    }
    if (!config.colors.background) {
      errors.push('Background color is required');
    }

    // Validate hex colors
    const hexRegex = /^#[0-9A-F]{6}$/i;
    Object.entries(config.colors).forEach(([key, value]) => {
      if (value && !hexRegex.test(value)) {
        errors.push(`Invalid hex color for ${key}: ${value}`);
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default brand config
   */
  getDefaultBrand(): BrandConfig {
    return this.defaultBrand;
  }
}

export default BrandConfigLoader;
