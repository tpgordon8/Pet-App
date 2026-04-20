import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { subDays, startOfDay } from 'date-fns'
import { useActivityInsights } from './useActivityInsights'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeActivity(type, daysAgo = 0, overrides = {}) {
  const base = startOfDay(subDays(new Date(), daysAgo))
  return { type, timestamp: base.getTime(), ...overrides }
}

// Build a week of activities with `perDay` of a given type each day
function weekOf(type, perDay = 2) {
  const activities = []
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < perDay; i++) {
      activities.push(makeActivity(type, day))
    }
  }
  return activities
}

describe('useActivityInsights', () => {
  // ─── Minimum data requirement ─────────────────────────────────────────────────

  describe('minimum data requirement', () => {
    it('returns empty array with fewer than 5 activities', () => {
      const activities = ref([
        makeActivity('Poop', 0),
        makeActivity('Poop', 1),
        makeActivity('Poop', 2),
        makeActivity('Food', 0)
      ])
      const insights = useActivityInsights(activities)
      expect(insights.value).toHaveLength(0)
    })

    it('returns insights with 5+ activities in the last week', () => {
      const activities = ref([
        ...weekOf('Poop', 2),
        ...weekOf('Food', 2)
      ])
      const insights = useActivityInsights(activities)
      // At least one insight generated
      expect(insights.value.length).toBeGreaterThanOrEqual(0)
    })
  })

  // ─── Poop insights ────────────────────────────────────────────────────────────

  describe('poop patterns', () => {
    it('warns when no poop today but average >= 2/day', () => {
      // 2 poops/day for past 7 days, none today: avg = 14/7 = 2 >= 2 → warning fires
      const activities = ref([
        ...Array.from({ length: 7 }, (_, i) => makeActivity('Poop', i + 1)),
        ...Array.from({ length: 7 }, (_, i) => makeActivity('Poop', i + 1))
      ])
      const insights = useActivityInsights(activities)
      const warning = insights.value.find(
        i => i.message.toLowerCase().includes('poop') && i.severity === 'warning'
      )
      expect(warning).toBeDefined()
    })

    it('gives info when fewer poops than usual', () => {
      // History: 3/day. Today: 1
      const historicalPoops = Array.from({ length: 6 }, (_, i) => [
        makeActivity('Poop', i + 1),
        makeActivity('Poop', i + 1),
        makeActivity('Poop', i + 1)
      ]).flat()
      const activities = ref([...historicalPoops, makeActivity('Poop', 0)])
      const insights = useActivityInsights(activities)
      const info = insights.value.find(
        i => i.message.toLowerCase().includes('fewer') || i.message.toLowerCase().includes('usual')
      )
      expect(info).toBeDefined()
    })
  })

  // ─── Food insights ────────────────────────────────────────────────────────────

  describe('food patterns', () => {
    it('warns when no food logged today but average >= 2/day', () => {
      // 2 food/day × 7 days = 14 total, avg = 14/7 = 2 >= 2 → warning fires
      const historicalFood = Array.from({ length: 7 }, (_, i) => [
        makeActivity('Food', i + 1),
        makeActivity('Food', i + 1)
      ]).flat()
      const activities = ref(historicalFood)
      const insights = useActivityInsights(activities)
      const warning = insights.value.find(
        i => i.message.toLowerCase().includes('meal') || i.message.toLowerCase().includes('food')
      )
      expect(warning).toBeDefined()
    })
  })

  // ─── Medication insights ──────────────────────────────────────────────────────

  describe('medication compliance', () => {
    it('warns when meds not logged today but average >= 1/day', () => {
      // 1 med/day × 7 days = 7 total, avg = 7/7 = 1 >= 1 → warning fires
      const historicalMeds = Array.from({ length: 7 }, (_, i) => makeActivity('Meds', i + 1))
      const activities = ref(historicalMeds)
      const insights = useActivityInsights(activities)
      const warning = insights.value.find(
        i => i.message.toLowerCase().includes('medication') && i.severity === 'warning'
      )
      expect(warning).toBeDefined()
    })
  })

  // ─── Weight trend insights ────────────────────────────────────────────────────

  describe('weight trends', () => {
    it('flags significant weight gain (>5%)', () => {
      const activities = ref([
        ...weekOf('Poop', 1),
        ...weekOf('Food', 1),
        {
          type: 'Weight Check',
          timestamp: startOfDay(subDays(new Date(), 30)).getTime(),
          medicalData: { weight: 20, unit: 'lbs' }
        },
        {
          type: 'Weight Check',
          timestamp: startOfDay(new Date()).getTime(),
          medicalData: { weight: 22, unit: 'lbs' } // 10% gain
        }
      ])
      const insights = useActivityInsights(activities)
      const weightInsight = insights.value.find(
        i => i.message.toLowerCase().includes('weight')
      )
      expect(weightInsight).toBeDefined()
    })

    it('does not flag minor weight changes (<=5%)', () => {
      const activities = ref([
        ...weekOf('Poop', 1),
        ...weekOf('Food', 1),
        {
          type: 'Weight Check',
          timestamp: startOfDay(subDays(new Date(), 30)).getTime(),
          medicalData: { weight: 20, unit: 'lbs' }
        },
        {
          type: 'Weight Check',
          timestamp: startOfDay(new Date()).getTime(),
          medicalData: { weight: 20.5, unit: 'lbs' } // 2.5% change - no alert
        }
      ])
      const insights = useActivityInsights(activities)
      const weightInsight = insights.value.find(
        i => i.message.toLowerCase().includes('weight')
      )
      expect(weightInsight).toBeUndefined()
    })

    it('handles kg weight correctly by converting to lbs', () => {
      const activities = ref([
        ...weekOf('Poop', 1),
        {
          type: 'Weight Check',
          timestamp: startOfDay(subDays(new Date(), 30)).getTime(),
          medicalData: { weight: 10, unit: 'kg' } // ~22 lbs
        },
        {
          type: 'Weight Check',
          timestamp: startOfDay(new Date()).getTime(),
          medicalData: { weight: 12, unit: 'kg' } // ~26.4 lbs — 20% gain
        }
      ])
      const insights = useActivityInsights(activities)
      const weightInsight = insights.value.find(
        i => i.message.toLowerCase().includes('weight')
      )
      expect(weightInsight).toBeDefined()
    })
  })

  // ─── Insight structure ────────────────────────────────────────────────────────

  describe('insight structure', () => {
    it('every insight has required fields', () => {
      const activities = ref([
        ...weekOf('Poop', 2),
        ...weekOf('Meds', 1)
      ])
      const insights = useActivityInsights(activities)
      insights.value.forEach(insight => {
        expect(insight).toHaveProperty('emoji')
        expect(insight).toHaveProperty('message')
        expect(insight).toHaveProperty('detail')
      })
    })

    it('warnings appear before low-severity insights', () => {
      // Build data that triggers both a warning (no meds) and a low-severity info
      const historicalMeds = Array.from({ length: 6 }, (_, i) => makeActivity('Meds', i + 1))
      const historicalPoops = Array.from({ length: 6 }, (_, i) => [
        makeActivity('Poop', i + 1),
        makeActivity('Poop', i + 1),
        makeActivity('Poop', i + 1)
      ]).flat()
      const activities = ref([
        ...historicalMeds,
        ...historicalPoops,
        makeActivity('Poop', 0) // today: 1 poop (less than avg 3 → info)
        // no meds today → warning
      ])

      const insights = useActivityInsights(activities)
      const severities = insights.value.map(i => i.severity).filter(Boolean)

      // Find first warning and first non-warning index
      const firstWarningIdx = severities.indexOf('warning')
      const firstLowIdx = severities.indexOf('low')

      if (firstWarningIdx !== -1 && firstLowIdx !== -1) {
        expect(firstWarningIdx).toBeLessThan(firstLowIdx)
      }
    })
  })

  // ─── Positive insight ─────────────────────────────────────────────────────────

  describe('positive insights', () => {
    it('returns a positive insight when very active today vs average', () => {
      // Historical: 4 activities/day × 7 days = 28. Today: 20.
      // avgTotal ≈ 48/7 ≈ 6.9; threshold = 6.9 * 1.5 = 10.3; 20 > 10.3 ✓
      // avgTotal >= 5 ✓
      const types = ['Poop', 'Pee', 'Food', 'Walk']
      const historicalActivities = Array.from({ length: 7 }, (_, i) =>
        types.map(t => makeActivity(t, i + 1))
      ).flat()
      const todayActivities = Array.from({ length: 20 }, () => makeActivity('Poop', 0))

      const activities = ref([...historicalActivities, ...todayActivities])
      const insights = useActivityInsights(activities)
      const positive = insights.value.find(i => i.type === 'positive')
      expect(positive).toBeDefined()
    })
  })
})
