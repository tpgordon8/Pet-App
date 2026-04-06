# Tailr Pet Activity Logger - AI Assistant Context

> **Purpose:** This document provides complete context for AI assistants working on the Pet-App project. Read this first to understand the project, architecture, workflow, and current state.

---

## Project Overview

**Project Name:** Tailr - Pet Activity Logger  
**Repository:** tpgordon8/Pet-App  
**Current Branch:** `claude/pet-activity-logger-Etaqb`  
**Working Directory:** `/home/user/Pet-App`  
**Live URL:** Deployed on Vercel (check `vercel.json` for deployment config)

### What is Tailr?

Tailr is a modern web-based pet activity tracking application with real-time sync across devices. It allows pet parents (primarily Tara and Meag) to track daily activities (poop, pee, food, sleep, meds) and medical records (vet visits, vaccinations, weight) for multiple pets.

**Key Characteristics:**
- Modern Vue 3 web application with Composition API
- Vite for fast development and optimized builds
- Firebase Realtime Database for real-time sync
- Pinia for state management
- TailwindCSS for styling
- PWA-ready (Progressive Web App)
- Deployed on Vercel
- Mobile-first design with iOS-style interactions

---

## Technology Stack

### Frontend
- **Vue 3** (Composition API with `<script setup>`)
- **Vite** (build tool and dev server)
- **Pinia** (state management)
- **Vue Router** (client-side routing)
- **TailwindCSS** (utility-first CSS)
- **date-fns** (date formatting and manipulation)
- **@vueuse/core** (Vue composition utilities)
- **jsPDF** (PDF exports)

### Backend
- **Firebase Realtime Database** (real-time sync)
- **Firebase Storage** (photo attachments)
- **Firebase project ID:** `petlog-c4c1e` (kept unchanged for backwards compatibility)
- **Database URL:** `https://petlog-c4c1e-default-rtdb.firebaseio.com`

### Deployment
- **Primary:** Vercel (web app)
- **Firebase Hosting** configured as backup
- **Auto-deploy** on git push via GitHub Actions

### Development Tools
- **ESLint** (code linting)
- **Prettier** (code formatting)
- **Vitest** (unit testing)
- **Playwright** (e2e testing)

---

## Database Schema

```javascript
/pets/{petId}
  - name: string (e.g., "Luna")
  - species: string (e.g., "Dog")
  - emoji: string (e.g., "🐕")
  - createdAt: timestamp

/activities/{activityId}
  - type: "Poop" | "Pee" | "Food" | "Sleep" | "Meds" | "Vet Visit" | "Vaccination" | "Weight Check"
  - emoji: string (e.g., "💩", "🏥")
  - timestamp: Unix timestamp
  - user: "Tara" | "Meag"
  - petId: string (references /pets/{petId})
  - notes: string (optional, for regular activities)
  - medicalData: object (optional, for medical activities)
    // For Vet Visit:
    - notes: string
    - cost: number
    // For Vaccination:
    - vaccineName: string
    - notes: string
    // For Weight Check:
    - weight: number
    - unit: "lbs" | "kg"
    - notes: string
```

---

## Project Structure

