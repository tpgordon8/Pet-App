import { computed } from 'vue'
import { toZonedTime, format } from 'date-fns-tz'
import { TARA_TRIP, timeToHours } from '@/data/agenda'

const TARA_TZ = 'Europe/Paris'

function getDateKey(date) {
  return format(toZonedTime(date, TARA_TZ), 'yyyy-MM-dd', { timeZone: TARA_TZ })
}

function getFractionalHour(date) {
  const zoned = toZonedTime(date, TARA_TZ)
  return zoned.getHours() + zoned.getMinutes() / 60
}

export function useAgenda(nowRef) {
  const tripStatus = computed(() => {
    const dateKey = getDateKey(nowRef.value)
    if (dateKey < TARA_TRIP.startDate) return 'before'
    if (dateKey > TARA_TRIP.endDate) return 'after'
    return 'during'
  })

  const todaySchedule = computed(() => {
    const dateKey = getDateKey(nowRef.value)
    return TARA_TRIP.days.find(d => d.date === dateKey) || null
  })

  const currentHour = computed(() => getFractionalHour(nowRef.value))

  // Events active right now — handles times past midnight (end > 24)
  const activeEvents = computed(() => {
    if (!todaySchedule.value) return []
    const h = currentHour.value
    return todaySchedule.value.events.filter(e => {
      const start = timeToHours(e.start)
      const end = timeToHours(e.end)
      return h >= start && h < end
    })
  })

  // Non-optional events happening now take priority
  const currentActivity = computed(() => {
    if (tripStatus.value === 'before') {
      return { title: 'Getting ready for France!', location: 'Philadelphia', emoji: '✈️', status: 'pre-trip' }
    }
    if (tripStatus.value === 'after') {
      return { title: 'Back home', location: 'Philadelphia', emoji: '🏠', status: 'post-trip' }
    }

    const h = currentHour.value
    if (h < 6.5 || h >= 23) {
      return { title: 'Probably sleeping', location: 'Grand-Hôtel du Cap-Ferrat', emoji: '😴', status: 'sleeping' }
    }

    const required = activeEvents.value.filter(e => !e.optional)
    if (required.length > 0) {
      return { ...required[0], status: 'scheduled' }
    }

    const optional = activeEvents.value.filter(e => e.optional)
    if (optional.length === 1) {
      return { ...optional[0], status: 'scheduled' }
    }
    if (optional.length > 1) {
      return {
        title: 'Out on the Riviera',
        location: optional.map(e => e.title).join(' · '),
        emoji: '🌊',
        status: 'exploring',
        options: optional,
      }
    }

    return { title: 'At leisure', location: 'Grand-Hôtel du Cap-Ferrat', emoji: '🌴', status: 'leisure' }
  })

  const nextActivity = computed(() => {
    if (tripStatus.value !== 'during') return null
    const h = currentHour.value

    // Look in today's events first
    const upcoming = (todaySchedule.value?.events || [])
      .filter(e => timeToHours(e.start) > h && !e.optional)
      .sort((a, b) => timeToHours(a.start) - timeToHours(b.start))

    if (upcoming.length > 0) {
      const next = upcoming[0]
      const minutesUntil = Math.round((timeToHours(next.start) - h) * 60)
      return { ...next, minutesUntil }
    }

    // Check next day
    const dateKey = getDateKey(nowRef.value)
    const dayIdx = TARA_TRIP.days.findIndex(d => d.date === dateKey)
    if (dayIdx >= 0 && dayIdx < TARA_TRIP.days.length - 1) {
      const nextDay = TARA_TRIP.days[dayIdx + 1]
      const firstEvent = nextDay.events.find(e => !e.optional)
      if (firstEvent) {
        const minutesUntil = Math.round((24 - h + timeToHours(firstEvent.start)) * 60)
        return { ...firstEvent, minutesUntil, tomorrow: true }
      }
    }

    return null
  })

  return { tripStatus, todaySchedule, currentActivity, nextActivity, activeEvents }
}
