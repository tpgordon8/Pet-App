<template>
  <div class="insights-container">
    <div class="insights-header">
      <h3 class="insights-title">
        <span class="icon">💡</span>
        Activity Insights
      </h3>
      <span v-if="insights.length > 0" class="insight-count">
        {{ insights.length }} insight{{ insights.length !== 1 ? 's' : '' }}
      </span>
    </div>

    <div v-if="insights.length === 0" class="empty-state">
      <p class="empty-icon">📊</p>
      <p class="empty-text">No insights yet</p>
      <p class="empty-hint">Keep logging activities for at least 7 days to see patterns</p>
    </div>

    <div v-else class="insights-list">
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="insight-card"
        :class="`insight-${insight.type}`"
      >
        <div class="insight-icon">{{ insight.emoji }}</div>
        <div class="insight-content">
          <div class="insight-text">{{ insight.message }}</div>
          <div class="insight-meta">{{ insight.detail }}</div>
        </div>
        <div v-if="insight.severity" class="insight-badge" :class="`badge-${insight.severity}`">
          {{ insight.severity }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, subDays, startOfDay, differenceInDays } from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  petName: {
    type: String,
    default: null
  }
})

// Calculate insights based on activity patterns
const insights = computed(() => {
  const results = []
  const now = Date.now()
  const today = startOfDay(new Date())
  const yesterday = subDays(today, 1)
  const weekAgo = subDays(today, 7)

  // Optimization: Single pass through activities to categorize by time period and type
  const todayActivities = []
  const yesterdayActivities = []
  const lastWeekActivities = []
  const todayCounts = {}
  const weekCounts = {}

  const todayTime = today.getTime()
  const yesterdayTime = yesterday.getTime()
  const weekAgoTime = weekAgo.getTime()

  for (const activity of props.activities) {
    const timestamp = activity.timestamp
    const type = activity.type

    // Categorize by time period
    if (timestamp >= todayTime) {
      todayActivities.push(activity)
      todayCounts[type] = (todayCounts[type] || 0) + 1
    }
    if (timestamp >= yesterdayTime && timestamp < todayTime) {
      yesterdayActivities.push(activity)
    }
    if (timestamp >= weekAgoTime) {
      lastWeekActivities.push(activity)
      weekCounts[type] = (weekCounts[type] || 0) + 1
    }
  }

  // Need at least 7 days of data for meaningful insights
  if (lastWeekActivities.length < 5) {
    return results
  }

  // Helper: Calculate daily average for a type
  const getDailyAverage = (type) => {
    const count = weekCounts[type] || 0
    const days = differenceInDays(now, weekAgoTime)
    return count / Math.max(days, 1)
  }

  // ===== POOP PATTERNS =====
  const todayPoop = todayCounts['Poop'] || 0
  const avgPoop = getDailyAverage('Poop')

  if (avgPoop >= 2 && todayPoop === 0) {
    results.push({
      type: 'alert',
      severity: 'warning',
      emoji: '⚠️',
      message: `No poop logged today`,
      detail: `Usually ${avgPoop.toFixed(1)} times per day`
    })
  } else if (avgPoop >= 2 && todayPoop < avgPoop * 0.5) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '📊',
      message: `Fewer poops than usual`,
      detail: `${todayPoop} today vs ${avgPoop.toFixed(1)} average`
    })
  } else if (avgPoop >= 1 && todayPoop > avgPoop * 1.5) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '📊',
      message: `More poops than usual`,
      detail: `${todayPoop} today vs ${avgPoop.toFixed(1)} average`
    })
  }

  // ===== FOOD PATTERNS =====
  const todayFood = todayCounts['Food'] || 0
  const avgFood = getDailyAverage('Food')

  if (avgFood >= 2 && todayFood === 0) {
    results.push({
      type: 'alert',
      severity: 'warning',
      emoji: '🍖',
      message: `No meals logged today`,
      detail: `Usually ${avgFood.toFixed(1)} meals per day`
    })
  } else if (avgFood >= 2 && todayFood < avgFood * 0.5) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '🍽️',
      message: `Eating less than usual`,
      detail: `${todayFood} meals today vs ${avgFood.toFixed(1)} average`
    })
  }

  // ===== PEE PATTERNS =====
  const todayPee = todayCounts['Pee'] || 0
  const avgPee = getDailyAverage('Pee')

  if (avgPee >= 3 && todayPee > avgPee * 1.5) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '💧',
      message: `More bathroom breaks than usual`,
      detail: `${todayPee} today vs ${avgPee.toFixed(1)} average`
    })
  }

  // ===== WEIGHT TRENDS =====
  const weightChecks = props.activities
    .filter(a => a.type === 'Weight Check' && a.medicalData?.weight)
    .sort((a, b) => a.timestamp - b.timestamp)

  if (weightChecks.length >= 2) {
    const firstWeight = weightChecks[0]
    const lastWeight = weightChecks[weightChecks.length - 1]

    // Convert to lbs for comparison
    const firstLbs = firstWeight.medicalData.unit === 'kg'
      ? firstWeight.medicalData.weight * 2.20462
      : firstWeight.medicalData.weight

    const lastLbs = lastWeight.medicalData.unit === 'kg'
      ? lastWeight.medicalData.weight * 2.20462
      : lastWeight.medicalData.weight

    const change = lastLbs - firstLbs
    const percentChange = (change / firstLbs) * 100

    if (Math.abs(percentChange) > 5) {
      const direction = change > 0 ? 'gained' : 'lost'
      const severity = Math.abs(percentChange) > 10 ? 'warning' : 'low'
      results.push({
        type: severity === 'warning' ? 'alert' : 'info',
        severity,
        emoji: change > 0 ? '📈' : '📉',
        message: `Weight has ${direction} ${Math.abs(change).toFixed(1)} lbs`,
        detail: `${Math.abs(percentChange).toFixed(1)}% change since ${format(firstWeight.timestamp, 'MMM d')}`
      })
    }
  }

  // ===== MEDICATION COMPLIANCE =====
  const todayMeds = todayCounts['Meds'] || 0
  const avgMeds = getDailyAverage('Meds')

  if (avgMeds >= 1 && todayMeds === 0) {
    results.push({
      type: 'alert',
      severity: 'warning',
      emoji: '💊',
      message: `Medication not logged today`,
      detail: `Usually ${avgMeds.toFixed(1)} times per day`
    })
  }

  // ===== ACTIVITY LEVEL =====
  const todayWalks = todayCounts['Walk'] || 0
  const avgWalks = getDailyAverage('Walk')

  if (avgWalks >= 1 && todayWalks === 0) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '🚶',
      message: `No walks logged today`,
      detail: `Usually ${avgWalks.toFixed(1)} walks per day`
    })
  }

  // ===== CONSISTENCY =====
  const todayTotal = todayActivities.length
  const avgTotal = lastWeekActivities.length / 7

  if (avgTotal >= 5 && todayTotal < avgTotal * 0.3) {
    results.push({
      type: 'info',
      severity: 'low',
      emoji: '📉',
      message: `Less active than usual`,
      detail: `${todayTotal} activities today vs ${avgTotal.toFixed(1)} average`
    })
  } else if (todayTotal > avgTotal * 1.5 && avgTotal >= 5) {
    results.push({
      type: 'positive',
      emoji: '⭐',
      message: `Very active today!`,
      detail: `${todayTotal} activities logged`
    })
  }

  // Sort by severity (warnings first)
  return results.sort((a, b) => {
    const severityOrder = { warning: 0, low: 1 }
    return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
  })
})
</script>

