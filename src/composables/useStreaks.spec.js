import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { subDays, startOfDay } from 'date-fns'
import { useStreaks, ACHIEVEMENTS } from './useStreaks'

// Helper: create an activity with a timestamp N days ago
function activityAt(daysAgo, overrides = {}) {
  const date = startOfDay(subDays(new Date(), daysAgo))
  return { timestamp: date.getTime(), type: 'Poop', ...overrides }
}

// Helper: create a medical activity
function medicalActivity(daysAgo = 0) {
  return activityAt(daysAgo, { type: 'Vet Visit', medicalData: { notes: 'checkup', cost: 50 } })
}

// Helper: create an activity with a photo
function photoActivity(daysAgo = 0) {
  return activityAt(daysAgo, { photoUrl: 'https://example.com/photo.jpg' })
}

// Helper: activity at a specific hour today
function activityAtHour(hour) {
  const d = new Date()
  d.setHours(hour, 0, 0, 0)
  return { timestamp: d.getTime(), type: 'Walk' }
}

describe('useStreaks', () => {
  // ─── currentStreak ────────────────────────────────────────────────────────────

  describe('currentStreak', () => {
    it('returns 0 for empty activities', () => {
      const { currentStreak } = useStreaks(ref([]))
      expect(currentStreak.value).toBe(0)
    })

    it('returns 1 for activity only today', () => {
      const { currentStreak } = useStreaks(ref([activityAt(0)]))
      expect(currentStreak.value).toBe(1)
    })

    it('returns 1 for activity only yesterday (grace period)', () => {
      const { currentStreak } = useStreaks(ref([activityAt(1)]))
      expect(currentStreak.value).toBe(1)
    })

    it('returns 0 when last activity was 2+ days ago', () => {
      const { currentStreak } = useStreaks(ref([activityAt(2)]))
      expect(currentStreak.value).toBe(0)
    })

    it('counts consecutive days correctly', () => {
      const activities = ref([
        activityAt(0),
        activityAt(1),
        activityAt(2),
        activityAt(3)
      ])
      const { currentStreak } = useStreaks(activities)
      expect(currentStreak.value).toBe(4)
    })

    it('stops counting at a gap', () => {
      const activities = ref([
        activityAt(0),
        activityAt(1),
        // gap at day 2
        activityAt(3),
        activityAt(4)
      ])
      const { currentStreak } = useStreaks(activities)
      // Should count today + yesterday = 2, stops at gap
      expect(currentStreak.value).toBe(2)
    })

    it('counts multiple activities on same day as 1 streak day', () => {
      const activities = ref([
        activityAt(0),
        activityAt(0), // duplicate same day
        activityAt(1)
      ])
      const { currentStreak } = useStreaks(activities)
      expect(currentStreak.value).toBe(2)
    })
  })

  // ─── longestStreak ────────────────────────────────────────────────────────────

  describe('longestStreak', () => {
    it('returns 0 for empty activities', () => {
      const { longestStreak } = useStreaks(ref([]))
      expect(longestStreak.value).toBe(0)
    })

    it('returns 1 for a single activity', () => {
      const { longestStreak } = useStreaks(ref([activityAt(10)]))
      expect(longestStreak.value).toBe(1)
    })

    it('calculates longest streak across gaps', () => {
      const activities = ref([
        // Streak 1: 3 days (10, 9, 8 days ago)
        activityAt(10), activityAt(9), activityAt(8),
        // gap
        // Streak 2: 5 days (4, 3, 2, 1, 0 days ago)
        activityAt(4), activityAt(3), activityAt(2), activityAt(1), activityAt(0)
      ])
      const { longestStreak } = useStreaks(activities)
      expect(longestStreak.value).toBe(5)
    })

    it('handles single-day streaks', () => {
      const activities = ref([activityAt(5), activityAt(2)])
      const { longestStreak } = useStreaks(activities)
      expect(longestStreak.value).toBe(1)
    })
  })

  // ─── totalActivities ──────────────────────────────────────────────────────────

  describe('totalActivities', () => {
    it('returns 0 for empty list', () => {
      const { totalActivities } = useStreaks(ref([]))
      expect(totalActivities.value).toBe(0)
    })

    it('counts all activities', () => {
      const { totalActivities } = useStreaks(ref([activityAt(0), activityAt(1), activityAt(2)]))
      expect(totalActivities.value).toBe(3)
    })
  })

  // ─── medicalActivities ────────────────────────────────────────────────────────

  describe('medicalActivities', () => {
    it('returns 0 when no medical activities', () => {
      const { medicalActivities } = useStreaks(ref([activityAt(0)]))
      expect(medicalActivities.value).toBe(0)
    })

    it('counts only activities with medicalData', () => {
      const activities = ref([
        activityAt(0),
        medicalActivity(1),
        medicalActivity(2)
      ])
      const { medicalActivities } = useStreaks(activities)
      expect(medicalActivities.value).toBe(2)
    })
  })

  // ─── photoActivities ──────────────────────────────────────────────────────────

  describe('photoActivities', () => {
    it('counts activities with photoUrl', () => {
      const activities = ref([
        activityAt(0),
        photoActivity(1),
        photoActivity(2)
      ])
      const { photoActivities } = useStreaks(activities)
      expect(photoActivities.value).toBe(2)
    })
  })

  // ─── unlockedAchievements ─────────────────────────────────────────────────────

  describe('unlockedAchievements', () => {
    it('returns empty array for no activities', () => {
      const { unlockedAchievements } = useStreaks(ref([]))
      expect(unlockedAchievements.value).toHaveLength(0)
    })

    it('unlocks FIRST_ACTIVITY after 1 activity', () => {
      const { unlockedAchievements } = useStreaks(ref([activityAt(0)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('first_activity')
    })

    it('unlocks ACTIVITIES_10 after 10 activities', () => {
      const activities = ref(Array.from({ length: 10 }, (_, i) => activityAt(i)))
      const { unlockedAchievements } = useStreaks(activities)
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('activities_10')
    })

    it('does not unlock ACTIVITIES_50 with only 10 activities', () => {
      const activities = ref(Array.from({ length: 10 }, (_, i) => activityAt(i)))
      const { unlockedAchievements } = useStreaks(activities)
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).not.toContain('activities_50')
    })

    it('unlocks MEDICAL_VISIT after a medical activity', () => {
      const { unlockedAchievements } = useStreaks(ref([medicalActivity(0)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('medical_visit')
    })

    it('unlocks PHOTO_LOGGED after an activity with photo', () => {
      const { unlockedAchievements } = useStreaks(ref([photoActivity(0)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('photo_logged')
    })

    it('unlocks EARLY_BIRD for activity before 6am', () => {
      const { unlockedAchievements } = useStreaks(ref([activityAtHour(5)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('early_bird')
    })

    it('does not unlock EARLY_BIRD for activity at 6am or later', () => {
      const { unlockedAchievements } = useStreaks(ref([activityAtHour(8)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).not.toContain('early_bird')
    })

    it('unlocks NIGHT_OWL for activity at or after 10pm', () => {
      const { unlockedAchievements } = useStreaks(ref([activityAtHour(22)]))
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('night_owl')
    })

    it('unlocks STREAK_3 with 3-day streak', () => {
      const activities = ref([activityAt(0), activityAt(1), activityAt(2)])
      const { unlockedAchievements } = useStreaks(activities)
      const ids = unlockedAchievements.value.map(a => a.id)
      expect(ids).toContain('streak_3')
    })
  })

  // ─── streakMessage ────────────────────────────────────────────────────────────

  describe('streakMessage', () => {
    it('returns start message for 0-day streak', () => {
      const { streakMessage } = useStreaks(ref([]))
      expect(streakMessage.value).toContain('Start your streak')
    })

    it('returns day-1 message', () => {
      const { streakMessage } = useStreaks(ref([activityAt(0)]))
      expect(streakMessage.value).toContain('Great start')
    })

    it('returns fire message for streak 2-6', () => {
      const activities = ref([activityAt(0), activityAt(1), activityAt(2)])
      const { streakMessage } = useStreaks(activities)
      expect(streakMessage.value).toContain('🔥')
    })
  })

  // ─── ACHIEVEMENTS constant ────────────────────────────────────────────────────

  describe('ACHIEVEMENTS constant', () => {
    it('exports exactly 15 achievements', () => {
      expect(Object.keys(ACHIEVEMENTS)).toHaveLength(15)
    })

    it('every achievement has required fields', () => {
      Object.values(ACHIEVEMENTS).forEach(achievement => {
        expect(achievement).toHaveProperty('id')
        expect(achievement).toHaveProperty('title')
        expect(achievement).toHaveProperty('emoji')
        expect(achievement).toHaveProperty('requirement')
        expect(achievement.requirement).toHaveProperty('type')
        expect(achievement.requirement).toHaveProperty('value')
      })
    })
  })
})
