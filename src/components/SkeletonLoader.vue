<template>
  <div class="skeleton-loader" :class="variant">
    <!-- Activity Card Skeleton -->
    <template v-if="type === 'activity-card'">
      <div class="glass rounded-xl p-4 flex items-start gap-4">
        <div class="skeleton w-12 h-12 rounded-full flex-shrink-0"></div>
        <div class="flex-1 space-y-2">
          <div class="skeleton h-5 w-32 rounded"></div>
          <div class="skeleton h-4 w-24 rounded"></div>
          <div class="skeleton h-4 w-full rounded"></div>
        </div>
        <div class="skeleton w-16 h-8 rounded-lg flex-shrink-0"></div>
      </div>
    </template>

    <!-- Activity Button Skeleton -->
    <template v-else-if="type === 'activity-button'">
      <div class="glass rounded-2xl p-6 flex flex-col items-center gap-3 min-h-[140px]">
        <div class="skeleton w-12 h-12 rounded-full"></div>
        <div class="skeleton h-5 w-20 rounded"></div>
        <div class="skeleton h-4 w-16 rounded"></div>
      </div>
    </template>

    <!-- Stats Widget Skeleton -->
    <template v-else-if="type === 'stats-widget'">
      <div class="card">
        <div class="skeleton h-6 w-40 rounded mb-4"></div>
        <div class="grid grid-cols-3 gap-4">
          <div v-for="i in 6" :key="i" class="stat-item">
            <div class="skeleton w-8 h-8 rounded-full"></div>
            <div class="skeleton h-6 w-8 rounded"></div>
            <div class="skeleton h-3 w-12 rounded"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Generic Skeleton -->
    <template v-else>
      <div class="space-y-2">
        <div v-for="i in count" :key="i" class="skeleton h-4 rounded" :style="{ width: `${Math.random() * 40 + 60}%` }"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  type: {
    type: String,
    default: 'generic',
    validator: (value) => ['activity-card', 'activity-button', 'stats-widget', 'generic'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  variant: {
    type: String,
    default: '',
    validator: (value) => ['', 'compact', 'full'].includes(value)
  }
})
</script>

<style scoped>
.skeleton-loader {
  animation: fadeIn 0.3s ease-in-out;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
}

/* Different animation speeds for more organic feel */
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(229, 231, 235, 1) 0%,
    rgba(243, 244, 246, 1) 50%,
    rgba(229, 231, 235, 1) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.dark .skeleton {
  background: linear-gradient(
    90deg,
    rgba(55, 65, 81, 1) 0%,
    rgba(75, 85, 99, 1) 50%,
    rgba(55, 65, 81, 1) 100%
  );
  background-size: 200% 100%;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style>