```
Pet-App/
├── index.html              # Entry point (loads Vue app)
├── package.json            # Dependencies and scripts
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # TailwindCSS configuration
├── manifest.json           # PWA manifest
├── firebase.json           # Firebase configuration
├── firebase-rules.json     # Database security rules
├── vercel.json             # Vercel deployment config
│
├── src/                    # Vue 3 application source
│   ├── main.js             # App entry point
│   ├── App.vue             # Root component
│   ├── router/             # Vue Router configuration
│   │   └── index.js
│   ├── stores/             # Pinia stores (state management)
│   │   ├── activities.js   # Activity tracking state
│   │   ├── pets.js         # Pet management state
│   │   └── household.js    # User/household state
│   ├── views/              # Page components
│   │   ├── OnboardingView.vue    # Initial setup flow
│   │   ├── HomeView.vue          # Home/landing page
│   │   └── DashboardView.vue     # Main app dashboard
│   ├── components/         # Reusable Vue components
│   │   ├── ActivityButton.vue
│   │   ├── ActivityFeed.vue
│   │   ├── ActivityNotesModal.vue
│   │   ├── MedicalModal.vue
│   │   ├── EditActivityModal.vue
│   │   ├── AddPetModal.vue
│   │   ├── PetSelector.vue
│   │   ├── MemberSelector.vue
│   │   ├── StatsWidget.vue
│   │   ├── EmojiPicker.vue
│   │   ├── OfflineIndicator.vue
│   │   ├── PwaUpdatePrompt.vue
│   │   └── ToastContainer.vue
│   ├── composables/        # Composition API composables
│   │   ├── useToast.js
│   │   ├── usePagination.js
│   │   ├── useRequestDeduplication.js
│   │   ├── useKeyboardShortcuts.js
│   │   ├── useOptimistic.js
│   │   └── useStorage.js
│   ├── utils/              # Utility functions
│   │   ├── passwordHash.js
│   │   ├── sanitize.js
│   │   └── imageCompression.js
│   ├── firebase/           # Firebase configuration
│   │   └── config.js
│   └── assets/             # Static assets (CSS, images)
│       └── main.css        # Global styles + TailwindCSS
│
├── public/                 # Static files (served as-is)
│   └── favicon.ico
│
├── .github/                # GitHub workflows
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
│
└── Documentation:
    ├── README.md           # User-facing documentation
    ├── DEVLOG.md           # Detailed development history
    ├── ROADMAP.md          # Feature roadmap and priorities
    ├── CLAUDE.md           # Claude-specific context
    ├── DEPLOYMENT.md       # Deployment instructions
    └── FIREBASE_SECURITY.md # Security rules documentation
```

---

## Code Patterns & Conventions

### Vue 3 Component Style

**Always use Composition API with `<script setup>` syntax:**

```vue
<template>
  <div class="component-name">
    <!-- Your markup -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  propName: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['event-name'])

// Reactive state
const state = ref(initialValue)

// Computed values
const computedValue = computed(() => {
  return state.value * 2
})

// Lifecycle hooks
onMounted(() => {
  // Initialization logic
})

// Methods
function handleAction() {
  emit('event-name', data)
}
</script>

<style scoped>
/* Component-specific styles */
.component-name {
  /* Use TailwindCSS utilities when possible */
}
</style>
```

**Key Principles:**
- Single File Components (.vue files)
- Reactive state with `ref()` and `reactive()`
- Computed values with `computed()`
- Lifecycle hooks: `onMounted()`, `onUnmounted()`, `watch()`
- Props validation with `defineProps()`
- Events with `defineEmits()`
- **Never mutate props** - always emit events to parent

### Pinia Store Patterns

```javascript
// Define a store (src/stores/activities.js)
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useActivitiesStore = defineStore('activities', () => {
  // State
  const activities = ref([])

  // Computed
  const sortedActivities = computed(() => {
    return [...activities.value].sort((a, b) => b.timestamp - a.timestamp)
  })

  // Actions
  async function logActivity(type, emoji) {
    // Action logic with Firebase
  }

  return { activities, sortedActivities, logActivity }
})
```

**Usage in components:**
```javascript
import { useActivitiesStore } from '@/stores/activities'

const activitiesStore = useActivitiesStore()
// Access: activitiesStore.activities
// Call: activitiesStore.logActivity('Poop', '💩')
```

### Firebase Patterns (in Pinia Stores)

```javascript
import { ref as dbRef, push, onValue, update, remove } from 'firebase/database'
import { database } from '@/firebase/config'

// Listen to data (real-time sync)
const activitiesRef = dbRef(database, `households/${householdId}/activities`)
const listener = onValue(activitiesRef, (snapshot) => {
  const data = snapshot.val()
  // Update local state
})

// Write data
await push(activitiesRef, {
  type: 'Poop',
  timestamp: Date.now(),
  petId: selectedPetId,
  user: currentMember
})

// Update data
const activityRef = dbRef(database, `households/${householdId}/activities/${activityId}`)
await update(activityRef, { type: 'Walk', notes: 'Updated' })

// Delete data
await remove(activityRef)
```

