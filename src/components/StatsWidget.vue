<template>
  <div class="stats-widget card">
    <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
      Today's Activity
      <span v-if="petName" class="text-sage-600 dark:text-sage-400 font-normal">
        - {{ petName }}
      </span>
    </h3>

    <div class="grid grid-cols-3 gap-4">
      <!-- Poop -->
      <div class="stat-item">
        <span class="text-2xl">💩</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.poop }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Poop</span>
      </div>

      <!-- Pee -->
      <div class="stat-item">
        <span class="text-2xl">💧</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.pee }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Pee</span>
      </div>

      <!-- Food -->
      <div class="stat-item">
        <span class="text-2xl">🍖</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.food }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Food</span>
      </div>

      <!-- Sleep -->
      <div class="stat-item">
        <span class="text-2xl">😴</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.sleep }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Sleep</span>
      </div>

      <!-- Meds -->
      <div class="stat-item">
        <span class="text-2xl">💊</span>
        <span class="text-xl font-bold text-gray-900 dark:text-white">{{ stats.meds }}</span>
        <span class="text-xs text-gray-600 dark:text-gray-400">Meds</span>
      </div>

      <!-- Total -->
      <div class="stat-item bg-sage-50 dark:bg-sage-900/20 rounded-lg">
        <span class="text-2xl">📊</span>
        <span class="text-xl font-bold text-sage-600 dark:text-sage-400">{{ stats.total }}</span>
        <span class="text-xs text-sage-600 dark:text-sage-400">Total</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
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
</script>

<style scoped>
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem;
}

@media (max-width: 640px) {
  .stats-widget .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
