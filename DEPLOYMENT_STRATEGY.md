# Deployment Strategy - Tailr Pet Activity Logger

**Last Updated:** 2026-03-23
**Current Strategy:** Vercel Git Integration (Recommended)
**Previous Strategy:** GitHub Actions + Vercel API (Deprecated)

---

## Why We Switched from GitHub Actions to Vercel Git Integration

### The Problem

**Previous Setup (GitHub Actions):**
- Required 12 GitHub secrets to manage
- Complex workflow configuration
- Multiple failure points (GitHub → Actions → Vercel API)
- Project ID mismatch errors
- Harder to debug deployment issues
- Required Vercel API token management

**Failure:**
```
Error! Project not found ({"VERCEL_PROJECT_ID":"***","VERCEL_ORG_ID":"***"})
```

### The Expert Solution

**What Senior Developers Do:**
1. **Simplify deployment architecture**
2. **Use platform-native solutions** (Vercel's built-in Git integration)
3. **Reduce configuration overhead**
4. **Minimize failure points**

**Industry Standard:**
- Most production Vite/Next.js apps use Vercel Git Integration
- Companies like Vercel, Railway, and Netlify all recommend their Git integrations over CI/CD
- Simpler = More reliable = Less maintenance

---

## Current Deployment Architecture

### Vercel Git Integration

```
Developer → Git Push → GitHub → Vercel (auto-detects push) → Build & Deploy
                                      ↓
                              Automatic Preview URLs
                              Production Deployments
                              Environment Variables
```

**Benefits:**
- ✅ **Zero configuration files** - No `.github/workflows/deploy.yml`
- ✅ **Zero secrets management** - All env vars in Vercel dashboard
- ✅ **Automatic deployments** - Every push to `main` deploys
- ✅ **Preview deployments** - Every branch/PR gets a unique URL
- ✅ **Built-in rollbacks** - One-click rollback to any previous deployment
- ✅ **Edge network** - Automatic CDN distribution
- ✅ **Analytics** - Built-in performance monitoring
- ✅ **Logs** - Real-time build and runtime logs

---

## Setup Instructions

### Initial Setup (One-Time)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/new

2. **Import Repository:**
   - Click "Import Git Repository"
   - Select `tpgordon8/Pet-App`
   - Authorize Vercel to access your GitHub

3. **Configure Build Settings:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   Node Version: 18.x
   ```

4. **Add Environment Variables:**
   - Click "Environment Variables" tab
   - Add all 9 Firebase + 2 App variables:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_DATABASE_URL`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
     - `VITE_APP_NAME`
     - `VITE_APP_VERSION`
   - Apply to: Production, Preview, Development (all)

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for build
   - Get production URL: `https://your-project.vercel.app`

### Ongoing Deployments (Automatic)

**Production Deployments:**
- Push to `main` branch → Automatic production deploy
- URL: `https://your-project.vercel.app`

**Preview Deployments:**
- Push to any other branch → Automatic preview deploy
- URL: `https://your-project-git-branch-name.vercel.app`
- Each PR gets a unique URL for testing

**No manual steps needed!**

---

## How to Deploy Changes

### Before (GitHub Actions - Complex):
```bash
# 1. Make changes
git add .
git commit -m "Update feature"
git push

# 2. Wait for GitHub Actions
# 3. Check Actions tab for status
# 4. Debug if workflow fails
# 5. Maybe it deployed, maybe it didn't 🤷
```

### After (Vercel Git Integration - Simple):
```bash
# 1. Make changes
git add .
git commit -m "Update feature"
git push

# Done! ✅
# - Vercel automatically detects push
# - Builds and deploys
# - Sends you email/Slack notification when done
# - Shows deployment URL
```

---

## Deployment URLs

### Production
- **URL:** `https://pet-app-five-chi.vercel.app` (or your custom domain)
- **Triggers:** Push to `main` or `master` branch
- **Auto-deploy:** Yes

### Preview (Branch Deployments)
- **URL:** `https://pet-app-git-{branch-name}-{username}.vercel.app`
- **Triggers:** Push to any non-main branch
- **Auto-deploy:** Yes
- **Example:** `https://pet-app-git-feature-activity-search-tpgordon8.vercel.app`

### Local Preview
- **URL:** `http://localhost:5173`
- **Command:** `npm run dev`

---

## Environment Variables Management

### Where to Update

**Vercel Dashboard:**
1. Go to https://vercel.com/{username}/{project}/settings/environment-variables
2. Edit variables
3. Redeploy to apply changes

**Local Development:**
- Create `.env.local` file (not committed to Git)
- Copy variables from Vercel dashboard
- Used by `npm run dev`

### Required Variables

| Variable | Production Value | Used For |
|----------|-----------------|----------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` | Firebase connection |
| `VITE_FIREBASE_AUTH_DOMAIN` | `petlog-c4c1e.firebaseapp.com` | Firebase auth |
| `VITE_FIREBASE_DATABASE_URL` | `https://petlog-c4c1e-default-rtdb...` | Realtime DB |
| `VITE_FIREBASE_PROJECT_ID` | `petlog-c4c1e` | Firebase project |
| `VITE_FIREBASE_STORAGE_BUCKET` | `petlog-c4c1e.firebasestorage.app` | Photo uploads |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `417384966953` | Push notifications |
| `VITE_FIREBASE_APP_ID` | `1:417384...` | Firebase app ID |
| `VITE_APP_NAME` | `Tailr` | App branding |
| `VITE_APP_VERSION` | `2.0.0` | Version display |

---

## Monitoring Deployments

### Vercel Dashboard
- **URL:** https://vercel.com/{username}/{project}
- **Features:**
  - Real-time build logs
  - Deployment history
  - Analytics (page views, performance)
  - Error tracking
  - Rollback to any previous deployment

### GitHub Integration
- **Deployment Status:** Shows on PR/commits
- **Preview Links:** Automatically commented on PRs
- **Status Checks:** Pass/fail indicator

### Email Notifications
- Deployment succeeded/failed alerts
- Configure in Vercel settings

---

## Rollback Strategy

### If Deployment Breaks Production

**Option 1: One-Click Rollback (Fastest)**
1. Go to https://vercel.com/{username}/{project}
2. Click "Deployments" tab
3. Find last working deployment
4. Click "..." → "Promote to Production"
5. Done! (takes ~30 seconds)

**Option 2: Git Revert**
```bash
git revert HEAD
git push
# Vercel auto-deploys the reverted code
```

**Option 3: Re-deploy Old Commit**
1. Find working commit SHA
2. Push to main: `git push origin {commit-sha}:main`
3. Vercel auto-deploys

---

## Quality Gates

### Automatic Checks (Vercel Runs)
- ✅ Build succeeds (`npm run build`)
- ✅ No build errors
- ✅ Environment variables present

### Manual Checks (You Should Do)
- ✅ Test preview deployment before merging to main
- ✅ Run `npm run lint` locally before pushing
- ✅ Run `npm run test:unit:run` locally before pushing

### Optional: Re-enable GitHub Actions for Checks Only

You can keep GitHub Actions for **quality checks** without deploying:

**`.github/workflows/quality-checks.yml`:**
```yaml
name: Quality Checks

on:
  pull_request:
  push:
    branches: [main, claude/*]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit:run
      # No deployment step - Vercel handles that!
```

This gives you:
- Automated quality checks on PRs
- Vercel handles deployment
- Best of both worlds!

---

## Troubleshooting

### Deployment Fails

**Check:**
1. Build logs in Vercel dashboard
2. Environment variables are set correctly
3. `npm run build` works locally
4. No Firebase quota limits exceeded

**Common Issues:**
- Missing environment variables → Add in Vercel dashboard
- Build timeout → Optimize build (reduce dependencies)
- Firebase errors → Check Firebase console

### Preview Deployment Not Created

**Likely Cause:** Branch name contains invalid characters

**Fix:** Use branch names like `feature/activity-search` not `feature/activity search`

### Want to Deploy from Specific Branch

**Default:** Vercel deploys from `main`

**Change:**
1. Vercel Dashboard → Settings → Git
2. Change "Production Branch" to your preferred branch

---

## Comparison: GitHub Actions vs Vercel Git Integration

| Feature | GitHub Actions | Vercel Git Integration |
|---------|----------------|----------------------|
| **Setup Complexity** | High (workflow file + 12 secrets) | Low (click import) |
| **Maintenance** | Manual updates to workflow | Zero maintenance |
| **Preview Deployments** | Manual configuration | Built-in |
| **Rollbacks** | Manual git revert | One-click rollback |
| **Build Logs** | GitHub Actions tab | Vercel dashboard |
| **Environment Variables** | GitHub Secrets (12) | Vercel dashboard (9) |
| **Failure Points** | Multiple (GitHub → Actions → API → Vercel) | One (Vercel) |
| **Debugging** | Check 3 places | Check 1 place |
| **Cost** | Free (GitHub) + Free (Vercel) | Free (Vercel) |
| **Performance** | Same | Same |
| **Reliability** | Medium (more failure points) | High (fewer failure points) |
| **Industry Standard** | Less common for JAMstack | Standard for JAMstack |

**Winner:** Vercel Git Integration ✅

---

## Custom Domain Setup (Optional)

### Add Custom Domain

1. Buy domain (Namecheap, Google Domains, etc.)
2. Vercel Dashboard → Settings → Domains
3. Add domain: `tailr.app` or `tailr.yourname.com`
4. Configure DNS:
   ```
   Type: CNAME
   Name: @ (or subdomain)
   Value: cname.vercel-dns.com
   ```
5. Wait for DNS propagation (5-60 minutes)
6. Vercel auto-provisions SSL certificate

---

## Migration Summary

### What Changed

**Removed:**
- ❌ `.github/workflows/deploy.yml` (disabled, not deleted)
- ❌ GitHub Secrets for Vercel (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID)
- ❌ GitHub Secrets for Firebase (moved to Vercel)

**Added:**
- ✅ Vercel Git Integration
- ✅ Environment variables in Vercel dashboard
- ✅ Automatic preview deployments
- ✅ One-click rollbacks

**Result:**
- Simpler architecture
- Fewer failure points
- Easier to maintain
- Better developer experience

---

## Next Steps

1. **Set up Vercel Git Integration** (follow "Setup Instructions" above)
2. **Test a deployment** (push a small change to a branch)
3. **Verify preview deployment** (check the preview URL)
4. **Merge to main** (watch it auto-deploy to production)
5. **Celebrate** 🎉 (deployment is now fully automated!)

---

**Questions?**
- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- This project's deployment: https://vercel.com/{username}/pet-app

---

**Last Deployed:**
- Check https://vercel.com/{username}/{project}/deployments

**Current Production URL:**
- https://pet-app-five-chi.vercel.app (update after migration)
