# Tailr Testing Suite

Integrated testing with `/browse` and Playwright for visual + automated verification.

---

## Directory Structure

```
tests/
├── README.md                              # This file
├── e2e/                                   # End-to-end tests
│   ├── household-creation.spec.js         # Onboarding flow tests
│   ├── visual-testing-example.spec.js     # Visual testing demos
│   └── real-world-example.spec.js         # Complete workflow examples
├── helpers/                               # Testing utilities
│   └── visual-testing.js                  # Shared helper functions
├── unit/                                  # Unit tests (Vitest)
├── security/                              # Security tests
└── fixtures/                              # Test data/fixtures
```

---

## Quick Start

### Run All Tests

```bash
# E2E tests (Playwright)
npm run test:e2e

# Unit tests (Vitest)
npm run test:unit

# E2E with UI (interactive)
npm run test:e2e:ui
```

### Visual Testing Workflow

```bash
# 1. Start dev server
npm run dev

# 2. Visual inspection with Claude
/browse http://localhost:5173
and verify the dashboard works correctly

# 3. Run automated tests
npm run test:e2e

# 4. View report
npm run test:report
```

---

## Test Files

### `e2e/household-creation.spec.js`
Tests the complete onboarding flow:
- Welcome screen
- Pet creation
- Species selection
- Household setup
- Navigation to dashboard

**Run it:**
```bash
npx playwright test household-creation
```

### `e2e/visual-testing-example.spec.js`
Demonstrates visual testing patterns:
- Dashboard rendering
- Quick log buttons
- Activity feed
- Pet selector
- Mobile responsiveness
- Dark mode

**Run it:**
```bash
npx playwright test visual-testing-example
```

### `e2e/real-world-example.spec.js`
Complete real-world scenarios:
- Activity logging
- Notes functionality
- Edit/delete operations
- Multi-browser testing
- Responsive design

**Run it:**
```bash
npx playwright test real-world-example
```

---

## Helper Functions

Located in `helpers/visual-testing.js`:

### `captureAppState(page)`
Captures complete app state for inspection
```javascript
const state = await captureAppState(page)
console.log(state.sections)  // Which sections visible
console.log(state.counts)    // Element counts
console.log(state.viewport)  // Viewport info
```

### `verifyActivityLog(page, expectedCount)`
Verifies activity feed
```javascript
const feed = await verifyActivityLog(page)
console.log(`Found ${feed.count} activities`)
console.log('First item:', feed.firstItem)
```

### `verifyPetSelector(page)`
Checks pet selector state
```javascript
const pets = await verifyPetSelector(page)
console.log(`Selected: ${pets.selectedPet}`)
console.log(`Available: ${pets.availablePets}`)
```

### `verifyQuickLogButtons(page)`
Gets all button states
```javascript
const buttons = await verifyQuickLogButtons(page)
buttons.forEach(btn => {
  console.log(`${btn.emoji} ${btn.label}: ${btn.count}`)
})
```

### `waitForVueApp(page, timeout)`
Waits for Vue to fully load
```javascript
await waitForVueApp(page)  // Wait up to 5s
await waitForVueApp(page, 10000)  // Custom timeout
```

### `captureScreenshotWithMetadata(page, name)`
Screenshot with full state data
```javascript
const capture = await captureScreenshotWithMetadata(page, 'my-feature')
// Saves to test-results/screenshots/my-feature-{timestamp}.png
```

---

## Writing Tests

### Basic Test Template

```javascript
import { test, expect } from '@playwright/test'
import { waitForVueApp, captureAppState } from '../helpers/visual-testing.js'

test('my feature works', async ({ page }) => {
  // Navigate
  await page.goto('/')
  await waitForVueApp(page)

  // Test your feature
  await page.click('[data-testid="my-button"]')

  // Verify result
  const state = await captureAppState(page)
  expect(state.sections.mySection).toBe(true)

  // Take screenshot
  await page.screenshot({ path: 'test-results/screenshots/my-feature.png' })
})
```

### Visual Inspection Test

```javascript
test('MANUAL: Visual inspection', async ({ page }) => {
  await page.goto('/')
  await waitForVueApp(page)

  // Capture state for /browse to inspect
  const state = await captureAppState(page)
  console.log(JSON.stringify(state, null, 2))

  // Take screenshots
  await captureScreenshotWithMetadata(page, 'visual-check')

  // This test is for manual inspection with /browse
  expect(true).toBe(true)
})
```

### Multi-Viewport Test

```javascript
test('works on all viewports', async ({ page }) => {
  const viewports = [
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 1024, height: 768 },
  ]

  for (const viewport of viewports) {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await waitForVueApp(page)

    // Test functionality
    const state = await captureAppState(page)
    expect(state.vueMounted).toBe(true)

    // Screenshot
    await page.screenshot({
      path: `test-results/screenshots/${viewport.name}.png`
    })
  }
})
```

---

## Configuration

### Playwright Config (`playwright.config.js`)

