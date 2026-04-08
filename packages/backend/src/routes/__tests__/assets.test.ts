import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { createAssetsRoutes } from '../assets';
import { createProfilesRoutes } from '../profiles';
import express, { Express } from 'express';
import { Profile } from '../../models/Profile';
import { ProfileAsset } from '../../models/ProfileAsset';
import { AssetService } from '../../services/AssetService.js';
import request from 'supertest';

describe('Assets Routes', () => {
  let app: Express;
  let db: Database.Database;
  let profileModel: Profile;
  let assetModel: ProfileAsset;
  let testProfileId: string;

  beforeAll(() => {
    // Create in-memory database
    db = new Database(':memory:');

    // Create tables
    db.exec(`
      CREATE TABLE profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        instagram_username TEXT NOT NULL,
        instagram_id TEXT,
        access_token TEXT NOT NULL,
        refresh_token TEXT,
        token_expires_at TEXT,
        display_name TEXT,
        bio TEXT,
        profile_picture_url TEXT,
        followers_count INTEGER DEFAULT 0,
        context_voice TEXT,
        context_tone TEXT,
        context_audience TEXT,
        context_goals TEXT,
        autopilot_enabled INTEGER DEFAULT 0,
        autopilot_schedule TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE profile_assets (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL REFERENCES profiles(id),
        asset_type TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        mime_type TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `);

    profileModel = new Profile(db);
    assetModel = new ProfileAsset(db);

    // Create test profile
    const profile = profileModel.create({
      user_id: 'test-user-123',
      instagram_username: 'test_user',
      access_token: 'token123',
    });
    testProfileId = profile.id;

    // Setup Express app
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req: Express.Request & { userId?: string }, _res, next) => {
      req.userId = 'test-user-123';
      next();
    });

    app.use('/api/profiles', createProfilesRoutes(db));
    app.use('/api/profiles/:profileId/assets', createAssetsRoutes(db));
  });

  afterAll(() => {
    db.close();
  });

  describe('GET /api/profiles/:profileId/assets', () => {
    it('should list assets for a profile', async () => {
      const response = await request(app).get(`/api/profiles/${testProfileId}/assets`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(typeof response.body.count === 'number');
      expect(Array.isArray(response.body.assets)).toBe(true);
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app).get(`/api/profiles/non-existent-id/assets`);

      expect(response.status).toBe(404);
    });

    it('should filter assets by type', async () => {
      const response = await request(app).get(
        `/api/profiles/${testProfileId}/assets?type=image`
      );

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.assets)).toBe(true);
    });
  });

  describe('DELETE /api/profiles/:profileId/assets/:assetId', () => {
    let assetId: string;

    beforeAll(() => {
      const asset = assetModel.create({
        profile_id: testProfileId,
        asset_type: 'image',
        file_path: 'assets/test/test.jpg',
        file_name: 'test.jpg',
        file_size: 1024,
        mime_type: 'image/jpeg',
      });
      assetId = asset.id;
    });

    it('should delete an asset', async () => {
      const response = await request(app).delete(
        `/api/profiles/${testProfileId}/assets/${assetId}`
      );

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Asset deleted successfully');

      // Verify deletion
      const deleted = assetModel.getById(assetId);
      expect(deleted).toBeNull();
    });

    it('should return 404 for non-existent asset', async () => {
      const response = await request(app).delete(
        `/api/profiles/${testProfileId}/assets/non-existent-id`
      );

      expect(response.status).toBe(404);
    });
  });

  describe('AssetService validation', () => {
    it('should validate image files', () => {
      const result = AssetService.validateFile({
        mimeType: 'image/jpeg',
        size: 5 * 1024 * 1024, // 5MB
      });

      expect(result.valid).toBe(true);
      expect(result.assetType).toBe('image');
    });

    it('should reject invalid file types', () => {
      const result = AssetService.validateFile({
        mimeType: 'application/exe',
        size: 1024,
      });

      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject oversized images', () => {
      const result = AssetService.validateFile({
        mimeType: 'image/jpeg',
        size: 20 * 1024 * 1024, // 20MB (exceeds 10MB limit)
      });

      expect(result.valid).toBe(false);
      expect(result.error).toContain('too large');
    });

    it('should validate video files', () => {
      const result = AssetService.validateFile({
        mimeType: 'video/mp4',
        size: 50 * 1024 * 1024, // 50MB
      });

      expect(result.valid).toBe(true);
      expect(result.assetType).toBe('video');
    });

    it('should format file sizes correctly', () => {
      expect(AssetService.formatFileSize(512)).toBe('512 B');
      expect(AssetService.formatFileSize(1024)).toBe('1.00 KB');
      expect(AssetService.formatFileSize(1024 * 1024)).toBe('1.00 MB');
    });
  });
});
