import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import { Profile, ProfileData } from '../models/Profile.js';
import { decryptJSON } from '../utils/encryption.js';
import { retryWithBackoff } from '../utils/retry.js';

/**
 * Current profile metrics snapshot
 */
export interface Metrics {
  id: string;
  profile_id: string;
  followers_count: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
  collected_at: string;
}

/**
 * Per-post engagement metrics
 */
export interface PostMetrics {
  id: string;
  content_id: string;
  profile_id: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  collected_at: string;
}

/**
 * Historical comparison data
 */
export interface HistoricalMetrics {
  date: string;
  followers: number;
  engagement_rate: number;
  reach: number;
  impressions: number;
}

/**
 * Analytics service — metrics collection and retrieval with caching and retry logic
 */
export class AnalyticsService {
  private db: Database.Database;
  private profileModel: Profile;
  private pythonBaseUrl: string;
  private encryptionKey: string;
  private readonly CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

  constructor(
    db: Database.Database,
    pythonServiceUrl?: string,
    encryptionKey?: string
  ) {
    this.db = db;
    this.profileModel = new Profile(db);
    this.pythonBaseUrl = pythonServiceUrl || process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY || '';

    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
  }

  /**
   * Get current profile metrics
   */
  async getProfileMetrics(profileId: string, userId: string): Promise<Metrics | null> {
    // Ownership check
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      return null;
    }

    const stmt = this.db.prepare(`
      SELECT * FROM metrics
      WHERE profile_id = ?
      ORDER BY collected_at DESC
      LIMIT 1
    `);

