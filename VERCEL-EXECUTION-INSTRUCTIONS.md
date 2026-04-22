# 🚀 Execute Story 8.1.3 — Vercel Deployment Automation

**Status:** All infrastructure ready. Ready for execution.

---

## ⚡ ONE COMMAND TO COMPLETE EVERYTHING

```bash
npm run vercel:setup
```

That's it! This command will:

✅ Verify local build (build, typecheck, lint)  
✅ Authenticate with Vercel (one-time, browser prompt)  
✅ Create Vercel project  
✅ Configure environment variables  
✅ Link GitHub repository  
✅ Enable CI/CD automation  
✅ Test preview deployment  
✅ Generate reports  

**Duration:** 5-10 minutes  
**Interruptions:** 1 browser authentication (you click "Connect")  

---

## What You Need to Do

### Step 1: Have Vercel Account Ready
- [ ] Sign up at https://vercel.com (takes 2 minutes)
- [ ] Make sure you have a GitHub account linked
- [ ] Keep browser tab ready

### Step 2: Run the Command
```bash
# Open terminal/command prompt
cd "C:\Users\HomePC\Desktop\Marketing"
npm run vercel:setup
```

### Step 3: Authenticate When Prompted
The script will show:
```
Visit https://vercel.com/oauth/device?user_code=XXXX

Waiting for authentication...
```

1. Copy the URL (or click it)
2. Open in browser
3. Click "Connect"
4. Return to terminal → script continues automatically

### Step 4: Wait for Completion
The script will:
- Create project
- Configure environment
- Run tests
- Generate reports
- Commit to git

Terminal will show green ✅ messages when done.

---

## What Happens Behind the Scenes

### Phase 1: Local Validation (30 seconds)
```
npm run build     ✅ (29.91 KB, 6.85 KB gzip)
npm run typecheck ✅ (0 errors)
npm run lint      ✅ (0 errors)
```

### Phase 2: Vercel Authentication (2 minutes)
```
Vercel CLI login
Create OAuth token
Set VERCEL_TOKEN environment variable
```

### Phase 3: API Setup (2-3 minutes)
```
POST /v1/projects              → Create project
POST /v1/projects/{id}/env     → Set environment variables
POST /v1/projects/{id}/link    → Link GitHub repo
GET /v1/projects/{id}          → Verify configuration
GET /v1/projects/{id}/deployments → Get deployment status
```

### Phase 4: Playwright Validation (3-5 minutes)
```
chromium.launch()
page.goto('https://vercel.com/dashboard')
→ Navigate to project
→ Verify CI/CD settings
→ Check deployment status
→ Test API connectivity
```

### Phase 5: Results & Commit (1 minute)
```
Generate report in: docs/qa/vercel-api-setup-report.md
Commit to git with all changes
Display summary
```

---

## After Execution Completes

### ✅ Check These

1. **Vercel Dashboard**
   - Go to: https://vercel.com/dashboard
   - Should see: `nexus-platform-frontend` project
   - Status: Should show "Ready" deployment

2. **GitHub Integration**
   - Go to: https://github.com/darkking4096/Nexus/settings/hooks
   - Should see: Vercel webhook in list

3. **Environment Variables**
   - In Vercel: Project Settings → Environment Variables
   - Should see:
     - VITE_API_URL (Production)
     - VITE_API_URL (Preview)

4. **Reports Generated**
   - Check: `docs/qa/vercel-api-setup-report.md`
   - Check: `docs/qa/vercel-automation-report.md`

---

## If Something Fails

### Vercel Command Not Found
```bash
# Install Vercel CLI
npm install -g vercel

# Or use automatic install
npx vercel --version
```

### Authentication Fails
```bash
# Try manual login first
npx vercel login

# Then run setup again
npm run vercel:setup
```

### Build Fails Locally
```bash
cd packages/frontend
npm install
npm run build
npm run typecheck
npm run lint

# If all pass, try setup again
cd ../..
npm run vercel:setup
```

### API Setup Fails
```bash
# Run just the API part
npm run vercel:api

# Check logs for details
cat docs/qa/vercel-api-setup-report.md
```

---

## Next Steps After Automation

### 1. Test Preview Deployment (5 minutes)
```bash
git checkout -b test/vercel-preview
echo "# Vercel Test" >> README.md
git add README.md
git commit -m "test: verify Vercel preview"
git push origin test/vercel-preview

# Go to: https://github.com/darkking4096/Nexus
# Create Pull Request
# Wait ~2 minutes for Vercel to build preview
# Vercel bot will comment with preview URL
```

### 2. Verify Preview Works
- Click preview URL from Vercel bot comment
- Verify frontend loads
- Check browser console for errors
- Test API calls

### 3. Merge to Production
```bash
# In GitHub: Click "Merge pull request"
# Or from terminal:
git checkout main
git merge test/vercel-preview
git push origin main

# Vercel auto-deploys to production
# Check: https://vercel.com/dashboard
```

### 4. Test Production
- Visit production URL from Vercel dashboard
- Verify frontend works
- Test API connectivity
- Check Core Web Vitals: Vercel Dashboard → Analytics

---

## Quick Reference

| Command | What It Does |
|---------|------------|
| `npm run vercel:setup` | Full automation (CLI + API + Playwright) |
| `npm run vercel:api` | Just API setup (faster, no browser) |
| `npm run vercel:playwright` | Just Playwright validation |
| `npm run build` | Local build verification |
| `npm run lint` | Code style check |
| `npm run typecheck` | TypeScript verification |

---

## Success Checklist

- [ ] ✅ Local build passes
- [ ] ✅ Vercel account created
- [ ] ✅ Run `npm run vercel:setup`
- [ ] ✅ Authenticate when prompted (browser)
- [ ] ✅ Automation completes (green messages)
- [ ] ✅ Vercel project visible in dashboard
- [ ] ✅ GitHub webhook installed
- [ ] ✅ Environment variables set
- [ ] ✅ Production URL accessible
- [ ] ✅ Reports generated in docs/qa/

---

## Support

**Detailed Guide:** `docs/VERCEL-AUTOMATION-GUIDE.md`  
**Step-by-Step Checklist:** `docs/qa/gates/8.1.3-SETUP-CHECKLIST.md`  
**Deployment Guide:** `docs/VERCEL-DEPLOYMENT-GUIDE.md`

**Scripts:**
- `scripts/vercel-setup-api.js` — API integration
- `scripts/vercel-setup-automation.playwright.ts` — Browser automation
- `scripts/setup-vercel-complete.sh` — Orchestration

---

## 🎯 Ready?

```bash
npm run vercel:setup
```

Then follow prompts. **You've got this!** 🚀

---

*Story 8.1.3 — Frontend Vercel Deploy & CI/CD*  
Complete Automation Ready for Execution
