<template>
  <div class="stats-widget card-premium">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-heading text-gray-900 dark:text-white">
        Today's Activity
        <span v-if="petName" class="text-sage-600 dark:text-sage-400 font-normal text-sm">
          - {{ petName }}
        </span>
      </h3>
      <span v-if="stats.total > 0" class="stat-badge">
        {{ stats.total }} total
      </span>
    </div>

    <!-- Time-based insights (if any recent activity) -->
    <div v-if="lastActivity" class="mb-4 p-3 gradient-bg-soft rounded-xl border-l-4 border-sage-400 hover-lift">
      <div class="flex items-center gap-2">
        <span class="text-lg">⏰</span>
        <div class="flex-1 min-w-0">
          <p class="text-caption font-semibold text-gray-900 dark:text-white">
            Last {{ lastActivity.type }}
          </p>
          <p class="text-caption text-gray-600 dark:text-gray-400">
            {{ lastActivity.timeAgo }}
          </p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-3">
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatDistanceToNow } from 'date-fns'
import { useActivitiesStore } from '@/stores/activities'

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
  /* Expanded stat-card styles */
  @apply bg-white dark:bg-gray-800 rounded-2xl;
  @apply transition-all duration-300;
  @apply border border-gray-100 dark:border-gray-700;
  @apply flex items-center gap-4;
  @apply hover:border-sage-300 dark:hover:border-sage-600;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.875rem 0.5rem;
  overflow: hidden;
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.06),
    0 4px 8px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.stat-item.stat-active {
  @apply gradient-bg-soft;
  border-color: rgba(139, 154, 125, 0.4);
  box-shadow: 0 4px 12px rgba(139, 154, 125, 0.2);
}

.dark .stat-item.stat-active {
  border-color: rgba(139, 154, 125, 0.5);
  box-shadow: 0 4px 12px rgba(139, 154, 125, 0.3);
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
  .stats-widget .grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .stat-item {
    padding: 0.75rem 0.375rem;
  }
}

/* Smooth scroll for the widget */
.stats-widget {
  @apply animate-slide-up;
}
</style>
