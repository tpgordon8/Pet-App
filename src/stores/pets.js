import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { database } from '@/firebase/config'
import { ref as dbRef, push, onValue, remove, update } from 'firebase/database'
import { useHouseholdStore } from './household'
import { useToast } from '@/composables/useToast'
import { useAnalytics } from '@/composables/useAnalytics'

export const usePetsStore = defineStore('pets', () => {
  const householdStore = useHouseholdStore()
  const toast = useToast()
  const { trackPetAction } = useAnalytics()

  // State
  const pets = ref([])
  const selectedPetId = ref(localStorage.getItem('selectedPetId') || 'all')
  const loading = ref(false)
  const listener = ref(null)

  // Computed
  const selectedPet = computed(() => {
    if (selectedPetId.value === 'all') return null
    return pets.value.find(p => p.id === selectedPetId.value)
  })

  const hasPets = computed(() => pets.value.length > 0)

  // Actions
  function startListener() {
    if (!householdStore.householdId) {
      console.error('Cannot start listener: No household ID')
      return
    }

    const petsRef = dbRef(database, `households/${householdStore.householdId}/pets`)

    listener.value = onValue(petsRef, (snapshot) => {
      const data = snapshot.val()

      if (data) {
        pets.value = Object.entries(data).map(([id, pet]) => ({
          id,
          ...pet
        }))
      } else {
        pets.value = []
      }

      // If selected pet was deleted, reset to "all"
      if (selectedPetId.value !== 'all' && !pets.value.find(p => p.id === selectedPetId.value)) {
        selectPet('all')
      }
    }, (error) => {
      console.error('Firebase listener error:', error)
      toast.error('Failed to sync pets')
    })
  }

  function stopListener() {
    if (listener.value) {
      listener.value()
      listener.value = null
    }
  }

  async function addPet(name, emoji, species = '') {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    if (!name || !emoji) {
      toast.error('Pet name and emoji are required')
      return false
    }

    const pet = {
      name: name.trim(),
      emoji,
      species: species.trim(),
      createdAt: Date.now(),
      createdBy: householdStore.memberName
    }

    try {
      loading.value = true

      const petsRef = dbRef(database, `households/${householdStore.householdId}/pets`)
      const newPetRef = await push(petsRef, pet)

      // Track analytics
      trackPetAction('added', species || 'unknown')

      toast.success(`${emoji} ${name} added!`)

      // Auto-select the new pet
      selectPet(newPetRef.key)

      return newPetRef.key
    } catch (error) {
      console.error('Error adding pet:', error)
      toast.error('Failed to add pet')
      return false
    } finally {
      loading.value = false
    }
  }

  async function updatePet(petId, updates) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const petRef = dbRef(database, `households/${householdStore.householdId}/pets/${petId}`)
      await update(petRef, updates)
      toast.success('Pet updated')
      return true
    } catch (error) {
      console.error('Error updating pet:', error)
      toast.error('Failed to update pet')
      return false
    }
  }

  async function deletePet(petId) {
    if (!householdStore.householdId) {
      toast.error('Please sign in first')
      return false
    }

    try {
      const petRef = dbRef(database, `households/${householdStore.householdId}/pets/${petId}`)
      await remove(petRef)
      toast.success('Pet removed')

      // If this was the selected pet, switch to "all"
      if (selectedPetId.value === petId) {
        selectPet('all')
      }

      return true
    } catch (error) {
      console.error('Error deleting pet:', error)
      toast.error('Failed to delete pet')
      return false
    }
  }

  function selectPet(petId) {
    selectedPetId.value = petId
    localStorage.setItem('selectedPetId', petId)
  }

  return {
    // State
    pets,
    selectedPetId,
    loading,

    // Computed
    selectedPet,
    hasPets,

    // Actions
    startListener,
    stopListener,
    addPet,
    updatePet,
    deletePet,
    selectPet
  }
})
