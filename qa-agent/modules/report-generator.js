import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { format } from 'date-fns';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const reportsDir = path.join(__dirname, '..', 'reports');

/**
 * Generate comprehensive test reports
 */
export class ReportGenerator {
  constructor(stateTracker, config) {
    this.stateTracker = stateTracker;
    this.config = config;
  }

  /**
   * Generate final report (text + JSON)
   */
  async generateFinalReport() {
    const state = this.stateTracker.exportState();
    const timestamp = new Date();

    // Generate text report
    const textReport = this.generateTextReport(state, timestamp);
    await fs.writeFile(
      path.join(reportsDir, 'final-report.txt'),
      textReport,
      'utf-8'
    );

    // Generate JSON report
    const jsonReport = this.generateJsonReport(state, timestamp);
    await fs.writeFile(
      path.join(reportsDir, 'bugs.json'),
      JSON.stringify(jsonReport, null, 2),
      'utf-8'
    );

    // Generate exploration log
    await fs.writeFile(
      path.join(reportsDir, 'exploration-log.json'),
      JSON.stringify(state.explorationHistory, null, 2),
      'utf-8'
    );

    return {
      textReportPath: path.join(reportsDir, 'final-report.txt'),
      jsonReportPath: path.join(reportsDir, 'bugs.json'),
      logPath: path.join(reportsDir, 'exploration-log.json')
    };
  }

  /**
   * Generate human-readable text report
   */
  generateTextReport(state, timestamp) {
    const { summary, bugsBySeverity } = state;
    const totalBugs = summary.bugsFound;

    const lines = [];

    // Header
    lines.push('═'.repeat(70));
    lines.push('   AUTONOMOUS QA TESTING REPORT - PET-APP');
    lines.push('═'.repeat(70));
    lines.push('');
    lines.push(`Test Run: ${format(timestamp, 'yyyy-MM-dd HH:mm:ss')}`);
    lines.push(`URL: ${this.config.baseUrl}`);
    lines.push(`Total Steps: ${summary.totalSteps}`);
    lines.push(`Device: ${this.config.device.name} (${this.config.device.viewport.width}x${this.config.device.viewport.height})`);
    lines.push('');

    // Summary
    lines.push('─'.repeat(70));
    lines.push('EXPLORATION SUMMARY');
    lines.push('─'.repeat(70));
    lines.push(`URLs Visited: ${summary.visitedUrls}`);
    lines.push(`Buttons Clicked: ${summary.clickedElements}`);
    lines.push(`Inputs Filled: ${summary.filledInputs}`);
    lines.push(`Activities Logged: ${summary.loggedActivities}`);
    lines.push(`Photos Uploaded: ${summary.uploadedPhotos}`);
    lines.push(`Console Errors: ${summary.consoleErrors}`);
    lines.push('');

    // Bugs Found
    lines.push('─'.repeat(70));
    lines.push(`BUGS FOUND: ${totalBugs}`);
    lines.push('─'.repeat(70));
    lines.push('');

    if (totalBugs === 0) {
      lines.push('✅ No bugs detected! The application appears to be working correctly.');
      lines.push('');
      lines.push('This is excellent news. The autonomous testing agent explored the');
      lines.push('application thoroughly without finding critical issues.');
      lines.push('');
    } else {
      lines.push(`🔴 Critical: ${bugsBySeverity.critical.length}`);
      lines.push(`🟠 Major: ${bugsBySeverity.major.length}`);
      lines.push(`🟡 Minor: ${bugsBySeverity.minor.length}`);
      lines.push(`📱 UX Issues: ${bugsBySeverity.ux.length}`);
      lines.push('');

      // Critical bugs
      if (bugsBySeverity.critical.length > 0) {
        lines.push('🔴 CRITICAL BUGS:');
        lines.push('');
        bugsBySeverity.critical.forEach((bug, index) => {
          lines.push(`${index + 1}. ${bug.type}`);
          lines.push(`   Message: ${bug.message}`);
          lines.push(`   Step: ${bug.stepNumber}`);
          lines.push(`   Evidence: ${JSON.stringify(bug.evidence, null, 2).split('\n').join('\n   ')}`);
          lines.push('');
        });
      }

      // Major bugs
      if (bugsBySeverity.major.length > 0) {
        lines.push('🟠 MAJOR BUGS:');
        lines.push('');
        bugsBySeverity.major.forEach((bug, index) => {
          lines.push(`${index + 1}. ${bug.type}`);
          lines.push(`   Message: ${bug.message}`);
          lines.push(`   Step: ${bug.stepNumber}`);
          lines.push('');
        });
      }

      // Minor bugs
      if (bugsBySeverity.minor.length > 0) {
        lines.push('🟡 MINOR BUGS:');
        lines.push('');
        bugsBySeverity.minor.forEach((bug, index) => {
          lines.push(`${index + 1}. ${bug.type}`);
          lines.push(`   Message: ${bug.message}`);
          lines.push('');
        });
      }

      // UX issues
      if (bugsBySeverity.ux.length > 0) {
        lines.push('📱 MOBILE UX ISSUES:');
        lines.push('');
        bugsBySeverity.ux.forEach((bug, index) => {
          lines.push(`${index + 1}. ${bug.type}`);
          lines.push(`   Message: ${bug.message}`);
          lines.push('');
        });
      }
    }

    // Recommendations
    lines.push('═'.repeat(70));
    lines.push('RECOMMENDATIONS');
    lines.push('═'.repeat(70));
    lines.push('');

    if (totalBugs > 0) {
      const recommendations = this.generateRecommendations(bugsBySeverity);
      recommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
    } else {
      lines.push('1. Continue monitoring production for edge cases');
      lines.push('2. Consider expanding test coverage to more devices');
      lines.push('3. Add automated regression tests for critical flows');
      lines.push('4. Monitor Firebase performance and costs');
    }

    lines.push('');
    lines.push('═'.repeat(70));
    lines.push(`Report generated: ${format(timestamp, 'yyyy-MM-dd HH:mm:ss')}`);
    lines.push('═'.repeat(70));

    return lines.join('\n');
  }