<style scoped>
.insights-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.dark .insights-container {
  background: #1f2937;
  border-color: #374151;
}

.insights-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.insights-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
}

.dark .insights-title {
  color: #f9fafb;
}

.insights-title .icon {
  font-size: 1.25rem;
}

.insight-count {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
}

.dark .insight-count {
  color: #9ca3af;
  background: #374151;
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.75rem;
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

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.insight-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9fafb;
  border-left: 3px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 150ms ease-in-out;
}

.dark .insight-card {
  background: #111827;
  border-left-color: #374151;
}

.insight-card.insight-alert {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.dark .insight-card.insight-alert {
  background: rgba(239, 68, 68, 0.1);
}

.insight-card.insight-info {
  border-left-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.dark .insight-card.insight-info {
  background: rgba(59, 130, 246, 0.1);
}

.insight-card.insight-positive {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.05);
}

.dark .insight-card.insight-positive {
  background: rgba(16, 185, 129, 0.1);
}

.insight-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
  min-width: 0;
}

.insight-text {
  font-size: 0.95rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
}

.dark .insight-text {
  color: #f9fafb;
}

.insight-meta {
  font-size: 0.8rem;
  color: #6b7280;
}

.dark .insight-meta {
  color: #9ca3af;
}

.insight-badge {
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
}

.badge-warning {
  background: #fef2f2;
  color: #dc2626;
}

.dark .badge-warning {
  background: rgba(220, 38, 38, 0.2);
  color: #fca5a5;
}

.badge-low {
  background: #eff6ff;
  color: #2563eb;
}

.dark .badge-low {
  background: rgba(37, 99, 235, 0.2);
  color: #93c5fd;
}

@media (max-width: 640px) {
  .insights-container {
    padding: 1rem;
  }

  .insight-card {
    padding: 0.75rem;
  }

  .insight-icon {
    font-size: 1.25rem;
  }

  .insight-badge {
    display: none;
  }
}
</style>
