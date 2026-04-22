import type { DatabaseAdapter } from '../config/database';
import { randomUUID } from 'crypto';

/**
 * AutopilotService
 * Handles Autopilot configuration for profiles: CRUD operations, validation, and schedule management
 */

export interface AutopilotConfig {
  id: string;
  profile_id: string;
  enabled: boolean;
  days: string[]; // e.g., ["MON", "WED", "FRI"]
  times: string[]; // e.g., ["09:00", "17:00"]
  frequency: string; // e.g., "6x per week"
  created_at: string;
  updated_at: string;
  last_updated_at: string;
  next_publication_at: string | null;
}

export interface CreateAutopilotPayload {
  enabled: boolean;
  days: string[];
  times: string[];
}

export interface UpdateAutopilotPayload {
  enabled?: boolean;
  days?: string[];
  times?: string[];
}

interface AutopilotConfigRow {
  id: string;
  profile_id: string;
  enabled: number;
  days: string;
  times: string;
  frequency: string;
  created_at: string;
  updated_at: string;
  last_updated_at: string;
  next_publication_at: string | null;
}

const VALID_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const TIME_FORMAT_REGEX = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/; // HH:MM format

export class AutopilotService {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Validate schedule (days and times)
   *
   * **Validation Rules:**
   * - Days must be valid ISO weekday codes: MON, TUE, WED, THU, FRI, SAT, SUN
   * - Times must be in HH:MM format (24-hour)
   * - Both days and times arrays must be non-empty
   *
   * **Decision:** Validates upfront to prevent invalid schedules in database
   * and ensure publication queue operates correctly.
   *
   * @param days Array of day codes (e.g., ["MON", "WED", "FRI"])
   * @param times Array of times in HH:MM format (e.g., ["09:00", "17:00"])
   * @returns Validation result with error message if invalid
   *
   * @example
   * const result = AutopilotService.validateSchedule(
   *   ["MON", "WED", "FRI"],
   *   ["09:00", "17:00"]
   * );
   * // Returns: { valid: true }
   */
  static validateSchedule(days: string[], times: string[]): { valid: boolean; error?: string } {
    // Validate days
    if (!Array.isArray(days) || days.length === 0) {
      return { valid: false, error: 'Days must be a non-empty array' };
    }

    for (const day of days) {
      if (!VALID_DAYS.includes(day)) {
        return { valid: false, error: `Invalid day: ${day}. Valid days are: ${VALID_DAYS.join(', ')}` };
      }
    }

    // Validate times
    if (!Array.isArray(times) || times.length === 0) {
      return { valid: false, error: 'Times must be a non-empty array' };
    }

    for (const time of times) {
      if (!TIME_FORMAT_REGEX.test(time)) {
        return { valid: false, error: `Invalid time format: ${time}. Use HH:MM format (e.g., 09:00)` };
      }
    }

    return { valid: true };
  }

  /**
   * Calculate frequency from days and times
   * e.g., 3 days * 2 times = 6x per week
   */
  static calculateFrequency(days: string[], times: string[]): string {
    const frequency = days.length * times.length;
    return `${frequency}x per week`;
  }

  /**
   * Calculate next publication time
   */
  private calculateNextPublicationAt(days: string[], times: string[]): string | null {
    if (days.length === 0 || times.length === 0) {
      return null;
    }

    const now = new Date();
    const dayMap: { [key: string]: number } = {
      MON: 1,
      TUE: 2,
      WED: 3,
      THU: 4,
      FRI: 5,
      SAT: 6,
      SUN: 0,
    };

    // Find the next scheduled day and time
    let nextDate: Date | null = null;
    const sortedDays = days.map((d) => dayMap[d]).sort((a, b) => a - b);
    const sortedTimes = times.sort();

    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() + i);
      const dayOfWeek = checkDate.getDay();

