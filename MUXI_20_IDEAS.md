# 20 App Improvement Ideas for Tailr

**Project:** MUXI - Mobile UX Overhaul & Onboarding Stability Initiative  
**Date:** April 1, 2026  
**Status:** Execution Plans Included

---

## Impact × Effort Matrix

**Quick Wins** (High Impact, Low Effort): Ideas #1, #2, #3, #5, #8, #11  
**Major Features** (High Impact, High Effort): Ideas #4, #9, #12, #16  
**Incremental** (Med Impact, Low Effort): Ideas #6, #7, #10, #13, #14, #15  
**Strategic** (Med Impact, Med Effort): Ideas #17, #18, #19, #20

---

## 🎨 UI/UX Enhancements

### #1: Activity Search & Filter by Keyword ⭐ QUICK WIN

**Problem:** Users can't search through historical activities  
**Impact:** High - Essential for finding specific events (e.g., "when did we last give flea meds?")  
**Effort:** Low - 2-3 hours

**Execution Plan:**
1. Add search input to ActivityFeed.vue header
2. Create computed property to filter activities by:
   - Activity type
   - Notes content
   - Pet name
   - User name
3. Debounce search input (300ms) for performance
4. Highlight search matches in results
5. Add "Clear search" button

**Files to Modify:**
- `src/components/ActivityFeed.vue` - Add search UI and filter logic
- `src/stores/activities.js` - Add `searchActivities(query)` method

**Code Snippet:**
```vue
<!-- ActivityFeed.vue -->
<div class="search-bar">
  <input 
    v-model="searchQuery"
    type="search"
    placeholder="Search activities..."
    class="input"
  />
</div>

<script setup>
import { ref, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'

const searchQuery = ref('')

const filteredActivities = computed(() => {
  if (!searchQuery.value) return activities.value
  
  const query = searchQuery.value.toLowerCase()
  return activities.value.filter(a => 
    a.type.toLowerCase().includes(query) ||
    a.notes?.toLowerCase().includes(query) ||
    a.petName?.toLowerCase().includes(query)
  )
})
</script>
```

---

### #2: Swipe to Delete Activities 📱 QUICK WIN

**Problem:** Delete requires multiple taps (click activity → click edit → click delete → confirm)  
**Impact:** High - Faster workflow on mobile  
**Effort:** Low - 2-3 hours

**Execution Plan:**
1. Install `vue3-touch-events` or use native touch events
2. Add swipe gesture detection to ActivityFeed items
3. Reveal delete button on swipe left
4. Animate swipe with smooth transition
5. Add haptic feedback (if supported)

**Files to Modify:**
- `src/components/ActivityFeed.vue` - Add swipe handlers
- `package.json` - Add `vue3-touch-events` dependency

**Code Snippet:**
```vue
<div 
  v-for="activity in activities"
  class="activity-item swipeable"
  @touchstart="handleTouchStart"
  @touchmove="handleTouchMove"
  @touchend="handleTouchEnd"
  :style="{ transform: `translateX(${swipeOffset}px)` }"
>
  <div class="activity-content">...</div>
  <button class="delete-action" @click="deleteActivity(activity.id)">
    🗑️ Delete
  </button>
</div>
```

---

### #3: Quick Log from Lock Screen (PWA Shortcut) ⭐ QUICK WIN

**Problem:** Users must open app, navigate to dashboard, click button  
**Impact:** High - Instant logging reduces friction  
**Effort:** Low - 1-2 hours

**Execution Plan:**
1. Update `manifest.json` with shortcuts
2. Add URL parameters to dashboard route (e.g., `?action=poop`)
3. Auto-trigger activity modal when URL param present
4. Support most common activities (Poop, Pee, Food, Meds)

**Files to Modify:**
- `manifest.json` - Add `shortcuts` array
- `src/views/DashboardView.vue` - Handle URL params
- `src/router/index.js` - Parse query params

**Code Snippet:**
```json
// manifest.json
{
  "shortcuts": [
    {
      "name": "Log Poop",
      "short_name": "Poop",
      "description": "Quickly log a poop activity",
      "url": "/dashboard?action=poop",
      "icons": [{ "src": "/icons/poop.png", "sizes": "192x192" }]
    },
    {
      "name": "Log Pee",
      "url": "/dashboard?action=pee"
    }
  ]
}
```

