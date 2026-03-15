<template>
  <div id="app" :class="{ 'dark': isDarkMode }">
    <RouterView />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterView } from 'vue-router'

// Dark mode state (can be moved to a store later)
const isDarkMode = ref(false)

onMounted(() => {
  // Check system preference
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  isDarkMode.value = darkModeMediaQuery.matches

  // Listen for changes
  darkModeMediaQuery.addEventListener('change', (e) => {
    isDarkMode.value = e.matches
  })
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