**Key settings:**
- Base URL: `http://localhost:5173`
- Timeout: 30 seconds
- Retries: 2 on CI, 0 locally
- Auto-starts dev server
- Screenshots on failure
- Videos on failure

**Projects:**
- `chromium` - Desktop Chrome (1280x720)
- `mobile-safari` - iPhone 12
- `mobile-chrome` - Pixel 5
- `tablet` - iPad Pro

**Run specific project:**
```bash
npx playwright test --project=mobile-safari
```

---

## Test Results

### Output Locations

```
playwright-report/          # HTML report
test-results/
  ├── screenshots/          # Failure screenshots
  ├── videos/              # Failure videos
  └── visual-baselines/    # Visual regression baselines
```

### Viewing Reports

```bash
# Open HTML report
npm run test:report

# Or manually
npx playwright show-report
```

### Understanding Results

**✅ Green** - Test passed
**❌ Red** - Test failed (check screenshots/videos)
**⚠️ Yellow** - Test flaky (passed after retry)
**⏭️ Skipped** - Test skipped

---

## Best Practices

### 1. Use data-testid Attributes

```vue
<button data-testid="activity-button" data-type="Poop">
  💩 Poop
</button>
```

Then in tests:
```javascript
await page.click('[data-testid="activity-button"][data-type="Poop"]')
```

### 2. Always Wait for Vue

```javascript
await waitForVueApp(page)  // Before any interactions
```

### 3. Capture State for Debugging

```javascript
const state = await captureAppState(page)
console.log('Debug state:', state)
```

### 4. Take Screenshots Liberally

```javascript
await page.screenshot({ path: 'debug.png' })
```

### 5. Use /browse for Visual Verification

Before writing tests:
```
/browse http://localhost:5173
and verify the feature works as expected
```

Then write the test to lock in the behavior.

### 6. Test Mobile First

Always include mobile viewport tests:
```javascript
await page.setViewportSize({ width: 375, height: 667 })
```

### 7. Handle Firebase Delays

```javascript
await page.waitForTimeout(1500)  // After Firebase operations
```

---

## Debugging Tests

### Run in UI Mode (Best for debugging)

```bash
npm run test:e2e:ui
```

Interactive mode with:
- Time travel debugging
- Watch tests run
- Inspect DOM at any point
- Edit and re-run tests

### Run in Headed Mode

```bash
npm run test:e2e:headed
```

See the browser while tests run.

### Run in Debug Mode

```bash
npm run test:e2e:debug
```

Step through tests line by line.

### Check Screenshots

Failed tests automatically save:
- Screenshots: `test-results/screenshots/`
- Videos: `test-results/videos/`

### Add Console Logs

```javascript
page.on('console', msg => console.log('Browser:', msg.text()))
```

### Use /browse to Compare

```
/browse http://localhost:5173
and show me what the dashboard should look like
```

Compare with test screenshots to find discrepancies.

---

## CI/CD Integration

### GitHub Actions

Tests run automatically on push:
- Lint code
- Run unit tests
- Run e2e tests
- Deploy if all pass

**Config:** `.github/workflows/deploy.yml`

### Test on Pull Requests

```yaml
on:
  pull_request:
    branches: [ main ]
```

### View CI Results

GitHub Actions tab shows:
- Test results
- Screenshots/videos
- Detailed logs

---

## Common Issues

### Test Times Out

**Cause:** App not loading
**Fix:**
```javascript
await waitForVueApp(page, 10000)  // Increase timeout
```

### Element Not Found

**Cause:** Selector changed or timing issue
**Fix:**
```javascript
// Use data-testid
await page.click('[data-testid="my-button"]')

// Or wait explicitly
await page.waitForSelector('[data-testid="my-button"]')
```

### Firebase Not Syncing

**Cause:** Network delay
**Fix:**
```javascript
await page.waitForTimeout(2000)  // Wait longer
```

### Flaky Tests

**Cause:** Race conditions
**Fix:**
```javascript
// Don't use fixed timeouts
await page.waitForTimeout(1000)  // ❌ Bad

// Use explicit waits
await page.waitForSelector('[data-testid="result"]')  // ✅ Good
```

### Dev Server Not Starting

**Cause:** Port in use
**Fix:**
```bash
# Kill existing process
lsof -ti:5173 | xargs kill -9

# Or use different port
vite --port 5174
```

---

## Further Reading

- [Playwright Docs](https://playwright.dev)
- [Vitest Docs](https://vitest.dev)
- [VISUAL_TESTING_WORKFLOW.md](../VISUAL_TESTING_WORKFLOW.md) - Complete workflow guide
- [QUICK_TESTING_GUIDE.md](../QUICK_TESTING_GUIDE.md) - Quick reference

---

## Getting Help

**Test failing and don't know why?**

Ask Claude:
```
The test 'my feature works' is failing.
Use /browse to check if the feature works correctly,
then help me fix the test.
```

Claude will:
1. Visually inspect the feature
2. Compare with test expectations
3. Help debug the issue
4. Update the test if needed