---

### #4: Dark Mode Schedule (Auto-switch based on time)

**Problem:** Users must manually toggle dark mode  
**Impact:** High - Better UX, follows system conventions  
**Effort:** High - 4-5 hours (requires settings UI)

**Execution Plan:**
1. Add "Dark Mode Settings" section in DashboardView
2. Options:
   - Auto (follow system)
   - Light
   - Dark
   - Scheduled (custom times)
3. Store preference in localStorage
4. Use `@vueuse/core` `useDark()` composable
5. Add time picker for custom schedule

**Files to Modify:**
- `src/views/DashboardView.vue` - Add settings UI
- `src/composables/useDarkMode.js` - Create new composable
- `src/stores/settings.js` - Create settings store

---

### #5: Undo Last Activity (Toast notification with "Undo") ⭐ QUICK WIN

**Problem:** Accidental logs require manual deletion  
**Impact:** Medium - Prevents user frustration  
**Effort:** Low - 2 hours

**Execution Plan:**
1. Store last logged activity in local state
2. Modify toast.success() to include "Undo" button
3. On undo, call `deleteActivity(lastActivityId)`
4. Clear undo state after 8 seconds

**Files to Modify:**
- `src/composables/useToast.js` - Add `showUndoableToast()` method
- `src/stores/activities.js` - Track `lastLoggedActivity`

**Code Snippet:**
```javascript
// After logging activity
const lastActivityId = newActivityId
toast.success('Activity logged!', {
  action: {
    label: 'Undo',
    onClick: () => {
      activitiesStore.deleteActivity(lastActivityId)
      toast.info('Activity removed')
    }
  }
})
```

---

## ⚡ Performance Optimizations

### #6: Lazy Load Images in Activity Feed

**Problem:** Large activity feeds load all images at once  
**Impact:** Medium - Faster initial render, less bandwidth  
**Effort:** Low - 1-2 hours

**Execution Plan:**
1. Use `v-lazy` directive or Intersection Observer
2. Add loading placeholder for images
3. Progressive image loading (blur-up)
4. Implement image caching with Service Worker

**Files to Modify:**
- `src/components/ActivityFeed.vue` - Add lazy loading
- `src/composables/useLazyImage.js` - Create composable

---

### #7: Virtual Scrolling for Long Activity Lists

**Problem:** Rendering 1000+ activities causes lag  
**Impact:** Medium - Smooth scrolling for power users  
**Effort:** Medium - 3-4 hours

**Execution Plan:**
1. Install `vue-virtual-scroller`
2. Replace activity list with `<RecycleScroller>`
3. Set item height (dynamic or fixed)
4. Keep pagination as fallback

**Files to Modify:**
- `src/components/ActivityFeed.vue` - Implement virtual scroll
- `package.json` - Add dependency

---

### #8: Prefetch Next Pet's Data ⭐ QUICK WIN

**Problem:** Switching pets causes brief loading delay  
**Impact:** Medium - Instant pet switching  
**Effort:** Low - 1 hour

**Execution Plan:**
1. In `petsStore`, prefetch activities for all pets
2. Cache in memory with Map structure
3. Update on new activities
4. Lazy load on first visit

**Files to Modify:**
- `src/stores/pets.js` - Add prefetch logic
- `src/stores/activities.js` - Cache per-pet activities

---

## 📊 Data Visualization & Analytics

### #9: Weight Trend Chart (Line Graph)

**Problem:** Weight check data is only displayed as list  
**Impact:** High - Visualize pet's growth/health trends  
**Effort:** High - 5-6 hours

**Execution Plan:**
1. Install `chart.js` or `vue-chartjs`
2. Create `WeightChart.vue` component
3. Query weight check activities
4. Plot weight over time with trend line
5. Add unit toggle (lbs ↔ kg)
6. Export as image/PDF

**Files to Modify:**
- `src/components/WeightChart.vue` - New component
- `src/views/DashboardView.vue` - Embed chart
- `package.json` - Add chart library

---

### #10: Activity Heatmap Calendar

**Problem:** Hard to see patterns (e.g., poop frequency over months)  
**Impact:** Medium - Identify health patterns  
**Effort:** Medium - 4-5 hours

