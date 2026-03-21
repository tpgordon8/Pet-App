<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="closeModal"></div>

    <!-- Modal -->
    <div class="flex min-h-screen items-center justify-center p-4">
      <div class="relative w-full max-w-md transform rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-xl transition-all">
        <!-- Header -->
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Invite to Household</h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Invite family members to join {{ householdStore.householdName }}
          </p>
        </div>

        <!-- Tab Selection -->
        <div class="mb-6 flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
          <button
            @click="activeTab = 'link'"
            class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'link'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            Share Link
          </button>
          <button
            @click="activeTab = 'email'"
            class="flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors"
            :class="activeTab === 'email'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
              : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'"
          >
            Send Email
          </button>
        </div>

        <!-- Share Link Tab -->
        <div v-if="activeTab === 'link'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Invite Link
            </label>
            <div class="flex gap-2">
              <input
                :value="inviteLink"
                readonly
                class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                @click="copyLink"
                class="rounded-lg bg-sage-600 px-4 py-2 font-medium text-white hover:bg-sage-700 transition-colors"
              >
                {{ linkCopied ? '✓ Copied' : 'Copy' }}
              </button>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Share this link with anyone you want to invite to your household.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Or share the household code
            </label>
            <div class="flex gap-2">
              <input
                :value="householdStore.householdCode"
                readonly
                class="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-2 text-lg font-mono text-gray-900 dark:text-white focus:outline-none"
              />
              <button
                @click="copyCode"
                class="rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-2 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                {{ codeCopied ? '✓' : 'Copy' }}
              </button>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              They can use this code to join your household manually.
            </p>
          </div>
        </div>

        <!-- Send Email Tab -->
        <div v-if="activeTab === 'email'" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recipient Name
            </label>
            <input
              v-model="recipientName"
              type="text"
              placeholder="Enter their name"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              v-model="recipientEmail"
              type="email"
              placeholder="their-email@example.com"
              class="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-gray-900 dark:text-white focus:border-sage-500 focus:outline-none focus:ring-2 focus:ring-sage-500"
            />
          </div>

          <p v-if="emailError" class="text-sm text-red-600 dark:text-red-400">{{ emailError }}</p>
          <p v-if="emailSuccess" class="text-sm text-green-600 dark:text-green-400">{{ emailSuccess }}</p>

          <div class="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4">
            <p class="text-sm text-blue-800 dark:text-blue-200">
              <strong>Note:</strong> Email invitations require Firebase Extensions setup. If not configured, you can share the link instead.
            </p>
          </div>

          <button
            @click="sendEmail"
            :disabled="isSendingEmail || !recipientEmail"
            class="w-full rounded-lg bg-sage-600 px-4 py-3 font-medium text-white hover:bg-sage-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSendingEmail ? 'Sending...' : 'Send Invitation Email' }}
          </button>
        </div>

        <!-- Close Button -->
        <div class="mt-6">
          <button
            @click="closeModal"
            class="w-full rounded-lg bg-gray-200 dark:bg-gray-600 px-4 py-3 font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useHouseholdStore } from '@/stores/household'
import { useToast } from '@/composables/useToast'
import { useAnalytics } from '@/composables/useAnalytics'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])

const householdStore = useHouseholdStore()
const { showToast } = useToast()
const { trackInviteSent } = useAnalytics()

const activeTab = ref('link')
const recipientName = ref('')
const recipientEmail = ref('')
const emailError = ref('')
const emailSuccess = ref('')
const isSendingEmail = ref(false)
const linkCopied = ref(false)
const codeCopied = ref(false)

const inviteLink = computed(() => {
  const invite = householdStore.generateInviteLink()
  return invite?.link || ''
})

// Reset state when modal opens/closes
watch(() => props.isOpen, (isOpen) => {
  if (!isOpen) {
    activeTab.value = 'link'
    recipientName.value = ''
    recipientEmail.value = ''
    emailError.value = ''
    emailSuccess.value = ''
    isSendingEmail.value = false
    linkCopied.value = false
    codeCopied.value = false
  }
})

function closeModal() {
  emit('close')
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value)
    linkCopied.value = true
    showToast('Invite link copied!', 'success')
    trackInviteSent('link')
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy link:', error)
    showToast('Failed to copy link. Please try again.', 'error')
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

async function sendEmail() {
  emailError.value = ''
  emailSuccess.value = ''

  if (!recipientEmail.value) {
    emailError.value = 'Please enter an email address'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }

  try {
    isSendingEmail.value = true
    await householdStore.sendEmailInvite(recipientEmail.value, recipientName.value)

    emailSuccess.value = `Invitation sent to ${recipientEmail.value}!`
    showToast('Invitation email sent!', 'success')
    trackInviteSent('email')

    // Clear form after success
    setTimeout(() => {
      recipientName.value = ''
      recipientEmail.value = ''
      emailSuccess.value = ''
    }, 2000)
  } catch (error) {
    console.error('Error sending email:', error)
    emailError.value = error.message || 'Failed to send invitation. Try sharing the link instead.'
    showToast('Failed to send invitation', 'error')
  } finally {
    isSendingEmail.value = false
  }
}
</script>
