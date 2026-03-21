# GitHub Secrets Setup Guide

## Quick Setup Instructions

Add these **12 secrets** to your GitHub repository to enable Firebase and Vercel deployment in GitHub Actions.

**URL:** https://github.com/tpgordon8/Pet-App/settings/secrets/actions

Click **"New repository secret"** for each entry below:

---

## Secrets to Add

### 1. VITE_FIREBASE_API_KEY
```
AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ
```

### 2. VITE_FIREBASE_AUTH_DOMAIN
```
petlog-c4c1e.firebaseapp.com
```

### 3. VITE_FIREBASE_DATABASE_URL
```
https://petlog-c4c1e-default-rtdb.firebaseio.com
```

### 4. VITE_FIREBASE_PROJECT_ID
```
petlog-c4c1e
```

### 5. VITE_FIREBASE_STORAGE_BUCKET
```
petlog-c4c1e.firebasestorage.app
```

### 6. VITE_FIREBASE_MESSAGING_SENDER_ID
```
417384966953
```

### 7. VITE_FIREBASE_APP_ID
```
1:417384966953:web:8b00d0cac96e2b7ec2a538
```

### 8. VITE_APP_NAME
```
Tailr
```

### 9. VITE_APP_VERSION
```
2.0.0
```

---

## Vercel Secrets (Required for Deployment)

### 10. VERCEL_TOKEN

**How to get it:**
1. Go to [Vercel Account Settings → Tokens](https://vercel.com/account/tokens)
2. Click "Create Token"
3. Name it "GitHub Actions CI/CD"
4. Select scope: "Full Account"
5. Click "Create" and copy the token

**Add to GitHub:**
```
[Your Vercel Token from step 5]
```

### 11. VERCEL_ORG_ID

**How to get it:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your profile/team name in the top left
3. Click "Settings"
4. Under "General", find "Team ID" (or "User ID" for personal accounts)
5. Copy the ID

**Add to GitHub:**
```
[Your Vercel Org/Team ID from step 5]
```

### 12. VERCEL_PROJECT_ID

**How to get it:**
1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Settings"
3. Under "General", find "Project ID"
4. Copy the ID

**OR** run this command in your project directory:
```bash
cat .vercel/project.json
```

**Add to GitHub:**
```
[Your Vercel Project ID]
```

---

## After Adding Secrets

Once all **12 secrets** are added, the enhanced CI/CD workflow is ready!

**Important Changes:**
- ✅ Vercel automatic deployment is **disabled** (see `vercel.json`)
- ✅ GitHub Actions now **controls all deployments**
- ✅ Tests and linting run **before** deployment
- ✅ Deployments only happen if tests pass

Push your next commit to trigger the workflow:

```bash
git push
```

The GitHub Actions workflow will automatically:
1. Run ESLint to check code quality
2. Run unit tests (must pass to continue)
3. Build the app with Firebase configuration
4. Deploy to Vercel only if all checks pass

---

## Verification

After deployment completes, visit:
- **GitHub Actions:** https://github.com/tpgordon8/Pet-App/actions
- **Live App:** https://pet-app-five-chi.vercel.app

The app should now:
- Load without errors
- Connect to Firebase successfully
- Allow creating/logging activities
- Sync data in real-time

---

## Enhanced CI/CD Workflow - What Changed?

### Before (Redundant Setup)
- ❌ Vercel auto-deployed on every push
- ❌ GitHub Actions also deployed (duplicate effort)
- ❌ No tests ran before deployment
- ❌ No code quality checks
- ❌ Broken code could reach production

### After (Enhanced Setup)
- ✅ GitHub Actions controls all deployments
- ✅ ESLint runs to catch code quality issues
- ✅ Unit tests run to catch bugs
- ✅ Build runs to catch compilation errors
- ✅ Only deploys if **all checks pass**
- ✅ Failed tests = no deployment (protects production)

### Workflow Steps

```yaml
1. Checkout code from GitHub
2. Setup Node.js 18
3. Install dependencies (npm ci)
4. Run ESLint → FAIL = Stop
5. Run unit tests → FAIL = Stop
6. Build application → FAIL = Stop
7. Deploy to Vercel → SUCCESS
```

### Benefits

**Quality Gates:**
- Prevents broken code from reaching production
- Catches bugs before users see them
- Enforces code style consistency

**Unified CI/CD:**
- All deployment status visible in GitHub
- Clear failure reasons in workflow logs
- One source of truth for deployments

**Full Control:**
- Deploy on your terms (not automatic on every push)
- Can add more checks later (E2E tests, security scans)
- Deployment history tracked in GitHub Actions

---

## Troubleshooting

### "Error: Vercel token is invalid"
- Check that VERCEL_TOKEN is copied correctly (no extra spaces)
- Regenerate token at https://vercel.com/account/tokens
- Update the secret in GitHub

### "Error: VITE_FIREBASE_API_KEY not found"
- Verify all 9 Firebase secrets are added
- Check for typos in secret names (must match exactly)
- Re-add any missing secrets

### "Lint errors found"
- Workflow will fail if ESLint finds issues
- Fix the errors locally: `npm run lint`
- Commit and push the fixes

### "Tests failed"
- Workflow will fail if any unit tests fail
- Run tests locally: `npm run test:unit`
- Fix failing tests before pushing

### "Deployment still happens from Vercel"
- Make sure `vercel.json` has `"github": { "enabled": false }`
- Push the updated `vercel.json` to GitHub
- Check Vercel project settings → Git → GitHub Integration is disabled
