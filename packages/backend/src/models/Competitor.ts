import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

export interface CompetitorData {
  id: string;
  profile_id: string;
  instagram_username: string;
  followers_count: number | null;
  top_posts_data: string | null;
  last_updated: string | null;
  created_at: string;
}

export interface CompetitorCreateInput {
  profile_id: string;
  instagram_username: string;
  followers_count?: number;
  top_posts_data?: string;
}

export class Competitor {
  constructor(private db: Database.Database) {}

  /**
   * Create new competitor
   */
  create(input: CompetitorCreateInput): CompetitorData {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO competitors (
        id, profile_id, instagram_username, followers_count, top_posts_data, created_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.profile_id,
      input.instagram_username,
      input.followers_count || null,
      input.top_posts_data || null,
      now
    );

    return this.getById(id)!;
  }

  /**
   * Get competitor by ID
   */
  getById(id: string): CompetitorData | null {
    const stmt = this.db.prepare(`
      SELECT * FROM competitors WHERE id = ?
    `);

    const row = stmt.get(id);
    return this.formatRow(row);
  }

  /**
   * Get all competitors for a profile
   */
  getByProfileId(profileId: string): CompetitorData[] {
    const stmt = this.db.prepare(`
      SELECT * FROM competitors WHERE profile_id = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(profileId);
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Check if competitor already exists for profile
   */
  existsByUsername(profileId: string, username: string): boolean {
    const stmt = this.db.prepare(`
      SELECT COUNT(*) as count FROM competitors
      WHERE profile_id = ? AND instagram_username = ?
    `);

    const result = stmt.get(profileId, username) as { count: number };
    return result.count > 0;
  }

  /**
   * Update competitor
   */
  update(id: string, updates: Partial<CompetitorCreateInput>): CompetitorData | null {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (updates.instagram_username !== undefined) {
      fields.push('instagram_username = ?');
      values.push(updates.instagram_username);
    }
    if (updates.followers_count !== undefined) {
      fields.push('followers_count = ?');
      values.push(updates.followers_count || null);
    }
    if (updates.top_posts_data !== undefined) {
      fields.push('top_posts_data = ?');
      values.push(updates.top_posts_data || null);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push('last_updated = ?');
    values.push(now);
    values.push(id);

    const sql = `UPDATE competitors SET ${fields.join(', ')} WHERE id = ?`;
    const stmt = this.db.prepare(sql);
    stmt.run(...values);

    return this.getById(id);
  }

  /**
   * Delete competitor
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM competitors WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Delete all competitors for a profile
   */
  deleteByProfileId(profileId: string): number {
    const stmt = this.db.prepare(`DELETE FROM competitors WHERE profile_id = ?`);
    const result = stmt.run(profileId);
    return result.changes;
  }

  /**
   * Format database row to CompetitorData
   */
  private formatRow(row: unknown): CompetitorData | null {
    if (!row) return null;
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      profile_id: r.profile_id as string,
      instagram_username: r.instagram_username as string,
      followers_count: (r.followers_count as number) || null,
      top_posts_data: (r.top_posts_data as string) || null,
      last_updated: (r.last_updated as string) || null,
      created_at: r.created_at as string,
    };
  }
}
