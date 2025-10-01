/**
 * @fileoverview Supabase query operations for Parish Event booking actions
 *
 * This module provides composables for handling booking approvals, denials, and deletions
 * in the Parish Event Appointment System. It integrates with the helpers.ts to determine
 * booking types and execute appropriate Supabase operations.
 *
 * Usage:
 * ```typescript
 * import { useActionQuery } from './actionQuery'
 *
 * const { approveEvent, denyEvent, deleteEvent, isProcessing, error } = useActionQuery()
 *
 * // Approve an event/booking
 * const result = await approveEvent(eventData)
 * if (result.success) {
 *   console.log('Booking approved successfully')
 * }
 * ```
 */

import { ref, type Ref } from 'vue'
import { supabase } from '@/utils/supabase.js'
import {
  type BookingType,
  type BookingTypeInfo,
  getBookingTypeFromCategory,
  getTableNameForBookingType,
  extractNumericIdFromCalendarEvent
} from './helpers'
import { useAddEvents } from './addEvents'

/**
 * Composable for handling Supabase queries for booking approval/denial/deletion
 * Uses the booking type information from helpers.ts to execute proper database operations
 */
export const useActionQuery = () => {
  const isProcessing: Ref<boolean> = ref(false)
  const error: Ref<string | null> = ref(null)
  const success: Ref<boolean> = ref(false)

  /**
   * Load booking data from localStorage
   * @param event - Event object from ViewEventDialog
   * @returns Booking data or null
   */
  const loadBookingDataFromStorage = (event: any): any => {
    //console.log('DEBUG: Loading booking data from localStorage for event:', event)

    try {
      // Try clicked event data structure first
      const clickedEventStored = localStorage.getItem('clicked_event_data')
      if (clickedEventStored) {
        const clickedData = JSON.parse(clickedEventStored)
        //console.log(' Clicked event data found:', clickedData)

        // Debug: Show all available keys in clicked data
        //console.log('DEBUG: Clicked event keys:', Object.keys(clickedData))
        //console.log('DEBUG: originalEvent keys:', clickedData.originalEvent ? Object.keys(clickedData.originalEvent) : 'No originalEvent')
        //console.log('DEBUG: clickedEvent keys:', clickedData.clickedEvent ? Object.keys(clickedData.clickedEvent) : 'No clickedEvent')

        // Extract original event data from clicked event structure
        if (clickedData.clickedEvent?.originalItem?.originalEvent?.booking) {
          //console.log('DEBUG: Found booking in clickedEvent.originalItem.originalEvent.booking')
          return clickedData.clickedEvent.originalItem.originalEvent.booking
        }

        if (clickedData.originalEvent?.booking) {
         // console.log('DEBUG: Found booking in originalEvent.booking')
          return clickedData.originalEvent.booking
        }

        // Try extracting booking data from different structures
        if (clickedData.clickedEvent?.originalEvent?.booking) {
          //console.log('DEBUG: Found booking in clickedEvent.originalEvent.booking')
          return clickedData.clickedEvent.originalEvent.booking
        }

        // Try to extract from the originalEvent itself if it has booking-like properties
        if (clickedData.originalEvent && (clickedData.originalEvent.id || clickedData.originalEvent.category)) {
          //console.log('DEBUG: Using originalEvent as booking data (has id or category)')
          return {
            id: clickedData.originalEvent.id || clickedData.originalEvent.bookingId,
            category: clickedData.originalEvent.category,
            type: clickedData.originalEvent.type,
            ...clickedData.originalEvent
          }
        }

        // Try to extract from clickedEvent itself
        if (clickedData.clickedEvent && (clickedData.clickedEvent.id || clickedData.clickedEvent.category)) {
          //console.log('DEBUG: Using clickedEvent as booking data (has id or category)')
          return {
            id: clickedData.clickedEvent.id,
            category: clickedData.clickedEvent.category,
            type: clickedData.clickedEvent.type,
            ...clickedData.clickedEvent
          }
        }
      }

      // Fallback: try transformation data key based on event
      if (event?.originalEvent) {
        const originalEvent = event.originalEvent
        const storageKey = `booking_transform_${originalEvent.category}_${originalEvent.bookingId}`
        const stored = localStorage.getItem(storageKey)

        if (stored) {
          return JSON.parse(stored)
        }
      }

      return null
    } catch (error) {
      console.warn('Failed to load booking data from localStorage:', error)
      return null
    }
  }

  /**
   * Extract booking type/category from event data and localStorage
   * @param eventData - Event data from ViewEventDialog
   * @param bookingData - Booking data from localStorage
   * @returns BookingTypeInfo object with type classification
   */
  const extractBookingType = (eventData: any, bookingData: any): BookingTypeInfo => {
   /*  console.log('EXTRACTING BOOKING TYPE...')
    console.log('DEBUG: Event Data Structure:', eventData)
    console.log('DEBUG: Booking Data Structure:', bookingData) */

    // Multiple sources to check for type/category information
    const possibleSources = [
      // From booking data
      bookingData?.category?.toLowerCase(),
      bookingData?.type?.toLowerCase(),
      bookingData?.eventType?.toLowerCase(),
      bookingData?.massType?.toLowerCase(),
      bookingData?.serviceName?.toLowerCase(),

      // From event data
      eventData?.category?.toLowerCase(),
      eventData?.type?.toLowerCase(),
      eventData?.title?.toLowerCase(), // Event title might contain the type
      eventData?.eventType?.toLowerCase(),
      eventData?.originalEvent?.category?.toLowerCase(),
      eventData?.originalEvent?.type?.toLowerCase(),
      eventData?.originalEvent?.title?.toLowerCase(),

      // From localStorage clicked event data
      (() => {
        try {
          const clickedStored = localStorage.getItem('clicked_event_data')
          if (clickedStored) {
            const clickedData = JSON.parse(clickedStored)
            return clickedData?.originalEvent?.category?.toLowerCase() ||
                   clickedData?.clickedEvent?.originalEvent?.category?.toLowerCase()
          }
        } catch (e) {
          // Silent fail
        }
        return null
      })(),

      // From transformation data
      (() => {
        try {
          if (eventData?.originalEvent) {
            const originalEvent = eventData.originalEvent
            const storageKey = `booking_transform_${originalEvent.category}_${originalEvent.bookingId}`
            const stored = localStorage.getItem(storageKey)
            if (stored) {
              const data = JSON.parse(stored)
              return data.category?.toLowerCase()
            }
          }
        } catch (e) {
          // Silent fail
        }
        return null
      })()
    ]

    //console.log('Possible type sources:', possibleSources.filter(Boolean))

    // Determine type with confidence levels
    for (const source of possibleSources) {
      if (!source) continue

      const bookingType = getBookingTypeFromCategory(source)
      if (bookingType !== 'others') {
        return {
          type: bookingType,
          tableName: getTableNameForBookingType(bookingType),
          displayName: `${bookingType.charAt(0).toUpperCase() + bookingType.slice(1)} Mass`,
          approvalColumn: 'is_approved',
          denialColumn: 'is_denied',
          confidenceLevel: 'high',
          source: `category: ${source}`
        }
      }
    }

    // Additional checks for table name hints from booking data
    if (bookingData?.table) {
      const tableName = bookingData.table.toLowerCase()
      if (tableName.includes('wedding')) {
        return {
          type: 'wedding',
          tableName: 'wedding_bookings',
          displayName: 'Wedding Mass',
          approvalColumn: 'is_approved',
          denialColumn: 'is_denied',
          confidenceLevel: 'medium',
          source: `table: ${tableName}`
        }
      }
      if (tableName.includes('baptism')) {
        return {
          type: 'baptism',
          tableName: 'baptism_bookings',
          displayName: 'Baptism Mass',
          approvalColumn: 'is_approved',
          denialColumn: 'is_denied',
          confidenceLevel: 'medium',
          source: `table: ${tableName}`
        }
      }
      if (tableName.includes('funeral')) {
        return {
          type: 'funeral',
          tableName: 'funeral_bookings',
          displayName: 'Funeral Mass',
          approvalColumn: 'is_approved',
          denialColumn: 'is_denied',
          confidenceLevel: 'medium',
          source: `table: ${tableName}`
        }
      }
      if (tableName.includes('thanksgiving')) {
        return {
          type: 'thanksgiving',
          tableName: 'thanksgiving_bookings',
          displayName: 'Thanksgiving Mass',
          approvalColumn: 'is_approved',
          denialColumn: 'is_denied',
          confidenceLevel: 'medium',
          source: `table: ${tableName}`
        }
      }
    }

    // Fallback: others type
   // console.log('Could not determine booking type, defaulting to others')
    return {
      type: 'others',
      tableName: 'others',
      displayName: 'Other Event',
      approvalColumn: 'is_approved',
      denialColumn: 'is_denied',
      confidenceLevel: 'low',
      source: 'fallback'
    }
  }

  /**
   * Approve a booking in Supabase database
   * @param eventData - Event data from ViewEventDialog
   */
  const approveEvent = async (eventData: any): Promise<{ success: boolean; error?: any }> => {
   /*  console.log('=== APPROVE EVENT SUPABASE QUERY ===')
    console.log('Event data received:', eventData) */

    isProcessing.value = true
    error.value = null
    success.value = false

    try {
      // Load booking data from localStorage
      const bookingData = loadBookingDataFromStorage(eventData)

      if (!bookingData || !bookingData.id) {
        //console.log('NO BOOKING ID FOUND')
        error.value = 'Booking ID not found in localStorage'
        return { success: false, error: error.value }
      }

     /*  console.log('BOOKING ID EXTRACTED FROM STORAGE:', bookingData.id)
      console.log('Full booking data from storage:', bookingData) */

      // Extract booking type/category information
      const typeInfo = extractBookingType(eventData, bookingData)
      //console.log('BOOKING TYPE CLASSIFICATION:', typeInfo)

      if (typeInfo.type === 'others') {
        error.value = 'Cannot approve: Other events are automatically approved when created'
        return { success: false, error: error.value }
      }

      // Execute Supabase update query
      const { data, error: updateError } = await supabase
        .from(typeInfo.tableName)
        .update({
          [typeInfo.approvalColumn]: true,
          [typeInfo.denialColumn]: false, // Reset denial if previously denied

        })
        .eq('id', bookingData.id)
        .select()

      if (updateError) {
        //console.error('Supabase update error:', updateError)
        error.value = updateError.message
        return { success: false, error: updateError }
      }

      //console.log('BOOKING APPROVED SUCCESSFULLY:', data)
      success.value = true



      return { success: true }

    } catch (err) {
      console.error('Error during approval process:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: err }
    } finally {
      isProcessing.value = false
      console.log('=== END APPROVE EVENT SUPABASE QUERY ===')
    }
  }

  /**
   * Deny a booking in Supabase database
   * @param eventData - Event data from ViewEventDialog
   * @param denialComment - Comment/reason for denial
   */
  const denyEvent = async (eventData: any, denialComment?: string): Promise<{ success: boolean; error?: any }> => {
    /* console.log('=== DENY EVENT SUPABASE QUERY ===')
    console.log('Event data received:', eventData) */

    isProcessing.value = true
    error.value = null
    success.value = false

    try {
      const bookingData = loadBookingDataFromStorage(eventData)

      if (!bookingData || !bookingData.id) {
       // console.log('NO BOOKING ID FOUND FOR DENIAL')
        error.value = 'Booking ID not found in localStorage'
        return { success: false, error: error.value }
      }

     /*  console.log('BOOKING ID EXTRACTED FOR DENIAL:', bookingData.id)
      console.log('Full booking data from storage:', bookingData) */

      // Extract booking type/category information
      const typeInfo = extractBookingType(eventData, bookingData)
     // console.log(' BOOKING TYPE CLASSIFICATION FOR DENIAL:', typeInfo)

      if (typeInfo.type === 'others') {
        error.value = 'Cannot deny: Other events cannot be denied, only deleted'
        return { success: false, error: error.value }
      }

      // Get current user for audit trail
      const { data: userData } = await supabase.auth.getUser()
      const currentUser = userData?.user

      // Prepare update data
      const updateData = {
        [typeInfo.denialColumn]: true,
        [typeInfo.approvalColumn]: false, // Reset approval if previously approved
        denied_at: new Date().toISOString(),
       // denied_by: currentUser?.id || null
      }

      // Add comment if provided
      if (denialComment && denialComment.trim()) {
        updateData.comment = denialComment.trim()
      }

      // Execute Supabase update query
      const { data, error: updateError } = await supabase
        .from(typeInfo.tableName)
        .update(updateData)
        .eq('id', bookingData.id)
        .select()

      if (updateError) {
        //console.error('Supabase update error:', updateError)
        error.value = updateError.message
        return { success: false, error: updateError }
      }

      //console.log('BOOKING DENIED SUCCESSFULLY:', data)
      success.value = true

      // Log the action to audit logs if comment was provided
      if (denialComment && denialComment.trim() && currentUser) {
        try {
          await supabase.from('audit_logs').insert([
            {
              action: `Denied ${typeInfo.displayName} booking with comment: "${denialComment.trim()}"`,
              user_id: currentUser.id,
              table_name: typeInfo.tableName,
              record_id: bookingData.id,
              old_data: { is_approved: false, is_denied: false },
              new_data: { is_approved: false, is_denied: true, comment: denialComment.trim() },
              changed_at: new Date().toISOString(),
            },
          ])

          // Send notification to user about denial
          if (bookingData.user_id) {
            await supabase.from('notifications').insert([
              {
                user_id: bookingData.user_id,
                title: `${typeInfo.displayName} Booking Denied`,
                message: `Your ${typeInfo.displayName.toLowerCase()} booking has been denied. Reason: ${denialComment.trim()}`,
                color: 'error',
                icon: 'mdi-close-circle',
                is_read: false,
              },
            ])
          }
        } catch (auditError) {
          console.warn('Failed to create audit log or notification:', auditError)
          // Don't fail the main operation for audit logging issues
        }
      }

      return { success: true }

    } catch (err) {
      console.error(' Error during denial process:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: err }
    } finally {
      isProcessing.value = false
      console.log('=== END DENY EVENT SUPABASE QUERY ===')
    }
  }

  /**
   * Delete a booking from Supabase database
   * @param eventData - Event data from ViewEventDialog
   */
  const deleteEvent = async (eventData: any): Promise<{ success: boolean; error?: any }> => {
    /* console.log('=== DELETE EVENT SUPABASE QUERY ===')
    console.log('Event data received:', eventData) */

    isProcessing.value = true
    error.value = null
    success.value = false

    try {
      const bookingData = loadBookingDataFromStorage(eventData)

      if (!bookingData || !bookingData.id) {
        //console.log(' NO BOOKING ID FOUND FOR DELETION')
        error.value = 'Booking ID not found in localStorage'
        return { success: false, error: error.value }
      }

     /*  console.log('BOOKING ID EXTRACTED FOR DELETION:', bookingData.id)
      console.log('Full booking data from storage:', bookingData) */

      // Extract booking type/category information
      const typeInfo = extractBookingType(eventData, bookingData)
     // console.log('BOOKING TYPE CLASSIFICATION FOR DELETION:', typeInfo)

      // Handle "others" category events using the other_events table
      if (typeInfo.type === 'others') {
        try {
          const { deleteEvent: deleteOtherEvent } = useAddEvents()

          // Extract numeric ID from calendar event ID (e.g., "other_1" -> 1)
          const numericId = extractNumericIdFromCalendarEvent(bookingData.id)

          console.log('Deleting other event - Original ID:', bookingData.id, 'Numeric ID:', numericId)

          const result = await deleteOtherEvent(numericId)

          if (result.success) {
            success.value = true
            return { success: true }
          } else {
            error.value = result.error || 'Failed to delete other event'
            return { success: false, error: error.value }
          }
        } catch (err) {
          console.error('Error deleting other event:', err)
          error.value = 'Failed to delete other event'
          return { success: false, error: error.value }
        }
      }      // Execute Supabase delete query for regular bookings
      const { data, error: deleteError } = await supabase
        .from(typeInfo.tableName)
        .delete()
        .eq('id', bookingData.id)
        .select()

      if (deleteError) {
        console.error('Supabase delete error:', deleteError)
        error.value = deleteError.message
        return { success: false, error: deleteError }
      }

      //console.log('BOOKING DELETED SUCCESSFULLY:', data)
      success.value = true

      return { success: true }

    } catch (err) {
      console.error(' Error during deletion process:', err)
      error.value = err instanceof Error ? err.message : 'Unknown error occurred'
      return { success: false, error: err }
    } finally {
      isProcessing.value = false
      console.log('=== END DELETE EVENT SUPABASE QUERY ===')
    }
  }

  /**
   * Get booking details by ID and type
   * @param bookingId - Booking ID
   * @param bookingType - BookingType
   */
  const getBookingById = async (bookingId: string | number, bookingType: BookingType): Promise<{ data?: any; error?: any }> => {
    try {
      const tableName = getTableNameForBookingType(bookingType)

      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', bookingId)
        .single()

      if (error) {
        console.error(' Error fetching booking:', error)
        return { error }
      }

      return { data }
    } catch (err) {
      console.error(' Error in getBookingById:', err)
      return { error: err }
    }
  }

  /**
   * Bulk approve multiple bookings
   * @param bookings - Array of booking objects with id and type
   */
  const bulkApproveBookings = async (bookings: Array<{ id: string | number; type: BookingType }>): Promise<{ success: boolean; errors: any[] }> => {
    const errors: any[] = []

    for (const booking of bookings) {
      try {
        const tableName = getTableNameForBookingType(booking.type)

        const { error } = await supabase
          .from(tableName)
          .update({
            is_approved: true,
            is_denied: false,

          })
          .eq('id', booking.id)

        if (error) {
          errors.push({ bookingId: booking.id, error })
        }
      } catch (err) {
        errors.push({ bookingId: booking.id, error: err })
      }
    }

    return {
      success: errors.length === 0,
      errors
    }
  }

  /**
   * Debug function to show all localStorage data for troubleshooting
   */
  const debugLocalStorage = () => {
    //console.log(' DEBUG: All localStorage data:')

    // Show clicked event data
    const clickedEventData = localStorage.getItem('clicked_event_data')
    if (clickedEventData) {
      try {
        //console.log('clicked_event_data:', JSON.parse(clickedEventData))
      } catch (e) {
        console.log(' clicked_event_data (raw):', clickedEventData)
      }
    } else {
      console.log(' clicked_event_data: Not found')
    }

    // Show transformation data keys
    const transformKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('booking_transform_')) {
        transformKeys.push(key)
      }
    }
    //console.log(' booking_transform_ keys:', transformKeys)

    // Show all localStorage keys
    const allKeys = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) allKeys.push(key)
    }
    //console.log('All localStorage keys:', allKeys)
  }

  return {
    // State
    isProcessing,
    error,
    success,

    // Methods
    approveEvent,
    denyEvent,
    deleteEvent,
    getBookingById,
    bulkApproveBookings,
    loadBookingDataFromStorage,
    extractBookingType,
    debugLocalStorage
  }
}
