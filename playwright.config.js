import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright Configuration for Tailr Pet Activity Logger
 *
 * This config supports both:
 * 1. Automated Playwright tests (npm run test:e2e)
 * 2. Visual testing workflow with /browse skill
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Maximum time one test can run
  timeout: 30 * 1000,

  // Test match pattern
  testMatch: '**/*.spec.{js,ts}',

  // Run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter configuration
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['list'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  // Shared settings for all projects
  use: {
    // Base URL for all tests — preview server (4173) in CI, dev server (5173) locally
    baseURL: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',

    // Collect trace when retrying failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // Maximum time for actions like click, fill, etc.
    actionTimeout: 10000,
  },

  // Web server configuration
  // In CI: serve the pre-built dist/ (Firebase creds are baked in from the build step)
  // Locally: use the dev server with hot reload
  webServer: {
    command: process.env.CI ? 'npm run preview' : 'npm run dev',
    url: process.env.CI ? 'http://localhost:4173' : 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    stdout: 'pipe',
    stderr: 'pipe',
  },

  // Configure projects for different browsers
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 },
      },
    },

    {
      name: 'mobile-safari',
      use: {
        ...devices['iPhone 12'],
        // Mobile-first design testing
      },
    },

    {
      name: 'mobile-chrome',
      use: {
        ...devices['Pixel 5'],
      },
    },

    {
      name: 'tablet',
      use: {
        ...devices['iPad Pro'],
      },
    },
  ],
})
