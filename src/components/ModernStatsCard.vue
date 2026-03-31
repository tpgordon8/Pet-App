<template>
  <div class="modern-stats-card">
    <div class="stats-grid">
      <!-- Primary stat with visual prominence -->
      <div class="stat-item-primary">
        <div class="stat-icon-wrapper">
          <span class="stat-icon">{{ primaryStat.emoji }}</span>
          <div class="stat-glow"></div>
        </div>
        <div class="stat-content">
          <div class="stat-value gradient-text">{{ primaryStat.value }}</div>
          <div class="stat-label">{{ primaryStat.label }}</div>
          <div v-if="primaryStat.trend" class="stat-trend" :class="primaryStat.trend > 0 ? 'trend-up' : 'trend-down'">
            <span>{{ primaryStat.trend > 0 ? '↑' : '↓' }}</span>
            <span>{{ Math.abs(primaryStat.trend) }}%</span>
          </div>
        </div>
      </div>

      <!-- Secondary stats in grid -->
      <div class="stats-secondary-grid">
        <div
          v-for="stat in secondaryStats"
          :key="stat.label"
          class="stat-item-secondary hover-lift active-press"
        >
          <div class="stat-pill">
            <span class="stat-emoji">{{ stat.emoji }}</span>
            <div class="stat-details">
              <div class="stat-value-sm">{{ stat.value }}</div>
              <div class="stat-label-sm">{{ stat.label }}</div>
            </div>
          </div>
          <!-- Mini progress bar -->
          <div v-if="stat.max" class="mini-progress">
            <div
              class="mini-progress-fill"
              :style="{ width: `${(stat.value / stat.max) * 100}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Weekly summary visualization -->
    <div v-if="weeklyData" class="weekly-chart">
      <div class="chart-header">
        <span class="chart-title">This Week</span>
        <span class="chart-value">{{ weeklyTotal }} total</span>
      </div>
      <div class="chart-bars">
        <div
          v-for="(day, index) in weeklyData"
          :key="index"
          class="chart-bar-wrapper"
        >
          <div
            class="chart-bar"
            :style="{
              height: `${(day.value / maxWeeklyValue) * 100}%`,
              animationDelay: `${index * 50}ms`
            }"
          >
            <div class="chart-bar-tooltip">
              {{ day.value }}
            </div>
          </div>
          <div class="chart-label">{{ day.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  primaryStat: {
    type: Object,
    required: true,
    // { emoji, value, label, trend }
  },
  secondaryStats: {
    type: Array,
    default: () => []
    // [{ emoji, value, label, max }]
  },
  weeklyData: {
    type: Array,
    default: null
    // [{ label, value }]
  }
})

const weeklyTotal = computed(() => {
  if (!props.weeklyData) return 0
  return props.weeklyData.reduce((sum, day) => sum + day.value, 0)
})

const maxWeeklyValue = computed(() => {
  if (!props.weeklyData) return 1
  return Math.max(...props.weeklyData.map(d => d.value), 1)
})
</script>

<style scoped>
.modern-stats-card {
  @apply card-premium;
  @apply space-y-6;
}

.stats-grid {
  @apply grid gap-6;
  grid-template-columns: 1fr;
}

/* Primary Stat */
.stat-item-primary {
  @apply flex items-center gap-4;
  @apply p-4 rounded-2xl;
  @apply gradient-bg-soft;
}

.stat-icon-wrapper {
  @apply relative;
  @apply w-16 h-16 flex items-center justify-center;
  @apply rounded-2xl;
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.2) 0%, rgba(139, 154, 125, 0.1) 100%);
}

.stat-icon {
  @apply text-4xl;
  @apply relative z-10;
}

.stat-glow {
  @apply absolute inset-0 rounded-2xl opacity-50;
  background: radial-gradient(circle, rgba(139, 154, 125, 0.3) 0%, transparent 70%);
  @apply animate-pulse;
}

.stat-content {
  @apply flex-1;
}

.stat-value {
  @apply text-4xl font-bold;
  line-height: 1;
}

.stat-label {
  @apply text-sm text-gray-600 dark:text-gray-400 mt-1;
}

.stat-trend {
  @apply flex items-center gap-1 mt-2;
  @apply text-sm font-semibold;
}

.trend-up {
  @apply text-success;
}

.trend-down {
  @apply text-danger;
}

/* Secondary Stats */
.stats-secondary-grid {
  @apply grid grid-cols-2 sm:grid-cols-3 gap-3;
}

.stat-item-secondary {
  @apply cursor-pointer;
}

.stat-pill {
  @apply flex items-center gap-2;
  @apply p-3 rounded-xl;
  @apply bg-white dark:bg-gray-800;
  @apply border border-gray-100 dark:border-gray-700;
  @apply transition-all duration-200;
}

.stat-item-secondary:hover .stat-pill {
  @apply border-sage-300 dark:border-sage-600;
  @apply shadow-sm;
}

.stat-emoji {
  @apply text-2xl;
}

.stat-details {
  @apply flex-1 min-w-0;
}

.stat-value-sm {
  @apply text-xl font-bold text-gray-900 dark:text-white;
}

.stat-label-sm {
  @apply text-xs text-gray-500 dark:text-gray-400;
  @apply truncate;
}

/* Mini Progress Bar */
.mini-progress {
  @apply h-1 bg-gray-100 dark:bg-gray-700 rounded-full mt-2 overflow-hidden;
}

.mini-progress-fill {
  @apply h-full rounded-full;
  @apply gradient-bg-sage;
  @apply transition-all duration-500;
}

/* Weekly Chart */
.weekly-chart {
  @apply pt-4 border-t border-gray-100 dark:border-gray-700;
}

.chart-header {
  @apply flex items-center justify-between mb-4;
}

.chart-title {
  @apply text-sm font-semibold text-gray-700 dark:text-gray-300;
}

.chart-value {
  @apply text-sm font-bold gradient-text;
}

.chart-bars {
  @apply flex items-end justify-between gap-2;
  @apply h-32;
}

.chart-bar-wrapper {
  @apply flex-1 flex flex-col items-center gap-2;
}

.chart-bar {
  @apply w-full rounded-t-lg relative;
  @apply gradient-bg-sage;
  @apply min-h-[4px];
  @apply transition-all duration-500;
  @apply cursor-pointer;
  animation: slideUp 0.5s ease-out;
}

.chart-bar:hover {
  @apply opacity-80;
}

.chart-bar-tooltip {
  @apply absolute -top-8 left-1/2 -translate-x-1/2;
  @apply bg-gray-900 dark:bg-white text-white dark:text-gray-900;
  @apply text-xs font-semibold px-2 py-1 rounded-lg;
  @apply opacity-0 transition-opacity;
  @apply pointer-events-none;
  white-space: nowrap;
}

.chart-bar:hover .chart-bar-tooltip {
  @apply opacity-100;
}

.chart-label {
  @apply text-xs text-gray-500 dark:text-gray-400;
  @apply font-medium;
}

@keyframes slideUp {
  from {
    transform: scaleY(0);
    transform-origin: bottom;
  }
  to {
    transform: scaleY(1);
    transform-origin: bottom;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .stat-value {
    @apply text-3xl;
  }

  .stat-icon-wrapper {
    @apply w-12 h-12;
  }

  .stat-icon {
    @apply text-3xl;
  }

  .stats-secondary-grid {
    @apply grid-cols-2;
  }
}
</style>
