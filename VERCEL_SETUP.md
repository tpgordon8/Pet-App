# 🚀 Vercel Deployment Setup - Vue 3 App

## Critical: Environment Variables Required

Your Vue 3 app **requires Firebase environment variables** to be configured in Vercel. The build will fail without them.

---

## Step 1: Configure Environment Variables in Vercel

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Select your `Pet-App` project (or `pet-app-five-chi`)
3. Click **"Settings"** → **"Environment Variables"**
4. Add the following variables (copy values from your local `.env` file):

```
VITE_FIREBASE_API_KEY=<your-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<your-auth-domain>
VITE_FIREBASE_DATABASE_URL=https://petlog-c4c1e-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=petlog-c4c1e
VITE_FIREBASE_STORAGE_BUCKET=<your-storage-bucket>
VITE_FIREBASE_MESSAGING_SENDER_ID=<your-sender-id>
VITE_FIREBASE_APP_ID=<your-app-id>
```

**Important:**
- Set environment: **Production**, **Preview**, and **Development** (all three)
- Click "Save" after adding all variables

---

## Step 2: Verify Build Configuration

Your `vercel.json` is already configured:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install"
}
```

This tells Vercel to:
1. Run `npm install` to install dependencies
2. Run `npm run build` to build the Vue 3 app
3. Serve the static files from the `dist/` directory

---

## Step 3: Trigger Redeploy

After adding environment variables:

1. Go to **"Deployments"** tab
2. Click the **"..."** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait ~1-2 minutes for the build to complete

**Or** push a new commit to trigger auto-deploy:
```bash
git commit --allow-empty -m "Trigger Vercel redeploy"
git push origin claude/pet-activity-logger-Etaqb
```

---

## Step 4: Verify Deployment

Once deployed, test the site:

1. Visit https://pet-app-five-chi.vercel.app
2. Check that the page loads (no white screen)
3. Try creating a household
4. Try logging an activity
5. Verify Firebase real-time sync works

---

## Troubleshooting

### White Screen Still Showing

**Check build logs:**
1. Go to Vercel dashboard → Deployments
2. Click on the latest deployment
3. Check the build logs for errors
4. Look for missing environment variables

**Common issues:**
- Environment variables not set (see Step 1)
- Environment variables set for wrong environment (must be Production + Preview + Development)
- Typo in environment variable names (must start with `VITE_`)

### Build Failing

**Error: "Missing environment variables"**
- Add all Firebase env vars in Vercel settings (Step 1)
- Make sure they start with `VITE_` prefix

**Error: "npm install failed"**
- Check `package.json` is valid
- Vercel should auto-detect Node.js version from `package.json`

**Error: "npm run build failed"**
- Check build logs for specific error
- Verify local build works: `npm run build`
- Make sure all dependencies are in `package.json` (not devDependencies)

### Firebase Not Connecting

1. Check browser console for errors
2. Verify Firebase project is active at https://console.firebase.google.com/project/petlog-c4c1e
3. Check Firebase Database Rules allow read/write access
4. Verify environment variables match your Firebase project

---

## Getting Firebase Credentials

If you need to find your Firebase credentials:

1. Go to https://console.firebase.google.com/project/petlog-c4c1e
2. Click the gear icon → **Project settings**
3. Scroll to **"Your apps"** section
4. Click the `</>` web app icon
5. Copy the config values:
   - `apiKey` → `VITE_FIREBASE_API_KEY`
   - `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
   - `databaseURL` → `VITE_FIREBASE_DATABASE_URL`
   - `projectId` → `VITE_FIREBASE_PROJECT_ID`
   - `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `VITE_FIREBASE_APP_ID`

---

## What Changed (Vue 3 Rebuild)

**Old Setup (Legacy):**
- Single-file `index.html` with embedded Firebase config
- No build step required
- Vercel served directly from root directory

**New Setup (Vue 3):**
- Modern Vue 3 + Vite architecture
- Build step required (`npm run build`)
- Vercel must build and serve from `dist/`
- Environment variables required for Firebase config

---

## Quick Checklist

- [ ] Environment variables added in Vercel settings
- [ ] All 7 Firebase variables configured (VITE_FIREBASE_*)
- [ ] Environment set to Production, Preview, AND Development
- [ ] Deployment triggered (auto or manual redeploy)
- [ ] Build succeeds (check deployment logs)
- [ ] Site loads without white screen
- [ ] Firebase connection works (can create household)
- [ ] Activities can be logged and synced

---

## Need Help?

**Vercel Resources:**
- Dashboard: https://vercel.com/dashboard
- Docs: https://vercel.com/docs
- Support: https://vercel.com/support

**Firebase Resources:**
- Console: https://console.firebase.google.com/project/petlog-c4c1e
- Docs: https://firebase.google.com/docs

---

**Last Updated:** 2026-03-15
**App Version:** 2.0.0 (Vue 3)
