# Playwright Setup Guide — NEXUS Publishing

## Overview

Playwright powers the Instagram publishing automation in NEXUS. It handles browser automation with realistic human-like delays to avoid bot detection.

This guide covers installation, configuration, and selector maintenance.

---

## Part 1: Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Chromium (auto-installed by Playwright)

### Setup

```bash
# Install Playwright (if not already installed)
cd packages/backend
npm install playwright

# Verify installation
npx playwright --version
```

Playwright auto-installs Chromium browser. Total size: ~300MB.

---

## Part 2: Service Configuration

### Environment Variables

Create `.env` in `packages/backend/`:

```env
# Playwright configuration
HEADLESS=true              # true: headless mode, false: show browser window
PLAYWRIGHT_TIMEOUT=60000   # Timeout in ms (default: 60s)
```

**Headless Mode:**
- `true` (default) — Run without UI (faster, production)
- `false` — Show browser window (debugging)

### Starting Backend

The Playwright service starts automatically when Express starts:

```bash
npm run dev
```

---

## Part 3: Instagram Selectors Reference

### Current Selectors (2026-04)

| Element | Selector | Notes |
|---------|----------|-------|
| Create button | `[aria-label="Create"]` | Top-left navigation, opens creation dialog |
| Select multiple | `button:has-text("Select multiple")` | Carousel/multi-image mode |
| Next button | `button:has-text("Next")` | Move to caption screen |
| Share button | `button:has-text("Share")` | Publish post |
| Caption input | `textarea[aria-label="Write a caption..."]` | Where caption goes |
| File input | `input[type="file"]` | Hidden input for image upload |

### Why Selectors Change

Instagram updates UI frequently. If selectors fail:

1. **Screenshot & Inspect** (Developer Mode):
   ```bash
   HEADLESS=false npm run dev  # Show browser
   # Navigate to Instagram, inspect element you need
   ```

2. **Find Selector** using DevTools (F12):
   - Right-click element → Inspect
   - Copy CSS selector
   - Test with Playwright

3. **Update** `PlaywrightService.ts` with new selector

---

## Part 4: Anti-Bot Behavior

### Human-Like Delays

All actions include realistic delays:

```typescript
// 1-5 second delay between major actions
await humanDelay(1000, 5000);

// 50-200ms delay between character typing
for (const char of caption) {
  await page.keyboard.type(char);
  await humanDelay(50, 200);
}
```

### Mouse Movements

Before clicking, move mouse to element:

```typescript
const element = await page.$(selector);
const box = await element.boundingBox();
await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
await humanDelay(100, 500);
await page.click(selector);
```

### Viewport Randomization

Browser viewport varies to mimic real users:

```typescript
const viewportSizes = [
  { width: 1920, height: 1080 },
  { width: 1366, height: 768 },
  { width: 1536, height: 864 },
];
const randomViewport = viewportSizes[Math.floor(Math.random() * viewportSizes.length)];
await page.setViewportSize(randomViewport);
```

---

## Part 5: Session Management

### How Sessions Work

1. **Create Session** (Instagrapi)
   - Python service logs into Instagram
   - Extracts cookies and session state
   - Encrypts and stores in database

2. **Load Session** (Playwright)
   - Retrieves encrypted session from database
   - Decrypts in Node backend
   - Adds cookies to browser context
   - Navigates to Instagram (already logged in)

3. **Publish**
   - Open new post dialog
   - Upload image(s)
   - Add caption
   - Click Share

### Session Expiration

- Instagram sessions expire after ~30 days
- If login page appears, session is invalid
- Browser will throw error, triggering new login
- Retry logic handles this automatically

---

## Part 6: Troubleshooting

### "File input not found — Instagram UI may have changed"

**Cause:** Instagram updated file upload UI  
**Solution:**

1. Open DevTools (F12) on Instagram
2. Navigate to post creation
3. Find `<input type="file">` element
4. Update selector in `PlaywrightService.ts`

### "Session cookies invalid or expired"

**Cause:** Session expired or account changed  
**Solution:**

1. User needs to reconnect Instagram account (Story 1.2)
2. New session will be created
3. Publishing can resume

### Browser Timeout

**Error:** `Timeout 60000ms exceeded`  
**Cause:** Instagram slow or blocked  
**Solution:**

1. Increase `PLAYWRIGHT_TIMEOUT` in `.env`
2. Check network (might be rate-limited)
3. Try again later (Instagram has rate limits)

### "Too many requests" from Instagram

**Cause:** Rate limiting (max 5-10 posts/hour)  
**Solution:**

1. Wait at least 1 hour before next publish
2. Retry logic in PublishService handles exponential backoff
3. Consider batch scheduling (tech debt for Story 1.5+)

---

## Part 7: Debugging

### Enable Verbose Logging

```bash
# Show Playwright debug info
DEBUG=pw:api npm run dev
```

### Run with Browser UI (Debugging)

```bash
# Set HEADLESS=false to see what Playwright sees
HEADLESS=false npm run dev

# Then publish in another terminal:
curl -X POST http://localhost:3000/api/content/publish \
  -H "Authorization: Bearer TOKEN" \
  -d '{"contentId": "...", "profileId": "..."}'
```

Browser window shows:
- Click actions
- Typing
- Delays
- Navigation

### Screenshot on Failure

Add to PlaywrightService for debugging:

```typescript
catch (error) {
  // Capture screenshot for debugging
  if (this.page) {
    await this.page.screenshot({ path: 'debug-failure.png' });
  }
  throw new Error(`Failed: ${error.message}`);
}
```

---

## Part 8: Performance Notes

| Operation | Time | Notes |
|-----------|------|-------|
| Browser launch | 3-5s | Happens once per publish |
| Image upload | 10-30s | Depends on file size |
| Human delays | 10-20s | Anti-bot behavior |
| **Total flow** | **30-60s** | Note: long timeout needed |

**Important:** Express default timeout is 30s. Story 1.3 may need timeout override in production.

---

## Part 9: Next Steps

### For Development

1. Test with real Instagram account (if available)
2. Monitor `publish_logs` table for errors
3. Update selectors if Instagram UI changes

### For Production

1. Verify `HEADLESS=true` in production env
2. Enable verbose logging for 24hrs to catch selector changes
3. Monitor rate limits (create job queue for scheduling)
4. Consider visual detection for selector resilience

---

## References

- [Playwright Documentation](https://playwright.dev/)
- [Playwright Selectors](https://playwright.dev/docs/locators)
- [Instagram Business API](https://developers.facebook.com/docs/instagram-api)
- [NEXUS Publishing Docs](./README.md)

---

**Last Updated:** 2026-04-08  
**Status:** Live (Story 1.3)  
**Maintained By:** @dev (Dex)
