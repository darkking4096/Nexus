import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

/**
 * SQLite database initialization and schema setup
 */

export function initializeDatabase(dbPath: string): Database.Database {
  // Ensure data directory exists
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables
  createSchema(db);

  return db;
}

function createSchema(db: Database.Database): void {
  // users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // profiles table (Instagram accounts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      instagram_username TEXT UNIQUE NOT NULL,
      instagram_id TEXT,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_expires_at DATETIME,
      bio TEXT,
      profile_picture_url TEXT,
      followers_count INTEGER DEFAULT 0,
      context_voice TEXT,
      context_tone TEXT,
      context_audience TEXT,
      context_goals TEXT,
      autopilot_enabled BOOLEAN DEFAULT 0,
      autopilot_schedule TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // content table (generated posts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id),
      type TEXT NOT NULL,
      caption TEXT,
      hashtags TEXT,
      image_url TEXT,
      carousel_json TEXT,
      status TEXT DEFAULT 'draft',
      scheduled_at DATETIME,
      published_at DATETIME,
      instagram_post_id TEXT,
      instagram_url TEXT,
      publish_error TEXT,
      retry_count INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // credentials table (encrypted API keys, tokens)
  db.exec(`
    CREATE TABLE IF NOT EXISTS credentials (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      credential_type TEXT NOT NULL,
      encrypted_value TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // insta_sessions table (Story 1.2: encrypted Instagrapi sessions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS insta_sessions (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      session_data TEXT NOT NULL,
      last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // publish_logs table (Story 1.3: publishing attempt tracking)
  db.exec(`
    CREATE TABLE IF NOT EXISTS publish_logs (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      content_id TEXT REFERENCES content(id) ON DELETE CASCADE,
      action TEXT NOT NULL,
      status TEXT NOT NULL,
      error_message TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // metrics table (Story 1.6: analytics — followers, engagement, reach, impressions)
  db.exec(`
    CREATE TABLE IF NOT EXISTS metrics (
      id TEXT PRIMARY KEY,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      followers_count INTEGER,
      engagement_rate REAL,
      reach INTEGER,
      impressions INTEGER,
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // post_metrics table (Story 1.6: analytics — per-post engagement)
  db.exec(`
    CREATE TABLE IF NOT EXISTS post_metrics (
      id TEXT PRIMARY KEY,
      content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
      profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      reach INTEGER DEFAULT 0,
      collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Create indexes for common queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_content_profile_id ON content(profile_id);
    CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
    CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_insta_sessions_profile_id ON insta_sessions(profile_id);
    CREATE INDEX IF NOT EXISTS idx_publish_logs_profile_id ON publish_logs(profile_id);
    CREATE INDEX IF NOT EXISTS idx_publish_logs_content_id ON publish_logs(content_id);
    CREATE INDEX IF NOT EXISTS idx_metrics_profile_id ON metrics(profile_id);
    CREATE INDEX IF NOT EXISTS idx_metrics_collected_at ON metrics(collected_at);
    CREATE INDEX IF NOT EXISTS idx_post_metrics_content_id ON post_metrics(content_id);
    CREATE INDEX IF NOT EXISTS idx_post_metrics_profile_id ON post_metrics(profile_id);
  `);
}

export default initializeDatabase;
