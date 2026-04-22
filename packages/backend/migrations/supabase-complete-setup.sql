-- ============================================================================
-- NEXUS Platform — Complete Supabase Setup
-- Story 8.1.1: Schema + RLS Policies
--
-- Execute this file in Supabase Dashboard → SQL Editor
-- Includes: Schema creation + Row-Level Security policies
-- ============================================================================

-- First, run 001-initial-schema.sql
-- Then run 002-rls-policies.sql
-- Or copy both files into Supabase SQL Editor

-- This is a reference file combining both migrations
-- Use separately if you need to track migrations individually

-- ============================================================================
-- MIGRATION 001: INITIAL SCHEMA
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

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

-- Record migration 001
INSERT INTO schema_migrations (version, description)
VALUES ('001', 'Initial schema from SQLite migration')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- MIGRATION 002: ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE insta_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE publish_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE autopilot_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_audit ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user ID
CREATE OR REPLACE FUNCTION auth.uid() RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_id', true)::TEXT;
$$ LANGUAGE SQL STABLE;

-- Helper function: get current user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_role', true)::TEXT;
$$ LANGUAGE SQL STABLE;

-- Helper function: check if service/admin role
CREATE OR REPLACE FUNCTION auth.is_service_role() RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'service' OR auth.user_role() = 'admin';
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Users Table RLS Policies
-- ============================================================================

CREATE POLICY users_service_access ON users
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY users_user_access ON users
  FOR SELECT USING (auth.user_role() = 'user' AND id = auth.uid());

CREATE POLICY users_user_update ON users
  FOR UPDATE USING (auth.user_role() = 'user' AND id = auth.uid())
  WITH CHECK (auth.user_role() = 'user' AND id = auth.uid());

-- ============================================================================
-- Profiles Table RLS Policies
-- ============================================================================

CREATE POLICY profiles_service_access ON profiles
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY profiles_user_access ON profiles
  FOR SELECT USING (auth.user_role() = 'user' AND user_id = auth.uid());

CREATE POLICY profiles_user_update ON profiles
  FOR UPDATE USING (auth.user_role() = 'user' AND user_id = auth.uid())
  WITH CHECK (auth.user_role() = 'user' AND user_id = auth.uid());

CREATE POLICY profiles_user_delete ON profiles
  FOR DELETE USING (auth.user_role() = 'user' AND user_id = auth.uid());

-- ============================================================================
-- Content Table RLS Policies
-- ============================================================================

CREATE POLICY content_service_access ON content
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY content_user_access ON content
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY content_user_insert ON content
  FOR INSERT WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY content_user_update ON content
  FOR UPDATE USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY content_user_delete ON content
  FOR DELETE USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Credentials Table RLS (Service role only)
-- ============================================================================

CREATE POLICY credentials_service_access ON credentials
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY credentials_user_access ON credentials
  FOR SELECT USING (auth.user_role() = 'user' AND user_id = auth.uid());

-- ============================================================================
-- Instagram Sessions RLS Policies
-- ============================================================================

CREATE POLICY insta_sessions_service_access ON insta_sessions
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY insta_sessions_user_access ON insta_sessions
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Publish Logs RLS Policies
-- ============================================================================

CREATE POLICY publish_logs_service_access ON publish_logs
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY publish_logs_user_access ON publish_logs
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Metrics RLS Policies
-- ============================================================================

CREATE POLICY metrics_service_access ON metrics
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY metrics_user_access ON metrics
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY post_metrics_service_access ON post_metrics
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY post_metrics_user_access ON post_metrics
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Workflow RLS Policies
-- ============================================================================

CREATE POLICY workflow_states_service_access ON workflow_states
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY workflow_states_user_access ON workflow_states
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_states_user_update ON workflow_states
  FOR UPDATE USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY workflow_history_service_access ON workflow_history
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY workflow_history_user_access ON workflow_history
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Autopilot Config RLS Policies
-- ============================================================================

CREATE POLICY autopilot_config_service_access ON autopilot_config
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY autopilot_config_user_access ON autopilot_config
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY autopilot_config_user_update ON autopilot_config
  FOR UPDATE USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- ============================================================================
-- Scheduled Posts RLS Policies
-- ============================================================================

CREATE POLICY scheduled_posts_service_access ON scheduled_posts
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY scheduled_posts_user_access ON scheduled_posts
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY scheduled_posts_user_insert ON scheduled_posts
  FOR INSERT WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY scheduled_posts_user_update ON scheduled_posts
  FOR UPDATE USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY schedule_audit_service_access ON schedule_audit
  FOR ALL USING (auth.is_service_role()) WITH CHECK (auth.is_service_role());

CREATE POLICY schedule_audit_user_access ON schedule_audit
  FOR SELECT USING (
    auth.user_role() = 'user' AND
    profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- Record migration 002
INSERT INTO schema_migrations (version, description)
VALUES ('002', 'Row-Level Security policies for multi-tenant isolation')
ON CONFLICT (version) DO NOTHING;

-- ============================================================================
-- Migration Complete
-- ============================================================================

SELECT 'Schema and RLS setup complete!' as status;
SELECT COUNT(*) as tables_created FROM information_schema.tables
WHERE table_schema = 'public' AND table_name != 'schema_migrations';
