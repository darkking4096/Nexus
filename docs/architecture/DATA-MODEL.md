# NEXUS — Data Model & Database Schema

**Status**: ✅ Complemento da Arquitetura  
**Data**: 2026-04-07  
**Para**: Backend Team (Dev + @data-engineer)

---

## Entity Relationship Diagram (ERD)

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

## Detailed Schema (DDL)

### 1. Users Table

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  email TEXT NOT NULL UNIQUE,
  passwordHash TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_email (email)
);
```

**Notes:**
- `id`: UUID v4 (gerado no backend)
- `passwordHash`: bcrypt(password, rounds=12)
- Single user per MVP (email é "você")

---

### 2. Instagram Profiles Table

```sql
CREATE TABLE instagram_profiles (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  userId TEXT NOT NULL,
  
  -- Instagram Data
  instagramUserId TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL,
  displayName TEXT,
  bioText TEXT,
  profilePictureUrl TEXT,
  followerCount INTEGER DEFAULT 0,
  
  -- Authentication (Encrypted)
  accessToken TEXT NOT NULL,  -- AES-256-GCM encrypted
  accessTokenExpiresAt DATETIME,
  refreshToken TEXT,          -- AES-256-GCM encrypted
  
  -- Configuration
  context JSON NOT NULL DEFAULT '{}',  -- { voice, tone, targetAudience, objectives, ... }
  mode TEXT DEFAULT 'manual',           -- 'autopilot' | 'manual'
  autopilotConfig JSON,                 -- { publishDays, publishTime, interval, ... }
  
  -- Status
  isConnected BOOLEAN DEFAULT true,
  lastSyncedAt DATETIME,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_userId (userId),
  INDEX idx_username (username),
  INDEX idx_isConnected (isConnected)
);
```

**Context Structure (JSON)**:
```json
{
  "voice": "professional, approachable",
  "tone": "educational, inspiring",
  "targetAudience": {
    "ageRange": "25-45",
    "interests": ["marketing", "business", "technology"],
    "painPoints": ["time management", "scaling"],
    "behaviors": "engage with educational content"
  },
  "businessObjectives": [
    "increase engagement by 25%",
    "establish thought leadership",
    "drive traffic to website"
  ],
  "brandColors": ["#FF6B6B", "#4ECDC4"],
  "brandsToAnalyze": ["competitor1", "competitor2"],
  "blacklistedTopics": ["politics", "religion"],
  "postPreferences": {
    "types": ["carousel", "reels", "stories"],
    "frequency": "3x per week",
    "bestTimes": ["9am", "2pm", "7pm"]
  }
}
```

**Autopilot Config (JSON)**:
```json
{
  "enabled": true,
  "publishDays": ["Monday", "Wednesday", "Friday"],
  "publishTime": "09:00",
  "contentPerDay": 1,
  "researchMode": "concurrent",
  "fallbackOnError": "skip",
  "sendNotifications": true
}
```

---

### 3. Generated Content Table

```sql
CREATE TABLE generated_content (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  profileId TEXT NOT NULL,
  
  -- Pipeline Data (JSON snapshots at each phase)
  researchData JSON,        -- { competitors, webTrends, profileHistory, ... }
  analysisData JSON,        -- { voteScore, alignment%, insights, recommendedFramework, ... }
  
  -- Generated Output
  caption TEXT,
  hashtags TEXT,            -- "30#hashtagstyle #nexus #instagram"
  hooks JSON,               -- [{ option: 1, hook: "text" }, ...]
  
  -- Visual
  imageUrl TEXT,            -- URL or base64 (local: /images/content-{id}.jpg)
  imageMetadata JSON,       -- { width, height, format, size, ... }
  
  -- Publishing
  status TEXT DEFAULT 'draft',  -- 'draft' | 'pending_research_approval' | 'pending_analysis_approval'
                                -- | 'pending_caption_approval' | 'scheduled' | 'published' | 'failed'
  scheduledFor DATETIME,
  publishedAt DATETIME,
  publishAttempts INTEGER DEFAULT 0,
  lastPublishError TEXT,
  
  -- Instagram Response (after publish)
  instagramPostId TEXT,
  instagramMediaUrl TEXT,
  
  -- Metrics (cached from Instagram)
  metrics JSON DEFAULT '{}',  -- { likes, comments, shares, saves, reach, impressions, ... }
  metricsLastSyncedAt DATETIME,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  deletedAt DATETIME,  -- Soft delete
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId),
  INDEX idx_status (status),
  INDEX idx_scheduledFor (scheduledFor),
  INDEX idx_publishedAt (publishedAt),
  INDEX idx_createdAt (createdAt)
);
```

**Research Data (JSON)**:
```json
{
  "competitors": [
    {
      "username": "competitor1",
      "topPosts": [
        {
          "caption": "...",
          "engagement": 1250,
          "likes": 1000,
          "comments": 150,
          "shares": 100,
          "theme": "educational"
        }
      ],
      "averageEngagement": 850,
      "commonTopics": ["AI", "Business", "Marketing"],
      "postingFrequency": "daily"
    }
  ],
  "webTrends": [
    {
      "trend": "#AIMarketing",
      "volume": "High",
      "momentum": "Rising",
      "relevance": "High",
      "sources": ["Twitter", "TikTok", "LinkedIn"]
    }
  ],
  "profileHistory": {
    "lastPosts": [
      {
        "caption": "...",
        "type": "carousel",
        "engagement": 1500,
        "likes": 1200,
        "postedAt": "2026-04-05"
      }
    ],
    "averageEngagement": 1100,
    "bestPerformingType": "carousel",
    "growthRate": "+5% followers/week"
  },
  "researchSummary": "Audience responds well to educational carousels on AI/business topics. Competitors are posting daily with 800-1200 engagement. Best posting times: 9am and 7pm."
}
```

**Analysis Data (JSON)**:
```json
{
  "viralScore": 78,
  "viralScoreReasoning": "Aligns with trending #AIMarketing, educational carousel format, target audience engagement pattern",
  "alignmentScore": 92,
  "alignmentDetails": {
    "voiceMatch": 95,
    "toneMatch": 90,
    "objectiveAlignment": 90,
    "audienceRelevance": 90
  },
  "insights": [
    "Carousel format outperforms single post by 25%",
    "Morning posts (9am) get 40% more engagement",
    "Educational + actionable content drives shares"
  ],
  "recommendedFramework": {
    "framework": "Gary Vaynerchuk's Story-Telling",
    "rationale": "Profile audience responds to narrative-driven content that builds toward a CTA",
    "structure": {
      "hook": "First slide: problem/curiosity",
      "development": "Slides 2-4: solution/insights",
      "cta": "Last slide: call-to-action"
    }
  },
  "bestPostingTime": "2026-04-08T09:00:00Z",
  "squadInput": {
    "profileStrategist": "positioning: thought leader in AI for business",
    "analyticsAgent": "predicted engagement: 1400-1600 likes",
    "contentPlanner": "type: carousel (5 slides), hashtags: 15-20"
  }
}
```

---

### 4. Competitors Table

```sql
CREATE TABLE competitors (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  profileId TEXT NOT NULL,
  
  competitorUsername TEXT NOT NULL,
  competitorUserId TEXT,
  competitorProfileUrl TEXT,
  
  -- Analysis
  analysis JSON,  -- { topPosts, avgEngagement, postingFrequency, commonThemes, ... }
  
  -- Sync
  syncedAt DATETIME,
  
  -- Metadata
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId),
  INDEX idx_competitorUsername (competitorUsername),
  UNIQUE(profileId, competitorUsername)
);
```

---

### 5. Media Uploads Table

```sql
CREATE TABLE media_uploads (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  profileId TEXT NOT NULL,
  
  filename TEXT NOT NULL,
  mimeType TEXT,  -- 'image/jpeg', 'image/png', 'video/mp4'
  fileSizeBytes INTEGER,
  
  -- Storage
  url TEXT,  -- CDN or local path: /media/upload-{id}.{ext}
  metadata JSON,  -- { width, height, duration, ... }
  
  -- Usage
  usedInContentId TEXT,  -- Link to generated_content.id (nullable, reusable)
  
  -- Metadata
  uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId (profileId),
  INDEX idx_uploadedAt (uploadedAt)
);
```

---

### 6. Research Cache Table

```sql
CREATE TABLE research_cache (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  profileId TEXT NOT NULL,
  
  cacheType TEXT,  -- 'competitors' | 'webTrends' | 'profileHistory'
  cacheKey TEXT,   -- Unique identifier (e.g., "competitors_hashtag_marketing")
  
  data JSON,       -- Cached research data
  expiresAt DATETIME,  -- TTL
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  INDEX idx_profileId_cacheType (profileId, cacheType),
  INDEX idx_expiresAt (expiresAt)
);
```

**Cache Expiration Policy:**
- Competitors analysis: 24h TTL
- Web trends: 12h TTL
- Profile history: 6h TTL
- Background job runs daily at 2am to purge expired

---

### 7. Publication Schedule Table (Optional, pode estar em generated_content)

```sql
CREATE TABLE publication_schedule (
  id TEXT PRIMARY KEY DEFAULT (uuid()),
  profileId TEXT NOT NULL,
  contentId TEXT,
  
  scheduledFor DATETIME NOT NULL,
  status TEXT DEFAULT 'pending',  -- 'pending' | 'published' | 'failed' | 'cancelled'
  
  attempts INTEGER DEFAULT 0,
  lastAttemptAt DATETIME,
  lastError TEXT,
  
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profileId) REFERENCES instagram_profiles(id),
  FOREIGN KEY (contentId) REFERENCES generated_content(id),
  INDEX idx_scheduledFor (scheduledFor),
  INDEX idx_status (status)
);
```

---

## Indexes Summary

| Table | Field(s) | Reason |
|-------|----------|--------|
| users | email | Login query |
| instagram_profiles | userId | List user's profiles |
| instagram_profiles | instagramUserId | OAuth lookup |
| instagram_profiles | isConnected | Dashboard filter |
| generated_content | profileId | List profile's content |
| generated_content | status | Filter by approval stage |
| generated_content | scheduledFor | Cron scheduler |
| generated_content | publishedAt | Analytics time range |
| competitors | profileId | List competitors |
| media_uploads | profileId | List media |
| research_cache | profileId, cacheType | Quick lookups |
| publication_schedule | scheduledFor | Cron scheduler |

---

## Data Type Decisions

| Field | Type | Justification |
|-------|------|---------------|
| `id` (all PKs) | TEXT (UUID v4) | No sequential IDs (privacy), portable across DBs |
| `createdAt` / `updatedAt` | DATETIME | ISO 8601 format, timezone-aware |
| `JSON` fields | JSON or TEXT | SQLite supports JSON, allows flexible schema |
| `accessToken`, `refreshToken` | TEXT (encrypted) | AES-256-GCM, stored as base64 |
| `metrics` | JSON | Structured analytics: { likes, comments, ... } |
| Boolean fields | BOOLEAN | SQLite stores as 0/1 |

---

## Migration Strategy

### SQLite initialization (first run)

```javascript
// packages/backend/src/db/init.ts
import sqlite3 from 'better-sqlite3';
import fs from 'fs';

