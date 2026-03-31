/**
 * Keyboard Shortcuts Composable
 * Provides global keyboard shortcuts for better accessibility and power user UX
 */

import { onMounted, onUnmounted } from 'vue'

/**
 * Register keyboard shortcuts
 * @param {Object} shortcuts - Map of key combinations to handlers
 * @param {Object} options - Configuration options
 */
export function useKeyboardShortcuts(shortcuts = {}, options = {}) {
  const {
    preventDefault = true,
    disabled = false
  } = options

  function handleKeyDown(event) {
    if (disabled) return

    // Build key combination string
    const keys = []
    if (event.ctrlKey || event.metaKey) keys.push('ctrl')
    if (event.shiftKey) keys.push('shift')
    if (event.altKey) keys.push('alt')
    keys.push(event.key.toLowerCase())

    const combination = keys.join('+')

    // Check if shortcut exists
    const handler = shortcuts[combination]
    if (handler) {
      if (preventDefault) {
        event.preventDefault()
      }
      handler(event)
    }
  }

  onMounted(() => {
    document.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })

  return {
    // Can expose methods to dynamically add/remove shortcuts if needed
  }
}

/**
 * Check if element is an input field (should skip shortcuts)
 * @param {Element} element - DOM element
 * @returns {boolean} True if element is input
 */
export function isInputElement(element) {
  if (!element) return false

  const tagName = element.tagName.toLowerCase()
  const isEditable = element.isContentEditable

  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    isEditable
  )
}

/**
 * Global keyboard shortcuts for the app
 * Use this in main app component
 */
export function useGlobalKeyboardShortcuts() {
  const shortcuts = {
    // Search
    'ctrl+k': (e) => {
      if (isInputElement(e.target)) return

      // Focus search input if exists
      const searchInput = document.querySelector('[data-search-input]') ||
                         document.querySelector('input[type="search"]') ||
                         document.querySelector('input[placeholder*="Search"]')

      if (searchInput) {
        searchInput.focus()
      }
    },

    // Escape key to close modals / clear search
    'escape': (e) => {
      // Clear search if focused
      if (isInputElement(e.target) && e.target.value) {
        e.target.value = ''
        e.target.dispatchEvent(new Event('input', { bubbles: true }))
        return
      }

      // Close modal if open (emit custom event)
      document.dispatchEvent(new CustomEvent('closeModal'))
    },

    // Quick actions (if not in input)
    'ctrl+n': (e) => {
      if (isInputElement(e.target)) return

      // Trigger "new activity" action
      document.dispatchEvent(new CustomEvent('quickAction', {
        detail: { action: 'newActivity' }
      }))
    },

    'ctrl+shift+p': (e) => {
      if (isInputElement(e.target)) return

      // Open command palette / settings
      document.dispatchEvent(new CustomEvent('openSettings'))
    },

    // Navigation
    'ctrl+1': (e) => {
      if (isInputElement(e.target)) return

      // Navigate to dashboard
      document.dispatchEvent(new CustomEvent('navigate', {
        detail: { to: 'dashboard' }
      }))
    },

    // Help
    'shift+?': (e) => {
      if (isInputElement(e.target)) return

      // Show keyboard shortcuts help
      document.dispatchEvent(new CustomEvent('showKeyboardHelp'))
    },

    // Refresh
    'ctrl+r': () => {
      // Let browser handle this (native refresh)
      // Just document it in help
    }
  }

  useKeyboardShortcuts(shortcuts, {
    preventDefault: true
  })
}

/**
 * Format keyboard shortcut for display
 * @param {string} shortcut - Shortcut string (e.g., "ctrl+k")
 * @returns {string} Formatted shortcut for display
 */
export function formatShortcut(shortcut) {
  const isMac = /Mac|iPhone|iPod|iPad/i.test(navigator.platform)

  return shortcut
    .split('+')
    .map(key => {
      switch (key.toLowerCase()) {
        case 'ctrl':
          return isMac ? '⌘' : 'Ctrl'
        case 'shift':
          return isMac ? '⇧' : 'Shift'
        case 'alt':
          return isMac ? '⌥' : 'Alt'
        case 'escape':
          return 'Esc'
        default:
          return key.toUpperCase()
      }
    })
    .join(isMac ? '' : '+')
}

/**
 * List of all available shortcuts with descriptions
 */
export const KEYBOARD_SHORTCUTS = [
  { keys: 'ctrl+k', description: 'Focus search', category: 'Navigation' },
  { keys: 'escape', description: 'Close modal / Clear search', category: 'General' },
  { keys: 'ctrl+n', description: 'New activity', category: 'Actions' },
  { keys: 'ctrl+shift+p', description: 'Open settings', category: 'Navigation' },
  { keys: 'ctrl+1', description: 'Go to dashboard', category: 'Navigation' },
  { keys: 'shift+?', description: 'Show keyboard shortcuts', category: 'Help' },
  { keys: 'ctrl+r', description: 'Refresh page', category: 'General' }
]
