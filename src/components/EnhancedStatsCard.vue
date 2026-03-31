<template>
  <div
    class="enhanced-stats-card card-premium hover:elevation-4 smooth-transition cursor-pointer relative overflow-hidden group"
    :class="[variant === 'gradient' && 'card-gradient']"
  >
    <!-- Background gradient effect on hover -->
    <div
      class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 motion-reduce:transition-none pointer-events-none"
      :style="{ background: gradientBackground }"
    />

    <!-- Content -->
    <div class="relative z-10">
      <!-- Header -->
      <div class="flex items-start justify-between mb-4">
        <!-- Icon -->
        <div
          class="stat-card-icon text-3xl"
          :class="[iconClass]"
          :style="variant === 'gradient' ? {} : { background: iconBackground }"
        >
          <slot name="icon">{{ icon }}</slot>
        </div>

        <!-- Trend indicator -->
        <div
          v-if="trend !== undefined"
          class="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold"
          :class="trendClass"
        >
          <span>{{ trend > 0 ? '↑' : trend < 0 ? '↓' : '→' }}</span>
          <span>{{ Math.abs(trend) }}%</span>
        </div>
      </div>

      <!-- Value and label -->
      <div class="mb-3">
        <div
          class="text-4xl font-bold mb-1"
          :class="variant === 'gradient' ? 'text-white' : 'gradient-text'"
        >
          <slot name="value">{{ value }}</slot>
        </div>
        <div
          class="text-sm font-semibold"
          :class="variant === 'gradient' ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'"
        >
          {{ label }}
        </div>
      </div>

      <!-- Progress bar (optional) -->
      <div v-if="showProgress" class="mb-3">
        <div class="progress-bar">
          <div
            class="progress-bar-fill"
            :style="{ width: `${progressValue}%` }"
          />
        </div>
        <div class="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>{{ progressLabel }}</span>
          <span>{{ progressValue }}%</span>
        </div>
      </div>

      <!-- Chart (optional) -->
      <div v-if="chartData && chartData.length > 0" class="mt-4">
        <MiniBarChart
          :data="chartData"
          :labels="chartLabels"
          :tooltip-data="chartTooltips"
          :color-scheme="colorScheme"
          bar-height="40px"
        />
      </div>

      <!-- Footer action (optional) -->
      <div
        v-if="$slots.action"
        class="mt-4 pt-4 border-t"
        :class="variant === 'gradient' ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'"
      >
        <slot name="action" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MiniBarChart from './MiniBarChart.vue'

const props = defineProps({
  // Display data
  icon: {
    type: String,
    default: '📊'
  },

  value: {
    type: [String, Number],
    required: true
  },

  label: {
    type: String,
    required: true
  },

  // Trend indicator
  trend: {
    type: Number,
    default: undefined
  },

  // Progress bar
  showProgress: {
    type: Boolean,
    default: false
  },

  progressValue: {
    type: Number,
    default: 0
  },

  progressLabel: {
    type: String,
    default: 'Progress'
  },

  // Chart data
  chartData: {
    type: Array,
    default: () => []
  },

  chartLabels: {
    type: Array,
    default: () => []
  },

  chartTooltips: {
    type: Array,
    default: () => []
  },

  // Styling
  variant: {
    type: String,
    default: 'default', // 'default' | 'gradient'
    validator: (val) => ['default', 'gradient'].includes(val)
  },

  colorScheme: {
    type: String,
    default: 'vibrant' // 'sage' | 'vibrant' | 'ocean' | 'sunset'
  },

  iconClass: {
    type: String,
    default: ''
  }
})

// Computed styles
const gradientBackground = computed(() => {
  const schemes = {
    sage: 'linear-gradient(135deg, rgba(139, 154, 125, 0.1) 0%, rgba(139, 154, 125, 0.05) 100%)',
    vibrant: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)',
    ocean: 'linear-gradient(135deg, rgba(96, 165, 250, 0.1) 0%, rgba(45, 212, 191, 0.1) 100%)',
    sunset: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)'
  }
  return schemes[props.colorScheme] || schemes.vibrant
})

const iconBackground = computed(() => {
  const schemes = {
    sage: 'linear-gradient(135deg, rgba(139, 154, 125, 0.15) 0%, rgba(139, 154, 125, 0.05) 100%)',
    vibrant: 'linear-gradient(135deg, rgba(167, 139, 250, 0.15) 0%, rgba(244, 114, 182, 0.15) 100%)',
    ocean: 'linear-gradient(135deg, rgba(96, 165, 250, 0.15) 0%, rgba(45, 212, 191, 0.15) 100%)',
    sunset: 'linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(244, 114, 182, 0.15) 100%)'
  }
  return schemes[props.colorScheme] || schemes.vibrant
})

const trendClass = computed(() => {
  if (props.trend === undefined) return ''

  if (props.trend > 0) {
    return 'bg-success-light text-success-dark dark:bg-success-dark/20 dark:text-success-light'
  } else if (props.trend < 0) {
    return 'bg-danger-light text-danger-dark dark:bg-danger-dark/20 dark:text-danger-light'
  } else {
    return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
  }
})
</script>

<style scoped>
.enhanced-stats-card {
  min-height: 200px;
}

@media (prefers-reduced-motion: reduce) {
  .smooth-transition,
  .group-hover\:opacity-100 {
    transition: none;
  }
}
</style>
