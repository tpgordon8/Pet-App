# Claude AI Assistant Context Documentation

> **Purpose:** This document provides complete context for Claude AI assistant sessions working on the Pet-App project. Read this file first to understand the project, workflow, and current state without asking the user basic questions.

---

## Project Overview

**Project Name:** PetLog - Pet Activity Logger
**Repository:** tpgordon8/Pet-App
**Current Branch:** `claude/pet-activity-logger-Etaqb`
**Working Directory:** `/home/user/Pet-App`

### What is PetLog?

PetLog is a modern web-based pet activity tracking application with real-time sync across devices. It allows pet parents (primarily Tara and Meag) to track daily activities (poop, pee, food, sleep, meds) and medical records (vet visits, vaccinations, weight) for multiple pets.

**Key Characteristics:**
- Single-file web application (index.html contains HTML + CSS + JavaScript)
- Zero build step - deploy by pushing to git
- Firebase Realtime Database for real-time sync
- PWA-ready (Progressive Web App)
- Deployed on Vercel
- Mobile-first design with iOS-style interactions

---

## Technology Stack

**Frontend:**
- Vanilla JavaScript (no framework)
- HTML5 + CSS3
- Custom SVG icons
- jsPDF for PDF exports

**Backend:**
- Firebase Realtime Database (real-time sync)
- Firebase Storage (future for photos)
- Firebase project ID: `petlog-c4c1e`
- Database URL: `https://petlog-c4c1e-default-rtdb.firebaseio.com`

**Deployment:**
- Primary: Vercel (web app)
- Firebase Hosting configured as backup
- Auto-deploy on git push to main

**Future:**
- React Native components exist in `/components` and `/contexts` for potential iOS app
- App.js contains React Native foundation (not currently used)

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
├── index.html              # MAIN WEB APP (all HTML/CSS/JS)
├── App.js                  # React Native foundation (future iOS app)
├── package.json            # Dependencies
├── manifest.json           # PWA manifest
├── firebase.json           # Firebase configuration
├── firebase-rules.json     # Database security rules
├── vercel.json             # Vercel deployment config
│
├── components/             # React Native components (not used in web app)
│   ├── layout/
│   └── pet/
│
├── contexts/               # React contexts (not used in web app)
│   ├── ThemeContext.js
│   └── PetContext.js
│
├── utils/                  # Utility functions (not used in web app)
│
├── hooks/                  # Custom React hooks
│   ├── useActivities.js
│   └── useActivityForm.js
│
├── assets/                 # Images and icons
│
├── .github/                # GitHub workflows
│
└── Documentation:
    ├── README.md           # User-facing documentation
    ├── DEVLOG.md           # Detailed development history
    ├── ROADMAP.md          # Feature roadmap and priorities
    ├── CLAUDE.md           # THIS FILE - AI assistant context
    ├── DEPLOYMENT.md       # Deployment instructions
    ├── FIREBASE_SECURITY.md # Security rules documentation
    └── FUTURE_IOS_MIGRATION.md # iOS app migration plan
```

---

## Development History

### Completed Features (All in index.html)

**CHUNK 1: Design Refresh (March 2026)**
- Clean minimalist UI with glassmorphism effects
- Dark mode support (auto-detect + manual toggle)
- CSS variables for theming
- Elegant sage green accent color palette
- Georgia serif typography for refined look

**CHUNK 2: Multi-Pet Support**
- Pet profiles with custom emoji
- Pet selector (All Pets vs individual pet)
- Activities tagged with petId
- Pet-specific statistics
- Add pet modal with emoji picker

**CHUNK 3: User Authentication**
- Simple username selection (Tara vs Meag)
- No password required (household trust model)
- Activities tagged with username
- User selection persists via localStorage
- Visual feedback for active user

**CHUNK 4: Activity Management**
- Edit activity (type, timestamp, notes)
- Delete with confirmation
- Undo delete (5-second window)
- iOS-style swipe gestures
- Action buttons on hover

**CHUNK 5: Medical Tracking**
- Vet Visit logging (notes, cost)
- Vaccination logging (name, date, notes)
- Weight Check logging (value, unit, notes)
- Medical data displays inline in activity feed
- Separate "Medical" section in UI

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

### JavaScript Style
- Vanilla JavaScript (ES6+)
- Global functions (no modules due to single-file architecture)
- Firebase SDK loaded via CDN
- LocalStorage for client-side persistence
- Real-time Firebase listeners for data sync

### CSS Conventions
- CSS variables for theming (--primary-color, --bg-color, etc.)
- Mobile-first responsive design
- 44px minimum touch targets (Apple HIG)
- Glassmorphism: `backdrop-filter: blur(20px)` with transparency
- Transitions: 0.3s ease for theme changes, 0.2s for interactions

### Firebase Patterns
```javascript
// Listen to data
firebase.database().ref('activities').on('value', (snapshot) => {
  // Handle data
});

