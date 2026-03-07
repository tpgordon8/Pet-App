# 🚀 Deployment Guide - Vercel

## Quick Deploy (5 minutes)

### Step 1: Prepare Your Code
```bash
# Make sure latest changes are pushed
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Deploy to Vercel

**Option A: Deploy via GitHub (Recommended)**
1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"** with GitHub
3. Click **"Add New Project"**
4. Select your `Pet-App` repository from the list
5. Vercel will auto-detect the configuration from `vercel.json`
6. Click **"Deploy"**
7. Wait ~30 seconds
8. Done! 🎉 You'll get a URL like `petlog.vercel.app`

**Option B: Deploy via Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd ~/Pet-App
vercel

# Follow prompts:
# - Setup new project? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? petlog (or your choice)
# - Directory to deploy? ./ (current directory)
# - Override settings? No

# Production deployment
vercel --prod
```

### Step 3: Custom Domain (Optional)

**Free Vercel Subdomain:**
- You get `your-project.vercel.app` for free
- Can rename in project settings

**Custom Domain:**
1. Go to Project Settings → Domains
2. Add your domain (e.g., `petlog.com`)
3. Follow DNS configuration instructions
4. Vercel provides automatic HTTPS

---

## Configuration Details

Your project is already configured! Here's what `vercel.json` does:

```json
{
  "version": 2,
  "buildCommand": "",              // No build needed (static HTML)
  "outputDirectory": ".",          // Serve from root
  "installCommand": "",            // No dependencies to install
  "framework": null,               // Static site
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"  // SPA routing
    }
  ],
  "headers": [
    {
      "source": "/manifest.json",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"  // PWA support
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600, s-maxage=3600"  // 1 hour cache
        }
      ]
    }
  ]
}
```

---

## Environment Variables (Firebase)

Your Firebase config is already in `index.html`, but for better security in the future, you can use Vercel Environment Variables:

1. Go to Project Settings → Environment Variables
2. Add these (from your Firebase console):
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_DATABASE_URL`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_APP_ID`

3. Update `index.html` to read from `import.meta.env` or keep as-is for simplicity

---

## Automatic Deployments

Once connected to GitHub:
- ✅ **Every push to `main`** → Auto-deploys to production
- ✅ **Every pull request** → Auto-deploys preview URL
- ✅ **Every branch push** → Creates preview deployment

**Example workflow:**
```bash
# Work on feature
git checkout -b feature/new-button
git push origin feature/new-button

# Vercel creates preview: feature-new-button-petlog.vercel.app

# Merge to main
git checkout main
git merge feature/new-button
git push origin main

# Vercel auto-deploys to: petlog.vercel.app
```

---

## Monitoring & Analytics

**Free features included:**
- Real-time deployment logs
- Performance metrics (Web Vitals)
- Bandwidth usage tracking
- Error tracking
- Analytics (page views, visitors)

**Access via:**
- Project Dashboard → Analytics
- Project Dashboard → Deployments (logs)

---

## Troubleshooting

### "Build failed"
- Check `vercel.json` is valid JSON
- Ensure `index.html` is in root directory
- Check deployment logs for details

### "404 Not Found"
- Verify `outputDirectory: "."` in vercel.json
- Check file paths are correct
- Try re-deploying

### "Firebase not connecting"
- Check Firebase API keys in `index.html`
- Verify Firebase project is active
- Check browser console for errors

### "PWA not working"
- Verify `manifest.json` is accessible
- Check service worker registration (if added)
- Clear browser cache and try again

---

## Removing Netlify

Once Vercel is working:

1. **Disconnect Netlify:**
   - Go to Netlify dashboard
   - Select your site
   - Site Settings → Delete Site

2. **Remove Netlify config (optional):**
   ```bash
   git rm netlify.toml
   git commit -m "Remove Netlify config"
   git push
   ```

---

## Cost Comparison

**Vercel Free Tier:**
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Preview deployments
- ✅ Analytics

**Netlify Free Tier:**
- 100 GB bandwidth/month
- 300 build minutes/month
- 1 concurrent build

**Winner:** Vercel (better for static + Firebase apps)

---

## Support

- **Vercel Docs:** https://vercel.com/docs
- **Vercel Discord:** https://vercel.com/discord
- **Vercel Support:** support@vercel.com

---

**Next Steps:**
1. Deploy to Vercel (5 min)
2. Test the site works
3. Share the URL! 🎉
