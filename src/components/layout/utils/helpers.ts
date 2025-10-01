// Constants for booking management
export const BOOKING_CONSTANTS = {
  ITEMS_PER_PAGE: 5,
  BOOKING_TYPES: {
    WEDDING: 'wedding',
    FUNERAL: 'funeral',
    BAPTISM: 'baptism',
    THANKSGIVING: 'thanksgiving'
  },
  BOOKING_ICONS: {
    wedding: 'mdi-heart',
    funeral: 'mdi-cross',
    baptism: 'mdi-water',
    thanksgiving: 'mdi-church'
  },
  BOOKING_TYPE_LABELS: {
    wedding: 'Wedding Booking',
    funeral: 'Funeral Booking',
    baptism: 'Baptism Booking',
    thanksgiving: 'Thanksgiving Booking'
  },
  BOOKING_SUBTITLES: {
    wedding: (booking) => `${booking.bride_firstname} ${booking.bride_lastname} - ${booking.groom_firstname} ${booking.groom_lastname}`,
    funeral: 'Funeral Mass Booking',
    baptism: 'Baptism Mass Booking',
    thanksgiving: 'Thanksgiving Mass Booking'
  }
}

// Booking utility functions

/**
 * Formats booking date based on booking type
 */
export const formatBookingDate = (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  if (!handler) return ''

  const dateField = booking.bookingType === 'wedding' ? booking.wedding_date
    : booking.bookingType === 'funeral' ? booking.funeral_date
    : booking.bookingType === 'baptism' ? booking.baptism_date
    : booking.thanksgiving_date

  return handler.formatDate(dateField || '')
}

/**
 * Gets status color based on booking type
 */
export const getBookingStatusColor = (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  return handler ? handler.getStatusColor(booking) : 'grey'
}

/**
 * Gets status text based on booking type
 */
export const getBookingStatusText = (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  return handler ? handler.getStatusText(booking) : 'Unknown'
}

/**
 * Handles booking click based on booking type
 */
export const handleBookingClick = (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  if (handler) {
    handler.handleBookingClick(booking)
  }
}

/**
 * Checks if booking is clickable based on booking type
 */
export const isBookingClickable = (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  return handler ? handler.isClickable(booking) : false
}

/**
 * Gets booking title based on booking type and data
 */
export const getBookingTitle = (booking) => {
  switch (booking.bookingType) {
    case BOOKING_CONSTANTS.BOOKING_TYPES.WEDDING:
      return `${booking.bride_firstname} & ${booking.groom_firstname}`
    case BOOKING_CONSTANTS.BOOKING_TYPES.FUNERAL:
      return `${booking.deceased_firstname} ${booking.deceased_lastname}`
    case BOOKING_CONSTANTS.BOOKING_TYPES.BAPTISM:
      return `${booking.child_firstname} ${booking.child_lastname}`
    case BOOKING_CONSTANTS.BOOKING_TYPES.THANKSGIVING:
      return booking.title || `${booking.participant_firstname} ${booking.participant_lastname}`
    default:
      return 'Unknown Booking'
  }
}

/**
 * Gets booking subtitle based on booking type and data
 */
export const getBookingSubtitle = (booking) => {
  switch (booking.bookingType) {
    case BOOKING_CONSTANTS.BOOKING_TYPES.WEDDING:
      return BOOKING_CONSTANTS.BOOKING_SUBTITLES.wedding(booking)
    case BOOKING_CONSTANTS.BOOKING_TYPES.FUNERAL:
      return BOOKING_CONSTANTS.BOOKING_SUBTITLES.funeral
    case BOOKING_CONSTANTS.BOOKING_TYPES.BAPTISM:
      return BOOKING_CONSTANTS.BOOKING_SUBTITLES.baptism
    case BOOKING_CONSTANTS.BOOKING_TYPES.THANKSGIVING:
      return BOOKING_CONSTANTS.BOOKING_SUBTITLES.thanksgiving
    default:
      return 'Unknown Booking Type'
  }
}

/**
 * Gets booking icon based on booking type
 */
export const getBookingIcon = (booking) => {
  return BOOKING_CONSTANTS.BOOKING_ICONS[booking.bookingType] || 'mdi-help-circle'
}

/**
 * Gets booking type label
 */
export const getBookingTypeLabel = (booking) => {
  return BOOKING_CONSTANTS.BOOKING_TYPE_LABELS[booking.bookingType] || 'Unknown Booking'
}

/**
 * Gets reference ID for booking if available
 */
export const getReferenceId = (booking) => {
  if (booking.ref_number) {
    return `Ref: ${booking.ref_number}`
  }
  return null
}

/**
 * Checks if booking is completed based on status and attached documents
 */
export const isBookingCompleted = (booking) => {
  // Check if booking has reference number (indicates documents were submitted)
  if (booking.ref_number) {
    return true
  }

  // Additional status checks based on booking type
  switch (booking.bookingType) {
    case BOOKING_CONSTANTS.BOOKING_TYPES.BAPTISM:
      return booking.status === 'completed' || booking.status === 'approved' ||
             (booking.attached_images_1 && booking.attached_images_2 && booking.attached_images_3)
    case BOOKING_CONSTANTS.BOOKING_TYPES.FUNERAL:
      return booking.status === 'completed' || booking.status === 'approved' || booking.attached_images_1
    case BOOKING_CONSTANTS.BOOKING_TYPES.WEDDING:
    case BOOKING_CONSTANTS.BOOKING_TYPES.THANKSGIVING:
      return booking.status === 'completed' || booking.status === 'approved'
    default:
      return false
  }
}

/**
 * Checks if booking can be deleted
 */
export const canDeleteBooking = (booking) => {
  // Allow deletion for all bookings regardless of status
  return booking ? true : false
}

/**
 * Merges all booking arrays into one with type indicators and sorts by date
 */
export const mergeAndSortBookings = (bookingsByType) => {
  const combined = []

  Object.entries(bookingsByType).forEach(([type, bookings]) => {
    if (Array.isArray(bookings)) {
      bookings.forEach(booking => {
        const dateField = type === 'wedding' ? booking.wedding_date
          : type === 'funeral' ? booking.funeral_date
          : type === 'baptism' ? booking.baptism_date
          : booking.thanksgiving_date

        combined.push({
          ...booking,
          bookingType: type,
          sortDate: dateField || booking.created_at
        })
      })
    }
  })

  // Sort by date (most recent first)
  return combined.sort((a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime())
}

/**
 * Handles booking deletion with proper error handling
 */
export const deleteBookingHandler = async (booking, handlers) => {
  const handler = handlers[booking.bookingType]
  if (!handler) {
    throw new Error(`No handler found for booking type: ${booking.bookingType}`)
  }

  return await handler.deleteBooking(booking)
}
