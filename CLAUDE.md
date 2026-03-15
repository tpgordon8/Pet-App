# Claude AI Assistant Context Documentation

> **Purpose:** This document provides complete context for Claude AI assistant sessions working on the Pet-App project. Read this file first to understand the project, workflow, and current state without asking the user basic questions.

---

## Project Overview

**Project Name:** Tailr - Pet Activity Logger
**Repository:** tpgordon8/Pet-App
**Current Branch:** `claude/pet-activity-logger-Etaqb`
**Working Directory:** `/home/user/Pet-App`

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

**Frontend:**
- Vue 3 (Composition API with `<script setup>`)
- Vite (build tool and dev server)
- Pinia (state management)
- Vue Router (client-side routing)
- TailwindCSS (utility-first CSS)
- date-fns (date formatting and manipulation)
- @vueuse/core (Vue composition utilities)
- jsPDF (PDF exports)

**Backend:**
- Firebase Realtime Database (real-time sync)
- Firebase Storage (photo attachments)
- Firebase project ID: `petlog-c4c1e` (kept unchanged for backwards compatibility; internal ID doesn't affect user experience)
- Database URL: `https://petlog-c4c1e-default-rtdb.firebaseio.com`

**Deployment:**
- Primary: Vercel (web app)
- Firebase Hosting configured as backup
- Auto-deploy on git push to main

**Development Tools:**
- ESLint (code linting)
- Prettier (code formatting)
- Vitest (unit testing)
- Playwright (e2e testing)

---

## gstack - Web Browsing Tool

**CRITICAL - Always use gstack for web browsing:**

- Use the `/browse` skill from gstack for **ALL** web browsing tasks
- **NEVER** use `mcp__claude-in-chrome__*` tools
- gstack provides fast, persistent headless Chromium for web interaction

**Available gstack skills:**
- `/browse` - Navigate, read, interact with web pages
- `/plan-ceo-review` - CEO-level plan review
- `/plan-eng-review` - Engineering plan review
- `/review` - Code/content review
- `/ship` - Shipping checklist
- `/retro` - Retrospective analysis

**Installation:**
- Global install: `~/.claude/skills/gstack`
- Project install: `.claude/skills/gstack` (committed to repo for teammates)

**Troubleshooting:**
If gstack skills aren't working, run: `cd .claude/skills/gstack && ./setup`
This rebuilds the browser binary and registers skills.

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

## Git Workflow & Requirements

### Branch Rules

**CRITICAL - Always work on:**
- Branch: `claude/pet-activity-logger-Etaqb`
- **NEVER** push to `main` or `master` without explicit permission
- **NEVER** create new branches without user approval
- Create branch locally if it doesn't exist yet

### Git Push Requirements

**CRITICAL - Push command format:**
```bash
git push -u origin claude/pet-activity-logger-Etaqb
```

**Branch naming convention:**
- Must start with `claude/`
- Must end with matching session ID (currently: `Etaqb`)
- Otherwise push will fail with 403 HTTP error

**Retry logic for network errors:**
- Retry up to 4 times with exponential backoff
- Wait times: 2s, 4s, 8s, 16s
- Only retry on network failures (not authorization failures)

### Git Fetch/Pull
```bash
# Prefer specific branch
git fetch origin claude/pet-activity-logger-Etaqb
git pull origin claude/pet-activity-logger-Etaqb

# Apply same retry logic (4 attempts with exponential backoff)
```

### Commit Message Format

```
<type>: <short description>

<detailed description if needed>

https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3
```

**Examples:**
- "Feature: Add activity logger with filtering"
- "Fix: Resolve timestamp formatting issue"
- "Update: Refine medical tracking UI"

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
│   │   └── ToastContainer.vue
│   ├── composables/        # Composition API composables
│   │   └── useToast.js
│   ├── firebase/           # Firebase configuration
│   │   └── config.js
│   └── assets/             # Static assets (CSS, images)
│       └── main.css        # Global styles + TailwindCSS
│
├── public/                 # Static files (served as-is)
│   └── favicon.ico
│
├── .github/                # GitHub workflows
│
└── Documentation:
    ├── README.md           # User-facing documentation
    ├── DEVLOG.md           # Detailed development history
    ├── ROADMAP.md          # Feature roadmap and priorities
    ├── CLAUDE.md           # THIS FILE - AI assistant context
    ├── DEPLOYMENT.md       # Deployment instructions
    └── FIREBASE_SECURITY.md # Security rules documentation
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

5. **No pet edit/delete** functionality yet
   - Users can add pets but not modify/remove them

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

### Pets (examples from usage)
- Managed via pet profiles in the app
- Each has name, species, and emoji icon

---

## Code Patterns & Conventions

### Vue 3 Component Style
- Composition API with `<script setup>` syntax
- Single File Components (.vue files)
- Reactive state with `ref()` and `reactive()`
- Computed values with `computed()`
- Lifecycle hooks: `onMounted()`, `onUnmounted()`, `watch()`
- Props validation with `defineProps()`
- Events with `defineEmits()`

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
    // ...
  }

  return { activities, sortedActivities, logActivity }
})

