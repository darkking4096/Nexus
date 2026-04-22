# Vercel Deployment Guide

**Status**: ✅ Configured for production deployment  
**Last Updated**: 2026-04-22  
**Maintained By**: @devops  

## Overview

This guide covers the complete Vercel deployment setup for the Nexus Platform frontend (Story 8.1.3). The frontend is deployed to Vercel with automatic CI/CD for main branch pushes and preview deployments for pull requests.

## Quick Start for Developers

### 1. Local Development

```bash
cd packages/frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173` with hot module reloading.

### 2. Testing Before Push

Before pushing changes, ensure all quality checks pass:

```bash
npm run build    # Verify production build works
npm run typecheck # Check TypeScript types
npm run lint     # Check code style
npm test         # Run unit tests
```

### 3. Deployment Flow

- **Feature branches**: Push to GitHub → Vercel creates preview deployment automatically
- **Main branch**: Merge to main → Vercel deploys to production automatically
- **Rollback**: One-click rollback available in Vercel dashboard if needed

## Vercel Project Configuration

### Project Settings

| Setting | Value |
|---------|-------|
| **Project Name** | nexus-platform-frontend |
| **Framework** | Vite (React) |
| **Root Directory** | `packages/frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist/` |
| **Install Command** | `npm install` |

### Environment Variables

**Production:**
```
VITE_API_URL = https://api.production.example.com
```

**Preview (Pull Requests):**
```
VITE_API_URL = https://api.staging.example.com
```

**Local Development (`.env.local`):**
```
VITE_API_URL = http://localhost:5000
```

> **Important**: Never commit `.env.local` — it contains local development settings. Use `.env.example` as template.

## CI/CD Automation

### Automatic Deployments

✅ **Enabled Features:**
- Auto-deploy on main branch push (production)
- Preview deployments for all pull requests
- Automatic rollback on failed deployments
- Build logs and deployment history in dashboard

### GitHub Integration

Vercel is connected via GitHub OAuth:
- Listens for push events to `main` branch
- Creates preview deployments for all PRs
- Posts deployment status to GitHub checks
- Blocks PR merge if build fails (if branch protection enabled)

### Deployment Status

Check deployment status in Vercel dashboard:
1. Go to https://vercel.com/dashboard
2. Select "nexus-platform-frontend" project
3. View deployments, logs, and rollback options

## Build Configuration Details

### Build Process

```bash
npm run build
```

This runs:
1. **TypeScript Compilation** (`tsc`) — Type checking
2. **Vite Build** (`vite build`) — Production bundle optimization
3. **Bundle Analysis** — Outputs bundle size report

### Build Output

- **Location**: `dist/` directory
- **Main Bundle**: `assets/index-*.js` (~30 KB gzipped)
- **Styles**: `assets/index-*.css` (~5 KB gzipped)
- **HTML Entry**: `index.html`

### Bundle Size Targets

✅ **Current Performance:**
- JavaScript: 6.85 KB gzipped
- CSS: 5.83 KB gzipped
- Total: 12.68 KB gzipped
- Target: < 50 KB gzipped ✅ PASSED

## API Integration

### Backend Communication

The frontend communicates with the backend via REST API:

```typescript
// Environment variable determines API endpoint
const API_URL = import.meta.env.VITE_API_URL;

// Example API call
const response = await fetch(`${API_URL}/api/endpoint`);
```

### CORS Configuration

**Required**: Backend must allow frontend domain in CORS headers:

```
Access-Control-Allow-Origin: https://nexus-platform-frontend.vercel.app
```

For local development, backend should allow:
```
Access-Control-Allow-Origin: http://localhost:5173
```

### API Testing

Test API connectivity from preview deployment:

```bash
# In browser console on preview URL:
fetch('https://api.staging.example.com/api/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

## Monitoring and Troubleshooting

### Core Web Vitals

Vercel Analytics automatically tracks:
- **LCP** (Largest Contentful Paint) — < 2.5s target
- **FID** (First Input Delay) — < 100ms target  
- **CLS** (Cumulative Layout Shift) — < 0.1 target

View metrics in Vercel dashboard → Analytics tab.

### Common Issues

#### Build Fails

**Check:**
1. Verify `npm run build` works locally
2. Check build logs in Vercel dashboard
3. Ensure environment variables are set in Vercel
4. Verify Node.js version compatibility (18.x required)

**Fix:**
```bash
# Local troubleshooting
npm install  # Ensure dependencies are installed
npm run build # Test build locally
npm run typecheck # Check TypeScript errors
npm run lint # Check linting issues
```

#### Preview Deployment Errors

**Check:**
1. Verify build logs passed
2. Test API endpoints from preview URL
3. Check browser console for errors
4. Verify CORS headers from backend

**Debug:**
```bash
# View deployment logs
gh deployment status --env=production

# Test API from preview URL
curl https://{preview-url}.vercel.app/api/health
```

#### API Connection Failed

**Check:**
1. Verify `VITE_API_URL` is set correctly in Vercel
2. Verify backend is running and accessible
3. Check browser Network tab for API requests
4. Verify CORS is configured correctly on backend

**Fix:**
```bash
# Update environment variable in Vercel dashboard
# Settings → Environment Variables → VITE_API_URL → Update value
```

## Rollback Procedure

### One-Click Rollback

If a deployment causes issues:

1. Go to Vercel dashboard → Deployments
2. Find the last known-good deployment
3. Click "Promote to Production"
4. Vercel re-deploys that version to production URL

**Rollback time:** < 2 minutes

### Manual Rollback

If automatic rollback is needed, trigger via git:

```bash
git revert {commit-hash}
git push origin main
```

Vercel will automatically deploy the reverted code.

## Performance Optimization (Phase 2)

The following optimizations are planned for Story 8.1.3b:

- [ ] Image optimization with next/image
- [ ] Code splitting and lazy loading
- [ ] Compression and minification tuning
- [ ] CDN caching strategies
- [ ] Performance monitoring dashboards
- [ ] Core Web Vitals optimization

## Security Best Practices

✅ **Configured:**
- No secrets in source code (using Vercel environment variables)
- Automatic HTTPS on all deployments
- Git-based deployments (no manual file uploads)
- Branch protection rules on main

❗ **To Verify:**
- [ ] API keys are stored only in Vercel dashboard (never in .env.local)
- [ ] Database credentials are protected
- [ ] CORS headers are correctly configured
- [ ] Rate limiting is implemented on backend

## References

- **Vercel Docs**: https://vercel.com/docs
- **Vite Guide**: https://vitejs.dev/guide/
- **Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Core Web Vitals**: https://web.dev/vitals/
- **Deployment Best Practices**: https://vercel.com/guides/deploying-react-with-vercel

## Team Contacts

| Role | Contact | Responsibility |
|------|---------|-----------------|
| DevOps | @devops | Vercel setup, CI/CD, deployments |
| Backend | @dev | API configuration, CORS setup |
| QA | @qa | Deployment validation, performance |

---

**Next Steps**: 
1. Connect GitHub repository to Vercel (if not already done)
2. Set environment variables in Vercel dashboard
3. Trigger first deployment from main branch
4. Validate API connectivity from production URL
