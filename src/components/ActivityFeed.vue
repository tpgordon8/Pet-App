<template>
  <div class="activity-feed space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
        Recent Activity
      </h3>
      <span class="text-sm text-gray-500 dark:text-gray-400">
        {{ activities.length }} total
      </span>
    </div>

    <!-- Empty state -->
    <div
      v-if="activities.length === 0"
      class="card text-center py-12"
    >
      <span class="text-6xl mb-4 block">🐾</span>
      <p class="text-gray-600 dark:text-gray-400">
        No activities yet. Log your first activity above!
      </p>
    </div>

    <!-- Activity list -->
    <div v-else class="space-y-3">
      <!-- Group by date -->
      <div
        v-for="group in groupedActivities"
        :key="group.date"
        class="space-y-2"
      >
        <!-- Date header -->
        <div class="sticky top-0 z-10 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-lg">
          <h4 class="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
            {{ group.label }}
          </h4>
        </div>

        <!-- Activities for this date -->
        <div
          v-for="activity in group.activities"
          :key="activity.id"
          class="activity-item glass rounded-xl p-4 flex items-start gap-4 hover:shadow-glass transition-shadow"
        >
          <!-- Emoji -->
          <span class="text-3xl">{{ activity.emoji }}</span>

          <!-- Details -->
          <div class="flex-1 min-w-0">
            <div class="flex items-baseline gap-2 flex-wrap">
              <h4 class="font-semibold text-gray-900 dark:text-white">
                {{ activity.type }}
              </h4>
              <span v-if="showPetNames && getPetName(activity.petId)" class="text-xs text-sage-600 dark:text-sage-400">
                {{ getPetEmoji(activity.petId) }} {{ getPetName(activity.petId) }}
              </span>
              <span class="text-xs text-gray-500 dark:text-gray-400">
                by {{ activity.user }}
              </span>
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ formatTime(activity.timestamp) }}
            </p>
            <p v-if="activity.notes" class="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {{ activity.notes }}
            </p>

            <!-- Medical Data Display -->
            <div v-if="activity.medicalData" class="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-1">
              <!-- Vet Visit -->
              <template v-if="activity.type === 'Vet Visit'">
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
                <p v-if="activity.medicalData.cost" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Cost:</strong> ${{ activity.medicalData.cost.toFixed(2) }}
                </p>
              </template>

              <!-- Vaccination -->
              <template v-if="activity.type === 'Vaccination'">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Vaccine:</strong> {{ activity.medicalData.vaccineName }}
                </p>
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
              </template>

              <!-- Weight Check -->
              <template v-if="activity.type === 'Weight Check'">
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Weight:</strong> {{ activity.medicalData.weight }} {{ activity.medicalData.unit }}
                </p>
                <p v-if="activity.medicalData.notes" class="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Notes:</strong> {{ activity.medicalData.notes }}
                </p>
              </template>
            </div>

            <img
              v-if="activity.photoUrl"
              :src="activity.photoUrl"
              alt="Activity photo"
              class="mt-2 rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              @click="openPhoto(activity.photoUrl)"
            />
          </div>

          <!-- Actions (hover) -->
          <div class="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
            <button
              v-if="canEdit(activity)"
              @click="$emit('edit', activity)"
              class="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm p-1"
              title="Edit"
            >
              ✏️
            </button>
            <button
              @click="$emit('delete', activity.id)"
              class="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm p-1"
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineProps, defineEmits } from 'vue'
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  },
  pets: {
    type: Array,
    default: () => []
  },
  showPetNames: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['delete', 'edit'])

// Group activities by date
const groupedActivities = computed(() => {
  const groups = {}

  props.activities.forEach(activity => {
    const date = new Date(activity.timestamp)
    const dateKey = format(date, 'yyyy-MM-dd')

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: dateKey,
        label: getDateLabel(date),
        activities: []
      }
    }

    groups[dateKey].activities.push(activity)
  })

  // Convert to array and sort by date (newest first)
  return Object.values(groups).sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })
})

function getDateLabel(date) {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEEE, MMM d')
}

function formatTime(timestamp) {
  const date = new Date(timestamp)
  const time = format(date, 'h:mm a')
  const relative = formatDistanceToNow(date, { addSuffix: true })
  return `${time} (${relative})`
}

function getPetName(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.name || ''
}

function getPetEmoji(petId) {
  const pet = props.pets.find(p => p.id === petId)
  return pet?.emoji || ''
}

function openPhoto(url) {
  window.open(url, '_blank')
}

function canEdit(activity) {
  // Medical activities cannot be edited (too complex)
  const medicalTypes = ['Vet Visit', 'Vaccination', 'Weight Check']
  return !medicalTypes.includes(activity.type)
}
</script>

<style scoped>
.activity-item {
  position: relative;
}

.activity-item:hover .opacity-0 {
  opacity: 1;
}

@media (max-width: 640px) {
  .activity-item {
    padding: 0.75rem;
  }

  .activity-item > span:first-child {
    font-size: 1.75rem;
  }
}
</style>
