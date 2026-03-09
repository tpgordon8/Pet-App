# Firebase Security Rules Setup

## Current Status
✅ **Current Status:** Firebase security rules are configured for open family access (last updated: March 9, 2026).

## How to Apply Rules

### Option 1: Manual Deployment (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **petlog-c4c1e**
3. Navigate to **Realtime Database** > **Rules** tab
4. Copy the contents from `firebase-rules.json`
5. Paste into the rules editor
6. Click **Publish**

**Mobile Tip:** Use desktop mode in your mobile browser to access Firebase Console on your phone.

### Option 2: CLI Deployment (Recommended)

Deploy rules from the command line without using Firebase Console:

#### One-time setup:
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase (opens browser for authentication)
firebase login
```

#### Deploy rules:

**Using npm scripts:**
```bash
npm run deploy:rules
```

**Using the deployment script:**
```bash
./deploy-firebase-rules.sh
```

**Direct Firebase CLI command:**
```bash
firebase deploy --only database --project petlog-c4c1e
```

#### Verify deployment:
- Check: https://console.firebase.google.com/project/petlog-c4c1e/database/petlog-c4c1e-default-rtdb/rules
- Test app: https://pet-app-five-chi.vercel.app/

### Option 3: Automated Deployment (GitHub Actions)

For automatic deployment when rules change:

#### Setup (one-time):

1. **Generate a Firebase CI token:**
   ```bash
   firebase login:ci
   ```
   Copy the token that's generated (looks like `1//0c-abcd1234...`)

2. **Add token to GitHub Secrets:**
   - Go to: https://github.com/tpgordon8/Pet-App/settings/secrets/actions
   - Click "New repository secret"
   - Name: `FIREBASE_TOKEN`
   - Value: Paste the CI token
   - Click "Add secret"

3. **Done!** Future changes to `firebase-rules.json` will auto-deploy when pushed to `main` branch.

You can also manually trigger deployment:
- Go to: https://github.com/tpgordon8/Pet-App/actions
- Select "Deploy Firebase Rules" workflow
- Click "Run workflow"

## Current Rules Configuration

The `firebase-rules.json` file contains:
- **Open read/write access** for `pets`, `activities`, and `medications` nodes
- **Performance indexes** for efficient queries
- Suitable for trusted family member use (Tara & Meag)

## Security Considerations

### Current Setup (Family Use)
```json
{
  "rules": {
    "pets": {
      ".read": true,
      ".write": true,
      ".indexOn": ["name", "createdAt"]
    },
    "activities": {
      ".read": true,
      ".write": true,
      ".indexOn": ["timestamp", "petId", "type"]
    },
    "medications": {
      ".read": true,
      ".write": true,
      "$petId": {
        ".indexOn": ["active", "createdAt"]
      }
    }
  }
}
```

**Pros:**
- ✅ Simple - works for trusted household devices
- ✅ No login required
- ✅ Quick access for logging pet activities

**Cons:**
- ⚠️ Anyone with the Firebase config can read/write data
- ⚠️ No authentication required

### For Production/Public Use (Future)

If you ever want to restrict access, use authenticated rules:

```json
{
  "rules": {
    "pets": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["name", "createdAt"]
    },
    "activities": {
      ".read": "auth != null",
      ".write": "auth != null",
      ".indexOn": ["timestamp", "petId", "type"]
    },
    "medications": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$petId": {
        ".indexOn": ["active", "createdAt"]
      }
    }
  }
}
```

This requires users to authenticate (sign in) before accessing data.

## Recommendation

For your current use case (Tara & Meag logging pet activities at home):
- ✅ **Use the open rules** from `firebase-rules.json`
- ✅ Don't share the Firebase config publicly
- ✅ Keep the app for personal use

The risk is minimal since this is pet activity data, not sensitive personal information.

## Questions?

If you need help applying the rules or want to add authentication later, check the Firebase documentation:
- [Firebase Security Rules](https://firebase.google.com/docs/database/security)
- [User Authentication](https://firebase.google.com/docs/auth)
