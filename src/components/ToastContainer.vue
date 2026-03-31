<template>
  <div class="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full px-4">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast glass-strong rounded-xl shadow-xl p-4 flex items-start gap-3 animate-in"
        :class="toastClass(toast.type)"
      >
        <span class="text-2xl flex-shrink-0">{{ toastIcon(toast.type) }}</span>
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
    success: 'border-l-4 border-emerald-500 bg-gradient-to-r from-emerald-50/95 to-emerald-100/80 dark:from-emerald-900/40 dark:to-emerald-800/30 text-emerald-900 dark:text-emerald-100',
    error: 'border-l-4 border-rose-500 bg-gradient-to-r from-rose-50/95 to-rose-100/80 dark:from-rose-900/40 dark:to-rose-800/30 text-rose-900 dark:text-rose-100',
    warning: 'border-l-4 border-amber-500 bg-gradient-to-r from-amber-50/95 to-amber-100/80 dark:from-amber-900/40 dark:to-amber-800/30 text-amber-900 dark:text-amber-100',
    info: 'border-l-4 border-sage-500 bg-gradient-to-r from-sage-50/95 to-sage-100/80 dark:from-sage-900/40 dark:to-sage-800/30 text-sage-900 dark:text-sage-100'
  }
  return classes[type] || classes.info
}

function toastIcon(type) {
  const icons = {
    success: '🎉',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }
  return icons[type] || icons.info
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
