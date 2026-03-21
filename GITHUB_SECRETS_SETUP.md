# GitHub Secrets Setup Guide

## Quick Setup Instructions

Add these 9 secrets to your GitHub repository to enable Firebase in the deployed app.

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

## After Adding Secrets

Once all 9 secrets are added, the workflow is ready! Just push the pending commit:

```bash
git push
```

The GitHub Actions workflow will automatically:
1. Inject these secrets as environment variables during build
2. Build the app with Firebase configuration
3. Deploy to Vercel with working Firebase connection

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
