import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface QueueItem {
  id: string;
  content_id: string;
  profile_id: string;
  scheduled_at: string | null;
  status: string;
  queue_position: number;
  created_at: string;
  updated_at: string;
}

export interface QueueResponse {
  items: QueueItem[];
  total: number;
  has_more: boolean;
  current_page: number;
}

/**
 * QueueService
 * Manages content queue: read, reorder, delete operations
 * AC 1-5: View, reorder, delete, filter, paginate queue
 */
export class QueueService {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  /**
   * AC 1: Get unified queue (scheduled + pending)
   */
  getQueue(
    profileId: string,
    filters?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): QueueResponse {
    const limit = filters?.limit || 20;
    const page = filters?.page || 1;
    const offset = (page - 1) * limit;
    const statusFilter = filters?.status;

    let dataQuery = '';
    const params: any[] = [];

    // Apply status filter
    if (statusFilter === 'pending') {
      dataQuery = `
        SELECT
          c.id,
          c.id as content_id,
          c.profile_id,
          NULL as scheduled_at,
          c.status,
          NULL as queue_position,
          c.created_at,
          c.updated_at
        FROM content c
        WHERE c.profile_id = ? AND c.status = 'draft'
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `;
      params.push(profileId, limit, offset);
    } else if (statusFilter === 'scheduled') {
      dataQuery = `
        SELECT
          sp.id,
          sp.content_id,
          sp.profile_id,
          sp.scheduled_at,
          sp.status,
          sp.queue_position,
          sp.created_at,
          sp.updated_at
        FROM scheduled_posts sp
        WHERE sp.profile_id = ?
        ORDER BY sp.scheduled_at ASC
        LIMIT ? OFFSET ?
      `;
      params.push(profileId, limit, offset);
    } else {
      // Unified query - both scheduled and pending
      dataQuery = `
        SELECT
          sp.id,
          sp.content_id,
          sp.profile_id,
          sp.scheduled_at,
          sp.status,
          sp.queue_position,
          sp.created_at,
          sp.updated_at
        FROM scheduled_posts sp
        WHERE sp.profile_id = ?
        UNION ALL
        SELECT
          c.id,
          c.id as content_id,
          c.profile_id,
          NULL as scheduled_at,
          c.status,
          NULL as queue_position,
          c.created_at,
          c.updated_at
        FROM content c
        WHERE c.profile_id = ? AND c.status = 'draft'
        ORDER BY scheduled_at ASC, created_at ASC
        LIMIT ? OFFSET ?
      `;
      params.push(profileId, profileId, limit, offset);
    }

    const stmt = this.db.prepare(dataQuery);
    const items = stmt.all(...params) as QueueItem[];

    // Count total
    let countQuery = '';
    const countParams: any[] = [];

    if (statusFilter === 'pending') {
      countQuery = 'SELECT COUNT(*) as total FROM content WHERE profile_id = ? AND status = ?';
      countParams.push(profileId, 'draft');
    } else if (statusFilter === 'scheduled') {
      countQuery = 'SELECT COUNT(*) as total FROM scheduled_posts WHERE profile_id = ?';
      countParams.push(profileId);
    } else {
      countQuery = `
        SELECT COUNT(*) as total FROM (
          SELECT id FROM scheduled_posts WHERE profile_id = ?
          UNION ALL
          SELECT id FROM content WHERE profile_id = ? AND status = 'draft'
        )
      `;
      countParams.push(profileId, profileId);
    }

    const countStmt = this.db.prepare(countQuery);
    const countResult = countStmt.get(...countParams) as any;
    const total = countResult?.total || 0;

    return {
      items,
      total,
      has_more: offset + limit < total,
      current_page: page,
    };
  }