  /**
   * Generate structured JSON report
   */
  generateJsonReport(state, timestamp) {
    return {
      timestamp: timestamp.toISOString(),
      testRun: {
        url: this.config.baseUrl,
        device: this.config.device.name,
        viewport: this.config.device.viewport,
        maxSteps: this.config.maxSteps
      },
      summary: state.summary,
      bugs: {
        total: state.summary.bugsFound,
        bySeverity: {
          critical: state.bugsBySeverity.critical.length,
          major: state.bugsBySeverity.major.length,
          minor: state.bugsBySeverity.minor.length,
          ux: state.bugsBySeverity.ux.length
        },
        details: state.bugs
      },
      consoleErrors: state.consoleErrors,
      exploration: {
        visitedUrls: state.visitedUrls,
        totalSteps: state.summary.totalSteps
      }
    };
  }

  /**
   * Generate actionable recommendations based on bugs found
   */
  generateRecommendations(bugsBySeverity) {
    const recommendations = [];

    // Critical bugs
    if (bugsBySeverity.critical.length > 0) {
      const hasJsErrors = bugsBySeverity.critical.some(b => b.type === 'javascript-error');
      if (hasJsErrors) {
        recommendations.push('Fix JavaScript errors - add null checks and error boundaries');
      }

      const hasUnexpectedErrors = bugsBySeverity.critical.some(b => b.type === 'unexpected-error');
      if (hasUnexpectedErrors) {
        recommendations.push('Improve error handling - show user-friendly validation messages');
      }
    }

    // Major bugs
    if (bugsBySeverity.major.length > 0) {
      const hasPhotoIssues = bugsBySeverity.major.some(b => b.type === 'photo-upload-failed');
      if (hasPhotoIssues) {
        recommendations.push('Verify photo upload: check Firebase Storage integration and compression logic');
      }

      const hasDataLoss = bugsBySeverity.major.some(b => b.type === 'rapid-action-data-loss');
      if (hasDataLoss) {
        recommendations.push('Implement debouncing/throttling for rapid activity logging to prevent race conditions');
      }

      const hasHorizontalScroll = bugsBySeverity.major.some(b => b.type === 'horizontal-scroll');
      if (hasHorizontalScroll) {
        recommendations.push('Fix horizontal scroll: review CSS for viewport overflow on mobile');
      }
    }

    // Minor bugs
    if (bugsBySeverity.minor.length > 0) {
      const hasSmallTargets = bugsBySeverity.minor.some(b => b.type === 'small-tap-target');
      if (hasSmallTargets) {
        recommendations.push('Increase button sizes to meet minimum 44x44px tap target for mobile accessibility');
      }

      const hasPerformance = bugsBySeverity.minor.some(b => b.type === 'slow-page-load');
      if (hasPerformance) {
        recommendations.push('Optimize page load performance: consider code splitting and lazy loading');
      }
    }

    // UX issues
    if (bugsBySeverity.ux.length > 0) {
      recommendations.push('Review layout issues: fix zero-size elements and overlapping components');
    }

    // General recommendations
    if (recommendations.length === 0) {
      recommendations.push('No critical issues found - application is in good shape!');
    }

    return recommendations;
  }

  /**
   * Generate summary for console output
   */
  generateConsoleSummary(state) {
    const { summary, bugsBySeverity } = state;
    const totalBugs = summary.bugsFound;

    const lines = [];
    lines.push('');
    lines.push('═'.repeat(60));
    lines.push('  TEST SUMMARY');
    lines.push('═'.repeat(60));
    lines.push(`Total Steps: ${summary.totalSteps}`);
    lines.push(`Activities Logged: ${summary.loggedActivities}`);
    lines.push(`Photos Uploaded: ${summary.uploadedPhotos}`);
    lines.push('');
    lines.push(`BUGS FOUND: ${totalBugs}`);
    lines.push(`  Critical: ${bugsBySeverity.critical.length}`);
    lines.push(`  Major: ${bugsBySeverity.major.length}`);
    lines.push(`  Minor: ${bugsBySeverity.minor.length}`);
    lines.push(`  UX: ${bugsBySeverity.ux.length}`);
    lines.push('═'.repeat(60));

    return lines.join('\n');
  }
}

export default ReportGenerator;
