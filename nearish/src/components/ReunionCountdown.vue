<template>
  <div class="text-center space-y-2">
    <div class="section-label text-center">Next together</div>

    <div v-if="!reunionDate" class="text-white/40 text-sm">
      Set reunion date in settings ⚙️
    </div>

    <div v-else-if="countdown?.past" class="space-y-1">
      <div class="text-4xl animate-heartbeat">🎉</div>
      <div class="text-white font-bold text-lg">You made it!</div>
    </div>

    <div v-else class="flex items-end justify-center gap-4">
      <div class="text-center">
        <div class="font-mono text-5xl font-bold text-white tabular-nums leading-none">{{ countdown.days }}</div>
        <div class="text-xs text-white/50 mt-1 tracking-widest uppercase">days</div>
      </div>
      <div class="text-white/30 text-3xl font-light mb-2">:</div>
      <div class="text-center">
        <div class="font-mono text-5xl font-bold text-white tabular-nums leading-none">{{ pad(countdown.hours) }}</div>
        <div class="text-xs text-white/50 mt-1 tracking-widest uppercase">hours</div>
      </div>
      <div class="text-white/30 text-3xl font-light mb-2">:</div>
      <div class="text-center">
        <div class="font-mono text-5xl font-bold text-white tabular-nums leading-none">{{ pad(countdown.minutes) }}</div>
        <div class="text-xs text-white/50 mt-1 tracking-widest uppercase">mins</div>
      </div>
    </div>

    <div v-if="reunionDate && !countdown?.past" class="text-white/40 text-xs">
      {{ formattedDate }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  countdown: Object,
  reunionDate: String,
})

function pad(n) {
  return String(n).padStart(2, '0')
}

const formattedDate = computed(() => {
  if (!props.reunionDate) return ''
  const d = new Date(props.reunionDate + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})
</script>
