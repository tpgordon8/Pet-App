# Testing Checklist - Multi-Household Invitation System

## Date: 2026-03-16
## Feature: Household Naming, Roles, Permissions, and Email Invitations

---

## 🚀 Pre-Testing Setup

- [ ] Ensure `.env` file has all Firebase credentials including `VITE_FIREBASE_MEASUREMENT_ID`
- [ ] Run `npm install` to ensure all dependencies are installed
- [ ] Start dev server with `npm run dev`
- [ ] Open browser DevTools Console to monitor for errors
- [ ] Open Firebase Console to monitor database changes in real-time

---

## 1️⃣ Household Creation Flow

### Test Case 1.1: Create New Household
- [ ] Navigate to onboarding page
- [ ] Click "Create New Household"
- [ ] Complete all onboarding steps
- [ ] **Expected:** Household is created with auto-generated name "[Your Name]'s Household"
- [ ] **Expected:** Creator is assigned "owner" role
- [ ] **Expected:** All owner permissions are set to `true`
- [ ] **Verify in Firebase:** Check `households/{code}/name` exists
- [ ] **Verify in Firebase:** Check `households/{code}/members/{name}/role` === "owner"
- [ ] **Verify in Firebase:** Check `households/{code}/members/{name}/permissions` object

### Test Case 1.2: Check Owner Permissions
- [ ] After creating household, check localStorage for:
  - `householdId`
  - `householdCode`
  - `householdName`
  - `memberName`
- [ ] Open browser console and run: `localStorage`
- [ ] **Expected:** All values are populated correctly

---

## 2️⃣ Household Settings Modal

### Test Case 2.1: Open Settings Modal
- [ ] On dashboard, click the "⚙️ Settings" button
- [ ] **Expected:** Household Settings modal opens
- [ ] **Expected:** Modal displays current household name
- [ ] **Expected:** Modal displays household code
- [ ] **Expected:** Modal displays list of members
- [ ] **Expected:** Owner has "Owner" badge
- [ ] **Expected:** Current user has "You" badge

### Test Case 2.2: Edit Household Name (Owner Only)
- [ ] Click "Edit" button next to household name
- [ ] Change name to "Test Household 123"
- [ ] Click "Save"
- [ ] **Expected:** Toast notification "Household name updated!"
- [ ] **Expected:** Name updates in modal immediately
- [ ] **Expected:** Dashboard header shows new name
- [ ] **Verify in Firebase:** Check `households/{code}/name` updated
- [ ] **Verify Analytics:** Event `household_action` with `action: name_updated` logged

### Test Case 2.3: Copy Household Code
- [ ] Click "Copy" button next to household code
- [ ] **Expected:** Toast notification "Household code copied!"
- [ ] **Expected:** Button shows "✓ Copied" for 2 seconds
- [ ] Paste into a text editor
- [ ] **Expected:** Correct household code is pasted

### Test Case 2.4: Non-Owner Cannot Edit Name
- [ ] Have a second user join the household (see next section)
- [ ] Log in as the second user (member, not owner)
- [ ] Open Settings modal
- [ ] **Expected:** NO "Edit" button visible next to household name
- [ ] **Expected:** Household name is displayed in read-only mode

---

## 3️⃣ Invite Modal & Link Sharing

### Test Case 3.1: Open Invite Modal
- [ ] In Settings modal, click "+ Invite" button
- [ ] **Expected:** Invite modal opens
- [ ] **Expected:** "Share Link" tab is active by default
- [ ] **Expected:** Invite link is displayed

### Test Case 3.2: Copy Invite Link
- [ ] Copy the invite link
- [ ] Paste into browser address bar
- [ ] **Expected:** Link format: `http://localhost:5173/join?code={HOUSEHOLD_CODE}`
- [ ] **Expected:** Toast notification "Invite link copied!"
- [ ] **Verify Analytics:** Event `invite_sent` with `invite_method: link` logged

### Test Case 3.3: Copy Household Code from Invite Modal
- [ ] In invite modal, copy the household code
- [ ] **Expected:** Toast notification "Household code copied!"
- [ ] **Expected:** Button shows "✓" for 2 seconds

### Test Case 3.4: Email Invitation Tab
- [ ] Switch to "Send Email" tab
- [ ] Enter recipient name: "Test User"
- [ ] Enter email: "invalid-email"
- [ ] Click "Send Invitation Email"
- [ ] **Expected:** Error message "Please enter a valid email address"
- [ ] Enter valid email: "test@example.com"
- [ ] Click "Send Invitation Email"
- [ ] **Expected:** Either:
  - Success message if Firebase Extensions configured
  - OR toast notification explaining email requires setup
- [ ] **Verify in Firebase:** Check `/mail/{inviteId}` collection for email record
- [ ] **Verify Analytics:** Event `invite_sent` with `invite_method: email` logged

---

## 4️⃣ Join Household via Invite Link

