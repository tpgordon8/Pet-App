<template>
  <div class="mini-bar-chart">
    <!-- Chart bars -->
    <div class="flex items-end justify-between gap-1 h-full">
      <div
        v-for="(value, index) in normalizedData"
        :key="index"
        class="bar-container flex-1 flex flex-col items-center gap-1 group cursor-pointer"
        @mouseenter="hoveredIndex = index"
        @mouseleave="hoveredIndex = null"
      >
        <!-- Bar -->
        <div class="w-full flex items-end justify-center" :style="{ height: barHeight }">
          <div
            class="bar w-full rounded-t-lg transition-all duration-300 motion-reduce:transition-none"
            :class="[
              barClass,
              hoveredIndex === index ? 'opacity-100 scale-105' : 'opacity-80'
            ]"
            :style="{
              height: `${value}%`,
              background: getBarGradient(index)
            }"
          />
        </div>

        <!-- Label -->
        <div
          v-if="labels && labels[index]"
          class="text-xs text-gray-500 dark:text-gray-400 font-medium truncate w-full text-center"
        >
          {{ labels[index] }}
        </div>
      </div>
    </div>

    <!-- Tooltip on hover -->
    <div
      v-if="hoveredIndex !== null && tooltipData[hoveredIndex]"
      class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg shadow-lg animate-fade-in pointer-events-none z-10"
    >
      {{ tooltipData[hoveredIndex] }}
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  // Data array (numbers)
  data: {
    type: Array,
    required: true,
    validator: (arr) => arr.every(val => typeof val === 'number')
  },

  // Labels for each bar
  labels: {
    type: Array,
    default: () => []
  },

  // Tooltip data for each bar
  tooltipData: {
    type: Array,
    default: () => []
  },

  // Bar height
  barHeight: {
    type: String,
    default: '60px'
  },

  // Bar styling
  barClass: {
    type: String,
    default: ''
  },

  // Color scheme: 'sage' | 'vibrant' | 'ocean' | 'sunset'
  colorScheme: {
    type: String,
    default: 'vibrant',
    validator: (val) => ['sage', 'vibrant', 'ocean', 'sunset', 'gradient'].includes(val)
  },

  // Whether to animate bars on mount
  animated: {
    type: Boolean,
    default: true
  }
})

const hoveredIndex = ref(null)

// Normalize data to 0-100 scale
const normalizedData = computed(() => {
  if (props.data.length === 0) return []

  const max = Math.max(...props.data, 1) // Prevent division by zero
  return props.data.map(val => (val / max) * 100)
})

// Get gradient for each bar based on color scheme
const getBarGradient = (index) => {
  const schemes = {
    sage: 'linear-gradient(180deg, #8B9A7D 0%, #6d7e60 100%)',
    vibrant: 'linear-gradient(180deg, #a78bfa 0%, #f472b6 100%)',
    ocean: 'linear-gradient(180deg, #60a5fa 0%, #2dd4bf 100%)',
    sunset: 'linear-gradient(180deg, #fb923c 0%, #f472b6 100%)',
    gradient: [
      'linear-gradient(180deg, #a78bfa 0%, #a78bfa 100%)',
      'linear-gradient(180deg, #f472b6 0%, #f472b6 100%)',
      'linear-gradient(180deg, #fb923c 0%, #fb923c 100%)',
      'linear-gradient(180deg, #2dd4bf 0%, #2dd4bf 100%)',
      'linear-gradient(180deg, #60a5fa 0%, #60a5fa 100%)',
    ]
  }

  if (props.colorScheme === 'gradient') {
    return schemes.gradient[index % schemes.gradient.length]
  }

  return schemes[props.colorScheme] || schemes.vibrant
}
</script>

<style scoped>
.mini-bar-chart {
  position: relative;
  width: 100%;
  height: 100%;
}

.bar {
  min-height: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bar-container:hover .bar {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

@media (prefers-reduced-motion: reduce) {
  .bar,
  .animate-fade-in {
    transition: none;
    animation: none;
  }
}
</style>
