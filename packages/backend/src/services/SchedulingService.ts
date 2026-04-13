import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface ScheduledPost {
  id: string;
  content_id: string;
  profile_id: string;
  scheduled_at: string;
  original_scheduled_at: string | null;
  status: string;
  queue_position: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSchedulePayload {
  scheduled_at: string;
}

export interface UpdateSchedulePayload {
  scheduled_at?: string;
}

interface ScheduledPostRow {
  id: string;
  content_id: string;
  profile_id: string;
  scheduled_at: string;
  original_scheduled_at: string | null;
  status: string;
  queue_position: number | null;
  created_at: string;
  updated_at: string;
}

interface ContentRow {
  id: string;
  profile_id: string;
  status: string;
}

interface CountResult {
  cnt: number;
}

/**
 * SchedulingService
 * Manages content scheduling: create, read, update, delete schedules
 * Validates dates and times, coordinates with queue
 */
export class SchedulingService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * AC 1: Schedule content for a specific date/time
   */
  createSchedule(
    contentId: string,
    profileId: string,
    payload: CreateSchedulePayload
  ): ScheduledPost {
    // Validation: date must be valid and not in the past
    this.validateScheduleDate(payload.scheduled_at);

    // Verify content exists and belongs to profile
    const contentStmt = this.db.prepare(`
      SELECT id, profile_id, status FROM content WHERE id = ? AND profile_id = ?
    `);
    const content = contentStmt.get(contentId, profileId) as ContentRow | undefined;
    if (!content) {
      throw new Error('Content not found or access denied');
    }

    const id = randomUUID();
    const now = new Date().toISOString();

    // Create schedule record
    const insertStmt = this.db.prepare(`
      INSERT INTO scheduled_posts (
        id, content_id, profile_id, scheduled_at, original_scheduled_at, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run(id, contentId, profileId, payload.scheduled_at, null, 'scheduled', now, now);

    // Update content status to scheduled
    const updateContentStmt = this.db.prepare(`
      UPDATE content SET status = ?, scheduled_at = ?, updated_at = ? WHERE id = ?
    `);
    updateContentStmt.run('scheduled', payload.scheduled_at, now, contentId);

    // Log audit
    this.logAudit(id, contentId, profileId, 'create', null, payload.scheduled_at, null);

    return this.getScheduleById(id) as ScheduledPost;
  }

  /**
   * AC 3: Retrieve active schedules for a profile
   */
  getSchedulesByProfile(profileId: string): ScheduledPost[] {
    const stmt = this.db.prepare(`
      SELECT
        id, content_id, profile_id, scheduled_at, original_scheduled_at, status, queue_position, created_at, updated_at
      FROM scheduled_posts
      WHERE profile_id = ? AND status = 'scheduled'
      ORDER BY scheduled_at ASC
    `);

    const rows = stmt.all(profileId) as ScheduledPostRow[];
    return rows.map(row => this.rowToScheduledPost(row));
  }

  /**
   * AC 4: Retrieve all scheduled posts (unified with pending)
   */
  getQueueByProfile(
    profileId: string,
    filters?: { status?: string; limit?: number; offset?: number }
  ): {
    items: ScheduledPost[];
    total: number;
    has_more: boolean;
  } {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;
    const statusFilter = filters?.status;

    // Get scheduled posts
    let scheduledQuery = `
      SELECT
        id, content_id, profile_id, scheduled_at, original_scheduled_at, status, queue_position, created_at, updated_at
      FROM scheduled_posts
      WHERE profile_id = ?
    `;

    if (statusFilter) {
      scheduledQuery += ` AND status = '${statusFilter}'`;
    }

    scheduledQuery += ` ORDER BY scheduled_at ASC LIMIT ? OFFSET ?`;

    const scheduledStmt = this.db.prepare(scheduledQuery);
    const scheduled = scheduledStmt.all(profileId, limit, offset) as ScheduledPostRow[];

    // Get pending posts (draft status content)
    let pendingQuery = `
      SELECT
        c.id, c.id as content_id, c.profile_id, NULL as scheduled_at, NULL as original_scheduled_at,
        c.status, NULL as queue_position, c.created_at, c.updated_at
      FROM content c
      WHERE c.profile_id = ? AND c.status = 'draft'
    `;

    if (statusFilter && statusFilter !== 'draft') {
      pendingQuery = `SELECT 1 WHERE 0`; // Return empty if filtering for non-draft
    }

    const pendingStmt = this.db.prepare(pendingQuery);
    const pending = pendingStmt.all(profileId) as ScheduledPostRow[];

    const items = [...scheduled, ...pending];

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as cnt FROM (
        SELECT id FROM scheduled_posts WHERE profile_id = ?
        UNION ALL
        SELECT id FROM content WHERE profile_id = ? AND status = 'draft'
      )
    `;

    const countStmt = this.db.prepare(countQuery);
    const countResult = countStmt.get(profileId, profileId) as CountResult | undefined;
    const total = countResult?.cnt || 0;

    return {
      items,
      total,
      has_more: offset + limit < total,
    };
  }

  /**
   * AC 5: Update scheduled date/time
   */
  updateSchedule(
    contentId: string,
    profileId: string,
    payload: UpdateSchedulePayload
  ): ScheduledPost {
    const currentSchedule = this.getScheduleByContentId(contentId, profileId);
    if (!currentSchedule) {
      throw new Error('Schedule not found');
    }

    if (!payload.scheduled_at) {
      throw new Error('scheduled_at is required');
    }

    // Validate new date
    this.validateScheduleDate(payload.scheduled_at);

    const now = new Date().toISOString();

    const updateStmt = this.db.prepare(`
      UPDATE scheduled_posts
      SET scheduled_at = ?, updated_at = ?
      WHERE id = ?
    `);

    updateStmt.run(payload.scheduled_at, now, currentSchedule.id);

    // Update content scheduled_at field
    const updateContentStmt = this.db.prepare(`
      UPDATE content SET scheduled_at = ?, updated_at = ? WHERE id = ?
    `);
    updateContentStmt.run(payload.scheduled_at, now, contentId);

    // Log audit
    this.logAudit(
      currentSchedule.id,
      contentId,
      profileId,
      'update',
      currentSchedule.scheduled_at,
      payload.scheduled_at,
      null
    );

    return this.getScheduleById(currentSchedule.id) as ScheduledPost;
  }

  /**
   * AC 6: Cancel schedule
   */
  cancelSchedule(contentId: string, profileId: string): void {
    const schedule = this.getScheduleByContentId(contentId, profileId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const now = new Date().toISOString();

    // Log audit BEFORE deletion (to avoid FK constraint)
    this.logAudit(schedule.id, contentId, profileId, 'delete', schedule.scheduled_at, null, null);

    // Delete schedule
    const deleteStmt = this.db.prepare(`
      DELETE FROM scheduled_posts WHERE id = ?
    `);
    deleteStmt.run(schedule.id);

    // Reset content status to draft
    const updateContentStmt = this.db.prepare(`
      UPDATE content SET status = ?, scheduled_at = NULL, updated_at = ? WHERE id = ?
    `);
    updateContentStmt.run('draft', now, contentId);
  }

  /**
   * Get schedule by ID
   */
  private getScheduleById(scheduleId: string): ScheduledPost | null {
    const stmt = this.db.prepare(`
      SELECT
        id, content_id, profile_id, scheduled_at, original_scheduled_at, status, queue_position, created_at, updated_at
      FROM scheduled_posts
      WHERE id = ?
    `);

    const row = stmt.get(scheduleId) as ScheduledPostRow | undefined;
    return row ? this.rowToScheduledPost(row) : null;
  }

  /**
   * Get schedule by content ID
   */
  private getScheduleByContentId(contentId: string, profileId: string): ScheduledPost | null {
    const stmt = this.db.prepare(`
      SELECT
        id, content_id, profile_id, scheduled_at, original_scheduled_at, status, queue_position, created_at, updated_at
      FROM scheduled_posts
      WHERE content_id = ? AND profile_id = ?
    `);

    const row = stmt.get(contentId, profileId) as ScheduledPostRow | undefined;
    return row ? this.rowToScheduledPost(row) : null;
  }

  /**
   * Validate schedule date (not in past, valid ISO8601 format)
   */
  private validateScheduleDate(scheduledAt: string): void {
    // Validate ISO8601 format
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d{3})?Z?$/;
    if (!isoRegex.test(scheduledAt)) {
      throw new Error('invalid_format: scheduled_at must be valid ISO8601 format');
    }

    const scheduledDate = new Date(scheduledAt);
    const now = new Date();

    if (isNaN(scheduledDate.getTime())) {
      throw new Error('invalid_format: scheduled_at is not a valid date');
    }

    if (scheduledDate <= now) {
      throw new Error('past_date: scheduled_at cannot be in the past');
    }
  }

  /**
   * Log audit trail for schedule changes
   */
  private logAudit(
    scheduleId: string,
    contentId: string,
    profileId: string,
    action: string,
    oldValue: string | null,
    newValue: string | null,
    changedBy: string | null
  ): void {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO schedule_audit (
        id, scheduled_post_id, content_id, profile_id, action, old_value, new_value, changed_by, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, scheduleId, contentId, profileId, action, oldValue, newValue, changedBy, new Date().toISOString());
  }

  /**
   * Convert database row to ScheduledPost object
   */
  private rowToScheduledPost(row: ScheduledPostRow): ScheduledPost {
    return {
      id: row.id,
      content_id: row.content_id,
      profile_id: row.profile_id,
      scheduled_at: row.scheduled_at,
      original_scheduled_at: row.original_scheduled_at,
      status: row.status,
      queue_position: row.queue_position,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }
}
