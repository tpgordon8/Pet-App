import CONFIG from '../config/agent-config.js';
import logger from '../helpers/logger.js';

/**
 * Bug detection heuristics
 */
export class BugDetector {
  constructor(page, elementDetector, stateTracker) {
    this.page = page;
    this.elementDetector = elementDetector;
    this.stateTracker = stateTracker;
  }

  /**
   * Detect JavaScript console errors
   */
  async detectConsoleErrors() {
    const errors = this.stateTracker.consoleErrors;

    // Check for critical errors in recent console logs
    const recentErrors = errors.slice(-5); // Last 5 errors

    const bugs = [];

    for (const error of recentErrors) {
      // Skip known warnings
      const isIgnored = CONFIG.ignoredWarnings.some(warning =>
        error.message.includes(warning)
      );

      if (!isIgnored) {
        bugs.push({
          type: 'javascript-error',
          severity: 'critical',
          message: `Console error: ${error.message}`,
          evidence: {
            stack: error.stack,
            timestamp: error.timestamp
          }
        });

        logger.bug('critical', `JavaScript error: ${error.message.substring(0, 100)}`);
      }
    }

    return bugs;
  }

  /**
   * Detect unexpected error messages (not validation)
   */
  async detectUnexpectedErrors() {
    const errors = await this.elementDetector.detectErrors();
    const bugs = [];

    for (const error of errors) {
      // If it's NOT a validation error, it's likely a bug
      if (!error.isValidationError) {
        bugs.push({
          type: 'unexpected-error',
          severity: 'critical',
          message: `Unexpected error message: "${error.text}"`,
          evidence: {
            selector: error.selector,
            className: error.className
          }
        });

        logger.bug('critical', `Unexpected error: ${error.text.substring(0, 80)}`);
      }
    }

    return bugs;
  }

  /**
   * Detect horizontal scroll (mobile UX issue)
   */
  async detectHorizontalScroll() {
    const scrollData = await this.elementDetector.checkHorizontalScroll();
    const bugs = [];

    if (scrollData.hasHorizontalScroll) {
      bugs.push({
        type: 'horizontal-scroll',
        severity: 'major',
        message: `Mobile viewport has horizontal scroll (scrollWidth: ${scrollData.scrollWidth}px > clientWidth: ${scrollData.clientWidth}px)`,
        evidence: scrollData
      });

      logger.bug('major', `Horizontal scroll detected: ${scrollData.scrollWidth}px > ${scrollData.clientWidth}px`);
    }

    return bugs;
  }

  /**
   * Detect small tap targets (mobile UX issue)
   */
  async detectSmallTapTargets() {
    const smallTargets = await this.elementDetector.checkTapTargets();
    const bugs = [];

    for (const target of smallTargets.slice(0, 5)) { // Report up to 5
      bugs.push({
        type: 'small-tap-target',
        severity: 'minor',
        message: `${target.element}: "${target.text}" - Size: ${target.size.width}x${target.size.height}px (should be ${CONFIG.bugThresholds.minTapTargetSize}x${CONFIG.bugThresholds.minTapTargetSize}px minimum)`,
        evidence: target
      });

      logger.bug('minor', `Small tap target: ${target.text} (${target.size.width}x${target.size.height}px)`);
    }

    return bugs;
  }

  /**
   * Detect page performance issues
   */
  async detectPerformanceIssues() {
    const bugs = [];

    try {
      const metrics = await this.page.evaluate(() => {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;

        return {
          loadTime,
          domReady: perfData.domContentLoadedEventEnd - perfData.navigationStart
        };
      });

      if (metrics.loadTime > CONFIG.bugThresholds.maxPageLoadTime) {
        bugs.push({
          type: 'slow-page-load',
          severity: 'minor',
          message: `Page load time: ${metrics.loadTime}ms (threshold: ${CONFIG.bugThresholds.maxPageLoadTime}ms)`,
          evidence: metrics
        });

        logger.bug('minor', `Slow page load: ${metrics.loadTime}ms`);
      }
    } catch (error) {
      // Performance metrics not available
    }

    return bugs;
  }

  /**
   * Test reliability of an action (repeat 3 times)
   */
  async testReliability(actionName, actionFn) {
    const results = [];

    for (let i = 0; i < 3; i++) {
      try {
        await actionFn();
        results.push(true);
      } catch (error) {
        results.push(false);
      }

      await this.page.waitForTimeout(1000);
    }

    const successRate = results.filter(r => r).length / results.length;

    if (successRate < 1.0 && successRate > 0) {
      return {
        type: 'unreliable-feature',
        severity: 'major',
        message: `${actionName} works only ${results.filter(r => r).length}/3 times (${Math.round(successRate * 100)}% success rate)`,
        evidence: {
          attempts: results.length,
          successes: results.filter(r => r).length,
          results
        }
      };
    }

    return null;
  }

