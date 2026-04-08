<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-backdrop">
      <!-- Backdrop -->
      <div class="fixed inset-0 bg-black bg-opacity-50" @click="closeModal"></div>

      <!-- Modal -->
      <div class="flex min-h-screen items-center justify-center p-4">
        <div class="modal-content relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl">
        <!-- Header -->
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Household Settings</h2>
          <button
            @click="closeModal"
            class="modal-close-btn"
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <!-- Household Name -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Household Name
          </label>
          <div class="flex items-center gap-2">
            <input
              v-if="isEditingName"
              v-model="newHouseholdName"
              type="text"
              class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
              placeholder="Enter household name"
              @keyup.enter="saveName"
              @keyup.escape="cancelEditName"
            />
            <div v-else class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white">
              {{ householdStore.householdName }}
            </div>

            <!-- Edit/Save buttons (owner only) -->
            <button
              v-if="householdStore.isOwner"
              @click="isEditingName ? saveName() : startEditName()"
              class="rounded-lg px-4 py-2 font-medium transition-colors motion-reduce:transition-none"
              :class="isEditingName
                ? 'bg-sage-600 text-white hover:bg-sage-700'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'"
            >
              {{ isEditingName ? 'Save' : 'Edit' }}
            </button>
            <button
              v-if="isEditingName"
              @click="cancelEditName"
              class="rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors motion-reduce:transition-none"
            >
              Cancel
            </button>
          </div>
          <p v-if="nameError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ nameError }}</p>
        </div>

        <!-- Household Code -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Household Code
          </label>
          <div class="flex items-center gap-2">
            <div class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white font-mono">
              {{ householdStore.householdCode }}
            </div>
            <button
              @click="copyCode"
              class="rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors motion-reduce:transition-none"
            >
              {{ codeCopied ? '✓ Copied' : 'Copy' }}
            </button>
          </div>
        </div>

        <!-- Pets List -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Pets ({{ pets.length }})
            </label>
            <button
              @click="openAddPetModal"
              class="text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
            >
              + Add Pet
            </button>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-if="pets.length === 0"
              class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm"
            >
              No pets yet. Add your first pet!
            </div>
            <div
              v-for="pet in pets"
              :key="pet.id"
              class="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3"
            >
              <div class="flex items-center gap-3">
                <span class="text-2xl">{{ pet.emoji }}</span>
                <div>
                  <div class="font-medium text-gray-900 dark:text-white">{{ pet.name }}</div>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ pet.species || 'Pet' }}{{ pet.birthday ? ` • ${calculateAge(pet.birthday)}` : '' }}
                  </p>
                </div>
              </div>
              <div class="flex gap-2">
                <button
                  @click="editPet(pet)"
                  class="text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 text-sm font-medium"
                  title="Edit pet"
                >
                  Edit
                </button>
                <button
                  @click="confirmDeletePet(pet)"
                  class="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                  title="Delete pet"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Members List -->
        <div class="mb-6">
          <div class="flex items-center justify-between mb-2">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Members ({{ householdStore.members.length }})
            </label>
            <button
              v-if="householdStore.myPermissions.canInviteMembers || householdStore.isOwner"
              @click="openInviteModal"
              class="text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
            >
              + Invite
            </button>
          </div>
          <div class="space-y-2 max-h-48 overflow-y-auto">
            <div
              v-for="member in householdStore.members"
              :key="member"
              class="flex items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3"
            >
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-medium text-gray-900 dark:text-white">{{ member }}</span>
                  <span
                    v-if="householdStore.memberPermissions[member]?.role === 'owner'"
                    class="rounded-full bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-200"
                  >
                    Owner
                  </span>
                  <span
                    v-if="member === householdStore.memberName"
                    class="rounded-full bg-sage-100 dark:bg-sage-900 px-2 py-0.5 text-xs font-medium text-sage-800 dark:text-sage-200"
                  >
                    You
                  </span>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ householdStore.memberPermissions[member]?.role === 'owner' ? 'Full access' : 'Member' }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button
            @click="closeModal"
            class="flex-1 rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-3 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors motion-reduce:transition-none"
          >
            Close
          </button>
          <button
            @click="handleLogout"
            class="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 transition-colors motion-reduce:transition-none"
          >
            Leave Household
          </button>
        </div>
      </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useHouseholdStore } from '@/stores/household'
import { usePetsStore } from '@/stores/pets'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  pets: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'openInvite', 'editPet', 'addPet'])

const householdStore = useHouseholdStore()
const petsStore = usePetsStore()
const { showToast } = useToast()
const router = useRouter()

const isEditingName = ref(false)
const newHouseholdName = ref('')
const nameError = ref('')
const codeCopied = ref(false)

// Helper function to calculate pet age
function calculateAge(birthday) {
  if (!birthday) return ''

  const birthDate = new Date(birthday)
  const today = new Date()
  const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth())

  if (ageInMonths < 12) {
    return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''} old`
  } else {
    const years = Math.floor(ageInMonths / 12)
    const months = ageInMonths % 12
    if (months === 0) {
      return `${years} year${years !== 1 ? 's' : ''} old`
    }
    return `${years}y ${months}m old`
  }
}

function openAddPetModal() {
  emit('addPet')
}

function editPet(pet) {
  emit('editPet', pet)
}

async function confirmDeletePet(pet) {
  if (confirm(`Are you sure you want to delete ${pet.emoji} ${pet.name}? This action cannot be undone.`)) {
    await petsStore.deletePet(pet.id)
  }
}

// Reset editing state when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    isEditingName.value = false
    newHouseholdName.value = ''
    nameError.value = ''
    codeCopied.value = false
  }
})

function closeModal() {
  emit('close')
}

function startEditName() {
  newHouseholdName.value = householdStore.householdName
  isEditingName.value = true
  nameError.value = ''
}

function cancelEditName() {
  isEditingName.value = false
  newHouseholdName.value = ''
  nameError.value = ''
}

async function saveName() {
  if (!newHouseholdName.value.trim()) {
    nameError.value = 'Household name cannot be empty'
    return
  }

  try {
    await householdStore.updateHouseholdName(newHouseholdName.value.trim())
    showToast('Household name updated!', 'success')
    isEditingName.value = false
    nameError.value = ''
  } catch (error) {
    nameError.value = error.message || 'Failed to update name'
    showToast(error.message || 'Failed to update name', 'error')
  }
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(householdStore.householdCode)
    codeCopied.value = true
    showToast('Household code copied!', 'success')
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy code:', error)
    showToast('Failed to copy code. Please try again.', 'error')
  }
}

function openInviteModal() {
  emit('openInvite')
}

async function handleLogout() {
  if (confirm('Are you sure you want to leave this household? You will need the household code to rejoin.')) {
    householdStore.logout()
    showToast('You have left the household', 'success')
    router.push('/')
  }
}
</script>

<style scoped>
/* Modal backdrop with smooth animations */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 50;
  overflow-y: auto;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.modal-content {
  will-change: transform, opacity;
}

/* Smooth modal entrance/exit animations */
.modal-enter-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-active .modal-content {
  transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
              opacity 0.25s ease;
}

.modal-leave-active {
  transition: opacity 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.modal-leave-active .modal-content {
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1),
              opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .modal-enter-from .modal-content {
    transform: translateY(100%);
  }

  .modal-leave-to .modal-content {
    transform: translateY(100%);
  }
}

/* Performance optimizations */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: none;
  }
}
</style>
