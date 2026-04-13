import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { AutopilotService, CreateAutopilotPayload } from '../services/AutopilotService';
import initializeDatabase from '../config/database';

describe('AutopilotService', () => {
  let db: Database.Database;
  let service: AutopilotService;
  const testDbPath = path.join(__dirname, 'test-autopilot.db');

  beforeEach(() => {
    // Create test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    db = initializeDatabase(testDbPath);
    service = new AutopilotService(db);

    // Insert test user and profile
    const userId = 'test-user-1';
    const profileId = 'test-profile-1';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `).run(userId, 'test@example.com', 'hash', 'Test User');

    db.prepare(`
      INSERT INTO profiles (
        id, user_id, instagram_username, instagram_id, access_token
      ) VALUES (?, ?, ?, ?, ?)
    `).run(profileId, userId, 'testuser', 'insta-123', 'token-abc');
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('validateSchedule', () => {
    it('should validate correct days and times', () => {
      const result = AutopilotService.validateSchedule(['MON', 'WED', 'FRI'], ['09:00', '17:00']);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject empty days array', () => {
      const result = AutopilotService.validateSchedule([], ['09:00']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Days must be a non-empty array');
    });

    it('should reject invalid day names', () => {
      const result = AutopilotService.validateSchedule(['MONDAY'], ['09:00']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid day: MONDAY');
    });

    it('should reject empty times array', () => {
      const result = AutopilotService.validateSchedule(['MON'], []);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Times must be a non-empty array');
    });

    it('should reject invalid time format', () => {
      const result = AutopilotService.validateSchedule(['MON'], ['9:00']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid time format: 9:00');
    });

    it('should reject malformed time', () => {
      const result = AutopilotService.validateSchedule(['MON'], ['25:00']);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid time format: 25:00');
    });

    it('should accept all valid days', () => {
      const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const result = AutopilotService.validateSchedule(validDays, ['12:00']);
      expect(result.valid).toBe(true);
    });

    it('should accept various valid time formats', () => {
      const result = AutopilotService.validateSchedule(['MON'], ['00:00', '12:30', '23:59']);
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateFrequency', () => {
    it('should calculate frequency correctly', () => {
      const freq = AutopilotService.calculateFrequency(['MON', 'WED', 'FRI'], ['09:00', '17:00']);
      expect(freq).toBe('6x per week');
    });

    it('should calculate single day single time', () => {
      const freq = AutopilotService.calculateFrequency(['MON'], ['09:00']);
      expect(freq).toBe('1x per week');
    });

    it('should calculate all days multiple times', () => {
      const freq = AutopilotService.calculateFrequency(
        ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        ['09:00', '14:00', '18:00'],
      );
      expect(freq).toBe('21x per week');
    });
  });

  describe('createAutopilot', () => {
    it('should create autopilot config successfully', () => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON', 'WED', 'FRI'],
        times: ['09:00', '17:00'],
      };

      const result = service.createAutopilot('test-profile-1', payload);

      expect('config_id' in result).toBe(true);
      if ('config_id' in result) {
        expect(result.config).toEqual({
          id: result.config_id,
          profile_id: 'test-profile-1',
          enabled: true,
          days: ['MON', 'WED', 'FRI'],
          times: ['09:00', '17:00'],
          frequency: '6x per week',
          created_at: expect.any(String),
          updated_at: expect.any(String),
          last_updated_at: expect.any(String),
          next_publication_at: expect.any(String),
        });
      }
    });

    it('should reject invalid schedule on create', () => {
      const payload = {
        enabled: true,
        days: ['INVALID'],
        times: ['09:00'],
      };

      const result = service.createAutopilot('test-profile-1', payload);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Invalid day: INVALID');
      }
    });

    it('should persist config to database', () => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON', 'TUE'],
        times: ['10:00'],
      };

      const createResult = service.createAutopilot('test-profile-1', payload);
      expect('config_id' in createResult).toBe(true);

      const readResult = service.readAutopilot('test-profile-1');
      expect(readResult).not.toBeNull();
      expect(readResult?.enabled).toBe(true);
      expect(readResult?.frequency).toBe('2x per week');
    });
  });

  describe('readAutopilot', () => {
    it('should return null for non-existent profile', () => {
      const result = service.readAutopilot('non-existent-profile');
      expect(result).toBeNull();
    });

    it('should read created config correctly', () => {
      const payload: CreateAutopilotPayload = {
        enabled: false,
        days: ['SAT', 'SUN'],
        times: ['14:00', '20:00'],
      };

      service.createAutopilot('test-profile-1', payload);
      const config = service.readAutopilot('test-profile-1');

      expect(config).not.toBeNull();
      expect(config?.enabled).toBe(false);
      expect(config?.days).toEqual(['SAT', 'SUN']);
      expect(config?.times).toEqual(['14:00', '20:00']);
      expect(config?.frequency).toBe('4x per week');
    });
  });

  describe('updateAutopilot', () => {
    beforeEach(() => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON'],
        times: ['09:00'],
      };
      service.createAutopilot('test-profile-1', payload);
    });

    it('should update days', () => {
      const result = service.updateAutopilot('test-profile-1', { days: ['MON', 'WED'] });

      expect('config' in result).toBe(true);
      if ('config' in result) {
        expect(result.config.days).toEqual(['MON', 'WED']);
        expect(result.config.frequency).toBe('2x per week');
      }
    });

    it('should update times', () => {
      const result = service.updateAutopilot('test-profile-1', { times: ['09:00', '18:00'] });

      expect('config' in result).toBe(true);
      if ('config' in result) {
        expect(result.config.times).toEqual(['09:00', '18:00']);
        expect(result.config.frequency).toBe('2x per week');
      }
    });

    it('should update enabled status', () => {
      const result = service.updateAutopilot('test-profile-1', { enabled: false });

      expect('config' in result).toBe(true);
      if ('config' in result) {
        expect(result.config.enabled).toBe(false);
      }
    });

    it('should reject invalid update schedule', () => {
      const result = service.updateAutopilot('test-profile-1', { days: ['INVALID'] });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Invalid day: INVALID');
      }
    });

    it('should return error for non-existent config', () => {
      const result = service.updateAutopilot('non-existent-profile', { enabled: true });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('toggleAutopilot', () => {
    beforeEach(() => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON'],
        times: ['09:00'],
      };
      service.createAutopilot('test-profile-1', payload);
    });

    it('should toggle from enabled to disabled', () => {
      const result = service.toggleAutopilot('test-profile-1', false);

      expect('config' in result).toBe(true);
      if ('config' in result) {
        expect(result.config.enabled).toBe(false);
        // Config data should be preserved
        expect(result.config.days).toEqual(['MON']);
        expect(result.config.times).toEqual(['09:00']);
      }
    });

    it('should toggle from disabled to enabled', () => {
      service.toggleAutopilot('test-profile-1', false);
      const result = service.toggleAutopilot('test-profile-1', true);

      expect('config' in result).toBe(true);
      if ('config' in result) {
        expect(result.config.enabled).toBe(true);
      }
    });

    it('should preserve config when toggling', () => {
      const originalConfig = service.readAutopilot('test-profile-1');

      service.toggleAutopilot('test-profile-1', false);
      const toggled = service.readAutopilot('test-profile-1');

      expect(toggled?.days).toEqual(originalConfig?.days);
      expect(toggled?.times).toEqual(originalConfig?.times);
      expect(toggled?.frequency).toEqual(originalConfig?.frequency);
    });

    it('should return error for non-existent config', () => {
      const result = service.toggleAutopilot('non-existent-profile', true);

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('not found');
      }
    });
  });

  describe('deleteAutopilot', () => {
    beforeEach(() => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON'],
        times: ['09:00'],
      };
      service.createAutopilot('test-profile-1', payload);
    });

    it('should delete config successfully', () => {
      const result = service.deleteAutopilot('test-profile-1');

      expect('success' in result).toBe(true);
      if ('success' in result) {
        expect(result.success).toBe(true);
      }

      const config = service.readAutopilot('test-profile-1');
      expect(config).toBeNull();
    });

    it('should not error on deleting non-existent config', () => {
      const result = service.deleteAutopilot('non-existent-profile');

      expect('success' in result).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle profile with no config', () => {
      const config = service.readAutopilot('test-profile-1');
      expect(config).toBeNull();
    });

    it('should calculate next publication correctly for next week', () => {
      // Test that next_publication_at is calculated
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON'],
        times: ['09:00'],
      };

      const result = service.createAutopilot('test-profile-1', payload);

      if ('config' in result) {
        expect(result.config.next_publication_at).toBeDefined();
        // Should be a valid ISO datetime string
        const date = new Date(result.config.next_publication_at!);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    });

    it('should handle duplicate profile creation gracefully', () => {
      const payload: CreateAutopilotPayload = {
        enabled: true,
        days: ['MON'],
        times: ['09:00'],
      };

      service.createAutopilot('test-profile-1', payload);

      // Creating for the same profile should fail due to UNIQUE constraint
      const result = service.createAutopilot('test-profile-1', payload);

      expect('error' in result).toBe(true);
    });
  });
});
