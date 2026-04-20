<template>
  <Transition name="banner">
    <div
      v-if="activeTimer"
      class="meds-banner"
      :class="isDue ? 'banner-due' : 'banner-countdown'"
      role="status"
      aria-live="polite"
    >
      <span class="banner-icon">💊</span>
      <div class="banner-text">
        <span v-if="isDue" class="banner-title">Dose due now!</span>
        <span v-else class="banner-title">Next dose in {{ timeLeftDisplay }}</span>
        <span class="banner-sub">
          {{ isDue ? 'Time to give medication' : `Set ${activeTimer.nextDoseDurationHours}h window` }}
        </span>
      </div>
      <button
        class="banner-dismiss"
        aria-label="Dismiss timer"
        @click="emit('dismiss', activeTimer.id)"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['dismiss'])

const now = ref(Date.now())
let interval = null

onMounted(() => {
  interval = setInterval(() => { now.value = Date.now() }, 60 * 1000)
})

onUnmounted(() => {
  clearInterval(interval)
})

const activeTimer = computed(() => {
  return props.activities
    .filter(a => a.type === 'Meds' && a.nextDoseAt)
    .sort((a, b) => b.timestamp - a.timestamp)[0] ?? null
})

const isDue = computed(() => {
  if (!activeTimer.value) return false
  return now.value >= activeTimer.value.nextDoseAt
})

const timeLeftDisplay = computed(() => {
  if (!activeTimer.value || isDue.value) return ''
  const ms = activeTimer.value.nextDoseAt - now.value
  const totalMinutes = Math.ceil(ms / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h`
  return `${minutes}m`
})
</script>

<style scoped>
.meds-banner {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 12px;
  margin-bottom: 4px;
}

.banner-countdown {
  background: linear-gradient(135deg, #dcfce7 0%, #d1fae5 100%);
  border: 1px solid #86efac;
  color: #166534;
}

:is(.dark) .banner-countdown {
  background: linear-gradient(135deg, rgba(74,222,128,0.12) 0%, rgba(52,211,153,0.12) 100%);
  border-color: rgba(74,222,128,0.3);
  color: #4ade80;
}

.banner-due {
  background: linear-gradient(135deg, #fef9c3 0%, #fef08a 100%);
  border: 1px solid #fbbf24;
  color: #92400e;
  animation: pulse-due 2s ease-in-out infinite;
}

:is(.dark) .banner-due {
  background: linear-gradient(135deg, rgba(251,191,36,0.15) 0%, rgba(245,158,11,0.15) 100%);
  border-color: rgba(251,191,36,0.4);
  color: #fbbf24;
}

@keyframes pulse-due {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.85; }
}

.banner-icon {
  font-size: 20px;
  flex-shrink: 0;
}

.banner-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.banner-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.3;
}

.banner-sub {
  font-size: 11px;
  opacity: 0.75;
  margin-top: 1px;
}

.banner-dismiss {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  font-size: 13px;
  opacity: 0.6;
  flex-shrink: 0;
  transition: opacity 0.15s;
  touch-action: manipulation;
}

.banner-dismiss:hover {
  opacity: 1;
}

.banner-enter-active,
.banner-leave-active {
  transition: all 0.25s ease;
}

.banner-enter-from,
.banner-leave-to {
  opacity: 0;
  transform: translateY(-8px);
  max-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .banner-enter-active,
  .banner-leave-active {
    transition: none;
  }
  .banner-due {
    animation: none;
  }
}
</style>