    return (stmt.get(profileId) as Metrics) || null;
  }

  /**
   * Get per-post engagement metrics
   */
  async getPostMetrics(
    profileId: string,
    postId: string,
    userId: string
  ): Promise<PostMetrics | null> {
    // Ownership check
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      return null;
    }

    const stmt = this.db.prepare(`
      SELECT * FROM post_metrics
      WHERE content_id = ? AND profile_id = ?
      ORDER BY collected_at DESC
      LIMIT 1
    `);

    return (stmt.get(postId, profileId) as PostMetrics) || null;
  }

  /**
   * Get engagement rate over a period (days)
   */
  async getEngagementRate(profileId: string, userId: string, days: number = 7): Promise<number> {
    // Ownership check
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const stmt = this.db.prepare(`
      SELECT AVG(engagement_rate) as avg_engagement
      FROM metrics
      WHERE profile_id = ? AND collected_at >= ?
    `);

    const result = stmt.get(profileId, daysAgo) as { avg_engagement: number | null } | undefined;
    return result?.avg_engagement || 0;
  }

  /**
   * Get historical metrics (for charting)
   */
  async getMetricsHistory(
    profileId: string,
    userId: string,
    days: number = 30
  ): Promise<HistoricalMetrics[]> {
    // Ownership check
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const stmt = this.db.prepare(`
      SELECT
        DATE(collected_at) as date,
        followers_count as followers,
        engagement_rate,
        reach,
        impressions
      FROM metrics
      WHERE profile_id = ? AND collected_at >= ?
      ORDER BY collected_at ASC
    `);

    return (stmt.all(profileId, daysAgo) as HistoricalMetrics[]) || [];
  }

  /**
   * Get last 30 posts with engagement metrics
   */
  async getRecentPosts(
    profileId: string,
    userId: string,
    limit: number = 30
  ): Promise<Array<{
    id: string;
    content_id: string;
    timestamp: string;
    media_type: string;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    reach: number;
    engagement_rate: number;
  }>> {
    // Ownership check
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const stmt = this.db.prepare(`
      SELECT
        pm.id,
        pm.content_id,
        pm.collected_at as timestamp,
        COALESCE(c.media_type, 'unknown') as media_type,
        pm.likes,
        pm.comments,
        pm.shares,
        pm.saves,
        pm.reach,
        CASE
          WHEN (pm.likes + pm.comments + pm.shares) > 0
          THEN ROUND(((pm.likes + pm.comments + pm.shares) * 100.0 / pm.reach), 2)
          ELSE 0
        END as engagement_rate
      FROM post_metrics pm
      LEFT JOIN content c ON pm.content_id = c.id
      WHERE pm.profile_id = ?
      ORDER BY pm.collected_at DESC
      LIMIT ?
    `);

    return (stmt.all(profileId, limit) as Array<{
      id: string;
      content_id: string;
      timestamp: string;
      media_type: string;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      reach: number;
      engagement_rate: number;
    }>) || [];
  }

  /**
   * Get current profile metrics with 1-hour cache
   * Returns cached metrics if available and fresh, otherwise fetches new ones
   */
  async getProfileMetricsWithCache(profileId: string, userId: string): Promise<Metrics | null> {
    // Check ownership first
    const profile = this.getProfileWithOwnershipCheck(profileId, userId);
    if (!profile) {
      return null;
    }

    // Check if we have fresh cached metrics (less than 1 hour old)
    const stmt = this.db.prepare(`
      SELECT * FROM metrics
      WHERE profile_id = ?
      ORDER BY collected_at DESC
      LIMIT 1
    `);
    const cachedMetrics = (stmt.get(profileId) as Metrics) || null;

    if (cachedMetrics) {
      const collectedTime = new Date(cachedMetrics.collected_at).getTime();
      const now = Date.now();
      const ageMs = now - collectedTime;

      if (ageMs < this.CACHE_TTL_MS) {
        console.log(`[AnalyticsService] Using cached metrics for profile ${profileId} (age: ${Math.round(ageMs / 1000)}s)`);
        return cachedMetrics;
      }
    }

    // Cache miss or expired - trigger collection with retry
    await this.collectMetricsForProfile(profileId);

    // Fetch and return fresh metrics
    return (stmt.get(profileId) as Metrics) || null;
  }

  /**
   * Collect metrics from Instagrapi Python service (called by scheduler or cache miss)
   * Includes retry logic with exponential backoff for rate limiting
   */
  async collectMetricsForProfile(profileId: string): Promise<void> {
    const profile = this.profileModel.getById(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    try {
      // Execute with retry logic (3 attempts with exponential backoff)
      await retryWithBackoff(
        async () => {
          // 1. Get decrypted session from insta_sessions
          const sessionStmt = this.db.prepare(`
            SELECT session_data FROM insta_sessions
            WHERE profile_id = ?
            ORDER BY created_at DESC
            LIMIT 1
          `);
          const sessionRow = sessionStmt.get(profileId) as { session_data: string } | undefined;

          if (!sessionRow) {
            throw new Error(`No Instagram session found for profile ${profileId}`);
          }

          let sessionData: Record<string, unknown>;
          try {
            sessionData = decryptJSON<Record<string, unknown>>(sessionRow.session_data, this.encryptionKey);
          } catch (error) {
            throw new Error(`Failed to decrypt session: ${String(error)}`);
          }

          // 2. Call Python service to get current metrics
          const metricsData = await this.callPython<{
            followers_count: number;
            engagement_rate: number;
            reach: number;
            impressions: number;
          }>('/metrics', {
            session_data: sessionData,
          });

          // 3. Store metrics in database
          const metricsId = randomUUID();
          const now = new Date().toISOString();

          const insertStmt = this.db.prepare(`
            INSERT INTO metrics (id, profile_id, followers_count, engagement_rate, reach, impressions, collected_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `);

          insertStmt.run(
            metricsId,
            profileId,
            metricsData.followers_count,
            metricsData.engagement_rate,
            metricsData.reach,
            metricsData.impressions,
            now,
            now
          );

          // 4. Also update followers_count in profiles table
          const updateStmt = this.db.prepare('UPDATE profiles SET followers_count = ?, updated_at = ? WHERE id = ?');
          updateStmt.run(metricsData.followers_count, now, profileId);

          console.log(`[AnalyticsService] Metrics collected for profile ${profile.instagram_username}: followers=${metricsData.followers_count}, engagement=${metricsData.engagement_rate}%`);
        },
        {
          maxAttempts: 3,
          onRetry: (attempt, error) => {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.warn(`[AnalyticsService] Retry attempt ${attempt} for profile ${profileId}: ${errorMsg}`);
          },
        }
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[AnalyticsService] Failed to collect metrics for profile ${profileId}: ${errorMsg}`);
      throw new Error(`Metrics collection failed: ${errorMsg}`);
    }
  }

  /**
   * Batch collect metrics for all connected profiles
   * Called by scheduler
   */
  async collectMetricsForAllProfiles(): Promise<{ success: number; failed: number }> {
    const stmt = this.db.prepare('SELECT id FROM profiles');
    const profiles = (stmt.all() as Array<{ id: string }>) || [];

    let success = 0;
    let failed = 0;

    for (const { id: profileId } of profiles) {
      try {
        await this.collectMetricsForProfile(profileId);
        success++;
      } catch (error) {
        failed++;
        console.error(`[AnalyticsService] Batch collection failed for profile ${profileId}:`, error);
      }
    }

    console.log(`[AnalyticsService] Batch metrics collection: ${success} succeeded, ${failed} failed`);
    return { success, failed };
  }

  /**
   * Verify profile ownership
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
   * Internal: call Python Flask service
   */
  private async callPython<T>(endpoint: string, body: unknown): Promise<T> {
    const url = `${this.pythonBaseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' })) as Record<string, unknown>;
        throw new Error(
          `Python service error: ${errorData.error || `HTTP ${response.status}`}`
        );
      }

      return (await response.json()) as T;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to call analytics service: ${errorMsg}`);
    }
  }
}

// Helper function for DI
export function createAnalyticsService(
  db: Database.Database,
  pythonServiceUrl?: string,
  encryptionKey?: string
): AnalyticsService {
  return new AnalyticsService(db, pythonServiceUrl, encryptionKey);
}
