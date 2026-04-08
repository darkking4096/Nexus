import Database from 'better-sqlite3';
import { randomUUID } from 'crypto';
import bcryptjs from 'bcryptjs';

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
  constructor(private db: Database.Database) {}

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

    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(id, input.email, passwordHash, input.name || null, now, now);
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new Error(`User with email ${input.email} already exists`);
      }
      throw error;
    }

    return this.getById(id)!;
  }

  /**
   * Get user by ID
   */
  getById(id: string): UserData | null {
    const stmt = this.db.prepare(`
      SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?
    `);

    const result = stmt.get(id) as UserData | undefined;
    return result || null;
  }

  /**
   * Get user by email
   */
  getByEmail(email: string): (UserData & { password_hash: string }) | null {
    const stmt = this.db.prepare(`
      SELECT id, email, password_hash, name, created_at, updated_at FROM users WHERE email = ?
    `);

    return stmt.get(email) as (UserData & { password_hash: string }) | null;
  }

  /**
   * Update user
   */
  async update(id: string, updates: Partial<{ name: string }>): Promise<UserData | null> {
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      UPDATE users SET name = ?, updated_at = ? WHERE id = ?
    `);

    stmt.run(updates.name || null, now, id);

    return this.getById(id);
  }

  /**
   * Delete user (cascades to related profiles, content, credentials)
   */
  delete(id: string): boolean {
    const stmt = this.db.prepare(`DELETE FROM users WHERE id = ?`);
    const result = stmt.run(id);
    return result.changes > 0;
  }

  /**
   * Check if email exists
   */
  emailExists(email: string): boolean {
    const stmt = this.db.prepare(`SELECT 1 FROM users WHERE email = ?`);
    return stmt.get(email) !== undefined;
  }
}
