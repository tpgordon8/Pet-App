/**
 * Pagination Composable
 * Provides infinite scroll and pagination logic
 */

import { ref, computed } from 'vue'

/**
 * Create a paginated list
 * @param {Array} items - Full list of items
 * @param {Object} options - Pagination options
 * @returns {Object} Pagination utilities
 */
export function usePagination(items, options = {}) {
  const {
    initialPageSize = 50,
    loadMoreSize = 25
  } = options

  const currentPage = ref(1)
  const pageSize = ref(initialPageSize)

  const paginatedItems = computed(() => {
    const itemsToShow = pageSize.value
    return items.value.slice(0, itemsToShow)
  })

  const hasMore = computed(() => {
    return paginatedItems.value.length < items.value.length
  })

  const remainingCount = computed(() => {
    return Math.max(0, items.value.length - paginatedItems.value.length)
  })

  function loadMore() {
    if (hasMore.value) {
      pageSize.value += loadMoreSize
    }
  }

  function reset() {
    currentPage.value = 1
    pageSize.value = initialPageSize
  }

  function loadAll() {
    pageSize.value = items.value.length
  }

  return {
    paginatedItems,
    hasMore,
    remainingCount,
    loadMore,
    reset,
    loadAll,
    currentPageSize: pageSize
  }
}

/**
 * Infinite scroll with Intersection Observer
 * @param {Function} loadMore - Function to call when scrolled to bottom
 * @param {Object} options - Options
 * @returns {Object} Infinite scroll utilities
 */
export function useInfiniteScroll(loadMore, options = {}) {
  const {
    threshold = 0.8, // Trigger when 80% visible
    rootMargin = '100px' // Load 100px before reaching end
  } = options

  const observerTarget = ref(null)
  let observer = null

  function setupObserver() {
    if (observer) {
      observer.disconnect()
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loadMore()
          }
        })
      },
      {
        threshold,
        rootMargin
      }
    )

    if (observerTarget.value) {
      observer.observe(observerTarget.value)
    }
  }

  function cleanup() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  return {
    observerTarget,
    setupObserver,
    cleanup
  }
}
