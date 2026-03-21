<template>
  <div class="weight-trend-chart">
    <div class="chart-header">
      <h3 class="chart-title">Weight Trend</h3>
      <div v-if="weightData.length > 0" class="unit-toggle">
        <button
          @click="displayUnit = 'lbs'"
          :class="{ active: displayUnit === 'lbs' }"
          class="unit-btn"
        >
          lbs
        </button>
        <button
          @click="displayUnit = 'kg'"
          :class="{ active: displayUnit === 'kg' }"
          class="unit-btn"
        >
          kg
        </button>
      </div>
    </div>

    <div v-if="weightData.length === 0" class="empty-state">
      <p class="empty-icon">📊</p>
      <p class="empty-text">No weight data yet</p>
      <p class="empty-hint">Log weight checks to see trends over time</p>
    </div>

    <div v-else class="chart-container">
      <canvas ref="chartCanvas"></canvas>
      <div class="chart-stats">
        <div class="stat-item">
          <span class="stat-label">Latest</span>
          <span class="stat-value">{{ latestWeight }} {{ displayUnit }}</span>
        </div>
        <div class="stat-item" v-if="weightChange !== null">
          <span class="stat-label">Change</span>
          <span
            class="stat-value"
            :class="{
              'text-red-600 dark:text-red-400': weightChange > 0,
              'text-green-600 dark:text-green-400': weightChange < 0
            }"
          >
            {{ weightChange > 0 ? '+' : '' }}{{ weightChange }} {{ displayUnit }}
          </span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Checks</span>
          <span class="stat-value">{{ weightData.length }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Chart, LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, Filler } from 'chart.js'
import 'chartjs-adapter-date-fns'
import { format } from 'date-fns'

// Register Chart.js components
Chart.register(LineController, LineElement, PointElement, LinearScale, TimeScale, Title, Tooltip, Legend, Filler)

const props = defineProps({
  activities: {
    type: Array,
    required: true
  }
})

const chartCanvas = ref(null)
const chartInstance = ref(null)
const displayUnit = ref('lbs')

// Extract and sort weight data
const weightData = computed(() => {
  const weights = props.activities
    .filter(a => a.type === 'Weight Check' && a.medicalData?.weight)
    .map(a => ({
      timestamp: a.timestamp,
      weight: a.medicalData.weight,
      unit: a.medicalData.unit || 'lbs',
      date: new Date(a.timestamp)
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return weights
})

// Convert weight to display unit
function convertWeight(weight, fromUnit) {
  if (fromUnit === displayUnit.value) return weight
  if (displayUnit.value === 'kg') {
    return weight / 2.20462 // lbs to kg
  } else {
    return weight * 2.20462 // kg to lbs
  }
}

// Chart data in display unit
const chartData = computed(() => {
  return weightData.value.map(w => ({
    x: w.timestamp,
    y: parseFloat(convertWeight(w.weight, w.unit).toFixed(1))
  }))
})

// Latest weight
const latestWeight = computed(() => {
  if (weightData.value.length === 0) return 0
  const latest = weightData.value[weightData.value.length - 1]
  return parseFloat(convertWeight(latest.weight, latest.unit).toFixed(1))
})

// Weight change from first to last
const weightChange = computed(() => {
  if (weightData.value.length < 2) return null
  const first = weightData.value[0]
  const last = weightData.value[weightData.value.length - 1]
  const firstWeight = convertWeight(first.weight, first.unit)
  const lastWeight = convertWeight(last.weight, last.unit)
  return parseFloat((lastWeight - firstWeight).toFixed(1))
})

// Detect dark mode
const isDarkMode = computed(() => {
  return document.documentElement.classList.contains('dark')
})

// Chart colors based on theme
const chartColors = computed(() => {
  const dark = isDarkMode.value
  return {
    primary: '#10b981', // sage-500
    background: dark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.2)',
    grid: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    text: dark ? '#d1d5db' : '#374151'
  }
})

// Create or update chart
function createChart() {
  if (!chartCanvas.value || chartData.value.length === 0) return

  // Destroy existing chart
  if (chartInstance.value) {
    chartInstance.value.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  const colors = chartColors.value

  chartInstance.value = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [{
        label: `Weight (${displayUnit.value})`,
        data: chartData.value,
        borderColor: colors.primary,
        backgroundColor: colors.background,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: colors.primary,
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDarkMode.value ? '#1f2937' : '#ffffff',
          titleColor: colors.text,
          bodyColor: colors.text,
          borderColor: colors.grid,
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            title: (context) => {
              return format(context[0].parsed.x, 'MMM d, yyyy')
            },
            label: (context) => {
              return `${context.parsed.y} ${displayUnit.value}`
            }
          }
        }
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d'
            }
          },
          grid: {
            color: colors.grid,
            drawBorder: false
          },
          ticks: {
            color: colors.text,
            maxRotation: 0,
            autoSkipPadding: 20
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: colors.grid,
            drawBorder: false
          },
          ticks: {
            color: colors.text,
            callback: (value) => `${value} ${displayUnit.value}`
          }
        }
      }
    }
  })
}

// Watch for changes
watch([chartData, displayUnit, isDarkMode], () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()

  // Watch for dark mode changes
  const observer = new MutationObserver(() => {
    createChart()
  })
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
})

onUnmounted(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>

<style scoped>
.weight-trend-chart {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.dark .weight-trend-chart {
  background: #1f2937;
  border-color: #374151;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.chart-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.dark .chart-title {
  color: #f9fafb;
}

.unit-toggle {
  display: flex;
  gap: 0.25rem;
  background: #f3f4f6;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.dark .unit-toggle {
  background: #374151;
}

.unit-btn {
  padding: 0.25rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .unit-btn {
  color: #9ca3af;
}

.unit-btn.active {
  background: white;
  color: #10b981;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.dark .unit-btn.active {
  background: #1f2937;
  color: #10b981;
}

.unit-btn:hover:not(.active) {
  color: #10b981;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.dark .empty-text {
  color: #d1d5db;
}

.empty-hint {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .empty-hint {
  color: #9ca3af;
}

.chart-container {
  position: relative;
}

.chart-container canvas {
  height: 250px !important;
  margin-bottom: 1rem;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.dark .chart-stats {
  border-top-color: #374151;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dark .stat-label {
  color: #9ca3af;
}

.stat-value {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.dark .stat-value {
  color: #f9fafb;
}

@media (max-width: 640px) {
  .weight-trend-chart {
    padding: 1rem;
  }

  .chart-container canvas {
    height: 200px !important;
  }

  .chart-stats {
    gap: 0.75rem;
  }

  .stat-value {
    font-size: 1rem;
  }
}
</style>
