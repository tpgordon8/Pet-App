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
          class="chevron transition-transform duration-300"
          :class="{ 'chevron-expanded': !isCollapsed }"
        >
          ▼
        </span>
      </div>
    </button>

    <Transition
      name="collapse"
      @enter="onEnter"
      @after-enter="onAfterEnter"
      @leave="onLeave"
    >
      <div
        v-show="!isCollapsed"
        :id="`section-${sectionId}`"
        class="collapsible-content"
      >
        <slot></slot>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

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

// Smooth collapse/expand animations
function onEnter(el) {
  el.style.height = '0'
  el.style.overflow = 'hidden'
}

function onAfterEnter(el) {
  el.style.height = 'auto'
  el.style.overflow = 'visible'
}

function onLeave(el) {
  el.style.height = `${el.scrollHeight}px`
  el.style.overflow = 'hidden'

  // Force reflow
  // eslint-disable-next-line no-unused-expressions
  el.offsetHeight

  el.style.height = '0'
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
  transition: all 0.2s ease;
}

.collapsible-header:hover {
  transform: translateY(-2px);
}

.collapsible-header:active {
  transform: translateY(0);
}

.chevron {
  font-size: 0.875rem;
  color: #6b7280;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.collapsible-content {
  padding: 0 1.5rem 1.5rem;
}

/* Collapse transition */
.collapse-enter-active,
.collapse-leave-active {
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.collapse-enter-from,
.collapse-leave-to {
  height: 0;
  overflow: hidden;
}
</style>
