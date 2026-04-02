/**
 * State tracker to prevent loops and record exploration history
 */
export class StateTracker {
  constructor() {
    this.visitedUrls = new Set();
    this.clickedElements = new Set();
    this.filledInputs = new Set();
    this.uploadedPhotos = new Set();
    this.loggedActivities = new Set();
    this.explorationHistory = [];
    this.bugs = [];
    this.consoleErrors = [];
    this.currentStep = 0;
  }

  /**
   * Record a visited URL
   */
  visitUrl(url) {
    this.visitedUrls.add(url);
  }

  /**
   * Check if URL has been visited
   */
  hasVisitedUrl(url) {
    return this.visitedUrls.has(url);
  }

  /**
   * Record a clicked element
   */
  clickElement(selector) {
    this.clickedElements.add(selector);
  }

  /**
   * Check if element has been clicked
   */
  hasClickedElement(selector) {
    return this.clickedElements.has(selector);
  }

  /**
   * Record a filled input
   */
  fillInput(selector, value) {
    const key = `${selector}:${value}`;
    this.filledInputs.add(key);
  }

  /**
   * Check if input has been filled with value
   */
  hasFilledInput(selector, value) {
    const key = `${selector}:${value}`;
    return this.filledInputs.has(key);
  }

  /**
   * Record photo upload
   */
  uploadPhoto(activityType) {
    this.uploadedPhotos.add(activityType);
  }

  /**
   * Check if photo uploaded for activity type
   */
  hasUploadedPhoto(activityType) {
    return this.uploadedPhotos.has(activityType);
  }

  /**
   * Record logged activity
   */
  logActivity(activityType) {
    this.loggedActivities.add(activityType);
  }

  /**
   * Check if activity has been logged
   */
  hasLoggedActivity(activityType) {
    return this.loggedActivities.has(activityType);
  }

  /**
   * Record exploration step
   */
  recordStep(stepData) {
    this.currentStep++;
    this.explorationHistory.push({
      stepNumber: this.currentStep,
      timestamp: new Date().toISOString(),
      ...stepData
    });
  }

  /**
   * Record a bug
   */
  recordBug(bug) {
    this.bugs.push({
      ...bug,
      timestamp: new Date().toISOString(),
      stepNumber: this.currentStep
    });
  }

  /**
   * Record console error
   */
  recordConsoleError(error) {
    this.consoleErrors.push({
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      stepNumber: this.currentStep
    });
  }

  /**
   * Get unique bugs (deduplicate by type + message)
   */
  getUniqueBugs() {
    const seen = new Set();
    return this.bugs.filter(bug => {
      const key = `${bug.type}:${bug.message}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  /**
   * Get bugs by severity
   */
  getBugsBySeverity() {
    const bugs = this.getUniqueBugs();
    return {
      critical: bugs.filter(b => b.severity === 'critical'),
      major: bugs.filter(b => b.severity === 'major'),
      minor: bugs.filter(b => b.severity === 'minor'),
      ux: bugs.filter(b => b.severity === 'ux')
    };
  }

  /**
   * Get exploration summary
   */
  getSummary() {
    return {
      totalSteps: this.currentStep,
      visitedUrls: this.visitedUrls.size,
      clickedElements: this.clickedElements.size,
      filledInputs: this.filledInputs.size,
      uploadedPhotos: this.uploadedPhotos.size,
      loggedActivities: this.loggedActivities.size,
      bugsFound: this.getUniqueBugs().length,
      consoleErrors: this.consoleErrors.length
    };
  }

  /**
   * Export full state for reporting
   */
  exportState() {
    return {
      summary: this.getSummary(),
      bugs: this.getUniqueBugs(),
      bugsBySeverity: this.getBugsBySeverity(),
      consoleErrors: this.consoleErrors,
      explorationHistory: this.explorationHistory,
      visitedUrls: Array.from(this.visitedUrls),
      clickedElements: Array.from(this.clickedElements)
    };
  }
}

export default StateTracker;
