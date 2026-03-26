<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="close"
      >
        <div class="modal-content glass-strong rounded-2xl max-w-2xl w-full p-6 shadow-glass-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <span>🏆</span>
                Achievements
              </h2>
              <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {{ unlockedCount }} of {{ totalCount }} unlocked
              </p>
            </div>
            <button
              @click="close"
              class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl"
              aria-label="Close achievements"
            >
              ✕
            </button>
          </div>

          <!-- Stats Summary -->
          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="stat-card">
              <div class="stat-emoji">🔥</div>
              <div class="stat-value">{{ currentStreak }}</div>
              <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
              <div class="stat-emoji">📊</div>
              <div class="stat-value">{{ totalActivities }}</div>
              <div class="stat-label">Total Logged</div>
            </div>
            <div class="stat-card">
              <div class="stat-emoji">⭐</div>
              <div class="stat-value">{{ longestStreak }}</div>
              <div class="stat-label">Best Streak</div>
            </div>
          </div>

          <!-- Achievements Grid -->
          <div class="space-y-6">
            <!-- Unlocked Achievements -->
            <div v-if="unlockedAchievements.length > 0">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>✨</span>
                Unlocked ({{ unlockedAchievements.length }})
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="achievement in unlockedAchievements"
                  :key="achievement.id"
                  class="achievement-card unlocked"
                  :style="{ borderColor: achievement.color }"
                >
                  <div class="achievement-emoji" :style="{ backgroundColor: achievement.color }">
                    {{ achievement.emoji }}
                  </div>
                  <div class="achievement-content">
                    <h4 class="achievement-title">{{ achievement.title }}</h4>
                    <p class="achievement-description">{{ achievement.description }}</p>
                  </div>
                  <div class="achievement-checkmark">✓</div>
                </div>
              </div>
            </div>

            <!-- Locked Achievements -->
            <div v-if="lockedAchievements.length > 0">
              <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <span>🔒</span>
                Locked ({{ lockedAchievements.length }})
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="achievement in lockedAchievements"
                  :key="achievement.id"
                  class="achievement-card locked"
                >
                  <div class="achievement-emoji-locked">
                    {{ achievement.emoji }}
                  </div>
                  <div class="achievement-content">
                    <h4 class="achievement-title-locked">{{ achievement.title }}</h4>
                    <p class="achievement-description-locked">{{ achievement.description }}</p>
                    <p class="achievement-progress" v-if="getProgress(achievement)">
                      {{ getProgress(achievement) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <div class="mt-6 flex justify-center">
            <button
              @click="close"
              class="btn btn-primary px-8"
            >
              Keep Going! 🚀
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useStreaks, ACHIEVEMENTS } from '@/composables/useStreaks'

const props = defineProps({
  show: {
    type: Boolean,
    required: true
  },
  activities: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close'])

// Use streaks composable
const activitiesRef = computed(() => props.activities)
const {
  currentStreak,
  longestStreak,
  totalActivities,
  unlockedAchievements
} = useStreaks(activitiesRef)

// Locked achievements
const lockedAchievements = computed(() => {
  return Object.values(ACHIEVEMENTS).filter(achievement => {
    return !unlockedAchievements.value.find(u => u.id === achievement.id)
  })
})

// Count stats
const unlockedCount = computed(() => unlockedAchievements.value.length)
const totalCount = computed(() => Object.values(ACHIEVEMENTS).length)

// Get progress towards locked achievement
function getProgress(achievement) {
  const { requirement } = achievement

  if (requirement.type === 'streak') {
    const progress = currentStreak.value
    const target = requirement.value
    if (progress > 0 && progress < target) {
      return `${progress} / ${target} days`
    }
  }

  if (requirement.type === 'count') {
    const progress = totalActivities.value
    const target = requirement.value
    if (progress > 0 && progress < target) {
      return `${progress} / ${target} activities`
    }
  }

  return null
}

function close() {
  emit('close')
}

// Lock/unlock body scroll
watch(() => props.show, (newVal) => {
  if (newVal) {
    document.body.classList.add('modal-open')
  } else {
    document.body.classList.remove('modal-open')
  }
})
</script>

<style scoped>
/* Modal transitions */
.modal-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
              opacity 0.25s ease;
}

.modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-leave-active .modal-content {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1),
              opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Stat cards */
.stat-card {
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  transition: all 0.2s;
}

.dark .stat-card {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.08);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.stat-emoji {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.dark .stat-label {
  color: #9ca3af;
}

/* Achievement cards */
.achievement-card {
  position: relative;
  padding: 1rem;
  border-radius: 1rem;
  border: 2px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  gap: 0.75rem;
  align-items: start;
}

.achievement-card.unlocked {
  background: rgba(255, 255, 255, 0.7);
  border-style: solid;
  animation: unlock-reveal 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dark .achievement-card.unlocked {
  background: rgba(0, 0, 0, 0.3);
}

.achievement-card.unlocked:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.achievement-card.locked {
  background: rgba(0, 0, 0, 0.03);
  border-color: rgba(0, 0, 0, 0.08);
  opacity: 0.6;
}

.dark .achievement-card.locked {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

@keyframes unlock-reveal {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

/* Achievement emoji */
.achievement-emoji {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.achievement-emoji-locked {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  background: rgba(0, 0, 0, 0.05);
  filter: grayscale(100%);
}

.dark .achievement-emoji-locked {
  background: rgba(255, 255, 255, 0.05);
}

/* Achievement content */
.achievement-content {
  flex: 1;
}

.achievement-title {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #374151;
  margin-bottom: 0.25rem;
}

.dark .achievement-title {
  color: #d1d5db;
}

.achievement-description {
  font-size: 0.8125rem;
  color: #6b7280;
  line-height: 1.4;
}

.dark .achievement-description {
  color: #9ca3af;
}

.achievement-title-locked {
  font-size: 0.9375rem;
  font-weight: 600;
  color: #9ca3af;
  margin-bottom: 0.25rem;
}

.dark .achievement-title-locked {
  color: #6b7280;
}

.achievement-description-locked {
  font-size: 0.8125rem;
  color: #9ca3af;
  line-height: 1.4;
}

.dark .achievement-description-locked {
  color: #6b7280;
}

.achievement-progress {
  font-size: 0.75rem;
  color: #fb923c;
  font-weight: 600;
  margin-top: 0.25rem;
}

/* Checkmark for unlocked */
.achievement-checkmark {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .stat-emoji {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.25rem;
  }

  .achievement-emoji,
  .achievement-emoji-locked {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.25rem;
  }
}
</style>
