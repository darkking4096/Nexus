-- ============================================================================
-- Story 8.1.1: Supabase Setup & Database Migration
-- SQLite → PostgreSQL Schema Conversion
-- ============================================================================

-- Migration version tracking
CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  description TEXT NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- Core User & Profile Tables
-- ============================================================================

-- Users table (authentication & identity)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Profiles table (Instagram accounts linked to users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  instagram_username TEXT UNIQUE NOT NULL,
  instagram_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP,
  bio TEXT,
  profile_picture_url TEXT,
  followers_count INTEGER DEFAULT 0,
  context_voice TEXT,
  context_tone TEXT,
  context_audience TEXT,
  context_goals TEXT,
  autopilot_enabled BOOLEAN DEFAULT FALSE,
  autopilot_schedule TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_username ON profiles(instagram_username);

-- ============================================================================
-- Content Management Tables
-- ============================================================================

-- Content table (generated posts/carousel items)
CREATE TABLE IF NOT EXISTS content (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  caption TEXT,
  hashtags TEXT,
  image_url TEXT,
  carousel_json TEXT,
  status TEXT DEFAULT 'draft',
  scheduled_at TIMESTAMP,
  published_at TIMESTAMP,
  instagram_post_id TEXT,
  instagram_url TEXT,
  publish_error TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_content_profile_id ON content(profile_id);
CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
CREATE INDEX IF NOT EXISTS idx_content_scheduled_at ON content(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_content_published_at ON content(published_at);

-- Credentials table (encrypted API keys, OAuth tokens)
CREATE TABLE IF NOT EXISTS credentials (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_type TEXT NOT NULL,
  encrypted_value TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_credentials_user_id ON credentials(user_id);

-- ============================================================================
-- Session & Authentication Tables
-- ============================================================================

-- Instagram sessions (Story 1.2: encrypted Instagrapi sessions)
CREATE TABLE IF NOT EXISTS insta_sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_data TEXT NOT NULL,
  last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_insta_sessions_profile_id ON insta_sessions(profile_id);

-- ============================================================================
-- Publishing & Logging Tables
-- ============================================================================

-- Publishing attempt logs (Story 1.3: audit trail for publishing)
CREATE TABLE IF NOT EXISTS publish_logs (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content_id TEXT REFERENCES content(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL,
  error_message TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_publish_logs_profile_id ON publish_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_publish_logs_content_id ON publish_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_publish_logs_timestamp ON publish_logs(timestamp);

-- ============================================================================
-- Analytics & Metrics Tables
-- ============================================================================

-- Metrics table (Story 1.6: aggregated analytics)
CREATE TABLE IF NOT EXISTS metrics (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  followers_count INTEGER,
  engagement_rate REAL,
  reach INTEGER,
  impressions INTEGER,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_metrics_profile_id ON metrics(profile_id);
CREATE INDEX IF NOT EXISTS idx_metrics_collected_at ON metrics(collected_at);

-- Post-level metrics (Story 1.6: per-post engagement)
CREATE TABLE IF NOT EXISTS post_metrics (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_metrics_content_id ON post_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_profile_id ON post_metrics(profile_id);
CREATE INDEX IF NOT EXISTS idx_post_metrics_collected_at ON post_metrics(collected_at);

-- ============================================================================
-- Workflow & Automation Tables
-- ============================================================================

-- Workflow states (Story 4.1: Manual Mode workflow tracking)
CREATE TABLE IF NOT EXISTS workflow_states (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE REFERENCES content(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'manual',
  current_step TEXT NOT NULL,
  schedule_data TEXT,
  content_data TEXT,
  publish_data TEXT,
  user_edits TEXT,
  auto_approve_enabled BOOLEAN DEFAULT TRUE,
  auto_approve_timeout_hours INTEGER DEFAULT 24,
  last_approval_at TIMESTAMP,
  approved_by TEXT,
  rejected_at TIMESTAMP,
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_states_content_id ON workflow_states(content_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_profile_id ON workflow_states(profile_id);
CREATE INDEX IF NOT EXISTS idx_workflow_states_current_step ON workflow_states(current_step);
CREATE INDEX IF NOT EXISTS idx_workflow_states_mode ON workflow_states(mode);

-- Workflow history (Story 4.1: audit trail for approvals)
CREATE TABLE IF NOT EXISTS workflow_history (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  from_step TEXT,
  to_step TEXT,
  decision TEXT NOT NULL,
  user_id TEXT,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workflow_history_content_id ON workflow_history(content_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_profile_id ON workflow_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_workflow_history_timestamp ON workflow_history(timestamp);

-- Autopilot configuration (Story 4.3: schedule & automation)
CREATE TABLE IF NOT EXISTS autopilot_config (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN DEFAULT FALSE,
  days TEXT NOT NULL,
  times TEXT NOT NULL,
  frequency TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_publication_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_autopilot_config_profile_id ON autopilot_config(profile_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_config_enabled ON autopilot_config(enabled);
CREATE INDEX IF NOT EXISTS idx_autopilot_config_next_publication_at ON autopilot_config(next_publication_at);

-- Scheduled posts (Story 4.4: scheduling engine)
CREATE TABLE IF NOT EXISTS scheduled_posts (
  id TEXT PRIMARY KEY,
  content_id TEXT NOT NULL UNIQUE REFERENCES content(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP NOT NULL,
  original_scheduled_at TIMESTAMP,
  status TEXT DEFAULT 'scheduled',
  queue_position INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_scheduled_posts_profile_id ON scheduled_posts(profile_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_scheduled_at ON scheduled_posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_posts_content_id ON scheduled_posts(content_id);

-- Schedule audit (Story 4.4: audit trail for scheduling changes)
CREATE TABLE IF NOT EXISTS schedule_audit (
  id TEXT PRIMARY KEY,
  scheduled_post_id TEXT NOT NULL REFERENCES scheduled_posts(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL REFERENCES content(id) ON DELETE CASCADE,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schedule_audit_scheduled_post_id ON schedule_audit(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_schedule_audit_profile_id ON schedule_audit(profile_id);
CREATE INDEX IF NOT EXISTS idx_schedule_audit_timestamp ON schedule_audit(timestamp);

-- ============================================================================
-- Migration Tracking
-- ============================================================================

-- Record this migration as completed
INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Initial schema from SQLite migration')
ON CONFLICT (version) DO NOTHING;
