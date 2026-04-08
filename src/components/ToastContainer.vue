<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full px-4">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast rounded-xl shadow-sm p-4 flex items-start gap-3 animate-in border"
        :class="toastClass(toast.type)"
        role="alert"
        :aria-live="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <span class="flex-shrink-0 mt-0.5" :aria-label="toastAriaLabel(toast.type)">
          <component :is="toastIconComponent(toast.type)" :size="18" aria-hidden="true" />
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium">{{ toast.message }}</p>
          <button
            v-if="toast.action"
            @click="handleAction(toast)"
            class="mt-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 rounded-lg text-xs font-semibold transition-all motion-reduce:transition-none touch-target"
          >
            {{ toast.action.label }}
          </button>
        </div>
        <button
          @click="remove(toast.id)"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors motion-reduce:transition-none flex-shrink-0 touch-target"
          aria-label="Dismiss notification"
          title="Dismiss"
        >
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-vue-next'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()

function handleAction(toast) {
  if (toast.action && toast.action.handler) {
    toast.action.handler()
    remove(toast.id)
  }
}

function toastClass(type) {
  const classes = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950 dark:border-emerald-800 dark:text-emerald-100',
    error: 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-950 dark:border-rose-800 dark:text-rose-100',
    warning: 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-100',
    info: 'bg-sage-50 border-sage-200 text-sage-900 dark:bg-sage-900 dark:border-sage-700 dark:text-sage-100'
  }
  return classes[type] || classes.info
}

function toastIconComponent(type) {
  const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info }
  return icons[type] || Info
}

function toastAriaLabel(type) {
  const labels = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' }
  return labels[type] || 'Notification'
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.8);
}

/* Accessibility: Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: none;
  }
}
</style>