### Test Case 4.1: Join via Link (Happy Path)
- [ ] Open invite link in new incognito window: `/join?code=ABC123`
- [ ] **Expected:** Onboarding page loads automatically on "Join Household" step
- [ ] **Expected:** Household code is pre-filled with "ABC123"
- [ ] Enter your name: "Test Member"
- [ ] Enter the 6-digit passcode
- [ ] Click "Join Household"
- [ ] **Expected:** Success! Redirected to dashboard
- [ ] **Expected:** Dashboard shows household name
- [ ] **Expected:** You're listed as a member (not owner)
- [ ] **Verify in Firebase:** Check `households/{code}/members/{name}/role` === "member"
- [ ] **Verify in Firebase:** Check permissions are limited (canInviteMembers: false, etc.)
- [ ] **Verify Analytics:** Event `household_action` with `action: joined` logged

### Test Case 4.2: Join via Link (Wrong Passcode)
- [ ] Open invite link in new incognito window
- [ ] Enter correct household code
- [ ] Enter WRONG 6-digit passcode
- [ ] Click "Join Household"
- [ ] **Expected:** Error message "Incorrect passcode"
- [ ] **Expected:** User remains on join page

### Test Case 4.3: Join via Link (Invalid Household Code)
- [ ] Open invite link with non-existent code: `/join?code=INVALID999`
- [ ] Enter your name
- [ ] Enter any 6-digit passcode
- [ ] Click "Join Household"
- [ ] **Expected:** Error message "Household not found"

---

## 5️⃣ Member Permissions & Role System

### Test Case 5.1: Owner Permissions
- [ ] Log in as household owner
- [ ] Open Settings modal
- [ ] **Expected:** "Edit" button visible for household name
- [ ] **Expected:** "+ Invite" button visible
- [ ] Open Invite modal
- [ ] **Expected:** Can generate invite links
- [ ] **Expected:** Can send email invitations

### Test Case 5.2: Member Permissions (Non-Owner)
- [ ] Log in as a regular member (not owner)
- [ ] Open Settings modal
- [ ] **Expected:** NO "Edit" button for household name
- [ ] **Expected:** "+ Invite" button NOT visible (canInviteMembers: false)
- [ ] Try to access pets/activities
- [ ] **Expected:** Can edit pets (canEditPets: true)
- [ ] **Expected:** Can delete activities (canDeleteActivities: true)

### Test Case 5.3: View Members List
- [ ] Open Settings modal
- [ ] **Expected:** All household members listed
- [ ] **Expected:** Owner has "Owner" badge
- [ ] **Expected:** Current user has "You" badge
- [ ] **Expected:** Member count displays correctly: "Members (2)" or similar

---

## 6️⃣ Real-Time Sync

### Test Case 6.1: Household Name Updates Across Devices
- [ ] Open dashboard in Browser Window A (owner)
- [ ] Open dashboard in Browser Window B (same or different user)
- [ ] In Window A: Change household name to "Real-Time Test"
- [ ] **Expected:** Window B updates household name immediately (within 1-2 seconds)
- [ ] **Expected:** NO page refresh needed

### Test Case 6.2: New Member Joins
- [ ] Open dashboard in Browser Window A (existing member)
- [ ] Open invite link in Browser Window B (new user)
- [ ] In Window B: Complete join flow
- [ ] In Window A: Open Settings modal → Members list
- [ ] **Expected:** New member appears in list immediately
- [ ] **Expected:** Member count updates

---

## 7️⃣ Analytics Tracking

### Test Case 7.1: Firebase Analytics Console
- [ ] Open Firebase Console → Analytics → DebugView
- [ ] Perform the following actions and verify events:

**Household Actions:**
- [ ] Create household → Event: `household_action` (action: created)
- [ ] Join household → Event: `household_action` (action: joined)
- [ ] Update household name → Event: `household_action` (action: name_updated)

**Activity Logging:**
- [ ] Log a Poop activity → Event: `activity_logged` (activity_type: Poop)
- [ ] Log with notes → Event: `activity_logged` (has_notes: true)
- [ ] Log with photo → Event: `activity_logged` (has_photo: true)
- [ ] Log medical activity → Event: `medical_activity`

**Pet Actions:**
- [ ] Add a pet → Event: `pet_action` (action: added, species: Dog)

**Invitations:**
- [ ] Copy invite link → Event: `invite_sent` (invite_method: link)
- [ ] Send email invite → Event: `invite_sent` (invite_method: email)

**Page Views:**
- [ ] Navigate to dashboard → Event: `page_view` (page_name: dashboard)

---

## 8️⃣ Edge Cases & Error Handling

### Test Case 8.1: Empty Household Name
- [ ] Try to save household name with empty string ""
- [ ] **Expected:** Error message "Household name cannot be empty"
- [ ] **Expected:** Name NOT saved

### Test Case 8.2: Very Long Household Name
- [ ] Try to save household name with 100+ characters
- [ ] **Expected:** Either truncates or shows error (depending on implementation)

