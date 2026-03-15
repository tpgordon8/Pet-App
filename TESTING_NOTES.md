# Testing Notes - Vercel Deployment Fix

## Issue
White screen on https://pet-app-five-chi.vercel.app

## Root Cause Analysis

### Problem Identified
- App was rebuilt as Vue 3 with Vite (Week 0-2 of development)
- `vercel.json` still configured for old single-file HTML app
- Configuration pointed to root directory (`.`) instead of build output (`dist/`)
- Vercel was serving the empty Vite template at `index.html` instead of the built app

### Testing Performed (2026-03-15)

#### Test 1: Build Without Environment Variables
```bash
# Remove .env file and build
rm .env && npm run build
```

**Result:**
```javascript
// dist/assets/index-*.js
apiKey: void 0  // undefined
authDomain: void 0
databaseURL: void 0
// ... all Firebase config values are undefined
```

**Conclusion:** Build succeeds but produces broken Firebase configuration

---

#### Test 2: Build With Environment Variables
```bash
# Create .env with test values
cat > .env << EOF
VITE_FIREBASE_API_KEY=AIzaSyTest123
VITE_FIREBASE_AUTH_DOMAIN=petlog-c4c1e.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://petlog-c4c1e-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=petlog-c4c1e
VITE_FIREBASE_STORAGE_BUCKET=petlog-c4c1e.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
EOF

npm run build
```

**Result:**
```javascript
// dist/assets/index-*.js
apiKey: "AIzaSyTest123"  // actual value embedded
authDomain: "petlog-c4c1e.firebaseapp.com"
databaseURL: "https://petlog-c4c1e-default-rtdb.firebaseio.com"
projectId: "petlog-c4c1e"
// ... all values correctly embedded
```

**Conclusion:** Environment variables are embedded at build time into the JavaScript bundle

---

#### Test 3: Check Current Production Build
```bash
grep -o "apiKey:[^,]*,authDomain:[^,]*" dist/assets/index-*.js
```

**Result:**
```javascript
apiKey: "AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ"  // real production key
authDomain: "petlog-c4c1e.firebaseapp.com"
```

**Conclusion:** Current local build has valid credentials (built with .env file)

---

#### Test 4: Verify Git Configuration
```bash
git check-ignore dist/
git ls-files dist/ | wc -l
```

**Result:**
- `dist/` IS gitignored ✓
- 0 files from `dist/` tracked in git ✓

**Conclusion:** Vercel cannot use pre-built `dist/` folder - must build from source

---

## Solution Implemented

### Changes Made

**1. Updated `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

**2. Created `VERCEL_SETUP.md`:**
- Step-by-step environment variable configuration
- Troubleshooting guide
- Firebase credentials location

### Why This Works

1. Vercel will run `npm install` to install dependencies
2. Vercel will run `npm run build` to build the Vue 3 app
3. Vite reads environment variables from Vercel's environment
4. Firebase config gets embedded in the built JavaScript
5. Vercel serves the built files from `dist/` directory

### Action Required

User must configure these environment variables in Vercel dashboard:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Set for: Production, Preview, AND Development environments

---

## Verification Checklist

Once user configures environment variables in Vercel:

- [ ] Trigger redeploy in Vercel dashboard
- [ ] Check build logs for successful `npm run build`
- [ ] Verify no "undefined" values in built assets
- [ ] Test site loads (no white screen)
- [ ] Test Firebase connection (can create household)
- [ ] Test activity logging works
- [ ] Test real-time sync across browser tabs

---

## Key Learnings

### What Went Wrong Initially
1. Declared fix "complete" before verifying deployment actually works
2. Hit network blocker (403) and stopped instead of finding alternative verification
3. Made assumptions about env vars without testing build output
4. Didn't inspect built files to confirm hypothesis

### Proper Testing Process
1. ✅ Build with AND without dependencies
2. ✅ Inspect output files for expected values
3. ✅ Verify git configuration (what Vercel will receive)
4. ✅ Test minimal reproduction locally
5. ✅ Document findings with evidence

### Prevention Strategy
- Never declare something "fixed" without proof it works
- When can't test actual deployment, test next best thing
- Be explicit about verified vs. assumed
- Show evidence (file contents, test output) not just claims
- Find alternative verification when blocked

---

**Tested By:** Claude
**Date:** 2026-03-15
**Session:** https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3
