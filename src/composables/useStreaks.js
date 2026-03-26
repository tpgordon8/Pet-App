import { computed } from 'vue'
import { differenceInDays, startOfDay, subDays } from 'date-fns'

/**
 * Achievement Definitions
 */
export const ACHIEVEMENTS = {
  // Streak Achievements
  STREAK_3: {
    id: 'streak_3',
    title: '3-Day Streak! 🔥',
    description: 'Logged activities for 3 days in a row',
    emoji: '🔥',
    requirement: { type: 'streak', value: 3 },
    color: '#fb923c' // orange
  },
  STREAK_7: {
    id: 'streak_7',
    title: 'Week Warrior! 🏆',
    description: '7 consecutive days of logging',
    emoji: '🏆',
    requirement: { type: 'streak', value: 7 },
    color: '#f59e0b' // amber
  },
  STREAK_14: {
    id: 'streak_14',
    title: 'Two Week Champion! 🌟',
    description: '14 days of consistent pet care tracking',
    emoji: '🌟',
    requirement: { type: 'streak', value: 14 },
    color: '#10b981' // emerald
  },
  STREAK_30: {
    id: 'streak_30',
    title: 'Monthly Master! 💎',
    description: '30 days of dedication!',
    emoji: '💎',
    requirement: { type: 'streak', value: 30 },
    color: '#6366f1' // indigo
  },
  STREAK_100: {
    id: 'streak_100',
    title: 'Century Club! 👑',
    description: '100 days! You are a pet care legend!',
    emoji: '👑',
    requirement: { type: 'streak', value: 100 },
    color: '#a78bfa' // purple
  },

  // Activity Count Achievements
  ACTIVITIES_10: {
    id: 'activities_10',
    title: 'Getting Started! 📝',
    description: 'Logged 10 activities total',
    emoji: '📝',
    requirement: { type: 'count', value: 10 },
    color: '#60a5fa' // blue
  },
  ACTIVITIES_50: {
    id: 'activities_50',
    title: 'Dedicated Parent! 💪',
    description: '50 activities logged',
    emoji: '💪',
    requirement: { type: 'count', value: 50 },
    color: '#10b981' // emerald
  },
  ACTIVITIES_100: {
    id: 'activities_100',
    title: 'Century of Care! 🎯',
    description: '100 activities! Amazing dedication!',
    emoji: '🎯',
    requirement: { type: 'count', value: 100 },
    color: '#f59e0b' // amber
  },
  ACTIVITIES_500: {
    id: 'activities_500',
    title: 'Super Parent! 🦸',
    description: '500 activities! Incredible!',
    emoji: '🦸',
    requirement: { type: 'count', value: 500 },
    color: '#ef4444' // rose
  },
  ACTIVITIES_1000: {
    id: 'activities_1000',
    title: 'Legendary Caretaker! 🌈',
    description: '1000 activities! You are unstoppable!',
    emoji: '🌈',
    requirement: { type: 'count', value: 1000 },
    color: '#a78bfa' // purple
  },

  // Special Achievements
  FIRST_ACTIVITY: {
    id: 'first_activity',
    title: 'First Step! 🎉',
    description: 'Logged your very first activity',
    emoji: '🎉',
    requirement: { type: 'count', value: 1 },
    color: '#f472b6' // pink
  },
  MEDICAL_VISIT: {
    id: 'medical_visit',
    title: 'Health Conscious! 🏥',
    description: 'Logged a vet visit',
    emoji: '🏥',
    requirement: { type: 'medical', value: 1 },
    color: '#ef4444' // rose
  },
  PHOTO_LOGGED: {
    id: 'photo_logged',
    title: 'Memory Keeper! 📸',
    description: 'Attached a photo to an activity',
    emoji: '📸',
    requirement: { type: 'photo', value: 1 },
    color: '#60a5fa' // blue
  },
  EARLY_BIRD: {
    id: 'early_bird',
    title: 'Early Bird! 🌅',
    description: 'Logged an activity before 6 AM',
    emoji: '🌅',
    requirement: { type: 'special', value: 'early' },
    color: '#fb923c' // orange
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl! 🦉',
    description: 'Logged an activity after 10 PM',
    emoji: '🦉',
    requirement: { type: 'special', value: 'late' },
    color: '#6366f1' // indigo
  }
}

/**
 * useStreaks Composable
 * Calculate streaks and achievements from activities
 */
