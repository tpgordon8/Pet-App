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
            class="mt-2 px-3 py-1.5 bg-white/20 hover:bg-white/30 dark:bg-black/20 dark:hover:bg-black/30 rounded-lg text-xs font-semibold transition-all touch-target"
          >
            {{ toast.action.label }}
          </button>
        </div>
        <button
          @click="remove(toast.id)"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors flex-shrink-0 touch-target"
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
    success: 'border-l-4 border-green-500 bg-green-50/90 dark:bg-green-900/30 text-green-900 dark:text-green-100',
    error: 'border-l-4 border-red-500 bg-red-50/90 dark:bg-red-900/30 text-red-900 dark:text-red-100',
    warning: 'border-l-4 border-yellow-500 bg-yellow-50/90 dark:bg-yellow-900/30 text-yellow-900 dark:text-yellow-100',
    info: 'border-l-4 border-sage-500 bg-sage-50/90 dark:bg-sage-900/30 text-sage-900 dark:text-sage-100'
  }
  return classes[type] || classes.info
}

function toastIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
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
</style>
