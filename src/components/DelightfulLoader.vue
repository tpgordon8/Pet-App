<template>
  <div class="delightful-loader flex flex-col items-center justify-center p-8">
    <!-- Animated loader -->
    <div class="relative mb-4">
      <!-- Main loader based on variant -->
      <div v-if="variant === 'paw-prints'" class="paw-prints-loader">
        <div
          v-for="i in 4"
          :key="i"
          class="paw-print"
          :style="{ animationDelay: `${i * 0.15}s` }"
        >
          🐾
        </div>
      </div>

      <div v-else-if="variant === 'dots'" class="dots-loader">
        <div
          v-for="i in 3"
          :key="i"
          class="dot"
          :style="{ animationDelay: `${i * 0.15}s` }"
        />
      </div>

      <div v-else-if="variant === 'spinner'" class="spinner-loader">
        <svg class="spinner" viewBox="0 0 50 50">
          <circle
            class="spinner-path"
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke-width="4"
          />
        </svg>
      </div>

      <div v-else-if="variant === 'pulse-ring'" class="pulse-ring-loader">
        <div class="pulse-ring" />
        <div class="pulse-ring" style="animation-delay: 0.3s" />
        <div class="pulse-ring" style="animation-delay: 0.6s" />
        <div class="center-icon">{{ icon }}</div>
      </div>

      <!-- Progress ring variant -->
      <div v-else-if="variant === 'progress' && progress !== undefined" class="progress-loader">
        <ProgressRing
          :value="progress"
          :size="80"
          :stroke-width="6"
          :show-percentage="showPercentage"
        >
          <template v-if="!showPercentage">
            <div class="text-2xl">{{ icon }}</div>
          </template>
        </ProgressRing>
      </div>
    </div>

    <!-- Loading text -->
    <div v-if="text" class="text-center">
      <div class="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {{ text }}
      </div>
      <div v-if="subtext" class="text-sm text-gray-600 dark:text-gray-400">
        {{ subtext }}
      </div>
    </div>

    <!-- Fun loading messages (optional) -->
    <div
      v-if="showFunMessage && currentMessage"
      class="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-sm text-purple-700 dark:text-purple-300 animate-fade-in"
    >
      {{ currentMessage }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import ProgressRing from './ProgressRing.vue'

const props = defineProps({
  // Loader variant
  variant: {
    type: String,
    default: 'paw-prints', // 'paw-prints' | 'dots' | 'spinner' | 'pulse-ring' | 'progress'
    validator: (val) =>
      ['paw-prints', 'dots', 'spinner', 'pulse-ring', 'progress'].includes(val)
  },

  // Display text
  text: {
    type: String,
    default: 'Loading...'
  },

  subtext: {
    type: String,
    default: ''
  },

  // Icon for pulse-ring and progress variants
  icon: {
    type: String,
    default: '🐾'
  },

  // Progress value (0-100) for progress variant
  progress: {
    type: Number,
    default: undefined
  },

  showPercentage: {
    type: Boolean,
    default: true
  },

  // Fun loading messages
  showFunMessage: {
    type: Boolean,
    default: false
  },

  funMessages: {
    type: Array,
    default: () => [
      'Fetching treats... 🦴',
      'Waking up the hamsters... 🐹',
      'Herding cats... 🐱',
      'Teaching old dogs new tricks... 🐕',
      'Counting sheep... 🐑',
      'Chasing tails... 🌀'
    ]
  }
})

const currentMessage = ref('')
let messageInterval = null

onMounted(() => {
  if (props.showFunMessage && props.funMessages.length > 0) {
    // Show first message immediately
    currentMessage.value = props.funMessages[0]

    // Rotate messages every 3 seconds
    messageInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * props.funMessages.length)
      currentMessage.value = props.funMessages[randomIndex]
    }, 3000)
  }
})

onUnmounted(() => {
  if (messageInterval) {
    clearInterval(messageInterval)
  }
})
</script>

<style scoped>
/* Paw prints loader */
.paw-prints-loader {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
}

.paw-print {
  animation: bounce-paw 1s ease-in-out infinite;
  opacity: 0.3;
}

@keyframes bounce-paw {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-10px) scale(1.2);
    opacity: 1;
  }
}

/* Dots loader */
.dots-loader {
  display: flex;
  gap: 0.5rem;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #a78bfa 0%, #f472b6 100%);
  animation: bounce-dot 1s ease-in-out infinite;
}

@keyframes bounce-dot {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-15px) scale(1.3);
  }
}

/* Spinner loader */
.spinner-loader {
  width: 60px;
  height: 60px;
}

.spinner {
  animation: rotate-spinner 2s linear infinite;
  width: 100%;
  height: 100%;
}

.spinner-path {
  stroke: url(#spinner-gradient);
  stroke-linecap: round;
  animation: dash-spinner 1.5s ease-in-out infinite;
}

@keyframes rotate-spinner {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash-spinner {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -124;
  }
}

/* Pulse ring loader */
.pulse-ring-loader {
  position: relative;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pulse-ring {
  position: absolute;
  width: 80px;
  height: 80px;
  border: 4px solid;
  border-color: #a78bfa;
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  opacity: 0;
}

.center-icon {
  font-size: 2rem;
  z-index: 10;
}

@keyframes pulse-ring {
  0% {
    transform: scale(0.5);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* Progress loader */
.progress-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Gradient for spinner */
svg defs {
  display: none;
}

/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .paw-print,
  .dot,
  .spinner,
  .spinner-path,
  .pulse-ring {
    animation: none;
  }

  .paw-print,
  .dot {
    opacity: 1;
  }
}
</style>