export function useStreaks(activities) {
  /**
   * Calculate current streak
   * Returns number of consecutive days with at least one activity
   */
  const currentStreak = computed(() => {
    if (!activities.value || activities.value.length === 0) {
      return 0
    }

    // Sort activities by date (newest first)
    const sortedActivities = [...activities.value].sort((a, b) => b.timestamp - a.timestamp)

    let streak = 0
    let checkDate = startOfDay(new Date())

    // Check if there's an activity today or yesterday (grace period)
    const latestActivity = sortedActivities[0]
    const daysSinceLatest = differenceInDays(new Date(), new Date(latestActivity.timestamp))

    if (daysSinceLatest > 1) {
      // Streak broken if more than 1 day since last activity
      return 0
    }

    // Count consecutive days with activities
    for (let i = 0; i < 365; i++) { // Max 365 days
      const hasActivityOnDate = sortedActivities.some(activity => {
        const activityDate = startOfDay(new Date(activity.timestamp))
        return activityDate.getTime() === checkDate.getTime()
      })

      if (hasActivityOnDate) {
        streak++
        checkDate = subDays(checkDate, 1)
      } else if (i === 0) {
        // First day checked (today) - check yesterday
        checkDate = subDays(checkDate, 1)
        continue
      } else {
        break // Streak broken
      }
    }

    return streak
  })

  /**
   * Calculate longest streak ever
   */
  const longestStreak = computed(() => {
    if (!activities.value || activities.value.length === 0) {
      return 0
    }

    const sortedActivities = [...activities.value].sort((a, b) => a.timestamp - b.timestamp)
    const uniqueDates = new Set(
      sortedActivities.map(a => startOfDay(new Date(a.timestamp)).getTime())
    )

    const datesArray = Array.from(uniqueDates).sort((a, b) => a - b)

    let maxStreak = 1
    let currentStreakCount = 1

    for (let i = 1; i < datesArray.length; i++) {
      const dayDiff = differenceInDays(new Date(datesArray[i]), new Date(datesArray[i - 1]))

      if (dayDiff === 1) {
        currentStreakCount++
        maxStreak = Math.max(maxStreak, currentStreakCount)
      } else {
        currentStreakCount = 1
      }
    }

    return maxStreak
  })

  /**
   * Total activity count
   */
  const totalActivities = computed(() => {
    return activities.value?.length || 0
  })

  /**
   * Medical activities count
   */
  const medicalActivities = computed(() => {
    return activities.value?.filter(a => a.medicalData).length || 0
  })

  /**
   * Activities with photos
   */
  const photoActivities = computed(() => {
    return activities.value?.filter(a => a.photoUrl).length || 0
  })

  /**
   * Check for special achievements
   */
  const hasEarlyBird = computed(() => {
    return activities.value?.some(a => {
      const hour = new Date(a.timestamp).getHours()
      return hour < 6
    }) || false
  })

  const hasNightOwl = computed(() => {
    return activities.value?.some(a => {
      const hour = new Date(a.timestamp).getHours()
      return hour >= 22
    }) || false
  })

  /**
   * Get all unlocked achievements
   */
  const unlockedAchievements = computed(() => {
    const unlocked = []

    // Check all achievements
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      const { requirement } = achievement

      let isUnlocked = false

      switch (requirement.type) {
        case 'streak':
          isUnlocked = currentStreak.value >= requirement.value
          break
        case 'count':
          isUnlocked = totalActivities.value >= requirement.value
          break
        case 'medical':
          isUnlocked = medicalActivities.value >= requirement.value
          break
        case 'photo':
          isUnlocked = photoActivities.value >= requirement.value
          break
        case 'special':
          if (requirement.value === 'early') {
            isUnlocked = hasEarlyBird.value
          } else if (requirement.value === 'late') {
            isUnlocked = hasNightOwl.value
          }
          break
      }

      if (isUnlocked) {
        unlocked.push(achievement)
      }
    })

    return unlocked
  })

  /**
   * Get next achievement to unlock
   */
  const nextAchievement = computed(() => {
    const locked = Object.values(ACHIEVEMENTS).filter(achievement => {
      return !unlockedAchievements.value.find(u => u.id === achievement.id)
    })

    // Sort by requirement value (closest first)
    const sorted = locked.sort((a, b) => {
      if (a.requirement.type === 'streak' && b.requirement.type === 'streak') {
        return a.requirement.value - b.requirement.value
      }
      if (a.requirement.type === 'count' && b.requirement.type === 'count') {
        return a.requirement.value - b.requirement.value
      }
      return 0
    })

    return sorted[0] || null
  })

  /**
   * Progress to next achievement (percentage)
   */
  const nextAchievementProgress = computed(() => {
    if (!nextAchievement.value) return 100

    const { requirement } = nextAchievement.value

    if (requirement.type === 'streak') {
      return Math.min((currentStreak.value / requirement.value) * 100, 100)
    }

    if (requirement.type === 'count') {
      return Math.min((totalActivities.value / requirement.value) * 100, 100)
    }

    return 0
  })

  /**
   * Streak status message
   */
  const streakMessage = computed(() => {
    const streak = currentStreak.value

    if (streak === 0) {
      return 'Start your streak today! 🚀'
    }

    if (streak === 1) {
      return `Great start! Come back tomorrow! ✨`
    }

    if (streak < 7) {
      return `${streak}-day streak! Keep it going! 🔥`
    }

    if (streak < 30) {
      return `Amazing ${streak}-day streak! 🌟`
    }

    if (streak < 100) {
      return `Incredible ${streak}-day streak! 💎`
    }

    return `Legendary ${streak}-day streak! 👑`
  })

  return {
    currentStreak,
    longestStreak,
    totalActivities,
    medicalActivities,
    photoActivities,
    unlockedAchievements,
    nextAchievement,
    nextAchievementProgress,
    streakMessage,
    ACHIEVEMENTS
  }
}
