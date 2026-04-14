import Database from 'better-sqlite3';

/**
 * Hourly engagement statistics
 */
interface HourlyStats {
  engagement_rate: number;
  sample_size: number;
  variance: number;
}

/**
 * Top hour recommendation
 */
export interface TopHour {
  hour: number;
  average_engagement_rate: number;
  sample_size: number;
}

/**
 * Best publish time recommendation
 */
export interface BestTimeRecommendation {
  recommended_hour: number;
  recommended_time_str: string;
  confidence: number;
  reason: string;
  top_hours: TopHour[];
  lookback_days: number;
}

/**
 * Optimization Service
 * Analyzes historical engagement data to recommend optimal publishing times
 * Implements confidence scoring based on sample size and variance
 * Supports timezone-aware recommendations
 */
export class OptimizationService {
  private db: Database.Database;
  private validTimezones: Set<string>;

  constructor(db: Database.Database) {
    this.db = db;
    // Initialize common timezone list
    // Using common IANA timezone identifiers
    this.validTimezones = new Set([
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'America/Anchorage',
      'Pacific/Honolulu',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Madrid',
      'Europe/Amsterdam',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Hong_Kong',
      'Asia/Singapore',
      'Asia/Bangkok',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Australia/Brisbane',
      'Pacific/Auckland',
    ]);
  }

  /**
   * Get best publish time recommendation for a profile
   * @param profileId Profile ID
   * @param timezone Optional timezone (defaults to profile timezone or UTC)
   * @param lookbackDays Optional lookback period in days (defaults to 30)
   * @returns Recommendation with confidence score or error
   */
  async getBestPublishTime(
    profileId: string,
    timezone?: string,
    lookbackDays: number = 30
  ): Promise<BestTimeRecommendation> {
    // Validate timezone if provided
    if (timezone && !this.isValidTimezone(timezone)) {
      throw new Error(`Invalid timezone format: ${timezone}`);
    }

    // Get profile timezone if not provided
    const userTimezone = timezone || (await this.getProfileTimezone(profileId)) || 'UTC';

    // Query engagement metrics from past N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - lookbackDays);
    const startDateStr = startDate.toISOString();

    const hourlyData = await this.getPostEngagementByHour(profileId, startDateStr);

    // Check if we have sufficient data
    const totalPosts = Array.from(hourlyData.values()).reduce((sum, stats) => sum + stats.sample_size, 0);

    if (totalPosts < 5) {
      throw new Error(
        `Insufficient data for recommendation: Only ${totalPosts} posts found in past ${lookbackDays} days (need at least 5)`
      );
    }

    // Find top 3 hours
    const topHours = this.getTopHours(hourlyData);

    if (topHours.length === 0) {
      throw new Error('No posts found for this profile');
    }

    // Get best hour (top of the list)
    const bestHour = topHours[0];

    // Calculate confidence score for best hour
    const stats = hourlyData.get(bestHour.hour);
    const confidence = stats ? this.calculateConfidence(stats.sample_size, stats.variance) : 0;

    // Format time string
    const timeStr = this.formatTimeString(bestHour.hour, userTimezone);

    return {
      recommended_hour: bestHour.hour,
      recommended_time_str: timeStr,
      confidence: Math.round(confidence),
      reason: `Based on ${stats?.sample_size || 0} posts over ${lookbackDays} days`,
      top_hours: topHours,
      lookback_days: lookbackDays,
    };
  }

