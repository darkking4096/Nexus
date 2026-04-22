-- ============================================================================
-- Story 8.1.1: Row-Level Security (RLS) Policies
-- Multi-tenant data isolation & authorization
-- ============================================================================

-- ============================================================================
-- Enable RLS on all tables
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

-- ============================================================================
-- Helper Functions for RLS
-- ============================================================================

-- Get current user ID from JWT token
CREATE OR REPLACE FUNCTION auth.uid() RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_id', true)::TEXT;
$$ LANGUAGE SQL STABLE;

-- Get current user role
CREATE OR REPLACE FUNCTION auth.user_role() RETURNS TEXT AS $$
  SELECT current_setting('app.current_user_role', true)::TEXT;
$$ LANGUAGE SQL STABLE;

-- Check if user is service/system role (for background jobs, API operations)
CREATE OR REPLACE FUNCTION auth.is_service_role() RETURNS BOOLEAN AS $$
  SELECT auth.user_role() = 'service' OR auth.user_role() = 'admin';
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- Users Table Policies
-- ============================================================================

-- Service role: full access (system operations)
CREATE POLICY users_service_access ON users
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see their own user record
CREATE POLICY users_user_access ON users
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND id = auth.uid()
  );

-- Users can update their own record (except email)
CREATE POLICY users_user_update ON users
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND id = auth.uid()
  )
  WITH CHECK (
    auth.user_role() = 'user' AND id = auth.uid()
  );

-- ============================================================================
-- Profiles Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY profiles_service_access ON profiles
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see/manage profiles they own
CREATE POLICY profiles_user_access ON profiles
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND user_id = auth.uid()
  );

CREATE POLICY profiles_user_update ON profiles
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND user_id = auth.uid()
  )
  WITH CHECK (
    auth.user_role() = 'user' AND user_id = auth.uid()
  );

CREATE POLICY profiles_user_delete ON profiles
  FOR DELETE
  USING (
    auth.user_role() = 'user' AND user_id = auth.uid()
  );

-- ============================================================================
-- Content Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY content_service_access ON content
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see content from their profiles
CREATE POLICY content_user_access ON content
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY content_user_insert ON content
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY content_user_update ON content
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY content_user_delete ON content
  FOR DELETE
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Credentials Table Policies
-- ============================================================================

-- Service role: full access (only service can decrypt)
CREATE POLICY credentials_service_access ON credentials
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can see metadata only (not encrypted values)
CREATE POLICY credentials_user_access ON credentials
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND user_id = auth.uid()
  );

-- ============================================================================
-- Instagram Sessions Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY insta_sessions_service_access ON insta_sessions
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see sessions for their profiles
CREATE POLICY insta_sessions_user_access ON insta_sessions
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Publish Logs Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY publish_logs_service_access ON publish_logs
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see logs for their profiles
CREATE POLICY publish_logs_user_access ON publish_logs
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Metrics Tables Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY metrics_service_access ON metrics
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see metrics for their profiles
CREATE POLICY metrics_user_access ON metrics
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Post Metrics Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY post_metrics_service_access ON post_metrics
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see metrics for content they own
CREATE POLICY post_metrics_user_access ON post_metrics
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Workflow Tables Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY workflow_states_service_access ON workflow_states
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can access workflows for their content
CREATE POLICY workflow_states_user_access ON workflow_states
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY workflow_states_user_update ON workflow_states
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Workflow History Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY workflow_history_service_access ON workflow_history
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see history for their workflows
CREATE POLICY workflow_history_user_access ON workflow_history
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Autopilot Config Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY autopilot_config_service_access ON autopilot_config
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can manage autopilot for their profiles
CREATE POLICY autopilot_config_user_access ON autopilot_config
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY autopilot_config_user_update ON autopilot_config
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Scheduled Posts Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY scheduled_posts_service_access ON scheduled_posts
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can manage scheduled posts for their profiles
CREATE POLICY scheduled_posts_user_access ON scheduled_posts
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY scheduled_posts_user_insert ON scheduled_posts
  FOR INSERT
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY scheduled_posts_user_update ON scheduled_posts
  FOR UPDATE
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Schedule Audit Table Policies
-- ============================================================================

-- Service role: full access
CREATE POLICY schedule_audit_service_access ON schedule_audit
  FOR ALL
  USING (auth.is_service_role())
  WITH CHECK (auth.is_service_role());

-- User role: can only see audit entries for their profiles
CREATE POLICY schedule_audit_user_access ON schedule_audit
  FOR SELECT
  USING (
    auth.user_role() = 'user' AND
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- Migration Tracking
-- ============================================================================

-- Record this migration as completed (in schema_migrations if exists)
INSERT INTO schema_migrations (version, description)
VALUES ('002', 'Row-Level Security policies for multi-tenant isolation')
ON CONFLICT (version) DO NOTHING;
