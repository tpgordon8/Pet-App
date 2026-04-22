import { ref, onUnmounted } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, push, onValue, query, orderByChild, limitToLast } from 'firebase/database'

export const PING_PRESETS = [
  { text: 'Thinking of you 💕', emoji: '💕' },
  { text: 'Miss you 🥺', emoji: '🥺' },
  { text: 'Call me when free? 📞', emoji: '📞' },
  { text: 'Good morning ☀️', emoji: '☀️' },
  { text: 'Good night 🌙', emoji: '🌙' },
]

// Singleton ping state
const pings = ref([])
const latestPingId = ref(null)
let pingListener = null
let listenerCount = 0

export function usePings(getIdentity, onIncoming) {
  listenerCount++
  if (!pingListener) {
    const q = query(
      dbRef(database, 'nearish-pings'),
      orderByChild('timestamp'),
      limitToLast(30)
    )
    pingListener = onValue(q, (snap) => {
      const data = snap.val()
      if (!data) { pings.value = []; return }

      const newList = Object.entries(data)
        .map(([id, p]) => ({ id, ...p }))
        .sort((a, b) => b.timestamp - a.timestamp)

      // Detect a brand new ping from the other person
      const latest = newList[0]
      if (
        latest &&
        latest.id !== latestPingId.value &&
        pings.value.length > 0 &&
        latest.from !== getIdentity()
      ) {
        onIncoming?.(latest)
      }
      latestPingId.value = latest?.id || null
      pings.value = newList
    })
  }

  onUnmounted(() => {
    listenerCount--
    if (listenerCount <= 0 && pingListener) {
      pingListener()
      pingListener = null
      listenerCount = 0
    }
  })

  async function sendPing(message) {
    const identity = getIdentity()
    if (!identity) return
    await push(dbRef(database, 'nearish-pings'), {
      from: identity,
      message,
      timestamp: Date.now(),
    })
  }

  return { pings, sendPing, PING_PRESETS }
}
