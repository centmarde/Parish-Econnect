import { ref } from 'vue'
import type { Ref } from 'vue'

/**
 * Booking type/category definitions
 */
export type BookingType = 'wedding' | 'baptism' | 'funeral' | 'thanksgiving' | 'others'

export interface BookingTypeInfo {
  type: BookingType
  tableName: string
  displayName: string
  approvalColumn: string
  denialColumn: string
  confidenceLevel: 'high' | 'medium' | 'low'
  source: string
}

/**
 * Standalone utility function to quickly verify booking type from a simple category string
 * @param category - Category string to classify
 * @returns BookingType
 */
export const getBookingTypeFromCategory = (category: string): BookingType => {
  if (!category) return 'others'

  const lowerCategory = category.toLowerCase()

  // Wedding variations
  if (lowerCategory.includes('wedding') ||
      lowerCategory.includes('kasal') ||
      lowerCategory.includes('marriage') ||
      lowerCategory.includes('wedding mass')) return 'wedding'

  // Baptism variations
  if (lowerCategory.includes('baptism') ||
      lowerCategory.includes('bunyag') ||
      lowerCategory.includes('baptismal') ||
      lowerCategory.includes('baptism mass')) return 'baptism'

  // Funeral variations
  if (lowerCategory.includes('funeral') ||
      lowerCategory.includes('lamay') ||
      lowerCategory.includes('patay') ||
      lowerCategory.includes('requiem') ||
      lowerCategory.includes('funeral mass')) return 'funeral'

  // Thanksgiving variations
  if (lowerCategory.includes('thanksgiving') ||
      lowerCategory.includes('pasalamat') ||
      lowerCategory.includes('thanksgiving mass')) return 'thanksgiving'

  return 'others'
}

/**
 * Get Supabase table name based on booking type
 * @param type - BookingType
 * @returns Database table name
 */
export const getTableNameForBookingType = (type: BookingType): string => {
  switch (type) {
    case 'wedding': return 'wedding_bookings'
    case 'baptism': return 'baptism_bookings'
    case 'funeral': return 'funeral_bookings'
    case 'thanksgiving': return 'thanksgiving_bookings'
    default: return 'others'
  }
}

/**
 * Extract the numeric ID from calendar event IDs that have prefixes
 * Calendar events have IDs like "wedding_123", "baptism_456", "other_789"
 * This function extracts just the numeric part
 * @param eventId - Event ID from calendar (e.g., "other_1", "wedding_123")
 * @returns Numeric ID or the original value if no prefix found
 */
export const extractNumericIdFromCalendarEvent = (eventId: string | number): string | number => {
  if (typeof eventId !== 'string') {
    return eventId
  }

  // Check if it has a prefix pattern (category_number)
  const match = eventId.match(/^(wedding|baptism|funeral|thanksgiving|other)_(\d+)$/)
  if (match) {
    // Return just the numeric part
    return parseInt(match[2], 10)
  }

  // If no prefix pattern found, return as-is
  return eventId
}

/**
 * Get the booking type from a calendar event ID
 * @param eventId - Event ID from calendar (e.g., "other_1", "wedding_123")
 * @returns BookingType extracted from the prefix
 */
export const getBookingTypeFromEventId = (eventId: string): BookingType => {
  if (typeof eventId !== 'string') {
    return 'others'
  }

  const match = eventId.match(/^(wedding|baptism|funeral|thanksgiving|other)_\d+$/)
  if (match) {
    const prefix = match[1]
    // Handle "other" vs "others"
    if (prefix === 'other') return 'others'
    return prefix as BookingType
  }

  return 'others'
}

/**
 * Composable para sa pag-handle ng event approval
 * Now uses the actionQuery.ts for actual Supabase operations
 * @deprecated Use useActionQuery from actionQuery.ts instead
 */
export const useApprovalQuery = () => {
  console.warn('⚠️ useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts instead.')

  // Return empty functions for backward compatibility
  // The actual implementation should use useActionQuery from actionQuery.ts
  return {
    isProcessing: ref(false),
    error: ref(null),
    approveEvent: async () => {
      console.error('useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts')
    },
    denyEvent: async () => {
      console.error('useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts')
    },
    deleteEvent: async () => {
      console.error('useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts')
    },
    loadBookingDataFromStorage: () => {
      console.error('useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts')
      return null
    },
    extractBookingType: () => {
      console.error('useApprovalQuery is deprecated. Use useActionQuery from actionQuery.ts')
      return {
        type: 'others',
        tableName: 'others',
        displayName: 'Other Event',
        approvalColumn: 'is_approved',
        denialColumn: 'is_denied',
        confidenceLevel: 'low',
        source: 'deprecated'
      }
    }
  }
}
