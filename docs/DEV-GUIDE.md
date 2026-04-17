# NEXUS Developer Guide

Complete guide for developers setting up and extending the NEXUS platform.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Local Setup](#local-setup)
3. [Database Schema](#database-schema)
4. [API Structure](#api-structure)
5. [Testing](#testing)
6. [Deployment](#deployment)

---

## Architecture Overview

### System Design

NEXUS is a full-stack application following a **3-tier architecture**:

```
┌─────────────────────┐
│   Frontend (React)  │  Vite + React 18 + Tailwind CSS
│   Port: 5173        │
└──────────┬──────────┘
           │ HTTP/REST
           │
┌──────────▼──────────┐
│  Backend (Express)  │  Express.js + Node.js
│   Port: 5000        │  TypeScript
│  ├─ Routes          │
│  ├─ Middleware      │
│  ├─ Services        │
│  └─ Models          │
└──────────┬──────────┘
           │ SQLite
           │ Redis (Cache)
┌──────────▼──────────┐
│  Data Layer         │
│  ├─ SQLite DB       │  Local file: data/nexus.db
│  ├─ Redis Cache     │  (Optional, default: localhost:6379)
│  └─ File Storage    │  /uploads directory
└─────────────────────┘
```

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 18+ |
| **Build Tool** | Vite | Latest |
| **Styling** | Tailwind CSS | 3+ |
| **Backend** | Express.js | 4+ |
| **Runtime** | Node.js | 18+ |
| **Language** | TypeScript | 5+ |
| **Database** | SQLite | 3+ |
| **Cache** | Redis | 6+ (optional) |
| **Testing** | Vitest + Playwright | Latest |
| **Linting** | ESLint + Prettier | Latest |

---

## Local Setup

### Prerequisites

- **Node.js 18+** → [Download](https://nodejs.org/)
- **npm 9+** → Comes with Node.js
- **Git** → [Download](https://git-scm.com/)
- **SQLite3** (optional) → Pre-installed on macOS/Linux, via WSL on Windows
- **Redis** (optional) → For caching; defaults to in-memory if unavailable

### Step 1: Clone Repository

```bash
git clone https://github.com/your-org/nexus.git
cd nexus
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

This installs dependencies for both backend and frontend (monorepo setup).

### Step 3: Environment Setup

Create `.env` in the project root:

```bash
# Backend Configuration
BACKEND_PORT=5000
NODE_ENV=development

# Database
DATABASE_PATH=./data/nexus.db

# Authentication (Generate with: openssl rand -hex 32)
JWT_ACCESS_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
ENCRYPTION_KEY=your-32-char-encryption-key

# Cache (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Instagram API (if using real Instagram integration)
INSTAGRAM_CLIENT_ID=your-app-id
INSTAGRAM_CLIENT_SECRET=your-secret
INSTAGRAM_REDIRECT_URI=http://localhost:5173/auth/callback

# Frontend
VITE_API_URL=http://localhost:5000
VITE_APP_NAME=NEXUS

# Allowed Origins (CORS)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

#### Generate Secure Keys

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate encryption key (32 bytes = 64 hex chars)
openssl rand -hex 32
```

### Step 4: Initialize Database

```bash
npm run db:init
```

This creates `data/nexus.db` with all required tables.

### Step 5: Start Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
# Runs on http://localhost:5173
```

Visit **http://localhost:5173** in your browser.

### Step 6: Verify Setup

```bash
# Health check
curl http://localhost:5000/health

# Should return:
# {"status":"ok","timestamp":"2026-04-17T10:00:00.000Z"}
```

---

## Database Schema

### ERD (Entity Relationship Diagram)

See [DATA-MODEL.md](./architecture/DATA-MODEL.md) for complete schema with migrations.

### Key Tables

**users**
```sql
id (TEXT, PK)
email (TEXT, UNIQUE)
passwordHash (TEXT)
createdAt (DATETIME)
```

**instagram_profiles**
```sql
id (TEXT, PK)
userId (TEXT, FK → users.id)
username (TEXT)
accessToken (TEXT, encrypted)
context (JSON) -- {voice, tone, targetAudience, objectives}
mode (TEXT) -- 'manual' | 'autopilot'
```

**generated_content**
```sql
id (TEXT, PK)
profileId (TEXT, FK → instagram_profiles.id)
caption (TEXT)
hashtags (TEXT array)
status (TEXT) -- 'draft' | 'scheduled' | 'published'
scheduledFor (DATETIME)
publishedAt (DATETIME)
metrics (JSON)
```

### Indexes

For performance, these indexes are created:
- `idx_users_email` on `users.email`
- `idx_profiles_userId` on `instagram_profiles.userId`
- `idx_content_profileId` on `generated_content.profileId`
- `idx_content_status` on `generated_content.status`

### Running Migrations

```bash
# Create new migration
npm run db:migrate:create -- --name="AddNewTable"

# Apply all pending migrations
npm run db:migrate:up

# Rollback last migration
npm run db:migrate:down
```

---

## API Structure

### Folder Structure

```
packages/backend/src/
├── config/           # Database, encryption, env config
├── middleware/       # Auth, validation, error handling, compression
├── models/          # TypeScript interfaces and types
├── routes/          # API endpoint handlers
│   ├── auth.ts      # Authentication endpoints
│   ├── profiles.ts  # Profile management
│   ├── content.ts   # Content generation and management
│   ├── analytics.ts # Analytics and metrics
│   └── ...          # Other feature routes
├── services/        # Business logic
│   ├── AnalyticsService.ts
│   ├── CaptionGenerator.ts
│   ├── AutopilotService.ts
│   └── ...          # Other services
├── utils/           # Utilities and helpers
├── context.ts       # Application context
└── index.ts         # Server entry point
```

### Middleware Pattern

All routes follow this middleware pattern:

```typescript
// Example: Authentication middleware
export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({error: 'Unauthorized'});
  
  try {
    req.user = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    next();
  } catch (err) {
    res.status(401).json({error: 'Invalid token'});
  }
}
```

### Example Service

```typescript
/**
 * AnalyticsService - Fetch and calculate analytics metrics
 * 
 * Responsibilities:
 * - Retrieve profile metrics from Instagram API
 * - Calculate engagement rates and trends
 * - Generate recommendations
 */
export class AnalyticsService {
  /**
   * Get profile metrics for given period
   * @param profileId - Instagram profile ID
   * @param period - '7d' | '30d' | '90d'
   * @returns Engagement metrics and trending data
   */
  async getMetrics(profileId: string, period: string) {
    // Implementation...
  }
}
```

### Adding New Endpoints

1. Create route handler in `routes/feature.ts`:
```typescript
export function createFeatureRoutes(db) {
  const router = express.Router();
  
  router.post('/', authMiddleware, async (req, res) => {
    // Implementation
  });
  
  return router;
}
```

2. Register in `index.ts`:
```typescript
app.use('/api/feature', createFeatureRoutes(db));
```

3. Add tests in `routes/__tests__/feature.test.ts`

---

## Testing

### Run All Tests

```bash
# Unit tests
npm run test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage
```

### Test Structure

```
packages/backend/src/__tests__/
├── services/          # Service unit tests
├── routes/            # Route integration tests
└── utils/             # Utility function tests

packages/frontend/src/__tests__/
├── components/        # Component tests
├── hooks/             # Custom hook tests
└── utils/             # Utility tests
```

### Example Unit Test

```typescript
// services/__tests__/AnalyticsService.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { AnalyticsService } from '../AnalyticsService';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  
  beforeEach(() => {
    service = new AnalyticsService();
  });
  
  it('should calculate engagement rate correctly', () => {
    const result = service.calculateEngagementRate(100, 5000);
    expect(result).toBe(0.02);
  });
});
```

### Running Specific Tests

```bash
# Test a single file
npm run test -- services/AnalyticsService.test.ts

# Test matching a pattern
npm run test -- --grep "AnalyticsService"

# Show coverage for specific file
npm run test:coverage -- services/AnalyticsService.ts
```

### Linting

```bash
# Check for lint errors
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Type checking
npm run typecheck
```

---

## Deployment

### Building for Production

```bash
# Build both frontend and backend
npm run build

# Build individual packages
npm run build:backend
npm run build:frontend
```

### Environment Variables (Production)

Update `.env` for production:

```bash
# Use secure, randomly generated secrets
JWT_ACCESS_SECRET=<secure-random-key>
JWT_REFRESH_SECRET=<secure-random-key>
ENCRYPTION_KEY=<secure-random-key>

# Production database (consider managed service)
DATABASE_PATH=/var/data/nexus.db

# Production redis
REDIS_HOST=redis.production.internal
REDIS_PASSWORD=<secure-password>

# HTTPS + secure domains
ALLOWED_ORIGINS=https://nexus.app,https://app.nexus.app

# Production Instagram credentials
INSTAGRAM_REDIRECT_URI=https://nexus.app/auth/callback
```

### Staging Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
npm run test:e2e:staging
```

### Production Deployment

```bash
# Deploy to production
npm run deploy:production

# Verify deployment
curl https://api.nexus.app/health
```

### Database Migrations (Production)

```bash
# Always backup before migrating
npm run db:backup

# Apply migrations
npm run db:migrate:up

# Rollback if needed
npm run db:migrate:down
```

### Monitoring

- **Logs:** `tail -f logs/nexus.log`
- **Metrics:** Prometheus endpoint at `/metrics`
- **Status Page:** https://status.nexus.app
- **Alerts:** Configured via PagerDuty

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create route handler** in `src/routes/feature.ts`
2. **Add service logic** in `src/services/FeatureService.ts`
3. **Write tests** in `src/__tests__/`
4. **Register route** in `src/index.ts`
5. **Document in API.md**

### Adding Authentication to an Endpoint

```typescript
import { authMiddleware } from '../middleware/auth';

router.post('/protected', authMiddleware, async (req, res) => {
  // req.user is now available
  const userId = req.user.id;
});
```

### Working with Database Queries

```typescript
import { appContext } from '../context';

const db = appContext.database;
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
```

### Using Cache

```typescript
import { appContext } from '../context';

const cache = appContext.cache;

// Set cache
await cache.set('key', value, 3600); // 1 hour TTL

// Get cache
const cached = await cache.get('key');

// Delete cache
await cache.delete('key');
```

### Error Handling Pattern

```typescript
try {
  const result = await someAsyncOperation();
  res.json({ success: true, data: result });
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Operation failed',
    code: 'INTERNAL_ERROR',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
}
```

---

## Performance Optimization

### Caching Strategy

- **Profiles:** 5 minute cache
- **Content:** 1 hour cache
- **Analytics:** 1 hour cache
- **Search results:** 30 minute cache

### Database Optimization

- Use prepared statements (protection + performance)
- Create indexes for frequently queried columns
- Batch operations when possible
- Monitor slow queries: `npm run db:analyze`

### API Response Compression

- Gzip enabled for responses > 1KB
- Compression metrics logged (avg compression ratio: 65-75%)

---

## Troubleshooting

### Database Connection Error

```
Error: Cannot open database: data/nexus.db
```

**Solution:**
```bash
mkdir -p data
npm run db:init
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000
kill -9 <PID>
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running:
brew services start redis  # macOS
sudo service redis-server start  # Linux
```

### Test Failures

```bash
# Clear test cache
npm run test -- --clearCache

# Run with verbose output
npm run test -- --reporter=verbose
```

---

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Follow existing code patterns
3. Write tests for new functionality
4. Ensure lint and type checks pass: `npm run lint && npm run typecheck`
5. Create a pull request with a clear description

---

## Support

- **Issues:** GitHub Issues
- **Email:** dev-support@nexus.app
- **Slack:** #development channel