  /**
   * AC 2: Reorder queue items (change queue position)
   */
  reorderQueue(profileId: string, reorders: Array<{ content_id: string; new_position: number }>): QueueItem[] {
    const updated: QueueItem[] = [];

    const transaction = this.db.transaction(() => {
      for (const reorder of reorders) {
        const { content_id, new_position } = reorder;

        // Get current scheduled post
        const getStmt = this.db.prepare(`
          SELECT id FROM scheduled_posts WHERE content_id = ? AND profile_id = ?
        `);
        const scheduled = getStmt.get(content_id, profileId) as any;

        if (scheduled) {
          const now = new Date().toISOString();

          // Update queue position
          const updateStmt = this.db.prepare(`
            UPDATE scheduled_posts SET queue_position = ?, updated_at = ? WHERE id = ?
          `);
          updateStmt.run(new_position, now, scheduled.id);

          // Log audit
          this.logReorderAudit(scheduled.id, content_id, profileId, new_position);

          // Fetch updated item
          const updatedStmt = this.db.prepare(`
            SELECT * FROM scheduled_posts WHERE id = ?
          `);
          const updatedRow = updatedStmt.get(scheduled.id) as QueueItem;
          updated.push(updatedRow);
        }
      }
    });

    transaction();

    return updated;
  }

  /**
   * AC 3: Delete post from queue
   */
  deleteFromQueue(contentId: string, profileId: string): void {
    // Verify content exists
    const contentStmt = this.db.prepare(`
      SELECT id FROM content WHERE id = ? AND profile_id = ?
    `);
    const content = contentStmt.get(contentId, profileId);
    if (!content) {
      throw new Error('Content not found');
    }

    const now = new Date().toISOString();

    // Check if scheduled
    const scheduledStmt = this.db.prepare(`
      SELECT id FROM scheduled_posts WHERE content_id = ? AND profile_id = ?
    `);
    const scheduled = scheduledStmt.get(contentId, profileId) as any;

    if (scheduled) {
      // Delete from scheduled_posts
      const deleteStmt = this.db.prepare(`
        DELETE FROM scheduled_posts WHERE id = ?
      `);
      deleteStmt.run(scheduled.id);
    }

    // Reset content status to draft
    const updateStmt = this.db.prepare(`
      UPDATE content SET status = ?, scheduled_at = NULL, updated_at = ? WHERE id = ?
    `);
    updateStmt.run('draft', now, contentId);
  }

  /**
   * AC 4: Filter queue by status
   */
  filterByStatus(profileId: string, status: string, limit: number = 20, offset: number = 0): {
    items: QueueItem[];
    total: number;
  } {
    if (status === 'scheduled') {
      const stmt = this.db.prepare(`
        SELECT * FROM scheduled_posts WHERE profile_id = ? AND status = 'scheduled'
        ORDER BY scheduled_at ASC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(profileId, limit, offset) as QueueItem[];

      const countStmt = this.db.prepare(`
        SELECT COUNT(*) as cnt FROM scheduled_posts WHERE profile_id = ? AND status = 'scheduled'
      `);
      const countResult = countStmt.get(profileId) as any;

      return {
        items,
        total: countResult?.cnt || 0,
      };
    } else if (status === 'pending') {
      const stmt = this.db.prepare(`
        SELECT
          c.id,
          c.id as content_id,
          c.profile_id,
          NULL as scheduled_at,
          c.status,
          NULL as queue_position,
          c.created_at,
          c.updated_at
        FROM content c
        WHERE c.profile_id = ? AND c.status = 'draft'
        ORDER BY c.created_at ASC
        LIMIT ? OFFSET ?
      `);

      const items = stmt.all(profileId, limit, offset) as QueueItem[];

      const countStmt = this.db.prepare(`
        SELECT COUNT(*) as cnt FROM content WHERE profile_id = ? AND status = 'draft'
      `);
      const countResult = countStmt.get(profileId) as any;

      return {
        items,
        total: countResult?.cnt || 0,
      };
    } else {
      throw new Error('Invalid status filter');
    }
  }

  /**
   * Log reorder action to audit trail
   */
  private logReorderAudit(scheduleId: string, contentId: string, profileId: string, newPosition: number): void {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO schedule_audit (
        id, scheduled_post_id, content_id, profile_id, action, old_value, new_value, timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, scheduleId, contentId, profileId, 'reorder', null, newPosition.toString(), new Date().toISOString());
  }
}
