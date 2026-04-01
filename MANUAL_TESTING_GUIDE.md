# Manual Testing Guide for MUXI Fixes

**Date:** April 1, 2026  
**Testing:** Pull-to-refresh fix & Signup improvements

---

## Prerequisites

- [ ] Measurement ID added to `.env` file
- [ ] Dev server running: `npm run dev`
- [ ] Mobile device or browser DevTools mobile emulation

---

## Test 1: Signup Flow ✅

### Setup
1. Open **incognito/private browsing** window
2. Navigate to http://localhost:5173 (or your deployed URL)
3. Open browser DevTools (F12)
4. Go to **Console** tab to watch for errors

### Test Steps

**Step 1: Clear Data**
```javascript
// Run this in browser console:
localStorage.clear();
location.reload();
```

**Step 2: Start Onboarding**
1. You should see welcome screen
2. Click **"Create New Household"**
3. **Expected:** Navigate to "Add Pet" step
4. **Check console:** No errors

**Step 3: Add Pet**
1. Enter pet name: "TestPet"
2. Select emoji: 🐕
3. Select species: "Dog"
4. Click **"Continue"**
5. **Expected:** Move to next step
6. **Check console:** No errors

**Step 4: Create Account (CRITICAL)**
1. Enter your name: e.g., "TestUser"
2. Leave household code empty (will auto-generate)
3. Enter 6-digit passcode: e.g., "123456"
4. Click **"Continue"**

**Expected Results:**
- ✅ No console errors about "measurementId"
- ✅ Should navigate to "Household Setup" or "Success" screen
- ✅ Error messages (if any) are specific and stay visible for 8 seconds

---

## Test 2: Pull-to-Refresh on Mobile 📱

**Required:** Actual mobile device (iOS Safari or Android Chrome)

1. Deploy app or use ngrok for local testing
2. Open on phone browser
3. Scroll down, then drag down from top
4. **Expected:** Page should NOT refresh
5. **Verify:** Scrolling still feels natural

---

## Success Criteria

- ✅ Signup completes without errors
- ✅ Helpful error messages if issues occur
- ✅ No pull-to-refresh on mobile
- ✅ No Analytics errors in console

