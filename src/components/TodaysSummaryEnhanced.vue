<template>
  <div class="space-y-4">
    <!-- Header with gradient -->
    <div class="text-center py-6">
      <h2 class="text-display gradient-text-vibrant mb-2">
        Today's Activity
      </h2>
      <p class="text-gray-600 dark:text-gray-400">
        {{ petName || 'All Pets' }} • {{ formattedDate }}
      </p>
    </div>

    <!-- Main Stats Grid with Enhanced Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Total Activities Card -->
      <EnhancedStatsCard
        icon="📊"
        :value="stats.total"
        label="Total Activities"
        :trend="calculateTrend('total')"
        color-scheme="vibrant"
        :chart-data="getLast7Days('total')"
        :chart-labels="last7DaysLabels"
        :chart-tooltips="getLast7DaysTooltips('total')"
      >
        <template #icon>
          <AppIcon name="chart-bar" :size="32" color-class="text-accent-purple" />
        </template>
      </EnhancedStatsCard>

      <!-- Bathroom Stats Card with Ring Progress -->
      <EnhancedStatsCard
        :value="`${stats.poop + stats.pee}`"
        label="Bathroom Breaks"
        :show-progress="true"
        :progress-value="bathroomProgress"
        progress-label="Daily goal"
        color-scheme="ocean"
      >
        <template #icon>
          <div class="text-2xl">💧</div>
        </template>
        <template #action>
          <div class="flex gap-2 text-sm">
            <span class="stat-badge">💩 {{ stats.poop }}</span>
            <span class="stat-badge">💧 {{ stats.pee }}</span>
          </div>
        </template>
      </EnhancedStatsCard>

      <!-- Food & Care Card -->
      <EnhancedStatsCard
        :value="`${stats.food + stats.sleep + stats.meds}`"
        label="Food & Care"
        color-scheme="sunset"
        :chart-data="[stats.food, stats.sleep, stats.meds, stats.walk]"
        :chart-labels="['Food', 'Sleep', 'Meds', 'Walk']"
        :chart-tooltips="[
          `Food: ${stats.food}`,
          `Sleep: ${stats.sleep}`,
          `Meds: ${stats.meds}`,
          `Walk: ${stats.walk}`
        ]"
      >
        <template #icon>
          <div class="text-2xl">🍖</div>
        </template>
      </EnhancedStatsCard>
    </div>

    <!-- Activity Breakdown with Progress Rings -->
    <div class="card-premium">
      <h3 class="text-heading text-gray-900 dark:text-white mb-4">
        Activity Breakdown
      </h3>

      <div class="grid grid-cols-3 sm:grid-cols-6 gap-4">
        <!-- Each activity with progress ring -->
        <div
          v-for="activity in activityBreakdown"
          :key="activity.type"
          class="flex flex-col items-center gap-2 hover-lift cursor-pointer group"
        >
          <ProgressRing
            :value="activity.percentage"
            :size="80"
            :stroke-width="6"
            :show-percentage="false"
            value-class="text-gray-900 dark:text-white font-bold"
          >
            <template>
              <div class="text-center">
                <div class="text-2xl mb-1 group-hover:scale-110 transition-transform motion-reduce:transition-none">
                  {{ activity.emoji }}
                </div>
                <div class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ activity.count }}
                </div>
              </div>
            </template>
          </ProgressRing>
          <span class="text-xs font-medium text-gray-600 dark:text-gray-400">
            {{ activity.type }}
          </span>
        </div>
      </div>
    </div>

    <!-- Last Activity Insight with Modern Design -->
    <div
      v-if="lastActivity"
      class="card-glass hover:elevation-3 smooth-transition cursor-pointer"
    >
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 rounded-2xl gradient-bg-soft flex items-center justify-center text-3xl">
          {{ lastActivity.emoji }}
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <AppIcon name="clock" :size="16" color-class="text-gray-400" />
            <span class="text-sm font-semibold text-gray-900 dark:text-white">
              Last {{ lastActivity.type }}
            </span>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ lastActivity.timeAgo }}
          </p>
        </div>
        <div class="text-2xl text-gray-400 group-hover:text-sage-500 transition-colors motion-reduce:transition-none">
          →
        </div>
      </div>
    </div>

    <!-- Activity Insights (lazy loaded) -->
    <Suspense>
      <template #default>
        <ActivityInsights
          v-if="activities && activities.length > 0"
          :activities="activities"
          :pet-name="petName"
        />
      </template>
      <template #fallback>
        <DelightfulLoader
          variant="dots"
          text="Loading insights..."
          :show-fun-message="false"
        />
      </template>
    </Suspense>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { format, formatDistanceToNow, subDays } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities'
import EnhancedStatsCard from './EnhancedStatsCard.vue'
import ProgressRing from './ProgressRing.vue'
import AppIcon from './AppIcon.vue'
import DelightfulLoader from './DelightfulLoader.vue'
import ActivityInsights from './ActivityInsights.vue'

const props = defineProps({
  stats: {
    type: Object,
    required: true,
    default: () => ({
      poop: 0,
      pee: 0,
      food: 0,
      sleep: 0,
      meds: 0,
      walk: 0,
      total: 0
    })
  },
  petName: {
    type: String,
    default: ''
  },
  activities: {
    type: Array,
    default: () => []
  }
})

const activitiesStore = useActivitiesStore()

// Formatted date
const formattedDate = computed(() => {
  return format(new Date(), 'EEEE, MMMM d')
})

// Activity breakdown with percentages
const activityBreakdown = computed(() => {
  const total = props.stats.total || 1 // Prevent division by zero
  return [
    { type: 'Poop', emoji: '💩', count: props.stats.poop, percentage: (props.stats.poop / total) * 100 },
    { type: 'Pee', emoji: '💧', count: props.stats.pee, percentage: (props.stats.pee / total) * 100 },
    { type: 'Food', emoji: '🍖', count: props.stats.food, percentage: (props.stats.food / total) * 100 },
    { type: 'Sleep', emoji: '😴', count: props.stats.sleep, percentage: (props.stats.sleep / total) * 100 },
    { type: 'Meds', emoji: '💊', count: props.stats.meds, percentage: (props.stats.meds / total) * 100 },
    { type: 'Walk', emoji: '🚶', count: props.stats.walk, percentage: (props.stats.walk / total) * 100 }
  ]
})

// Bathroom progress (goal: 6 per day)
const bathroomProgress = computed(() => {
  const total = props.stats.poop + props.stats.pee
  return Math.min((total / 6) * 100, 100)
})

// Last activity
const lastActivity = computed(() => {
  const recent = activitiesStore.todayActivities
  if (recent.length === 0) return null

  const last = recent[0]
  return {
    type: last.type,
    emoji: last.emoji,
    timeAgo: formatDistanceToNow(new Date(last.timestamp), { addSuffix: true })
  }
})

// Get last 7 days labels
const last7DaysLabels = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return format(date, 'EEE')
  })
})

// Get last 7 days data for a specific activity type
const getLast7Days = (type) => {
  // Mock data for now - in real implementation, this would come from the store
  // This is a placeholder to show the visualization
  return Array.from({ length: 7 }, () => Math.floor(Math.random() * 10))
}

// Get tooltips for last 7 days
const getLast7DaysTooltips = (type) => {
  return last7DaysLabels.value.map((label, i) => {
    return `${label}: ${getLast7Days(type)[i]} activities`
  })
}

// Calculate trend (mock - would need historical data)
const calculateTrend = (type) => {
  // Mock trend calculation - in real implementation, compare with yesterday
  return Math.floor(Math.random() * 41) - 20 // Random between -20 and +20
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
