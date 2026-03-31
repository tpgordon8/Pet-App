<template>
  <div class="delightful-empty-state text-center py-12 px-6 animate-fade-in">
    <!-- Animated illustration container -->
    <div class="relative inline-block mb-6">
      <!-- Background glow effect -->
      <div
        class="absolute inset-0 blur-3xl opacity-30 animate-pulse motion-reduce:animate-none"
        :style="{ background: glowColor }"
      />

      <!-- Icon/Illustration -->
      <div
        class="relative text-8xl mb-2 inline-block animate-bounce-gentle motion-reduce:animate-none"
        :class="iconClass"
      >
        <slot name="icon">
          {{ icon }}
        </slot>
      </div>

      <!-- Decorative elements -->
      <div
        v-if="showDecorations"
        class="absolute -top-2 -right-2 w-6 h-6 bg-accent-pink rounded-full opacity-60 animate-ping motion-reduce:animate-none"
      />
      <div
        v-if="showDecorations"
        class="absolute -bottom-2 -left-2 w-4 h-4 bg-accent-purple rounded-full opacity-60 animate-pulse motion-reduce:animate-none"
        style="animation-delay: 0.5s"
      />
    </div>

    <!-- Title -->
    <h3
      class="text-2xl font-bold mb-3"
      :class="variant === 'playful' ? 'gradient-text-vibrant' : 'text-gray-900 dark:text-white'"
    >
      {{ title }}
    </h3>

    <!-- Description -->
    <p class="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
      {{ description }}
    </p>

    <!-- Action button -->
    <div v-if="$slots.action || actionLabel" class="space-y-3">
      <slot name="action">
        <button
          v-if="actionLabel"
          class="btn-pill-primary active-press"
          @click="$emit('action')"
        >
          {{ actionLabel }}
        </button>
      </slot>

      <!-- Secondary action -->
      <div v-if="$slots['secondary-action']" class="mt-3">
        <slot name="secondary-action" />
      </div>
    </div>

    <!-- Fun facts or tips (optional) -->
    <div
      v-if="tip"
      class="mt-8 p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 max-w-sm mx-auto"
    >
      <div class="flex items-start gap-3 text-left">
        <div class="text-2xl">💡</div>
        <div class="flex-1">
          <div class="text-sm font-semibold text-purple-900 dark:text-purple-300 mb-1">
            Pro Tip
          </div>
          <div class="text-sm text-purple-700 dark:text-purple-400">
            {{ tip }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  // Content
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

  tip: {
    type: String,
    default: ''
  },

  // Styling
  variant: {
    type: String,
    default: 'playful', // 'playful' | 'professional'
    validator: (val) => ['playful', 'professional'].includes(val)
  },

  colorScheme: {
    type: String,
    default: 'purple', // 'purple' | 'pink' | 'teal' | 'orange'
    validator: (val) => ['purple', 'pink', 'teal', 'orange'].includes(val)
  },

  iconClass: {
    type: String,
    default: ''
  },

  showDecorations: {
    type: Boolean,
    default: true
  }
})

defineEmits(['action'])

const glowColor = computed(() => {
  const colors = {
    purple: 'radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)',
    pink: 'radial-gradient(circle, rgba(244, 114, 182, 0.4) 0%, transparent 70%)',
    teal: 'radial-gradient(circle, rgba(45, 212, 191, 0.4) 0%, transparent 70%)',
    orange: 'radial-gradient(circle, rgba(251, 146, 60, 0.4) 0%, transparent 70%)'
  }
  return colors[props.colorScheme] || colors.purple
})
</script>

<style scoped>
/* Gentle bounce animation for icon */
@keyframes bounce-gentle {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-bounce-gentle {
  animation: bounce-gentle 3s ease-in-out infinite;
}

/* Prevent animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  .animate-bounce-gentle,
  .animate-pulse,
  .animate-ping {
    animation: none;
  }

  .delightful-empty-state {
    animation: none;
  }
}
</style>