### CSS/TailwindCSS Conventions

- **TailwindCSS utility classes** for most styling
- **Custom CSS** in `<style scoped>` only when necessary
- **Mobile-first responsive design** with Tailwind breakpoints (sm:, md:, lg:)
- **Dark mode** with `dark:` variant classes
- **Custom color palette:** sage (primary), gray (neutrals)

**Example:**
```vue
<template>
  <button class="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 dark:bg-sage-500">
    Click Me
  </button>
</template>
```

### State Management (Pinia Stores)

**activitiesStore (`src/stores/activities.js`):**
- `activities` - Array of all activities (synced from Firebase)
- `sortedActivities` - Computed sorted activities
- `todayActivities` - Computed today's activities
- `stats` - Computed activity stats for today
- `logActivity()` - Log a new activity
- `updateActivity()` - Edit an existing activity
- `deleteActivity()` - Remove an activity

**petsStore (`src/stores/pets.js`):**
- `pets` - Array of all pets (synced from Firebase)
- `selectedPetId` - Currently selected pet ID (persisted to localStorage)
- `selectedPet` - Computed currently selected pet object
- `addPet()` - Add a new pet
- `updatePet()` - Edit pet details
- `deletePet()` - Remove a pet

**householdStore (`src/stores/household.js`):**
- `householdId` - Current household ID
- `memberName` - Current user's name
- `currentMember` - Currently active member
- `members` - Array of household members

---

## Security Utilities (March 2026)

### Password Hashing (`src/utils/passwordHash.js`)

```javascript
import { hashPassword, verifyPassword, isBcryptHash } from '@/utils/passwordHash'

// Hash a password (10 salt rounds, ~100ms)
const hash = await hashPassword('mypassword')

// Verify password against hash
const isValid = await verifyPassword('mypassword', hash)

// Check if string is already hashed
if (isBcryptHash(storedValue)) {
  // Already hashed
}

// Migrate plain text to hash (gradual migration)
const migratedHash = await migrateToHash(plainOrHashedPassword)
```

### Input Sanitization (`src/utils/sanitize.js`)

```javascript
import { 
  sanitizeActivityNotes,
  sanitizePetName,
  sanitizeHouseholdName,
  sanitizeSearchQuery,
  sanitizeUrl
} from '@/utils/sanitize'

// Sanitize activity notes (max 500 chars, no HTML)
const clean = sanitizeActivityNotes(userInput)

// Sanitize pet name (max 50 chars, no HTML)
const cleanName = sanitizePetName(input)

// Validate and sanitize URL (only http/https/mailto)
const safeUrl = sanitizeUrl(url) // Returns null if invalid
```

**Best Practices:**
- **Always sanitize user input** before storing or displaying
- **Hash all passwords** using bcryptjs (never store plain text)
- **Validate URLs** before opening or redirecting
- **Use specialized sanitizers** for different input types

---

## Performance Utilities (March 2026)

### Image Compression (`src/utils/imageCompression.js`)

```javascript
import { 
  compressImage,
  processImage,
  validateImage,
  needsCompression 
} from '@/utils/imageCompression'

// Compress image before upload
const compressed = await compressImage(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  initialQuality: 0.8
})

// Validate then compress if needed (one-step)
const processed = await processImage(file)

// Check if compression needed
if (needsCompression(file, 1)) {
  // File larger than 1MB
}
```

### Pagination (`src/composables/usePagination.js`)

```javascript
import { usePagination } from '@/composables/usePagination'

const { 
  paginatedItems,
  hasMore,
  remainingCount,
  loadMore,
  reset 
} = usePagination(allItems, {
  initialPageSize: 50,
  loadMoreSize: 25
})

// In template
// <div v-for="item in paginatedItems" :key="item.id">{{ item }}</div>
// <button v-if="hasMore" @click="loadMore">Load More ({{ remainingCount }})</button>
```

### Request Deduplication (`src/composables/useRequestDeduplication.js`)

