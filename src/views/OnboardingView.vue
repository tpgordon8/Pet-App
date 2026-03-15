<template>
  <div class="onboarding-view">
    <div class="onboarding-container">
      <!-- Progress Indicator (except for welcome and join) -->
      <ProgressIndicator
        v-if="showProgress"
        :currentStep="currentProgressStep"
        :totalSteps="totalProgressSteps"
      />

      <!-- Step Components -->
      <transition name="slide-fade" mode="out-in">
        <component
          :is="currentStepComponent"
          :key="currentStep"
          v-bind="currentStepProps"
          @create="handleCreate"
          @join="handleJoinChoice"
          @submit="handleStepSubmit"
          @skip="handleStepSkip"
          @choose-sharing="handleChooseSharing"
          @choose-solo="handleChooseSolo"
          @done="handleHouseholdDone"
          @switch-to-create="handleSwitchToCreate"
          @start-tour="handleStartTour"
          @skip-tour="handleSkipTour"
          @quick-log="handleQuickLog"
        />
      </transition>

      <!-- Back Button (except first step) -->
      <button
        v-if="canGoBack"
        @click="goBack"
        class="back-button"
      >
        ← Back
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'
import { usePetsStore } from '@/stores/pets'
import { useActivitiesStore } from '@/stores/activities'
import { useToast } from '@/composables/useToast'

import ProgressIndicator from '@/components/onboarding/ProgressIndicator.vue'
import WelcomeStep from '@/components/onboarding/WelcomeStep.vue'
import AddPetStep from '@/components/onboarding/AddPetStep.vue'
import PersonalizationStep from '@/components/onboarding/PersonalizationStep.vue'
import CreateAccountStep from '@/components/onboarding/CreateAccountStep.vue'
import HouseholdSetupStep from '@/components/onboarding/HouseholdSetupStep.vue'
import JoinHouseholdStep from '@/components/onboarding/JoinHouseholdStep.vue'
import SuccessStep from '@/components/onboarding/SuccessStep.vue'

const router = useRouter()
const householdStore = useHouseholdStore()
const petsStore = usePetsStore()
const activitiesStore = useActivitiesStore()
const toast = useToast()

// Flow types
const FLOW_CREATE = 'create'
const FLOW_JOIN = 'join'

// State
const currentStep = ref('welcome')
const flowType = ref(null)
const onboardingData = ref({
  pet: null,
  useCase: null,
  account: null,
  wantsSharing: false
})

// Steps mapping
const steps = {
  welcome: WelcomeStep,
  addPet: AddPetStep,
  personalization: PersonalizationStep,
  createAccount: CreateAccountStep,
  householdSetup: HouseholdSetupStep,
  joinHousehold: JoinHouseholdStep,
  success: SuccessStep
}

// Computed
const currentStepComponent = computed(() => steps[currentStep.value])

const showProgress = computed(() => {
  return flowType.value === FLOW_CREATE && !['welcome', 'success'].includes(currentStep.value)
})

const currentProgressStep = computed(() => {
  if (flowType.value !== FLOW_CREATE) return 1

  const progressSteps = {
    addPet: 1,
    personalization: 2,
    createAccount: 3,
    householdSetup: 4
  }

  return progressSteps[currentStep.value] || 1
})

const totalProgressSteps = computed(() => 4)

const canGoBack = computed(() => {
  return currentStep.value !== 'welcome' && currentStep.value !== 'success'
})

const currentStepProps = computed(() => {
  if (currentStep.value === 'householdSetup') {
    return {
      petName: onboardingData.value.pet?.name || 'your pet',
      householdCode: onboardingData.value.account?.householdCode || ''
    }
  }

  if (currentStep.value === 'success') {
    return {
      userName: onboardingData.value.account?.name || 'there',
      petName: onboardingData.value.pet?.name || 'Your pet'
    }
  }

  return {}
})

// Methods
function handleCreate() {
  flowType.value = FLOW_CREATE
  currentStep.value = 'addPet'
}

function handleJoinChoice() {
  flowType.value = FLOW_JOIN
  currentStep.value = 'joinHousehold'
}

function handleSwitchToCreate() {
  flowType.value = FLOW_CREATE
  currentStep.value = 'welcome'
}

