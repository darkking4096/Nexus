# NEXUS Database Schema

Complete database schema documentation for NEXUS platform.

**Version:** 1.0.0  
**Database:** SQLite 3+  
**Last Updated:** 2026-04-17

---

## Entity Relationship Diagram

```
┌──────────────────┐
│     USERS        │
├──────────────────┤
│ id (PK)          │
│ email (UQ)       │
│ passwordHash     │
│ createdAt        │
└────────┬─────────┘
         │ 1:N
         │
         ▼
┌──────────────────────────┐         ┌─────────────────────┐
│ INSTAGRAM_PROFILES       │ 1:N     │  GENERATED_CONTENT  │
├──────────────────────────┤◄────────┤─────────────────────┤
│ id (PK)                  │         │ id (PK)             │
│ userId (FK)              │         │ profileId (FK)      │
│ instagramUserId (UQ)     │         │ researchData (JSON) │
│ username                 │         │ analysisData (JSON) │
│ accessToken (enc)        │         │ caption             │
│ refreshToken (enc)       │         │ hashtags            │
│ context (JSON)           │         │ hooks (JSON)        │
│ mode                     │         │ imageUrl            │
│ isConnected              │         │ status              │
│ createdAt                │         │ scheduledFor        │
│                          │         │ publishedAt         │
│                          │         │ metrics (JSON)      │
└────────┬─────────────────┘         │ createdAt           │
         │ 1:N                       └─────────────────────┘
         │
         ├─────────────┬──────────────┬────────────────┐
         │             │              │                │
         ▼             ▼              ▼                ▼
   ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌────────────┐
   │COMPETITORS  │MEDIA_     │  │PUBLICATION_  │  │RESEARCH_   │
   │             │UPLOADS    │  │SCHEDULE      │  │CACHE       │
   └──────────┘  └───────────┘  └──────────────┘  └────────────┘
```

---

## Table Definitions

### 1. users

**Purpose:** Store user accounts and authentication credentials.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email)
);
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4, generated server-side |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `passwordHash` | TEXT | NOT NULL | bcrypt hash (rounds=12) |
| `createdAt` | DATETIME | DEFAULT NOW | Account creation timestamp |
| `updatedAt` | DATETIME | DEFAULT NOW | Last updated timestamp |

**Indexes:**
- `idx_email` on `email` for fast login lookups

**Notes:**
- Single user per installation (MVP model)
- Password stored as bcrypt hash, never plaintext
- No password reset tokens needed (owner resets directly)

---

### 2. instagram_profiles

**Purpose:** Store connected Instagram profiles and their configuration.

