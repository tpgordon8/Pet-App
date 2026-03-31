import { ref } from 'vue'

// Global toast state (singleton pattern)
const toasts = ref([])
let toastId = 0

// Maximum number of toasts to show at once
const MAX_TOASTS = 3

export function useToast() {
  function show(message, type = 'info', duration = 3000, action = null) {
    const id = toastId++
    const toast = {
      id,
      message,
      type, // 'info', 'success', 'error', 'warning'
      duration,
      action // { label: 'Undo', handler: () => {} }
    }

    // Limit number of toasts (remove oldest if exceeds max)
    if (toasts.value.length >= MAX_TOASTS) {
      const oldestToast = toasts.value[0]
      remove(oldestToast.id)
    }

    toasts.value.push(toast)

    // Auto-remove after duration (unless action is present, then longer duration)
    const autoRemoveDuration = action ? Math.max(duration, 5000) : duration
    if (autoRemoveDuration > 0) {
      setTimeout(() => {
        remove(id)
      }, autoRemoveDuration)
    }

    return id
  }

  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function success(message, duration = 3000) {
    return show(message, 'success', duration)
  }

  function error(message, duration = 5000) {
    return show(message, 'error', duration)
  }

  function warning(message, duration = 4000) {
    return show(message, 'warning', duration)
  }

  function info(message, duration = 3000) {
    return show(message, 'info', duration)
  }

  function undo(message, undoHandler, duration = 5000) {
    return show(message, 'info', duration, {
      label: 'Undo',
      handler: undoHandler
    })
  }

  return {
    toasts,
    show,
    remove,
    success,
    error,
    warning,
    info,
    undo
  }
}
