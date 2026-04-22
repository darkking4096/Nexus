import { randomUUID } from 'crypto';
import type { DatabaseAdapter } from '../config/database';

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
  constructor(private db: DatabaseAdapter) {}

  /**
   * Create new competitor
   */
  async create(input: CompetitorCreateInput): Promise<CompetitorData> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await this.db.query(
      `INSERT INTO competitors (
        id, profile_id, instagram_username, followers_count, top_posts_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        id,
        input.profile_id,
        input.instagram_username,
        input.followers_count || null,
        input.top_posts_data || null,
        now
      ]
    );

    const result = await this.getById(id);
    if (!result) throw new Error('Failed to create competitor');
    return result;
  }

  /**
   * Get competitor by ID
   */
  async getById(id: string): Promise<CompetitorData | null> {
    const rows = await this.db.query(
      `SELECT * FROM competitors WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.formatRow(rows[0]) : null;
  }

  /**
   * Get all competitors for a profile
   */
  async getByProfileId(profileId: string): Promise<CompetitorData[]> {
    const rows = await this.db.query(
      `SELECT * FROM competitors WHERE profile_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Check if competitor already exists for profile
   */
  async existsByUsername(profileId: string, username: string): Promise<boolean> {
    const results = await this.db.query(
      `SELECT COUNT(*) as count FROM competitors
       WHERE profile_id = $1 AND instagram_username = $2`,
      [profileId, username]
    );
    return results.length > 0 && (results[0].count as number) > 0;
  }

  /**
   * Update competitor
   */
  async update(id: string, updates: Partial<CompetitorCreateInput>): Promise<CompetitorData | null> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.instagram_username !== undefined) {
      fields.push(`instagram_username = $${paramIndex++}`);
      values.push(updates.instagram_username);
    }
    if (updates.followers_count !== undefined) {
      fields.push(`followers_count = $${paramIndex++}`);
      values.push(updates.followers_count || null);
    }
    if (updates.top_posts_data !== undefined) {
      fields.push(`top_posts_data = $${paramIndex++}`);
      values.push(updates.top_posts_data || null);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`last_updated = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    const sql = `UPDATE competitors SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.query(sql, values);

    return this.getById(id);
  }

  /**
   * Delete competitor
   */
  async delete(id: string): Promise<boolean> {
    const results = await this.db.query(
      `DELETE FROM competitors WHERE id = $1 RETURNING id`,
      [id]
    );
    return results.length > 0;
  }

  /**
   * Delete all competitors for a profile
   */
  async deleteByProfileId(profileId: string): Promise<number> {
    const results = await this.db.query(
      `DELETE FROM competitors WHERE profile_id = $1 RETURNING id`,
      [profileId]
    );
    return results.length;
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
