<template>
  <Transition name="slide-up">
    <div
      v-if="showPrompt"
      class="pwa-update-prompt"
      role="alertdialog"
      aria-labelledby="update-title"
      aria-describedby="update-description"
    >
      <div class="update-content">
        <div class="update-icon" aria-hidden="true">✨</div>
        <div class="update-text">
          <h3 id="update-title" class="update-title">Update Available</h3>
          <p id="update-description" class="update-description">
            A new version of Tailr is ready. Refresh to get the latest features!
          </p>
        </div>
        <div class="update-actions">
          <button
            class="btn-update"
            @click="updateApp"
            aria-label="Update now"
          >
            Update Now
          </button>
          <button
            class="btn-dismiss"
            @click="dismissPrompt"
            aria-label="Dismiss update notification"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const showPrompt = ref(false)
let registration = null

onMounted(() => {
  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((reg) => {
      registration = reg

      // Check for updates periodically (every 60 seconds)
      setInterval(() => {
        reg.update()
      }, 60 * 1000)

      // Listen for updates
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing

        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker is ready
            showPrompt.value = true
          }
        })
      })
    })

    // Listen for controller change (update activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Reload the page when new service worker takes control
      window.location.reload()
    })
  }
})

function updateApp() {
  showPrompt.value = false

  // Tell service worker to skip waiting and activate
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  }
}

function dismissPrompt() {
  showPrompt.value = false

  // Show again in 1 hour
  setTimeout(() => {
    showPrompt.value = true
  }, 60 * 60 * 1000)
}
</script>

<style scoped>
.pwa-update-prompt {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  max-width: 500px;
  width: calc(100% - 32px);
}

.update-content {
  background: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.update-icon {
  font-size: 32px;
  text-align: center;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% {
    transform: scale(1) rotate(0deg);
  }
  50% {
    transform: scale(1.1) rotate(5deg);
  }
}

.update-text {
  text-align: center;
}

.update-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a1a1a;
}

.update-description {
  font-size: 14px;
  margin: 0;
  color: #666;
  line-height: 1.5;
}

.update-actions {
  display: flex;
  gap: 12px;
}

.btn-update,
.btn-dismiss {
  flex: 1;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-update {
  background: linear-gradient(135deg, #8B9A7D 0%, #7a8970 100%);
  color: white;
}

.btn-update:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 154, 125, 0.3);
}

.btn-update:active {
  transform: translateY(0);
}

.btn-dismiss {
  background: #f0f0f0;
  color: #666;
}

.btn-dismiss:hover {
  background: #e5e5e5;
}

/* Transition animations */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-out;
}

.slide-up-enter-from {
  transform: translate(-50%, 20px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translate(-50%, 20px);
  opacity: 0;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .update-content {
    background: #2a2a2a;
    border-color: rgba(255, 255, 255, 0.1);
  }

  .update-title {
    color: #ffffff;
  }

  .update-description {
    color: #b0b0b0;
  }

  .btn-dismiss {
    background: #3a3a3a;
    color: #b0b0b0;
  }

  .btn-dismiss:hover {
    background: #4a4a4a;
  }
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .pwa-update-prompt {
    bottom: 16px;
    width: calc(100% - 24px);
  }

  .update-content {
    padding: 16px;
  }

  .update-icon {
    font-size: 28px;
  }

  .update-title {
    font-size: 16px;
  }

  .update-description {
    font-size: 13px;
  }

  .update-actions {
    flex-direction: column;
  }

  .btn-update,
  .btn-dismiss {
    padding: 10px 16px;
  }
}
</style>
