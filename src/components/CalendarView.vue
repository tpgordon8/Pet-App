<template>
  <div class="calendar-view glass rounded-2xl p-4">
    <!-- Month Navigation Header -->
    <div class="calendar-header flex items-center justify-between mb-4">
      <button
        @click="previousMonth"
        class="nav-button"
        aria-label="Previous month"
      >
        ‹
      </button>

      <h3 class="calendar-title">
        {{ monthYearLabel }}
      </h3>

      <button
        @click="nextMonth"
        class="nav-button"
        :disabled="isCurrentMonth"
        :class="{ 'opacity-40': isCurrentMonth }"
        aria-label="Next month"
      >
        ›
      </button>
    </div>

    <!-- Day of Week Headers -->
    <div class="calendar-weekdays">
      <div
        v-for="day in weekdays"
        :key="day"
        class="weekday-label"
      >
        {{ day }}
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <button
        v-for="day in calendarDays"
        :key="day.date"
        @click="selectDay(day)"
        class="calendar-day"
        :class="{
          'inactive': !day.isCurrentMonth,
          'today': day.isToday,
          'selected': day.isSelected,
          'has-activities': day.activityCount > 0
        }"
        :disabled="!day.isCurrentMonth"
        :aria-label="`${day.date}, ${day.activityCount} activities`"
      >
        <span class="day-number">{{ day.dayNumber }}</span>
        <div
          v-if="day.activityCount > 0"
          class="activity-indicators"
        >
          <span
            v-for="type in day.activityTypes.slice(0, 3)"
            :key="type"
            class="activity-dot"
            :title="type"
          >
          </span>
          <span v-if="day.activityCount > 3" class="activity-more">
            +{{ day.activityCount - 3 }}
          </span>
        </div>
      </button>
    </div>

    <!-- Selected Day Activities -->
    <div v-if="selectedDay && selectedDay.activityCount > 0" class="selected-day-activities mt-4">
      <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-2">
        {{ selectedDay.label }} ({{ selectedDay.activityCount }} {{ selectedDay.activityCount === 1 ? 'activity' : 'activities' }})
      </h4>
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="activity in selectedDay.activities"
          :key="activity.id"
          class="activity-summary"
        >
          <span class="text-lg">{{ activity.emoji }}</span>
          <div class="flex-1 ml-2">
            <div class="text-sm font-medium text-gray-900 dark:text-white">
              {{ activity.type }}
            </div>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              {{ formatTime(activity.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday as isDateToday
} from 'date-fns'

const props = defineProps({
  activities: {
    type: Array,
    required: true
  }
})

// State
const currentMonth = ref(new Date())
const selectedDay = ref(null)

// Weekday labels
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Month/Year label
const monthYearLabel = computed(() => {
  return format(currentMonth.value, 'MMMM yyyy')
})

// Check if current month is today's month
const isCurrentMonth = computed(() => {
  return isSameMonth(currentMonth.value, new Date())
})

// Generate calendar days array
const calendarDays = computed(() => {
  const monthStart = startOfMonth(currentMonth.value)
  const monthEnd = endOfMonth(currentMonth.value)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  return days.map(day => {
    const dayActivities = props.activities.filter(activity => {
      return isSameDay(new Date(activity.timestamp), day)
    })

    const activityTypes = [...new Set(dayActivities.map(a => a.type))]

    return {
      date: day.toISOString(),
      dayNumber: format(day, 'd'),
      label: format(day, 'MMMM d, yyyy'),
      isCurrentMonth: isSameMonth(day, currentMonth.value),
      isToday: isDateToday(day),
      isSelected: selectedDay.value ? isSameDay(day, new Date(selectedDay.value.date)) : false,
      activityCount: dayActivities.length,
      activityTypes,
      activities: dayActivities
    }
  })
})

// Navigation
function previousMonth() {
  currentMonth.value = subMonths(currentMonth.value, 1)
  selectedDay.value = null
}

function nextMonth() {
  if (!isCurrentMonth.value) {
    currentMonth.value = addMonths(currentMonth.value, 1)
    selectedDay.value = null
  }
}

function selectDay(day) {
  if (day.isCurrentMonth && day.activityCount > 0) {
    selectedDay.value = day
  }
}

function formatTime(timestamp) {
  return format(new Date(timestamp), 'h:mm a')
}
</script>

<style scoped>
.calendar-view {
  background: rgba(255, 255, 255, 0.9);
}

.dark .calendar-view {
  background: rgba(31, 41, 55, 0.8);
}

/* Header */
.calendar-header {
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .calendar-header {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.calendar-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #374151;
}

.dark .calendar-title {
  color: #d1d5db;
}

.nav-button {
  width: 2.75rem;   /* 44px - iOS minimum touch target */
  height: 2.75rem;  /* 44px - iOS minimum touch target */
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: #6b7280;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s;
}

.dark .nav-button {
  color: #9ca3af;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);
}

.nav-button:hover:not(:disabled) {
  background: var(--theme-primary, #8B9A7D);
  color: white;
  transform: scale(1.05);
}

.nav-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Weekdays */
.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}

.weekday-label {
  text-align: center;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  padding: 0.5rem 0;
}

.dark .weekday-label {
  color: #9ca3af;
}

/* Calendar Grid */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.25rem;
}

.calendar-day {
  aspect-ratio: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.25rem;
  border-radius: 0.5rem;
  border: 2px solid transparent;
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .calendar-day {
  background: rgba(255, 255, 255, 0.02);
}

.calendar-day.inactive {
  opacity: 0.3;
  cursor: not-allowed;
}

.calendar-day.today {
  background: linear-gradient(135deg, var(--theme-primary, #8B9A7D) 0%, var(--theme-dark, #6d7e60) 100%);
  color: white;
  font-weight: 700;
}

.calendar-day.selected {
  border-color: var(--theme-primary, #8B9A7D);
  box-shadow: 0 0 0 2px var(--theme-light, #b4bfa3);
  transform: scale(1.05);
}

.calendar-day.has-activities:not(.today) {
  background: rgba(var(--theme-primary-rgb, 139, 154, 125), 0.08);
}

.calendar-day:hover:not(.inactive):not(.today) {
  background: rgba(var(--theme-primary-rgb, 139, 154, 125), 0.15);
  transform: translateY(-2px);
}

.day-number {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.dark .day-number {
  color: #d1d5db;
}

.calendar-day.today .day-number {
  color: white;
}

/* Activity Indicators */
.activity-indicators {
  display: flex;
  gap: 2px;
  margin-top: 2px;
  align-items: center;
}

.activity-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--theme-primary, #8B9A7D);
}

.calendar-day.today .activity-dot {
  background: white;
}

.activity-more {
  font-size: 0.5rem;
  font-weight: 600;
  color: var(--theme-dark, #6d7e60);
}

.calendar-day.today .activity-more {
  color: white;
}

/* Selected Day Activities */
.selected-day-activities {
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .selected-day-activities {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.activity-summary {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 0.5rem;
}

.dark .activity-summary {
  background: rgba(255, 255, 255, 0.03);
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .calendar-grid {
    gap: 0.375rem;  /* More breathing room between days */
  }

  .calendar-day {
    padding: 0.5rem 0.375rem;  /* Larger touch area */
  }

  .day-number {
    font-size: 0.9375rem;  /* 15px - better readability */
  }

  .activity-dot {
    width: 3px;
    height: 3px;
  }

  .calendar-title {
    font-size: 1rem;
  }
}

/* Very small screens (iPhone SE and smaller) */
@media (max-width: 390px) {
  .calendar-day {
    padding: 0.375rem 0.25rem;
  }

  .day-number {
    font-size: 0.875rem;  /* 14px minimum */
  }
}
</style>
