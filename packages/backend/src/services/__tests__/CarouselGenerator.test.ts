import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { CarouselGenerator } from '../CarouselGenerator';
import ContrastValidator from '../ContrastValidator';

describe('CarouselGenerator', () => {
  let db: Database.Database;
  let generator: CarouselGenerator;
  let testDbPath: string;

  beforeEach(() => {
    // Create temporary test database
    testDbPath = path.join(__dirname, `test-carousel-${Date.now()}.db`);
    db = new Database(testDbPath);
    generator = new CarouselGenerator(db);
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
    height: number = 1350,
    color: { r: number; g: number; b: number } = { r: 200, g: 100, b: 50 }
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

  // AC-1: Generate N slides (1080x1350px Instagram carousel standard)
  describe('AC-1: Geração de N Slides', () => {
    it('should generate single slide carousel (1 slide)', async () => {
      const slide1 = await createTestImage();

      const result = await generator.generateCarousel({
        slides: [{ image: slide1 }],
      });

      expect(result.totalSlides).toBe(1);
      expect(result.slides).toHaveLength(1);
      expect(result.slides[0].dimensions.width).toBe(1080);
      expect(result.slides[0].dimensions.height).toBe(1350);
      expect(result.slides[0].imageBuffer).toBeInstanceOf(Buffer);
    });

    it('should generate 3-slide carousel', async () => {
      const slides = [
        await createTestImage(),
        await createTestImage(1080, 1350, { r: 100, g: 200, b: 50 }),
        await createTestImage(1080, 1350, { r: 50, g: 100, b: 200 }),
      ];

      const result = await generator.generateCarousel({
        slides: slides.map((img) => ({ image: img })),
      });

      expect(result.totalSlides).toBe(3);
      expect(result.slides).toHaveLength(3);
      result.slides.forEach((slide, index) => {
        expect(slide.slideNumber).toBe(index + 1);
        expect(slide.dimensions.width).toBe(1080);
        expect(slide.dimensions.height).toBe(1350);
      });
    });

    it('should generate 5-slide carousel', async () => {
      const slides = [];
      for (let i = 0; i < 5; i++) {
        slides.push(
          await createTestImage(1080, 1350, {
            r: (i * 50) % 256,
            g: (i * 100) % 256,
            b: (i * 150) % 256,
          })
        );
      }

      const result = await generator.generateCarousel({
        slides: slides.map((img) => ({ image: img })),
      });

      expect(result.totalSlides).toBe(5);
      expect(result.slides).toHaveLength(5);
    });

    it('should reject empty slides array', async () => {
      await expect(
        generator.generateCarousel({ slides: [] })
      ).rejects.toThrow('At least 1 slide is required');
    });

    it('should reject more than 10 slides', async () => {
      const slides = [];
      for (let i = 0; i < 11; i++) {
        slides.push({ image: await createTestImage() });
      }

      await expect(
        generator.generateCarousel({ slides })
      ).rejects.toThrow('Maximum 10 slides allowed');
    });
  });

  // AC-2: SVG overlay with text
  describe('AC-2: SVG Overlay com Texto', () => {
    it('should apply text overlay to slide', async () => {
      const slide = await createTestImage();
      const copy = 'This is carousel copy';

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy }],
        showNumbers: false,
      });

      expect(result.slides[0].copyApplied).toBe(true);
      expect(result.slides[0].imageBuffer).toBeInstanceOf(Buffer);
      expect(result.slides[0].imageBuffer.length).toBeGreaterThan(0);
    });

    it('should apply text overlay with multiple lines', async () => {
      const slide = await createTestImage();
      const copy = 'Line 1\nLine 2\nLine 3';

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy }],
        showNumbers: false,
      });

      expect(result.slides[0].copyApplied).toBe(true);
    });

    it('should handle empty copy gracefully', async () => {
      const slide = await createTestImage();

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy: '' }],
        showNumbers: false,
      });

      expect(result.slides[0].copyApplied).toBe(false);
    });

    it('should apply text with brand colors', async () => {
      const slide = await createTestImage();
      const copy = 'Branded text';

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy, brandColor: '#FF5733' }],
        brandColors: { primary: '#FF5733' },
        showNumbers: false,
      });

      expect(result.slides[0].copyApplied).toBe(true);
      expect(result.metadata.brandColors.primary).toBe('#FF5733');
    });
  });

  // AC-3: Contrast validation (WCAG AA 4.5:1)
  describe('AC-3: Contraste Garantido (WCAG AA)', () => {
    it('should validate contrast ratio > 4.5:1 for white text on dark background', () => {
      const result = ContrastValidator.validateWCAG_AA('#FFFFFF', '#000000');

      expect(result.passed).toBe(true);
      expect(result.ratio).toBeGreaterThanOrEqual(4.5);
    });

    it('should fail contrast for low-contrast colors', () => {
      const result = ContrastValidator.validateWCAG_AA('#FFFF00', '#FFFF80');

      expect(result.passed).toBe(false);
      expect(result.ratio).toBeLessThan(4.5);
    });

    it('should ensure contrast by adding background overlay', () => {
      const brightText = '#FFFF00';
      const brightBg = '#FFFFFF';

      const fix = ContrastValidator.ensureContrast(brightText, brightBg);

      expect(fix.required).toBe(true);
      expect(fix.opacity).toBeGreaterThan(0);
    });

    it('should apply carousel with automatic contrast correction', async () => {
      const slide = await createTestImage(1080, 1350, { r: 255, g: 255, b: 255 }); // white bg
      const copy = 'Light yellow text';

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy }],
        ensureContrast: true,
        showNumbers: false,
      });

      expect(result.slides[0].contrastValidated).toBe(true);
    });

    it('should return contrast ratio in response', async () => {
      const slide = await createTestImage();
      const copy = 'High contrast text';

      const result = await generator.generateCarousel({
        slides: [{ image: slide, copy }],
        ensureContrast: true,
        showNumbers: false,
      });

      expect(result.slides[0].contrastRatio).toBeDefined();
      expect(typeof result.slides[0].contrastRatio).toBe('number');
    });
  });

  // AC-4: Automatic numbering
  describe('AC-4: Numeração Automática', () => {
    it('should add slide numbers when enabled', async () => {
      const slides = [
        { image: await createTestImage() },
        { image: await createTestImage(1080, 1350, { r: 100, g: 200, b: 50 }) },
        { image: await createTestImage(1080, 1350, { r: 50, g: 100, b: 200 }) },
      ];

      const result = await generator.generateCarousel({
        slides,
        showNumbers: true,
      });

      expect(result.metadata.numberingEnabled).toBe(true);
      result.slides.forEach((slide) => {
        expect(slide.numberApplied).toBe(true);
      });
    });

    it('should show correct format (1/5, 2/5, etc.)', async () => {
      const slides = [];
      for (let i = 0; i < 5; i++) {
        slides.push({ image: await createTestImage() });
      }

      const result = await generator.generateCarousel({
        slides,
        showNumbers: true,
      });

      // Verify response indicates numbering applied
      expect(result.totalSlides).toBe(5);
      result.slides.forEach((slide) => {
        expect(slide.numberApplied).toBe(true);
      });
    });

    it('should respect bottom-right position (default)', async () => {
      const slide = { image: await createTestImage() };

      const result = await generator.generateCarousel({
        slides: [slide],
        showNumbers: true,
        numberPosition: 'bottom-right',
      });

      expect(result.slides[0].numberApplied).toBe(true);
    });

    it('should respect different number positions', async () => {
      const positions: ('top-right' | 'bottom-right' | 'bottom-left')[] = [
        'top-right',
        'bottom-right',
        'bottom-left',
      ];

      for (const pos of positions) {
        const result = await generator.generateCarousel({
          slides: [{ image: await createTestImage() }],
          showNumbers: true,
          numberPosition: pos,
        });

        expect(result.slides[0].numberApplied).toBe(true);
      }
    });

    it('should skip numbering when disabled', async () => {
      const result = await generator.generateCarousel({
        slides: [{ image: await createTestImage() }],
        showNumbers: false,
      });

      expect(result.metadata.numberingEnabled).toBe(false);
      expect(result.slides[0].numberApplied).toBe(false);
    });
  });

  // AC-5: Tests implemented
  describe('AC-5: Testes Implementados', () => {
    it('should return proper CarouselGenerationResponse structure', async () => {
      const result = await generator.generateCarousel({
        slides: [{ image: await createTestImage() }],
      });

      expect(result).toHaveProperty('slides');
      expect(result).toHaveProperty('totalSlides');
      expect(result).toHaveProperty('generatedAt');
      expect(result).toHaveProperty('metadata');

      expect(Array.isArray(result.slides)).toBe(true);
      expect(typeof result.totalSlides).toBe('number');
      expect(typeof result.generatedAt).toBe('string');
      expect(typeof result.metadata).toBe('object');
    });

    it('should handle error when image buffer is invalid', async () => {
      await expect(
        generator.generateCarousel({
          slides: [{ image: Buffer.from('invalid') }],
        })
      ).rejects.toThrow();
    });

    it('should resize images to standard dimensions if needed', async () => {
      const customImage = await createTestImage(500, 600);

      const result = await generator.generateCarousel({
        slides: [{ image: customImage }],
        showNumbers: false,
      });

      expect(result.slides[0].dimensions.width).toBe(1080);
      expect(result.slides[0].dimensions.height).toBe(1350);
    });

    it('should generate unique buffers for each slide', async () => {
      const slides = [
        { image: await createTestImage(), copy: 'Slide 1' },
        { image: await createTestImage(1080, 1350, { r: 100, g: 200, b: 50 }), copy: 'Slide 2' },
      ];

      const result = await generator.generateCarousel({
        slides,
        showNumbers: false,
      });

      expect(result.slides[0].imageBuffer).not.toEqual(result.slides[1].imageBuffer);
    });

    it('should apply branding across all slides consistently', async () => {
      const slides = [
        { image: await createTestImage() },
        { image: await createTestImage(1080, 1350, { r: 100, g: 200, b: 50 }) },
      ];

      const result = await generator.generateCarousel({
        slides,
        brandColors: { primary: '#FF5733' },
      });

      expect(result.metadata.brandColors.primary).toBe('#FF5733');
      result.slides.forEach((slide) => {
        expect(slide.numberApplied).toBe(true);
      });
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