function handleStepSubmit(data) {
  if (currentStep.value === 'addPet') {
    onboardingData.value.pet = data
    currentStep.value = 'personalization'
  } else if (currentStep.value === 'personalization') {
    onboardingData.value.useCase = data
    currentStep.value = 'createAccount'
  } else if (currentStep.value === 'createAccount') {
    onboardingData.value.account = data
    createHouseholdAndPet()
  } else if (currentStep.value === 'joinHousehold') {
    joinExistingHousehold(data)
  }
}

function handleStepSkip() {
  if (currentStep.value === 'addPet') {
    currentStep.value = 'personalization'
  } else if (currentStep.value === 'personalization') {
    currentStep.value = 'createAccount'
  }
}

async function createHouseholdAndPet() {
  try {
    const { name, householdCode, passcode } = onboardingData.value.account

    // Create household
    await householdStore.createHousehold(householdCode, passcode, name)

    // Start pets listener
    petsStore.startListener()

    // Add pet if provided
    if (onboardingData.value.pet) {
      await petsStore.addPet(
        onboardingData.value.pet.name,
        onboardingData.value.pet.emoji,
        onboardingData.value.pet.species
      )
    }

    // Start activities listener
    activitiesStore.startListener()

    // Move to household setup
    currentStep.value = 'householdSetup'
  } catch (error) {
    console.error('Error creating household:', error)
    toast.error(error.message || 'Failed to create household')
  }
}

async function joinExistingHousehold(data) {
  try {
    const { name, householdCode, passcode } = data

    // Join household
    await householdStore.joinHousehold(householdCode, passcode, name)

    // Start listeners
    petsStore.startListener()
    activitiesStore.startListener()

    // Go straight to dashboard (no household setup needed)
    toast.success(`Welcome to ${householdCode}!`)
    router.push('/dashboard')
  } catch (error) {
    console.error('Error joining household:', error)
    toast.error(error.message || 'Failed to join household')
  }
}

function handleChooseSharing() {
  onboardingData.value.wantsSharing = true
  // Stay on household setup to show the code
}

function handleChooseSolo() {
  onboardingData.value.wantsSharing = false
  currentStep.value = 'success'
}

function handleHouseholdDone() {
  currentStep.value = 'success'
}

function handleStartTour() {
  // For now, just go to dashboard
  // TODO: Implement product tour in the future
  toast.info('Quick tour coming soon!')
  router.push('/dashboard')
}

function handleSkipTour() {
  router.push('/dashboard')
}

function handleQuickLog(activityType) {
  // Log activity and go to dashboard
  if (petsStore.selectedPet) {
    activitiesStore.logActivity(
      activityType,
      getActivityEmoji(activityType),
      petsStore.selectedPetId
    )
  }
  router.push('/dashboard')
}

function getActivityEmoji(type) {
  const emojiMap = {
    'Poop': '💩',
    'Pee': '💧',
    'Food': '🍖',
    'Sleep': '😴',
    'Meds': '💊',
    'Walk': '🏃'
  }
  return emojiMap[type] || '📝'
}

function goBack() {
  if (flowType.value === FLOW_CREATE) {
    const createSteps = ['addPet', 'personalization', 'createAccount', 'householdSetup']
    const currentIndex = createSteps.indexOf(currentStep.value)
    if (currentIndex > 0) {
      currentStep.value = createSteps[currentIndex - 1]
    } else {
      currentStep.value = 'welcome'
    }
  } else if (flowType.value === FLOW_JOIN) {
    currentStep.value = 'welcome'
  }
}

// Check if already authenticated
onMounted(() => {
  if (householdStore.isAuthenticated) {
    router.push('/dashboard')
  }
})
</script>

<style scoped>
.onboarding-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%);
}

.dark .onboarding-view {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 100%);
}

.onboarding-container {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 2rem;
  position: relative;
}

.dark .onboarding-container {
  background: #1f2937;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.back-button {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 150ms ease-in-out;
}

.dark .back-button {
  color: #9ca3af;
}

.back-button:hover {
  color: #10b981;
}

/* Slide fade transition */
.slide-fade-enter-active {
  transition: all 300ms ease-out;
}

.slide-fade-leave-active {
  transition: all 200ms ease-in;
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

@media (max-width: 640px) {
  .onboarding-view {
    padding: 1rem 0.5rem;
  }

  .onboarding-container {
    padding: 1.5rem 1rem;
  }
}
</style>
