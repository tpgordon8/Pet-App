# Visual Testing Workflow: /browse + Playwright Integration

This document describes the integrated testing workflow for Tailr that combines:
1. **`/browse` skill** - Interactive visual inspection by Claude
2. **Playwright** - Automated end-to-end testing

---

## Why This Workflow?

**The Problem:**
- Code reviews alone can miss visual bugs, layout issues, and UX problems
- Automated tests can pass while the UI looks broken
- Manual testing is time-consuming and not repeatable

**The Solution:**
- **`/browse`**: Claude actually sees and interacts with your running app
- **Playwright**: Automated tests verify behavior and catch regressions
- **Combined**: Visual verification + automated regression testing

---

## Quick Start

### 1. Start the Development Server

```bash
npm run dev
```

This starts Vite dev server at `http://localhost:5173`

### 2. Interactive Visual Testing with /browse

Use the `/browse` skill to have Claude inspect your app:

```
/browse http://localhost:5173
```

Claude will:
- Navigate to your app
- See the actual rendered page
- Capture screenshots
- Inspect DOM elements
- Verify visual layout
- Test interactions
- Check responsive design

**Example Commands:**

```bash
# Inspect the dashboard
/browse http://localhost:5173/dashboard

# Check mobile responsiveness
/browse http://localhost:5173 --viewport=mobile

# Test a specific feature
/browse http://localhost:5173 and click the Poop button and verify it logs correctly
```

