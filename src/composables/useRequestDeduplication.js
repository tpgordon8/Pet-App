/**
 * Request Deduplication Composable
 * Prevents duplicate requests and provides caching
 */

import { ref } from 'vue'

// Global cache for all requests
const requestCache = new Map()
const pendingRequests = new Map()

/**
 * Create a request deduplicator
 * @param {Object} options - Configuration options
 * @returns {Object} Request utilities
 */
export function useRequestDeduplication(options = {}) {
  const {
    cacheTime = 60000, // Cache results for 1 minute by default
    maxCacheSize = 100 // Max cache entries
  } = options

  /**
   * Execute a request with deduplication
   * @param {string} key - Unique key for this request
   * @param {Function} requestFn - Async function that performs the request
   * @param {Object} opts - Per-request options
   * @returns {Promise<*>} Request result
   */
  async function dedupe(key, requestFn, opts = {}) {
    const {
      bypassCache = false,
      cacheTimeOverride = cacheTime
    } = opts

    // Check cache first (unless bypassing)
    if (!bypassCache) {
      const cached = getFromCache(key)
      if (cached) {
        return cached.data
      }
    }

    // Check if request already in flight
    if (pendingRequests.has(key)) {
      // Return existing promise
      return await pendingRequests.get(key)
    }

    // Execute request
    const promise = (async () => {
      try {
        const result = await requestFn()

        // Cache result
        setCache(key, result, cacheTimeOverride)

        return result
      } finally {
        // Clean up pending request
        pendingRequests.delete(key)
      }
    })()

    // Store pending request
    pendingRequests.set(key, promise)

    return await promise
  }

  /**
   * Get item from cache
   * @param {string} key - Cache key
   * @returns {*} Cached data or null
   */
  function getFromCache(key) {
    const cached = requestCache.get(key)

    if (!cached) return null

    // Check if expired
    if (Date.now() > cached.expiresAt) {
      requestCache.delete(key)
      return null
    }

    return cached
  }

  /**
   * Set item in cache
   * @param {string} key - Cache key
   * @param {*} data - Data to cache
   * @param {number} ttl - Time to live in ms
   */
  function setCache(key, data, ttl = cacheTime) {
    // Enforce cache size limit (remove oldest)
    if (requestCache.size >= maxCacheSize) {
      const firstKey = requestCache.keys().next().value
      requestCache.delete(firstKey)
    }

    requestCache.set(key, {
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttl
    })
  }

  /**
   * Invalidate cache entry
   * @param {string} key - Cache key
   */
  function invalidate(key) {
    requestCache.delete(key)
  }

  /**
   * Invalidate all cache entries matching pattern
   * @param {RegExp|string} pattern - Pattern to match
   */
  function invalidatePattern(pattern) {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern

    for (const key of requestCache.keys()) {
      if (regex.test(key)) {
        requestCache.delete(key)
      }
    }
  }

  /**
   * Clear all cache
   */
  function clearCache() {
    requestCache.clear()
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  function getCacheStats() {
    return {
      size: requestCache.size,
      maxSize: maxCacheSize,
      pending: pendingRequests.size
    }
  }

  return {
    dedupe,
    getFromCache,
    setCache,
    invalidate,
    invalidatePattern,
    clearCache,
    getCacheStats
  }
}

/**
 * Debounce function calls
 * @param {Function} fn - Function to debounce
 * @param {number} delay - Delay in ms
 * @returns {Function} Debounced function
 */
export function debounce(fn, delay = 300) {
  let timeoutId = null

  const debounced = function (...args) {
    clearTimeout(timeoutId)

    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(fn.apply(this, args))
      }, delay)
    })
  }

  debounced.cancel = () => {
    clearTimeout(timeoutId)
  }

  return debounced
}

/**
 * Throttle function calls
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Delay in ms
 * @returns {Function} Throttled function
 */
export function throttle(fn, delay = 300) {
  let lastCall = 0

  return function (...args) {
    const now = Date.now()

    if (now - lastCall < delay) {
      return
    }

    lastCall = now
    return fn.apply(this, args)
  }
}

/**
 * Rate limiter
 * Limits function calls to N times per time window
 */
export function useRateLimiter(maxCalls = 10, windowMs = 60000) {
  const calls = ref([])

  /**
   * Check if action is allowed
   * @returns {boolean} True if action allowed
   */
  function isAllowed() {
    const now = Date.now()
    const windowStart = now - windowMs

    // Remove old calls outside window
    calls.value = calls.value.filter(time => time > windowStart)

    // Check if under limit
    return calls.value.length < maxCalls
  }

  /**
   * Record a call
   * @throws {Error} If rate limit exceeded
   */
  function recordCall() {
    if (!isAllowed()) {
      throw new Error(`Rate limit exceeded: ${maxCalls} calls per ${windowMs}ms`)
    }

    calls.value.push(Date.now())
  }

  /**
   * Execute function with rate limiting
   * @param {Function} fn - Function to execute
   * @returns {Promise<*>} Function result
   */
  async function execute(fn) {
    recordCall()
    return await fn()
  }

  return {
    isAllowed,
    recordCall,
    execute,
    remainingCalls: () => maxCalls - calls.value.length
  }
}
