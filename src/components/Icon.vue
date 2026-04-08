<template>
  <component
    :is="componentType"
    :class="['icon', sizeClass, colorClass, { 'icon-animated': animated, 'icon-clickable': clickable }]"
    :style="iconStyle"
    :aria-hidden="decorative ? 'true' : undefined"
    :aria-label="decorative ? undefined : label"
    :role="decorative ? undefined : 'img'"
    @click="handleClick"
  >
    <!-- SVG Icon -->
    <svg
      v-if="!emoji"
      :width="actualSize"
      :height="actualSize"
      :viewBox="viewBox"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class="icon-svg"
    >
      <!-- Activity Icons -->
      <path v-if="name === 'poop'" d="M12 2C10.9 2 10 2.9 10 4C10 4.7 10.3 5.3 10.8 5.7C9.8 6.1 9 7 9 8C9 8.7 9.3 9.3 9.8 9.7C8.8 10.1 8 11 8 12C8 13.7 9.3 15 11 15H13C14.7 15 16 13.7 16 12C16 11 15.2 10.1 14.2 9.7C14.7 9.3 15 8.7 15 8C15 7 14.2 6.1 13.2 5.7C13.7 5.3 14 4.7 14 4C14 2.9 13.1 2 12 2ZM11 13C10.4 13 10 12.6 10 12C10 11.4 10.4 11 11 11H13C13.6 11 14 11.4 14 12C14 12.6 13.6 13 13 13H11Z" fill="currentColor"/>

      <path v-else-if="name === 'pee'" d="M12 2C10.3 2 9 3.3 9 5V10C9 10.6 8.6 11 8 11C7.4 11 7 10.6 7 10V8C7 7.4 6.6 7 6 7C5.4 7 5 7.4 5 8V10C5 11.7 6.3 13 8 13V14C8 15.7 9.3 17 11 17H13C14.7 17 16 15.7 16 14V5C16 3.3 14.7 2 13 2H12ZM11 5H13V14H11V5Z" fill="currentColor"/>

      <path v-else-if="name === 'food'" d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z" fill="currentColor"/>

      <path v-else-if="name === 'sleep'" d="M9 11.24V7.5C9 6.12 10.12 5 11.5 5S14 6.12 14 7.5v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74zm9.84 4.63l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74c-3.6-.76-3.54-.75-3.67-.75-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z" fill="currentColor"/>

      <path v-else-if="name === 'meds'" d="M4.22 11.29l7.07-7.07c.39-.39 1.02-.39 1.41 0l2.12 2.12c.39.39.39 1.02 0 1.41l-7.07 7.07c-.39.39-1.02.39-1.41 0L4.22 12.7c-.39-.39-.39-1.02 0-1.41zm13.13-1.42c1.95-1.95 1.95-5.12 0-7.07-1.95-1.95-5.12-1.95-7.07 0l1.41 1.41c1.17-1.17 3.07-1.17 4.24 0 1.17 1.17 1.17 3.07 0 4.24l1.42 1.42z M15.73 15.02l-1.41-1.41-3.18 3.18c-.39.39-1.02.39-1.42 0L7.6 14.67c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41l2.12 2.12c1.17 1.17 3.07 1.17 4.24 0l3.18-3.18z" fill="currentColor"/>

      <path v-else-if="name === 'walk'" d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7" fill="currentColor"/>

      <path v-else-if="name === 'vet'" d="M19.43 12.98c.04-.32.07-.64.07-.98 0-.34-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.09-.16-.26-.25-.44-.25-.06 0-.12.01-.17.03l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.06-.02-.12-.03-.18-.03-.17 0-.34.09-.43.25l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98 0 .33.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.09.16.26.25.44.25.06 0 .12-.01.17-.03l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.06.02.12.03.18.03.17 0 .34-.09.43-.25l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zm-1.98-1.71c.04.31.05.52.05.73 0 .21-.02.43-.05.73l-.14 1.13.89.7 1.08.84-.7 1.21-1.27-.51-1.04-.42-.9.68c-.43.32-.84.56-1.25.73l-1.06.43-.16 1.13-.2 1.35h-1.4l-.19-1.35-.16-1.13-1.06-.43c-.43-.18-.83-.41-1.23-.71l-.91-.7-1.06.43-1.27.51-.7-1.21 1.08-.84.89-.7-.14-1.13c-.03-.31-.05-.54-.05-.74s.02-.43.05-.73l.14-1.13-.89-.7-1.08-.84.7-1.21 1.27.51 1.04.42.9-.68c.43-.32.84-.56 1.25-.73l1.06-.43.16-1.13.2-1.35h1.39l.19 1.35.16 1.13 1.06.43c.43.18.83.41 1.23.71l.91.7 1.06-.43 1.27-.51.7 1.21-1.07.85-.89.7.14 1.13zM12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="currentColor"/>

      <!-- UI Icons -->
      <path v-else-if="name === 'plus'" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>

      <path v-else-if="name === 'close'" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>

      <path v-else-if="name === 'check'" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>

      <path v-else-if="name === 'chevron-down'" d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor"/>

      <path v-else-if="name === 'chevron-up'" d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor"/>

      <path v-else-if="name === 'chevron-left'" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>

      <path v-else-if="name === 'chevron-right'" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>

      <path v-else-if="name === 'search'" d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>

      <path v-else-if="name === 'edit'" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>

      <path v-else-if="name === 'delete'" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>

      <path v-else-if="name === 'settings'" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>

      <path v-else-if="name === 'calendar'" d="M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z" fill="currentColor"/>

      <path v-else-if="name === 'photo'" d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="currentColor"/>

      <path v-else-if="name === 'trending-up'" d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" fill="currentColor"/>

      <path v-else-if="name === 'trending-down'" d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z" fill="currentColor"/>

      <!-- Fallback: circle for unknown icons -->
      <circle v-else cx="12" cy="12" r="10" fill="currentColor" opacity="0.3"/>
    </svg>

    <!-- Emoji Icon -->
    <span v-else class="icon-emoji" :style="{ fontSize: emojiSize }">
      {{ emoji }}
    </span>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Icon name for SVG icons
  name: {
    type: String,
    default: ''
  },
  // Emoji character (alternative to SVG)
  emoji: {
    type: String,
    default: ''
  },
  // Size: xs, sm, md, lg, xl, 2xl, 3xl, or custom number (px)
  size: {
    type: [String, Number],
    default: 'md'
  },
  // Color: primary, secondary, success, warning, danger, or custom
  color: {
    type: String,
    default: 'current'
  },
  // Custom style object
  customStyle: {
    type: Object,
    default: () => ({})
  },
  // Enable animation on hover
  animated: {
    type: Boolean,
    default: false
  },
  // Make icon clickable (adds cursor pointer)
  clickable: {
    type: Boolean,
    default: false
  },
  // Accessibility label
  label: {
    type: String,
    default: ''
  },
  // Is decorative (no semantic meaning)
  decorative: {
    type: Boolean,
    default: false
  },
  // SVG viewBox
  viewBox: {
    type: String,
    default: '0 0 24 24'
  }
})

