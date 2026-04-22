import { randomUUID } from 'crypto';
import type { DatabaseAdapter } from '../config/database';

export interface ProfileAssetData {
  id: string;
  profile_id: string;
  asset_type: 'image' | 'video' | 'document';
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface ProfileAssetCreateInput {
  profile_id: string;
  asset_type: 'image' | 'video' | 'document';
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
}

export class ProfileAsset {
  constructor(private db: DatabaseAdapter) {}

  /**
   * Create new asset
   */
  async create(input: ProfileAssetCreateInput): Promise<ProfileAssetData> {
    const id = randomUUID();
    const now = new Date().toISOString();

    await this.db.query(
      `INSERT INTO profile_assets (
        id, profile_id, asset_type, file_path, file_name,
        file_size, mime_type, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        id,
        input.profile_id,
        input.asset_type,
        input.file_path,
        input.file_name,
        input.file_size,
        input.mime_type,
        now
      ]
    );

    const result = await this.getById(id);
    if (!result) throw new Error('Failed to create profile asset');
    return result;
  }

  /**
   * Get asset by ID
   */
  async getById(id: string): Promise<ProfileAssetData | null> {
    const rows = await this.db.query(
      `SELECT * FROM profile_assets WHERE id = $1`,
      [id]
    );
    return rows.length > 0 ? this.formatRow(rows[0]) : null;
  }

  /**
   * Get all assets for a profile
   */
  async getByProfileId(profileId: string): Promise<ProfileAssetData[]> {
    const rows = await this.db.query(
      `SELECT * FROM profile_assets WHERE profile_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Get assets by type
   */
  async getByProfileIdAndType(profileId: string, assetType: string): Promise<ProfileAssetData[]> {
    const rows = await this.db.query(
      `SELECT * FROM profile_assets WHERE profile_id = $1 AND asset_type = $2 ORDER BY created_at DESC`,
      [profileId, assetType]
    );
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Delete asset
   */
  async delete(id: string): Promise<boolean> {
    const results = await this.db.query(
      `DELETE FROM profile_assets WHERE id = $1 RETURNING id`,
      [id]
    );
    return results.length > 0;
  }

  /**
   * Delete all assets for a profile
   */
  async deleteByProfileId(profileId: string): Promise<number> {
    const results = await this.db.query(
      `DELETE FROM profile_assets WHERE profile_id = $1 RETURNING id`,
      [profileId]
    );
    return results.length;
  }

  /**
   * Format database row to ProfileAssetData
   */
  private formatRow(row: unknown): ProfileAssetData | null {
    if (!row) return null;
    const r = row as Record<string, unknown>;
    return {
      id: r.id as string,
      profile_id: r.profile_id as string,
      asset_type: r.asset_type as 'image' | 'video' | 'document',
      file_path: r.file_path as string,
      file_name: r.file_name as string,
      file_size: r.file_size as number,
      mime_type: r.mime_type as string,
      created_at: r.created_at as string,
    };
  }
}
