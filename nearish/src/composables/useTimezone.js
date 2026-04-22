import { ref, computed, onUnmounted } from 'vue'
import { toZonedTime, format } from 'date-fns-tz'

const TARA_TZ = 'Europe/Paris'
const MEAG_TZ = 'America/New_York'

// Singleton clock — one interval shared across all components
const now = ref(new Date())
let tickInterval = null
let tickUsers = 0

function startTick() {
  tickUsers++
  if (!tickInterval) {
    tickInterval = setInterval(() => { now.value = new Date() }, 1000)
  }
}

function stopTick() {
  tickUsers--
  if (tickUsers <= 0 && tickInterval) {
    clearInterval(tickInterval)
    tickInterval = null
    tickUsers = 0
  }
}

function isAwake(hour) {
  return hour >= 7 && hour < 23
}

export function useTimezone() {
  startTick()
  onUnmounted(stopTick)

  const taraZoned = computed(() => toZonedTime(now.value, TARA_TZ))
  const meagZoned = computed(() => toZonedTime(now.value, MEAG_TZ))

  const taraHour = computed(() => taraZoned.value.getHours())
  const meagHour = computed(() => meagZoned.value.getHours())

  const taraTime = computed(() => format(taraZoned.value, 'HH:mm', { timeZone: TARA_TZ }))
  const taraSeconds = computed(() => format(taraZoned.value, 'ss', { timeZone: TARA_TZ }))
  const taraDate = computed(() => format(taraZoned.value, 'EEEE, MMMM d', { timeZone: TARA_TZ }))

  const meagTime = computed(() => format(meagZoned.value, 'HH:mm', { timeZone: MEAG_TZ }))
  const meagSeconds = computed(() => format(meagZoned.value, 'ss', { timeZone: MEAG_TZ }))
  const meagDate = computed(() => format(meagZoned.value, 'EEEE, MMMM d', { timeZone: MEAG_TZ }))

  const connectStatus = computed(() => {
    const ta = isAwake(taraHour.value)
    const ma = isAwake(meagHour.value)
    if (ta && ma) return { label: 'Both awake', icon: '✅', color: 'emerald', both: true }
    if (!ta && !ma) return { label: 'Both sleeping', icon: '🌙', color: 'slate', both: false }
    if (!ta) return { label: 'Tara might be sleeping', icon: '🌙', color: 'amber', both: false }
    return { label: 'Meag might be sleeping', icon: '🌙', color: 'amber', both: false }
  })

  // Average hour for background gradient
  const avgHour = computed(() => {
    let t = taraHour.value
    let m = meagHour.value
    if (Math.abs(t - m) > 12) {
      if (t < m) t += 24
      else m += 24
    }
    return ((t + m) / 2) % 24
  })

  const backgroundGradient = computed(() => {
    const h = avgHour.value
    if (h >= 5 && h < 8)  return 'from-rose-800 via-orange-600 to-amber-500'
    if (h >= 8 && h < 17) return 'from-sky-800 via-blue-900 to-indigo-950'
    if (h >= 17 && h < 20) return 'from-orange-900 via-rose-900 to-purple-900'
    return 'from-indigo-950 via-purple-950 to-rose-950'
  })

  // 24 hour slots for the overlap bar
  // Each slot: { hour, taraAwake, meagAwake, overlap, isCurrent }
  const overlapSlots = computed(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const taraLocalHour = (taraHour.value - (new Date().getHours() - hour) + 24) % 24
      const meagLocalHour = (meagHour.value - (new Date().getHours() - hour) + 24) % 24
      const taraA = isAwake(taraLocalHour)
      const meagA = isAwake(meagLocalHour)
      return {
        hour,
        taraAwake: taraA,
        meagAwake: meagA,
        overlap: taraA && meagA,
        isCurrent: hour === new Date().getHours(),
      }
    })
  })

  // Current local date (UTC) used as note key
  const todayUtcKey = computed(() => now.value.toISOString().slice(0, 10))

  return {
    now,
    taraZoned, meagZoned,
    taraHour, meagHour,
    taraTime, taraSeconds, taraDate,
    meagTime, meagSeconds, meagDate,
    connectStatus,
    backgroundGradient,
    overlapSlots,
    todayUtcKey,
    TARA_TZ, MEAG_TZ,
  }
}
