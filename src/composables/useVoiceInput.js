import { ref } from 'vue'
import { useToast } from './useToast'

/**
 * useVoiceInput Composable
 * Provides voice recognition capabilities using Web Speech API
 */
export function useVoiceInput() {
  const { showToast } = useToast()

  const isListening = ref(false)
  const transcript = ref('')
  const isSupported = ref(false)
  let recognition = null

  // Check browser support
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    isSupported.value = true
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognition = new SpeechRecognition()

    // Configure recognition
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    // Event handlers
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript
      transcript.value = result
      console.log('Voice transcript:', result)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      isListening.value = false

      if (event.error === 'no-speech') {
        showToast('No speech detected. Please try again.', 'error')
      } else if (event.error === 'not-allowed') {
        showToast('Microphone permission denied.', 'error')
      } else {
        showToast(`Voice error: ${event.error}`, 'error')
      }
    }

    recognition.onend = () => {
      isListening.value = false
    }
  }

  /**
   * Start listening
   */
  function startListening() {
    if (!isSupported.value) {
      showToast('Voice input not supported in this browser', 'error')
      return false
    }

    try {
      transcript.value = ''
      isListening.value = true
      recognition.start()
      showToast('Listening... Speak now!', 'info')
      return true
    } catch (error) {
      console.error('Failed to start recognition:', error)
      isListening.value = false
      showToast('Failed to start voice input', 'error')
      return false
    }
  }

  /**
   * Stop listening
   */
  function stopListening() {
    if (recognition && isListening.value) {
      recognition.stop()
      isListening.value = false
    }
  }

  /**
   * Parse voice command for activity logging
   * Examples:
   * - "log poop" → { type: 'Poop', petName: null }
   * - "log food for Luna" → { type: 'Food', petName: 'Luna' }
   * - "pee" → { type: 'Pee', petName: null }
   */
  function parseCommand(text) {
    const lowerText = text.toLowerCase().trim()

    // Activity type mapping
    const activityMap = {
      'poop': { type: 'Poop', emoji: '💩' },
      'pee': { type: 'Pee', emoji: '💧' },
      'food': { type: 'Food', emoji: '🍖' },
      'eat': { type: 'Food', emoji: '🍖' },
      'sleep': { type: 'Sleep', emoji: '😴' },
      'meds': { type: 'Meds', emoji: '💊' },
      'medication': { type: 'Meds', emoji: '💊' },
      'medicine': { type: 'Meds', emoji: '💊' },
      'walk': { type: 'Walk', emoji: '🚶' }
    }

    // Find activity type
    let activity = null
    for (const [keyword, activityData] of Object.entries(activityMap)) {
      if (lowerText.includes(keyword)) {
        activity = activityData
        break
      }
    }

    if (!activity) {
      return null
    }

    // Extract pet name (after "for")
    let petName = null
    const forMatch = lowerText.match(/for\s+([a-z]+)/i)
    if (forMatch) {
      petName = forMatch[1].charAt(0).toUpperCase() + forMatch[1].slice(1)
    }

    return {
      type: activity.type,
      emoji: activity.emoji,
      petName
    }
  }

  return {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
    parseCommand
  }
}
