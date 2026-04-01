<template>
  <div class="min-h-screen p-4 sm:p-6 pb-24">
    <!-- Pull-to-Refresh Indicator -->
    <div
      v-if="pullToRefresh.isPulling.value || pullToRefresh.isRefreshing.value"
      class="pull-to-refresh-indicator"
      :style="{ height: `${pullToRefresh.pullDistance.value}px`, opacity: pullToRefresh.pullProgress.value }"
    >
      <div class="pull-to-refresh-content">
        <span
          v-if="pullToRefresh.isRefreshing.value"
          class="spinner"
        >⟳</span>
        <span
          v-else-if="pullToRefresh.pullProgress.value >= 1"
          class="text-lg"
        >↓</span>
        <span
          v-else
          class="text-lg opacity-50"
        >↓</span>
        <span class="text-sm ml-2">
          {{ pullToRefresh.isRefreshing.value ? 'Refreshing...' : pullToRefresh.pullProgress.value >= 1 ? 'Release to refresh' : 'Pull to refresh' }}
        </span>
      </div>
    </div>

    <div class="max-w-4xl mx-auto space-y-5 sm:space-y-6 py-3 sm:py-4">
      <!-- Compact Sticky Header -->
      <div class="card-compact sticky-header">
        <!-- Row 1: Title + Settings Button -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <!-- Title -->
          <h1 class="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex-shrink-0">
            🐾 {{ householdStore.householdName || 'Tailr' }}
          </h1>

          <!-- Action Buttons -->
          <div class="flex items-center gap-1.5 flex-shrink-0">
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

        <!-- Row 2: Context Selectors (Full Width) -->
        <div class="w-full">
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
        </div>
      </div>

      <!-- PRIMARY ACTION: Quick Log Buttons -->
      <div class="card-premium animate-slide-up">
        <h3 class="heading-secondary mb-3">
          Quick Log
          <span
            v-if="petsStore.selectedPet"
            class="stat-badge ml-2"
          >
            {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
          </span>
        </h3>
        <div class="activity-grid-responsive">
          <ActivityButton
            icon="poop"
            label="Poop"
            :count="activitiesStore.stats.poop"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Poop', '💩')"
          />
          <ActivityButton
            icon="pee"
            label="Pee"
            :count="activitiesStore.stats.pee"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Pee', '💧')"
          />
          <ActivityButton
            icon="food"
            label="Food"
            :count="activitiesStore.stats.food"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Food', '🍖')"
          />
          <ActivityButton
            icon="sleep"
            label="Sleep"
            :count="activitiesStore.stats.sleep"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Sleep', '😴')"
          />
          <ActivityButton
            icon="meds"
            label="Meds"
            :count="activitiesStore.stats.meds"
            :disabled="activitiesStore.loading"
            @click="showActivityNotes('Meds', '💊')"
          />
          <ActivityButton
            icon="walk"
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
      <div class="card-premium animate-slide-up">
        <div class="flex items-center justify-between mb-3">
          <h3 class="heading-secondary">
            Recent Activity
          </h3>
          <!-- Export Button -->
          <button
            class="btn-export"
            :title="searchQueryRaw ? `Export ${filteredActivities.length} filtered activities to CSV` : 'Export all activities to CSV'"
            @click="exportActivitiesToCSV"
          >
            <span class="text-lg">📊</span>
            <span class="export-label">
              Export CSV
              <span
                v-if="searchQueryRaw"
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
            v-model="searchQueryRaw"
            type="text"
            placeholder="Search activities..."
            data-search-input
            aria-label="Search activities"
            role="searchbox"
            class="input-modern"
            style="font-size: 16px; min-height: 44px;"
          >
          <button
            v-if="searchQueryRaw"
            class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
            @click="searchQueryRaw = ''"
          >
            <span class="text-lg">✕</span>
          </button>
        </div>

        <!-- Activity Feed -->
        <ActivityFeed
          :activities="paginatedActivities"
          :pets="petsStore.pets"
          :show-pet-names="petsStore.selectedPetId === 'all'"
          :search-query="searchQuery"
          @delete="handleDelete"
          @edit="handleEdit"
        />

        <!-- Load More Button -->
        <div
          v-if="hasMore"
          class="mt-4 text-center"
        >
          <button
            class="btn-load-more"
            aria-label="Load more activities"
            @click="loadMore"
          >
            Load More ({{ remainingCount }} remaining)
          </button>
        </div>
      </div>

      <!-- Activity Insights -->
      <CollapsibleSection
        title="Activity Insights"
        :subtitle="petsStore.selectedPet ? `Smart patterns for ${petsStore.selectedPet.name}` : 'Smart patterns and alerts'"
        icon="💡"
        :default-collapsed="true"
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
            icon="vet"
            label="Vet Visit"
            :count="activitiesStore.stats.vetVisit"
            :disabled="activitiesStore.loading"
            custom-class="medical-button-compact"
            @click="showMedicalModal('Vet Visit', '🏥')"
          />
          <ActivityButton
            icon="vaccination"
            label="Vaccination"
            :count="activitiesStore.stats.vaccination"
            :disabled="activitiesStore.loading"
            custom-class="medical-button-compact"
            @click="showMedicalModal('Vaccination', '💉')"
          />
          <ActivityButton
            icon="weight"
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
        :default-collapsed="true"
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

      <!-- Photo Gallery -->
      <CollapsibleSection
        title="Photo Gallery"
        :subtitle="photoCount > 0 ? `${photoCount} photo${photoCount !== 1 ? 's' : ''}` : 'Moments with your pet'"
        icon="📸"
        :badge="photoCount"
        :default-collapsed="true"
        section-id="photo-gallery"
      >
        <PhotoGallery
          :activities="activitiesStore.filteredActivities"
          :pets="petsStore.pets"
        />
      </CollapsibleSection>

      <!-- Photo Comparison -->
      <CollapsibleSection
        title="Photo Comparison"
        subtitle="Before & After comparisons"
        icon="📸📸"
        :default-collapsed="true"
        section-id="photo-comparison"
      >
        <PhotoComparison
          :activities="activitiesStore.filteredActivities"
          @open-photo="handleOpenPhoto"
        />
      </CollapsibleSection>

      <!-- Pet Timeline -->
      <CollapsibleSection
        v-if="petsStore.selectedPetId !== 'all'"
        title="Pet Timeline"
        :subtitle="`${petsStore.selectedPet?.name}'s life events`"
        icon="📅"
        :default-collapsed="true"
        section-id="pet-timeline"
      >
        <PetTimeline
          :activities="activitiesStore.filteredActivities"
          :pet="petsStore.selectedPet"
          @open-photo="handleOpenPhoto"
        />
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
import { refDebounced } from '@vueuse/core'
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
import { usePullToRefresh } from '@/composables/usePullToRefresh'
import { usePagination } from '@/composables/usePagination'
import { useGlobalKeyboardShortcuts } from '@/composables/useKeyboardShortcuts'

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
import PhotoGallery from '@/components/PhotoGallery.vue'
import PetTimeline from '@/components/PetTimeline.vue'
import PhotoComparison from '@/components/PhotoComparison.vue'

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

// Initialize pull-to-refresh
const handleRefresh = async () => {
  // Re-sync activities from Firebase
  await activitiesStore.refreshActivities()
  // Re-sync offline queue if exists
  if (activitiesStore.offlineQueue.length > 0) {
    await activitiesStore.syncOfflineQueue()
  }
  toast.success('Activities refreshed', 1500)
  haptic.light()
}

const pullToRefresh = usePullToRefresh(handleRefresh, {
  threshold: 80,
  maxPull: 120,
  resistance: 2.5
})

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
// Search query with debouncing (300ms) to avoid filtering on every keystroke
const searchQueryRaw = ref('')
const searchQuery = refDebounced(searchQueryRaw, 300)

// Computed: Photo count
const photoCount = computed(() => {
  return activitiesStore.filteredActivities.filter(a => a.photoUrl).length
})

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

// Pagination for better performance with large activity lists
const {
  paginatedItems: paginatedActivities,
  hasMore,
  remainingCount,
  loadMore
} = usePagination(filteredActivities, {
  initialPageSize: 50,
  loadMoreSize: 25
})

// Use keyboard shortcuts
useGlobalKeyboardShortcuts()

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

  // Setup pull-to-refresh listeners on the main dashboard container
  const dashboardContainer = document.querySelector('.min-h-screen')
  if (dashboardContainer) {
    pullToRefresh.setupListeners(dashboardContainer)
  }
})