// Write data
firebase.database().ref('activities').push({
  type: 'Poop',
  timestamp: Date.now(),
  petId: currentPetId,
  user: currentUser
});

// Update data
firebase.database().ref(`activities/${activityId}`).update({
  type: newType,
  timestamp: newTimestamp
});

// Delete data
firebase.database().ref(`activities/${activityId}`).remove();
```

### State Management
- `currentPetId` - Currently selected pet (stored in localStorage)
- `currentUser` - Currently selected user (Tara or Meag, stored in localStorage)
- `currentActivities` - Array of all activities (synced from Firebase)
- `pets` - Array of all pets (synced from Firebase)
- Theme state - Stored in localStorage, applied via CSS class on body

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

### Adding a New Activity Type

1. **Add button in HTML** (in `<div class="button-grid">`)
```html
<button class="activity-btn" onclick="logActivity('New Type', '🆕')">
  <span class="emoji">🆕</span>
  <span>New Type</span>
</button>
```

2. **Update stats calculation** (in `updateStats()` function)
```javascript
const newTypeCount = currentActivities.filter(a => a.type === 'New Type').length;
```

3. **Add to edit modal dropdown** (in `<select id="edit-activity-type">`)
```html
<option value="New Type">🆕 New Type</option>
```

### Adding a New Filter

1. Add filter chip to UI
2. Update filter logic in activity rendering
3. Persist filter state to localStorage (optional)

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

**High Impact:**
- Activity notes field (currently only on medical activities)
- Pet edit/delete functionality
- Activity search/filter by keyword
- CSV export with all filters
- PDF reports for vet visits

**Medium Impact:**
- Vaccination due date reminders
- Weight trend chart
- Activity pattern insights
- Photo attachments

**Future iOS App:**
- SwiftUI port using same Firebase backend
- React Native components in /components ready for reuse
- Identical database schema for seamless sync
- Apple-specific features (HealthKit, Widgets, Siri)

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
# Install dependencies (React Native)
npm install

# Start Expo dev server (React Native, not needed for web)
npm start

# Web app (open directly)
# Just open index.html in browser or use any static server
python3 -m http.server 8000
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

**Primary File:**
/home/user/Pet-App/index.html (contains entire web app)

---

## Important Notes for Claude

### What NOT to Do
- ❌ Never push to `main` or `master` branch
- ❌ Never create new branches without user approval
- ❌ Never use wrong branch naming format (must be `claude/<name>-Etaqb`)
- ❌ Never make destructive changes without user confirmation
- ❌ Never add complex dependencies (keep it vanilla JS)
- ❌ Never break backwards compatibility with existing data
- ❌ Never create separate files when code belongs in index.html

### What TO Do
- ✅ Always check current branch first
- ✅ Always read index.html before making changes
- ✅ Always test changes in browser if possible
- ✅ Always maintain single-file architecture for web app
- ✅ Always preserve existing functionality
- ✅ Always add code to index.html (not separate files)
- ✅ Always commit with descriptive messages
- ✅ Always use retry logic for git push (network failures)

### When to Ask User
- Before implementing complex authentication
- Before changing database schema significantly
- Before adding external dependencies/libraries
- Before creating new files (vs adding to index.html)
- Before implementing features not in ROADMAP.md
- Before making destructive git operations

---

## Session Context

**Current Session ID:** Etaqb (must match branch suffix)
**Branch:** `claude/pet-activity-logger-Etaqb`
**Claude Session URL:** https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3

**Session Instructions:**
1. Read this file (CLAUDE.md) first for full context
2. Check current git branch
3. Read relevant documentation (DEVLOG.md, ROADMAP.md, README.md)
4. Read index.html if making code changes
5. Make changes, test, commit, push to correct branch

---

**Last Updated:** 2026-03-10
**Document Version:** 1.0
**Maintained By:** Claude AI Assistant

---

## Appendix: File Descriptions

| File | Purpose | Modify? |
|------|---------|---------|
| index.html | Main web app (HTML/CSS/JS) | ✅ YES - primary development file |
| App.js | React Native entry point | ⚠️ Only for future iOS app |
| package.json | Dependencies | ⚠️ Only if adding npm packages |
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
