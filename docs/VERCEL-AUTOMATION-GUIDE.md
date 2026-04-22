# Vercel Automation Guide — Story 8.1.3

**Automated Deployment Setup with Playwright + Vercel API**

---

## 🚀 Quick Start

```bash
# Automated setup (CLI + API + Playwright)
npm run vercel:setup

# Or run individual components:
npm run vercel:api          # API-based setup
npm run vercel:playwright   # Browser validation
```

---

## Prerequisites

✅ **Completed Automatically:**
- ✓ Node.js 18+ installed
- ✓ npm installed
- ✓ `npm run build` works locally
- ✓ TypeScript and linting pass
- ✓ vercel.json configured
- ✓ .env.example created

❌ **Required from User:**
- [ ] Vercel account (create at https://vercel.com)
- [ ] GitHub connected to Vercel (OAuth)
- [ ] Initial browser authentication for Vercel CLI

---

## Automation Workflow

### Phase 1: Local Validation ✅ DONE
```
✓ npm run build
✓ npm run typecheck
✓ npm run lint
✓ Build artifacts verified
```

### Phase 2: Vercel Authentication ⏳ WAITING FOR YOU
```
1. Run: npm run vercel:setup
2. Follow URL prompt in terminal
3. Authenticate in browser (one-time)
4. CLI continues automatically
```

### Phase 3: Project Setup (Automated)
```
✓ Create Vercel project
✓ Link GitHub repository
✓ Configure build command
✓ Set output directory
```

### Phase 4: Environment Configuration (Automated)
```
✓ Set VITE_API_URL for production
✓ Set VITE_API_URL for preview
✓ Verify environment variables
```

### Phase 5: CI/CD Verification (Automated)
```
✓ Enable automatic deployments
✓ Configure GitHub webhook
✓ Setup preview deployments
```

### Phase 6: Validation (Automated)
```
✓ Test preview deployment
✓ Verify API connectivity
✓ Generate report
```

---

## Running the Automation

### Option 1: Full Automated Setup (Recommended)

```bash
npm run vercel:setup
```

**What it does:**
1. Verifies local build (build, typecheck, lint)
2. Authenticates with Vercel CLI
3. Creates Vercel token
4. Runs API setup (create project, env vars, etc)
5. Validates with Playwright (browser automation)
6. Commits results to git

**Duration:** ~5-10 minutes
**Requires:** 1 user interaction (browser auth)

---

### Option 2: API-Only Setup

```bash
# First, authenticate with Vercel CLI
npx vercel login

# Then run API setup
npm run vercel:api
```

**What it does:**
1. Create Vercel project via API
2. Configure environment variables
3. Link GitHub repository
4. Fetch project info
5. List recent deployments
6. Generate report

**Duration:** ~2 minutes
**Requires:** Vercel CLI authentication

---

### Option 3: Playwright Validation Only

```bash
# After API setup completes
npm run vercel:playwright
```

**What it does:**
1. Open browser (headless)
2. Navigate to Vercel dashboard
3. Create project (if not exists)
4. Configure environment variables
5. Verify CI/CD settings
6. Test preview deployment
7. Validate API integration

**Duration:** ~5-10 minutes
**Requires:** API token (from Option 2)

---

## Authentication Flow

### First Time Setup

```bash
npm run vercel:setup

# Output:
# [INFO] Verifying prerequisites...
# [SUCCESS] Prerequisites verified
# [INFO] Verifying local build...
# [SUCCESS] Local build verified
# [INFO] Authenticating with Vercel...
# > ? Create a new token? [Y/n]  # Press Enter (default: Y)
# 
# Visit https://vercel.com/oauth/device?user_code=XXXX
# 
# [INFO] Waiting for authentication...
```

**In browser:**
1. Open the URL from above
2. Click "Connect"
3. Return to terminal (script continues automatically)

---

## Configuration Files

All configuration is committed to git:

| File | Purpose | Status |
|------|---------|--------|
| `vercel.json` | Production build config | ✅ Committed |
| `.vercelignore` | File exclusions | ✅ Committed |
| `packages/frontend/.env.example` | Environment template | ✅ Committed |
| `scripts/vercel-setup-api.js` | API automation | ✅ Committed |
| `scripts/vercel-setup-automation.playwright.ts` | Browser automation | ✅ Committed |
| `scripts/setup-vercel-complete.sh` | Orchestration | ✅ Committed |

**Environment Variables (NOT committed):**
- Set in Vercel dashboard only
- VITE_API_URL (production)
- VITE_API_URL (preview)

---

## Reports Generated

After running automation, reports are saved to:

```
docs/qa/vercel-api-setup-report.md
docs/qa/vercel-automation-report.md
```

Each report contains:
- Execution timestamp
- Configuration used
- Detailed execution log
- Summary of results
- Next steps

---

## Troubleshooting

### "Vercel command not found"

```bash
# Install Vercel CLI globally
npm install -g vercel

# Or use via npx (automatic)
npx vercel whoami
```

### "No existing credentials found"

```bash
# Authenticate with Vercel
npx vercel login

# Or create token
npx vercel token create --scope full
```

### "VERCEL_TOKEN is not set"

```bash
# The automation handles this automatically
# But if you need to set it manually:
export VERCEL_TOKEN=$(npx vercel token create --scope full)
npm run vercel:api
```

### "Build fails locally"

```bash
cd packages/frontend

# Check build
npm run build

# Check types
npm run typecheck

# Check linting
npm run lint

# Fix issues and retry
npm run vercel:setup
```

### "GitHub not linked"

The automation handles this automatically, but if it fails:

1. Go to Vercel dashboard: https://vercel.com/dashboard
2. Select project
3. Settings → Git
4. Click "Connect Repository"
5. Select `darkking4096/Nexus`

---

## Manual Verification Checklist

After automation completes:

- [ ] Vercel project exists: https://vercel.com/dashboard
- [ ] GitHub integration shows webhook: https://github.com/darkking4096/Nexus/settings/hooks
- [ ] Build logs show success: Vercel dashboard → Deployments
- [ ] Environment variables set: Vercel dashboard → Settings → Environment Variables
- [ ] Production URL accessible: Click "Visit" on production deployment
- [ ] API calls work: Open console on production URL and test

---

## Next Steps

### 1. Test PR Preview Deployment

```bash
# Create test branch
git checkout -b test/vercel-preview
echo "# Test" >> README.md
git add README.md
git commit -m "test: verify Vercel preview"
git push origin test/vercel-preview

# Create PR on GitHub
# → Vercel auto-creates preview deployment
# → Click "Visit Preview" link
# → Verify frontend loads
```

### 2. Merge to Production

```bash
# After preview is verified
git checkout main
git merge test/vercel-preview
git push origin main

# → Vercel auto-deploys to production
# → Production URL at: https://nexus-platform-frontend-*.vercel.app
```

### 3. Validate API Connectivity

```bash
# From production URL console:
fetch('https://api.production.example.com/health')
  .then(r => r.json())
  .then(d => console.log('API OK:', d))
```

### 4. Monitor Deployments

- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Actions: https://github.com/darkking4096/Nexus/actions
- Core Web Vitals: Vercel Dashboard → Analytics

---

## Environment Variables Reference

### Production

```
VITE_API_URL = https://api.production.example.com
```

### Preview (PRs)

```
VITE_API_URL = https://api.staging.example.com
```

### Local Development (`.env.local`)

```
VITE_API_URL = http://localhost:5000
```

---

## Performance Targets

### Bundle Size ✅ Verified

- JavaScript: 6.85 KB gzipped (target: < 50 KB)
- CSS: 5.83 KB gzipped (target: < 50 KB)
- Total: 12.68 KB gzipped ✅ PASSED

### Core Web Vitals (Targets)

- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

Monitor in Vercel Dashboard → Analytics

---

## Security Best Practices

✅ **Configured:**
- No secrets in source code
- Automatic HTTPS on all deployments
- Environment variables in Vercel only
- Git-based deployments only

❌ **Never Do:**
- Don't commit `.env.production` or `.env.staging`
- Don't expose API keys in logs
- Don't hardcode backend URLs in frontend
- Don't share VERCEL_TOKEN publicly

---

## Support & References

| Resource | Link |
|----------|------|
| Vercel Docs | https://vercel.com/docs |
| Vite Guide | https://vitejs.dev/guide/ |
| GitHub Webhooks | https://docs.github.com/en/developers/webhooks-and-events/webhooks |
| React Best Practices | https://react.dev/ |
| Core Web Vitals | https://web.dev/vitals/ |

---

## Scripts Reference

### `setup-vercel-complete.sh`

Main orchestration script. Coordinates:
1. Local validation
2. CLI authentication
3. API setup
4. Playwright validation
5. Git commit

**Run:** `npm run vercel:setup` or `bash scripts/setup-vercel-complete.sh`

### `vercel-setup-api.js`

Direct API integration with Vercel. Handles:
- Project creation
- Environment variable configuration
- GitHub linking
- Deployment verification

**Run:** `npm run vercel:api` or `node scripts/vercel-setup-api.js`

### `vercel-setup-automation.playwright.ts`

Browser automation using Playwright. Handles:
- Dashboard navigation
- Project configuration via UI
- Environment variable setup via form
- CI/CD verification
- Rollback testing

**Run:** `npm run vercel:playwright` or `npx ts-node scripts/vercel-setup-automation.playwright.ts`

---

## Success Checklist

After running automation, verify:

- [ ] ✅ Local build passes (build, typecheck, lint)
- [ ] ✅ Vercel project created and accessible
- [ ] ✅ GitHub integration active with webhook
- [ ] ✅ Environment variables set in Vercel
- [ ] ✅ Production deployment URL generated
- [ ] ✅ Preview deployments enabled
- [ ] ✅ API configuration tested
- [ ] ✅ Rollback procedure verified
- [ ] ✅ Core Web Vitals monitored
- [ ] ✅ Reports generated in docs/qa/

All ✅? **Ready for production deployment!**

---

**Story 8.1.3 — Frontend Vercel Deploy & CI/CD**  
*Complete Automation Guide*  
Updated: 2026-04-22