```javascript
import { useRequestDeduplication } from '@/composables/useRequestDeduplication'

const { dedupe, invalidate, clearCache } = useRequestDeduplication({
  cacheTime: 60000, // 60 seconds
  maxCacheSize: 100
})

// Multiple calls with same key = only 1 actual request
const data = await dedupe('activities', async () => {
  return await fetchFromFirebase()
})

// Invalidate specific cache entry
invalidate('activities')
```

---

## UX Composables (March 2026)

### Keyboard Shortcuts (`src/composables/useKeyboardShortcuts.js`)

```javascript
import { useGlobalKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

// In main component (e.g., DashboardView)
useGlobalKeyboardShortcuts()

// Available shortcuts:
// Ctrl+K - Focus search
// Escape - Close modal / Clear search
// Ctrl+N - New activity (future)
```

### Optimistic Updates (`src/composables/useOptimistic.js`)

```javascript
import { useOptimisticList } from '@/composables/useOptimistic'

const { list, optimisticAdd, optimisticRemove } = useOptimisticList()

// Add item - appears immediately, syncs in background
await optimisticAdd(
  { type: 'Poop', emoji: '💩' },
  async (item) => await addToFirebase(item)
)

// If Firebase fails, changes automatically roll back
```

### Safe Storage (`src/composables/useStorage.js`)

```javascript
import { 
  getStorageItem,
  setStorageItem,
  getStorageJSON,
  setStorageJSON 
} from '@/composables/useStorage'

// Get with fallback
const value = getStorageItem('key', 'default')

// Set with error handling (handles QuotaExceededError)
setStorageItem('key', 'value')

// JSON helpers
const obj = getStorageJSON('settings', { theme: 'light' })
setStorageJSON('settings', { theme: 'dark' })
```

---

## Key Components

### OfflineIndicator.vue
- Auto-detects online/offline status
- Slide-down banner at top of screen
- Pulsing icon animation
- ARIA live region for accessibility
- Auto-dismisses when back online

### PwaUpdatePrompt.vue
- Detects new service worker updates
- Beautiful slide-up prompt from bottom
- "Update Now" or "Later" buttons
- Periodic update checks (60s)
- Snooze for 1 hour if dismissed

**Usage:**
```vue
<!-- In App.vue -->
<template>
  <div id="app">
    <OfflineIndicator />
    <PwaUpdatePrompt />
    <RouterView />
  </div>
</template>
```

---

## Development History

### Completed Features (Vue 3 Application)

**Architecture Migration (March 2026)**
- Migrated from vanilla JavaScript to Vue 3 + Vite
- Implemented Pinia for state management
- Added Vue Router for client-side routing
- Integrated TailwindCSS for utility-first styling
- Modular component architecture with SFC (Single File Components)

**Core Features**
- Multi-pet tracking with custom emoji and species
- Pet selector (All Pets vs individual pet filtering)
- Household member management (multiple users per household)
- Real-time Firebase sync across devices
- Offline queue with automatic sync when online
- Photo attachments with Firebase Storage
- Activity notes (optional, 200 char limit)
- Dark mode support (auto-detect + manual toggle)
- PWA support with offline capabilities

**Daily Activity Tracking**
- Poop, Pee, Food, Sleep, Meds, Walk
- Quick-log buttons with today's count
- Activity feed with date grouping
- Edit functionality (type, timestamp, notes)
- Delete with confirmation
- Inline notes and photo display

**Medical Tracking (Newly Implemented)**
- Vet Visit logging (notes, cost)
- Vaccination logging (vaccine name, notes)
- Weight Check logging (weight, unit, notes)
- Medical data displays inline in activity feed
- Separate "Medical Tracking" section in UI
- Medical activities cannot be edited (intentional - delete and re-add instead)

### Known Limitations

1. **Old activities** (before multi-pet feature) don't have petId
   - They display in "All Pets" view but not pet-specific views
   - This is expected behavior, not a bug

2. **Medical activities** can't be edited
   - Intentional simplification
   - Users must delete and re-add to correct

3. **No vaccination reminders** yet
   - Web Notifications API complexity deferred

4. **No weight trend charts** yet
   - Would require charting library
   - Currently shows list view only

