# Quick Testing Guide: /browse + Playwright

A cheat sheet for rapid visual testing with Claude.

---

## 🚀 Quick Start (30 seconds)

```bash
# 1. Start dev server
npm run dev

# 2. Ask Claude:
/browse http://localhost:5173 and verify the dashboard looks correct

# 3. Run automated tests
npm run test:e2e
```

Done! You've just visually verified AND automatically tested your app.

---

## 📋 Common Testing Tasks

### Test a New Feature

```bash
# Start server
npm run dev

# Visual check with Claude
/browse http://localhost:5173
and test the new Walk activity button - verify it logs correctly

# Automated test
npm run test:e2e
```

### Debug a Visual Bug

```bash
# Visual inspection
/browse http://localhost:5173/dashboard
with iPad viewport
and take a screenshot of the activity feed

# Claude will report what it sees
```

### Pre-Commit Checklist

```bash
# Complete visual verification
/browse http://localhost:5173
and run through the testing checklist:
- Quick log buttons work
- Activity feed displays
- Pet selector functional
- No console errors
- Test mobile viewport

# Run all tests
npm run test:e2e

# View report
npm run test:report
```

---

## 🎯 /browse Examples

### Basic Inspection
```
/browse http://localhost:5173
```

### Test Specific Feature
```
/browse http://localhost:5173
and click the Poop button and verify it logs an activity
```

### Mobile Testing
```
/browse http://localhost:5173
with mobile viewport (375x667)
and verify the layout is responsive
```

### Take Screenshots
```
/browse http://localhost:5173
and take screenshots of the dashboard in both light and dark mode
```

### Check Specific Element
```
/browse http://localhost:5173
and verify the pet selector dropdown is styled with sage green colors
```

### Multi-Step Flow
```
/browse http://localhost:5173
and complete the onboarding flow:
1. Click Get Started
2. Enter pet name "TestPet"
3. Select Dog
4. Skip household setup
Verify you reach the dashboard
```

---

## 🧪 Playwright Examples

### Run All Tests
```bash
npm run test:e2e
```

### Interactive UI Mode
```bash
npm run test:e2e:ui
```

### Debug Mode (Step Through)
```bash
npm run test:e2e:debug
```

### Run Specific Test
```bash
npx playwright test visual-testing-example
```

### Run on Specific Browser
```bash
npx playwright test --project=mobile-safari
```

### View Report
```bash
npm run test:report
```

---

## 🛠️ Helper Scripts

### Full Workflow
```bash
npm run test:visual:full
```
Guides you through:
1. Start server
2. /browse instructions
3. Run Playwright tests
4. Open report

### Just Run Tests
```bash
npm run test:visual
```

### Clean Results
```bash
./scripts/visual-test.sh clean
```

---

## 💡 Pro Tips

### 1. Always Visual Check First
```
/browse before committing UI changes
```
Catches issues code review misses.

### 2. Use Screenshots for Comparison
```
/browse http://localhost:5173
and take a screenshot before and after the change
```

### 3. Test Multiple Viewports
```
Desktop: 1280x720
Mobile: 375x667  (iPhone)
Tablet: 1024x768 (iPad)
```

### 4. Verify Real-Time Sync
```
/browse http://localhost:5173
and open two tabs, log activity in one,
verify it appears in the other
```

### 5. Check Console Errors
```
/browse http://localhost:5173
and check for any console errors or warnings
```

---

## 🐛 Debugging

### Test Failing?

```bash
# Run in headed mode to watch
npm run test:e2e:headed

# Run in debug mode to step through
npm run test:e2e:debug

# Check screenshots in test-results/
```

### /browse Not Working?

```bash
# Verify server is running
curl http://localhost:5173

# Restart server
npm run dev
```

### App Not Loading?

```bash
# Check console
/browse http://localhost:5173
and check browser console for errors

# Verify Firebase config
cat src/firebase/config.js
```

---

## 📊 Test Results

### Where to Find Results

```
playwright-report/index.html    - HTML report
test-results/screenshots/       - Failure screenshots
test-results/videos/            - Failure videos
test-results/visual-baselines/  - Visual baselines
```

### Open Report
```bash
npm run test:report
# or
npx playwright show-report
```

---

## ✅ Testing Checklist Template

Use this with /browse:

```
/browse http://localhost:5173
and verify:

LAYOUT:
[ ] Dashboard renders correctly
[ ] All sections visible
[ ] No overlap or cutoff

FUNCTIONALITY:
[ ] Quick log buttons work
[ ] Activity feed displays
[ ] Pet selector functional
[ ] Member selector functional

VISUAL:
[ ] Colors match design (sage green)
[ ] Fonts/spacing correct
[ ] Icons/emojis display
[ ] Dark mode works

RESPONSIVE:
[ ] Desktop (1280x720) ✓
[ ] Mobile (375x667) ✓
[ ] Tablet (1024x768) ✓

ERRORS:
[ ] No console errors
[ ] No 404s
[ ] No Firebase errors
```

---

## 🎓 Learning Path

### Day 1: Basic Testing
```bash
npm run dev
/browse http://localhost:5173
npm run test:e2e
```

### Day 2: Write Your First Test
Create `tests/e2e/my-test.spec.js`:
```javascript
import { test, expect } from '@playwright/test'
import { captureAppState } from '../helpers/visual-testing.js'

test('my feature works', async ({ page }) => {
  await page.goto('/')
  const state = await captureAppState(page)
  expect(state.sections.dashboard).toBe(true)
})
```

### Day 3: Integrate Into Workflow
1. Make change
2. `/browse` verify
3. Write test
4. Commit

### Week 2: Advanced Patterns
- Multi-viewport testing
- Real-time sync verification
- Visual regression testing
- CI/CD integration

---

## 📚 Reference

**Full Documentation:**
- `VISUAL_TESTING_WORKFLOW.md` - Complete guide
- `tests/helpers/visual-testing.js` - Helper functions
- `tests/e2e/visual-testing-example.spec.js` - Examples

**External Docs:**
- Playwright: https://playwright.dev
- /browse: Ask Claude "/browse --help"

**Get Help:**
```
Ask Claude: "How do I test [feature] with /browse and Playwright?"
```

---

## 🎯 TL;DR

**Before every commit:**
```bash
# 1. Visual check
/browse http://localhost:5173 and verify it looks correct

# 2. Automated test
npm run test:e2e
```

**That's it!** Two commands for confident deployments.
