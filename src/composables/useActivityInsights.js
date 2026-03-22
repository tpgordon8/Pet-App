import { computed } from 'vue'
import { format, subDays, startOfDay, differenceInDays } from 'date-fns'

export function useActivityInsights(activities) {
  return computed(() => {
    const results = []
    const now = Date.now()
    const today = startOfDay(new Date())
    const weekAgo = subDays(today, 7)

    // Optimization: Single pass through activities to categorize
    const todayActivities = []
    const lastWeekActivities = []
    const todayCounts = {}
    const weekCounts = {}

    const todayTime = today.getTime()
    const weekAgoTime = weekAgo.getTime()

    for (const activity of activities.value) {
      const timestamp = activity.timestamp
      const type = activity.type

      if (timestamp >= todayTime) {
        todayActivities.push(activity)
        todayCounts[type] = (todayCounts[type] || 0) + 1
      }
      if (timestamp >= weekAgoTime) {
        lastWeekActivities.push(activity)
        weekCounts[type] = (weekCounts[type] || 0) + 1
      }
    }

    // Need at least 5 activities for meaningful insights
    if (lastWeekActivities.length < 5) {
      return results
    }

    const getDailyAverage = (type) => {
      const count = weekCounts[type] || 0
      const days = differenceInDays(now, weekAgoTime)
      return count / Math.max(days, 1)
    }

    // Poop patterns
    const todayPoop = todayCounts['Poop'] || 0
    const avgPoop = getDailyAverage('Poop')

    if (avgPoop >= 2 && todayPoop === 0) {
      results.push({
        type: 'alert',
        severity: 'warning',
        emoji: '⚠️',
        message: 'No poop logged today',
        detail: `Usually ${avgPoop.toFixed(1)} times per day`
      })
    } else if (avgPoop >= 2 && todayPoop < avgPoop * 0.5) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '📊',
        message: 'Fewer poops than usual',
        detail: `${todayPoop} today vs ${avgPoop.toFixed(1)} average`
      })
    } else if (avgPoop >= 1 && todayPoop > avgPoop * 1.5) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '📊',
        message: 'More poops than usual',
        detail: `${todayPoop} today vs ${avgPoop.toFixed(1)} average`
      })
    }

    // Food patterns
    const todayFood = todayCounts['Food'] || 0
    const avgFood = getDailyAverage('Food')

    if (avgFood >= 2 && todayFood === 0) {
      results.push({
        type: 'alert',
        severity: 'warning',
        emoji: '🍖',
        message: 'No meals logged today',
        detail: `Usually ${avgFood.toFixed(1)} meals per day`
      })
    } else if (avgFood >= 2 && todayFood < avgFood * 0.5) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '🍽️',
        message: 'Eating less than usual',
        detail: `${todayFood} meals today vs ${avgFood.toFixed(1)} average`
      })
    }

    // Pee patterns
    const todayPee = todayCounts['Pee'] || 0
    const avgPee = getDailyAverage('Pee')

    if (avgPee >= 3 && todayPee > avgPee * 1.5) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '💧',
        message: 'More bathroom breaks than usual',
        detail: `${todayPee} today vs ${avgPee.toFixed(1)} average`
      })
    }

    // Weight trends
    const weightChecks = activities.value
      .filter(a => a.type === 'Weight Check' && a.medicalData?.weight)
      .sort((a, b) => a.timestamp - b.timestamp)

    if (weightChecks.length >= 2) {
      const firstWeight = weightChecks[0]
      const lastWeight = weightChecks[weightChecks.length - 1]

      const firstLbs = firstWeight.medicalData.unit === 'kg'
        ? firstWeight.medicalData.weight * 2.20462
        : firstWeight.medicalData.weight

      const lastLbs = lastWeight.medicalData.unit === 'kg'
        ? lastWeight.medicalData.weight * 2.20462
        : lastWeight.medicalData.weight

      const change = lastLbs - firstLbs
      const percentChange = (change / firstLbs) * 100

      if (Math.abs(percentChange) > 5) {
        const direction = change > 0 ? 'gained' : 'lost'
        const severity = Math.abs(percentChange) > 10 ? 'warning' : 'low'
        results.push({
          type: severity === 'warning' ? 'alert' : 'info',
          severity,
          emoji: change > 0 ? '📈' : '📉',
          message: `Weight has ${direction} ${Math.abs(change).toFixed(1)} lbs`,
          detail: `${Math.abs(percentChange).toFixed(1)}% change since ${format(firstWeight.timestamp, 'MMM d')}`
        })
      }
    }

    // Medication compliance
    const todayMeds = todayCounts['Meds'] || 0
    const avgMeds = getDailyAverage('Meds')

    if (avgMeds >= 1 && todayMeds === 0) {
      results.push({
        type: 'alert',
        severity: 'warning',
        emoji: '💊',
        message: 'Medication not logged today',
        detail: `Usually ${avgMeds.toFixed(1)} times per day`
      })
    }

    // Activity level
    const todayWalks = todayCounts['Walk'] || 0
    const avgWalks = getDailyAverage('Walk')

    if (avgWalks >= 1 && todayWalks === 0) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '🚶',
        message: 'No walks logged today',
        detail: `Usually ${avgWalks.toFixed(1)} walks per day`
      })
    }

    // Consistency
    const todayTotal = todayActivities.length
    const avgTotal = lastWeekActivities.length / 7

    if (avgTotal >= 5 && todayTotal < avgTotal * 0.3) {
      results.push({
        type: 'info',
        severity: 'low',
        emoji: '📉',
        message: 'Less active than usual',
        detail: `${todayTotal} activities today vs ${avgTotal.toFixed(1)} average`
      })
    } else if (todayTotal > avgTotal * 1.5 && avgTotal >= 5) {
      results.push({
        type: 'positive',
        emoji: '⭐',
        message: 'Very active today!',
        detail: `${todayTotal} activities logged`
      })
    }

    // Sort by severity (warnings first)
    return results.sort((a, b) => {
      const severityOrder = { warning: 0, low: 1 }
      return (severityOrder[a.severity] || 2) - (severityOrder[b.severity] || 2)
    })
  })
}