  /**
   * Get hourly engagement statistics for a profile
   * Groups posts by publish hour and calculates engagement metrics
   * Variance is calculated in JavaScript since SQLite doesn't support STDDEV_POP
   * @private
   */
  private async getPostEngagementByHour(
    profileId: string,
    startDate: string
  ): Promise<Map<number, HourlyStats>> {
    // SQL query to get all engagement data grouped by hour
    // Variance calculation deferred to JavaScript
    const query = `
      SELECT
        CAST(strftime('%H', c.published_at, 'localtime') AS INTEGER) AS publish_hour,
        m.engagement_rate
      FROM content c
      LEFT JOIN metrics m ON c.profile_id = m.profile_id AND m.collected_at = (
        SELECT MAX(collected_at) FROM metrics
        WHERE profile_id = c.profile_id AND collected_at <= c.published_at
      )
      WHERE c.profile_id = ?
        AND c.status = 'published'
        AND c.published_at >= ?
      ORDER BY publish_hour, c.published_at DESC
    `;

    const stmt = this.db.prepare(query);
    const results = stmt.all(profileId, startDate) as Array<{
      publish_hour: number;
      engagement_rate: number | null;
    }>;

    // Group by hour and calculate statistics
    const hourlyMap = new Map<number, number[]>();

    for (const row of results) {
      if (row.engagement_rate !== null) {
        if (!hourlyMap.has(row.publish_hour)) {
          hourlyMap.set(row.publish_hour, []);
        }
        hourlyMap.get(row.publish_hour)!.push(row.engagement_rate);
      }
    }

    // Calculate variance for each hour
    const hourlyData = new Map<number, HourlyStats>();

    for (const [hour, engagements] of hourlyMap.entries()) {
      if (engagements.length === 0) continue;

      const avgEngagement = engagements.reduce((sum, val) => sum + val, 0) / engagements.length;
      const variance = this.calculateVariance(engagements);

      hourlyData.set(hour, {
        engagement_rate: avgEngagement,
        sample_size: engagements.length,
        variance,
      });
    }

    return hourlyData;
  }

  /**
   * Calculate variance of an array of numbers
   * @private
   */
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;

    return variance;
  }

  /**
   * Calculate confidence score based on sample size and variance
   * Formula: confidence = (min(sampleSize, 10) / 10) * (1 - variance/maxVariance) * 100
   * @private
   */
  private calculateConfidence(sampleSize: number, variance: number): number {
    // Sample size factor: 10+ posts = 100%, <5 posts = 50%
    const sampleSizeFactor = Math.min(sampleSize, 10) / 10;

    // Variance factor: lower variance = higher confidence
    // Normalize variance to 0-1 scale (assuming max engagement_rate variance ~= 100)
    const maxVariance = 100;
    const normalizedVariance = Math.min(variance / maxVariance, 1);
    const varianceFactor = 1 - normalizedVariance;

    const confidence = sampleSizeFactor * varianceFactor * 100;
    return Math.max(confidence, 0); // Ensure non-negative
  }

  /**
   * Get top 3 hours with highest engagement
   * @private
   */
  private getTopHours(hourlyData: Map<number, HourlyStats>): TopHour[] {
    const hours: TopHour[] = Array.from(hourlyData.entries())
      .map(([hour, stats]) => ({
        hour,
        average_engagement_rate: Math.round(stats.engagement_rate * 10) / 10, // Round to 1 decimal
        sample_size: stats.sample_size,
      }))
      .sort((a, b) => b.average_engagement_rate - a.average_engagement_rate)
      .slice(0, 3);

    return hours;
  }

  /**
   * Format hour as time string in user's timezone
   * Example: "8:00 AM PST"
   * @private
   */
  private formatTimeString(hour: number, timezone: string): string {
    try {
      // Create a date at the specified hour in the user's timezone
      const date = new Date();
      date.setHours(hour, 0, 0, 0);

      // Format using locale-specific time format
      const timeStr = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: timezone,
      }).format(date);

      // Get timezone abbreviation
      const tzAbbr = this.getTimezoneAbbreviation(timezone);

      return `${timeStr} ${tzAbbr}`;
    } catch (error) {
      // Fallback to simple format if Intl fails
      const meridiem = hour < 12 ? 'AM' : 'PM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${meridiem}`;
    }
  }

  /**
   * Get timezone abbreviation (e.g., "PST", "UTC")
   * Uses Intl API to determine DST-aware abbreviation
   * @private
   */
  private getTimezoneAbbreviation(timezone: string): string {
    try {
      const date = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
      }).formatToParts(date);

      const tzPart = parts.find(part => part.type === 'timeZoneName');
      return tzPart?.value || 'UTC';
    } catch (error) {
      return timezone.split('/').pop() || 'UTC';
    }
  }

  /**
   * Check if timezone is valid
   * @private
   */
  private isValidTimezone(timezone: string): boolean {
    return this.validTimezones.has(timezone);
  }

  /**
   * Get profile's timezone from database
   * @private
   */
  private async getProfileTimezone(profileId: string): Promise<string | null> {
    try {
      const query = `SELECT timezone FROM profiles WHERE id = ?`;
      const stmt = this.db.prepare(query);
      const result = stmt.get(profileId) as { timezone?: string } | undefined;
      return result?.timezone || null;
    } catch (error) {
      // If timezone column doesn't exist, return null
      return null;
    }
  }
}
