<template>
  <div class="min-h-screen p-2 sm:p-3 pb-20">
    <div class="max-w-4xl mx-auto space-y-3 sm:space-y-4 py-2 sm:py-4">
      <!-- Compact Sticky Header -->
      <div class="card-compact sticky-header">
        <div class="flex items-center justify-between gap-2">
          <!-- Title -->
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">
            🐾 {{ householdStore.householdName || 'Tailr' }}
          </h1>

          <!-- Compact Context Bar + Settings -->
          <div class="flex items-center gap-2 flex-1 justify-end">
            <CompactContextBar
              :pets="petsStore.pets"
              :selected-pet-id="petsStore.selectedPetId"
              :has-pets="petsStore.hasPets"
              :members="householdStore.members"
              :current-member="householdStore.currentMember"
              :has-members="householdStore.members.length > 0"
              @select-pet="petsStore.selectPet"
              @select-member="householdStore.selectMember"
              @add-pet="showAddPetModal = true"
            />

            <!-- Voice Button (if supported) -->
            <button
              v-if="voice.isSupported"
              class="settings-btn"
              :class="{ 'voice-listening': voice.isListening }"
              title="Voice log activity"
              aria-label="Voice log activity"
              @click="handleVoiceLog"
            >
              <span class="text-lg">{{ voice.isListening ? '🎤' : '🗣️' }}</span>
            </button>

            <!-- Settings Button (Icon Only) -->
            <button
              class="settings-btn"
              title="Household Settings"
              aria-label="Open household settings"
              @click="showSettingsModal = true"
            >
              <span class="text-lg">⚙️</span>
            </button>
          </div>
        </div>
      </div>

      <!-- PRIMARY ACTION: Quick Log Buttons -->
      <div class="card-compact">
        <h3 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Quick Log
          <span
            v-if="petsStore.selectedPet"
            class="text-sage-600 dark:text-sage-400 text-xs"
          >
            • {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
          </span>
        </h3>
        <div class="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
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

      <!-- Streak Counter & Achievements -->
      <StreakCounter
        :activities="activitiesStore.sortedActivities"
        @show-achievements="showAchievementsModal = true"
      />

      <!-- Activity Feed with Integrated Search -->
      <div class="card-compact">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h3>
          <!-- Export Button -->
          <button
            class="btn-export"
            :title="searchQuery ? `Export ${filteredActivities.length} filtered activities to CSV` : 'Export all activities to CSV'"
            @click="exportActivitiesToCSV"
          >
            <span class="text-lg">📊</span>
            <span class="export-label">
              Export CSV
              <span
                v-if="searchQuery"
                class="export-count"
              >({{ filteredActivities.length }})</span>
            </span>
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative mb-3">
          <div class="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <span class="text-gray-400 text-base">🔍</span>
          </div>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search activities..."
            class="w-full pl-9 pr-9 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-base text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent transition-all"
            style="font-size: 16px; min-height: 44px;"
          >
          <button
            v-if="searchQuery"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <!-- Activity Feed -->
        <ActivityFeed
          :activities="filteredActivities"
          :pets="petsStore.pets"
          :show-pet-names="petsStore.selectedPetId === 'all'"
          :search-query="searchQuery"
          @delete="handleDelete"
          @edit="handleEdit"
        />
      </div>

      <!-- Activity Insights -->
      <CollapsibleSection
        title="Activity Insights"
        :subtitle="petsStore.selectedPet ? `Smart patterns for ${petsStore.selectedPet.name}` : 'Smart patterns and alerts'"
        icon="💡"
        :default-collapsed="false"
        section-id="activity-insights"
      >
        <ActivityInsights
          :activities="activitiesStore.filteredActivities"
          :pet-name="petsStore.selectedPet?.name"
        />
      </CollapsibleSection>

      <!-- Today's Summary (Collapsed by Default) -->
      <TodaysSummary
        :stats="activitiesStore.stats"
        :pet-name="petsStore.selectedPet?.name"
        :activities="activitiesStore.filteredActivities"
        :default-collapsed="true"
      />

      <!-- Calendar View -->
      <CollapsibleSection
        title="Calendar View"
        :subtitle="petsStore.selectedPet ? `Activity calendar for ${petsStore.selectedPet.name}` : 'View activities by date'"
        icon="📅"
        :default-collapsed="true"
        section-id="calendar-view"
      >
        <CalendarView :activities="activitiesStore.filteredActivities" />
      </CollapsibleSection>

      <!-- Medical Tracking Section -->
      <CollapsibleSection
        title="Medical Tracking"
        :subtitle="petsStore.selectedPet ? `for ${petsStore.selectedPet.emoji} ${petsStore.selectedPet.name}` : ''"
        icon="🏥"
        :badge="activitiesStore.stats.vetVisit + activitiesStore.stats.vaccination + activitiesStore.stats.weightCheck"
        :default-collapsed="true"
        section-id="medical-tracking"
      >
        <div class="flex justify-end mb-2">
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
        <!-- Horizontal Scrolling Medical Buttons -->
        <div class="medical-buttons-scroll">
          <ActivityButton
            emoji="🏥"
            label="Vet Visit"
            :count="activitiesStore.stats.vetVisit"
            :disabled="activitiesStore.loading"
            custom-class="medical-button-compact"
            @click="showMedicalModal('Vet Visit', '🏥')"
          />
          <ActivityButton
            emoji="💉"
            label="Vaccination"
            :count="activitiesStore.stats.vaccination"
            :disabled="activitiesStore.loading"
            custom-class="medical-button-compact"
            @click="showMedicalModal('Vaccination', '💉')"
          />
          <ActivityButton
            emoji="⚖️"
            label="Weight Check"
            :count="activitiesStore.stats.weightCheck"
            :disabled="activitiesStore.loading"
            custom-class="medical-button-compact"
            @click="showMedicalModal('Weight Check', '⚖️')"
          />
        </div>
      </CollapsibleSection>

      <!-- Weight Trend Chart -->
      <CollapsibleSection
        title="Weight Trends"
        :subtitle="petsStore.selectedPet ? `Track weight changes for ${petsStore.selectedPet.name}` : 'Track weight changes over time'"
        icon="📊"
        :default-collapsed="true"
        section-id="weight-trends"
      >
        <WeightTrendChart :activities="activitiesStore.filteredActivities" />
      </CollapsibleSection>

      <!-- Smart Reminders -->
      <CollapsibleSection
        title="Reminders"
        :subtitle="`${remindersStore.activeReminders.length} active reminder${remindersStore.activeReminders.length !== 1 ? 's' : ''}`"
        icon="🔔"
        :badge="remindersStore.overdueReminders.length > 0 ? remindersStore.overdueReminders.length : null"
        :default-collapsed="false"
        section-id="reminders"
      >
        <div class="flex justify-end mb-3">
          <button
            class="text-sm font-medium text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300"
            @click="showAddReminderModal = true"
          >
            + Add Reminder
          </button>
        </div>
        <RemindersWidget @add-reminder="showAddReminderModal = true" />
      </CollapsibleSection>
    </div>

    <!-- Add Pet Modal -->
    <AddPetModal
      :show="showAddPetModal"
      :edit-pet="editingPet"
      @close="handleCloseAddPetModal"
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
      :pets="petsStore.pets"
      @close="showSettingsModal = false"
      @open-invite="openInviteModal"
      @edit-pet="handleEditPet"
      @add-pet="handleAddPet"
    />

    <!-- Invite Member Modal -->
    <InviteMemberModal
      :is-open="showInviteModal"
      @close="showInviteModal = false"
    />

    <!-- Add Reminder Modal -->
    <AddReminderModal
      :show="showAddReminderModal"
      :pets="petsStore.pets"
      @close="showAddReminderModal = false"
    />

    <!-- Achievements Modal -->
    <AchievementsModal
      :show="showAchievementsModal"
      :activities="activitiesStore.sortedActivities"
      @close="showAchievementsModal = false"
    />

    <!-- Floating Action Button -->
    <FloatingActionButton
      @quick-log="handleQuickLog"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useHouseholdStore } from '@/stores/household'
