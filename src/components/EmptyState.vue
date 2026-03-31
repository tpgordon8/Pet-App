<template>
  <div class="empty-state animate-fade-in motion-reduce:animate-none">
    <div class="empty-state-content">
      <!-- Animated icon -->
      <div class="empty-icon-wrapper">
        <span class="empty-icon" :class="{ 'empty-icon-pulse': pulse }">
          {{ icon }}
        </span>
        <div v-if="showDecorations" class="decoration-circle decoration-1"></div>
        <div v-if="showDecorations" class="decoration-circle decoration-2"></div>
        <div v-if="showDecorations" class="decoration-circle decoration-3"></div>
      </div>

      <!-- Title -->
      <h3 class="empty-title">{{ title }}</h3>

      <!-- Description -->
      <p class="empty-description">{{ description }}</p>

      <!-- Action button -->
      <button
        v-if="actionLabel"
        @click="$emit('action')"
        class="btn btn-primary mt-4"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
// defineProps and defineEmits are compiler macros in Vue 3 - no import needed

defineProps({
  icon: {
    type: String,
    default: '🐾'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  actionLabel: {
    type: String,
    default: ''
  },
  pulse: {
    type: Boolean,
    default: true
  },
  showDecorations: {
    type: Boolean,
    default: true
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 3rem 1.5rem;
}

.empty-state-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.empty-icon {
  @apply text-6xl mb-4 opacity-50;
  display: inline-block;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.1));
}

.empty-icon-pulse {
  animation: gentle-bounce 2s ease-in-out infinite;
}

.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, rgba(139, 154, 125, 0.1) 50%, transparent 70%);
  animation: float 3s ease-in-out infinite;
}

.decoration-1 {
  width: 60px;
  height: 60px;
  top: -10px;
  left: -20px;
  animation-delay: 0s;
}

.decoration-2 {
  width: 40px;
  height: 40px;
  top: 20px;
  right: -10px;
  animation-delay: 0.5s;
}

.decoration-3 {
  width: 50px;
  height: 50px;
  bottom: -5px;
  left: 50%;
  animation-delay: 1s;
}

.empty-title {
  @apply text-xl font-semibold mb-2 text-gray-900 dark:text-white;
}

.empty-description {
  @apply text-gray-600 dark:text-gray-400 mb-6;
}

@keyframes gentle-bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) scale(1.1);
    opacity: 0.5;
  }
}

@media (max-width: 640px) {
  .empty-icon {
    font-size: 4rem;
  }

  .empty-title {
    font-size: 1.25rem;
  }

  .empty-description {
    font-size: 0.875rem;
  }
}
</style>