### 3. Run Automated Playwright Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run specific test file
npm run test:e2e -- visual-testing-example.spec.js
```

---

## Detailed Workflow

### Phase 1: Visual Exploration with /browse

**Goal:** Have Claude visually inspect the app to verify it looks and works correctly

**Steps:**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Ask Claude to explore:**
   ```
   Use /browse to check the dashboard at http://localhost:5173
   and verify:
   - The layout looks clean
   - Quick log buttons are visible
   - Activity feed displays correctly
   - Pet selector works
   - Colors match the design (sage green theme)
   ```

3. **Claude will:**
   - Navigate to the URL
   - Take screenshots
   - Click elements
   - Verify visual appearance
   - Report any issues found

4. **Benefits:**
   - Catches visual bugs code review misses
   - Verifies UX/UI quality
   - Tests real browser rendering
   - Can check multiple viewports
   - Finds CSS/layout issues

### Phase 2: Automated Testing with Playwright

**Goal:** Create repeatable tests that catch regressions

**Steps:**

1. **Create or update test file:**
   ```javascript
   // tests/e2e/my-feature.spec.js
   import { test, expect } from '@playwright/test'
   import { captureAppState, waitForVueApp } from '../helpers/visual-testing.js'

   test('my feature works', async ({ page }) => {
     await page.goto('/')
     await waitForVueApp(page)

     // Your test logic
     await page.click('[data-testid="activity-button"]')

     // Verify result
     const state = await captureAppState(page)
     expect(state.sections.activityFeed).toBe(true)
   })
   ```

2. **Run tests:**
   ```bash
   npm run test:e2e
   ```

3. **Review results:**
   - Check `playwright-report/index.html` for detailed results
   - Screenshots saved in `test-results/screenshots/`
   - Videos saved for failed tests

4. **Benefits:**
   - Catches regressions automatically
   - Runs in CI/CD pipeline
   - Tests multiple browsers/devices
   - Provides screenshots/videos of failures
   - Fast feedback loop

### Phase 3: Combined Workflow (Best Practice)

**For new features or bug fixes:**

1. **Make code changes**

2. **Visual verification with /browse:**
   ```
   /browse http://localhost:5173
   and test the new activity logging feature
   ```

3. **Claude inspects and reports:**
   - "✅ Layout looks correct"
   - "✅ Buttons are properly styled"
   - "⚠️ Activity count doesn't update immediately" (found a bug!)

4. **Fix the bug**

5. **Verify again with /browse:**
   ```
   /browse http://localhost:5173
   and verify the activity count updates correctly now
   ```

6. **Write Playwright test:**
   ```javascript
   test('activity count updates after logging', async ({ page }) => {
     // Test the fix to prevent regression
   })
   ```

7. **Commit with confidence:**
   - Visual verification passed ✅
   - Automated tests passed ✅
   - Future regressions will be caught ✅

---

## Helper Functions

The `tests/helpers/visual-testing.js` module provides utilities for both workflows:

### captureAppState(page)
Captures complete state of the app for inspection
```javascript
const state = await captureAppState(page)
console.log(state.sections)  // Which sections are visible
console.log(state.counts)    // Element counts
console.log(state.viewport)  // Viewport info
```

### verifyActivityLog(page, expectedCount)
Verifies activity feed is displaying correctly
```javascript
const feed = await verifyActivityLog(page)
console.log(`Found ${feed.count} activities`)
```

### verifyPetSelector(page)
Checks pet selector state
```javascript
const pets = await verifyPetSelector(page)
console.log(`Selected: ${pets.selectedPet}`)
console.log(`Available: ${pets.availablePets}`)
```

### verifyQuickLogButtons(page)
Gets state of all quick log buttons
```javascript
const buttons = await verifyQuickLogButtons(page)
buttons.forEach(btn => {
  console.log(`${btn.emoji} ${btn.label}: ${btn.count}`)
})
```

### captureScreenshotWithMetadata(page, name)
Takes screenshot with full app state
```javascript
const capture = await captureScreenshotWithMetadata(page, 'my-feature')
// Saves to test-results/screenshots/my-feature-{timestamp}.png
// Returns { screenshot, metadata, timestamp }
```

### waitForVueApp(page, timeout)
Waits for Vue app to be fully loaded
```javascript
await waitForVueApp(page)  // Wait up to 5 seconds
await waitForVueApp(page, 10000)  // Custom timeout
```

---

## Example Scenarios

### Scenario 1: Testing a New Feature

**Feature:** Add "Walk" activity type

**Workflow:**

1. **Implement feature** (add button, handler, etc.)

2. **Visual check:**
   ```
   /browse http://localhost:5173/dashboard
   and verify the new Walk button is visible and styled correctly
   ```

3. **Claude reports:**
   - ✅ Button appears in Quick Log section
   - ✅ Emoji 🚶 displays correctly
   - ✅ Click logs activity
   - ⚠️ Button is slightly misaligned on mobile

4. **Fix alignment issue**

5. **Verify fix:**
   ```
   /browse http://localhost:5173 with mobile viewport
   and check the Walk button alignment
   ```

6. **Write test:**
   ```javascript
   test('Walk button logs activity', async ({ page }) => {
     await page.goto('/')
     await page.click('button:has-text("🚶")')
     const activities = await verifyActivityLog(page)
     expect(activities.firstItem.type).toBe('Walk')
   })
   ```

7. **Run tests:** `npm run test:e2e`

8. **Commit with confidence**

### Scenario 2: Debugging a Visual Bug

**Bug Report:** "Activity feed looks weird on iPad"

**Workflow:**

1. **Reproduce with /browse:**
   ```
   /browse http://localhost:5173/dashboard
   with iPad viewport
   and take a screenshot of the activity feed
   ```

2. **Claude identifies issue:**
   - Screenshots show feed is cut off
   - CSS overflow issue identified

3. **Fix CSS**

4. **Verify fix:**
   ```
   /browse http://localhost:5173/dashboard
   with iPad viewport
   and verify the feed displays correctly now
   ```

5. **Add regression test:**
   ```javascript
   test('activity feed displays correctly on tablet', async ({ page }) => {
     await page.setViewportSize({ width: 1024, height: 768 })
     const feed = await verifyActivityLog(page)
     expect(feed.found).toBe(true)
   })
   ```

### Scenario 3: Pre-Launch Checklist

**Before deploying to production:**

```
/browse http://localhost:5173
and perform a complete visual inspection:

