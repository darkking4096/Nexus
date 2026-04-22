import { describe, it, expect, beforeAll, vi } from 'vitest';
import { createMockDatabase } from './helpers/test-db';
import type { DatabaseAdapter } from '../src/config/database';
import { InstaService } from '../src/services/InstaService';
import { Profile } from '../src/models/Profile';

// Mock global fetch
vi.stubGlobal('fetch', vi.fn());

describe('InstaService', () => {
  let db: DatabaseAdapter;
  let instaService: InstaService;
  let profileModel: Profile;
  const testEncryptionKey = 'test-encryption-key-at-least-32-characters-long-for-aes';
  const testUserId = 'test-user-123';

  beforeAll(() => {
    // Use mock database for testing
    db = createMockDatabase();

    // NOTE: Schema setup moved to database initialization (Story 8.1.1)
    profileModel = new Profile(db);
    instaService = new InstaService(db, 'http://localhost:5001', testEncryptionKey);
  });

  beforeEach(async () => {
    // Clear database between tests to prevent state leakage
    await db.close();
    db = createMockDatabase();
    profileModel = new Profile(db);
    instaService = new InstaService(db, 'http://localhost:5001', testEncryptionKey);
  });

  it('should connect a business account successfully', async () => {
    const mockResponse = {
      account_info: {
        instagram_id: 'ig-123',
        instagram_username: 'test_business',
        bio: 'My Business',
        followers_count: 1000,
        profile_picture_url: 'https://example.com/pic.jpg',
        is_business: true,
        is_creator: false,
      },
      session_data: {
        user_id: 'ig-123',
        cookies: { auth_token: 'token123' },
      },
      is_business: true,
      is_creator: false,
    };

    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const profile = await instaService.connectAccount(testUserId, 'test_business', 'password123');

    expect(profile.instagram_username).toBe('test_business');
    expect(profile.bio).toBe('My Business');
    expect(profile.followers_count).toBe(1000);
    expect(profile.access_token).toBe(''); // Should be stripped from response

    // Verify session was stored
    const sessionResults = await db.query(
      `SELECT session_data FROM insta_sessions WHERE profile_id = $1`,
      [profile.id]
    );
    expect(sessionResults.length).toBeGreaterThan(0);
  });

  it('should reject personal accounts', async () => {
    const mockResponse = {
      account_info: {
        instagram_id: 'ig-456',
        instagram_username: 'personal_account',
        bio: 'Just me',
        followers_count: 500,
        profile_picture_url: 'https://example.com/pic2.jpg',
        is_business: false,
        is_creator: false,
      },
      session_data: {},
      is_business: false,
      is_creator: false,
    };

    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    await expect(
      instaService.connectAccount(testUserId, 'personal_account', 'password123')
    ).rejects.toThrow('PERSONAL_ACCOUNT_NOT_SUPPORTED');
  });

  it('should reject invalid credentials', async () => {
    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Invalid credentials' }),
    } as any);

    await expect(instaService.connectAccount(testUserId, 'bad_user', 'bad_pass')).rejects.toThrow();
  });

  it('should handle service unavailable', async () => {
    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockRejectedValueOnce(new Error('ECONNREFUSED: Connection refused'));

    await expect(
      instaService.connectAccount(testUserId, 'test', 'password')
    ).rejects.toThrow('Failed to connect to Instagram service');
  });

  it('should allow creator accounts', async () => {
    const mockResponse = {
      account_info: {
        instagram_id: 'ig-789',
        instagram_username: 'creator_account',
        bio: 'Content Creator',
        followers_count: 5000,
        profile_picture_url: 'https://example.com/pic3.jpg',
        is_business: false,
        is_creator: true,
      },
      session_data: {
        cookies: {},
      },
      is_business: false,
      is_creator: true,
    };

    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const profile = await instaService.connectAccount(testUserId, 'creator_account', 'password123');

    expect(profile.instagram_username).toBe('creator_account');
    expect(profile.bio).toBe('Content Creator');
  });

  it('should prevent duplicate accounts from different users', async () => {
    // Create a second user
    const now = new Date().toISOString();
    await db.query(
      `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      ['another-user', 'another@example.com', 'hash', 'Another User', now, now]
    );

    // First user connects account
    const mockResponse = {
      account_info: {
        instagram_id: 'ig-shared',
        instagram_username: 'shared_account',
        bio: 'Shared',
        followers_count: 100,
        profile_picture_url: 'https://example.com/shared.jpg',
        is_business: true,
        is_creator: false,
      },
      session_data: {},
      is_business: true,
      is_creator: false,
    };

    const fetchMock = vi.mocked(global.fetch as any);

    // First connection succeeds
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    await instaService.connectAccount(testUserId, 'shared_account', 'pass1');

    // Second user tries to connect same account
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    await expect(
      instaService.connectAccount('another-user', 'shared_account', 'pass2')
    ).rejects.toThrow('already connected to another user');
  });

  it('should retrieve and decrypt session', async () => {
    // First, create a profile with session
    const mockResponse = {
      account_info: {
        instagram_id: 'ig-decrypt-test',
        instagram_username: 'decrypt_test',
        bio: 'Test',
        followers_count: 100,
        profile_picture_url: 'https://example.com/test.jpg',
        is_business: true,
        is_creator: false,
      },
      session_data: {
        cookies: { session_id: 'abc123' },
        user_agent: 'Instagram 1.0',
      },
      is_business: true,
      is_creator: false,
    };

    const fetchMock = vi.mocked(global.fetch as any);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as any);

    const profile = await instaService.connectAccount(testUserId, 'decrypt_test', 'password');

    // Now retrieve and decrypt
    const session = instaService.getDecryptedSession(profile.id);

    expect(session).toBeTruthy();
    expect(session.cookies).toEqual({ session_id: 'abc123' });
    expect(session.user_agent).toBe('Instagram 1.0');
  });

  it('should throw on missing session', async () => {
    await expect(instaService.getDecryptedSession('nonexistent-profile')).rejects.toThrow(
      'No Instagram session found'
    );
  });
});
