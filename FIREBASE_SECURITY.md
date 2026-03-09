# Firebase Security Rules Setup

## Current Status
✅ **Current Status:** Firebase security rules are configured for open family access (last updated: March 9, 2026).

## How to Apply Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **petlog-c4c1e**
3. Navigate to **Realtime Database** > **Rules** tab
4. Copy the contents from `firebase-rules.json`
5. Paste into the rules editor
6. Click **Publish**

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
