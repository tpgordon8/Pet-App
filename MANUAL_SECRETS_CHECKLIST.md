# Manual GitHub Secrets Setup Checklist

Go to: **https://github.com/tpgordon8/Pet-App/settings/secrets/actions**

Click **"New repository secret"** for each of these 12 secrets:

---

## ✅ Firebase Secrets (9 total)

### 1. VITE_FIREBASE_API_KEY
**Name:** `VITE_FIREBASE_API_KEY`
**Value:** `AIzaSyBZeE0mf4ptN0wunDbEFbgMZ29nfWIA4NQ`

### 2. VITE_FIREBASE_AUTH_DOMAIN
**Name:** `VITE_FIREBASE_AUTH_DOMAIN`
**Value:** `petlog-c4c1e.firebaseapp.com`

### 3. VITE_FIREBASE_DATABASE_URL
**Name:** `VITE_FIREBASE_DATABASE_URL`
**Value:** `https://petlog-c4c1e-default-rtdb.firebaseio.com`

### 4. VITE_FIREBASE_PROJECT_ID
**Name:** `VITE_FIREBASE_PROJECT_ID`
**Value:** `petlog-c4c1e`

### 5. VITE_FIREBASE_STORAGE_BUCKET
**Name:** `VITE_FIREBASE_STORAGE_BUCKET`
**Value:** `petlog-c4c1e.firebasestorage.app`

### 6. VITE_FIREBASE_MESSAGING_SENDER_ID
**Name:** `VITE_FIREBASE_MESSAGING_SENDER_ID`
**Value:** `417384966953`

### 7. VITE_FIREBASE_APP_ID
**Name:** `VITE_FIREBASE_APP_ID`
**Value:** `1:417384966953:web:8b00d0cac96e2b7ec2a538`

### 8. VITE_APP_NAME
**Name:** `VITE_APP_NAME`
**Value:** `Tailr`

### 9. VITE_APP_VERSION
**Name:** `VITE_APP_VERSION`
**Value:** `2.0.0`

---

## ✅ Vercel Secrets (3 total)

### 10. VERCEL_ORG_ID
**Name:** `VERCEL_ORG_ID`
**Value:** `tpgordon8`

### 11. VERCEL_PROJECT_ID
**Name:** `VERCEL_PROJECT_ID`
**Value:** `prj_6Zk8C52NSLdMz2XmUz1Vmm0Ns0XY`

### 12. VERCEL_TOKEN
**Name:** `VERCEL_TOKEN`
**Value:** Get from https://vercel.com/account/tokens

**How to get Vercel token:**
1. Go to https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: "GitHub Actions CI/CD"
4. Scope: "Full Account"
5. Click "Create" and copy the token
6. Paste it as the value for VERCEL_TOKEN

---

## ✅ Verification

After adding all 12 secrets, you should see them listed at:
https://github.com/tpgordon8/Pet-App/settings/secrets/actions

The CI/CD workflow is now ready!

Push any commit to trigger the workflow:
```bash
git push
```

Monitor the deployment:
https://github.com/tpgordon8/Pet-App/actions
