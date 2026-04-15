-- Performance Optimization: Create indexes for critical queries
-- This migration improves query performance for dashboard, analytics, and content generation

-- Index for profile lookups by user_id (critical for dashboard, profiles listing)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- Index for profile metrics queries (dashboard aggregation)
CREATE INDEX IF NOT EXISTS idx_profile_metrics_profile_id_collected_at
  ON profile_metrics(profile_id, collected_at DESC);

-- Index for post metrics queries (content analytics, dashboard)
CREATE INDEX IF NOT EXISTS idx_post_metrics_profile_id_collected_at
  ON post_metrics(profile_id, collected_at DESC);

-- Index for user lookups by email (authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Index for profile lookups by Instagram handle (duplicate detection, searches)
CREATE INDEX IF NOT EXISTS idx_profiles_instagram_username ON profiles(instagram_username);

-- Index for content queries by profile and status (generation, publishing)
CREATE INDEX IF NOT EXISTS idx_content_profile_id_status
  ON content(profile_id, status);

-- Index for scheduled publishing (queue management)
CREATE INDEX IF NOT EXISTS idx_content_scheduled_at_status
  ON content(scheduled_at, status)
  WHERE scheduled_at IS NOT NULL;

-- Composite index for analytics queries (most common filter pattern)
CREATE INDEX IF NOT EXISTS idx_profile_metrics_multi
  ON profile_metrics(profile_id, collected_at, engagement_rate, followers_count);

-- Index for content generation tracking (performance benchmarks)
CREATE INDEX IF NOT EXISTS idx_content_created_at
  ON content(profile_id, created_at DESC);

-- Index for competitor analysis (research queries)
CREATE INDEX IF NOT EXISTS idx_competitors_profile_id
  ON competitors(profile_id);

-- Index for asset references (image optimization, asset tracking)
CREATE INDEX IF NOT EXISTS idx_assets_profile_id
  ON assets(profile_id, created_at DESC);
