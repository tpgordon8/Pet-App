<template>
  <div class="relative inline-flex items-center justify-center">
    <!-- SVG Ring -->
    <svg
      :width="size"
      :height="size"
      class="progress-ring"
      :class="{ 'motion-reduce:transition-none': true }"
    >
      <!-- Background circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="backgroundColor"
        :stroke-width="strokeWidth"
        class="opacity-20"
      />

      <!-- Progress circle -->
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        :stroke="strokeColor"
        :stroke-width="strokeWidth"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="progress-ring-circle motion-reduce:transition-none"
        stroke-linecap="round"
      />

      <!-- Gradient definition for colorful rings -->
      <defs>
        <linearGradient id="ring-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#a78bfa;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#f472b6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#fb923c;stop-opacity:1" />
        </linearGradient>
      </defs>
    </svg>

    <!-- Center content -->
    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <slot>
        <div class="text-center">
          <div
            class="font-bold"
            :style="{ fontSize: valueFontSize }"
            :class="valueClass"
          >
            {{ displayValue }}
          </div>
          <div
            v-if="label"
            class="text-xs text-gray-500 dark:text-gray-400 font-medium"
          >
            {{ label }}
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Progress value (0-100)
  value: {
    type: Number,
    required: true,
    validator: (val) => val >= 0 && val <= 100
  },

  // Ring size in pixels
  size: {
    type: Number,
    default: 120
  },

  // Stroke width
  strokeWidth: {
    type: Number,
    default: 8
  },

  // Colors
  strokeColor: {
    type: String,
    default: 'url(#ring-gradient)' // Use gradient by default
  },

  backgroundColor: {
    type: String,
    default: 'currentColor'
  },

  // Display settings
  label: {
    type: String,
    default: ''
  },

  showPercentage: {
    type: Boolean,
    default: true
  },

  // Custom value class
  valueClass: {
    type: String,
    default: 'gradient-text'
  }
})

// Calculate circle properties
const center = computed(() => props.size / 2)
const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => 2 * Math.PI * radius.value)

// Calculate dash offset for progress
const dashOffset = computed(() => {
  const progress = Math.min(100, Math.max(0, props.value))
  return circumference.value - (progress / 100) * circumference.value
})

// Display value
const displayValue = computed(() => {
  if (props.showPercentage) {
    return `${Math.round(props.value)}%`
  }
  return Math.round(props.value)
})

// Dynamic font size based on ring size
const valueFontSize = computed(() => {
  if (props.size >= 150) return '2rem'
  if (props.size >= 100) return '1.5rem'
  return '1.25rem'
})
</script>

<style scoped>
.progress-ring {
  transform: rotate(-90deg);
}

.progress-ring-circle {
  transition: stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

@media (prefers-reduced-motion: reduce) {
  .progress-ring-circle {
    transition: none;
  }
}
</style>
