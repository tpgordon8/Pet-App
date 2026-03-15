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
            @click="logActivity('Poop', '💩')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="💧"
            label="Pee"
            :count="activitiesStore.stats.pee"
            @click="logActivity('Pee', '💧')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="🍖"
            label="Food"
            :count="activitiesStore.stats.food"
            @click="logActivity('Food', '🍖')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="😴"
            label="Sleep"
            :count="activitiesStore.stats.sleep"
            @click="logActivity('Sleep', '😴')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="💊"
            label="Meds"
            :count="activitiesStore.stats.meds"
            @click="logActivity('Meds', '💊')"
            :disabled="activitiesStore.loading"
          />
          <ActivityButton
            emoji="🚶"
            label="Walk"
            :count="activitiesStore.stats.walk"
            @click="logActivity('Walk', '🚶')"
            :disabled="activitiesStore.loading"
          />
        </div>
      </div>

      <!-- Activity Feed -->
      <div class="card">
        <ActivityFeed
          :activities="activitiesStore.sortedActivities"
          :pets="petsStore.pets"
          :show-pet-names="petsStore.selectedPetId === 'all'"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Add Pet Modal -->
    <AddPetModal
      :show="showAddPetModal"
      @close="showAddPetModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/household'
import { useActivitiesStore } from '@/stores/activities'
import { usePetsStore } from '@/stores/pets'
import ActivityButton from '@/components/ActivityButton.vue'
import ActivityFeed from '@/components/ActivityFeed.vue'
import StatsWidget from '@/components/StatsWidget.vue'
import PetSelector from '@/components/PetSelector.vue'
import MemberSelector from '@/components/MemberSelector.vue'
import AddPetModal from '@/components/AddPetModal.vue'

const router = useRouter()
const householdStore = useHouseholdStore()
const activitiesStore = useActivitiesStore()
const petsStore = usePetsStore()

const showAddPetModal = ref(false)

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

async function logActivity(type, emoji) {
  await activitiesStore.logActivity(type, emoji)
}

async function handleDelete(activityId) {
  if (confirm('Are you sure you want to delete this activity?')) {
    await activitiesStore.deleteActivity(activityId)
  }
}
</script>
