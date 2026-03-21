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

    <!-- Empty State -->
    <div v-if="insights.length === 0" class="empty-state">
      <p class="empty-icon">📊</p>
      <p class="empty-text">No insights yet</p>
      <p class="empty-hint">Keep logging activities for at least 7 days to see patterns</p>
    </div>

    <!-- Insights List -->
    <div v-else class="insights-list">
      <InsightCard
        v-for="(insight, index) in insights"
        :key="`${insight.message}-${index}`"
        :insight="insight"
      />
    </div>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import { useActivityInsights } from '@/composables/useActivityInsights'
import InsightCard from './InsightCard.vue'

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

const insights = useActivityInsights(toRef(props, 'activities'))
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

@media (max-width: 640px) {
  .insights-container {
    padding: 1rem;
  }
}
</style>
