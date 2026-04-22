<template>
  <div class="space-y-3">
    <div class="section-label">Time converter</div>
    <div class="flex items-center gap-3 flex-wrap">
      <input
        v-model="inputTime"
        type="time"
        class="glass-input w-36 font-mono"
      />
      <select v-model="inputTz" class="glass-input w-40">
        <option value="Europe/Paris">🇫🇷 Nice (France)</option>
        <option value="America/New_York">🇺🇸 Philadelphia</option>
      </select>
      <span class="text-white/50 text-sm">→</span>
      <div class="bg-white/10 border border-white/20 rounded-xl px-4 py-3 font-mono text-white font-semibold min-w-24 text-center">
        {{ converted }}
      </div>
      <span class="text-white/50 text-sm">{{ otherLabel }}</span>
    </div>
    <div class="text-xs text-white/30">
      France is {{ diffLabel }} Philadelphia
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { toZonedTime, format, fromZonedTime } from 'date-fns-tz'

const inputTime = ref('12:00')
const inputTz = ref('Europe/Paris')

const otherTz = computed(() =>
  inputTz.value === 'Europe/Paris' ? 'America/New_York' : 'Europe/Paris'
)
const otherLabel = computed(() =>
  otherTz.value === 'Europe/Paris' ? '🇫🇷 in Nice' : '🇺🇸 in Philadelphia'
)

const converted = computed(() => {
  try {
    const [h, m] = inputTime.value.split(':').map(Number)
    // Build a date in the input timezone
    const baseDate = new Date()
    baseDate.setHours(h, m, 0, 0)
    const utc = fromZonedTime(baseDate, inputTz.value)
    const other = toZonedTime(utc, otherTz.value)
    return format(other, 'HH:mm', { timeZone: otherTz.value })
  } catch {
    return '--:--'
  }
})

// Compute the offset difference description
const diffLabel = computed(() => {
  try {
    const now = new Date()
    const franceOffset = -toZonedTime(now, 'Europe/Paris').getTimezoneOffset()
    const phillyOffset = -toZonedTime(now, 'America/New_York').getTimezoneOffset()
    const diff = (franceOffset - phillyOffset) / 60
    return diff > 0 ? `${diff}h ahead of` : `${Math.abs(diff)}h behind`
  } catch {
    return '6h ahead of'
  }
})
</script>
