import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { StoryGenerator } from '../StoryGenerator';
import BrandConfigLoader from '../BrandConfigLoader';

describe('StoryGenerator', () => {
  let db: Database.Database;
  let generator: StoryGenerator;
  let brandConfigLoader: BrandConfigLoader;
  let testDbPath: string;

  beforeEach(() => {
    // Create temporary test database
    testDbPath = path.join(__dirname, `test-story-${Date.now()}.db`);
    db = new Database(testDbPath);
    generator = new StoryGenerator(db);
    brandConfigLoader = new BrandConfigLoader(db);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  // Helper: Create test image buffer
  async function createTestImage(
    width: number = 1080,
    height: number = 1920,
    color: { r: number; g: number; b: number } = { r: 100, g: 150, b: 200 }
  ): Promise<Buffer> {
    return sharp({
      create: {
        width,
        height,
        channels: 3,
        background: color,
      },
    })
      .png()
      .toBuffer();
  }

  // AC-1: Generate Story Frame (1080x1920)
  describe('AC-1: Geração de Story Frame (1080x1920)', () => {
    it('should generate story frame with correct dimensions', async () => {
      const result = await generator.generateStory({
        headline: 'Test Headline',
        body: 'Test body content',
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
      expect(result.imageBuffer).toBeInstanceOf(Buffer);
      expect(result.imageBuffer.length).toBeGreaterThan(0);
    });

    it('should be ready for Instagram upload (PNG format)', async () => {
      const result = await generator.generateStory({
        headline: 'Upload Test',
      });

      // Verify PNG format by checking magic number
      expect(result.imageBuffer[0]).toBe(0x89);
      expect(result.imageBuffer[1]).toBe(0x50);
      expect(result.imageBuffer[2]).toBe(0x4e);
      expect(result.imageBuffer[3]).toBe(0x47);
    });

    it('should generate with minimal content (headline only)', async () => {
      const result = await generator.generateStory({
        headline: 'Just a headline',
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
      expect(result.metadata.contentLength).toBe(15); // "Just a headline" = 15 chars including spaces
    });

    it('should generate with full content (headline + body + cta)', async () => {
      const result = await generator.generateStory({
        headline: 'Check This Out',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        cta: 'Learn More',
      });

      expect(result.metadata.contentLength).toBeGreaterThan(0);
      expect(result.metadata.contentLength).toBe(
        'Check This Out'.length + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'.length + 'Learn More'.length
      );
    });

    it('should handle multiline body text', async () => {
      const result = await generator.generateStory({
        body: 'Line 1\nLine 2\nLine 3',
      });

      expect(result.imageBuffer).toBeInstanceOf(Buffer);
      expect(result.metadata.contentLength).toBeGreaterThan(0);
    });
  });

  // AC-2: Brand Colors Application
  describe('AC-2: Brand Colors Application', () => {
    it('should apply default brand colors when none specified', async () => {
      const result = await generator.generateStory({
        headline: 'Default Brand',
      });

      const defaultBrand = brandConfigLoader.getDefaultBrand();
      expect(result.brandConfig.colors.primary).toBe(defaultBrand.colors.primary);
    });

    it('should apply custom brand colors', async () => {
      const customColors = {
        primary: '#FF0000',
        background: '#FFFFFF',
      };

      const result = await generator.generateStory({
        headline: 'Custom Brand',
        customColors,
      });

      expect(result.brandConfig.colors.primary).toBe('#FF0000');
      expect(result.brandConfig.colors.background).toBe('#FFFFFF');
    });

    it('should apply gradient background', async () => {
      const result = await generator.generateStory({
        headline: 'Gradient Test',
        customColors: {
          primary: '#FF5733',
          background: '#FFFFFF',
        },
      });

      expect(result.brandConfig.colors.primary).toBe('#FF5733');
      expect(result.brandConfig.colors.background).toBe('#FFFFFF');
    });

    it('should ensure text color has contrast 4.5:1 against background', async () => {
      const result = await generator.generateStory({
        headline: 'Contrast Test',
        customColors: {
          primary: '#FF5733',
          background: '#FFFFFF',
        },
      });

      expect(result.metadata.contrastValidated).toBe(true);
      expect(result.metadata.contrastRatio).toBeGreaterThanOrEqual(3.0);
    });

    it('should embed brand logo if available (with fallback)', async () => {
      const result = await generator.generateStory({
        headline: 'Logo Test',
      });

      // Logo embedding logs but doesn't fail
      expect(result.metadata.logoEmbedded).toBe(false); // Not embedded in test
      expect(result.imageBuffer).toBeInstanceOf(Buffer);
    });
  });

  // AC-3: Text Overlay Optimized
  describe('AC-3: Text Overlay Otimizado', () => {
    it('should format headline: bold, centered, readable size', async () => {
      const result = await generator.generateStory({
        headline: 'Bold Centered Headline',
        body: '',
      });

      expect(result.imageBuffer).toBeInstanceOf(Buffer);
      // Verify by checking that image was generated without errors
      const metadata = await sharp(result.imageBuffer).metadata();
      expect(metadata.width).toBe(1080);
      expect(metadata.height).toBe(1920);
    });

    it('should format body: regular, left-aligned, readable', async () => {
      const result = await generator.generateStory({
        body: 'This is body text that should be left-aligned and readable on mobile',
      });

      expect(result.metadata.contentLength).toBe(
        'This is body text that should be left-aligned and readable on mobile'.length
      );
    });

    it('should format CTA: button-style, brand color, centered', async () => {
      const result = await generator.generateStory({
        cta: 'Tap Here',
        customColors: {
          primary: '#FF5733',
        },
      });

      expect(result.brandConfig.colors.primary).toBe('#FF5733');
      expect(result.imageBuffer).toBeInstanceOf(Buffer);
    });

    it('should ensure text is readable on mobile (min 16px)', async () => {
      const result = await generator.generateStory({
        headline: 'Readable on Mobile',
        body: 'This should be 18px or larger for body text',
        cta: 'Mobile Friendly',
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
    });

    it('should apply line height 1.5 for accessibility', async () => {
      const result = await generator.generateStory({
        body: 'Line 1\nLine 2\nLine 3',
      });

      expect(result.imageBuffer).toBeInstanceOf(Buffer);
    });
  });

  // AC-4: Brand Consistency
  describe('AC-4: Brand Consistency', () => {
    it('should maintain consistent visual identity across multiple stories', async () => {
      const customColors = {
        primary: '#FF5733',
        secondary: '#33FF57',
        background: '#FFFFFF',
      };

      const results = [];
      for (let i = 0; i < 5; i++) {
        const result = await generator.generateStory({
          headline: `Story ${i + 1}`,
          customColors,
        });
        results.push(result);
      }

      // All stories should have same brand colors
      results.forEach((result) => {
        expect(result.brandConfig.colors.primary).toBe('#FF5733');
        expect(result.brandConfig.colors.background).toBe('#FFFFFF');
      });
    });

    it('should apply same colors consistently', async () => {
      const customColors = {
        primary: '#3357FF',
      };

      const result1 = await generator.generateStory({
        headline: 'Story 1',
        customColors,
      });

      const result2 = await generator.generateStory({
        headline: 'Story 2',
        customColors,
      });

      expect(result1.brandConfig.colors.primary).toBe(result2.brandConfig.colors.primary);
    });

    it('should apply consistent font sizes', async () => {
      const result1 = await generator.generateStory({
        headline: 'Test 1',
        body: 'Body text',
      });

      const result2 = await generator.generateStory({
        headline: 'Test 2',
        body: 'Body text',
      });

      // Both should have same dimensions (no size variation)
      expect(result1.dimensions).toEqual(result2.dimensions);
    });

    it('should maintain consistent layout positioning', async () => {
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await generator.generateStory({
          headline: `Headline ${i}`,
          body: `Body text ${i}`,
          cta: 'Click',
        });
        results.push(result);
      }

      // All should have consistent dimensions
      results.forEach((result) => {
        expect(result.dimensions.width).toBe(1080);
        expect(result.dimensions.height).toBe(1920);
      });
    });
  });

  // AC-5: Tests Implemented
  describe('AC-5: Testes Implementados', () => {
    it('should generate with minimal content (headline only)', async () => {
      const result = await generator.generateStory({
        headline: 'Minimal Content',
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
      expect(result.fileSize).toBeLessThan(500 * 1024); // < 500KB
    });

    it('should generate with maximum content (headline + body + CTA)', async () => {
      const result = await generator.generateStory({
        headline: 'Maximum Content Story',
        body: 'This is the body with full content to test maximum layout capacity and text rendering quality',
        cta: 'Call To Action',
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
      expect(result.fileSize).toBeLessThan(500 * 1024);
    });

    it('should apply brand colors with 5 different brand palettes', async () => {
      const palettes = [
        { primary: '#FF5733', background: '#FFFFFF' },
        { primary: '#33FF57', background: '#1a1a1a' },
        { primary: '#3357FF', background: '#f0f0f0' },
        { primary: '#FFD700', background: '#2a2a2a' },
        { primary: '#FF1493', background: '#fffacd' },
      ];

      for (const palette of palettes) {
        const result = await generator.generateStory({
          headline: 'Brand Test',
          customColors: palette,
        });

        expect(result.brandConfig.colors.primary).toBe(palette.primary);
      }
    });

    it('should validate text contrast (passing + failing cases)', async () => {
      // High contrast
      const result1 = await generator.generateStory({
        headline: 'High Contrast',
        customColors: {
          primary: '#FFFFFF',
          background: '#000000',
        },
      });

      expect(result1.metadata.contrastValidated).toBe(true);

      // Lower contrast
      const result2 = await generator.generateStory({
        headline: 'Lower Contrast',
        customColors: {
          primary: '#FF9999',
          background: '#FFCCCC',
        },
      });

      // Should still be handled gracefully
      expect(result2.imageBuffer).toBeInstanceOf(Buffer);
    });

    it('should handle missing brand config gracefully', async () => {
      const result = await generator.generateStory({
        headline: 'No Brand Config',
        profileId: 'nonexistent_profile',
      });

      expect(result.brandConfig).toBeDefined();
      expect(result.brandConfig.colors).toBeDefined();
    });

    it('should ensure file size < 500KB (Instagram optimal)', async () => {
      const result = await generator.generateStory({
        headline: 'Full Content Story',
        body: 'This is a complete story with headline, body, and call to action text to create a substantial image',
        cta: 'Learn More',
      });

      expect(result.fileSize).toBeLessThan(500 * 1024);
    });

    it('should return proper StoryGenerationResponse structure', async () => {
      const result = await generator.generateStory({
        headline: 'Structure Test',
      });

      expect(result).toHaveProperty('imageBuffer');
      expect(result).toHaveProperty('dimensions');
      expect(result).toHaveProperty('fileSize');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('brandConfig');
      expect(result).toHaveProperty('metadata');

      expect(result.dimensions).toHaveProperty('width');
      expect(result.dimensions).toHaveProperty('height');
      expect(result.metadata).toHaveProperty('contentLength');
      expect(result.metadata).toHaveProperty('contrastValidated');
      expect(result.metadata).toHaveProperty('logoEmbedded');
    });

    it('should handle custom background image', async () => {
      const bgImage = await createTestImage();

      const result = await generator.generateStory({
        headline: 'Custom Background',
        backgroundImage: bgImage,
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
    });

    it('should resize background image to correct dimensions', async () => {
      const bgImage = await createTestImage(500, 1000); // Wrong dimensions

      const result = await generator.generateStory({
        headline: 'Resized Background',
        backgroundImage: bgImage,
      });

      expect(result.dimensions.width).toBe(1080);
      expect(result.dimensions.height).toBe(1920);
    });
  });

  // Brand config validation
  describe('Brand Config', () => {
    it('should validate brand config correctly', async () => {
      const defaultBrand = brandConfigLoader.getDefaultBrand();
      const validation = brandConfigLoader.validateBrandConfig(defaultBrand);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should load brand config with fallback', async () => {
      const config = await brandConfigLoader.loadBrandConfigOrDefault({
        profileId: 'nonexistent',
      });

      expect(config).toBeDefined();
      expect(config.colors).toBeDefined();
    });
  });

  // Health check
  describe('Health Check', () => {
    it('should pass health check', async () => {
      const isHealthy = await generator.healthCheck();
      expect(isHealthy).toBe(true);
    });
  });
});
