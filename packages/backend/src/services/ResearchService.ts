import type { DatabaseAdapter } from '../config/database';
import { Profile, ProfileData } from '../models/Profile.js';
import { ResearchSquad, ResearchResult } from './ResearchSquad.js';

/**
 * Content data for research analysis
 */
export interface ContentRow extends Record<string, unknown> {
  id: string;
  profile_id: string;
  caption: string;
  hashtags: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  // Add engagement metrics as you collect them
}

/**
 * Research service — ownership & DB layer
 * Orchestrates ResearchSquad with safety checks
 */
export class ResearchService {
  private db: DatabaseAdapter;
  private profileModel: Profile;
  private researchSquad: ResearchSquad;

  constructor(db: DatabaseAdapter, squadsDir?: string) {
    this.db = db;
    this.profileModel = new Profile(db);
    this.researchSquad = new ResearchSquad(squadsDir);
  }

  /**
   * Run research for a profile (with ownership validation)
   *
   * @param profileId Profile to research
   * @param userId User ID (for ownership check)
   * @returns Complete research result
   * @throws Error if profile not found, access denied, or research fails
   */
  async runResearch(profileId: string, userId: string): Promise<ResearchResult> {
    // 1. Get profile and verify ownership
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    // 2. Get content history for analysis
    const contentHistory = this.getContentHistory(profileId);

    // 3. Run research squad
    try {
      const result = await this.researchSquad.runResearch(profile, contentHistory);
      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Research pipeline failed: ${msg}`);
    }
  }

  /**
   * Get profile with ownership check
   */
  private getProfileWithOwnershipCheck(profileId: string, userId: string): ProfileData | null {
    const profile = this.profileModel.getById(profileId);

    if (!profile) {
      return null;
    }

    if (profile.user_id !== userId) {
      throw new Error('Access denied: profile belongs to another user');
    }

    return profile;
  }

  /**
   * Get content history for a profile
   * Returns recent published posts for analysis
   */
  private getContentHistory(profileId: string): ContentRow[] {
    const stmt = this.db.prepare(`
      SELECT id, profile_id, caption, hashtags, status, published_at, created_at
      FROM content
      WHERE profile_id = ? AND status = 'published'
      ORDER BY published_at DESC
      LIMIT 100
    `);

    const rows = stmt.all(profileId) as ContentRow[];
    return rows;
  }
}

// Helper function to create service with proper DI
export function createResearchService(db: DatabaseAdapter, squadsDir?: string): ResearchService {
  return new ResearchService(db, squadsDir);
}
