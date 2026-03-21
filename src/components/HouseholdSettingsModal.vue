<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <!-- Modal -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Household Settings</h2>
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
              class="rounded-lg px-4 py-2 font-medium transition-colors"
              :class="isEditingName
                ? 'bg-sage-600 text-white hover:bg-sage-700'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500'"
            >
              {{ isEditingName ? 'Save' : 'Edit' }}
            </button>
            <button
              v-if="isEditingName"
              @click="cancelEditName"
              class="rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
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
              class="rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              {{ codeCopied ? '✓ Copied' : 'Copy' }}
            </button>
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
            class="flex-1 rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-3 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
          <button
            @click="handleLogout"
            class="flex-1 rounded-lg bg-red-600 px-4 py-3 font-medium text-white hover:bg-red-700 transition-colors"
          >
            Leave Household
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useHouseholdStore } from '@/stores/household'
import { useToast } from '@/composables/useToast'
import { useRouter } from 'vue-router'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'openInvite'])

const householdStore = useHouseholdStore()
const { showToast } = useToast()
const router = useRouter()

const isEditingName = ref(false)
const newHouseholdName = ref('')
const nameError = ref('')
const codeCopied = ref(false)

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
