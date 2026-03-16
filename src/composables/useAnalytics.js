import { analytics } from '@/firebase/config'
import { logEvent, setUserId, setUserProperties } from 'firebase/analytics'

/**
 * Composable for Firebase Analytics tracking
 * @returns {Object} Analytics tracking functions
 */
export function useAnalytics() {
  /**
   * Track a custom event
   * @param {string} eventName - Name of the event
   * @param {Object} eventParams - Event parameters
   */
  const trackEvent = (eventName, eventParams = {}) => {
    if (!analytics) return

    try {
      logEvent(analytics, eventName, eventParams)
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }

  /**
   * Track page view
   * @param {string} pageName - Name of the page
   * @param {string} pageTitle - Title of the page
   */
  const trackPageView = (pageName, pageTitle) => {
    trackEvent('page_view', {
      page_name: pageName,
      page_title: pageTitle,
      page_location: window.location.href
    })
  }

  /**
   * Track activity logged
   * @param {string} activityType - Type of activity (Poop, Pee, etc.)
   * @param {string} petId - ID of the pet
   * @param {boolean} hasNotes - Whether notes were added
   * @param {boolean} hasPhoto - Whether photo was attached
   */
  const trackActivityLogged = (activityType, petId, hasNotes = false, hasPhoto = false) => {
    trackEvent('activity_logged', {
      activity_type: activityType,
      pet_id: petId,
      has_notes: hasNotes,
      has_photo: hasPhoto
    })
  }

  /**
   * Track household action
   * @param {string} action - Action type (created, joined, invited, etc.)
   * @param {Object} params - Additional parameters
   */
  const trackHouseholdAction = (action, params = {}) => {
    trackEvent('household_action', {
      action: action,
      ...params
    })
  }

  /**
   * Track invite sent
   * @param {string} method - Invite method (email, link)
   */
  const trackInviteSent = (method) => {
    trackEvent('invite_sent', {
      invite_method: method
    })
  }

  /**
   * Track pet action
   * @param {string} action - Action type (added, edited, deleted)
   * @param {string} species - Pet species
   */
  const trackPetAction = (action, species) => {
    trackEvent('pet_action', {
      action: action,
      species: species
    })
  }

  /**
   * Track medical activity
   * @param {string} medicalType - Type of medical activity
   */
  const trackMedicalActivity = (medicalType) => {
    trackEvent('medical_activity', {
      medical_type: medicalType
    })
  }

  /**
   * Set user ID for analytics
   * @param {string} userId - User/household ID
   */
  const setAnalyticsUserId = (userId) => {
    if (!analytics) return

    try {
      setUserId(analytics, userId)
    } catch (error) {
      console.error('Analytics setUserId error:', error)
    }
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties
   */
  const setAnalyticsUserProperties = (properties) => {
    if (!analytics) return

    try {
      setUserProperties(analytics, properties)
    } catch (error) {
      console.error('Analytics setUserProperties error:', error)
    }
  }

  return {
    trackEvent,
    trackPageView,
    trackActivityLogged,
    trackHouseholdAction,
    trackInviteSent,
    trackPetAction,
    trackMedicalActivity,
    setAnalyticsUserId,
    setAnalyticsUserProperties
  }
}