**Execution Plan:**
1. Create `ActivityHeatmap.vue` component
2. Grid layout: 7 columns (days) × N rows (weeks)
3. Color intensity based on activity count
4. Click day to see details
5. Filter by activity type

**Files to Modify:**
- `src/components/ActivityHeatmap.vue` - New component
- `src/stores/activities.js` - Add `getActivitiesByDate()` helper

---

### #11: Daily/Weekly/Monthly Stats Summary ⭐ QUICK WIN

**Problem:** Only "today" stats are shown  
**Impact:** Medium - Better insights into patterns  
**Effort:** Low - 2 hours

**Execution Plan:**
1. Add tabs to StatsWidget: "Today | This Week | This Month"
2. Compute weekly/monthly aggregates in store
3. Show comparison vs. previous period ("↑15% from last week")
4. Cache computations for performance

**Files to Modify:**
- `src/components/StatsWidget.vue` - Add tabs and new stats
- `src/stores/activities.js` - Add `weeklyStats` and `monthlyStats` computed

---

### #12: Export to PDF (Vet Visit Summary)

**Problem:** Hard to share medical history with vet  
**Impact:** High - Professional documentation  
**Effort:** High - 5-6 hours

**Execution Plan:**
1. Create "Export Report" button in dashboard
2. Use `jsPDF` library (already in dependencies)
3. Generate PDF with:
   - Pet profile
   - All medical activities (vet visits, vaccinations, weight)
   - Activity summary charts
   - Date range filter
4. Download as `[PetName]_Medical_Report_[Date].pdf`

**Files to Modify:**
- `src/composables/usePDFExport.js` - Create new composable
- `src/views/DashboardView.vue` - Add export button

---

## 🔔 Notifications & Reminders

### #13: Vaccination Due Date Reminders

**Problem:** Users forget when next vaccination is due  
**Impact:** High - Important for pet health  
**Effort:** Medium - 4-5 hours

**Execution Plan:**
1. Add "Next Due Date" field to vaccination modal
2. Store in `medicalData.nextDueDate`
3. Check daily for upcoming vaccinations (7 days out)
4. Show notification + in-app reminder banner
5. Use Web Notifications API + Service Worker

**Files to Modify:**
- `src/components/MedicalModal.vue` - Add due date field
- `src/composables/useNotifications.js` - Create notification system
- `public/sw.js` - Add reminder logic

---

### #14: Recurring Activity Reminders (e.g., "Feed at 6 PM")

**Problem:** Users forget regular tasks  
**Impact:** Medium - Improved pet care consistency  
**Effort:** Medium - 5-6 hours

**Execution Plan:**
1. Create "Reminders" section in settings
2. Add cron-like schedule (e.g., "Daily at 6 PM")
3. Store in Firebase under `/households/{id}/reminders`
4. Use Service Worker to show notifications
5. "Log Now" button in notification

**Files to Modify:**
- `src/views/SettingsView.vue` - Create settings UI (new view)
- `src/stores/reminders.js` - Create new store
- `public/sw.js` - Add notification logic

---

## 📱 Mobile-Specific Features

### #15: Haptic Feedback on Actions

**Problem:** No tactile feedback on button presses  
**Impact:** Low - Improved "feel" on mobile  
**Effort:** Low - 1 hour

**Execution Plan:**
1. Add `navigator.vibrate()` to activity log buttons
2. Different patterns for different actions:
   - Log activity: `[50]` (short buzz)
   - Delete: `[30, 50, 30]` (double buzz)
   - Success: `[100, 50, 100]` (celebration)
3. Add setting to disable vibrations

**Files to Modify:**
- `src/composables/useHaptic.js` - Create new composable
- All button components - Add haptic feedback

---

### #16: Voice Input for Notes

**Problem:** Typing on mobile is tedious  
**Impact:** High - Much faster note entry  
**Effort:** High - 6-7 hours

**Execution Plan:**
1. Add microphone icon to notes field
2. Use Web Speech API (`webkitSpeechRecognition`)
3. Real-time transcription
4. Fallback message if not supported
5. Privacy notice (no data sent to servers)

**Files to Modify:**
- `src/components/ActivityNotesModal.vue` - Add voice input UI
- `src/composables/useSpeechRecognition.js` - Create composable

