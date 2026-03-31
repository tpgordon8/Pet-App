<template>
  <Transition name="slide-down">
    <div
      v-if="!isOnline"
      class="offline-indicator"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div class="offline-content">
        <span class="offline-icon" aria-hidden="true">📡</span>
        <div class="offline-text">
          <p class="offline-title">You're offline</p>
          <p class="offline-subtitle">Changes will sync when you're back online</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)

function updateOnlineStatus() {
  isOnline.value = navigator.onLine
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)
})
</script>

<style scoped>
.offline-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.offline-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.offline-icon {
  font-size: 24px;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
}

.offline-text {
  flex: 1;
}

.offline-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}

.offline-subtitle {
  font-size: 12px;
  margin: 0;
  opacity: 0.95;
  line-height: 1.3;
}

/* Transition animations */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .offline-indicator {
    background: linear-gradient(135deg, #d63031 0%, #c23940 100%);
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .offline-indicator {
    padding: 10px 12px;
  }

  .offline-icon {
    font-size: 20px;
  }

  .offline-title {
    font-size: 13px;
  }

  .offline-subtitle {
    font-size: 11px;
  }
}
</style>