import { useActivitiesStore } from '@/stores/activities'
import { usePetsStore } from '@/stores/pets'
import { useRemindersStore } from '@/stores/reminders'
import { useToast } from '@/composables/useToast'
import { usePdfExport } from '@/composables/usePdfExport'
import { useCsvExport } from '@/composables/useCsvExport'
import { useHaptic } from '@/composables/useHaptic'
import { useTheme } from '@/composables/useTheme'
import { useVoiceInput } from '@/composables/useVoiceInput'

// Eager-loaded lightweight components (used immediately on page load)
import ActivityButton from '@/components/ActivityButton.vue'
import CompactContextBar from '@/components/CompactContextBar.vue'
import TodaysSummary from '@/components/TodaysSummary.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import FloatingActionButton from '@/components/FloatingActionButton.vue'
import CollapsibleSection from '@/components/CollapsibleSection.vue'
import SkeletonLoader from '@/components/SkeletonLoader.vue'
import RemindersWidget from '@/components/RemindersWidget.vue'
import StreakCounter from '@/components/StreakCounter.vue'
import CalendarView from '@/components/CalendarView.vue'

// Lazy-loaded heavy components (improves initial bundle size)
// These are loaded asynchronously when needed, reducing main bundle by ~400KB
// Using SkeletonLoader for better perceived performance
const ActivityFeed = defineAsyncComponent({
  loader: () => import('@/components/ActivityFeed.vue'),
  loadingComponent: SkeletonLoader,
  delay: 200, // Show loading after 200ms
  timeout: 10000 // 10 second timeout
})

