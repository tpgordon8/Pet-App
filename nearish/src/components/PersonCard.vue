<template>
  <div class="glass-card p-6 space-y-5 relative overflow-hidden" :class="cardClass">
    <!-- Subtle accent glow in corner -->
    <div
      class="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 blur-2xl pointer-events-none"
      :style="{ background: accentColor }"
    ></div>

    <!-- Header: flag + location -->
    <div class="flex items-start justify-between">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-2xl">{{ flag }}</span>
          <div>
            <div class="text-white font-bold text-lg leading-tight">{{ name }}</div>
            <div class="text-white/50 text-xs">{{ location }}</div>
          </div>
        </div>
      </div>
      <slot name="badge" />
    </div>

    <!-- Large clock -->
    <div class="space-y-0.5">
      <div class="flex items-baseline gap-2">
        <span
          class="font-mono font-bold text-white tabular-nums text-shadow"
          :class="isTara ? 'text-6xl' : 'text-6xl'"
        >{{ time }}</span>
        <span class="font-mono text-white/40 text-2xl tabular-nums">{{ seconds }}</span>
      </div>
      <div class="text-white/50 text-sm">{{ date }}</div>
    </div>

    <!-- Divider -->
    <div class="border-t border-white/10"></div>

    <!-- Slot for activity/status content -->
    <slot />

    <!-- Weather at the bottom -->
    <div class="flex items-center gap-2 pt-1 border-t border-white/10">
      <slot name="weather" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  location: String,
  flag: String,
  time: String,
  seconds: String,
  date: String,
  isTara: { type: Boolean, default: false },
  accentColor: { type: String, default: '#60A5FA' },
})

const cardClass = computed(() =>
  props.isTara ? 'glass-card-france' : 'glass-card-philly'
)
</script>
