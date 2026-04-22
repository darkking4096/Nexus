import { randomUUID } from 'crypto';
import type { DatabaseAdapter } from '../config/database';

export interface ProfileData {
  id: string;
  user_id: string;
  instagram_username: string;
  instagram_id: string | null;
  access_token: string;
  refresh_token: string | null;
  token_expires_at: string | null;
  display_name: string | null;
  bio: string | null;
  profile_picture_url: string | null;
  followers_count: number;
  context_voice: string | null;
  context_tone: string | null;
  context_audience: string | null;
  context_goals: string | null;
  autopilot_enabled: boolean;
  autopilot_schedule: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileCreateInput {
  user_id: string;
  instagram_username: string;
  access_token: string;
  instagram_id?: string;
  refresh_token?: string;
  bio?: string;
  profile_picture_url?: string;
}

export class Profile {
  constructor(private db: DatabaseAdapter) {}

  /**
   * Create new profile (Instagram account connection)
   */
  async create(input: ProfileCreateInput): Promise<ProfileData> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await this.db.query(
      `INSERT INTO profiles (
        id, user_id, instagram_username, instagram_id,
        access_token, refresh_token, bio, profile_picture_url,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        id,
        input.user_id,
        input.instagram_username,
        input.instagram_id || null,
        input.access_token,
        input.refresh_token || null,
        input.bio || null,
        input.profile_picture_url || null,
        now,
        now
      ]
    );

    const result = await this.getById(id);
    if (!result) throw new Error('Failed to create profile');
    return result;
  }

  /**
   * Get profile by ID
   */
  async getById(id: string): Promise<ProfileData | null> {
    const rows = await this.db.query(
      `SELECT * FROM profiles WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.formatRow(rows[0]) : null;
  }

  /**
   * Get all profiles for a user
   */
  async getByUserId(userId: string): Promise<ProfileData[]> {
    const rows = await this.db.query(
      `SELECT * FROM profiles WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Get profile by Instagram username
   */
  async getByInstagramUsername(username: string): Promise<ProfileData | null> {
    const rows = await this.db.query(
      `SELECT * FROM profiles WHERE instagram_username = $1`,
      [username]
    );
    return rows.length > 0 ? this.formatRow(rows[0]) : null;
  }

  /**
   * Update profile
   */
  async update(id: string, updates: Partial<Omit<ProfileCreateInput, 'user_id'>>): Promise<ProfileData | null> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.instagram_username !== undefined) {
      fields.push(`instagram_username = $${paramIndex++}`);
      values.push(updates.instagram_username);
    }
    if (updates.access_token !== undefined) {
      fields.push(`access_token = $${paramIndex++}`);
      values.push(updates.access_token);
    }
    if (updates.refresh_token !== undefined) {
      fields.push(`refresh_token = $${paramIndex++}`);
      values.push(updates.refresh_token);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(updates.bio || null);
    }
    if (updates.profile_picture_url !== undefined) {
      fields.push(`profile_picture_url = $${paramIndex++}`);
      values.push(updates.profile_picture_url || null);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    const sql = `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.query(sql, values);

    return this.getById(id);
  }

  /**
   * Update context (voice, tone, audience, goals)
   */
  async updateContext(
    id: string,
    context: Partial<{
      voice: string | null;
      tone: string | null;
      audience: string | null;
      goals: string | null;
    }>
  ): Promise<ProfileData | null> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (context.voice !== undefined) {
      fields.push(`context_voice = $${paramIndex++}`);
      values.push(context.voice || null);
    }
    if (context.tone !== undefined) {
      fields.push(`context_tone = $${paramIndex++}`);
      values.push(context.tone || null);
    }
    if (context.audience !== undefined) {
      fields.push(`context_audience = $${paramIndex++}`);
      values.push(context.audience || null);
    }
    if (context.goals !== undefined) {
      fields.push(`context_goals = $${paramIndex++}`);
      values.push(context.goals || null);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    const sql = `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.query(sql, values);

    return this.getById(id);
  }

  /**
   * Update profile display_name and bio
   */
  async updateProfile(
    id: string,
    updates: Partial<{ display_name: string; bio: string }>
  ): Promise<ProfileData | null> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    if (updates.display_name !== undefined) {
      fields.push(`display_name = $${paramIndex++}`);
      values.push(updates.display_name || null);
    }
    if (updates.bio !== undefined) {
      fields.push(`bio = $${paramIndex++}`);
      values.push(updates.bio || null);
    }

    if (fields.length === 0) {
      return this.getById(id);
    }

    fields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    const sql = `UPDATE profiles SET ${fields.join(', ')} WHERE id = $${paramIndex}`;
    await this.db.query(sql, values);

    return this.getById(id);
  }

  /**
   * Delete profile
   */
  async deleteProfile(id: string): Promise<boolean> {
    const results = await this.db.query(
      `DELETE FROM profiles WHERE id = $1 RETURNING id`,
      [id]
    );
    return results.length > 0;
  }

  /**
   * Format database row to ProfileData
   */
  private formatRow(row: unknown): ProfileData | null {
    if (!row) return null;
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      user_id: r.user_id as string,
      instagram_username: r.instagram_username as string,
      instagram_id: (r.instagram_id as string) || null,
      access_token: r.access_token as string,
      refresh_token: (r.refresh_token as string) || null,
      token_expires_at: (r.token_expires_at as string) || null,
      display_name: (r.display_name as string) || null,
      bio: (r.bio as string) || null,
      profile_picture_url: (r.profile_picture_url as string) || null,
      followers_count: (r.followers_count as number) || 0,
      context_voice: (r.context_voice as string) || null,
      context_tone: (r.context_tone as string) || null,
      context_audience: (r.context_audience as string) || null,
      context_goals: (r.context_goals as string) || null,
      autopilot_enabled: Boolean(r.autopilot_enabled),
      autopilot_schedule: (r.autopilot_schedule as string) || null,
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}
