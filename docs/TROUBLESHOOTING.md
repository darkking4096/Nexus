# NEXUS Troubleshooting Guide

Common issues and solutions for NEXUS users and developers.

---

## Table of Contents

1. [Common Errors](#common-errors)
2. [Performance Issues](#performance-issues)
3. [Instagram Connection Issues](#instagram-connection-issues)
4. [Deployment Issues](#deployment-issues)
5. [Debugging Tips](#debugging-tips)

---

## Common Errors

### Error: "Unauthorized - Invalid Token"

**Symptoms:**
- API returns `401 Unauthorized`
- Cannot access profiles or content
- Logged in but features don't work

**Causes:**
- Session expired
- Token invalid or revoked
- Authentication header missing

**Solutions:**

1. **Clear browser cache and refresh:**
   ```bash
   # Or use browser DevTools → Application → Clear Storage
   ```

2. **Log out and log back in:**
   - Click your profile → Settings → Log Out
   - Clear cookies (optional)
   - Log back in

3. **Check token expiration:**
   - Access tokens expire in 1 hour
   - Should automatically refresh
   - If not, check browser console for errors

4. **Verify Authorization header:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/profiles
   ```

---

### Error: "Profile Not Found"

**Symptoms:**
- `404 Not Found` when accessing profile
- Profile disappears from dashboard
- Cannot generate content for profile

**Causes:**
- Profile was deleted/disconnected
- Profile ID is incorrect
- Instagram connection expired

**Solutions:**

1. **Reconnect profile:**
   - Go to Dashboard → "+ Connect Profile"
   - Re-authenticate with Instagram
   - Restore brand context settings

2. **Check Instagram connection status:**
   - Settings → Profile Details
   - Verify "Connected" status
   - Instagram token may have expired

3. **Clear profile from system:**
   ```bash
   # Developer only
   npm run cli -- delete-profile --profile-id={id}
   ```

---

### Error: "Content Generation Failed"

**Symptoms:**
- Generate button shows error
- No caption or hashtags generated
- API returns `422 Unprocessable Entity`

**Causes:**
- Missing profile context
- AI service unavailable
- Invalid content type

**Solutions:**

1. **Verify profile context:**
   - Go to Profile Settings
   - Ensure all fields filled:
     - Voice (Professional, Casual, Authoritative)
     - Tone (Friendly, Educational, Inspiring)
     - Target Audience
     - Objectives
   - Click Save

2. **Retry generation:**
   - Click "Generate" again
   - Wait 10-15 seconds
   - Check console for specific errors

3. **Check content type:**
   - Ensure image is uploaded
   - Try different content type (carousel vs. static)
   - Verify image format (JPG, PNG, WebP supported)

4. **Contact support:**
   - Email: support@nexus.app
   - Include error code from browser console
   - Share screenshot of error message

---

### Error: "Publication Failed"

**Symptoms:**
- Content stuck in "scheduled" status
- Published post doesn't appear on Instagram
- Email notification: "Publishing failed"

**Causes:**
- Instagram API rate limit exceeded
- Token expired or revoked
- Network connectivity issue
- Instagram's server issue

**Solutions:**

1. **Check Instagram connection:**
   ```
   Settings → Profiles → [Your Profile]
   Verify "Connected" status = Yes
   ```

2. **Wait and retry:**
   - Instagram may be temporarily unavailable
   - Click "Retry Publishing" button
   - Wait 5-10 minutes before manual retry

3. **Verify token is fresh:**
   - Go to Profile Settings
   - Click "Reauthorize with Instagram"
   - Follow OAuth flow
   - Try publishing again

4. **Check Instagram status:**
   - Visit https://status.instagram.com
   - Confirm Instagram API is operational
   - Look for service degradation notices

5. **Manual publish as backup:**
   - Copy caption from draft
   - Upload image to Instagram directly
   - Post manually if NEXUS continues failing

---

### Error: "Database Error"

**Symptoms:**
- `500 Internal Server Error`
- "Cannot write to database"
- Application becomes unresponsive

**Causes:**
- Disk full
- Database corruption
- Concurrent access issue
- Insufficient permissions

**Solutions:**

1. **Check disk space:**
   ```bash
   # Linux/macOS
   df -h
   # Should show > 100MB available in project directory
   
   # Windows
   # Settings → System → Storage
   ```

2. **Check database integrity:**
   ```bash
   npm run db:check-integrity
   # If fails:
   npm run db:repair
   ```

3. **Restart backend:**
   ```bash
   # Kill existing process
   pkill -f "npm run dev:backend"
   # Restart
   npm run dev:backend
   ```

4. **Restore from backup (if necessary):**
   ```bash
   npm run db:restore -- --backup-id={latest}
   ```

---

## Performance Issues

### Issue: "Slow API Response"

**Symptoms:**
- API endpoints take > 5 seconds
- Dashboard loads slowly
- Content generation hangs

**Causes:**
- High database query time
- Network latency
- Redis cache issues
- Background job overload

**Solutions:**

1. **Check API health:**
   ```bash
   curl http://localhost:5000/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Monitor database performance:**
   ```bash
   npm run db:analyze
   # Shows slow queries and indexing suggestions
   ```

3. **Clear Redis cache:**
   ```bash
   npm run cache:clear
   # Restarts Redis connection
   ```

4. **Check background jobs:**
   ```bash
   npm run jobs:status
   # View queue depth and processing status
   ```

5. **Monitor system resources:**
   ```bash
   # Check CPU and memory
   top              # macOS/Linux
   Task Manager     # Windows
   
   # Should be: CPU < 80%, Memory < 1GB
   ```

---

### Issue: "Gzip Compression Reduced Effectiveness"

**Symptoms:**
- API response size larger than expected
- Bandwidth usage high despite compression
- Network tab shows uncompressed responses

**Causes:**
- Compression disabled
- Responses too small (< 1KB threshold)
- Incompatible client

**Solutions:**

1. **Verify compression is enabled:**
   ```bash
   # Check middleware in packages/backend/src/middleware/compression.middleware.ts
   # Should compress responses > 1KB
   ```

2. **Check response size:**
   ```bash
   curl -i -H "Accept-Encoding: gzip" http://localhost:5000/api/profiles
   # Look for: Content-Encoding: gzip
   ```

3. **Monitor compression metrics:**
   ```bash
   npm run metrics:compression
   # Shows average compression ratio and savings
   ```

---

### Issue: "High Memory Usage"

**Symptoms:**
- Node process uses > 500MB memory
- Application becomes unresponsive
- Browser freezes when loading

**Causes:**
- Memory leak in cache
- Large batch operations
- Inefficient queries
- Unclosed database connections

**Solutions:**

1. **Restart services:**
   ```bash
   npm run restart:backend
   npm run restart:frontend
   ```

2. **Clear cache:**
   ```bash
   npm run cache:clear
   ```

3. **Check for memory leaks:**
   ```bash
   node --inspect packages/backend/src/index.ts
   # Open chrome://inspect to analyze heap
   ```

4. **Optimize batch operations:**
   - Reduce batch size from 1000 to 100 items
   - Implement pagination
   - Process in chunks

---

## Instagram Connection Issues

### Issue: "Instagram Token Expired"

**Symptoms:**
- Cannot publish to Instagram
- Error: "Invalid access token"
- Profile shows "Disconnected"

**Causes:**
- OAuth token expires after ~60 days
- User revoked permission in Instagram settings
- Instagram reset token for security

**Solutions:**

1. **Reauthorize with Instagram:**
   - Go to Profile Settings
   - Click "Reauthorize"
   - Complete OAuth flow
   - Token refreshes automatically

2. **Check Instagram permissions:**
   - Visit https://www.instagram.com/accounts/apps_and_websites/
   - Find NEXUS in approved apps
   - Click remove if necessary
   - Reconnect profile in NEXUS

3. **Verify Instagram Business Account:**
   - Must be Business account (not Creator/Personal)
   - Check: Settings → Account → Account Type
   - Switch to Business if needed (takes ~24 hours)

---

### Issue: "Permission Denied - Instagram API"

**Symptoms:**
- Error: "Insufficient permissions"
- Cannot access profile insights
- Cannot publish content

**Causes:**
- Insufficient OAuth scopes granted
- Instagram app not approved for features
- Account type not Business

**Solutions:**

1. **Check approved permissions:**
   - Visit https://instagram.com/accounts/apps_and_websites/
   - Find NEXUS app
   - Verify permissions include:
     - instagram_basic
     - instagram_graph_user_media
     - pages_read_engagement
     - pages_read_user_content

2. **Disconnect and reconnect:**
   - Profile Settings → "Disconnect Profile"
   - "+ Connect Profile" → Complete OAuth
   - Re-grant all permissions

3. **Upgrade to Business Account:**
   - Instagram settings → Account → Account Type
   - Switch from Creator to Business
   - Takes up to 24 hours to process
   - Reconnect after switching

---

### Issue: "Cannot See Analytics Data"

**Symptoms:**
- Analytics page is empty
- No engagement metrics
- "No data available"

**Causes:**
- Instagram insights not shared via API
- Insufficient time since posting (< 1 hour)
- API rate limit exceeded

**Solutions:**

1. **Wait for data to populate:**
   - Instagram updates insights every 1-2 hours
   - Check again after 2 hours
   - Allow 24 hours for complete metrics

2. **Check API rate limits:**
   ```bash
   npm run analytics:check-quota
   # Shows API calls used vs. limit
   ```

3. **Verify insights access:**
   - Instagram Business Dashboard → Insights
   - Should see engagement metrics there
   - NEXUS fetches from same source

---

### Issue: "Instagram Rate Limit Exceeded"

**Symptoms:**
- Error: "Rate limit exceeded"
- Cannot publish multiple posts
- API returns `429 Too Many Requests`

**Causes:**
- Too many API calls in short time
- Instagram daily posting limit (varies by account age)
- API quota exhausted

**Solutions:**

1. **Space out publishing:**
   - Instagram allows 1 post per profile per ~2 hours
   - Use Scheduling feature (spread across days)
   - Wait 2 hours before next publish attempt

2. **Check daily limits:**
   ```bash
   npm run analytics:check-instagram-limits
   # Shows posts remaining today
   ```

3. **Contact Instagram support:**
   - If limit seems incorrect
   - Business account age affects limits
   - New accounts have lower limits initially

---

## Deployment Issues

### Issue: "Database Path Not Found"

**Symptoms:**
- Error: "Cannot open database"
- Production database missing
- Application crashes on startup

**Causes:**
- `.env` path incorrect
- Directory doesn't exist
- Permissions issue

**Solutions:**

1. **Verify `.env` setting:**
   ```bash
   # .env should contain:
   DATABASE_PATH=/var/data/nexus.db
   # or: ./data/nexus.db
   ```

2. **Create directory and initialize:**
   ```bash
   mkdir -p /var/data
   npm run db:init
   # or: npm run db:init -- --path=/var/data/nexus.db
   ```

3. **Check permissions:**
   ```bash
   # Application must have read/write permissions
   chmod 755 /var/data
   chmod 644 /var/data/nexus.db
   ```

---

### Issue: "Environment Variable Not Set"

**Symptoms:**
- Error: "JWT_ACCESS_SECRET is undefined"
- Tokens not created
- Encryption fails

**Causes:**
- `.env` file missing
- Variable misspelled
- Not sourced on startup

**Solutions:**

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

2. **Generate required secrets:**
   ```bash
   # JWT secrets (run twice, different values)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   
   # Encryption key
   openssl rand -hex 32
   ```

3. **Update `.env` with values:**
   ```bash
   JWT_ACCESS_SECRET=<generated-value>
   JWT_REFRESH_SECRET=<generated-value>
   ENCRYPTION_KEY=<generated-value>
   ```

4. **Verify on startup:**
   ```bash
   npm run validate-env
   # Should list all required vars
   ```

---

### Issue: "Redis Connection Failed"

**Symptoms:**
- Warning: "Cannot connect to Redis"
- Caching disabled
- Performance impact (non-critical)

**Causes:**
- Redis not running
- Wrong host/port
- Network connectivity issue

**Solutions:**

1. **Check Redis is running:**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Start Redis:**
   ```bash
   # macOS with Homebrew
   brew services start redis
   
   # Linux
   sudo service redis-server start
   
   # Docker
   docker run -d -p 6379:6379 redis
   ```

3. **Update `.env`:**
   ```bash
   REDIS_HOST=localhost
   REDIS_PORT=6379
   REDIS_PASSWORD=  # leave empty if no password
   ```

4. **Verify connection:**
   ```bash
   npm run cache:check
   # Should return: "Connected to Redis at localhost:6379"
   ```

**Note:** If Redis unavailable, application still functions with in-memory caching (with reduced performance).

---

## Debugging Tips

### Enable Debug Logging

```bash
# Set debug level
DEBUG=nexus:* npm run dev:backend

# For specific module
DEBUG=nexus:analytics npm run dev:backend
```

### View Application Logs

```bash
# Real-time logs
tail -f logs/nexus.log

# Last 100 lines
tail -100 logs/nexus.log

# Search for errors
grep "ERROR" logs/nexus.log
```

### Browser DevTools

1. **Open DevTools:** F12 or Cmd+Option+I
2. **Check Console tab:**
   - Look for red error messages
   - Check for CORS issues
   - Verify API calls in Network tab

3. **Network tab:**
   - Monitor API requests
   - Check response status codes
   - View request/response payloads

4. **Application tab:**
   - View localStorage (tokens)
   - Check sessionStorage
   - Inspect IndexedDB (if used)

### Database Debugging

```bash
# Open SQLite CLI
npm run db:cli

# View table structure
.schema generated_content

# Query recent content
SELECT id, caption, status FROM generated_content LIMIT 10;

# Find slow queries
EXPLAIN QUERY PLAN SELECT ...
```

### Performance Profiling

```bash
# Backend CPU/memory profiling
node --prof packages/backend/src/index.ts
# Generates isolate-*.log file
node --prof-process isolate-*.log > profile.txt

# View results
cat profile.txt | head -50
```

### API Endpoint Testing

```bash
# Test with curl
curl -X GET http://localhost:5000/api/profiles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or use REST Client (VS Code extension)
# Create .rest file and run inline tests
```

### Reset Application State

```bash
# Clear all data and start fresh
npm run reset:all

# Or selective reset
npm run reset:cache
npm run reset:database
```

---

## Getting Help

### Before Contacting Support

1. Check this troubleshooting guide
2. Search existing GitHub Issues
3. Review console logs for specific errors
4. Reproduce issue with minimal steps

### Contact Support

**Email:** support@nexus.app  
**Response Time:** Within 24 hours  
**Include in report:**
- Error message (exact text)
- Steps to reproduce
- Browser/OS version
- Recent changes before error

### Community

- **Slack:** Join #support channel
- **GitHub Discussions:** Share & discuss issues
- **Office Hours:** Thursdays 2 PM EST

---

## Known Issues

### Issue: Occasional "Connection Timeout"

**Status:** Known, investigating  
**Workaround:** Retry operation after 30 seconds  
**Fix ETA:** Next release (2026-05-01)

### Issue: Autopilot sometimes skips publication

**Status:** Known, low priority  
**Workaround:** Manually publish skipped content  
**Fix ETA:** Backlog (investigating root cause)

---

## Quick Reference

| Problem | Quick Fix |
|---------|-----------|
| Slow page loads | Clear cache, restart backend |
| API errors | Check token, verify permissions |
| Can't publish | Reauth Instagram, check quota |
| Database issues | Run `npm run db:repair` |
| Redis errors | Safe to ignore if not critical |
| Token expired | Log out, log back in |