      if (sortedDays.includes(dayOfWeek)) {
        for (const time of sortedTimes) {
          const [hours, minutes] = time.split(':').map(Number);
          const scheduledTime = new Date(checkDate);
          scheduledTime.setHours(hours, minutes, 0, 0);

          if (scheduledTime > now) {
            nextDate = scheduledTime;
            break;
          }
        }

        if (nextDate) break;
      }
    }

    return nextDate ? nextDate.toISOString() : null;
  }

  /**
   * Create autopilot configuration
   */
  createAutopilot(profileId: string, payload: CreateAutopilotPayload): { config: AutopilotConfig; config_id: string } | { error: string } {
    // Validate schedule
    const validation = AutopilotService.validateSchedule(payload.days, payload.times);
    if (!validation.valid) {
      return { error: validation.error! };
    }

    const configId = randomUUID();
    const now = new Date().toISOString();
    const frequency = AutopilotService.calculateFrequency(payload.days, payload.times);
    const nextPublicationAt = this.calculateNextPublicationAt(payload.days, payload.times);

    try {
      const stmt = this.db.prepare(`
        INSERT INTO autopilot_config (
          id, profile_id, enabled, days, times, frequency,
          created_at, updated_at, last_updated_at, next_publication_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        configId,
        profileId,
        payload.enabled ? 1 : 0,
        JSON.stringify(payload.days),
        JSON.stringify(payload.times),
        frequency,
        now,
        now,
        now,
        nextPublicationAt,
      );

      const config: AutopilotConfig = {
        id: configId,
        profile_id: profileId,
        enabled: payload.enabled,
        days: payload.days,
        times: payload.times,
        frequency,
        created_at: now,
        updated_at: now,
        last_updated_at: now,
        next_publication_at: nextPublicationAt,
      };

      return { config, config_id: configId };
    } catch (error) {
      return { error: `Failed to create autopilot config: ${(error as Error).message}` };
    }
  }

  /**
   * Read autopilot configuration for a profile
   */
  readAutopilot(profileId: string): AutopilotConfig | null {
    try {
      const stmt = this.db.prepare(`
        SELECT * FROM autopilot_config WHERE profile_id = ? LIMIT 1
      `);

      const row = stmt.get(profileId) as AutopilotConfigRow | undefined;

      if (!row) {
        return null;
      }

      return {
        id: row.id,
        profile_id: row.profile_id,
        enabled: Boolean(row.enabled),
        days: JSON.parse(row.days),
        times: JSON.parse(row.times),
        frequency: row.frequency,
        created_at: row.created_at,
        updated_at: row.updated_at,
        last_updated_at: row.last_updated_at,
        next_publication_at: row.next_publication_at,
      };
    } catch {
      // Parsing or database error, return null
      return null;
    }
  }

  /**
   * Update autopilot configuration
   */
  updateAutopilot(profileId: string, payload: UpdateAutopilotPayload): { config: AutopilotConfig } | { error: string } {
    const existingConfig = this.readAutopilot(profileId);

    if (!existingConfig) {
      return { error: 'Autopilot config not found for this profile' };
    }

    // Prepare update values
    const updatedDays = payload.days ?? existingConfig.days;
    const updatedTimes = payload.times ?? existingConfig.times;
    const updatedEnabled = payload.enabled !== undefined ? payload.enabled : existingConfig.enabled;

    // Validate new schedule
    const validation = AutopilotService.validateSchedule(updatedDays, updatedTimes);
    if (!validation.valid) {
      return { error: validation.error! };
    }

    const now = new Date().toISOString();
    const frequency = AutopilotService.calculateFrequency(updatedDays, updatedTimes);
    const nextPublicationAt = this.calculateNextPublicationAt(updatedDays, updatedTimes);

    try {
      const stmt = this.db.prepare(`
        UPDATE autopilot_config
        SET enabled = ?, days = ?, times = ?, frequency = ?,
            updated_at = ?, last_updated_at = ?, next_publication_at = ?
        WHERE profile_id = ?
      `);

      stmt.run(
        updatedEnabled ? 1 : 0,
        JSON.stringify(updatedDays),
        JSON.stringify(updatedTimes),
        frequency,
        now,
        now,
        nextPublicationAt,
        profileId,
      );

      const config: AutopilotConfig = {
        id: existingConfig.id,
        profile_id: profileId,
        enabled: updatedEnabled,
        days: updatedDays,
        times: updatedTimes,
        frequency,
        created_at: existingConfig.created_at,
        updated_at: now,
        last_updated_at: now,
        next_publication_at: nextPublicationAt,
      };

      return { config };
    } catch (error) {
      return { error: `Failed to update autopilot config: ${(error as Error).message}` };
    }
  }

  /**
   * Toggle autopilot enable/disable without losing config
   */
  toggleAutopilot(profileId: string, enabled: boolean): { config: AutopilotConfig } | { error: string } {
    const existingConfig = this.readAutopilot(profileId);

    if (!existingConfig) {
      return { error: 'Autopilot config not found for this profile' };
    }

    const now = new Date().toISOString();

    try {
      const stmt = this.db.prepare(`
        UPDATE autopilot_config
        SET enabled = ?, updated_at = ?
        WHERE profile_id = ?
      `);

      stmt.run(enabled ? 1 : 0, now, profileId);

      return {
        config: {
          ...existingConfig,
          enabled,
          updated_at: now,
        },
      };
    } catch (error) {
      return { error: `Failed to toggle autopilot: ${(error as Error).message}` };
    }
  }

  /**
   * Delete autopilot configuration
   */
  deleteAutopilot(profileId: string): { success: boolean } | { error: string } {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM autopilot_config WHERE profile_id = ?
      `);

      stmt.run(profileId);

      return { success: true };
    } catch (error) {
      return { error: `Failed to delete autopilot config: ${(error as Error).message}` };
    }
  }
}

export default AutopilotService;
