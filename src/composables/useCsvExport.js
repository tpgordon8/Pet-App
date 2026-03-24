import { format } from 'date-fns'

/**
 * Composable for exporting activities to CSV
 * Provides functionality to export pet activities with filtering support
 */
export function useCsvExport() {
  /**
   * Escape CSV field (handle quotes and commas)
   */
  function escapeCSV(value) {
    if (value === null || value === undefined) return ''

    const stringValue = String(value)

    // If the value contains comma, quote, or newline, wrap in quotes and escape existing quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  /**
   * Convert activities to CSV format
   */
  function activitiesToCSV(activities, pets = []) {
    if (!activities || activities.length === 0) {
      return null
    }

    // CSV Headers
    const headers = [
      'Date',
      'Time',
      'Type',
      'Emoji',
      'Pet',
      'User',
      'Notes',
      'Photo',
      'Medical: Vaccine Name',
      'Medical: Weight',
      'Medical: Unit',
      'Medical: Cost',
      'Medical: Notes'
    ]

    // Helper to get pet name
    const getPetName = (petId) => {
      const pet = pets.find(p => p.id === petId)
      return pet ? `${pet.emoji} ${pet.name}` : 'Unknown Pet'
    }

    // Convert each activity to a CSV row
    const rows = activities.map(activity => {
      const date = new Date(activity.timestamp)

      return [
        escapeCSV(format(date, 'yyyy-MM-dd')),
        escapeCSV(format(date, 'HH:mm:ss')),
        escapeCSV(activity.type),
        escapeCSV(activity.emoji),
        escapeCSV(getPetName(activity.petId)),
        escapeCSV(activity.user || ''),
        escapeCSV(activity.notes || ''),
        escapeCSV(activity.photoUrl ? 'Yes' : 'No'),
        escapeCSV(activity.medicalData?.vaccineName || ''),
        escapeCSV(activity.medicalData?.weight || ''),
        escapeCSV(activity.medicalData?.unit || ''),
        escapeCSV(activity.medicalData?.cost || ''),
        escapeCSV(activity.medicalData?.notes || '')
      ].join(',')
    })

    // Combine headers and rows
    return [headers.join(','), ...rows].join('\n')
  }

  /**
   * Trigger CSV download in browser
   */
  function downloadCSV(csvContent, filename) {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')

    if (link.download !== undefined) {
      // Create a temporary URL for the blob
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      // Clean up the URL
      URL.revokeObjectURL(url)
    }
  }

  /**
   * Export activities to CSV file
   * @param {Array} activities - Array of activity objects
   * @param {Array} pets - Array of pet objects for name lookup
   * @param {Object} options - Export options (petName, dateRange, etc.)
   * @returns {Object} Result object with success status and filename
   */
  function exportActivitiesCSV(activities, pets = [], options = {}) {
    try {
      // Filter activities if date range specified
      let filteredActivities = activities

      if (options.startDate && options.endDate) {
        const startTimestamp = new Date(options.startDate).setHours(0, 0, 0, 0)
        const endTimestamp = new Date(options.endDate).setHours(23, 59, 59, 999)

        filteredActivities = activities.filter(a =>
          a.timestamp >= startTimestamp && a.timestamp <= endTimestamp
        )
      }

      // Convert to CSV
      const csvContent = activitiesToCSV(filteredActivities, pets)

      if (!csvContent) {
        return {
          success: false,
          error: 'No activities to export'
        }
      }

      // Generate filename
      const timestamp = format(new Date(), 'yyyy-MM-dd')
      const petPart = options.petName ? `-${options.petName.replace(/[^a-zA-Z0-9]/g, '')}` : ''
      const filename = `tailr-activities${petPart}-${timestamp}.csv`

      // Download
      downloadCSV(csvContent, filename)

      return {
        success: true,
        filename,
        count: filteredActivities.length
      }
    } catch (error) {
      console.error('CSV export error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Export medical activities to CSV (vet visits, vaccinations, weight checks)
   */
  function exportMedicalCSV(activities, pets = [], options = {}) {
    const medicalActivities = activities.filter(a =>
      a.type === 'Vet Visit' ||
      a.type === 'Vaccination' ||
      a.type === 'Weight Check'
    )

    return exportActivitiesCSV(medicalActivities, pets, {
      ...options,
      filenameSuffix: 'medical'
    })
  }

  return {
    exportActivitiesCSV,
    exportMedicalCSV,
    activitiesToCSV,
    escapeCSV
  }
}
