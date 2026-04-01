<template>
  <div class="streak-counter glass rounded-2xl p-4 relative overflow-hidden" @click="$emit('show-achievements')">
    <!-- Background decoration -->
    <div class="streak-bg"></div>

    <div class="relative z-10 flex items-center justify-between gap-4">
      <!-- Streak Info -->
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="streak-emoji">{{ streakEmoji }}</span>
          <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {{ streakMessage }}
          </h3>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Longest: {{ longestStreak }} days
        </p>
      </div>

      <!-- Streak Number (Big and Bold) -->
      <div class="streak-number-container">
        <div class="streak-number">
          {{ currentStreak }}
        </div>
        <div class="text-xs font-medium text-gray-600 dark:text-gray-400 text-center mt-1">
          day{{ currentStreak !== 1 ? 's' : '' }}
        </div>
      </div>
    </div>

    <!-- Achievement Progress (if next achievement exists) -->
    <div v-if="nextAchievement && currentStreak < 100" class="mt-3 relative z-10">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs text-gray-600 dark:text-gray-400">
          Next: {{ nextAchievement.title }}
        </span>
        <span class="text-xs font-medium text-gray-700 dark:text-gray-300">
          {{ Math.round(nextAchievementProgress) }}%
        </span>
      </div>
      <div class="progress-bar">
        <div
          class="progress-fill"
          :style="{
            width: `${nextAchievementProgress}%`,
            background: nextAchievement.color
          }"
        ></div>
      </div>
    </div>

    <!-- Achievement Count Badge -->
    <div
      v-if="unlockedAchievements.length > 0"
      class="achievement-badge"
      :title="`${unlockedAchievements.length} achievements unlocked`"
    >
      🏆 {{ unlockedAchievements.length }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStreaks } from '@/composables/useStreaks'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  }
})

defineEmits(['show-achievements'])

// Use streaks composable
const activitiesRef = computed(() => props.activities)
const {
  currentStreak,
  longestStreak,
  unlockedAchievements,
  nextAchievement,
  nextAchievementProgress,
  streakMessage
} = useStreaks(activitiesRef)

// Dynamic emoji based on streak
const streakEmoji = computed(() => {
  const streak = currentStreak.value

  if (streak === 0) return '🚀'
  if (streak < 7) return '🔥'
  if (streak < 30) return '🌟'
  if (streak < 100) return '💎'
  return '👑'
})
</script>

<style scoped>
/* Phase 9: Enhanced celebratory design */
.streak-counter {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid transparent;

  /* More celebratory gradient background */
  background: linear-gradient(
    135deg,
    #FEF3C7 0%,
    #FDE68A 100%
  );

  /* Stronger border with golden tone */
  border-color: rgba(245, 158, 11, 0.3);

  /* Enhanced shadow for depth */
  box-shadow:
    0 2px 4px rgba(245, 158, 11, 0.1),
    0 4px 12px rgba(245, 158, 11, 0.08),
    0 8px 24px rgba(245, 158, 11, 0.06);
}

.dark .streak-counter {
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.15) 0%,
    rgba(234, 88, 12, 0.1) 100%
  );
  border-color: rgba(245, 158, 11, 0.4);
}

.streak-counter:hover {
  transform: translateY(-3px);
  box-shadow:
    0 4px 8px rgba(245, 158, 11, 0.15),
    0 8px 20px rgba(245, 158, 11, 0.12),
    0 16px 32px rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.5);
}

/* Animated background decoration */
.streak-bg {
  position: absolute;
  top: 0;
  right: 0;
  width: 200px;
  height: 200px;
  background: radial-gradient(
    circle,
    rgba(251, 146, 60, 0.1) 0%,
    rgba(251, 146, 60, 0.05) 50%,
    transparent 100%
  );
  border-radius: 50%;
  transform: translate(50%, -50%);
  animation: pulse-bg 3s ease-in-out infinite;
}

.dark .streak-bg {
  background: radial-gradient(
    circle,
    rgba(251, 146, 60, 0.15) 0%,
    rgba(251, 146, 60, 0.08) 50%,
    transparent 100%
  );
}

@keyframes pulse-bg {
  0%, 100% {
    opacity: 0.5;
    transform: translate(50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(50%, -50%) scale(1.1);
  }
}

.streak-emoji {
  font-size: 1.5rem;
  display: inline-block;
  animation: bounce-emoji 2s ease-in-out infinite;
}

@keyframes bounce-emoji {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.streak-number-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
}

.streak-number {
  font-size: 2.5rem;
  font-weight: 900;  /* Bolder for emphasis */
  /* Enhanced gradient with golden tones */
  background: linear-gradient(135deg, #D97706 0%, #EA580C 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
  animation: pulse-number 2s ease-in-out infinite;
  /* Add subtle text shadow for depth */
  filter: drop-shadow(0 2px 4px rgba(217, 119, 6, 0.3));
}

@keyframes pulse-number {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Progress bar */
.progress-bar {
  height: 6px;
  background: rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.dark .progress-bar {
  background: rgba(255, 255, 255, 0.08);
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  animation: shimmer 2s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

/* Achievement badge with trophy glow */
.achievement-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;  /* Bolder */
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
  z-index: 20;
  animation: badge-pulse 3s ease-in-out infinite;
  /* Trophy icon glow effect */
  filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
}

@keyframes badge-pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 2px 8px rgba(245, 158, 11, 0.4);
    filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.4));
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.6);
    /* Enhanced glow on pulse */
    filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.6));
  }
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .streak-number {
    font-size: 2rem;
  }

  .streak-emoji {
    font-size: 1.25rem;
  }

  .streak-counter {
    padding: 0.75rem;
  }
}
</style>
