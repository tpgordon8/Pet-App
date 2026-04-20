<template>
  <div
    id="app"
    :class="{ 'dark': themeStore.darkMode }"
  >
    <OfflineIndicator />
    <PwaUpdatePrompt />
    <RouterView />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
import OfflineIndicator from './components/OfflineIndicator.vue'
import PwaUpdatePrompt from './components/PwaUpdatePrompt.vue'
import { useToast } from '@/composables/useToast'
import { useThemeStore } from '@/stores/theme'

const { showToast } = useToast()
const themeStore = useThemeStore()

// Global error boundary
onErrorCaptured((err, instance, info) => {
  console.error('Component error:', err, info)
  console.error('Component:', instance?.$options?.name || 'Unknown')

  // Show user-friendly error toast
  showToast('Something went wrong. Please refresh the page if the issue persists.', 'error')

  // In production, you could report to error tracking service (e.g., Sentry)
  // reportError(err, { component: instance?.$options?.name, info })

  // Return false to prevent error propagation
  return false
})
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  /* Warm sage-to-cream gradient with a breath of mint */
  background:
    linear-gradient(
      145deg,
      #f9fafb 0%,
      #f0f7ee 35%,
      #fdf6ff 65%,
      #fffbf0 100%
    );
  transition: background 0.4s ease;
}

#app.dark {
  /* Deep navy-charcoal with a subtle sage undertone */
  background:
    linear-gradient(
      145deg,
      #0d1117 0%,
      #111a14 35%,
      #12101a 65%,
      #14110a 100%
    );
}
</style>