const emit = defineEmits(['click'])

const componentType = computed(() => {
  return props.clickable ? 'button' : 'span'
})

const sizeMap = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  '2xl': 48,
  '3xl': 64
}

const actualSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  return sizeMap[props.size] || sizeMap.md
})

const emojiSize = computed(() => {
  return `${actualSize.value * 0.8}px`
})

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  return `icon-${props.size}`
})

const colorClass = computed(() => {
  const colorMap = {
    primary: 'icon-primary',
    secondary: 'icon-secondary',
    success: 'icon-success',
    warning: 'icon-warning',
    danger: 'icon-danger',
    sage: 'icon-sage',
    purple: 'icon-purple',
    pink: 'icon-pink',
    teal: 'icon-teal',
    current: 'icon-current'
  }
  return colorMap[props.color] || 'icon-current'
})

const iconStyle = computed(() => {
  return {
    ...props.customStyle
  }
})

function handleClick(event) {
  if (props.clickable) {
    emit('click', event)
  }
}
</script>

<style scoped>
.icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  vertical-align: middle;
  transition: all 0.2s ease;
}

.icon-clickable {
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
}

.icon-clickable:hover {
  transform: scale(1.1);
}

.icon-clickable:active {
  transform: scale(0.95);
}

/* Size classes */
.icon-xs { width: 16px; height: 16px; }
.icon-sm { width: 20px; height: 20px; }
.icon-md { width: 24px; height: 24px; }
.icon-lg { width: 32px; height: 32px; }
.icon-xl { width: 40px; height: 40px; }
.icon-2xl { width: 48px; height: 48px; }
.icon-3xl { width: 64px; height: 64px; }

/* Color classes */
.icon-current { color: currentColor; }
.icon-primary { color: var(--sage-600); }
.dark .icon-primary { color: var(--sage-400); }
.icon-secondary { color: var(--gray-600); }
.dark .icon-secondary { color: var(--gray-400); }
.icon-success { color: var(--success-600); }
.dark .icon-success { color: var(--success-400); }
.icon-warning { color: var(--warning-600); }
.dark .icon-warning { color: var(--warning-400); }
.icon-danger { color: var(--danger-600); }
.dark .icon-danger { color: var(--danger-400); }
.icon-sage { color: var(--sage-600); }
.dark .icon-sage { color: var(--sage-400); }
.icon-purple { color: var(--purple-600); }
.dark .icon-purple { color: var(--purple-400); }
.icon-pink { color: var(--pink-600); }
.dark .icon-pink { color: var(--pink-400); }
.icon-teal { color: var(--teal-600); }
.dark .icon-teal { color: var(--teal-400); }

/* SVG styling */
.icon-svg {
  display: block;
  width: 100%;
  height: 100%;
}

/* Emoji styling */
.icon-emoji {
  display: block;
  line-height: 1;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
}

/* Animated icons */
.icon-animated {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.icon-animated:hover {
  transform: scale(1.2) rotate(-5deg);
}

/* Accessibility */
.icon-clickable:focus {
  outline: 2px solid var(--sage-400);
  outline-offset: 2px;
  border-radius: 4px;
}

.icon-clickable:focus:not(:focus-visible) {
  outline: none;
}

/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  .icon,
  .icon-animated,
  .icon-clickable {
    transition: none !important;
    animation: none !important;
  }

  .icon-animated:hover,
  .icon-clickable:hover {
    transform: none !important;
  }
}
</style>
