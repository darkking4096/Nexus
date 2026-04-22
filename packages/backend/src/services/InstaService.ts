import type { DatabaseAdapter } from '../config/database';
import { randomUUID } from 'crypto';
import { encryptJSON, decryptJSON } from '../utils/encryption.js';
import { Profile, ProfileData } from '../models/Profile.js';

/**
 * Account info returned from Instagrapi Flask service
 */
export interface AccountInfo {
  instagram_id: string;
  instagram_username: string;
  bio: string;
  followers_count: number;
  profile_picture_url: string;
  is_business: boolean;
  is_creator: boolean;
}

/**
 * Session data from Instagrapi (serialized client.get_settings())
 */
export interface InstaSession {
  [key: string]: unknown;
}

/**
 * Response from Flask /connect endpoint
 */
interface ConnectResponse {
  account_info: AccountInfo;
  session_data: InstaSession;
  is_business: boolean;
  is_creator: boolean;
}

export class InstaService {
  private profileModel: Profile;
  private pythonBaseUrl: string;
  private encryptionKey: string;

  constructor(
    private db: DatabaseAdapter,
    pythonServiceUrl?: string,
    encryptionKey?: string
  ) {
    this.profileModel = new Profile(db);
    this.pythonBaseUrl = pythonServiceUrl || process.env.PYTHON_SERVICE_URL || 'http://localhost:5001';
    this.encryptionKey = encryptionKey || process.env.ENCRYPTION_KEY || '';

    if (!this.encryptionKey) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
  }

  /**
   * Connect Instagram account: authenticate, validate, and store
   *
   * @param userId User ID (from JWT token)
   * @param username Instagram username
   * @param password Instagram password
   * @returns Created or existing profile
   * @throws Error if account is personal, credentials invalid, or service error
   */
  async connectAccount(
    userId: string,
    username: string,
    password: string
  ): Promise<ProfileData> {
    // Log account connection attempt for audit trail
    console.log(`[InstaService] Connection attempt: username=${username}, user=${userId}`);

    // 1. Call Python service to authenticate
    const connectData = await this.callPython<ConnectResponse>('/connect', {
      username,
      password,
    });

    const { account_info, session_data, is_business, is_creator } = connectData;

    // 2. Validate that account is business or creator
    if (!is_business && !is_creator) {
      throw new Error(
        'PERSONAL_ACCOUNT_NOT_SUPPORTED: Only business and creator accounts are supported. ' +
          'Please convert your account or use a business/creator account.'
      );
    }

    // 3. Check for existing profile with same username
    const existingProfile = this.profileModel.getByInstagramUsername(username);
    if (existingProfile && existingProfile.user_id !== userId) {
      throw new Error(`Instagram account "${username}" is already connected to another user`);
    }

    // 4. Encrypt session data before storing
    const encryptedSession = encryptJSON(session_data, this.encryptionKey);

    // 5. Create or update profile
    let profileId: string;
    if (existingProfile) {
      // Update existing profile
      const updated = this.profileModel.update(existingProfile.id, {
        access_token: encryptedSession, // Store encrypted session as token
        instagram_id: account_info.instagram_id,
        bio: account_info.bio,
        profile_picture_url: account_info.profile_picture_url,
      })!;
      profileId = updated.id;
    } else {
      // Create new profile
      const created = this.profileModel.create({
        user_id: userId,
        instagram_username: account_info.instagram_username,
        instagram_id: account_info.instagram_id,
        access_token: encryptedSession, // Store encrypted session as token
        bio: account_info.bio,
        profile_picture_url: account_info.profile_picture_url,
      });
      profileId = created.id;
    }

    // Update followers_count separately (not in create/update params)
    const updateStmt = this.db.prepare('UPDATE profiles SET followers_count = ? WHERE id = ?');
    updateStmt.run(account_info.followers_count, profileId);

    // Fetch updated profile
    const profile = this.profileModel.getById(profileId)!

    // 6. Store session in insta_sessions table
    this.storeSession(profile.id, encryptedSession);

    // Log successful connection
    console.log(`[InstaService] Connection successful: profile=${profile.id}, instagram=${profile.instagram_username}, followers=${profile.followers_count}`);

    // 7. Return profile (strip sensitive data in response)
    return {
      ...profile,
      access_token: '', // Never expose token to client
    };
  }

  /**
   * Retrieve and decrypt session data for publishing
   * Called by PublishService
   *
   * @param profileId Profile ID
   * @returns Decrypted session data
   * @throws Error if session not found or decryption fails
   */
  getDecryptedSession(profileId: string): InstaSession {
    const stmt = this.db.prepare(`
      SELECT session_data FROM insta_sessions
      WHERE profile_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `);

    const row = stmt.get(profileId) as { session_data: string } | undefined;
    if (!row) {
      throw new Error(`No Instagram session found for profile ${profileId}`);
    }

    try {
      return decryptJSON<InstaSession>(row.session_data, this.encryptionKey);
    } catch (error) {
      throw new Error(`Failed to decrypt session: ${String(error)}`);
    }
  }

  /**
   * Store encrypted session data
   */
  private storeSession(profileId: string, encryptedSessionData: string): void {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO insta_sessions (id, profile_id, session_data, last_used_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(id, profileId, encryptedSessionData, now, now);
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
      throw new Error(`Failed to connect to Instagram service: ${errorMsg}`);
    }
  }
}
