<template>
  <CollapsibleSection
    title="Today's Summary"
    :subtitle="petName ? `Activity breakdown for ${petName}` : 'Activity breakdown for all pets'"
    icon="📊"
    :badge="stats.total"
    :default-collapsed="defaultCollapsed"
    section-id="todays-summary"
  >
    <!-- Last Activity Insight -->
    <div v-if="lastActivity" class="mb-4 p-3 bg-gradient-to-r from-sage-50 to-transparent dark:from-sage-900/20 dark:to-transparent rounded-xl border-l-4 border-sage-400">
      <div class="flex items-center gap-2">
        <span class="text-lg">⏰</span>
        <div class="flex-1 min-w-0">
          <p class="text-xs font-medium text-gray-900 dark:text-white">
            Last {{ lastActivity.type }}
          </p>
          <p class="text-xs text-gray-600 dark:text-gray-400">
            {{ lastActivity.timeAgo }}
          </p>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-3 gap-3 mb-4">
      <!-- Poop -->
      <div class="stat-item" :class="{ 'stat-active': stats.poop > 0 }">
        <span class="text-2xl">💩</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.poop }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Poop</span>
        <div v-if="stats.poop > 0" class="stat-indicator"></div>
      </div>

      <!-- Pee -->
      <div class="stat-item" :class="{ 'stat-active': stats.pee > 0 }">
        <span class="text-2xl">💧</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.pee }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Pee</span>
        <div v-if="stats.pee > 0" class="stat-indicator"></div>
      </div>

      <!-- Food -->
      <div class="stat-item" :class="{ 'stat-active': stats.food > 0 }">
        <span class="text-2xl">🍖</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.food }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Food</span>
        <div v-if="stats.food > 0" class="stat-indicator"></div>
      </div>

      <!-- Sleep -->
      <div class="stat-item" :class="{ 'stat-active': stats.sleep > 0 }">
        <span class="text-2xl">😴</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.sleep }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Sleep</span>
        <div v-if="stats.sleep > 0" class="stat-indicator"></div>
      </div>

      <!-- Meds -->
      <div class="stat-item" :class="{ 'stat-active': stats.meds > 0 }">
        <span class="text-2xl">💊</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.meds }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Meds</span>
        <div v-if="stats.meds > 0" class="stat-indicator"></div>
      </div>

      <!-- Walk -->
      <div class="stat-item" :class="{ 'stat-active': stats.walk > 0 }">
        <span class="text-2xl">🚶</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.walk }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Walk</span>
        <div v-if="stats.walk > 0" class="stat-indicator"></div>
      </div>
    </div>

    <!-- Activity Insights Component (if activities exist) -->
    <ActivityInsights
      v-if="activities && activities.length > 0"
      :activities="activities"
      :pet-name="petName"
    />
  </CollapsibleSection>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities'
import CollapsibleSection from './CollapsibleSection.vue'
import LoadingSpinner from './LoadingSpinner.vue'

const ActivityInsights = defineAsyncComponent({
  loader: () => import('./ActivityInsights.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 10000
})

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
  },
  defaultCollapsed: {
    type: Boolean,
    default: true
  }
})

const activitiesStore = useActivitiesStore()

// Compute last activity with time ago
const lastActivity = computed(() => {
  const recent = activitiesStore.todayActivities
  if (recent.length === 0) return null

  const last = recent[0] // Already sorted by timestamp descending
  return {
    type: last.type,
    emoji: last.emoji,
    timeAgo: formatDistanceToNow(new Date(last.timestamp), { addSuffix: true })
  }
})
</script>

<style scoped>
.stat-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.875rem 0.5rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, rgba(243, 244, 246, 0.5) 0%, rgba(255, 255, 255, 0.3) 100%);
  border: 1px solid rgba(229, 231, 235, 0.6);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.dark .stat-item {
  background: linear-gradient(135deg, rgba(55, 65, 81, 0.3) 0%, rgba(31, 41, 55, 0.2) 100%);
  border-color: rgba(75, 85, 99, 0.4);
}

.stat-item.stat-active {
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.15) 0%, rgba(109, 126, 96, 0.08) 100%);
  border-color: rgba(139, 154, 125, 0.3);
  box-shadow: 0 2px 8px rgba(139, 154, 125, 0.15);
}

.dark .stat-item.stat-active {
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.2) 0%, rgba(109, 126, 96, 0.12) 100%);
  border-color: rgba(139, 154, 125, 0.4);
}

.stat-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.2);
  }
}

@media (max-width: 640px) {
  .stat-item {
    padding: 0.75rem 0.375rem;
  }
}
</style>