const db = new sqlite3('.nexus.db');

// Execute schema.sql
const schema = fs.readFileSync('./db/schema.sql', 'utf-8');
db.exec(schema);

db.close();
```

### Schema Versioning (if needed later)

```
migrations/
├── 001-initial-schema.sql    (v1.0)
├── 002-add-metrics.sql       (v1.1)
└── migration.json            (tracks current version)
```

---

## Data Encryption Specifics

### Instagram Tokens (AES-256-GCM)

```javascript
const crypto = require('crypto');

class TokenEncryption {
  constructor(encryptionKey: string) {
    this.key = Buffer.from(encryptionKey, 'base64'); // 32 bytes
  }

  encrypt(token: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv);
    
    let encrypted = cipher.update(token, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Format: base64(iv:encrypted:authTag)
    const combined = `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
    return Buffer.from(combined).toString('base64');
  }

  decrypt(encryptedToken: string): string {
    const combined = Buffer.from(encryptedToken, 'base64').toString();
    const [ivHex, encrypted, authTagHex] = combined.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    
    return decrypted;
  }
}
```

---

## Backup & Recovery

### Daily Backup Script

```bash
#!/bin/bash
# nexus-backup.sh (run at 3am via cron)

BACKUP_DIR="/var/backups/nexus"
DB_FILE="/app/.nexus.db"

# Create backup
DATE=$(date +%Y%m%d_%H%M%S)
cp $DB_FILE $BACKUP_DIR/nexus_$DATE.db

# Compress
gzip $BACKUP_DIR/nexus_$DATE.db

# Upload to S3 (example)
aws s3 cp $BACKUP_DIR/nexus_$DATE.db.gz s3://my-backup-bucket/

# Cleanup old backups (>30 days)
find $BACKUP_DIR -name "nexus_*.db.gz" -mtime +30 -delete
```

### Recovery

```bash
# Restore from backup
gzip -d /var/backups/nexus/nexus_20260407_030000.db.gz
cp /var/backups/nexus/nexus_20260407_030000.db /app/.nexus.db
# Restart backend
pm2 restart nexus-backend
```

---

## Query Performance Tips

### Avoid

❌ `SELECT * FROM generated_content;` — sempre filtrar por profileId  
❌ `SELECT COUNT(DISTINCT profileId);` — use cache se precisar stats

### Use

✅ `SELECT * FROM generated_content WHERE profileId = ? AND status IN (?, ?)` — indexed  
✅ `SELECT * FROM generated_content WHERE scheduledFor BETWEEN ? AND ? ORDER BY scheduledFor` — cron queries  
✅ Batch updates: `INSERT INTO research_cache (...) VALUES (...), (...), (...)` em vez de N inserts

---

**Próxima fase:** Após aprovação do @sm das histórias, @data-engineer pode refinar o schema com base em padrões de query observados.

Assinado: **Aria** 🏗️