onUnmounted(() => {
  // Stop listeners when leaving dashboard
  activitiesStore.stopListener()
  petsStore.stopListener()
  remindersStore.stopListener()

  // Save offline queue
  activitiesStore.saveOfflineQueue()

  // Remove pull-to-refresh listeners
  const dashboardContainer = document.querySelector('.min-h-screen')
  if (dashboardContainer) {
    pullToRefresh.removeListeners(dashboardContainer)
  }
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

function handleOpenPhoto(activity) {
  // Open photo in new window/tab
  if (activity.photoUrl) {
    window.open(activity.photoUrl, '_blank', 'noopener,noreferrer')
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
  // Note: logActivity() already shows success toast, so we don't need another one here
  await activitiesStore.logActivity(type, emoji, '', null)
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

  // Log the activity (already shows success toast)
  await handleQuickLog({ type: command.type, emoji: command.emoji })
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

/* Pull-to-Refresh Indicator */
.pull-to-refresh-indicator {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  overflow: hidden;
  z-index: 50;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.pull-to-refresh-content {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  color: #8B9A7D;
  font-weight: 500;
}

.dark .pull-to-refresh-content {
  color: #a8b89a;
}

.spinner {
  display: inline-block;
  font-size: 1.25rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Load More Button */
.btn-load-more {
  padding: 12px 24px;
  background: linear-gradient(135deg, #8B9A7D 0%, #7a8970 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(139, 154, 125, 0.2);
}

.btn-load-more:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139, 154, 125, 0.3);
}

.btn-load-more:active {
  transform: translateY(0);
}

@media (prefers-color-scheme: dark) {
  .btn-load-more {
    background: linear-gradient(135deg, #9aab8c 0%, #8B9A7D 100%);
  }
}
</style>
