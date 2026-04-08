import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import { createProfilesRoutes } from '../profiles';
import express, { Express } from 'express';
import { Profile } from '../../models/Profile';
import request from 'supertest';

describe('Profile Routes - Context Configuration', () => {
  let app: Express;
  let db: Database.Database;
  let profileModel: Profile;

  beforeAll(() => {
    // Create in-memory database for testing
    db = new Database(':memory:');

    // Create profiles table
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
    `);

    profileModel = new Profile(db);

    // Create Express app with routes
    app = express();
    app.use(express.json());

    // Mock auth middleware
    app.use((req: Express.Request & { userId?: string }, _res, next) => {
      req.userId = 'test-user-123';
      next();
    });

    app.use('/api/profiles', createProfilesRoutes(db));
  });

  afterAll(() => {
    db.close();
  });

  describe('PATCH /api/profiles/:id/context', () => {
    let profileId: string;

    beforeAll(() => {
      const profile = profileModel.create({
        user_id: 'test-user-123',
        instagram_username: 'test_user',
        access_token: 'token123',
      });
      profileId = profile.id;
    });

    it('should update profile context successfully', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}/context`)
        .send({
          voice: 'Professional and inspiring voice',
          tone: 'professional',
          audience: { age: '25-40', interests: ['technology', 'marketing'] },
          goals: ['Build brand awareness', 'Increase engagement'],
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile context updated successfully');
      expect(response.body.profile).toBeDefined();
      expect(response.body.profile.context_voice).toBe('Professional and inspiring voice');
      expect(response.body.profile.context_tone).toBe('professional');
    });

    it('should validate voice is required', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}/context`)
        .send({
          voice: '',
          tone: 'professional',
          goals: ['goal1'],
        });

      expect(response.status).toBe(400);
    });

    it('should validate tone is one of allowed values', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}/context`)
        .send({
          voice: 'Test voice',
          tone: 'invalid-tone',
          goals: ['goal1'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Valid tone required');
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app)
        .patch(`/api/profiles/non-existent-id/context`)
        .send({
          voice: 'Test voice',
          tone: 'professional',
          goals: ['goal1'],
        });

      expect(response.status).toBe(404);
    });

    it('should update only provided fields', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}/context`)
        .send({
          voice: 'Updated voice only',
        });

      expect(response.status).toBe(200);
      expect(response.body.profile.context_voice).toBe('Updated voice only');
    });
  });

  describe('PATCH /api/profiles/:id', () => {
    let profileId: string;

    beforeAll(() => {
      const profile = profileModel.create({
        user_id: 'test-user-123',
        instagram_username: 'test_user_2',
        access_token: 'token456',
      });
      profileId = profile.id;
    });

    it('should update profile display_name and bio', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}`)
        .send({
          display_name: 'My Brand',
          bio: 'Marketing expert',
        });

      expect(response.status).toBe(200);
      expect(response.body.profile.display_name).toBe('My Brand');
      expect(response.body.profile.bio).toBe('Marketing expert');
    });

    it('should validate display_name type', async () => {
      const response = await request(app)
        .patch(`/api/profiles/${profileId}`)
        .send({
          display_name: 123,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/profiles/:id', () => {
    let profileId: string;

    beforeAll(() => {
      const profile = profileModel.create({
        user_id: 'test-user-123',
        instagram_username: 'test_user_delete',
        access_token: 'token789',
      });
      profileId = profile.id;
    });

    it('should delete profile successfully', async () => {
      const response = await request(app).delete(`/api/profiles/${profileId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile deleted successfully');

      // Verify deletion
      const deletedProfile = profileModel.getById(profileId);
      expect(deletedProfile).toBeNull();
    });

    it('should return 404 for non-existent profile', async () => {
      const response = await request(app).delete(`/api/profiles/non-existent-id`);

      expect(response.status).toBe(404);
    });
  });
});
