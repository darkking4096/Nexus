import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from '../../config/database.js';
import { SchedulingService } from '../SchedulingService.js';
import { randomUUID } from 'crypto';

describe('SchedulingService', () => {
  let db: Database.Database;
  let service: SchedulingService;
  let testDbPath: string;
  let userId: string;
  let profileId: string;
  let contentId: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test-scheduling-${randomUUID()}.db`);
    db = initializeDatabase(testDbPath);
    service = new SchedulingService(db);

    // Create test user
    userId = randomUUID();
    const userStmt = db.prepare(`
      INSERT INTO users (id, email, password_hash, name)
      VALUES (?, ?, ?, ?)
    `);
    userStmt.run(userId, 'test@example.com', 'hash', 'Test User');

    // Create test profile
    profileId = randomUUID();
    const profileStmt = db.prepare(`
      INSERT INTO profiles (
        id, user_id, instagram_username, instagram_id, access_token
      ) VALUES (?, ?, ?, ?, ?)
    `);
    profileStmt.run(profileId, userId, 'test_user', '12345', 'token_xyz');

    // Create test content
    contentId = randomUUID();
    const contentStmt = db.prepare(`
      INSERT INTO content (
        id, profile_id, type, caption, status
      ) VALUES (?, ?, ?, ?, ?)
    `);
    contentStmt.run(contentId, profileId, 'post', 'Test caption', 'draft');
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('AC 1: Schedule content for specific date/time', () => {
    it('should create schedule for valid future date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const scheduledAt = futureDate.toISOString();

      const schedule = service.createSchedule(contentId, profileId, { scheduled_at: scheduledAt });

      expect(schedule.id).toBeDefined();
      expect(schedule.content_id).toBe(contentId);
      expect(schedule.profile_id).toBe(profileId);
      expect(schedule.scheduled_at).toBe(scheduledAt);
      expect(schedule.status).toBe('scheduled');
    });

    it('should reject schedule for past date', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const scheduledAt = pastDate.toISOString();

      expect(() => {
        service.createSchedule(contentId, profileId, { scheduled_at: scheduledAt });
      }).toThrow('past_date');
    });

    it('should reject invalid ISO8601 format', () => {
      expect(() => {
        service.createSchedule(contentId, profileId, { scheduled_at: '2024-01-01' });
      }).toThrow('invalid_format');
    });

    it('should update content status to scheduled', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const scheduledAt = futureDate.toISOString();

      service.createSchedule(contentId, profileId, { scheduled_at: scheduledAt });

      const stmt = db.prepare('SELECT status FROM content WHERE id = ?');
      const result = stmt.get(contentId) as any;

      expect(result.status).toBe('scheduled');
    });
  });

  describe('AC 3: Retrieve active schedules', () => {
    it('should return all scheduled posts ordered by date', () => {
      const date1 = new Date();
      date1.setDate(date1.getDate() + 1);

      const date2 = new Date();
      date2.setDate(date2.getDate() + 2);

      service.createSchedule(contentId, profileId, { scheduled_at: date2.toISOString() });

      // Create another content
      const content2Id = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(content2Id, profileId, 'post', 'Caption 2', 'draft');

      service.createSchedule(content2Id, profileId, { scheduled_at: date1.toISOString() });

      const scheduled = service.getSchedulesByProfile(profileId);

      expect(scheduled).toHaveLength(2);
      // Verify ordered by date (earlier first)
      const time0 = new Date(scheduled[0].scheduled_at).getTime();
      const time1 = new Date(scheduled[1].scheduled_at).getTime();
      expect(time0 < time1).toBe(true);
    });
  });

  describe('AC 4: Retrieve queue (unified scheduled + pending)', () => {
    it('should return scheduled and pending posts', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.createSchedule(contentId, profileId, { scheduled_at: futureDate.toISOString() });

      // Create pending content (draft)
      const pendingId = randomUUID();
      const stmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      stmt.run(pendingId, profileId, 'post', 'Pending', 'draft');

      const queue = service.getQueueByProfile(profileId);

      expect(queue.items.length).toBeGreaterThanOrEqual(1);
      expect(queue.total).toBeGreaterThanOrEqual(1);
    });

    it('should support pagination', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.createSchedule(contentId, profileId, { scheduled_at: futureDate.toISOString() });

      const queue = service.getQueueByProfile(profileId, { limit: 1, offset: 0 });

      expect(queue.items.length).toBeLessThanOrEqual(1);
      expect(queue.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('AC 5: Update schedule', () => {
    it('should update scheduled date', () => {
      const date1 = new Date();
      date1.setDate(date1.getDate() + 1);

      const date2 = new Date();
      date2.setDate(date2.getDate() + 2);

      service.createSchedule(contentId, profileId, { scheduled_at: date1.toISOString() });

      const updated = service.updateSchedule(contentId, profileId, {
        scheduled_at: date2.toISOString(),
      });

      expect(updated.scheduled_at).toBe(date2.toISOString());
    });

    it('should reject update to past date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.createSchedule(contentId, profileId, { scheduled_at: futureDate.toISOString() });

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(() => {
        service.updateSchedule(contentId, profileId, {
          scheduled_at: pastDate.toISOString(),
        });
      }).toThrow('past_date');
    });
  });

  describe('AC 6: Cancel schedule', () => {
    it('should delete schedule and return content to draft', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.createSchedule(contentId, profileId, { scheduled_at: futureDate.toISOString() });

      service.cancelSchedule(contentId, profileId);

      const stmt = db.prepare('SELECT status FROM content WHERE id = ?');
      const result = stmt.get(contentId) as any;

      expect(result.status).toBe('draft');

      // Verify schedule is deleted
      const scheduleStmt = db.prepare('SELECT id FROM scheduled_posts WHERE content_id = ?');
      const schedule = scheduleStmt.get(contentId);

      expect(schedule).toBeUndefined();
    });
  });

  describe('Audit trail', () => {
    it('should log schedule creation', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      service.createSchedule(contentId, profileId, { scheduled_at: futureDate.toISOString() });

      const stmt = db.prepare('SELECT * FROM schedule_audit WHERE action = ? AND content_id = ?');
      const audit = stmt.get('create', contentId) as any;

      expect(audit).toBeDefined();
      expect(audit.action).toBe('create');
    });

    it('should log schedule update', () => {
      const date1 = new Date();
      date1.setDate(date1.getDate() + 1);

      const date2 = new Date();
      date2.setDate(date2.getDate() + 2);

      service.createSchedule(contentId, profileId, { scheduled_at: date1.toISOString() });
      service.updateSchedule(contentId, profileId, { scheduled_at: date2.toISOString() });

      const stmt = db.prepare('SELECT * FROM schedule_audit WHERE action = ? AND content_id = ?');
      const audit = stmt.all('update', contentId) as any[];

      expect(audit.length).toBeGreaterThan(0);
    });
  });
});
