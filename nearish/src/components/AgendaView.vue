<template>
  <div class="space-y-4">
    <!-- Day tabs -->
    <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      <button
        v-for="day in trip.days"
        :key="day.date"
        @click="activeDay = day.date"
        class="shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
        :class="activeDay === day.date
          ? 'bg-white/20 text-white border border-white/30'
          : 'text-white/50 hover:text-white/80 hover:bg-white/10'"
      >
        <span v-if="isToday(day.date)" class="mr-1 text-france-400">●</span>
        {{ day.shortLabel }}
      </button>
    </div>

    <!-- Event list for selected day -->
    <div class="space-y-2">
      <div
        v-for="event in selectedDay?.events"
        :key="event.title + event.start"
        class="flex items-start gap-3 p-3 rounded-2xl transition-all"
        :class="isCurrentEvent(event)
          ? 'bg-white/15 border border-white/25'
          : 'bg-white/5 border border-transparent'"
      >
        <div class="text-center shrink-0 w-14">
          <div class="text-xs text-white/60 font-mono">{{ event.start }}</div>
          <div class="text-xs text-white/30 font-mono">{{ formatEnd(event.end) }}</div>
        </div>
        <span class="text-lg leading-none mt-0.5">{{ event.emoji }}</span>
        <div class="min-w-0">
          <div class="flex items-center gap-2">
            <span class="text-white font-medium text-sm leading-tight">{{ event.title }}</span>
            <span v-if="isCurrentEvent(event)" class="text-xs bg-france-500/30 text-france-300 px-2 py-0.5 rounded-full font-medium">Now</span>
            <span v-if="event.optional" class="text-xs text-white/30">optional</span>
          </div>
          <div class="text-white/50 text-xs mt-0.5">{{ event.location }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TARA_TRIP } from '@/data/agenda'
import { toZonedTime, format } from 'date-fns-tz'

import { useTimezone } from '@/composables/useTimezone'

const props = defineProps({
  currentActivity: Object,
  todaySchedule: Object,
})

const trip = TARA_TRIP
const TARA_TZ = 'Europe/Paris'

const { now } = useTimezone()

const todayDate = computed(() => {
  const zoned = toZonedTime(now.value, TARA_TZ)
  return format(zoned, 'yyyy-MM-dd', { timeZone: TARA_TZ })
})

const activeDay = ref(props.todaySchedule?.date || TARA_TRIP.days[0].date)

const selectedDay = computed(() => trip.days.find(d => d.date === activeDay.value))

function isToday(date) {
  return date === todayDate.value
}

function isCurrentEvent(event) {
  if (activeDay.value !== todayDate.value) return false
  return props.currentActivity?.title === event.title &&
    props.currentActivity?.status === 'scheduled'
}

function formatEnd(end) {
  // Handle times past midnight (e.g., "25:00" → "01:00")
  const [h, m] = end.split(':').map(Number)
  const adjH = h % 24
  return `${String(adjH).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
