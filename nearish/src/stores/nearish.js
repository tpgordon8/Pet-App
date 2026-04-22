import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useTimezone } from '@/composables/useTimezone'
import { useAgenda } from '@/composables/useAgenda'
import { useConfig } from '@/composables/useConfig'
import { useWeather } from '@/composables/useWeather'
import { usePings } from '@/composables/usePings'
import { useSharedNote } from '@/composables/useSharedNote'
import { useToast } from '@/composables/useToast'

export const useNearishStore = defineStore('nearish', () => {
  // Identity — persisted to localStorage, no auth needed
  const identity = ref(localStorage.getItem('nearish_identity') || '')
  const showWhoAmI = ref(!identity.value)
  const showSettings = ref(false)
  const showAgenda = ref(false)

  function setIdentity(name) {
    identity.value = name
    localStorage.setItem('nearish_identity', name)
    showWhoAmI.value = false
  }

  // Core composables
  const tz = useTimezone()
  const agenda = useAgenda(tz.now)
  const { config, saveReunionDate } = useConfig()
  const { weather } = useWeather()
  const toast = useToast()

  // Pings — callback fires when other person sends
  const { pings, sendPing, PING_PRESETS } = usePings(
    () => identity.value,
    (ping) => toast.showPing(ping.from, ping.message)
  )

  // Shared note keyed by UTC date
  const { noteContent, noteLastBy } = useSharedNote(
    () => identity.value,
    tz.todayUtcKey
  )

  // Reunion countdown
  const reunionCountdown = computed(() => {
    const dateStr = config.value.reunionDate
    if (!dateStr) return null
    const target = new Date(dateStr + 'T12:00:00') // noon to avoid DST edge cases
    const diff = target - tz.now.value
    if (diff <= 0) return { past: true, days: 0, hours: 0, minutes: 0 }
    const days = Math.floor(diff / 86400000)
    const hours = Math.floor((diff % 86400000) / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return { past: false, days, hours, minutes }
  })

  return {
    // Identity
    identity, showWhoAmI, showSettings, showAgenda,
    setIdentity,

    // Timezone
    ...tz,

    // Agenda
    ...agenda,

    // Config
    config, saveReunionDate,

    // Weather
    weather,

    // Pings
    pings, sendPing, PING_PRESETS,

    // Note
    noteContent, noteLastBy,

    // Countdown
    reunionCountdown,

    // Toast
    toast,
  }
})
