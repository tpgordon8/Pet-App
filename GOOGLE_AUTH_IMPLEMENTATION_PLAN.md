# Google Authentication Implementation Plan for Tailr
**Document Version:** 1.0
**Created:** 2026-03-16
**Status:** Planning Phase

---

## Executive Summary

This document outlines a comprehensive plan to implement Google Sign-In authentication for Tailr, transitioning from the current "household trust model" (no authentication) to a secure, scalable multi-household authentication system while maintaining the app's core value proposition: **quick, frictionless pet activity logging**.

**Key Goals:**
1. **Privacy & Security:** Proper household data isolation through Google authentication
2. **Scalability:** Support up to 50+ households in 2026 with clean architecture
3. **Frictionless UX:** Maintain <3 second time-to-log for returning users
4. **Growth-Ready:** Infrastructure that supports future expansion

---

## Research Findings: What Works & What Doesn't

### ✅ What Works Well

#### 1. **Google One Tap + Button Dual Implementation**
**Pattern:** Implement both One Tap (automatic) and Sign-In Button (manual fallback)

**Why it works:**
- One Tap enables returning users to sign in automatically in <1 second
- Button provides explicit control for first-time users and those who dismissed One Tap
- 90% increase in signup conversion compared to button-only approaches
- Meets modern user expectations for "just works" authentication

