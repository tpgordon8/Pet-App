# Contributing to Tailr - Pet Activity Logger

**Welcome!** This guide will help you get started contributing to Tailr, whether you're fixing bugs, adding features, or improving documentation.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Standards](#code-standards)
4. [Git Workflow](#git-workflow)
5. [Testing](#testing)
6. [Common Tasks](#common-tasks)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- **Node.js:** 18.x or higher (`node --version`)
- **npm:** 9.x or higher (`npm --version`)
- **Git:** 2.x or higher
- **Firebase CLI:** `npm install -g firebase-tools`
- **Code Editor:** VS Code recommended

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/tpgordon8/Pet-App.git
   cd Pet-App
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - The app will hot-reload on file changes

### Project Structure

```
Pet-App/
├── src/                    # Vue 3 application source
│   ├── components/         # Reusable Vue components
│   │   ├── onboarding/     # Onboarding flow components
│   │   └── *.vue           # Shared components
│   ├── views/              # Page-level components (routes)
│   ├── stores/             # Pinia state management
│   │   ├── activities.js   # Activity tracking state
│   │   ├── pets.js         # Pet management state
│   │   └── household.js    # User/household state
│   ├── composables/        # Reusable composition functions
│   ├── router/             # Vue Router configuration
│   ├── firebase/           # Firebase config
│   └── assets/             # CSS, images
├── public/                 # Static assets (favicon, etc.)
├── scripts/                # Build and setup scripts
├── firebase-rules.json     # Realtime Database security rules
├── firestore.rules         # Firestore security rules
├── vite.config.js          # Vite build configuration
├── tailwind.config.js      # TailwindCSS configuration
└── package.json            # Dependencies and scripts
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

- Opens at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Vue DevTools available in browser

### 2. Make Changes

- Edit Vue components in `src/components/` or `src/views/`
- Modify Pinia stores in `src/stores/`
- Update styles in component `<style scoped>` blocks or `src/assets/main.css`

### 3. Check Code Quality

```bash
# Run linter (auto-fix)
npm run lint

# Run tests
npm run test:unit

# Build for production (check for errors)
npm run build
```

### 4. Commit Changes

Follow the [Git Workflow](#git-workflow) section below.

---

## Code Standards

### Vue 3 Component Style

**Use Composition API with `<script setup>`:**

```vue
<template>
  <div class="component-name">
    <h2>{{ title }}</h2>
    <button @click="handleClick">{{ buttonText }}</button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  title: String,
  buttonText: {
    type: String,
    default: 'Click Me'
  }
})

// Emits
const emit = defineEmits(['click'])

// State
const count = ref(0)

// Computed
const doubleCount = computed(() => count.value * 2)

// Methods
function handleClick() {
  count.value++
  emit('click', count.value)
}
</script>

<style scoped>
.component-name {
  /* Component-specific styles */
  /* Use TailwindCSS utility classes when possible */
}
</style>
```

### Code Quality Rules

**1. Component Complexity**
- ✅ Keep components under 400 LOC (lines of code)
- ✅ Single Responsibility Principle - one component, one purpose
- ✅ Extract reusable logic to composables

**2. Naming Conventions**
- Components: PascalCase (`ActivityButton.vue`)
- Composables: camelCase with `use` prefix (`useToast.js`)
- Stores: camelCase with Store suffix (`activitiesStore`)
- Props: camelCase
- Events: kebab-case (`@update-value`)

**3. Performance Best Practices**
- Use `shallowRef`/`shallowReactive` for large data structures
- Lazy load heavy components with `defineAsyncComponent`
- Avoid unnecessary watchers - use computed properties instead
- Don't mutate props directly - emit events instead

**4. TailwindCSS Usage**
- Prefer Tailwind utility classes over custom CSS
- Use `@apply` in `<style scoped>` only when necessary
- Follow mobile-first responsive design (`sm:`, `md:`, `lg:`)
- Use dark mode variant classes (`dark:`)

### TypeScript / JSDoc

While the project doesn't use TypeScript, add JSDoc comments for complex functions:

```javascript
/**
 * Generate a medical history PDF for a pet
 * @param {Object} pet - Pet object with name, emoji, species
 * @param {Array} activities - All activities for the pet
 * @param {Object} household - Household info
 * @returns {Blob} PDF blob for download
 */
function generateMedicalPdf(pet, activities, household) {
  // ...
}
```

---

## Git Workflow

### Branch Naming

**IMPORTANT:** All development must happen on branches starting with `claude/` and ending with the session ID:

```bash
# Current session
git checkout -b claude/your-feature-name-Etaqb

# Session ID must match: Etaqb
```

**Never push directly to `main`or `master`!**

### Commit Message Format

Use conventional commits format:

```
<type>: <short description>

<detailed description if needed>

https://claude.ai/code/session_017CfZdSweXvYneu5A49hDE3
```

**Types:**
- `feat:` New feature
- `fix:` Bug fix
- `perf:` Performance improvement
- `refactor:` Code refactoring (no behavior change)
- `style:` Code style/formatting
- `docs:` Documentation only
- `test:` Adding or fixing tests
- `chore:` Build process, dependencies, etc.

**Examples:**
```bash
git commit -m "feat: Add weight trend chart visualization"
git commit -m "fix: Resolve timestamp formatting issue in activity feed"
git commit -m "perf: Implement lazy loading for heavy components"
git commit -m "docs: Update CONTRIBUTING.md with onboarding guide"
```

### Commit Best Practices

1. **Keep commits small and focused**
   - One logical change per commit
   - Easier to review and rollback

2. **Update documentation**
   - PROGRESS.md for user-facing changes
   - DEVLOG.md for technical implementation details
   - Pre-push hook will remind you

3. **Run tests before committing**
   ```bash
   npm run lint
   npm run test:unit
   npm run build  # Verify no build errors
   ```

### Pushing Changes

```bash
# Push to your feature branch
git push -u origin claude/your-feature-name-Etaqb
```

**Note:** Pre-push hooks will check for undocumented commits. If blocked:

```bash
# Update documentation
# Edit PROGRESS.md and DEVLOG.md

# Clear the tracker
rm .git/undocumented_commits.txt

# Try push again
git push
```

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run specific test file
npm run test:unit tests/example.test.js
```

**Writing Tests:**

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ActivityButton from '@/components/ActivityButton.vue'

describe('ActivityButton', () => {
  it('renders emoji and label', () => {
    const wrapper = mount(ActivityButton, {
      props: {
        emoji: '💩',
        label: 'Poop',
        count: 3
      }
    })

    expect(wrapper.text()).toContain('💩')
    expect(wrapper.text()).toContain('Poop')
    expect(wrapper.text()).toContain('3')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(ActivityButton, {
      props: { emoji: '💩', label: 'Poop', count: 0 }
    })

    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
```

### E2E Tests (Playwright)

```bash
# Run E2E tests
npm run test:e2e

# Run with UI mode (recommended for debugging)
npm run test:e2e:ui
```

### Firebase Rules Testing

```bash
# Test security rules with Firebase Emulator
npm run test:firebase-rules
```

---

## Common Tasks

### Adding a New Activity Type

1. **Add button in `DashboardView.vue`:**
   ```vue
   <ActivityButton
     emoji="🆕"
     label="New Activity"
     :count="activitiesStore.stats.newActivity"
     @click="showActivityNotes('New Activity', '🆕')"
   />
   ```

2. **Update stats in `src/stores/activities.js`:**
   ```javascript
   const stats = computed(() => {
     const today = todayActivities.value
     return {
       // ... existing stats
       newActivity: today.filter(a => a.type === 'New Activity').length
     }
   })
   ```

3. **Add to edit modal dropdown in `EditActivityModal.vue`:**
   ```vue
   <option value="New Activity">🆕 New Activity</option>
   ```

### Adding a New Pinia Store

1. **Create store file** `src/stores/newStore.js`:
   ```javascript
   import { defineStore } from 'pinia'
   import { ref, computed } from 'vue'

   export const useNewStore = defineStore('newStore', () => {
     // State
     const items = ref([])

     // Computed
     const itemCount = computed(() => items.value.length)

     // Actions
     function addItem(item) {
       items.value.push(item)
     }

     return { items, itemCount, addItem }
   })
   ```

2. **Use in component:**
   ```javascript
   import { useNewStore } from '@/stores/newStore'

   const newStore = useNewStore()
   newStore.addItem({ name: 'Example' })
   ```

### Deploying Security Rules

```bash
# Deploy Realtime Database rules only
npm run deploy:rules

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy everything (hosting + rules)
npm run deploy:all
```

---

## Troubleshooting

### Common Issues

#### 1. "Firebase project not found"

**Problem:** Firebase CLI not authenticated.

**Solution:**
```bash
firebase login
firebase use petlog-c4c1e
```

#### 2. "Module not found" errors

**Problem:** Dependencies not installed or out of sync.

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

#### 3. "Port 5173 already in use"

**Problem:** Another Vite dev server is running.

**Solution:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

#### 4. Build fails with CSS errors

**Problem:** Invalid TailwindCSS syntax or missing semicolons.

**Solution:**
- Check `<style>` blocks for syntax errors
- Ensure all CSS properties end with semicolons
- Run `npm run lint` to catch issues

#### 5. Firebase Emulator won't start

**Problem:** Ports already in use (9000, 9099, etc.).

**Solution:**
```bash
# Check what's using ports
lsof -i :9000
lsof -i :9099

# Kill processes
kill -9 <PID>
```

### Getting Help

1. **Check existing documentation:**
   - README.md - Project overview
   - CLAUDE.md - Complete project context
   - DEVLOG.md - Implementation history
   - CODE_AUDIT_FINDINGS.md - Known issues

2. **Search for similar issues:**
   - Check `git log` for related changes
   - Look in DEVLOG.md for similar problems solved

3. **Ask for help:**
   - Create a GitHub issue with:
     - Steps to reproduce
     - Expected vs. actual behavior
     - Error messages (full text)
     - Environment info (`node --version`, `npm --version`)

---

## Code Review Checklist

Before submitting changes, verify:

- [ ] Code follows Vue 3 Composition API patterns
- [ ] Components are under 400 LOC
- [ ] ESLint passes (`npm run lint`)
- [ ] Tests pass (`npm run test:unit`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console errors in browser
- [ ] Mobile-responsive (test on small screen)
- [ ] Dark mode works (if applicable)
- [ ] PROGRESS.md updated
- [ ] DEVLOG.md updated with technical details
- [ ] Commit messages follow convention
- [ ] No secrets committed (API keys, passwords)

---

## Additional Resources

### Vue.js
- [Vue 3 Documentation](https://vuejs.org/)
- [Composition API Guide](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue Best Practices 2026](https://medium.com/@ignatovich.dm/vue-3-best-practices-cb0a6e281ef4)

### Pinia (State Management)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Pinia Best Practices](https://pinia.vuejs.org/cookbook/)

### TailwindCSS
- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

### Firebase
- [Firebase Documentation](https://firebase.google.com/docs)
- [Realtime Database Rules](https://firebase.google.com/docs/database/security)
- [Firestore Rules](https://firebase.google.com/docs/firestore/security/get-started)

### Testing
- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright Documentation](https://playwright.dev/)

---

**Happy coding! 🐾**

If you have questions or suggestions for improving this guide, please create an issue or submit a PR.
