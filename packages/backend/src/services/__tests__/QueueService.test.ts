import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initializeDatabase } from '../../config/database.js';
import { QueueService } from '../QueueService.js';
import { randomUUID } from 'crypto';

describe('QueueService', () => {
  let db: Database.Database;
  let service: QueueService;
  let testDbPath: string;
  let userId: string;
  let profileId: string;

  beforeEach(() => {
    testDbPath = path.join(__dirname, `test-queue-${randomUUID()}.db`);
    db = initializeDatabase(testDbPath);
    service = new QueueService(db);

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
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  describe('AC 1: View queue (scheduled + pending)', () => {
    it('should return empty queue when no content', () => {
      const queue = service.getQueue(profileId);

      expect(queue.items).toHaveLength(0);
      expect(queue.total).toBe(0);
      expect(queue.has_more).toBe(false);
    });

    it('should include scheduled posts', () => {
      // Create content and schedule it
      const contentId = randomUUID();
      const contentStmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      contentStmt.run(contentId, profileId, 'post', 'Test', 'draft');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const scheduleStmt = db.prepare(`
        INSERT INTO scheduled_posts (id, content_id, profile_id, scheduled_at, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const scheduleId = randomUUID();
      const now = new Date().toISOString();
      scheduleStmt.run(scheduleId, contentId, profileId, futureDate.toISOString(), 'scheduled', now, now);

      const queue = service.getQueue(profileId);

      expect(queue.items.length).toBeGreaterThan(0);
      expect(queue.total).toBeGreaterThan(0);
    });

    it('should include pending posts (draft)', () => {
      // Create pending content
      const contentId = randomUUID();
      const contentStmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      contentStmt.run(contentId, profileId, 'post', 'Pending content', 'draft');

      const queue = service.getQueue(profileId);

      expect(queue.items.length).toBeGreaterThan(0);
      expect(queue.total).toBeGreaterThan(0);
    });
  });

  describe('AC 2: Reorder queue', () => {
    beforeEach(() => {
      // Create multiple scheduled posts for reordering tests
      for (let i = 0; i < 3; i++) {
        const contentId = randomUUID();
        const contentStmt = db.prepare(`
          INSERT INTO content (id, profile_id, type, caption, status)
          VALUES (?, ?, ?, ?, ?)
        `);
        contentStmt.run(contentId, profileId, 'post', `Content ${i}`, 'draft');

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1 + i);

        const scheduleStmt = db.prepare(`
          INSERT INTO scheduled_posts (id, content_id, profile_id, scheduled_at, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const scheduleId = randomUUID();
        const now = new Date().toISOString();
        scheduleStmt.run(scheduleId, contentId, profileId, futureDate.toISOString(), 'scheduled', now, now);
      }
    });

    it('should update queue position', () => {
      // Get first content
      const queueBefore = service.getQueue(profileId);
      const contentId = queueBefore.items[0].content_id;

      // Reorder to position 2
      const updated = service.reorderQueue(profileId, [{ content_id: contentId, new_position: 2 }]);

      expect(updated).toHaveLength(1);
      expect(updated[0].queue_position).toBe(2);
    });

    it('should handle multiple reorders', () => {
      const queueBefore = service.getQueue(profileId);
      const reorders = [
        { content_id: queueBefore.items[0].content_id, new_position: 3 },
        { content_id: queueBefore.items[1].content_id, new_position: 1 },
      ];

      const updated = service.reorderQueue(profileId, reorders);

      expect(updated).toHaveLength(2);
    });
  });

  describe('AC 3: Delete from queue', () => {
    it('should delete scheduled post and reset to draft', () => {
      const contentId = randomUUID();
      const contentStmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      contentStmt.run(contentId, profileId, 'post', 'Test', 'draft');

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const scheduleStmt = db.prepare(`
        INSERT INTO scheduled_posts (id, content_id, profile_id, scheduled_at, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      const scheduleId = randomUUID();
      const now = new Date().toISOString();
      scheduleStmt.run(scheduleId, contentId, profileId, futureDate.toISOString(), 'scheduled', now, now);

      // Delete from queue
      service.deleteFromQueue(contentId, profileId);

      // Verify schedule is deleted
      const checkSchedule = db.prepare('SELECT id FROM scheduled_posts WHERE content_id = ?');
      const schedule = checkSchedule.get(contentId);
      expect(schedule).toBeUndefined();

      // Verify content is back to draft
      const checkContent = db.prepare('SELECT status FROM content WHERE id = ?');
      const content = checkContent.get(contentId) as any;
      expect(content.status).toBe('draft');
    });

    it('should throw error for non-existent content', () => {
      expect(() => {
        service.deleteFromQueue(randomUUID(), profileId);
      }).toThrow('Content not found');
    });
  });

  describe('AC 4: Filter by status', () => {
    beforeEach(() => {
      // Create scheduled and pending posts
      for (let i = 0; i < 2; i++) {
        const contentId = randomUUID();
        const contentStmt = db.prepare(`
          INSERT INTO content (id, profile_id, type, caption, status)
          VALUES (?, ?, ?, ?, ?)
        `);
        contentStmt.run(contentId, profileId, 'post', `Content ${i}`, 'draft');

        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1 + i);

        const scheduleStmt = db.prepare(`
          INSERT INTO scheduled_posts (id, content_id, profile_id, scheduled_at, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        const scheduleId = randomUUID();
        const now = new Date().toISOString();
        scheduleStmt.run(scheduleId, contentId, profileId, futureDate.toISOString(), 'scheduled', now, now);
      }

      // Create pending-only content
      const pendingId = randomUUID();
      const pendingStmt = db.prepare(`
        INSERT INTO content (id, profile_id, type, caption, status)
        VALUES (?, ?, ?, ?, ?)
      `);
      pendingStmt.run(pendingId, profileId, 'post', 'Pending only', 'draft');
    });

    it('should filter by scheduled status', () => {
      const filtered = service.filterByStatus(profileId, 'scheduled');

      expect(filtered.items.length).toBeGreaterThan(0);
      expect(filtered.items.every(item => item.status === 'scheduled')).toBe(true);
    });

    it('should filter by pending status', () => {
      const filtered = service.filterByStatus(profileId, 'pending');

      expect(filtered.items.length).toBeGreaterThan(0);
      expect(filtered.items.every(item => item.status === 'draft')).toBe(true);
    });

    it('should respect pagination', () => {
      const result1 = service.filterByStatus(profileId, 'scheduled', 1, 0);
      const result2 = service.filterByStatus(profileId, 'scheduled', 1, 1);

      expect(result1.items.length).toBeLessThanOrEqual(1);
      expect(result2.items.length).toBeLessThanOrEqual(1);
    });
  });

  describe('AC 5: Pagination', () => {
    beforeEach(() => {
      // Create many items for pagination testing
      for (let i = 0; i < 25; i++) {
        const contentId = randomUUID();
        const contentStmt = db.prepare(`
          INSERT INTO content (id, profile_id, type, caption, status)
          VALUES (?, ?, ?, ?, ?)
        `);
        contentStmt.run(contentId, profileId, 'post', `Content ${i}`, 'draft');
      }
    });

    it('should paginate results correctly', () => {
      const page1 = service.getQueue(profileId, { page: 1, limit: 10 });
      const page2 = service.getQueue(profileId, { page: 2, limit: 10 });

      expect(page1.items).toHaveLength(10);
      expect(page2.items).toHaveLength(10);
      expect(page1.current_page).toBe(1);
      expect(page2.current_page).toBe(2);
    });

    it('should return has_more correctly', () => {
      const page1 = service.getQueue(profileId, { page: 1, limit: 10 });
      const page2 = service.getQueue(profileId, { page: 2, limit: 10 });
      const page3 = service.getQueue(profileId, { page: 3, limit: 10 });

      expect(page1.has_more).toBe(true); // 10 items, total 25, so more exist
      expect(page2.has_more).toBe(true); // 20 items seen, total 25, so more exist
      expect(page3.has_more).toBe(false); // 30 offset > 25 total, no more
    });
  });
});
