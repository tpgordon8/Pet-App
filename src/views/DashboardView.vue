<template>
  <div class="min-h-screen p-4 pb-20">
    <div class="max-w-4xl mx-auto space-y-6 py-8">
      <!-- Header -->
      <div class="card flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            🐾 {{ householdStore.householdName || 'Tailr' }}
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {{ householdStore.memberName }}!
          </p>
        </div>
        <button
          class="btn btn-secondary flex items-center gap-2"
          title="Household Settings"
          @click="showSettingsModal = true"
        >
          <span class="text-lg">⚙️</span>
          <span class="hidden sm:inline">Settings</span>
        </button>
      </div>

      <!-- Member Selector -->
      <div class="card">
        <MemberSelector
          :members="householdStore.members"
          :current-member="householdStore.currentMember"
          :has-members="householdStore.members.length > 0"
          @select="householdStore.selectMember"
        />
      </div>

      <!-- Pet Selector -->
      <div class="card">
        <PetSelector
          :pets="petsStore.pets"
          :selected-pet-id="petsStore.selectedPetId"
          :has-pets="petsStore.hasPets"
          @select="petsStore.selectPet"
          @add-pet="showAddPetModal = true"
        />
      </div>

      <!-- Stats Widget -->
      <StatsWidget
        :stats="activitiesStore.stats"
        :pet-name="petsStore.selectedPet?.name"
      />

      <!-- Activity Insights -->
      <ActivityInsights
        :activities="activitiesStore.filteredActivities"
        :pet-name="petsStore.selectedPet?.name"
      />

      <!-- Activity Logging Buttons -->
      <div class="card">
        <h3 class="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Quick Log
          <span
            v-if="petsStore.selectedPet"
            class="text-sage-600 dark:text-sage-400"
          >
            for {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
          </span>
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ActivityButton
            emoji="💩"
            label="Poop"
            :count="activitiesStore.stats.poop"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Poop', '💩')"
          />
          <ActivityButton
            emoji="💧"
            label="Pee"
            :count="activitiesStore.stats.pee"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Pee', '💧')"
          />
          <ActivityButton
            emoji="🍖"
            label="Food"
            :count="activitiesStore.stats.food"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Food', '🍖')"
          />
          <ActivityButton
            emoji="😴"
            label="Sleep"
            :count="activitiesStore.stats.sleep"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Sleep', '😴')"
          />
          <ActivityButton
            emoji="💊"
            label="Meds"
            :count="activitiesStore.stats.meds"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Meds', '💊')"
          />
          <ActivityButton
            emoji="🚶"
            label="Walk"
            :count="activitiesStore.stats.walk"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Walk', '🚶')"
          />
        </div>
      </div>

      <!-- Medical Tracking Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-md font-semibold text-gray-900 dark:text-white">
            Medical Tracking
            <span
              v-if="petsStore.selectedPet"
              class="text-sage-600 dark:text-sage-400"
            >
              for {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
            </span>
          </h3>
          <button
            v-if="petsStore.selectedPet && petsStore.selectedPetId !== 'all'"
            class="btn-export"
            title="Export medical history as PDF"
            @click="exportMedicalPdf"
          >
            <span class="text-lg">📄</span>
            <span class="export-label">Export PDF</span>
          </button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActivityButton
            emoji="🏥"
            label="Vet Visit"
            :count="activitiesStore.stats.vetVisit"
            :disabled="activitiesStore.loading"
            @click="showMedicalModal('Vet Visit', '🏥')"
          />
          <ActivityButton
            emoji="💉"
            label="Vaccination"
            :count="activitiesStore.stats.vaccination"
            :disabled="activitiesStore.loading"
            @click="showMedicalModal('Vaccination', '💉')"
          />
          <ActivityButton
            emoji="⚖️"
            label="Weight Check"
            :count="activitiesStore.stats.weightCheck"
            :disabled="activitiesStore.loading"
            @click="showMedicalModal('Weight Check', '⚖️')"
          />
        </div>
      </div>

      <!-- Weight Trend Chart -->
      <WeightTrendChart :activities="activitiesStore.filteredActivities" />

      <!-- Search Bar -->
      <div class="card">
        <div class="relative">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span class="text-gray-400 text-lg">🔍</span>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search activities..."
            class="w-full pl-10 pr-10 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
          >
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <span class="text-xl">✕</span>
          </button>
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="card">
        <ActivityFeed
          :activities="activitiesStore.sortedActivities"
          :pets="petsStore.pets"
          :show-pet-names="petsStore.selectedPetId === 'all'"
          :search-query="searchQuery"
          @delete="handleDelete"
          @edit="handleEdit"
        />
      </div>
    </div>

    <!-- Add Pet Modal -->
    <AddPetModal
      :show="showAddPetModal"
      @close="showAddPetModal = false"
    />

    <!-- Activity Notes Modal -->
    <ActivityNotesModal
      :show="showNotesModal"
      :activity-type="pendingActivity.type"
      :emoji="pendingActivity.emoji"
      @close="showNotesModal = false"
      @save="handleSaveActivity"
    />

    <!-- Medical Modal -->
    <MedicalModal
      :show="showMedicalModalRef"
      :activity-type="pendingMedical.type"
      :emoji="pendingMedical.emoji"
      @close="showMedicalModalRef = false"
      @save="handleSaveMedical"
    />

    <!-- Edit Activity Modal -->
    <EditActivityModal
      :show="showEditModal"
      :activity="editingActivity"
      @close="showEditModal = false"
      @save="handleSaveEdit"
    />

    <!-- Household Settings Modal -->
    <HouseholdSettingsModal
      :is-open="showSettingsModal"
      @close="showSettingsModal = false"
      @open-invite="openInviteModal"
    />

    <!-- Invite Member Modal -->
    <InviteMemberModal
      :is-open="showInviteModal"
      @close="showInviteModal = false"
    />

    <!-- Floating Action Button -->
    <FloatingActionButton
      @quick-log="handleQuickLog"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useHouseholdStore } from '@/stores/household'
import { useActivitiesStore } from '@/stores/activities'
import { usePetsStore } from '@/stores/pets'
import { useToast } from '@/composables/useToast'
import { usePdfExport } from '@/composables/usePdfExport'
import { useHaptic } from '@/composables/useHaptic'

// Eager-loaded lightweight components (used immediately on page load)
import ActivityButton from '@/components/ActivityButton.vue'
import StatsWidget from '@/components/StatsWidget.vue'
import PetSelector from '@/components/PetSelector.vue'
import MemberSelector from '@/components/MemberSelector.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'

// Lazy-loaded heavy components (improves initial bundle size)
// These are loaded asynchronously when needed, reducing main bundle by ~400KB
const ActivityFeed = defineAsyncComponent({
  loader: () => import('@/components/ActivityFeed.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200, // Show loading after 200ms
  timeout: 10000 // 10 second timeout
})

const ActivityInsights = defineAsyncComponent({
  loader: () => import('@/components/ActivityInsights.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 10000
})

const WeightTrendChart = defineAsyncComponent({
  loader: () => import('@/components/WeightTrendChart.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 10000
})

// Lazy-loaded modals (only loaded when opened)
// These save ~200KB from initial bundle since modals aren't needed immediately
const AddPetModal = defineAsyncComponent(() =>
  import('@/components/AddPetModal.vue')
)
const ActivityNotesModal = defineAsyncComponent(() =>
  import('@/components/ActivityNotesModal.vue')
)
const MedicalModal = defineAsyncComponent(() =>
  import('@/components/MedicalModal.vue')
)
const EditActivityModal = defineAsyncComponent(() =>
  import('@/components/EditActivityModal.vue')
)
const HouseholdSettingsModal = defineAsyncComponent(() =>
  import('@/components/HouseholdSettingsModal.vue')
)
const InviteMemberModal = defineAsyncComponent(() =>
  import('@/components/InviteMemberModal.vue')
)

const householdStore = useHouseholdStore()
const activitiesStore = useActivitiesStore()
const petsStore = usePetsStore()
const toast = useToast()
const { generateMedicalPdf } = usePdfExport()
const haptic = useHaptic()

const showAddPetModal = ref(false)
const showNotesModal = ref(false)
const showMedicalModalRef = ref(false)
const showEditModal = ref(false)
const showSettingsModal = ref(false)
const showInviteModal = ref(false)
const pendingActivity = ref({ type: '', emoji: '' })
const pendingMedical = ref({ type: '', emoji: '' })
const editingActivity = ref(null)
const searchQuery = ref('')

onMounted(() => {
  // Start Firebase listeners for real-time sync
  activitiesStore.startListener()
  petsStore.startListener()

  // Load offline queue
  activitiesStore.loadOfflineQueue()

  // Sync offline queue if exists
  if (activitiesStore.offlineQueue.length > 0) {
    activitiesStore.syncOfflineQueue()
  }
})

onUnmounted(() => {
  // Stop listeners when leaving dashboard
  activitiesStore.stopListener()
  petsStore.stopListener()

  // Save offline queue
  activitiesStore.saveOfflineQueue()
})

function openInviteModal() {
  showSettingsModal.value = false
  showInviteModal.value = true
}

function showActivityNotes(type, emoji) {
  pendingActivity.value = { type, emoji }
  showNotesModal.value = true
}

async function handleSaveActivity(data) {
  await activitiesStore.logActivity(
    pendingActivity.value.type,
    pendingActivity.value.emoji,
    data.notes,
    data.photo
  )
}

async function handleDelete(activityId) {
  // Use undo functionality instead of confirmation dialog
  haptic.medium()
  await activitiesStore.deleteActivity(activityId, { enableUndo: true })
}

function showMedicalModal(type, emoji) {
  pendingMedical.value = { type, emoji }
  showMedicalModalRef.value = true
}

async function handleSaveMedical(medicalData) {
  await activitiesStore.logActivity(
    pendingMedical.value.type,
    pendingMedical.value.emoji,
    '', // no notes field for medical activities
    null, // no photo
    medicalData
  )
}

function handleEdit(activity) {
  editingActivity.value = activity
  showEditModal.value = true
}

async function handleSaveEdit(updates) {
  if (editingActivity.value) {
    await activitiesStore.updateActivity(editingActivity.value.id, updates)
  }
}

function exportMedicalPdf() {
  if (!petsStore.selectedPet || petsStore.selectedPetId === 'all') {
    toast.error('Please select a specific pet to export medical history')
    return
  }

  const result = generateMedicalPdf(
    petsStore.selectedPet,
    activitiesStore.filteredActivities,
    { memberName: householdStore.memberName }
  )

  if (result.success) {
    toast.success(`PDF exported: ${result.filename}`)
  } else {
    toast.error(`Failed to export PDF: ${result.error}`)
  }
}

async function handleQuickLog({ type, emoji }) {
  // Check if pet is selected
  if (!petsStore.selectedPet || petsStore.selectedPetId === 'all') {
    haptic.error()
    toast.error('Please select a specific pet first')
    return
  }

  // Haptic feedback for successful action
  haptic.success()

  // Log activity immediately without modal (quick mode)
  await activitiesStore.logActivity(type, emoji, '', null)

  // Success feedback
  toast.success(`${emoji} ${type} logged!`)
}
</script>

<style scoped>
.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-in-out;
}

.dark .btn-export {
  background: #374151;
  border-color: #4b5563;
  color: #d1d5db;
}

.btn-export:hover {
  background: #10b981;
  border-color: #10b981;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
}

.dark .btn-export:hover {
  background: #10b981;
  border-color: #10b981;
}

.export-label {
  display: none;
}

@media (min-width: 640px) {
  .export-label {
    display: inline;
  }
}
</style>
