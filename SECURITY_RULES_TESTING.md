# Firebase Security Rules Testing

**Date:** 2026-03-21
**Status:** ✅ Test framework created, ready for execution
**Session:** https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3

---

## Overview

Comprehensive security rules testing for Firebase Realtime Database and Firestore using Firebase Emulator Suite and Vitest.

**Files:**
- `firebase.json` - Emulator configuration
- `tests/security/firebase-rules.test.js` - Automated security tests
- `firebase-rules.json` - Realtime Database rules
- `firestore.rules` - Firestore rules

---

## Emulator Configuration

**Added to firebase.json:**
```json
{
  "emulators": {
    "database": {
      "port": 9000
    },
    "firestore": {
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

**Emulator UI:** http://localhost:4000 (when running)

---

## Running Security Tests

### Start Firebase Emulator
```bash
# Terminal 1: Start emulators
firebase emulators:start

# Wait for emulators to be ready
# You should see:
# ✔ All emulators ready! It is now safe to connect your app.
# ┌─────────────┬────────────────┬──────────────┐
# │ Emulator    │ Host:Port      │ View in UI   │
# ├─────────────┼────────────────┼──────────────┤
# │ Database    │ localhost:9000 │              │
# │ Firestore   │ localhost:8080 │              │
# │ UI          │ localhost:4000 │              │
# └─────────────┴────────────────┴──────────────┘
```

### Run Security Tests
```bash
# Terminal 2: Run tests
npm run test:security

# Or manually:
vitest tests/security/firebase-rules.test.js
```

---

## Test Coverage

### Realtime Database Rules (14 tests)

**Household Creation:**
- ✅ Allow creating new household
- ✅ Prevent reading non-existent households
- ✅ Allow reading existing households
- ✅ Prevent overwriting existing household root

**Passcode Security:**
- ✅ Hide passcode from client reads (.read: false)
- ✅ Prevent passcode modification after creation

**Household Data:**
- ✅ Prevent changing household code
- ✅ Allow updating household name
- ✅ Allow reading/writing members
- ✅ Validate member roles (owner/member)

**Activities and Pets:**
- ✅ Allow reading activities
- ✅ Allow writing activities
- ✅ Allow reading pets
- ✅ Allow writing pets

### Firestore Rules (6 tests)

**Mail Templates:**
- ✅ Allow reading templates
- ✅ Prevent writing templates (admin-only via console)

**Email Queue:**
- ✅ Allow creating email queue items
- ✅ Prevent reading email queue (privacy)

**Invites:**
- ✅ Allow reading invites
- ✅ Allow creating valid invites with required fields
- ✅ Prevent creating invites without required fields

---

## Security Rules Summary

### Realtime Database (`firebase-rules.json`)

**Critical Protections:**
1. **Passcode Hidden:** `.read: false` - clients cannot read passcode
2. **Passcode Immutable:** `.write: !data.exists()` - set once at creation
3. **Code Immutable:** `.write: false` - household code cannot change
4. **Existence Check:** Prevents brute-force household enumeration
5. **Creation Only:** Root write only for new households

**Trust-Based Model:**
- No Firebase Authentication required (by design)
- Household code + passcode stored in localStorage
- Security relies on passcode secrecy
- **Production Recommendation:** Implement Firebase Auth for true security

### Firestore (`firestore.rules`)

**Critical Protections:**
1. **Mail Templates Locked:** Read-only, write via Firebase Console only
2. **Email Queue Write-Once:** Can create, cannot read/update/delete
3. **Invite Validation:** Required fields enforced (householdId, inviterName, createdAt, expiresAt)
4. **Expiry Checks:** Invites must expire in future
5. **Default Deny:** All other collections locked

---

## Known Limitations

### Current Security Model
⚠️ **Trust-Based, Not Auth-Based**

**What This Means:**
- Anyone with household code can attempt passcode guesses
- No rate limiting on passcode attempts
- Passcode stored in plain text in database (hidden from reads, but visible in Firebase Console)
- No session expiration

**What Prevents Abuse:**
1. Passcode cannot be read by clients (.read: false)
2. Household must exist before reads (.read: data.exists())
3. Passcode is 6 digits (1 million combinations)
4. Limited motivation to attack (pet tracking data, not financial)

### Recommended Improvements (Future)

**Phase 1: Add Rate Limiting**
- Implement Cloud Function to track failed auth attempts
- Block IP after 5 failed passcode attempts
- Require CAPTCHA after 3 failed attempts

**Phase 2: Add Firebase Authentication**
- Implement Google Sign-In
- Use Custom Claims for household access
- Store passcode hashed with bcrypt
- Implement proper session management

**Phase 3: Add Encryption**
- Encrypt sensitive medical data at rest
- Use Cloud Functions for encryption/decryption
- Implement field-level encryption

---

## Test Execution Results

**When run, document here:**

```markdown
## Test Run: YYYY-MM-DD HH:MM

### Results
- Total Tests: 20
- Passed: XX
- Failed: XX
- Duration: X.XXs

### Failures (if any)
1. [Test name] - [Reason]
2. [Test name] - [Reason]

### Actions Taken
1. [Fix description]
2. [Fix description]
```

---

## Manual Testing Checklist

**After automated tests pass, manually verify:**

### Household Creation Flow
- [ ] Create household in app with emulator running
- [ ] Verify household appears in Emulator UI (http://localhost:4000)
- [ ] Verify passcode is stored
- [ ] Try to read passcode via Firebase Console (should see value, but clients can't read)

### Security Boundary Testing
- [ ] Try creating household with same code (should fail)
- [ ] Try reading non-existent household (should fail)
- [ ] Try modifying passcode (should fail)
- [ ] Try modifying household code (should fail)

### Data Operations
- [ ] Add pet to household
- [ ] Log activity
- [ ] Add member
- [ ] Verify all data appears correctly in Emulator UI

### Firestore Operations
- [ ] Create invite
- [ ] Verify invite has required fields
- [ ] Try creating invalid invite (should fail)
- [ ] Try writing to mail_templates (should fail)

---

## Troubleshooting

### Emulator Won't Start
```bash
# Kill any existing emulator processes
pkill -f firebase

# Clear emulator data
firebase emulators:start --clear-data

# Check if ports are in use
lsof -i :9000
lsof -i :8080
lsof -i :4000
```

### Tests Fail to Connect
```bash
# Verify emulator is running
curl http://localhost:9000/.json

# Restart emulator with export
firebase emulators:start --export-on-exit=./emulator-data
```

### Tests Pass but App Fails
- Check app is using emulator in development mode
- Verify environment variables point to emulator
- Check browser console for connection errors

---

## CI/CD Integration (Future)

**GitHub Actions:**
```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: firebase emulators:exec "npm run test:security"
```

---

## Resources

**Firebase Emulator Suite:**
- [Emulator Docs](https://firebase.google.com/docs/emulator-suite)
- [Security Rules Testing](https://firebase.google.com/docs/rules/unit-tests)
- [Realtime DB Rules](https://firebase.google.com/docs/database/security)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)

**Security Best Practices:**
- [Firebase Security Checklist](https://firebase.google.com/support/guides/security-checklist)
- [OWASP A01:2021 - Broken Access Control](https://owasp.org/Top10/A01_2021-Broken_Access_Control/)

---

**Last Updated:** 2026-03-21
**Test Framework:** ✅ Ready
**Next Run:** Before deploying security rule changes
