#!/usr/bin/env node

/**
 * Autonomous QA Testing Agent for Pet-App
 *
 * This agent performs adversarial mobile testing against the deployed application,
 * attempting to find bugs through autonomous exploration.
 */

import { chromium, devices } from '@playwright/test';
import CONFIG from './config/agent-config.js';
import logger from './helpers/logger.js';
import { generateTestImages } from './helpers/image-generator.js';
import { AuthHelper } from './helpers/auth-helper.js';
import { StateTracker } from './modules/state-tracker.js';
import { ElementDetector } from './modules/element-detector.js';
import { BugDetector } from './modules/bug-detector.js';
import { ActionSelector } from './modules/action-selector.js';
import { ReportGenerator } from './modules/report-generator.js';

/**
 * Main QA Agent orchestrator
 */
class QAAgent {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.stateTracker = new StateTracker();
    this.startTime = Date.now();
  }

  /**
   * Initialize browser with mobile emulation
   */
  async initialize() {
    logger.section('AUTONOMOUS QA AGENT - INITIALIZING');

    // Generate test assets
    logger.info('Generating test assets...');
    await generateTestImages();
    logger.success('Test images generated');

    // Launch browser
    logger.info(`Launching browser (${CONFIG.device.name} emulation)...`);
    this.browser = await chromium.launch({
      headless: CONFIG.headless,
      args: ['--no-sandbox']
    });

    // Create context with device emulation
    this.context = await this.browser.newContext({
      ...devices[CONFIG.device.name],
      viewport: CONFIG.device.viewport,
      userAgent: CONFIG.device.userAgent,
      hasTouch: CONFIG.device.hasTouch,
      isMobile: CONFIG.device.isMobile
    });

    // Create page
    this.page = await this.context.newPage();

    // Setup console error monitoring
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        this.stateTracker.recordConsoleError({
          message: msg.text(),
          stack: ''
        });
      }
    });

    // Setup page error monitoring
    this.page.on('pageerror', error => {
      this.stateTracker.recordConsoleError({
        message: error.message,
        stack: error.stack
      });
    });

    logger.success('Browser initialized');
  }

  /**
   * Create test household and authenticate
   */
  async authenticate() {
    logger.section('AUTHENTICATION');

    // Navigate to app
    logger.info(`Navigating to ${CONFIG.baseUrl}...`);
    await this.page.goto(CONFIG.baseUrl, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.timeouts.navigation
    });

    this.stateTracker.visitUrl(this.page.url());

    // Create test household
    const authHelper = new AuthHelper(this.page);
    const credentials = await authHelper.createTestHousehold();

    logger.success(`Authentication complete`);
    logger.info(`Household Code: ${credentials.householdCode}`);
    logger.info('📝 Note: Manual cleanup required for test data in Firebase');

    return credentials;
  }

  /**
   * Run autonomous exploration
   */
  async explore() {
    logger.section('AUTONOMOUS EXPLORATION');

    const elementDetector = new ElementDetector(this.page);
    const bugDetector = new BugDetector(this.page, elementDetector, this.stateTracker);
    const actionSelector = new ActionSelector(
      this.page,
      elementDetector,
      this.stateTracker,
      bugDetector
    );

    logger.info(`Starting ${CONFIG.maxSteps} step exploration...`);

    for (let step = 0; step < CONFIG.maxSteps; step++) {
      try {
        // Select next action
        const action = await actionSelector.selectNextAction();

        if (!action) {
          logger.warning('No more actions available, ending exploration');
          break;
        }

        // Execute action
        await actionSelector.executeAction(action);

        // Wait between actions
        await this.page.waitForTimeout(500);

      } catch (error) {
        logger.error(`Step ${step + 1} failed: ${error.message}`);

        // Record the error as potential bug
        this.stateTracker.recordBug({
          type: 'exploration-error',
          severity: 'major',
          message: `Exploration step failed: ${error.message}`,
          evidence: { step: step + 1, error: error.message }
        });

        // Continue with next step
        continue;
      }
    }

    logger.success(`Exploration complete: ${this.stateTracker.currentStep} steps executed`);
  }

  /**
   * Generate final report
   */
  async generateReport() {
    logger.section('GENERATING REPORT');

    const reportGenerator = new ReportGenerator(this.stateTracker, CONFIG);

    // Generate reports
    const paths = await reportGenerator.generateFinalReport();

    // Print console summary
    const state = this.stateTracker.exportState();
    const summary = reportGenerator.generateConsoleSummary(state);
    console.log(summary);

    logger.success('Reports generated:');
    logger.info(`  Text: ${paths.textReportPath}`);
    logger.info(`  JSON: ${paths.jsonReportPath}`);
    logger.info(`  Log:  ${paths.logPath}`);

    // Print bug summary
    const totalBugs = state.summary.bugsFound;

    if (totalBugs >= 5) {
      logger.success(`✅ Success: Found ${totalBugs} bugs (target: >= 5)`);
    } else if (totalBugs > 0) {
      logger.warning(`Found ${totalBugs} bugs (target: >= 5)`);
    } else {
      logger.info('No bugs found - application appears to be working correctly!');
    }

    return paths;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    logger.info('Cleaning up...');

    if (this.browser) {
      await this.browser.close();
    }

    const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
    logger.success(`Agent completed in ${duration}s`);
  }

  /**
   * Run the complete test suite
   */
  async run() {
    try {
      // Initialize
      await this.initialize();

      // Authenticate
      await this.authenticate();

      // Explore
      await this.explore();

      // Generate report
      await this.generateReport();

    } catch (error) {
      logger.error(`Fatal error: ${error.message}`);
      console.error(error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the agent if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const agent = new QAAgent();
  agent.run().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

export default QAAgent;
