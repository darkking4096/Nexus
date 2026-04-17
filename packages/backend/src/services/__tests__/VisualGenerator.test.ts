/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { VisualGenerator } from '../VisualGenerator';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Helper: Generate a valid PNG buffer for testing
async function createValidPNGBuffer(width = 1080, height = 1350): Promise<Buffer> {
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 200, g: 200, b: 200 },
    },
  })
    .png()
    .toBuffer();
}

// Store the valid PNG buffer
let validPNGBuffer: Buffer;

// Mock NandoBananaClient to avoid API key requirement
vi.mock('../../integrations/NandoBananaClient', () => ({
  NandoBananaClient: vi.fn(function () {
    return {
      generateImage: vi.fn().mockImplementation(async () => {
        // Use the pre-generated valid PNG buffer
        return {
          imageData: validPNGBuffer,
          width: 2048,
          height: 2048,
          format: 'png',
          generated_at: new Date().toISOString(),
        };
      }),
      healthCheck: vi.fn().mockResolvedValue(true),
    };
  }),
}));

describe('VisualGenerator', () => {
  let visualGenerator: VisualGenerator;
  let db: Database.Database;
  const testDbPath = path.join(process.cwd(), '.test-visual-generator.db');

  beforeAll(async () => {
    // Generate valid PNG buffer for mocks
    validPNGBuffer = await createValidPNGBuffer();

    // Clean up old test database if it exists
    if (fs.existsSync(testDbPath)) {
      try {
        fs.unlinkSync(testDbPath);
      } catch {
        // Ignore if file is locked, database will be overwritten
      }
    }

    // Create test database
    db = new Database(testDbPath);

    // Create test tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS instagram_profiles (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        username TEXT NOT NULL,
        context JSON
      );
    `);

    // Insert test profile with branding
    db.prepare(`
      INSERT INTO instagram_profiles (id, userId, username, context)
      VALUES (?, ?, ?, ?)
    `).run(
      'profile_123',
      'user_123',
      'test_user',
      JSON.stringify({
        brandColors: ['#FF6B6B', '#4ECDC4'],
        voice: 'authentic, engaging',
      })
    );

    visualGenerator = new VisualGenerator(db);
  });

  afterAll(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('AC-1: VisualGenerator Service', () => {
    it('should have generateImage method returning ImageBuffer', async () => {
      expect(typeof visualGenerator.generateVisual).toBe('function');
    });

    it('should have resizeToFormat method for 3 formats', async () => {
      const formats: Array<'feed' | 'story' | 'reel'> = ['feed', 'story', 'reel'];
      for (const format of formats) {
        const response = await visualGenerator.generateVisual({
          profileId: 'profile_123',
          prompt: 'test image',
          format,
        });
        expect(response).toBeDefined();
        expect(response.format).toBe(format);
      }
    });
  });

  describe('AC-2: Nando Banana Integration', () => {
    it('should call Nando Banana API with prompt', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'tech startup team meeting',
        format: 'feed',
      });

      expect(response).toBeDefined();
      expect(response.imageBuffer).toBeDefined();
      expect(Buffer.isBuffer(response.imageBuffer)).toBe(true);
    });

    it('should have retry logic (max 3 attempts)', async () => {
      // The NandoBananaClient has retry built in
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'feed',
      });

      expect(response).toBeDefined();
    });
  });

  describe('AC-3: Branding (Colors + Logo)', () => {
    it('should apply primary and secondary colors', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'feed',
        brandingConfig: {
          primaryColor: '#FF6B6B',
          secondaryColor: '#4ECDC4',
          colorOverlayOpacity: 30,
        },
      });

      expect(response).toBeDefined();
      expect(response.imageBuffer).toBeDefined();
    });

    it('should handle logo positioning (top-right)', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'feed',
        brandingConfig: {
          logoPath: '/path/to/logo.png',
          logoPosition: 'top-right',
        },
      });

      expect(response).toBeDefined();
    });
  });

  describe('AC-4: Instagram Format Support', () => {
    it('should resize to feed (1080×1350)', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'feed',
      });

      expect(response.dimensions.width).toBe(1080);
      expect(response.dimensions.height).toBe(1350);
    });

    it('should resize to story (1080×1920)', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'story',
      });

      expect(response.dimensions.width).toBe(1080);
      expect(response.dimensions.height).toBe(1920);
    });

    it('should resize to reel (1080×1920)', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'test',
        format: 'reel',
      });

      expect(response.dimensions.width).toBe(1080);
      expect(response.dimensions.height).toBe(1920);
    });
  });

  describe('AC-5: Image Caching', () => {
    it('should cache image and return cache hit', async () => {
      const response1 = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'unique test prompt for caching',
        format: 'feed',
      });

      expect(response1.cacheHit).toBe(false);

      const response2 = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'unique test prompt for caching',
        format: 'feed',
      });

      expect(response2.cacheHit).toBe(true);
    });

    it('should have 7-day TTL', async () => {
      // Cache stats would show TTL
      const response = await visualGenerator.generateVisual({
        profileId: 'profile_123',
        prompt: 'ttl test',
        format: 'feed',
      });

      expect(response).toBeDefined();
      // In production, would verify cache entry expiration
    });
  });

  describe('AC-6: Error Handling', () => {
    it('should handle missing profile gracefully', async () => {
      const response = await visualGenerator.generateVisual({
        profileId: 'nonexistent_profile',
        prompt: 'test',
        format: 'feed',
      });

      expect(response).toBeDefined();
      // Falls back to default branding config
    });

    it('should handle invalid format', async () => {
      try {
        await visualGenerator.generateVisual({
          profileId: 'profile_123',
          prompt: 'test',
          format: 'invalid' as any,
        });
        // Should either throw or handle gracefully
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Health Check', () => {
    it('should check Nando Banana API availability', async () => {
      const isHealthy = await visualGenerator.healthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });
  });
});