1. Test all quick log buttons
2. Verify activity feed displays correctly
3. Check pet selector functionality
4. Test member selector
5. Verify medical tracking modals
6. Check dark mode
7. Test on mobile viewport (375x667)
8. Test on desktop (1280x720)
9. Verify no console errors
10. Check Firebase real-time sync
```

Claude will systematically check each item and provide a detailed report.

---

## Best Practices

### 1. Use /browse for Visual Verification
- Before committing UI changes
- When adding new components
- For responsive design testing
- To verify color/typography/spacing

### 2. Use Playwright for Automation
- For regression testing
- In CI/CD pipelines
- For multi-browser testing
- For performance testing

### 3. Combine Both
- `/browse` for initial verification
- Playwright to lock in the correct behavior
- Run both before pushing code

### 4. Add data-testid Attributes
Makes testing more reliable:
```vue
<button data-testid="activity-button" data-type="Poop">
  💩 Poop
</button>
```

### 5. Capture Screenshots
Always capture screenshots of important states:
```javascript
await page.screenshot({
  path: 'test-results/screenshots/critical-feature.png'
})
```

### 6. Test Multiple Viewports
```javascript
// Desktop
await page.setViewportSize({ width: 1280, height: 720 })

// Mobile
await page.setViewportSize({ width: 375, height: 667 })

// Tablet
await page.setViewportSize({ width: 1024, height: 768 })
```

---

## Troubleshooting

### /browse skill not working

**Check:**
1. Is dev server running? `npm run dev`
2. Is app accessible at `http://localhost:5173`?
3. Try: `/browse http://localhost:5173 --help`

**Fix:**
```bash
# Restart dev server
npm run dev

# Check port is not in use
lsof -i :5173
```

### Playwright tests failing

**Check:**
1. Is dev server running automatically? (playwright.config.js handles this)
2. Are you using correct test patterns?
3. Check test results: `playwright-report/index.html`

**Debug:**
```bash
# Run in UI mode for debugging
npm run test:e2e:ui

# Run with headed browser
npx playwright test --headed

# Run specific test
npx playwright test visual-testing-example
```

### Vue app not loading in tests

**Check:**
1. Wait for app to load: `await waitForVueApp(page)`
2. Check console logs: `captureConsoleLogs(page)`
3. Verify Firebase config is correct

**Debug:**
```javascript
// Add debug output
const state = await captureAppState(page)
console.log('App state:', state)

// Take screenshot
await page.screenshot({ path: 'debug.png' })
```

---

## CI/CD Integration

### GitHub Actions

The existing workflow (`.github/workflows/deploy.yml`) should include e2e tests:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e

- name: Upload test results
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

### Pre-commit Hook

Add to `.husky/pre-commit`:
```bash
#!/bin/sh
npm run test:e2e
```

---

## Summary

**Workflow Overview:**

```
┌─────────────────────────────────────────────────────┐
│  1. Make Code Changes                                │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  2. Visual Verification with /browse                 │
│     - Claude sees actual rendered page               │
│     - Verifies layout, colors, interactions          │
│     - Catches visual bugs                            │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  3. Fix Any Issues Found                             │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  4. Write/Update Playwright Tests                    │
│     - Lock in correct behavior                       │
│     - Prevent future regressions                     │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  5. Run npm run test:e2e                             │
│     - Verify all tests pass                          │
│     - Review screenshots/videos                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  6. Commit & Push with Confidence                    │
│     ✅ Visual verification passed                     │
│     ✅ Automated tests passed                         │
│     ✅ Screenshots/videos captured                    │
└─────────────────────────────────────────────────────┘
```

**Key Benefits:**

1. **Catch visual bugs early** - /browse sees what users see
2. **Prevent regressions** - Playwright locks in correct behavior
3. **Fast feedback** - Test locally before pushing
4. **Confidence** - Ship knowing it works visually AND functionally
5. **Documentation** - Screenshots show what's expected

---

## Next Steps

1. **Try it now:**
   ```bash
   npm run dev
   ```
   Then ask Claude:
   ```
   /browse http://localhost:5173 and verify the dashboard looks correct
   ```

2. **Write a test:**
   Create a new test in `tests/e2e/` using the examples above

3. **Run tests:**
   ```bash
   npm run test:e2e
   ```

4. **Integrate into workflow:**
   Use this process for all future changes

---

**Questions?** Refer to:
- Playwright docs: https://playwright.dev
- /browse skill documentation
- Helper functions in `tests/helpers/visual-testing.js`
