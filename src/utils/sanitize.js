/**
 * Input Sanitization Utility
 * Protects against XSS and injection attacks
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML string
 * Removes dangerous HTML/JavaScript while preserving safe formatting
 * @param {string} dirty - Potentially unsafe HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} Sanitized HTML string
 */
export function sanitizeHtml(dirty, options = {}) {
  if (!dirty || typeof dirty !== 'string') return ''

  const defaultOptions = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    ...options
  }

  return DOMPurify.sanitize(dirty, defaultOptions)
}

/**
 * Sanitize plain text (strip all HTML)
 * Use for user input that should never contain HTML
 * @param {string} dirty - Potentially unsafe string
 * @returns {string} Plain text with HTML stripped
 */
export function sanitizeText(dirty) {
  if (!dirty || typeof dirty !== 'string') return ''

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  })
}

/**
 * Sanitize user input for safe display
 * This is the main function to use for user-generated content
 * @param {string} input - User input string
 * @param {Object} options - Sanitization options
 * @returns {string} Sanitized string
 */
export function sanitizeUserInput(input, options = {}) {
  if (!input || typeof input !== 'string') return ''

  const {
    allowBasicFormatting = false,
    maxLength = null,
    trim = true
  } = options

  let cleaned = input

  // Trim whitespace if requested
  if (trim) {
    cleaned = cleaned.trim()
  }

  // Apply length limit
  if (maxLength && cleaned.length > maxLength) {
    cleaned = cleaned.substring(0, maxLength)
  }

  // Sanitize HTML
  if (allowBasicFormatting) {
    cleaned = sanitizeHtml(cleaned)
  } else {
    cleaned = sanitizeText(cleaned)
  }

  return cleaned
}

/**
 * Sanitize activity notes
 * Allows basic formatting but enforces length limit
 * @param {string} notes - Activity notes from user
 * @returns {string} Sanitized notes
 */
export function sanitizeActivityNotes(notes) {
  return sanitizeUserInput(notes, {
    allowBasicFormatting: false,
    maxLength: 500, // Increased from 200 for better UX
    trim: true
  })
}

/**
 * Sanitize pet name
 * No HTML, reasonable length limit
 * @param {string} name - Pet name from user
 * @returns {string} Sanitized name
 */
export function sanitizePetName(name) {
  return sanitizeUserInput(name, {
    allowBasicFormatting: false,
    maxLength: 50,
    trim: true
  })
}

/**
 * Sanitize household name
 * No HTML, reasonable length limit
 * @param {string} name - Household name from user
 * @returns {string} Sanitized name
 */
export function sanitizeHouseholdName(name) {
  return sanitizeUserInput(name, {
    allowBasicFormatting: false,
    maxLength: 100,
    trim: true
  })
}

/**
 * Sanitize member name
 * No HTML, reasonable length limit
 * @param {string} name - Member name from user
 * @returns {string} Sanitized name
 */
export function sanitizeMemberName(name) {
  return sanitizeUserInput(name, {
    allowBasicFormatting: false,
    maxLength: 50,
    trim: true
  })
}

/**
 * Sanitize search query
 * Prevents XSS in search functionality
 * @param {string} query - Search query from user
 * @returns {string} Sanitized query
 */
export function sanitizeSearchQuery(query) {
  return sanitizeUserInput(query, {
    allowBasicFormatting: false,
    maxLength: 200,
    trim: true
  })
}

/**
 * Escape HTML entities
 * Fallback for environments where DOMPurify isn't available
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export function escapeHtml(str) {
  if (!str || typeof str !== 'string') return ''

  const htmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  }

  return str.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char])
}

/**
 * Validate and sanitize URL
 * Only allows http, https, and mailto protocols
 * @param {string} url - URL to sanitize
 * @returns {string|null} Sanitized URL or null if invalid
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return null

  const trimmed = url.trim()

  // Check for allowed protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:']
  try {
    const urlObj = new URL(trimmed)
    if (allowedProtocols.includes(urlObj.protocol)) {
      return trimmed
    }
  } catch (e) {
    // Invalid URL
    return null
  }

  return null
}
