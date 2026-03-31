import { ref } from 'vue'

/**
 * Pull-to-refresh composable for mobile touch gestures
 * Provides pull-to-refresh functionality similar to native mobile apps
 *
 * @param {Function} onRefresh - Async callback function to execute on refresh
 * @param {Object} options - Configuration options
 * @returns {Object} - Reactive state and handlers
 */
export function usePullToRefresh(onRefresh, options = {}) {
  const {
    threshold = 80, // Distance in pixels to trigger refresh
    maxPull = 120, // Maximum pull distance
    resistance = 2.5 // Pull resistance factor (higher = more resistance)
  } = options

  const isPulling = ref(false)
  const isRefreshing = ref(false)
  const pullDistance = ref(0)
  const pullProgress = ref(0) // 0-1 progress indicator

  let startY = 0
  let currentY = 0
  let scrollContainer = null

  const handleTouchStart = (e) => {
    // Only allow pull-to-refresh when scrolled to top
    if (scrollContainer && scrollContainer.scrollTop === 0) {
      startY = e.touches[0].pageY
      currentY = startY
    }
  }

  const handleTouchMove = (e) => {
    if (startY === 0 || scrollContainer.scrollTop > 0 || isRefreshing.value) {
      return
    }

    currentY = e.touches[0].pageY
    const diff = currentY - startY

    // Only track downward pulls
    if (diff > 0) {
      isPulling.value = true

      // Apply resistance to pull distance
      const resistedPull = Math.min(diff / resistance, maxPull)
      pullDistance.value = resistedPull
      pullProgress.value = Math.min(resistedPull / threshold, 1)

      // Prevent default scroll behavior while pulling
      if (diff > 10) {
        e.preventDefault()
      }
    }
  }

  const handleTouchEnd = async () => {
    if (!isPulling.value || isRefreshing.value) {
      reset()
      return
    }

    // Trigger refresh if pulled past threshold
    if (pullDistance.value >= threshold) {
      isRefreshing.value = true
      isPulling.value = false
      pullDistance.value = threshold // Lock at threshold during refresh

      try {
        await onRefresh()
      } catch (error) {
        console.error('Pull-to-refresh error:', error)
      } finally {
        setTimeout(() => {
          reset()
        }, 500) // Keep indicator visible briefly
      }
    } else {
      // Not pulled far enough, just reset
      reset()
    }
  }

  const reset = () => {
    isPulling.value = false
    isRefreshing.value = false
    pullDistance.value = 0
    pullProgress.value = 0
    startY = 0
    currentY = 0
  }

  const setupListeners = (element) => {
    if (!element) return

    scrollContainer = element
    element.addEventListener('touchstart', handleTouchStart, { passive: true })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: true })
  }

  const removeListeners = (element) => {
    if (!element) return

    element.removeEventListener('touchstart', handleTouchStart)
    element.removeEventListener('touchmove', handleTouchMove)
    element.removeEventListener('touchend', handleTouchEnd)
  }

  return {
    isPulling,
    isRefreshing,
    pullDistance,
    pullProgress,
    setupListeners,
    removeListeners
  }
}