---

## User Context

### Primary Users
- **Tara** - Pet parent (user 1)
- **Meag** - Pet parent (user 2)

### Use Case
- Track daily activities for multiple pets
- Coordinate pet care between two caregivers
- Monitor medical history and health trends
- No authentication complexity needed (household trust model)

---

## Common Tasks & Patterns

### Adding a New Regular Activity Type

1. **Add button in DashboardView.vue** (Quick Log section)
```vue
<ActivityButton
  emoji="🆕"
  label="New Type"
  :count="activitiesStore.stats.newType"
  @click="showActivityNotes('New Type', '🆕')"
  :disabled="activitiesStore.loading"
/>
```

2. **Update stats** in `src/stores/activities.js`
```javascript
const stats = computed(() => {
  const today = todayActivities.value
  return {
    // ... existing stats
    newType: today.filter(a => a.type === 'New Type').length
  }
})
```

3. **Add to edit modal dropdown** in `src/components/EditActivityModal.vue`

### Creating a New Vue Component

```vue
<!-- src/components/ComponentName.vue -->
<template>
  <div class="component-name">
    <!-- Your markup -->
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  // Define props
})

const emit = defineEmits(['event-name'])

// Component logic
</script>

<style scoped>
/* Component-specific styles */
</style>
```

### Adding a New Pinia Store

```javascript
// src/stores/storeName.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStoreNameStore = defineStore('storeName', () => {
  const state = ref([])

  const computedValue = computed(() => {
    // Computed value
  })

  async function action() {
    // Action logic
  }

  return { state, computedValue, action }
})
```

---

## Git Workflow

### Branch Rules

**Current working branch:** `claude/pet-activity-logger-Etaqb`

- Always develop on feature branches
- Never push to `main` without explicit permission
- Create descriptive branch names

### Commit Message Format

```
<type>: <short description>

<detailed description if needed>

https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3
```

**Examples:**
- `Feature: Add activity logger with filtering`
- `Fix: Resolve timestamp formatting issue`
- `Update: Refine medical tracking UI`

---

## Deployment Process

### GitHub Actions CI/CD (Primary)

1. Push to branch
2. GitHub Actions workflow automatically:
   - Runs ESLint (code quality check)
   - Runs unit tests (catches bugs)
   - Builds application (catches compilation errors)
   - Deploys to Vercel (only if all checks pass)
3. Deployment status visible in GitHub Actions tab
4. Preview URL provided after successful deployment

**Workflow file:** `.github/workflows/deploy.yml`

**Required GitHub Secrets:** 12 total
- 9 Firebase environment variables
- 3 Vercel credentials (TOKEN, ORG_ID, PROJECT_ID)

### Firebase Hosting (Backup)

```bash
# Deploy hosting only
npm run deploy:hosting

# Deploy database rules only
npm run deploy:rules

# Deploy everything
npm run deploy:all
```

---

## Future Roadmap Priorities

See ROADMAP.md for full details. Key priorities:

**✅ Recently Completed:**
- ✅ Activity notes field
- ✅ Photo attachments
- ✅ Edit activity functionality
- ✅ Medical tracking (Vet Visit, Vaccination, Weight Check)

**High Impact - TODO:**
- Activity search/filter by keyword
- CSV export with all filters
- PDF reports for vet visits
- Weight trend chart visualization

**Medium Impact - TODO:**
- Vaccination due date reminders
- Activity pattern insights
- Bulk operations (delete multiple activities)
- Data export/import for backup

---

## Quick Reference Commands

### Development

```bash
# Install dependencies
npm install

# Start Vite dev server (with hot module replacement)
npm run dev
# Opens at http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test:unit

# Run linter
npm run lint
```

### Git Operations

```bash
# Check current branch
git branch --show-current

# Create and switch to feature branch
git checkout -b feature/branch-name

# Stage changes
git add <files>

# Commit with message
git commit -m "Type: Description"

# Push to remote
git push -u origin <branch-name>

# Check status
git status

# View recent commits
git log --oneline -10
```

### Firebase

