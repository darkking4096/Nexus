import { randomUUID } from 'crypto';
import bcryptjs from 'bcryptjs';
import type { DatabaseAdapter } from '../config/database';

export interface UserData {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserCreateInput {
  email: string;
  password: string;
  name?: string;
}

export class User {
  constructor(private db: DatabaseAdapter) {}

  /**
   * Hash password using bcryptjs (10 rounds)
   */
  static async hashPassword(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  /**
   * Verify password against hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }

  /**
   * Create new user
   */
  async create(input: UserCreateInput): Promise<UserData> {
    const id = randomUUID();
    const passwordHash = await User.hashPassword(input.password);
    const now = new Date().toISOString();

    try {
      await this.db.query(
        `INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [id, input.email, passwordHash, input.name || null, now, now]
      );
    } catch (error) {
      if (error instanceof Error && error.message.includes('duplicate key')) {
        throw new Error(`User with email ${input.email} already exists`);
      }
      throw error;
    }

    const result = await this.getById(id);
    if (!result) throw new Error('Failed to create user');
    return result;
  }

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<UserData | null> {
    const results = await this.db.query(
      `SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`,
      [id]
    );

    return results.length > 0 ? (results[0] as UserData) : null;
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<(UserData & { password_hash: string }) | null> {
    const results = await this.db.query(
      `SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = $1`,
      [email]
    );

    return results.length > 0 ? (results[0] as UserData & { password_hash: string }) : null;
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<{ name: string }>): Promise<UserData | null> {
    const now = new Date().toISOString();

    await this.db.query(
      `UPDATE users SET name = $1, updated_at = $2 WHERE id = $3`,
      [updates.name || null, now, id]
    );

    return this.getById(id);
  }

  /**
   * Delete user (cascades to related profiles, content, credentials)
   */
  async delete(id: string): Promise<boolean> {
    const results = await this.db.query(
      `DELETE FROM users WHERE id = $1 RETURNING id`,
      [id]
    );
    return results.length > 0;
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const results = await this.db.query(
      `SELECT 1 FROM users WHERE email = $1`,
      [email]
    );
    return results.length > 0;
  }
}