// Use in a component
import { useActivitiesStore } from '@/stores/activities'
const activitiesStore = useActivitiesStore()
```

### CSS/TailwindCSS Conventions
- TailwindCSS utility classes for most styling
- Custom CSS in `<style scoped>` for component-specific styles
- TailwindCSS theme customization in `tailwind.config.js`
- Mobile-first responsive design with Tailwind breakpoints (sm:, md:, lg:)
- Dark mode with `dark:` variant classes
- Custom color palette: sage (primary), gray (neutrals)

### Firebase Patterns (in Pinia Stores)
```javascript
import { ref as dbRef, push, onValue, update, remove } from 'firebase/database'
import { database } from '@/firebase/config'

// Listen to data
const activitiesRef = dbRef(database, `households/${householdId}/activities`)
const listener = onValue(activitiesRef, (snapshot) => {
  const data = snapshot.val()
  // Handle data
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

### State Management (Pinia Stores)
**activitiesStore:**
- `activities` - Array of all activities (synced from Firebase)
- `sortedActivities` - Computed sorted activities
- `todayActivities` - Computed today's activities
- `stats` - Computed activity stats for today
- `logActivity()` - Log a new activity
- `updateActivity()` - Edit an existing activity
- `deleteActivity()` - Remove an activity

**petsStore:**
- `pets` - Array of all pets (synced from Firebase)
- `selectedPetId` - Currently selected pet ID (persisted to localStorage)
- `selectedPet` - Computed currently selected pet object
- `addPet()` - Add a new pet
- `updatePet()` - Edit pet details
- `deletePet()` - Remove a pet

**householdStore:**
- `householdId` - Current household ID
- `memberName` - Current user's name
- `currentMember` - Currently active member
- `members` - Array of household members

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

## Common Tasks & Patterns

### Adding a New Regular Activity Type

1. **Add button in DashboardView.vue** (in Quick Log section)
```vue
<ActivityButton
  emoji="🆕"
  label="New Type"
  :count="activitiesStore.stats.newType"
  @click="showActivityNotes('New Type', '🆕')"
  :disabled="activitiesStore.loading"
/>
```

2. **Update stats calculation** in `src/stores/activities.js`
```javascript
const stats = computed(() => {
  const today = todayActivities.value
  return {
    // ... existing stats
    newType: today.filter(a => a.type === 'New Type').length,
    total: today.length
  }
})
```

3. **Add to edit modal dropdown** in `src/components/EditActivityModal.vue`
```vue
<option value="New Type">🆕 New Type</option>
```

4. **Update emoji map** in `src/components/EditActivityModal.vue`
```javascript
const emojiMap = {
  // ... existing mappings
  'New Type': '🆕'
}
```

### Adding a New Medical Activity Type

1. **Create form in MedicalModal.vue** (add new conditional section)
2. **Add button in DashboardView.vue** (in Medical Tracking section)
3. **Update stats in activities store** (add new computed stat)
4. **Handle new medical data structure** in `logActivity()` method

### Creating a New Vue Component

1. **Create file** in `src/components/ComponentName.vue`
```vue
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

2. **Import in parent component**
```javascript
import ComponentName from '@/components/ComponentName.vue'
```

3. **Use in template**
```vue
<ComponentName :prop="value" @event-name="handler" />
```

### Adding a New Pinia Store

1. **Create store file** in `src/stores/storeName.js`
```javascript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useStoreNameStore = defineStore('storeName', () => {
  const state = ref([])

  const computed = computed(() => {
    // Computed value
  })

  async function action() {
    // Action logic
  }

  return { state, computed, action }
})
```

2. **Use in component**
```javascript
import { useStoreNameStore } from '@/stores/storeName'
const storeNameStore = useStoreNameStore()
```

### Modifying Database Schema

**CAUTION:** Changes affect all users and require migration strategy

1. Add new fields with optional/default values
2. Update write operations to include new fields
3. Update read operations to handle missing fields (backwards compatibility)
4. Document changes in DEVLOG.md

---

## Deployment Process

### Vercel (Primary)
1. Push to branch: `claude/pet-activity-logger-Etaqb`
2. Vercel auto-builds and deploys
3. Preview URL provided in git commit status

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
- ✅ Activity notes field (implemented for all activities)
- ✅ Photo attachments (implemented with Firebase Storage)
- ✅ Edit activity functionality (implemented for regular activities)
- ✅ Medical tracking (Vet Visit, Vaccination, Weight Check)
- ✅ Pet edit/delete functionality (implemented in stores)

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

**Future Considerations:**
- Mobile app (React Native or SwiftUI)
- Integration with wearables
- Multi-household support
- Shared access with vets

---

## Quick Reference Commands

### Git Operations
```bash
# Check current branch
git branch --show-current

# Create and switch to feature branch (if needed)
git checkout -b claude/pet-activity-logger-Etaqb

# Stage changes
git add <files>

# Commit with message
git commit -m "Type: Description"

# Push to remote (with retry logic for network errors)
git push -u origin claude/pet-activity-logger-Etaqb

# Check status
git status

# View recent commits
git log --oneline -10
```

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

## Important Notes for Claude

### What NOT to Do
- ❌ Never push to `main` or `master` branch
- ❌ Never create new branches without user approval
- ❌ Never use wrong branch naming format (must be `claude/<name>-Etaqb`)
- ❌ Never make destructive changes without user confirmation
- ❌ Never break backwards compatibility with existing data
- ❌ Never modify Firebase database schema without careful consideration
- ❌ Never add heavy dependencies without justification

### What TO Do
- ✅ Always check current branch first
- ✅ Always read relevant component/store files before making changes
- ✅ Always test changes with `npm run dev` when possible
- ✅ Always follow Vue 3 Composition API patterns with `<script setup>`
- ✅ Always use Pinia stores for state management (not local component state for shared data)
- ✅ Always preserve existing functionality
- ✅ Always commit with descriptive messages
- ✅ Always use retry logic for git push (network failures)
- ✅ Always use TailwindCSS utility classes for styling when possible
- ✅ Always emit events from child components instead of mutating props

### When to Ask User
- Before implementing complex authentication systems
- Before changing Firebase database schema significantly
- Before adding external dependencies/libraries (especially large ones)
- Before creating new routes or major UI restructuring
- Before implementing features not discussed or in ROADMAP.md
- Before making destructive git operations
- Before refactoring large portions of the codebase

---

## Session Context

**Current Session ID:** Etaqb (must match branch suffix)
**Branch:** `claude/pet-activity-logger-Etaqb`
**Claude Session URL:** https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3

**Session Instructions:**
1. Read this file (CLAUDE.md) first for full context
2. Check current git branch
3. Read relevant documentation (DEVLOG.md, ROADMAP.md, README.md)
4. Read relevant component/store files before making changes
5. Make changes, test with `npm run dev`, commit, push to correct branch

---

**Last Updated:** 2026-03-15
**Document Version:** 2.0 (Vue 3 Migration)
**Maintained By:** Claude AI Assistant

---

## Appendix: File Descriptions

| File/Directory | Purpose | Modify? |
|----------------|---------|---------|
| index.html | HTML entry point (loads Vue app) | ⚠️ Rarely - only for meta tags |
| src/main.js | Vue app initialization | ⚠️ Only when adding global plugins |
| src/App.vue | Root Vue component | ⚠️ Only for app-wide changes |
| src/router/ | Vue Router config | ⚠️ Only when adding routes |
| src/stores/ | Pinia stores | ✅ YES - modify for state logic |
| src/views/ | Page components | ✅ YES - modify for page layouts |
| src/components/ | Reusable components | ✅ YES - modify for UI features |
| src/composables/ | Composition utilities | ✅ YES - add reusable logic |
| src/firebase/config.js | Firebase initialization | ⚠️ Only for config changes |
| src/assets/main.css | Global CSS + Tailwind | ⚠️ Only for global styles |
| package.json | Dependencies | ⚠️ Only if adding npm packages |
| vite.config.js | Vite build config | ⚠️ Only for build settings |
| tailwind.config.js | TailwindCSS config | ⚠️ Only for theme customization |
| manifest.json | PWA manifest | ⚠️ Only for PWA config changes |
| firebase.json | Firebase config | ⚠️ Only for deployment changes |
| firebase-rules.json | Database security | ⚠️ Only for security rules |
| vercel.json | Vercel config | ⚠️ Only for deployment settings |
| README.md | User documentation | ✅ YES - keep updated with features |
| DEVLOG.md | Development history | ✅ YES - log all changes |
| ROADMAP.md | Feature planning | ✅ YES - update as features complete |
| CLAUDE.md | This file | ✅ YES - keep context current |

---

**End of Context Documentation**
