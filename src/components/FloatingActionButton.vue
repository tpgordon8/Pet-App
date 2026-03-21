<template>
  <div class="fab-container">
    <!-- Main FAB Button -->
    <Transition name="fab-main">
      <button
        v-if="!isExpanded"
        @click="toggleExpanded"
        class="fab-main"
        aria-label="Quick log activity"
        :style="{ transform: fabPressed ? 'scale(0.9)' : 'scale(1)' }"
        @touchstart="fabPressed = true"
        @touchend="fabPressed = false"
        @mousedown="fabPressed = true"
        @mouseup="fabPressed = false"
      >
        <span class="fab-icon">⚡</span>
      </button>
    </Transition>

    <!-- Quick Action Menu -->
    <Transition name="fab-menu">
      <div v-if="isExpanded" class="fab-menu">
        <button
          @click="closeMenu"
          class="fab-close"
          aria-label="Close quick actions"
        >
          <span class="text-2xl">✕</span>
        </button>

        <div class="fab-actions-grid">
          <button
            v-for="action in quickActions"
            :key="action.type"
            @click="handleQuickLog(action)"
            class="fab-action"
            :aria-label="`Quick log ${action.type}`"
          >
            <span class="text-3xl">{{ action.emoji }}</span>
            <span class="text-xs font-medium">{{ action.label }}</span>
          </button>
        </div>
      </div>
    </Transition>

    <!-- Backdrop -->
    <Transition name="fab-backdrop">
      <div
        v-if="isExpanded"
        class="fab-backdrop"
        @click="closeMenu"
      ></div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['quick-log'])

const isExpanded = ref(false)
const fabPressed = ref(false)

const quickActions = [
  { type: 'Poop', emoji: '💩', label: 'Poop' },
  { type: 'Pee', emoji: '💧', label: 'Pee' },
  { type: 'Food', emoji: '🍖', label: 'Food' },
  { type: 'Walk', emoji: '🚶', label: 'Walk' },
  { type: 'Meds', emoji: '💊', label: 'Meds' },
  { type: 'Sleep', emoji: '😴', label: 'Sleep' }
]

function toggleExpanded() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value) {
    // Haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(10)
    }
  }
}

function closeMenu() {
  isExpanded.value = false
}

function handleQuickLog(action) {
  // Haptic feedback
  if (navigator.vibrate) {
    navigator.vibrate(15)
  }

  emit('quick-log', { type: action.type, emoji: action.emoji })
  closeMenu()
}
</script>

<style scoped>
.fab-container {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 1000;
}

/* Main FAB Button */
.fab-main {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4),
              0 2px 8px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.fab-main:hover {
  transform: scale(1.1);
  box-shadow: 0 12px 32px rgba(16, 185, 129, 0.5),
              0 4px 12px rgba(0, 0, 0, 0.15);
}

.fab-main:active {
  transform: scale(0.95);
}

.fab-icon {
  font-size: 2rem;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

/* Backdrop */
.fab-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 998;
}

/* FAB Menu */
.fab-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  padding: 1.5rem;
  padding-bottom: 2rem;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.1);
  z-index: 999;
  max-height: 60vh;
  overflow-y: auto;
}

.dark .fab-menu {
  background: #1f2937;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.3);
}

.fab-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.dark .fab-close {
  background: rgba(255, 255, 255, 0.1);
  color: #9ca3af;
}

.fab-close:hover {
  background: rgba(0, 0, 0, 0.1);
  transform: rotate(90deg);
}

.dark .fab-close:hover {
  background: rgba(255, 255, 255, 0.15);
}

.fab-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 3rem;
}

.fab-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 0.75rem;
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.1) 0%, rgba(109, 126, 96, 0.05) 100%);
  border: 2px solid rgba(139, 154, 125, 0.2);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100px;
  min-width: 44px;
  color: #374151;
}

.dark .fab-action {
  background: linear-gradient(135deg, rgba(139, 154, 125, 0.15) 0%, rgba(109, 126, 96, 0.1) 100%);
  border-color: rgba(139, 154, 125, 0.3);
  color: #d1d5db;
}

.fab-action:hover {
  transform: translateY(-4px);
  border-color: #8B9A7D;
  box-shadow: 0 8px 16px rgba(139, 154, 125, 0.3);
}

.fab-action:active {
  transform: translateY(-2px);
}

/* Animations */
.fab-main-enter-active,
.fab-main-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-main-enter-from,
.fab-main-leave-to {
  opacity: 0;
  transform: scale(0) rotate(180deg);
}

.fab-menu-enter-active,
.fab-menu-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fab-menu-enter-from,
.fab-menu-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

.fab-backdrop-enter-active,
.fab-backdrop-leave-active {
  transition: all 0.3s ease;
}

.fab-backdrop-enter-from,
.fab-backdrop-leave-to {
  opacity: 0;
}

/* Desktop adjustments */
@media (min-width: 768px) {
  .fab-menu {
    bottom: 5rem;
    right: 1.5rem;
    left: auto;
    width: 360px;
    border-radius: 1.5rem;
    padding-bottom: 1.5rem;
  }

  .fab-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .fab-menu-enter-from,
  .fab-menu-leave-to {
    transform: translateY(20px) scale(0.9);
  }
}

/* Safe area for mobile notches */
@supports (padding-bottom: env(safe-area-inset-bottom)) {
  .fab-main {
    bottom: calc(1.5rem + env(safe-area-inset-bottom));
  }

  .fab-menu {
    padding-bottom: calc(2rem + env(safe-area-inset-bottom));
  }
}
</style>
