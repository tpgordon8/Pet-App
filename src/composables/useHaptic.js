/**
 * Composable for haptic feedback on mobile devices
 * Provides different vibration patterns for various interactions
 */

export function useHaptic() {
  const isSupported = 'vibrate' in navigator

  /**
   * Light tap feedback (10ms)
   * Use for: button presses, selection changes
   */
  function light() {
    if (isSupported) {
      navigator.vibrate(10)
    }
  }

  /**
   * Medium feedback (15ms)
   * Use for: successful actions, confirmations
   */
  function medium() {
    if (isSupported) {
      navigator.vibrate(15)
    }
  }

  /**
   * Heavy feedback (25ms)
   * Use for: important events, errors, deletions
   */
  function heavy() {
    if (isSupported) {
      navigator.vibrate(25)
    }
  }

  /**
   * Success pattern (short-pause-short)
   * Use for: successful save, activity logged
   */
  function success() {
    if (isSupported) {
      navigator.vibrate([15, 50, 15])
    }
  }

  /**
   * Warning pattern (long-pause-long)
   * Use for: warnings, important notices
   */
  function warning() {
    if (isSupported) {
      navigator.vibrate([25, 100, 25])
    }
  }

  /**
   * Error pattern (three short pulses)
   * Use for: errors, failed actions
   */
  function error() {
    if (isSupported) {
      navigator.vibrate([10, 50, 10, 50, 10])
    }
  }

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    warning,
    error
  }
}
