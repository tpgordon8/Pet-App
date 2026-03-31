<template>
  <div
    id="app"
    :class="{ 'dark': themeStore.darkMode }"
  >
    <RouterView />
    <ToastContainer />
  </div>
</template>

<script setup>
import { onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import ToastContainer from './components/ToastContainer.vue'
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
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: background 0.3s ease;
}

#app.dark {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
}
</style>