```sql
CREATE TABLE instagram_profiles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  instagramUserId TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  displayName TEXT,
  bioText TEXT,
  profilePictureUrl TEXT,
  followerCount INTEGER DEFAULT 0,
  
  accessToken TEXT NOT NULL,
  accessTokenExpiresAt DATETIME,
  refreshToken TEXT,
  
  context JSON NOT NULL DEFAULT '{}',
  mode TEXT DEFAULT 'manual',
  autopilotConfig JSON,
  
  isConnected BOOLEAN DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_instagramUserId (instagramUserId),
  INDEX idx_isConnected (isConnected)
);
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `userId` | TEXT | FK → users.id | User who owns this profile |
| `instagramUserId` | TEXT | UNIQUE | Instagram's numeric user ID |
| `username` | TEXT | - | Instagram handle (without @) |
| `displayName` | TEXT | - | Display name from Instagram |
| `bioText` | TEXT | - | Profile bio text |
| `profilePictureUrl` | TEXT | - | URL to profile picture |
| `followerCount` | INTEGER | DEFAULT 0 | Cached follower count |
| `accessToken` | TEXT | NOT NULL | OAuth access token (AES-256 encrypted) |
| `accessTokenExpiresAt` | DATETIME | - | Token expiration time |
| `refreshToken` | TEXT | - | OAuth refresh token (encrypted) |
| `context` | JSON | - | Brand voice, tone, audience, objectives |
| `mode` | TEXT | DEFAULT 'manual' | 'manual' or 'autopilot' |
| `autopilotConfig` | JSON | - | Autopilot schedule and settings |
| `isConnected` | BOOLEAN | DEFAULT 1 | Connection status |
| `createdAt` | DATETIME | - | Profile creation timestamp |
| `updatedAt` | DATETIME | - | Last updated timestamp |

**Context JSON Structure:**
```json
{
  "voice": "professional|casual|authoritative",
  "tone": "friendly|educational|inspiring",
  "targetAudience": "Description of target audience",
  "objectives": ["Goal 1", "Goal 2", "Goal 3"]
}
```

**Autopilot Config JSON Structure:**
```json
{
  "publishDays": ["Monday", "Wednesday", "Friday"],
  "publishTime": "09:00",
  "frequency": 3,
  "contentTypes": ["carousel", "reel", "static"],
  "autoApprove": false,
  "enabled": true
}
```

**Indexes:**
- `idx_userId` for finding profiles by user
- `idx_instagramUserId` for OAuth callbacks
- `idx_isConnected` for filtering active profiles

**Notes:**
- Tokens encrypted with AES-256-GCM
- Support multiple profiles per user
- Soft delete: set `isConnected = 0` instead of deleting

---

### 3. generated_content

**Purpose:** Store AI-generated Instagram content (captions, hashtags, images).

```sql
CREATE TABLE generated_content (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  
  caption TEXT NOT NULL,
  hashtags JSON NOT NULL DEFAULT '[]',
  hooks JSON NOT NULL DEFAULT '[]',
  imageUrl TEXT,
  contentType TEXT,
  
  status TEXT DEFAULT 'draft',
  scheduledFor DATETIME,
  publishedAt DATETIME,
  
  researchData JSON,
  analysisData JSON,
  metrics JSON DEFAULT '{}',
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId),
  INDEX idx_status (status),
  INDEX idx_scheduledFor (scheduledFor),
  INDEX idx_publishedAt (publishedAt)
);
```

**Fields:**

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | UUID v4 |
| `profileId` | TEXT | FK → instagram_profiles.id | Associated profile |
| `caption` | TEXT | NOT NULL | Generated post caption |
| `hashtags` | JSON | - | Array of hashtag strings |
| `hooks` | JSON | - | Opening lines to grab attention |
| `imageUrl` | TEXT | - | URL to post image/video |
| `contentType` | TEXT | - | 'carousel', 'reel', 'static', 'story' |
| `status` | TEXT | DEFAULT 'draft' | 'draft', 'scheduled', 'published', 'rejected' |
| `scheduledFor` | DATETIME | - | Scheduled publication time |
| `publishedAt` | DATETIME | - | Actual publication time |
| `researchData` | JSON | - | Competitor analysis results |
| `analysisData` | JSON | - | Trend analysis data |
| `metrics` | JSON | - | Engagement metrics after publishing |
| `createdAt` | DATETIME | - | Content creation timestamp |
| `updatedAt` | DATETIME | - | Last update timestamp |

**Hashtags JSON:**
```json
["#marketing", "#strategy", "#ai", "#content"]
```

**Hooks JSON:**
```json
[
  "This will change your Instagram strategy",
  "The #1 thing successful brands do",
  "Here's what competitors miss"
]
```

**Metrics JSON (after publishing):**
```json
{
  "likes": 325,
  "comments": 15,
  "saves": 42,
  "shares": 8,
  "reach": 5000,
  "impressions": 8500,
  "engagementRate": 0.045,
  "profileVisits": 85
}
```

**Indexes:**
- `idx_profileId` for finding content by profile
- `idx_status` for filtering drafts/scheduled/published
- `idx_scheduledFor` for scheduled content queue
- `idx_publishedAt` for analytics date ranges

**Notes:**
- Lifecycle: draft → scheduled → published
- Can regenerate from draft state
- Archive old content after 6 months
- Calculate engagement rate: (likes + comments + saves) / reach

---

### 4. publication_schedule

**Purpose:** Track scheduled publications and execution history.

```sql
CREATE TABLE publication_schedule (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  contentId TEXT NOT NULL,
  scheduledFor DATETIME NOT NULL,
  status TEXT DEFAULT 'pending',
  executedAt DATETIME,
  errorMessage TEXT,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  FOREIGN KEY (contentId) REFERENCES generated_content(id),
  INDEX idx_profileId (profileId),
  INDEX idx_scheduledFor (scheduledFor),
  INDEX idx_status (status)
);
```

**Notes:**
- Execution happens via background job scheduler
- Retry logic for failed publications (max 3 retries)
- Keep history for audit trail

---

### 5. research_cache

**Purpose:** Cache competitor analysis and trend research.

```sql
CREATE TABLE research_cache (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  competitor TEXT NOT NULL,
  data JSON NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId),
  INDEX idx_expiresAt (expiresAt)
);
```

**Notes:**
- Automatic expiration: cache expires in 7 days
- Background job cleans up expired records
- Reduces API calls to Instagram/analysis services

---

### 6. media_uploads

**Purpose:** Store temporary image/video uploads before publication.

```sql
CREATE TABLE media_uploads (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  contentId TEXT,
  fileName TEXT NOT NULL,
  fileSize INTEGER,
  mimeType TEXT,
  storagePath TEXT NOT NULL,
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  FOREIGN KEY (contentId) REFERENCES generated_content(id),
  INDEX idx_profileId (profileId),
  INDEX idx_expiresAt (expiresAt)
);
```

**Notes:**
- Files stored in `uploads/{profileId}/` directory
- Auto-cleanup after 30 days if not attached to published content
- Support image and video formats

---

### 7. competitors

**Purpose:** Store tracked competitor profiles for analysis.

```sql
CREATE TABLE competitors (
  id TEXT PRIMARY KEY,
  profileId TEXT NOT NULL,
  username TEXT NOT NULL,
  instagramUserId TEXT,
  followerCount INTEGER,
  engagementRate REAL,
  analysisDate DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId)
);
```

**Notes:**
- User manually adds competitors to track
- Background job updates metrics weekly
- Used for content inspiration and benchmarking

---

## Indexes Summary

| Table | Index Name | Columns | Purpose |
|-------|-----------|---------|---------|
| `users` | `idx_email` | `email` | Fast login lookup |
| `instagram_profiles` | `idx_userId` | `userId` | Find profiles by user |
| `instagram_profiles` | `idx_instagramUserId` | `instagramUserId` | OAuth callback lookup |
| `instagram_profiles` | `idx_isConnected` | `isConnected` | Filter active profiles |
| `generated_content` | `idx_profileId` | `profileId` | Find content by profile |
| `generated_content` | `idx_status` | `status` | Filter by status |
| `generated_content` | `idx_scheduledFor` | `scheduledFor` | Queue operations |
| `generated_content` | `idx_publishedAt` | `publishedAt` | Analytics date ranges |

---

## Data Encryption

### Encrypted Fields

Fields containing sensitive data use **AES-256-GCM encryption**:

- `instagram_profiles.accessToken`
- `instagram_profiles.refreshToken`

### Encryption Key

- Stored in environment variable `ENCRYPTION_KEY`
- Must be 32 bytes (64 hex characters)
- Rotated annually for security

### Encryption Flow

```
Raw Token → Encrypt (AES-256-GCM) → Store in DB
Read from DB → Decrypt → Use in API Call
```

---

## Constraints & Relationships

### Foreign Keys

- `instagram_profiles.userId` → `users.id`
- `generated_content.profileId` → `instagram_profiles.id`
- `publication_schedule.profileId` → `instagram_profiles.id`
- `publication_schedule.contentId` → `generated_content.id`
- `research_cache.profileId` → `instagram_profiles.id`
- `media_uploads.profileId` → `instagram_profiles.id`
- `media_uploads.contentId` → `generated_content.id`
- `competitors.profileId` → `instagram_profiles.id`

### Unique Constraints

- `users.email` - One email per user
- `instagram_profiles.instagramUserId` - One Instagram account per profile

---

## Data Retention & Cleanup

| Data | Retention | Action |
|------|-----------|--------|
| Published content metrics | 12 months | Keep for analytics |
| Draft content | 30 days | Delete if not scheduled |
| Research cache | 7 days | Auto-expire |
| Media uploads | 30 days | Delete orphaned files |
| Publication schedule | Indefinite | Keep for audit |

---

## Performance Considerations

### Query Patterns

1. **Find profiles by user** (login dashboard):
   ```sql
   SELECT * FROM instagram_profiles WHERE userId = ? AND isConnected = 1
   ```

2. **Get scheduled content** (publication queue):
   ```sql
   SELECT * FROM generated_content 
   WHERE status = 'scheduled' AND scheduledFor <= NOW()
   ```

3. **Get analytics for period**:
   ```sql
   SELECT * FROM generated_content 
   WHERE profileId = ? AND publishedAt BETWEEN ? AND ?
   ```

### Optimization Tips

- Create composite indexes for common filter combinations
- Use prepared statements for all queries (SQLite supports them)
- Consider partitioning by `profileId` if dataset grows > 1M rows
- Archive content older than 6 months to separate archive DB

---

## Migrations

All schema changes are tracked as migrations in `migrations/` folder.

### Running Migrations

```bash
# Apply pending migrations
npm run db:migrate:up

# Rollback last
npm run db:migrate:down

# Create new migration
npm run db:migrate:create -- --name="AddNewColumn"
```

### Example Migration

```sql
-- migrations/001_initial_schema.sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- migrations/002_add_instagram_profiles.sql
CREATE TABLE instagram_profiles (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  username TEXT NOT NULL,
  FOREIGN KEY (userId) REFERENCES users(id)
);
```

---

## Backup & Recovery

### Backup Strategy

- **Frequency:** Daily at 2 AM UTC
- **Retention:** 30 days
- **Storage:** Encrypted cloud storage (AWS S3)

### Backup Commands

```bash
# Manual backup
npm run db:backup

# Restore from backup
npm run db:restore -- --backup-id={backup-id}
```

### Disaster Recovery

```bash
# Verify backup integrity
npm run db:verify-backup

# Test recovery in staging
npm run db:restore --staging --backup-id={backup-id}
```

---

## Support

For schema questions or changes:
- **Contact:** dev-support@nexus.app
- **GitHub Issues:** Schema discussion
- **Code Review:** All DDL changes via PR

