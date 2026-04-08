# Instagram Setup Guide — NEXUS Platform

## Overview

NEXUS integrates with Instagram through two complementary services:

1. **Instagrapi** (Python) — Data extraction and account validation
2. **Playwright** (Node.js) — Browser automation for publishing

This guide covers installation, configuration, and troubleshooting.

---

## Part 1: Instagrapi Setup (Profile Connection)

### Prerequisites

- Python 3.9+
- Instagram account (Business or Creator type)
- Valid credentials (username/password)

### Installation

1. **Navigate to backend Python environment:**
   ```bash
   cd packages/backend
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r python/requirements.txt
   ```

   The `requirements.txt` includes:
   - `instagrapi==2.1.2` — Instagram API library
   - `flask==3.0.0` — Microservice framework
   - `requests==2.31.0` — HTTP client
   - `python-dotenv==1.0.0` — Environment variable loading

3. **Create `.env` file (if not exists):**
   ```bash
   cp python/.env.example python/.env
   ```

   Add these variables:
   ```
   INSTA_SERVICE_PORT=5001
   ```

### Running the Service

**Development:**
```bash
cd packages/backend
python python/insta_client.py
```

Expected output:
```
 * Running on http://localhost:5001
```

**Production (with Gunicorn):**
```bash
gunicorn --bind 0.0.0.0:5001 python.insta_client:app
```

### Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `INSTA_SERVICE_PORT` | `5001` | Port to run Flask service |
| `ENCRYPTION_KEY` | (required) | AES-256 key for session encryption (backend config) |

**Important:** `ENCRYPTION_KEY` is configured in Node backend, not Python service.

---

## Part 2: Node Backend Configuration

### Environment Variables

Create `.env` in `packages/backend/`:

```env
# Database
DATABASE_URL=sqlite://./data/nexus.db

# Instagram Service
PYTHON_SERVICE_URL=http://localhost:5001

# Encryption
ENCRYPTION_KEY=your-32-byte-hex-key-here

# JWT
JWT_SECRET=your-secret-here

# API
PORT=3000
```

### ENCRYPTION_KEY Generation

Generate a 32-byte random key:

```bash
# macOS/Linux
openssl rand -hex 16

# Or use Node:
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

The output is a 32-character hex string (16 bytes = 128 bits). For AES-256 you can also generate 64-char hex (256 bits).

### Starting Backend

```bash
npm run dev
```

The backend will:
1. Connect to SQLite database
2. Create schema (auto migrations)
3. Start Express server on port 3000
4. Ready to accept profile connections

---

## Part 3: Connecting an Instagram Account

### Requirements

- **Account Type:** Business or Creator (personal accounts NOT supported)
- **2FA Status:** 2FA must be DISABLED (not supported yet)
- **Test Account:** Use a test account, not your personal Instagram

### API Call

```bash
curl -X POST http://localhost:3000/api/profiles/connect \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "your_instagram_username",
    "password": "your_instagram_password"
  }'
```

### Success Response

```json
{
  "message": "Instagram account connected successfully",
  "profile": {
    "id": "profile-uuid",
    "user_id": "user-uuid",
    "instagram_username": "your_instagram_username",
    "instagram_id": "123456789",
    "followers_count": 1500,
    "bio": "Your bio here",
    "profile_picture_url": "https://instagram.com/...",
    "created_at": "2026-04-08T10:30:00Z"
  }
}
```

### Error Responses

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Missing username or password | Incomplete request |
| 401 | Invalid Instagram credentials | Wrong username/password |
| 403 | PERSONAL_ACCOUNT_NOT_SUPPORTED | Account is personal (not Business/Creator) |
| 409 | Already connected to another user | Account claimed by different user |
| 429 | Too many connection attempts | Rate limited (3/5 min) |

---

## Part 4: Rate Limiting & Security

### Connection Rate Limiting

- **Limit:** 3 connection attempts per 5 minutes
- **Per:** IP address (via Express rate-limit middleware)
- **Reset:** Automatic after 5-minute window

### Credential Security

- Credentials are **never** stored in plaintext
- Session data is encrypted with AES-256-GCM
- Encryption key is loaded from environment (`ENCRYPTION_KEY`)
- Decryption happens on-demand for publishing operations only

### Best Practices

1. **Use App Passwords:** If Instagram supports app-specific passwords, use them instead of account password
2. **Test Accounts:** Never use personal Instagram account for testing/development
3. **Rotate Keys:** Change `ENCRYPTION_KEY` periodically in production
4. **Monitor Logs:** Watch for repeated failed connection attempts (security signal)

---

## Part 5: Troubleshooting

### Python Service Won't Start

**Error:** `ModuleNotFoundError: No module named 'instagrapi'`

**Solution:**
```bash
# Make sure you're in the right directory
cd packages/backend
pip install -r python/requirements.txt
```

### Connection to Python Service Fails

**Error:** `Failed to connect to Instagram service: ECONNREFUSED`

**Solution:**
1. Verify Python service is running:
   ```bash
   ps aux | grep insta_client.py
   ```
2. Check port 5001 is accessible:
   ```bash
   curl http://localhost:5001/health
   ```
3. Verify `PYTHON_SERVICE_URL` in Node `.env` matches service URL

### "Account is not Business/Creator"

**Cause:** Personal Instagram accounts not supported

**Solution:** Convert to Business account:
1. Open Instagram app
2. Settings → Account type and tools → Switch to Professional Account
3. Choose "Business" or "Creator"
4. Try connecting again

### "Too many connection attempts"

**Cause:** Rate limit exceeded (3 attempts per 5 minutes)

**Solution:** Wait 5 minutes and retry

### 2FA Enabled Error

**Status:** Not supported in v1 (future story)

**Workaround:** Temporarily disable 2FA on test account

---

## Part 6: Database Schema

The integration creates these tables:

### `profiles` (existing, extended)
```sql
- instagram_id TEXT
- instagram_username TEXT UNIQUE
- access_token TEXT (encrypted session)
- bio TEXT
- profile_picture_url TEXT
- followers_count INTEGER
```

### `insta_sessions` (new)
```sql
CREATE TABLE insta_sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  session_data TEXT NOT NULL,  -- encrypted JSON
  last_used_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Sessions are automatically created and updated when connecting accounts.

---

## Part 7: Next Steps

### For Development

1. Start Python service: `python python/insta_client.py`
2. Start Node backend: `npm run dev`
3. Connect test Instagram account via API
4. Monitor `docs/qa/logs/` for connection logs

### For Production

1. Use Gunicorn or similar for Python service (not `flask run`)
2. Set strong `ENCRYPTION_KEY` and `JWT_SECRET`
3. Enable HTTPS for all API calls
4. Monitor rate limiting metrics
5. Set up log aggregation for failed connections

---

## References

- [Instagrapi Documentation](https://subzerocool.github.io/instagrapi/)
- [Instagram Business Account Requirements](https://www.instagram.com/business/)
- [NEXUS Platform Docs](./README.md)

---

**Last Updated:** 2026-04-08  
**Owner:** @qa (QA Review)  
**Status:** Live (Story 1.2)
