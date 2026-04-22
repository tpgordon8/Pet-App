<template>
  <div class="space-y-3">
    <!-- Current activity -->
    <div class="space-y-1">
      <div class="text-xs text-white/50 font-medium tracking-widest uppercase">Right now</div>
      <div class="flex items-start gap-3">
        <span class="text-2xl leading-none mt-0.5">{{ current.emoji }}</span>
        <div class="min-w-0">
          <div class="text-white font-semibold leading-tight">{{ current.title }}</div>
          <div class="text-white/60 text-sm mt-0.5 truncate">{{ current.location }}</div>
          <div v-if="current.status === 'exploring' && current.options" class="mt-1.5 flex flex-wrap gap-1">
            <span
              v-for="opt in current.options"
              :key="opt.title"
              class="text-xs bg-white/10 border border-white/15 rounded-lg px-2 py-0.5 text-white/70"
            >
              {{ opt.emoji }} {{ opt.title }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Next activity -->
    <div v-if="next" class="flex items-center gap-3 py-2 px-3 bg-white/5 rounded-2xl border border-white/10">
      <span class="text-base">{{ next.emoji }}</span>
      <div class="min-w-0 flex-1">
        <div class="text-white/80 text-sm font-medium leading-tight">{{ next.title }}</div>
        <div class="text-white/50 text-xs mt-0.5">{{ next.location }}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="text-white/70 text-xs font-medium">
          {{ next.tomorrow ? 'Tomorrow' : 'In ' + formatMins(next.minutesUntil) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  current: { type: Object, required: true },
  next: { type: Object, default: null },
})

function formatMins(mins) {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}
</script>
