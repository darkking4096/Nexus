import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';

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
  constructor(private db: Database.Database) {}

  /**
   * Create new asset
   */
  create(input: ProfileAssetCreateInput): ProfileAssetData {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO profile_assets (
        id, profile_id, asset_type, file_path, file_name,
        file_size, mime_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      input.profile_id,
      input.asset_type,
      input.file_path,
      input.file_name,
      input.file_size,
      input.mime_type,
      now
    );

    return this.getById(id)!;
  }

  /**
   * Get asset by ID
   */
  getById(id: string): ProfileAssetData | null {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_assets WHERE id = ?
    `);

    const row = stmt.get(id);
    return this.formatRow(row);
  }

  /**
   * Get all assets for a profile
   */
  getByProfileId(profileId: string): ProfileAssetData[] {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_assets WHERE profile_id = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(profileId);
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Get assets by type
   */
  getByProfileIdAndType(profileId: string, assetType: string): ProfileAssetData[] {
    const stmt = this.db.prepare(`
      SELECT * FROM profile_assets WHERE profile_id = ? AND asset_type = ? ORDER BY created_at DESC
    `);

    const rows = stmt.all(profileId, assetType);
    return rows.map((row) => this.formatRow(row)!);
  }

  /**
   * Delete asset
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM profile_assets WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Delete all assets for a profile
   */
  deleteByProfileId(profileId: string): number {
    const stmt = this.db.prepare(`DELETE FROM profile_assets WHERE profile_id = ?`);
    const result = stmt.run(profileId);
    return result.changes;
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
