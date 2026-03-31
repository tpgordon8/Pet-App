<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="viewBox"
    :class="['app-icon', colorClass]"
    :style="{ color: customColor }"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Activity Icons -->
    <g v-if="name === 'paw'">
      <path
        d="M12 18.5C12 19.328 11.328 20 10.5 20C9.672 20 9 19.328 9 18.5C9 17.672 9.672 17 10.5 17C11.328 17 12 17.672 12 18.5ZM7.5 15C8.328 15 9 14.328 9 13.5C9 12.672 8.328 12 7.5 12C6.672 12 6 12.672 6 13.5C6 14.328 6.672 15 7.5 15ZM13.5 17C14.328 17 15 16.328 15 15.5C15 14.672 14.328 14 13.5 14C12.672 14 12 14.672 12 15.5C12 16.328 12.672 17 13.5 17ZM16.5 15C17.328 15 18 14.328 18 13.5C18 12.672 17.328 12 16.5 12C15.672 12 15 12.672 15 13.5C15 14.328 15.672 15 16.5 15ZM12 13.5C12 15.433 10.433 17 8.5 17C6.567 17 5 15.433 5 13.5C5 11.567 6.567 10 8.5 10C10.433 10 12 11.567 12 13.5ZM19 13.5C19 15.433 17.433 17 15.5 17C13.567 17 12 15.433 12 13.5C12 11.567 13.567 10 15.5 10C17.433 10 19 11.567 19 13.5Z"
      />
    </g>

    <g v-else-if="name === 'chart-bar'">
      <path
        d="M3 13h2v6H3v-6zm4-4h2v10H7V9zm4-6h2v16h-2V3zm4 9h2v7h-2v-7z"
      />
    </g>

    <g v-else-if="name === 'trend-up'">
      <path
        d="M13 7h7v7h-2V9.414l-6.293 6.293a1 1 0 01-1.414 0L7 12.414l-4.293 4.293-1.414-1.414L7 9.586l3.293 3.293L16.586 7H13z"
      />
    </g>

    <g v-else-if="name === 'trend-down'">
      <path
        d="M13 17h7v-7h-2v4.586l-6.293-6.293a1 1 0 00-1.414 0L7 11.586l-4.293-4.293-1.414 1.414L7 14.414l3.293-3.293L16.586 17H13z"
      />
    </g>

    <g v-else-if="name === 'calendar'">
      <path
        d="M7 2v2H4a2 2 0 00-2 2v14a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2h-3V2h-2v2H9V2H7zm13 18H4V9h16v11z"
      />
    </g>

    <g v-else-if="name === 'clock'">
      <path
        d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm1-13h-2v6l5.25 3.15.75-1.23-4-2.4V7z"
      />
    </g>

    <g v-else-if="name === 'heart'">
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      />
    </g>

    <g v-else-if="name === 'medical'">
      <path
        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 9h-4v4h-4v-4H6v-4h4V8h4v4h4v4z"
      />
    </g>

    <g v-else-if="name === 'food'">
      <path
        d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 000 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"
      />
    </g>

    <g v-else-if="name === 'moon'">
      <path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke="currentColor"
        stroke-width="2"
        fill="none"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>

    <g v-else-if="name === 'photo'">
      <path
        d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
      />
    </g>

    <g v-else-if="name === 'plus'">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
    </g>

    <g v-else-if="name === 'check'">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
    </g>

    <g v-else-if="name === 'close'">
      <path
        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
      />
    </g>

    <g v-else-if="name === 'edit'">
      <path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a.996.996 0 000-1.41l-2.34-2.34a.996.996 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      />
    </g>

    <g v-else-if="name === 'delete'">
      <path
        d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
      />
    </g>

    <g v-else-if="name === 'settings'">
      <path
        d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81a.488.488 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
      />
    </g>

    <g v-else-if="name === 'filter'">
      <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
    </g>

    <g v-else-if="name === 'search'">
      <path
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </g>

    <g v-else-if="name === 'star'">
      <path
        d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27z"
      />
    </g>

    <!-- Default fallback icon -->
    <g v-else>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" />
      <circle cx="12" cy="12" r="3" />
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Icon name
  name: {
    type: String,
    required: true
  },

  // Size in pixels
  size: {
    type: [Number, String],
    default: 24
  },

  // Color (or use 'currentColor' via colorClass)
  customColor: {
    type: String,
    default: ''
  },

  // Color class (e.g., 'text-sage-500')
  colorClass: {
    type: String,
    default: 'text-current'
  }
})

const viewBox = computed(() => {
  // Most icons use 24x24 viewBox
  return '0 0 24 24'
})
</script>

<style scoped>
.app-icon {
  display: inline-block;
  vertical-align: middle;
  flex-shrink: 0;
}
</style>
