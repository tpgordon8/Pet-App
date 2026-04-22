import { ref, watch, onUnmounted } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, onValue, set } from 'firebase/database'

const noteContent = ref('')
const noteLastBy = ref('')
let noteListener = null
let debounceTimer = null
let currentDateKey = ''

export function useSharedNote(getIdentity, dateKeyRef) {
  function attach(dateKey) {
    if (noteListener) {
      noteListener()
      noteListener = null
    }
    currentDateKey = dateKey
    noteContent.value = ''
    noteLastBy.value = ''

    const noteRef = dbRef(database, `nearish-notes/${dateKey}`)
    noteListener = onValue(noteRef, (snap) => {
      const data = snap.val()
      if (data) {
        // Only sync from remote if it came from the other person
        if (data.updatedBy !== getIdentity()) {
          noteContent.value = data.content ?? ''
        }
        noteLastBy.value = data.updatedBy ?? ''
      }
    })
  }

  // Re-attach when the date changes (midnight rollover)
  watch(dateKeyRef, (key) => attach(key), { immediate: true })

  // Debounced save on local edits
  watch(noteContent, (val) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      const identity = getIdentity()
      if (!identity) return
      await set(dbRef(database, `nearish-notes/${currentDateKey}`), {
        content: val,
        updatedAt: Date.now(),
        updatedBy: identity,
      })
    }, 1500)
  })

  onUnmounted(() => {
    if (noteListener) { noteListener(); noteListener = null }
    if (debounceTimer) clearTimeout(debounceTimer)
  })

  return { noteContent, noteLastBy }
}
