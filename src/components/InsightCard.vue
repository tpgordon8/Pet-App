<template>
  <div
    class="insight-card"
    :class="`insight-${insight.type}`"
    role="alert"
    :aria-live="insight.severity === 'warning' ? 'assertive' : 'polite'"
    :aria-label="`${insight.severity || 'info'} insight: ${insight.message}`"
  >
    <div class="insight-icon" aria-hidden="true">{{ insight.emoji }}</div>
    <div class="insight-content">
      <div class="insight-text">{{ insight.message }}</div>
      <div class="insight-meta">{{ insight.detail }}</div>
    </div>
    <div
      v-if="insight.severity"
      class="insight-badge"
      :class="`badge-${insight.severity}`"
      :aria-label="`Severity: ${insight.severity}`"
    >
      {{ insight.severity }}
    </div>
  </div>
</template>

<script setup>
defineProps({
  insight: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
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
