<template>
  <div class="space-y-4">
    <div class="section-label">Quick pings</div>

    <!-- Preset buttons -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in PING_PRESETS"
        :key="preset.text"
        @click="handlePing(preset.text)"
        :disabled="!identity || sending === preset.text"
        class="glass-btn text-sm transition-all duration-200"
        :class="sending === preset.text ? 'opacity-50 scale-95' : 'hover:scale-105 active:scale-95'"
      >
        {{ preset.text }}
      </button>
    </div>

    <!-- No identity warning -->
    <div v-if="!identity" class="text-white/40 text-xs text-center">
      Set your name in ⚙️ Settings to send pings
    </div>

    <!-- Recent pings feed -->
    <div v-if="pings.length > 0" class="space-y-2 max-h-40 overflow-y-auto">
      <TransitionGroup name="list">
        <div
          v-for="ping in pings.slice(0, 8)"
          :key="ping.id"
          class="flex items-center gap-3 text-sm"
        >
          <span
            class="font-semibold text-xs shrink-0"
            :class="ping.from === 'Tara' ? 'text-france-400' : 'text-philly-400'"
          >{{ ping.from }}</span>
          <span class="text-white/70 truncate">{{ ping.message }}</span>
          <span class="text-white/30 text-xs shrink-0 ml-auto">{{ timeAgo(ping.timestamp) }}</span>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  pings: Array,
  identity: String,
  PING_PRESETS: Array,
})

const emit = defineEmits(['send'])
const sending = ref(null)

async function handlePing(text) {
  if (sending.value) return
  sending.value = text
  try {
    await emit('send', text)
  } finally {
    setTimeout(() => { sending.value = null }, 800)
  }
}

function timeAgo(ts) {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>
