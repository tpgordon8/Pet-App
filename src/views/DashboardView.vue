<template>
  <div class="min-h-screen p-4 pb-20">
    <div class="max-w-4xl mx-auto space-y-6 py-8">
      <!-- Header -->
      <div class="card flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            🐾 Tailr
          </h1>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Welcome, {{ householdStore.memberName }}!
          </p>
        </div>
        <button
          @click="handleLogout"
          class="btn btn-secondary"
        >
          Logout
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
          <span v-if="petsStore.selectedPet" class="text-sage-600 dark:text-sage-400">
            for {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
          </span>
        </h3>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ActivityButton
            emoji="💩"
            label="Poop"
            :count="activitiesStore.stats.poop"
            @click="showActivityNotes('Poop', '💩')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="💧"
            label="Pee"
            :count="activitiesStore.stats.pee"
            @click="showActivityNotes('Pee', '💧')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="🍖"
            label="Food"
            :count="activitiesStore.stats.food"
            @click="showActivityNotes('Food', '🍖')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="😴"
            label="Sleep"
            :count="activitiesStore.stats.sleep"
            @click="showActivityNotes('Sleep', '😴')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="💊"
            label="Meds"
            :count="activitiesStore.stats.meds"
            @click="showActivityNotes('Meds', '💊')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="🚶"
            label="Walk"
            :count="activitiesStore.stats.walk"
            @click="showActivityNotes('Walk', '🚶')"
            :disabled="activitiesStore.loading"
          />
        </div>
      </div>

      <!-- Medical Tracking Section -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-md font-semibold text-gray-900 dark:text-white">
            Medical Tracking
            <span v-if="petsStore.selectedPet" class="text-sage-600 dark:text-sage-400">
              for {{ petsStore.selectedPet.emoji }} {{ petsStore.selectedPet.name }}
            </span>
          </h3>
          <button
            v-if="petsStore.selectedPet && petsStore.selectedPetId !== 'all'"
            @click="exportMedicalPdf"
            class="btn-export"
            title="Export medical history as PDF"
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
            @click="showMedicalModal('Vet Visit', '🏥')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="💉"
            label="Vaccination"
            :count="activitiesStore.stats.vaccination"
            @click="showMedicalModal('Vaccination', '💉')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="⚖️"
            label="Weight Check"
            :count="activitiesStore.stats.weightCheck"
            @click="showMedicalModal('Weight Check', '⚖️')"
            :disabled="activitiesStore.loading"
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
          />
          <button
            v-if="searchQuery"
            @click="searchQuery = ''"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'
import { useActivitiesStore } from '@/stores/activities'
import { usePetsStore } from '@/stores/pets'
import { useToast } from '@/composables/useToast'
import { usePdfExport } from '@/composables/usePdfExport'
import ActivityButton from '@/components/ActivityButton.vue'
import ActivityFeed from '@/components/ActivityFeed.vue'
import StatsWidget from '@/components/StatsWidget.vue'
import PetSelector from '@/components/PetSelector.vue'
import MemberSelector from '@/components/MemberSelector.vue'
import AddPetModal from '@/components/AddPetModal.vue'
import ActivityNotesModal from '@/components/ActivityNotesModal.vue'
import MedicalModal from '@/components/MedicalModal.vue'
import EditActivityModal from '@/components/EditActivityModal.vue'
import WeightTrendChart from '@/components/WeightTrendChart.vue'
import ActivityInsights from '@/components/ActivityInsights.vue'

const router = useRouter()
const householdStore = useHouseholdStore()
const activitiesStore = useActivitiesStore()
const petsStore = usePetsStore()
const toast = useToast()
const { generateMedicalPdf } = usePdfExport()

const showAddPetModal = ref(false)
const showNotesModal = ref(false)
const showMedicalModalRef = ref(false)
const showEditModal = ref(false)
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

function handleLogout() {
  activitiesStore.stopListener()
  petsStore.stopListener()
  householdStore.logout()
  router.push('/')
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
  if (confirm('Are you sure you want to delete this activity?')) {
    await activitiesStore.deleteActivity(activityId)
  }
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
