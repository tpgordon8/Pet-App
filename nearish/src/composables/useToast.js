import { ref } from 'vue'

// Singleton — shared across all components
const toasts = ref([])
const pingToasts = ref([])
let nextId = 0

export function useToast() {
  function show(message, type = 'info', duration = 3500) {
    const id = ++nextId
    if (toasts.value.length >= 3) toasts.value.shift()
    toasts.value.push({ id, message, type })
    setTimeout(() => dismiss(id), duration)
  }

  function dismiss(id) {
    const i = toasts.value.findIndex(t => t.id === id)
    if (i > -1) toasts.value.splice(i, 1)
  }

  function showPing(from, message, duration = 7000) {
    const id = ++nextId
    pingToasts.value.push({ id, from, message, ts: Date.now() })
    setTimeout(() => dismissPing(id), duration)
  }

  function dismissPing(id) {
    const i = pingToasts.value.findIndex(t => t.id === id)
    if (i > -1) pingToasts.value.splice(i, 1)
  }

  return {
    toasts,
    pingToasts,
    success: (m) => show(m, 'success'),
    error: (m) => show(m, 'error', 5000),
    info: (m) => show(m, 'info'),
    showPing,
    dismiss,
    dismissPing,
  }
}
