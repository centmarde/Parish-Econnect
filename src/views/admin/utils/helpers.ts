// Helper functions for ViewEventDialog and other admin components

/**
 * Formats a date string into a readable format
 * @param dateString - The date string to format
 * @returns Formatted date string or original if formatting fails
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch {
    return dateString
  }
}

/**
 * Formats a date string to extract time in AM/PM format
 * @param dateString - The date string to extract time from
 * @returns Formatted time string or null if formatting fails
 */
export const formatTime = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null

  try {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  } catch {
    return null
  }
}

/**
 * Helper function to format time strings (HH:MM:SS format) to AM/PM
 * @param timeString - Time string in HH:MM:SS or HH:MM format
 * @returns Formatted time string in 12-hour format with AM/PM
 */
export const formatTimeString = (timeString: string | null | undefined): string | null => {
  if (!timeString) return null

  try {
    // Handle time strings like "08:28:00" or "08:28"
    const timeParts = timeString.split(':')
    if (timeParts.length < 2) return timeString

    let hours = parseInt(timeParts[0])
    const minutes = parseInt(timeParts[1])

    // Convert 24-hour to 12-hour format
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours ? hours : 12 // 0 should be 12

    // Format with leading zero for minutes
    const formattedMinutes = minutes.toString().padStart(2, '0')

    return `${hours}:${formattedMinutes} ${ampm}`
  } catch {
    return timeString // Return original if formatting fails
  }
}

/**
 * Get status color based on status value
 * @param status - The status string to get color for
 * @returns Vuetify color name for the status
 */
export const getStatusColor = (status: string): string => {
  const statusLower = status.toLowerCase()
  if (statusLower.includes('approved')) return 'success'
  if (statusLower.includes('denied')) return 'error'
  if (statusLower.includes('pending')) return 'warning'
  return 'primary' // default
}

/**
 * Load transformation data from localStorage
 * @param event - The event object containing originalEvent data
 * @returns Parsed transformation data or null if not found
 */
export const loadTransformationData = (event: any): any => {
  try {
    // First, try to load from the clicked event data structure
    const clickedEventStored = localStorage.getItem('clicked_event_data')
    if (clickedEventStored) {
      const clickedData = JSON.parse(clickedEventStored)

      // Extract the original event data from the clicked event structure
      if (clickedData.clickedEvent?.originalItem?.originalEvent) {
        const originalEvent = clickedData.clickedEvent.originalItem.originalEvent
        // Transform this into the expected transformationData format
        return {
          category: originalEvent.category,
          eventName: originalEvent.eventName || originalEvent.title,
          eventDate: originalEvent.eventDate,
          eventTime: originalEvent.eventTime || originalEvent.time,
          startDate: originalEvent.startDate,
          endDate: originalEvent.endDate,
          status: originalEvent.status,
          booking: originalEvent.booking,
          timestamp: clickedData.timestamp || new Date().toISOString()
        }
      }
    }

    // Fallback: try the original transformation data key
    if (!event?.originalEvent) return null

    const originalEvent = event.originalEvent
    const storageKey = `booking_transform_${originalEvent.category}_${originalEvent.bookingId}`
    const stored = localStorage.getItem(storageKey)

    if (stored) {
      return JSON.parse(stored)
    }

    return null
  } catch (error) {
    console.warn('Failed to load transformation data from localStorage:', error)
    return null
  }
}

/**
 * Load clicked event data from localStorage
 * @returns Parsed clicked event data or null if not found
 */
export const loadClickedEventData = (): any => {
  try {
    const stored = localStorage.getItem('clicked_event_data')
    if (stored) {
      return JSON.parse(stored)
    }
    return null
  } catch (error) {
    console.warn('Failed to load clicked event data from localStorage:', error)
    return null
  }
}

/**
 * Get event status prioritizing localStorage data
 * @param storageData - Data from localStorage
 * @param fallbackEventData - Fallback event data
 * @returns Formatted status string
 */
export const getEventStatus = (storageData: any, fallbackEventData: any): string => {
  // PRIORITIZE localStorage status from transformationData
  if (storageData?.status) {
    const status = storageData.status.charAt(0).toUpperCase() + storageData.status.slice(1)
    return status
  }

  // Check booking data from localStorage
  if (storageData?.booking) {
    const booking = storageData.booking
    if (booking.is_approved) return 'Approved'
    if (booking.is_denied) return 'Denied'
    return 'Pending'
  }

  // Final fallback: original event data
  if (fallbackEventData?.status) {
    return fallbackEventData.status.charAt(0).toUpperCase() + fallbackEventData.status.slice(1)
  }

  const booking = fallbackEventData?.booking
  if (booking?.is_approved) return 'Approved'
  if (booking?.is_denied) return 'Denied'
  return 'Pending'
}