```bash
# Login to Firebase
firebase login

# Deploy rules
npm run deploy:rules

# Deploy hosting
npm run deploy:hosting
```

---

## Testing Checklist

When making changes, verify:

- [ ] Desktop browser functionality
- [ ] Mobile browser (iOS Safari) functionality
- [ ] Real-time sync across two browser tabs
- [ ] Offline support (if applicable)
- [ ] All activity logging buttons work
- [ ] Stats widget updates correctly
- [ ] Toast notifications appear
- [ ] Activity log displays with correct filters
- [ ] Pet switching works correctly
- [ ] User switching works correctly
- [ ] Dark mode toggle works (if applicable)
- [ ] Edit/delete actions work
- [ ] Medical tracking works

---

## Important Guidelines

### What NOT to Do

- ❌ Never push to `main` branch without permission
- ❌ Never break backwards compatibility with existing data
- ❌ Never modify Firebase database schema without careful consideration
- ❌ Never add heavy dependencies without justification
- ❌ Never mutate props in child components
- ❌ Never bypass input sanitization
- ❌ Never store passwords in plain text

### What TO Do

- ✅ Always check current branch first
- ✅ Always read relevant component/store files before making changes
- ✅ Always test changes with `npm run dev` when possible
- ✅ Always follow Vue 3 Composition API patterns with `<script setup>`
- ✅ Always use Pinia stores for state management
- ✅ Always preserve existing functionality
- ✅ Always commit with descriptive messages
- ✅ Always use TailwindCSS utility classes for styling
- ✅ Always emit events from child components instead of mutating props
- ✅ Always sanitize user input before storing

### When to Ask User

- Before implementing complex authentication systems
- Before changing Firebase database schema significantly
- Before adding external dependencies/libraries (especially large ones)
- Before creating new routes or major UI restructuring
- Before implementing features not discussed or in ROADMAP.md
- Before making destructive git operations
- Before refactoring large portions of the codebase

---

## Contact & Resources

**Firebase Console:**  
https://console.firebase.google.com/project/petlog-c4c1e

**Database URL:**  
https://petlog-c4c1e-default-rtdb.firebaseio.com

**Repository:**  
tpgordon8/Pet-App

**Primary Directories:**
- `/home/user/Pet-App/src/` - Vue 3 application source
- `/home/user/Pet-App/src/stores/` - Pinia state management
- `/home/user/Pet-App/src/components/` - Vue components

---

## File Modification Guide

| File/Directory | Purpose | Modify? |
|----------------|---------|---------|
| index.html | HTML entry point | ⚠️ Rarely |
| src/main.js | Vue app initialization | ⚠️ Only for global plugins |
| src/App.vue | Root Vue component | ⚠️ Only for app-wide changes |
| src/router/ | Vue Router config | ⚠️ Only when adding routes |
| src/stores/ | Pinia stores | ✅ YES - state logic |
| src/views/ | Page components | ✅ YES - page layouts |
| src/components/ | Reusable components | ✅ YES - UI features |
| src/composables/ | Composition utilities | ✅ YES - reusable logic |
| src/utils/ | Utility functions | ✅ YES - helper functions |
| src/firebase/config.js | Firebase init | ⚠️ Only for config |
| src/assets/main.css | Global CSS | ⚠️ Only for global styles |
| package.json | Dependencies | ⚠️ Only if adding packages |
| tailwind.config.js | TailwindCSS config | ⚠️ Only for theme |
| firebase-rules.json | Database security | ⚠️ Only for security rules |
| README.md | User docs | ✅ YES - keep updated |
| DEVLOG.md | Development history | ✅ YES - log changes |
| ROADMAP.md | Feature planning | ✅ YES - update features |

---

**Last Updated:** 2026-04-06  
**Document Version:** 1.0  
**Maintained By:** AI Assistant Context

---

## Getting Started

1. **Read this document** to understand the project
2. **Check current git branch** (`git branch --show-current`)
3. **Read relevant documentation** (DEVLOG.md, ROADMAP.md, README.md)
4. **Read relevant files** before making changes
5. **Make changes, test, commit, push** following the workflow above

---

**End of Context Documentation**
