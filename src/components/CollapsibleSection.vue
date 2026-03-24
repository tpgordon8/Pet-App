<template>
  <div class="collapsible-section">
    <button
      @click="toggleCollapsed"
      class="collapsible-header card-interactive flex items-center justify-between w-full text-left"
      :aria-expanded="!isCollapsed"
      :aria-controls="`section-${sectionId}`"
    >
      <div class="flex items-center gap-3">
        <span v-if="icon" class="text-2xl">{{ icon }}</span>
        <div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ title }}
          </h3>
          <p v-if="subtitle" class="text-sm text-gray-600 dark:text-gray-400">
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span v-if="badge" class="badge">{{ badge }}</span>
        <span
          class="chevron"
          :class="{ 'chevron-expanded': !isCollapsed }"
        >
          ▼
        </span>
      </div>
    </button>

    <div
      :id="`section-${sectionId}`"
      class="collapsible-content-wrapper"
      :class="{ 'is-collapsed': isCollapsed }"
    >
      <div class="collapsible-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  badge: {
    type: [String, Number],
    default: ''
  },
  defaultCollapsed: {
    type: Boolean,
    default: false
  },
  sectionId: {
    type: String,
    default: () => `section-${Math.random().toString(36).substr(2, 9)}`
  }
})

const isCollapsed = ref(props.defaultCollapsed)

function toggleCollapsed() {
  isCollapsed.value = !isCollapsed.value
}
</script>

<style scoped>
.collapsible-section {
  margin-bottom: 1.5rem;
}

.collapsible-header {
  padding: 1rem 1.5rem;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
}

.collapsible-header:hover {
  transform: translateY(-2px);
}

.collapsible-header:active {
  transform: translateY(0);
  transition: transform 0.1s ease;
}

.chevron {
  font-size: 0.875rem;
  color: #6b7280;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
  display: inline-block;
}

.dark .chevron {
  color: #9ca3af;
}

.chevron-expanded {
  transform: rotate(180deg);
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.5rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 9999px;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
}

/* Smooth CSS-only collapse animation */
.collapsible-content-wrapper {
  max-height: 2000px;
  overflow: hidden;
  transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease,
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top;
  opacity: 1;
  transform: scaleY(1);
  will-change: max-height, opacity, transform;
}

.collapsible-content-wrapper.is-collapsed {
  max-height: 0;
  opacity: 0;
  transform: scaleY(0.95);
  transition: max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.2s ease,
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapsible-content {
  padding: 0 1.5rem 1.5rem;
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .collapsible-header,
  .chevron,
  .collapsible-content-wrapper {
    transition: none;
  }
}
</style>