const WeightTrendChart = defineAsyncComponent({
  loader: () => import('@/components/WeightTrendChart.vue'),
  loadingComponent: LoadingSpinner,
  delay: 200,
  timeout: 10000
})

const ActivityInsights = defineAsyncComponent({
  loader: () => import('@/components/ActivityInsights.vue'),
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
const AddReminderModal = defineAsyncComponent(() =>
  import('@/components/AddReminderModal.vue')
)
const AchievementsModal = defineAsyncComponent(() =>
  import('@/components/AchievementsModal.vue')
)

const householdStore = useHouseholdStore()
const activitiesStore = useActivitiesStore()
const petsStore = usePetsStore()
const remindersStore = useRemindersStore()
const toast = useToast()
const { generateMedicalPdf } = usePdfExport()
const { exportActivitiesCSV } = useCsvExport()
const haptic = useHaptic()

// Initialize theme system - automatically applies theme when pet is selected
useTheme()

// Initialize voice input
const voice = useVoiceInput()

const showAddPetModal = ref(false)
const showNotesModal = ref(false)
const showMedicalModalRef = ref(false)
const showEditModal = ref(false)
const showAddReminderModal = ref(false)
const showAchievementsModal = ref(false)
const editingPet = ref(null)
const showSettingsModal = ref(false)
const showInviteModal = ref(false)
const pendingActivity = ref({ type: '', emoji: '' })
const pendingMedical = ref({ type: '', emoji: '' })
const editingActivity = ref(null)
const searchQuery = ref('')

// Computed: Filter activities based on search query
const filteredActivities = computed(() => {
  if (!searchQuery.value || searchQuery.value.trim() === '') {
    return activitiesStore.sortedActivities
  }

  const query = searchQuery.value.toLowerCase().trim()

  return activitiesStore.sortedActivities.filter(activity => {
    // Search in activity type
    if (activity.type.toLowerCase().includes(query)) return true

    // Search in notes
    if (activity.notes && activity.notes.toLowerCase().includes(query)) return true

    // Search in user name
    if (activity.user && activity.user.toLowerCase().includes(query)) return true

    // Search in pet name
    const pet = petsStore.pets.find(p => p.id === activity.petId)
    if (pet && pet.name.toLowerCase().includes(query)) return true

    // Search in medical data
    if (activity.medicalData) {
      if (activity.medicalData.notes && activity.medicalData.notes.toLowerCase().includes(query)) return true
      if (activity.medicalData.cost && activity.medicalData.cost.toString().includes(query)) return true
      if (activity.medicalData.vaccineName && activity.medicalData.vaccineName.toLowerCase().includes(query)) return true
      if (activity.medicalData.weight && activity.medicalData.weight.toString().includes(query)) return true
      if (activity.medicalData.unit && activity.medicalData.unit.toLowerCase().includes(query)) return true
    }

    return false
  })
})

onMounted(() => {
  // Start Firebase listeners for real-time sync
  activitiesStore.startListener()
  petsStore.startListener()
  remindersStore.startListener()

  // Initialize reminders (check notification permissions)
  remindersStore.initialize()

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
  remindersStore.stopListener()

  // Save offline queue
  activitiesStore.saveOfflineQueue()
})

function openInviteModal() {
  showSettingsModal.value = false
  showInviteModal.value = true
}

function handleAddPet() {
  editingPet.value = null
  showSettingsModal.value = false
  showAddPetModal.value = true
}

function handleEditPet(pet) {
  editingPet.value = pet
  showSettingsModal.value = false
  showAddPetModal.value = true
}

function handleCloseAddPetModal() {
  showAddPetModal.value = false
  editingPet.value = null
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

function exportActivitiesToCSV() {
  // Export filtered activities (respects search query and pet filter)
  const result = exportActivitiesCSV(
    filteredActivities.value,
    petsStore.pets,
    {
      petName: petsStore.selectedPet?.name || 'All Pets',
      searchQuery: searchQuery.value
    }
  )

  if (result.success) {
    const message = searchQuery.value
      ? `CSV exported: ${result.count} filtered activities`
      : `CSV exported: ${result.count} activities`
    toast.success(message)
  } else {
    toast.error(`Failed to export: ${result.error}`)
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

function handleVoiceLog() {
  if (voice.isListening) {
    voice.stopListening()
  } else {
    voice.startListening()
  }
}

// Watch for voice transcript changes
import { watch } from 'vue'
watch(() => voice.transcript, async (newTranscript) => {
  if (!newTranscript) return

  const command = voice.parseCommand(newTranscript)

  if (!command) {
    toast.error(`Could not understand: "${newTranscript}". Try "log poop" or "log food"`)
    return
  }

  // If pet name specified, try to select that pet
  if (command.petName) {
    const pet = petsStore.pets.find(p => p.name.toLowerCase() === command.petName.toLowerCase())
    if (pet) {
      petsStore.selectPet(pet.id)
      toast.success(`Selected ${pet.emoji} ${pet.name}`)
    } else {
      toast.error(`Pet "${command.petName}" not found`)
      return
    }
  }

  // Check if pet is selected
  if (!petsStore.selectedPet || petsStore.selectedPetId === 'all') {
    toast.error('Please select a specific pet first or say "for [pet name]"')
    return
  }

  // Log the activity
  await handleQuickLog({ type: command.type, emoji: command.emoji })

  toast.success(`Voice logged: ${command.emoji} ${command.type}`)
})
</script>

<style scoped>
/* Compact Card Styles */
.card-compact {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 1rem;
  padding: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(229, 231, 235, 0.5);
}

.dark .card-compact {
  background: rgba(31, 41, 55, 0.8);
  border-color: rgba(75, 85, 99, 0.5);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

@media (min-width: 640px) {
  .card-compact {
    padding: 1rem;
  }
}

/* Sticky Header */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  transition: all 0.3s ease;
}

/* Settings Button (Icon Only) */
.settings-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 44px;
  min-height: 44px;
}

.dark .settings-btn {
  background: #374151;
  border-color: #4b5563;
}

.settings-btn:hover {
  background: #8B9A7D;
  border-color: #8B9A7D;
  transform: translateY(-1px);
}

.voice-listening {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
  animation: pulse-voice 1s ease-in-out infinite;
}

@keyframes pulse-voice {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
}

/* Medical Buttons Horizontal Scroll */
.medical-buttons-scroll {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: rgba(139, 154, 125, 0.3) transparent;
}

.medical-buttons-scroll::-webkit-scrollbar {
  height: 6px;
}

.medical-buttons-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.medical-buttons-scroll::-webkit-scrollbar-thumb {
  background: rgba(139, 154, 125, 0.3);
  border-radius: 3px;
}

.medical-buttons-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(139, 154, 125, 0.5);
}

/* Export Button */
.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  color: #374151;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease-in-out;
  min-height: 44px;
  min-width: 44px;
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

  .btn-export {
    font-size: 0.875rem;
    padding: 0.5rem 0.75rem;
  }
}
</style>