  /**
   * Detect photo upload issues
   */
  async detectPhotoUploadIssues(activityType) {
    const bugs = [];

    try {
      // Wait for activity feed to render
      await this.page.waitForTimeout(2000);

      // Check if photo appears in the feed
      const hasPhoto = await this.page.evaluate((type) => {
        // Look for img elements in activity feed
        const activityItems = document.querySelectorAll('[class*="activity"], [class*="feed"]');

        for (const item of activityItems) {
          const text = item.textContent || '';
          if (text.includes(type)) {
            const img = item.querySelector('img');
            return img !== null;
          }
        }

        return false;
      }, activityType);

      if (!hasPhoto) {
        bugs.push({
          type: 'photo-upload-failed',
          severity: 'major',
          message: `Photo upload did not persist to activity feed for ${activityType}`,
          evidence: { activityType }
        });

        logger.bug('major', `Photo upload failed for ${activityType}`);
      }

    } catch (error) {
      bugs.push({
        type: 'photo-verification-error',
        severity: 'major',
        message: `Could not verify photo upload: ${error.message}`,
        evidence: { error: error.message }
      });
    }

    return bugs;
  }

  /**
   * Detect rapid action issues (data loss, race conditions)
   */
  async detectRapidActionIssues(actionType, expectedCount, actualCount) {
    const bugs = [];

    if (actualCount < expectedCount) {
      bugs.push({
        type: 'rapid-action-data-loss',
        severity: 'major',
        message: `Rapid ${actionType} logging lost data: Only ${actualCount}/${expectedCount} activities logged`,
        evidence: {
          expected: expectedCount,
          actual: actualCount,
          lost: expectedCount - actualCount
        }
      });

      logger.bug('major', `Data loss on rapid ${actionType}: ${actualCount}/${expectedCount} saved`);
    }

    return bugs;
  }

  /**
   * Detect broken navigation
   */
  async detectBrokenNavigation(expectedUrl) {
    const currentUrl = this.page.url();

    if (!currentUrl.includes(expectedUrl)) {
      return {
        type: 'broken-navigation',
        severity: 'critical',
        message: `Expected navigation to ${expectedUrl} but got ${currentUrl}`,
        evidence: {
          expected: expectedUrl,
          actual: currentUrl
        }
      };
    }

    return null;
  }

  /**
   * Detect UI layout issues
   */
  async detectLayoutIssues() {
    const bugs = [];

    try {
      const layoutIssues = await this.page.evaluate(() => {
        const issues = [];

        // Check for overlapping elements
        const elements = document.querySelectorAll('button, a, input');

        // Check for zero-size elements
        elements.forEach((el) => {
          const rect = el.getBoundingClientRect();

          if (rect.width === 0 || rect.height === 0) {
            const text = el.textContent?.trim() || el.getAttribute('aria-label') || '';
            if (text) {
              issues.push({
                type: 'zero-size-element',
                text: text.substring(0, 50),
                size: { width: rect.width, height: rect.height }
              });
            }
          }
        });

        return issues;
      });

      for (const issue of layoutIssues.slice(0, 3)) { // Report up to 3
        bugs.push({
          type: 'layout-issue',
          severity: 'ux',
          message: `Zero-size element: "${issue.text}" (${issue.size.width}x${issue.size.height}px)`,
          evidence: issue
        });

        logger.bug('ux', `Layout issue: ${issue.text} has zero size`);
      }

    } catch (error) {
      // Layout check failed
    }

    return bugs;
  }

  /**
   * Run all bug detection checks
   */
  async detectAll() {
    const allBugs = [];

    // Console errors
    allBugs.push(...await this.detectConsoleErrors());

    // Unexpected error messages
    allBugs.push(...await this.detectUnexpectedErrors());

    // Mobile UX issues
    allBugs.push(...await this.detectHorizontalScroll());
    allBugs.push(...await this.detectSmallTapTargets());

    // Performance
    allBugs.push(...await this.detectPerformanceIssues());

    // Layout
    allBugs.push(...await this.detectLayoutIssues());

    // Record all bugs
    for (const bug of allBugs) {
      this.stateTracker.recordBug(bug);
    }

    return allBugs;
  }
}

export default BugDetector;
