<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <span class="section-label">Best time to connect</span>
      <span
        class="text-xs font-semibold px-3 py-1 rounded-full"
        :class="statusClass"
      >
        {{ connectStatus.icon }} {{ connectStatus.label }}
      </span>
    </div>

    <!-- 24-hour bar -->
    <div class="relative">
      <div class="flex rounded-xl overflow-hidden h-7 gap-px bg-black/20">
        <div
          v-for="slot in overlapSlots"
          :key="slot.hour"
          class="flex-1 relative transition-colors duration-500"
          :class="slotClass(slot)"
          :title="`${slot.hour}:00`"
        ></div>
      </div>

      <!-- Current time pointer -->
      <div
        class="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        :style="{ left: `${(currentHour / 24) * 100}%` }"
      >
        <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full"></div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex items-center gap-4 text-xs text-white/50">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-emerald-400/70"></div>
        <span>Both awake</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-white/20"></div>
        <span>One awake</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-3 rounded-sm bg-black/30"></div>
        <span>Both sleeping</span>
      </div>
      <div class="ml-auto text-white/40">
        {{ overlapHours }}h overlap today
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  overlapSlots: Array,
  connectStatus: Object,
  currentHour: Number,
})

function slotClass(slot) {
  if (slot.overlap) return 'bg-emerald-400/70'
  if (slot.taraAwake || slot.meagAwake) return 'bg-white/20'
  return 'bg-black/30'
}

const statusClass = computed(() => {
  const c = props.connectStatus?.color
  if (c === 'emerald') return 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
  if (c === 'amber') return 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
  return 'bg-slate-500/20 text-slate-300 border border-slate-400/30'
})

const overlapHours = computed(() => {
  return props.overlapSlots?.filter(s => s.overlap).length ?? 0
})
</script>