### Test Case 8.3: Special Characters in Name
- [ ] Save household name: "Luna & Max's 🐾 Home"
- [ ] **Expected:** Name saves successfully with emojis and special chars
- [ ] **Expected:** Displays correctly in UI

### Test Case 8.4: Logout and Re-Login
- [ ] Logout from household (Leave Household button)
- [ ] **Expected:** Redirected to home/onboarding
- [ ] **Expected:** localStorage cleared
- [ ] Re-join the same household
- [ ] **Expected:** All data loads correctly
- [ ] **Expected:** Household name displays

### Test Case 8.5: Multiple Households (User Switches)
- [ ] Create Household A
- [ ] Logout
- [ ] Create Household B
- [ ] **Expected:** Now viewing Household B data
- [ ] **Expected:** Household A data NOT visible
- [ ] Logout and rejoin Household A
- [ ] **Expected:** Household A data loads correctly

---

## 9️⃣ Mobile Responsiveness

### Test Case 9.1: Mobile Settings Modal
- [ ] Open Settings modal on mobile viewport (375px width)
- [ ] **Expected:** Modal fits screen, no horizontal scroll
- [ ] **Expected:** All buttons are touch-friendly (min 44px tap target)
- [ ] **Expected:** Text is readable (min 16px font size)

### Test Case 9.2: Mobile Invite Modal
- [ ] Open Invite modal on mobile
- [ ] **Expected:** Tabs ("Share Link" / "Send Email") are easy to tap
- [ ] **Expected:** Invite link is fully visible (may need horizontal scroll)
- [ ] **Expected:** Copy buttons work correctly on mobile

---

## 🔟 Dark Mode

### Test Case 10.1: Settings Modal in Dark Mode
- [ ] Enable dark mode (if implemented)
- [ ] Open Settings modal
- [ ] **Expected:** Modal uses dark background colors
- [ ] **Expected:** Text is readable (light text on dark bg)
- [ ] **Expected:** Buttons have appropriate dark mode styles

### Test Case 10.2: Invite Modal in Dark Mode
- [ ] Enable dark mode
- [ ] Open Invite modal
- [ ] **Expected:** All tabs and inputs use dark mode colors
- [ ] **Expected:** No color contrast issues

---

## 1️⃣1️⃣ Backward Compatibility

### Test Case 11.1: Existing Households Without Name
- [ ] If testing with old database, check households without `name` field
- [ ] **Expected:** Auto-generates name "[Creator]'s Household" on first load
- [ ] **Expected:** No errors or crashes

### Test Case 11.2: Members Without Roles
- [ ] If testing with old members without `role` field
- [ ] **Expected:** Defaults to "member" role
- [ ] **Expected:** Gets default permissions (limited access)

---

## 1️⃣2️⃣ Firebase Extensions (Email Invitations)

### Test Case 12.1: Firebase Extensions Setup (Manual)
- [ ] Install "Trigger Email" extension in Firebase Console
- [ ] Configure with SMTP provider (SendGrid, Mailgun, etc.)
- [ ] Test sending invite email
- [ ] **Expected:** Email delivers within 30 seconds
- [ ] **Expected:** Email contains invite link, household name, inviter name
- [ ] **Expected:** Clicking link navigates to `/join?code={CODE}`

### Test Case 12.2: Email Not Configured
- [ ] If Firebase Extensions NOT set up
- [ ] Try to send email invite
- [ ] **Expected:** Graceful error message
- [ ] **Expected:** Suggests using "Share Link" instead
- [ ] **Expected:** App doesn't crash

---

## ✅ Final Checks

- [ ] No console errors in browser DevTools
- [ ] No Firebase security rule violations
- [ ] All toasts display correctly
- [ ] All modals can be closed (X button, backdrop click, Escape key)
- [ ] Page refreshes preserve state (localStorage works)
- [ ] Git commit message is descriptive
- [ ] All new files are staged
- [ ] No sensitive data (API keys) committed
- [ ] Branch name matches session ID requirement: `claude/pet-activity-logger-Etaqb`

---

## 📊 Testing Summary

**Total Test Cases:** 50+
**Critical Path Tests:** 15
**Edge Cases:** 10
**Mobile Tests:** 4
**Analytics Tests:** 8

**Recommended Testing Time:** 2-3 hours for comprehensive testing

---

## 🚨 Known Limitations (Document These)

- [ ] Email invitations require Firebase Extensions setup (not automatic)
- [ ] Medical activities cannot be edited (by design)
- [ ] Old activities without petId show only in "All Pets" view
- [ ] No vaccination reminders yet (future feature)
- [ ] No weight trend charts (future feature)
- [ ] No pet edit/delete UI yet (store functions exist)

---

## 📝 Notes for User

After completing this checklist:
1. Document any bugs found in GitHub Issues
2. Note any unexpected behavior
3. Suggest UX improvements
4. Confirm all critical path tests pass before merging to main

---

**Tester Name:** _________________
**Date Completed:** _________________
**Status:** [ ] Pass  [ ] Fail  [ ] Needs Fixes
**Notes:**
