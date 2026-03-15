<template>
  <StepContainer
    title=""
    subtitle=""
    :stepKey="6"
  >
    <div class="success-content">
      <!-- Celebration -->
      <div class="celebration">
        <div class="celebration-icon">🎉</div>
        <h2 class="success-title" data-test="success-message">
          You're all set, {{ userName }}!
        </h2>
        <p class="success-subtitle">
          {{ petName }} is ready to be tracked.
        </p>
      </div>

      <!-- Preview Actions -->
      <div class="preview-section">
        <p class="preview-label">Try logging your first activity:</p>
        <div class="preview-buttons">
          <button
            v-for="activity in quickActivities"
            :key="activity.type"
            @click="handleQuickLog(activity.type)"
            class="preview-activity-button"
          >
            <span class="activity-emoji">{{ activity.emoji }}</span>
            <span class="activity-label">{{ activity.type }}</span>
          </button>
        </div>
      </div>

      <!-- Tour Options -->
      <div class="tour-options">
        <button
          @click="$emit('start-tour')"
          class="btn btn-primary w-full py-3 mb-3"
        >
          Quick Tour (30 seconds)
        </button>
        <button
          @click="$emit('skip-tour')"
          class="skip-tour-button"
        >
          Skip Tour →
        </button>
      </div>

      <!-- Confetti Animation -->
      <div v-if="showConfetti" class="confetti-container">
        <div v-for="i in 20" :key="i" class="confetti" :style="confettiStyle(i)"></div>
      </div>
    </div>
  </StepContainer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import StepContainer from './StepContainer.vue'

const props = defineProps({
  userName: {
    type: String,
    default: 'there'
  },
  petName: {
    type: String,
    default: 'Your pet'
  }
})

const emit = defineEmits(['start-tour', 'skip-tour', 'quick-log'])

const quickActivities = [
  { type: 'Poop', emoji: '💩' },
  { type: 'Food', emoji: '🍖' },
  { type: 'Walk', emoji: '🏃' },
  { type: 'Sleep', emoji: '😴' }
]

const showConfetti = ref(false)

onMounted(() => {
  // Trigger confetti animation
  showConfetti.value = true
  setTimeout(() => {
    showConfetti.value = false
  }, 3000)
})

function handleQuickLog(type) {
  emit('quick-log', type)
}

function confettiStyle(index) {
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
  const color = colors[index % colors.length]
  const left = Math.random() * 100
  const delay = Math.random() * 500
  const duration = 1000 + Math.random() * 1000

  return {
    left: `${left}%`,
    backgroundColor: color,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  }
}
</script>

<style scoped>
.success-content {
  margin-top: 1rem;
  position: relative;
}

.celebration {
  text-align: center;
  margin-bottom: 2rem;
}

.celebration-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  animation: bounce 1s ease-in-out;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.success-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.5rem;
}

.dark .success-title {
  color: #10b981;
}

.success-subtitle {
  font-size: 1.125rem;
  color: #6b7280;
}

.dark .success-subtitle {
  color: #9ca3af;
}

.preview-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(16, 185, 129, 0.05);
  border-radius: 0.75rem;
}

.dark .preview-section {
  background: rgba(16, 185, 129, 0.1);
}

.preview-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 1rem;
  text-align: center;
}

.dark .preview-label {
  color: #d1d5db;
}

.preview-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.preview-activity-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .preview-activity-button {
  background: #1f2937;
  border-color: #374151;
}

.preview-activity-button:hover {
  border-color: #10b981;
  transform: translateY(-2px);
}

.activity-emoji {
  font-size: 2rem;
}

.activity-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.dark .activity-label {
  color: #d1d5db;
}

.tour-options {
  margin-top: 2rem;
}

.skip-tour-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 150ms ease-in-out;
}

.dark .skip-tour-button {
  color: #9ca3af;
}

.skip-tour-button:hover {
  color: #10b981;
}

/* Confetti Animation */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 9999;
}

.confetti {
  position: absolute;
  top: -10px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  to {
    transform: translateY(100vh) rotate(360deg);
    opacity: 0;
  }
}
</style>
