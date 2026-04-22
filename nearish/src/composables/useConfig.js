import { ref, onUnmounted } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, onValue, update } from 'firebase/database'

const config = ref({ reunionDate: '' })
let listener = null
let listenerCount = 0

export function useConfig() {
  listenerCount++
  if (!listener) {
    const configRef = dbRef(database, 'nearish-config')
    listener = onValue(configRef, (snap) => {
      const data = snap.val()
      if (data) config.value = { ...config.value, ...data }
    })
  }

  onUnmounted(() => {
    listenerCount--
    if (listenerCount <= 0 && listener) {
      listener()
      listener = null
      listenerCount = 0
    }
  })

  async function saveReunionDate(dateStr) {
    await update(dbRef(database, 'nearish-config'), { reunionDate: dateStr })
  }

  return { config, saveReunionDate }
}