---

### #17: Photo Gallery View for Pet

**Problem:** Photos scattered across activities  
**Impact:** Medium - Easier to browse pet photos  
**Effort:** Medium - 3-4 hours

**Execution Plan:**
1. Add "Photos" tab in pet details
2. Grid layout of all photos for selected pet
3. Lightbox view on click
4. Link back to source activity
5. Download/share individual photos

**Files to Modify:**
- `src/components/PetPhotosGallery.vue` - New component
- `src/views/DashboardView.vue` - Add photos section

---

## 🔒 Security & Privacy

### #18: Two-Factor Authentication (Optional)

**Problem:** Passcode alone may not be secure enough  
**Impact:** Medium - Enhanced security for sensitive data  
**Effort:** High - 7-8 hours

**Execution Plan:**
1. Add "Enable 2FA" in settings
2. Options: Email OTP or Authenticator App
3. Store 2FA secret in Firebase (encrypted)
4. Require 2FA on household join
5. Backup codes for recovery

**Files to Modify:**
- `src/stores/household.js` - Add 2FA logic
- `src/components/TwoFactorSetup.vue` - New component
- `src/views/SettingsView.vue` - Add security section

---

### #19: Activity Log Audit Trail

**Problem:** Can't see who edited/deleted activities  
**Impact:** Low - Accountability in multi-user households  
**Effort:** Medium - 3-4 hours

**Execution Plan:**
1. Add `editHistory` array to activity data structure
2. Track: `{ action: 'edited', by: 'Tara', at: timestamp, changes: {...} }`
3. Show "Last edited by X" in activity details
4. "View History" modal with change log

**Files to Modify:**
- `src/stores/activities.js` - Track edit history
- `src/components/ActivityHistoryModal.vue` - New component

---

## ♿ Accessibility Improvements

### #20: Keyboard Navigation & Screen Reader Support

**Problem:** App requires mouse/touch, not keyboard accessible  
**Impact:** High - WCAG compliance, inclusive design  
**Effort:** Medium - 4-5 hours

**Execution Plan:**
1. Add keyboard shortcuts guide (`Shift+?`)
2. Ensure all interactive elements are focusable
3. Add ARIA labels to all buttons/inputs
4. Skip-to-content link
5. Focus management in modals
6. Test with NVDA/VoiceOver

**Files to Modify:**
- All Vue components - Add ARIA attributes
- `src/composables/useKeyboardShortcuts.js` - Enhance existing
- `src/components/KeyboardShortcutsGuide.vue` - New component

---

## Summary Execution Timeline

**Week 1 (Quick Wins):**
- Idea #1: Activity Search - 3h
- Idea #2: Swipe to Delete - 3h
- Idea #3: PWA Shortcuts - 2h
- Idea #5: Undo Toast - 2h
- Idea #8: Prefetch Data - 1h
- Idea #11: Extended Stats - 2h
- **Total: 13 hours**

**Week 2 (Medium Priority):**
- Idea #6: Lazy Images - 2h
- Idea #7: Virtual Scroll - 4h
- Idea #10: Heatmap - 5h
- Idea #13: Vaccination Reminders - 5h
- Idea #15: Haptic Feedback - 1h
- **Total: 17 hours**

**Week 3 (Major Features):**
- Idea #9: Weight Chart - 6h
- Idea #12: PDF Export - 6h
- Idea #16: Voice Input - 7h
- **Total: 19 hours**

**Week 4 (Polish & Security):**
- Idea #4: Dark Mode Schedule - 5h
- Idea #14: Recurring Reminders - 6h
- Idea #17: Photo Gallery - 4h
- Idea #19: Audit Trail - 3h
- Idea #20: Accessibility - 5h
- **Total: 23 hours**

---

## Prioritization Recommendations

**Phase 1 (MVP+):** Ideas #1, #2, #3, #5, #8, #11  
**Phase 2 (Power User):** Ideas #9, #10, #12, #13  
**Phase 3 (Polish):** Ideas #4, #6, #7, #15, #17, #20  
**Phase 4 (Advanced):** Ideas #14, #16, #18, #19

---

**Total Estimated Implementation Time:** 72 hours (9 working days)  
**Last Updated:** April 1, 2026