**Source:** [Google One Tap Login Guide 2025](https://guptadeepak.com/the-complete-guide-to-google-one-tap-login-everything-developers-need-to-know/)

#### 2. **Persistent "Signed In as..." State**
**Pattern:** After Google auth, show persistent user identity (name + photo) in app header

**Why it works:**
- Users feel confident about which account they're using
- Reduces accidental cross-household data pollution
- Builds trust through transparency
- Standard pattern in successful apps (Gmail, YouTube, etc.)

**Source:** [Best Sign Up Flows (2026): 15 UX Examples That Convert](https://www.eleken.co/blog-posts/sign-up-flow)

#### 3. **Social Login Foregrounding (Google/Apple First)**
**Pattern:** Primary CTAs for Google/Apple sign-in, minimal alternative options

**Why it works:**
- Reduces signup time by 70-80%
- Users trust established identity providers
- Eliminates password management friction
- Example: Slack makes signup "nearly effortless" by foregrounding Google/Apple

**Source:** [Login & Signup UX: The 2025 Guide to Best Practices](https://www.authgear.com/post/login-signup-ux-guide)

#### 4. **Automatic Sign-In for Returning Users**
**Pattern:** Enable `auto_select: true` in One Tap configuration

**Why it works:**
- Zero-click sign-in for returning users
- Meets user expectation of "staying logged in"
- Critical for mobile-first apps where typing is friction

**Source:** [Google One Tap Login Guide 2025](https://guptadeepak.com/the-complete-guide-to-google-one-tap-login-everything-developers-need-to-know/)

#### 5. **Composable-Based Vue 3 Pattern**
**Pattern:** Use Composition API composables (`useAuth()`) for auth state management

**Why it works:**
- Clean separation of concerns
- Reactive auth state across all components
- Easy to test and maintain
- Aligns with Vue 3 + Pinia architecture already in Tailr

**Source:** [Simple Google Authentication using Vue 3 and Firebase](https://runthatline.com/simple-google-authentication-composable-using-vue-3-and-firebase/)

---

### ❌ What Doesn't Work (Common Mistakes to Avoid)

#### 1. **One Tap Without Button Fallback**
**Problem:** One Tap can be disabled by users or fail due to browser settings

**Why it fails:**
- Users can globally disable One Tap in Google Account settings
- Safari/Firefox ITP (Intelligent Tracking Prevention) blocks One Tap in many scenarios
- No active Google session = no One Tap prompt
- Cooldown periods after manual dismissal (2 hours → 2 weeks exponential backoff)

**Solution:** Always implement Sign-In Button alongside One Tap

**Source:** [Best Practices for Implementing Sign in with Google](https://developers.google.com/identity/siwg/best-practices)

#### 2. **Using One Tap on Every Page Without Context**
**Problem:** Showing One Tap prompt on unauthenticated marketing pages feels intrusive

**Why it fails:**
- Confuses first-time visitors who don't understand the value yet
- Wastes the "first impression" of One Tap
- Can trigger user to dismiss and hit cooldown period

**Solution:** Only show One Tap on pages where authentication provides immediate value (e.g., dashboard, after adding first pet)

#### 3. **Not Handling Cooldown Periods in Development**
**Problem:** Developers get frustrated when One Tap disappears during testing

**Why it fails:**
- Clicking X on One Tap triggers cooldown (2hr → 1 day → 2 weeks)
- Developers repeatedly test and dismiss, locking themselves out
- Makes testing feel broken when it's actually working as designed

**Solution:**
- Document cooldown behavior for developers
- Provide clear instructions to clear Google cookies for testing
- Test with multiple Google accounts
- Use incognito mode for fresh sessions

**Source:** [Google One Tap Login Guide 2025](https://guptadeepak.com/the-complete-guide-to-google-one-tap-login-everything-developers-need-to-know/)

#### 4. **Covering One Tap Prompt with Other UI Elements**
**Problem:** Z-index conflicts cause One Tap to be hidden or cut off

**Why it fails:**
- Google's One Tap iframe has specific z-index requirements
- Modal overlays, sticky headers, or toast notifications can conflict
- Users don't see the prompt = can't authenticate

**Solution:** Configure One Tap position (top_right, top_left) to avoid UI conflicts, ensure no elements have z-index higher than One Tap

#### 5. **Not Completing OAuth Consent Screen**
**Problem:** Incomplete branding/support info in Google Cloud Console

**Why it fails:**
- Google shows generic/scary consent screen
- Users don't trust incomplete applications
- Can block app from production use

**Solution:** Complete all OAuth consent screen fields (app name, logo, support email, privacy policy, terms of service)

**Source:** [Best Practices for Implementing Sign in with Google](https://developers.google.com/identity/siwg/best-practices)

#### 6. **Using Email as Primary User Identifier**
**Problem:** Storing Google email as the user ID in database

**Why it fails:**
- Users can change their email address
- Email is not guaranteed to be unique across Google accounts
- Email is PII (privacy concern)

**Solution:** Use the `sub` claim from Google JWT as permanent user ID

**Source:** [Best Practices for Implementing Sign in with Google](https://developers.google.com/identity/siwg/best-practices)

#### 7. **Not Implementing CSRF Protection**
**Problem:** Accepting Google JWT without validating state token

**Why it fails:**
- Vulnerable to cross-site request forgery attacks
- Malicious site can trick user into authenticating to wrong account

**Solution:** Generate random state token, store in cookie, verify match with POST body

**Source:** [Google One Tap Login Guide 2025](https://guptadeepak.com/the-complete-guide-to-google-one-tap-login-everything-developers-need-to-know/)

---

## Household Multi-User Pattern Analysis

### The Challenge: Household ≠ Single User

**Current Tailr Model:**
- Two users (Tara + Meag) share one household
- Both log activities for shared pets
- No concept of "account owner" vs "household member"
- Equal access and permissions

**Industry Patterns Reviewed:**

1. **Streaming Apps (Netflix, Disney+, Spotify Family)**
   - One account owner pays/manages subscription
   - Family members get "profiles" not "accounts"
   - Profiles are lightweight (name, avatar, preferences)
   - No separate authentication per profile

2. **Smart Home Apps (Google Home, Apple HomeKit)**
   - One account creates "home"
   - Invite other Google/Apple accounts to join home
   - Each person authenticates with their own account
   - Permissions: Owner > Admin > Member

3. **Shared Calendar Apps (Google Calendar, Cozi)**
   - Each person has their own authenticated account
   - Calendars are shared resources between accounts
   - Clear attribution: "Tara added event" vs "Meag added event"

### Recommended Pattern for Tailr: **Authenticated Multi-User Household**

**Why this pattern:**
- Aligns with Tailr's current UX (equal partners, not owner/member hierarchy)
- Provides clear activity attribution (currently tracked as "Tara" vs "Meag")
- Scales to 50+ households with proper data isolation
- Each person controls their own Google account (privacy)
- Natural invitation flow: "Tara invites Meag to join household"

**How it works:**
1. **First user** signs in with Google → creates household automatically
2. **First user** invites second user via email
3. **Second user** clicks invite link → signs in with Google → joins household
4. Both users see same pets, same activity feed
5. Activities are attributed to Google user (name + photo from Google profile)
6. Either user can invite additional household members (future: pet sitters, vets)

**Database Structure:**
```
/users/{googleUserId}
  - name: "Tara Gordon"
  - email: "tara@example.com"
  - photoURL: "https://..."
  - householdId: "household_abc123"
  - role: "owner" | "member"
  - createdAt: timestamp

/households/{householdId}
  - name: "Tara & Meag's Pets"
  - createdAt: timestamp
  - createdBy: googleUserId
  - members: [googleUserId1, googleUserId2]

/households/{householdId}/pets/{petId}
  - name: "Luna"
  - species: "Dog"
  - emoji: "🐕"
  - createdAt: timestamp

/households/{householdId}/activities/{activityId}
  - type: "Poop"
  - emoji: "💩"
  - timestamp: timestamp
  - userId: googleUserId (who logged it)
  - petId: petId
  - notes: "..."
  - medicalData: {...}
```

---

## Recommended Authentication Flow for Tailr

### Phase 1: First-Time User (New to Tailr)

**Step 1: Landing Page**
- User visits tailr.app
- Sees marketing copy: "Track your pet's activities with your household"
- CTA: "Sign in with Google" button (prominent, centered)
- No One Tap prompt yet (user hasn't seen value)

**Step 2: Google Sign-In (Popup)**
- User clicks "Sign in with Google"
- Google popup opens (via `signInWithPopup`)
- User selects Google account
- Popup closes, user is redirected to onboarding

**Step 3: Onboarding (Household Creation)**
- Welcome screen: "Hi Tara! Let's set up your household"
- Auto-creates household with user's name: "Tara's Household"
- Optional: "Invite household members" (can skip)
- Proceeds to "Add your first pet" flow (current onboarding)

**Step 4: Dashboard (Authenticated)**
- User lands on dashboard
- Header shows: "Signed in as Tara" + photo
- Can immediately start logging activities
- One Tap is now enabled for future visits

**Time to First Log:** ~30-45 seconds (acceptable for first-time setup)

---

### Phase 2: Returning User (Already Has Account)

**Step 1: Landing Page with One Tap**
- User visits tailr.app
- One Tap prompt appears (top-right corner)
- Shows: "Continue as Tara" with photo
- User clicks "Continue"

**Step 2: Instant Sign-In**
- One Tap signs user in silently (no popup)
- User is redirected to dashboard

**Step 3: Dashboard**
- User lands on dashboard in <2 seconds
- Can immediately log activities

**Time to First Log:** <3 seconds ✅ (meets frictionless requirement)

---

### Phase 3: Household Invitation Flow

**Step 1: Invite Sent (by Tara)**
- Dashboard → Settings → "Invite household member"
- Enter email: "meag@example.com"
- System sends invite email with magic link

**Step 2: Invite Received (by Meag)**
- Meag receives email: "Tara invited you to join their household on Tailr"
- Clicks link: `tailr.app/invite?token=abc123`

**Step 3: Invite Acceptance (by Meag)**
- Meag lands on invite page
- Sees: "Tara invited you to track Luna's activities together"
- CTA: "Sign in with Google to accept"
- Meag clicks, signs in with Google popup

**Step 4: Joined Household**
- Meag's Google user is added to household
- Meag lands on dashboard
- Sees same pets as Tara
- Can immediately start logging activities

---

### Phase 4: Multi-Device Experience

**Scenario:** Tara signs in on phone, then laptop

**Phone:**
- One Tap auto-signs in (already authenticated on device)
- Dashboard loads in <2 seconds

**Laptop:**
- One Tap shows "Continue as Tara"
- Clicks, signs in
- Dashboard loads in <2 seconds

**Sync:**
- Both devices see real-time updates via Firebase Realtime Database
- No change to existing sync behavior

---

## Database Schema Changes

### New Collections

#### `/users/{googleUserId}`
```javascript
{
  googleUserId: "115566889900112233", // from Google JWT 'sub' claim
  email: "tara@example.com",
  name: "Tara Gordon",
  photoURL: "https://lh3.googleusercontent.com/...",
  householdId: "household_abc123",
  role: "owner", // or "member"
  createdAt: 1710604800000,
  lastSeenAt: 1710604800000
}
```

#### `/households/{householdId}`
```javascript
{
  householdId: "household_abc123", // auto-generated
  name: "Tara & Meag's Pets",
  createdAt: 1710604800000,
  createdBy: "115566889900112233", // googleUserId of creator
  members: ["115566889900112233", "223344556677889900"] // array of googleUserIds
}
```

#### `/invites/{inviteToken}`
```javascript
{
  inviteToken: "uuid-v4-token",
  householdId: "household_abc123",
  invitedBy: "115566889900112233", // googleUserId
  invitedEmail: "meag@example.com",
  status: "pending", // or "accepted" or "expired"
  createdAt: 1710604800000,
  expiresAt: 1711209600000 // 7 days later
}
```

### Modified Collections

#### `/households/{householdId}/pets/{petId}`
- No schema change
- Same as current `/pets/{petId}`
- Now namespaced under household

#### `/households/{householdId}/activities/{activityId}`
```javascript
{
  activityId: "activity_123",
  type: "Poop",
  emoji: "💩",
  timestamp: 1710604800000,
  userId: "115566889900112233", // NEW: Google user ID instead of name string
  petId: "pet_456",
  notes: "Normal consistency",
  medicalData: null // or {...}
}
```

**Migration Strategy for Existing Activities:**
- Activities with `user: "Tara"` string will need mapping to Google user ID
- Create migration script that:
  1. Identifies unique user names in existing activities
  2. Maps to Google user IDs after first sign-in
  3. Updates all historical activities with userId field
  4. Keeps legacy `user` field for backwards compatibility during migration

---

## Firebase Security Rules Changes

### Current Rules (No Auth)
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### New Rules (With Auth)
```json
{
  "rules": {
    "users": {
      "$userId": {
        ".read": "$userId === auth.uid",
        ".write": "$userId === auth.uid"
      }
    },
    "households": {
      "$householdId": {
        ".read": "root.child('users').child(auth.uid).child('householdId').val() === $householdId",
        ".write": "root.child('users').child(auth.uid).child('householdId').val() === $householdId",
        "pets": {
          ".read": "root.child('users').child(auth.uid).child('householdId').val() === $householdId",
          ".write": "root.child('users').child(auth.uid).child('householdId').val() === $householdId"
        },
        "activities": {
          ".read": "root.child('users').child(auth.uid).child('householdId').val() === $householdId",
          ".write": "root.child('users').child(auth.uid).child('householdId').val() === $householdId"
        }
      }
    },
    "invites": {
      "$inviteToken": {
        ".read": "auth != null",
        ".write": "root.child('invites').child($inviteToken).child('invitedBy').val() === auth.uid"
      }
    }
  }
}
```

**Key Security Principles:**
- Users can only read/write their own user record
- Users can only access households they are members of
- Household membership is validated by checking user's `householdId` field
- Invites can be created by authenticated household members
- All rules require authentication (`auth != null`)

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**Tasks:**
1. ✅ Research Google Sign-In best practices (COMPLETED)
2. ⏳ Set up Google Cloud Project OAuth consent screen
3. ⏳ Add Firebase Authentication to existing Firebase project
4. ⏳ Install dependencies: `firebase/auth`
5. ⏳ Create `src/composables/useAuth.js` composable
6. ⏳ Create `src/stores/auth.js` Pinia store
7. ⏳ Update `src/firebase/config.js` to initialize Auth

**Deliverables:**
- Google Cloud OAuth client configured
- Firebase Auth enabled in console
- Auth composable with basic sign-in/sign-out methods
- Auth store with reactive user state

**Testing (Claude Executes):**
- [ ] Firebase Auth SDK initializes without errors
- [ ] Auth composable exports expected methods
- [ ] Auth store reactive state works in dev tools

---

### Phase 2: Sign-In UI (Week 1-2)

**Tasks:**
1. ⏳ Create `src/components/GoogleSignInButton.vue`
2. ⏳ Integrate Google Sign-In JavaScript library
3. ⏳ Implement `signInWithPopup` flow
4. ⏳ Add One Tap configuration
5. ⏳ Create signed-in user header component
6. ⏳ Update `App.vue` to show auth state
7. ⏳ Add sign-out functionality

**Deliverables:**
- Working Sign-In Button component
- One Tap prompt on dashboard
- User profile display in header
- Sign-out button in settings

**Testing (Claude Executes):**
- [ ] Sign-In Button opens Google popup
- [ ] Successful sign-in redirects to dashboard
- [ ] One Tap prompt appears on page load
- [ ] User name + photo display correctly
- [ ] Sign-out clears auth state
- [ ] Multiple browsers/incognito mode sign-in works
- [ ] Cross-browser testing (Chrome, Safari, Firefox)

---

### Phase 3: Database Schema Migration (Week 2)

**Tasks:**
1. ⏳ Create `/users/{userId}` collection structure
2. ⏳ Create `/households/{householdId}` collection structure
3. ⏳ Write migration script for existing data
4. ⏳ Update Pinia stores to use new paths
5. ⏳ Add household creation logic on first sign-in
6. ⏳ Update activity logging to use `userId` instead of `user`

**Deliverables:**
- New database collections created
- Existing data migrated to household structure
- Stores updated to read from new paths
- Automatic household creation on signup

**Testing (Claude Executes):**
- [ ] New user creates household automatically
- [ ] Pets are created under correct household path
- [ ] Activities are created under correct household path
- [ ] Existing users can access migrated data
- [ ] No data loss during migration
- [ ] Real-time sync still works across devices

---

### Phase 4: Household Invitation Flow (Week 3)

**Tasks:**
1. ⏳ Create invitation backend logic (Cloud Function or client-side)
2. ⏳ Create `src/views/InviteView.vue` (accept invite page)
3. ⏳ Add "Invite Member" UI in settings
4. ⏳ Implement email invitation sending (via SendGrid or Firebase Extensions)
5. ⏳ Add invite acceptance flow
6. ⏳ Update household members array on acceptance

**Deliverables:**
- Invite creation form
- Email invitation sent to invitee
- Invite acceptance page
- Multi-user household support

**Testing (Claude Executes):**
- [ ] User A can create invite
- [ ] User B receives email with invite link
- [ ] User B can click link and sign in
- [ ] User B is added to User A's household
- [ ] Both users see same pets and activities
- [ ] Activity attribution shows correct user (name + photo)
- [ ] Invite expires after 7 days
- [ ] Expired invite shows error message

---

### Phase 5: Security Rules & Route Guards (Week 3-4)

**Tasks:**
1. ⏳ Update Firebase security rules (as defined above)
2. ⏳ Deploy security rules to Firebase
3. ⏳ Add Vue Router navigation guards
4. ⏳ Redirect unauthenticated users to sign-in
5. ⏳ Redirect authenticated users away from sign-in page
6. ⏳ Test security rules with Firebase Emulator

**Deliverables:**
- Production-ready security rules deployed
- Route guards protect authenticated pages
- Unauthenticated users cannot access data
- Authenticated users cannot access other households

**Testing (Claude Executes):**
- [ ] Unauthenticated user cannot read `/households/*`
- [ ] Unauthenticated user redirected to sign-in page
- [ ] User A cannot read User B's household data
- [ ] User A can read their own household data
- [ ] User A can write to their own household data
- [ ] Route guards redirect correctly
- [ ] Security rules tested with Firebase Emulator

---

### Phase 6: Polish & Edge Cases (Week 4)

**Tasks:**
1. ⏳ Handle One Tap cooldown gracefully (show button if One Tap fails)
2. ⏳ Add loading states during sign-in
3. ⏳ Add error handling (network failures, auth failures)
4. ⏳ Add session persistence (Firebase handles this)
5. ⏳ Test offline-to-online auth flow
6. ⏳ Add analytics for sign-in success/failure
7. ⏳ Update documentation (README, DEVLOG, ROADMAP)

**Deliverables:**
- Graceful error handling for all auth flows
- Loading states for all async operations
- Analytics tracking for auth events
- Updated documentation

**Testing (Claude Executes):**
- [ ] One Tap cooldown doesn't break app
- [ ] Network failure shows error message
- [ ] Google popup blocked by browser shows fallback
- [ ] Offline sign-in uses cached credentials
- [ ] Session persists across page refreshes
- [ ] Session persists across browser restarts
- [ ] Sign-in works on slow 3G network
- [ ] Sign-in works on airplane mode → online transition

---

## Detailed Testing Plan (Executed by Claude)

### Test Environment Setup

**Prerequisites:**
1. Firebase project with Auth enabled
2. Google Cloud OAuth client configured
3. Local dev server running (`npm run dev`)
4. Firebase Emulator Suite (optional but recommended)

**Test Accounts:**
- Google Account A: `tara.test@gmail.com`
- Google Account B: `meag.test@gmail.com`
- Google Account C: `random.user@gmail.com` (for unauthorized access tests)

**Test Devices/Browsers:**
- Chrome (Desktop + Mobile)
- Safari (Desktop + iOS)
- Firefox (Desktop)
- Incognito/Private browsing modes

---

### Test Suite 1: Basic Sign-In Flow

**Test 1.1: First-Time Sign-In (New User)**
```
Steps:
1. Open app in incognito mode
2. Click "Sign in with Google" button
3. Select Google account A
4. Approve consent screen
5. Verify redirect to onboarding

Expected Results:
✅ Google popup opens
✅ Consent screen shows app name and logo
✅ After approval, user is redirected to onboarding
✅ User record created in /users/{userId}
✅ Household record created in /households/{householdId}
✅ User header shows "Signed in as Tara" + photo
```

**Test 1.2: Returning User Sign-In (Existing User)**
```
Steps:
1. Open app (already signed in before)
2. Observe One Tap prompt
3. Click "Continue as Tara"
4. Verify redirect to dashboard

Expected Results:
✅ One Tap prompt appears within 1 second
✅ Click signs user in without popup
✅ Dashboard loads within 2 seconds
✅ User sees their pets and activities
```

**Test 1.3: Sign-In Button Fallback (One Tap Dismissed)**
```
Steps:
1. Open app in incognito mode
2. Observe One Tap prompt
3. Click "X" to dismiss
4. Click "Sign in with Google" button
5. Select Google account A

Expected Results:
✅ One Tap prompt disappears when dismissed
✅ Sign-In Button still visible
✅ Button opens popup successfully
✅ Sign-in completes successfully
```

**Test 1.4: Sign-Out Flow**
```
Steps:
1. Sign in as User A
2. Navigate to Settings
3. Click "Sign Out"
4. Verify redirect to landing page

Expected Results:
✅ User is signed out
✅ Redirected to landing page
✅ User header no longer shows user info
✅ Attempting to access dashboard redirects to sign-in
```

---

### Test Suite 2: One Tap Behavior

**Test 2.1: One Tap Auto-Select for Returning User**
```
Steps:
1. Sign in as User A
2. Sign out
3. Refresh page
4. Observe One Tap prompt with auto_select enabled

Expected Results:
✅ One Tap appears automatically
✅ User is signed in without clicking (if auto_select: true)
✅ Dashboard loads within 2 seconds
```

**Test 2.2: One Tap Cooldown Period**
```
Steps:
1. Open app in incognito mode
2. Dismiss One Tap by clicking "X"
3. Refresh page
4. Observe One Tap does not appear
5. Clear cookies
6. Refresh page
7. Observe One Tap appears again

Expected Results:
✅ One Tap does not appear after dismissal (cooldown active)
✅ After clearing cookies, One Tap appears again
✅ Sign-In Button always available as fallback
```

**Test 2.3: One Tap in Safari/Firefox (ITP Browsers)**
```
Steps:
1. Open app in Safari
2. Observe One Tap behavior

Expected Results:
✅ One Tap shows different UX (may open popup)
✅ Sign-in completes successfully
✅ No console errors
```

**Test 2.4: One Tap with No Active Google Session**
```
Steps:
1. Sign out of all Google accounts
2. Open app
3. Observe One Tap does not appear
4. Sign in with Button

Expected Results:
✅ One Tap does not appear (no active Google session)
✅ Sign-In Button works as fallback
```

---

### Test Suite 3: Household & Multi-User

**Test 3.1: Household Creation on First Sign-In**
```
Steps:
1. Sign in as new User A
2. Complete onboarding
3. Check Firebase Database

Expected Results:
✅ /users/{userA_id} record created
✅ /households/{householdA_id} record created
✅ User A's householdId matches household record
✅ Household createdBy field = User A's ID
✅ Household members array = [User A's ID]
```

**Test 3.2: Invite Second User to Household**
```
Steps:
1. Sign in as User A
2. Navigate to Settings → Invite Member
3. Enter User B's email: meag.test@gmail.com
4. Click "Send Invite"
5. Verify invite created in database

Expected Results:
✅ /invites/{token} record created
✅ invitedEmail = "meag.test@gmail.com"
✅ invitedBy = User A's ID
✅ householdId = User A's household ID
✅ status = "pending"
✅ expiresAt = 7 days from now
```

**Test 3.3: Accept Household Invite**
```
Steps:
1. Open invite link as User B: /invite?token=abc123
2. Click "Sign in with Google to accept"
3. Sign in with Google Account B
4. Verify User B is added to household

Expected Results:
✅ User B is redirected to dashboard
✅ /users/{userB_id} record created
✅ User B's householdId = User A's household ID
✅ Household members array = [User A's ID, User B's ID]
✅ Invite status = "accepted"
✅ User B sees same pets as User A
```

**Test 3.4: Multi-User Activity Attribution**
```
Steps:
1. User A logs activity: "Poop" at 10:00 AM
2. User B logs activity: "Food" at 10:05 AM
3. Both users view activity feed

Expected Results:
✅ Activity feed shows both activities
✅ Poop activity shows "Logged by Tara" (User A's name)
✅ Food activity shows "Logged by Meag" (User B's name)
✅ Both users see real-time updates
✅ Activity userId field = correct Google user ID
```

**Test 3.5: Expired Invite Handling**
```
Steps:
1. Create invite as User A
2. Manually set expiresAt to past date in database
3. Open invite link as User C
4. Attempt to accept

Expected Results:
✅ Error message: "This invite has expired"
✅ User C is not added to household
✅ Option to request new invite
```

---

### Test Suite 4: Security & Permissions

**Test 4.1: Unauthenticated User Cannot Read Data**
```
Steps:
1. Sign out completely
2. Attempt to access /households/{householdA_id}/pets via API
3. Observe Firebase error

Expected Results:
✅ Firebase returns "permission denied" error
✅ No data is returned
✅ Frontend shows sign-in prompt
```

**Test 4.2: User Cannot Access Other Household's Data**
```
Steps:
1. Sign in as User A (household A)
2. Attempt to read /households/{householdB_id}/pets via API
3. Observe Firebase error

Expected Results:
✅ Firebase returns "permission denied" error
✅ User A cannot see household B's data
✅ No cross-household data leakage
```

**Test 4.3: User Can Only Write to Their Own Household**
```
Steps:
1. Sign in as User A
2. Attempt to write activity to household B via API
3. Observe Firebase error

Expected Results:
✅ Firebase returns "permission denied" error
✅ Activity is not created
```

**Test 4.4: Route Guards Redirect Unauthenticated Users**
```
Steps:
1. Sign out
2. Attempt to navigate to /dashboard
3. Observe redirect

Expected Results:
✅ User is redirected to / (landing page)
✅ Toast notification: "Please sign in to continue"
```

**Test 4.5: Route Guards Redirect Authenticated Users from Sign-In**
```
Steps:
1. Sign in as User A
2. Attempt to navigate to / (landing page)
3. Observe redirect

Expected Results:
✅ User is redirected to /dashboard
✅ Cannot access landing page while signed in
```

---

### Test Suite 5: Edge Cases & Error Handling

**Test 5.1: Network Failure During Sign-In**
```
Steps:
1. Open DevTools → Network tab
2. Set network to "Offline"
3. Click "Sign in with Google"
4. Observe error handling

Expected Results:
✅ Error message: "Network error. Please check your connection."
✅ User can retry sign-in
✅ No app crash
```

**Test 5.2: Google Popup Blocked by Browser**
```
Steps:
1. Enable popup blocker
2. Click "Sign in with Google"
3. Observe error handling

Expected Results:
✅ Error message: "Popup was blocked. Please allow popups for this site."
✅ User can click to retry
✅ Instructions to enable popups shown
```

**Test 5.3: User Closes Google Popup Manually**
```
Steps:
1. Click "Sign in with Google"
2. Close popup before signing in
3. Observe app state

Expected Results:
✅ App returns to normal state (not signed in)
✅ No error message (user cancelled intentionally)
✅ User can retry sign-in
```

**Test 5.4: Session Persistence Across Page Refresh**
```
Steps:
1. Sign in as User A
2. Refresh page (hard refresh with Cmd+Shift+R)
3. Observe auth state

Expected Results:
✅ User remains signed in after refresh
✅ Dashboard loads without re-prompting sign-in
✅ User data is still available
```

**Test 5.5: Session Persistence Across Browser Restart**
```
Steps:
1. Sign in as User A
2. Close browser completely
3. Reopen browser
4. Navigate to app

Expected Results:
✅ User remains signed in
✅ One Tap may auto-sign-in if enabled
✅ No data loss
```

**Test 5.6: Offline → Online Transition**
```
Steps:
1. Sign in as User A
2. Go offline (airplane mode or DevTools)
3. Attempt to log activity
4. Go back online
5. Observe sync

Expected Results:
✅ Activity is queued while offline (existing behavior)
✅ Activity syncs when back online
✅ Auth state remains valid
```

**Test 5.7: Slow 3G Network Sign-In**
```
Steps:
1. Set DevTools network to "Slow 3G"
2. Click "Sign in with Google"
3. Observe loading states

Expected Results:
✅ Loading spinner appears during sign-in
✅ Sign-in completes successfully (may take 10-15 seconds)
✅ No timeout errors
```

**Test 5.8: Multiple Tabs Same User**
```
Steps:
1. Sign in as User A in Tab 1
2. Open Tab 2
3. Log activity in Tab 1
4. Observe Tab 2

Expected Results:
✅ Both tabs show same auth state
✅ Activity logged in Tab 1 appears in Tab 2 in real-time
✅ Signing out in Tab 1 signs out Tab 2
```

**Test 5.9: CSRF Token Validation**
```
Steps:
1. Intercept sign-in request
2. Modify state token in POST body
3. Send request
4. Observe error

Expected Results:
✅ Firebase Auth rejects request
✅ Error: "Invalid state token"
✅ User is not signed in
```

---

### Test Suite 6: Migration & Backwards Compatibility

**Test 6.1: Existing User Migration**
```
Scenario: User had data before auth was implemented

Steps:
1. Create test household with old schema (no userId)
2. Sign in as User A
3. Run migration script
4. Verify data is accessible

Expected Results:
✅ Old activities are migrated to new household structure
✅ Old pets are migrated to new household structure
✅ Legacy `user: "Tara"` field is mapped to new userId
✅ No data loss during migration
✅ User can access all historical data
```

**Test 6.2: Activity Attribution After Migration**
```
Steps:
1. Sign in as User A (migrated account)
2. View activity feed with old activities
3. Verify old activities show correct user

Expected Results:
✅ Old activities show correct attribution (e.g., "Tara")
✅ New activities use Google user name and photo
✅ Both display correctly in feed
```

---

### Test Suite 7: Performance & UX

**Test 7.1: Time to First Log (Returning User)**
```
Steps:
1. Sign in as User A (returning user)
2. Measure time from page load to dashboard ready
3. Verify <3 seconds requirement

Expected Results:
✅ One Tap auto-signs in <1 second
✅ Dashboard loads <2 seconds after sign-in
✅ Total time <3 seconds
```

**Test 7.2: Time to First Log (First-Time User)**
```
Steps:
1. Sign in as new User B
2. Measure time from landing to first activity log
3. Verify reasonable onboarding time

Expected Results:
✅ Sign-in <5 seconds
✅ Onboarding (add pet) <30 seconds
✅ Total time <45 seconds (acceptable for first-time setup)
```

**Test 7.3: Mobile Sign-In UX (iOS Safari)**
```
Steps:
1. Open app on iPhone (Safari)
2. Observe One Tap behavior
3. Complete sign-in flow

Expected Results:
✅ One Tap appears and works on mobile Safari
✅ Touch targets are large enough (44x44 points minimum)
✅ Google popup is mobile-optimized
✅ No horizontal scrolling during sign-in
```

**Test 7.4: Dark Mode Compatibility**
```
Steps:
1. Enable dark mode
2. Observe sign-in UI
3. Complete sign-in

Expected Results:
✅ Sign-In Button adapts to dark mode
✅ One Tap prompt is readable in dark mode
✅ User header photo/name are visible in dark mode
```

---

### Test Suite 8: Analytics & Monitoring

**Test 8.1: Sign-In Success Analytics**
```
Steps:
1. Configure analytics event tracking
2. Sign in as User A
3. Verify event logged

Expected Results:
✅ Event: "sign_in_success" logged
✅ Event properties: method = "google", userId = "..."
✅ Event appears in analytics dashboard
```

**Test 8.2: Sign-In Failure Analytics**
```
Steps:
1. Trigger sign-in error (e.g., network failure)
2. Verify event logged

Expected Results:
✅ Event: "sign_in_failure" logged
✅ Event properties: error = "network_error"
✅ Event appears in analytics dashboard
```

**Test 8.3: One Tap Dismiss Analytics**
```
Steps:
1. Dismiss One Tap prompt
2. Verify event logged

Expected Results:
✅ Event: "one_tap_dismissed" logged
✅ Event appears in analytics dashboard
```

---

## Test Execution Checklist

### Pre-Launch Testing (Claude Executes)

**Phase 1: Basic Functionality**
- [ ] All tests in Suite 1 pass (Basic Sign-In Flow)
- [ ] All tests in Suite 2 pass (One Tap Behavior)
- [ ] All tests in Suite 3 pass (Household & Multi-User)

**Phase 2: Security**
- [ ] All tests in Suite 4 pass (Security & Permissions)
- [ ] Firebase security rules validated with Emulator

**Phase 3: Edge Cases**
- [ ] All tests in Suite 5 pass (Edge Cases & Error Handling)
- [ ] All tests in Suite 6 pass (Migration & Backwards Compatibility)

**Phase 4: Performance & UX**
- [ ] All tests in Suite 7 pass (Performance & UX)
- [ ] Time to first log <3 seconds confirmed
- [ ] Mobile UX validated on real iOS device

**Phase 5: Monitoring**
- [ ] All tests in Suite 8 pass (Analytics & Monitoring)
- [ ] Analytics events confirmed in dashboard

---

## Success Metrics

### Technical Metrics
- ✅ 100% of test suites pass
- ✅ Firebase security rules validated
- ✅ Zero data leakage between households
- ✅ Session persistence 100% reliable

### UX Metrics
- ✅ Time to first log (returning user): <3 seconds
- ✅ Time to first log (new user): <45 seconds
- ✅ Sign-in success rate: >95%
- ✅ One Tap adoption rate: >60% (of eligible users)

### Business Metrics (Post-Launch)
- Track sign-up conversion rate (landing → signed in)
- Track household creation rate
- Track multi-user household adoption rate
- Track daily active users (DAU)

---

## Rollout Strategy

### Option A: Hard Launch (All Users)
**Pros:** Simple, clean cut, no legacy code
**Cons:** Risky, requires perfect migration, users locked out if issues

**Not Recommended** for Tailr (2 active users, trust model already working)

### Option B: Soft Launch (Opt-In Beta)
**Pros:** Safe, can test with real users, easy rollback
**Cons:** Maintains two code paths, complex migration

**Recommended Approach:**
1. Deploy auth system alongside existing no-auth system
2. Add banner: "Try our new secure sign-in! (Beta)"
3. Let Tara + Meag opt-in when ready
4. After 2 weeks of stable usage, make auth required
5. Deprecate no-auth access

### Option C: Feature Flag
**Pros:** Instant rollback, gradual rollout, A/B testing
**Cons:** Adds complexity, requires feature flag infrastructure

**Future consideration:** Use for 50+ households

---

## Risk Mitigation

### Risk 1: Migration Data Loss
**Mitigation:**
- Full database backup before migration
- Migration script tested in emulator
- Dry-run migration in staging environment
- Rollback plan: restore from backup

### Risk 2: Sign-In Failure Blocks Users
**Mitigation:**
- Maintain Sign-In Button as fallback to One Tap
- Clear error messages with recovery steps
- Support contact info visible on error screens
- Monitoring alerts for sign-in failure rate >5%

### Risk 3: Performance Regression (>3s to first log)
**Mitigation:**
- One Tap auto-sign-in for returning users
- Firebase Auth session cached locally
- Measure performance in test suite
- Rollback if time to first log >5 seconds

### Risk 4: Cross-Household Data Leakage
**Mitigation:**
- Security rules validated in emulator
- Test suite verifies data isolation
- Code review for all database queries
- Monitoring alerts for unauthorized access attempts

---

## Post-Launch Monitoring

### Week 1: Critical Metrics
- Sign-in success rate
- Sign-in failure error types
- Time to first log (p50, p95, p99)
- Security rule violation attempts

### Week 2-4: Adoption Metrics
- One Tap adoption rate
- Multi-user household creation rate
- Activity attribution (are both users logging?)
- User feedback (bugs, confusion, friction points)

### Month 2+: Business Metrics
- Daily active users (DAU)
- Monthly active users (MAU)
- New household creation rate
- Churn rate (households that stop using app)

---

## Documentation Updates

### Files to Update After Implementation

1. **README.md**
   - Add "Sign in with Google" to features
   - Update screenshots with auth UI
   - Add privacy policy link

2. **DEVLOG.md**
   - Log all implementation steps
   - Document migration process
   - Record any issues encountered

3. **ROADMAP.md**
   - Mark "Google Authentication" as ✅ Complete
   - Add new auth-dependent features (e.g., email notifications)

4. **CLAUDE.md**
   - Update "Current State" section
   - Update database schema documentation
   - Update technology stack (add Firebase Auth)
   - Update code patterns with auth examples

5. **DEPLOYMENT.md** (new file)
   - Document Google Cloud OAuth setup steps
   - Document Firebase Auth configuration
   - Document security rules deployment

6. **PRIVACY.md** (new file)
   - Privacy policy (required for OAuth consent screen)
   - Data collection disclosure (Google user data)
   - Data retention policy
   - User rights (data export, deletion)

---

## Open Questions for User

1. **Email Invitations:** Should we use SendGrid, Firebase Extensions (Trigger Email), or simple mailto: links?
2. **Household Naming:** Auto-generate household name ("Tara's Household") or prompt user to enter custom name?
3. **User Roles:** Keep roles simple (owner/member) or add granular permissions (admin, editor, viewer)?
4. **Migration Timing:** Deploy auth immediately or wait until other features are ready?
5. **Analytics:** Use Google Analytics 4, PostHog, or custom Firebase Analytics?

---

## Conclusion

This plan provides a comprehensive roadmap to implement Google Sign-In authentication for Tailr with:
- **Security:** Proper household data isolation via Firebase security rules
- **Scalability:** Architecture supports 50+ households and beyond
- **Frictionless UX:** <3 second time-to-log for returning users via One Tap
- **Growth-Ready:** Foundation for future features (notifications, data export, vet sharing)

The testing plan covers 50+ test cases across 8 test suites, all executable by Claude before user review. This ensures a high-quality, production-ready implementation.

**Next Steps:**
1. User reviews this plan and answers open questions
2. Claude executes Phase 1 (Foundation)
3. Claude executes testing suite
4. User reviews working prototype
5. Iterate based on feedback
6. Deploy to production with soft launch strategy

---

**Sources:**

## Research Sources

### Google Sign-In Best Practices
- [Best Practices for Implementing Sign in with Google | Google for Developers](https://developers.google.com/identity/siwg/best-practices)
- [Sign in with Google button UX | Web guides | Google for Developers](https://developers.google.com/identity/gsi/web/guides/personalized-button)
- [Display Google One Tap | Web guides | Google for Developers](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)
- [Understand the One Tap user experience | Web guides | Google for Developers](https://developers.google.com/identity/gsi/web/guides/features)

### Implementation Patterns
- [Google One Tap Login Guide 2025: 90% More Signups for Devs](https://guptadeepak.com/the-complete-guide-to-google-one-tap-login-everything-developers-need-to-know/)
- [Simple Google Authentication using Vue 3 and Firebase](https://runthatline.com/simple-google-authentication-composable-using-vue-3-and-firebase/)
- [Vue 3 Firebase Authentication Tutorial with Google and Email Login](https://www.djamware.com/post/685946e25a251364ebc862e7/vue-3-firebase-authentication-tutorial-with-google-and-email-login)
- [Firebase Authentication | VueFire](https://vuefire.vuejs.org/guide/auth.html)
- [Authentication with Vue 3 and Firebase - LogRocket Blog](https://blog.logrocket.com/authentication-vue-3-firebase/)

### UX Best Practices
- [Best Sign Up Flows (2026): 15 UX Examples That Convert](https://www.eleken.co/blog-posts/sign-up-flow)
- [Login & Signup UX: The 2025 Guide to Best Practices (Examples & Tips) - Authgear](https://www.authgear.com/post/login-signup-ux-guide)
- [Mobile-First UX Design: Best Practices for 2026](https://www.trinergydigital.com/news/mobile-first-ux-design-best-practices-in-2026)

### Multi-User Patterns
- [Multi-Tenant Applications Best Practices - Auth0 Docs](https://auth0.com/docs/get-started/auth0-overview/create-tenants/multi-tenant-apps-best-practices)
- [Best Practices for Multi-Tenant Authorization](https://www.permit.io/blog/best-practices-for-multi-tenant-authorization)

---

**Document Status:** Ready for User Review
**Next Action:** User feedback on open questions → Begin Phase 1 implementation