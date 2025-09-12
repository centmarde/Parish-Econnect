import { computed, ref, type Ref } from 'vue'
import { supabase } from '@/utils/supabase.js'

// Type for auth user store functions
type AuthUserStoreType = ReturnType<typeof import('@/stores/authUser.js').useAuthUserStore>

// Types
export interface BookingType {
  id: string
  type: 'wedding' | 'baptism' | 'funeral' | 'thanksgiving' | 'announcement'
  table?: string
  status: 'approved' | 'pending' | 'confirmed'
  is_approved?: boolean
  created_at: string
  // Wedding fields
  wedding_date?: string
  // Baptism fields
  baptism_date?: string
  // Funeral fields
  funeral_date?: string
  funeral_time?: string
  // Thanksgiving fields
  thanksgiving_date?: string
  // Common fields
  starting_time?: string
  ending_time?: string
  // Announcement fields
  date?: string
  [key: string]: any
}

// Default time constants para sa kada booking type
export const DEFAULT_BOOKING_TIMES = {
  wedding: { start: '10:00', end: '12:00' },
  baptism: { start: '14:00', end: '15:00' },
  funeral: { start: '09:00', end: '10:00' },
  thanksgiving: { start: '16:00', end: '17:00' }
} as const

// Filter options
export const STATUS_FILTER_OPTIONS = [
  { title: 'All Status', value: 'all' },
  { title: 'Pending', value: 'pending' },
  { title: 'Approved', value: 'approved' }
] as const

// Event icons mapping
export const EVENT_ICONS = {
  wedding: 'mdi-heart',
  baptism: 'mdi-water',
  funeral: 'mdi-cross',
  thanksgiving: 'mdi-hands-pray',
  announcement: 'mdi-bullhorn'
} as const

// Booking helper functions
export const getBookingDate = (booking: BookingType): string | null => {
  switch (booking.type) {
    case 'wedding':
      return booking.wedding_date || null
    case 'baptism':
      return booking.baptism_date || null
    case 'funeral':
      return booking.funeral_date || null
    case 'thanksgiving':
      return booking.thanksgiving_date || null
    case 'announcement':
      return booking.date || null
    default:
      return null
  }
}

export const getBookingTimes = (booking: BookingType) => {
  const defaults = DEFAULT_BOOKING_TIMES[booking.type as keyof typeof DEFAULT_BOOKING_TIMES]

  let startTime: string
  let endTime: string

  switch (booking.type) {
    case 'wedding':
      startTime = booking.starting_time || defaults?.start || '10:00'
      endTime = booking.ending_time || defaults?.end || '12:00'
      break
    case 'baptism':
      startTime = booking.starting_time || defaults?.start || '14:00'
      endTime = booking.ending_time || defaults?.end || '15:00'
      break
    case 'funeral':
      startTime = booking.starting_time || booking.funeral_time || defaults?.start || '09:00'
      endTime = booking.ending_time || defaults?.end || '10:00'
      break
    case 'thanksgiving':
      startTime = booking.starting_time || defaults?.start || '16:00'
      endTime = booking.ending_time || defaults?.end || '17:00'
      break
    default:
      startTime = booking.starting_time || '09:00'
      endTime = booking.ending_time || '10:00'
  }

  return { startTime, endTime }
}

export const getStatusColor = (booking: BookingType): string => {
  const isApproved = booking.is_approved || booking.status === 'approved'
  return isApproved ? 'success' : 'warning'
}

export const getStatusText = (booking: BookingType): string => {
  const isApproved = booking.is_approved || booking.status === 'approved'
  return isApproved ? 'Approved' : 'Pending'
}

export const getEventIcon = (type: string): string => {
  return EVENT_ICONS[type as keyof typeof EVENT_ICONS] || 'mdi-calendar'
}

// Data loading functions
export const loadAllBookings = async () => {
  try {
    const [weddings, baptisms, funerals, thanksgivings, events] = await Promise.all([
      supabase.from('wedding_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('baptism_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('funeral_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('thanksgiving_bookings').select('*').order('created_at', { ascending: false }),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ])

    const weddingBookings = weddings.data?.map((booking): BookingType => ({
      ...booking,
      type: 'wedding',
      table: 'wedding_bookings',
      status: booking.is_approved ? 'approved' : 'pending',
    })) || []

    const baptismBookings = baptisms.data?.map((booking): BookingType => ({
      ...booking,
      type: 'baptism',
      table: 'baptism_bookings',
      status: booking.is_approved ? 'approved' : 'pending',
    })) || []

    const funeralBookings = funerals.data?.map((booking): BookingType => ({
      ...booking,
      type: 'funeral',
      table: 'funeral_bookings',
      status: booking.is_approved ? 'approved' : 'pending',
    })) || []

    const thanksgivingBookings = thanksgivings.data?.map((booking): BookingType => ({
      ...booking,
      type: 'thanksgiving',
      table: 'thanksgiving_bookings',
      status: booking.is_approved ? 'approved' : 'pending',
    })) || []

    const announcements = events.data?.map((event): BookingType => ({
      ...event,
      type: event.type || 'announcement',
      status: 'confirmed',
    })) || []

    return {
      weddingBookings,
      baptismBookings,
      funeralBookings,
      thanksgivingBookings,
      announcements
    }
  } catch (error) {
    console.error('Error loading bookings:', error)
    throw error
  }
}

// Filtering functions
export const getBookingsByView = (
  currentView: string,
  bookingsData: {
    weddingBookings: BookingType[]
    baptismBookings: BookingType[]
    funeralBookings: BookingType[]
    thanksgivingBookings: BookingType[]
    announcements: BookingType[]
  }
): BookingType[] => {
  const allBookings = [
    ...bookingsData.weddingBookings,
    ...bookingsData.baptismBookings,
    ...bookingsData.funeralBookings,
    ...bookingsData.thanksgivingBookings,
  ]

  switch (currentView) {
    case 'wedding':
      return bookingsData.weddingBookings
    case 'baptism':
      return bookingsData.baptismBookings
    case 'funeral':
      return bookingsData.funeralBookings
    case 'thanksgiving':
      return bookingsData.thanksgivingBookings
    case 'announcements':
      return bookingsData.announcements
    default:
      return allBookings
  }
}

export const filterBookings = (
  bookings: BookingType[],
  searchQuery: string,
  statusFilter: string,
  dateFilter: string,
  formatBookingDetails: (booking: BookingType) => any
): BookingType[] => {
  let filtered = [...bookings]

  // Apply search filter
  if (searchQuery) {
    filtered = filtered.filter((booking) => {
      const searchTerm = searchQuery.toLowerCase()
      const details = formatBookingDetails(booking)
      return (
        details.title.toLowerCase().includes(searchTerm) ||
        details.subtitle.toLowerCase().includes(searchTerm)
      )
    })
  }

  // Apply status filter
  if (statusFilter !== 'all') {
    filtered = filtered.filter((booking) => {
      const isApproved = booking.is_approved || booking.status === 'approved'
      return statusFilter === 'approved' ? isApproved : !isApproved
    })
  }

  // Apply date filter
  if (dateFilter) {
    filtered = filtered.filter((booking) => {
      const bookingDate = getBookingDate(booking)
      return bookingDate === dateFilter
    })
  }

  return filtered
}

// Dialog management functions
export const createDialogActions = (refs: {
  bookingDialog: Ref<boolean>
  selectedBooking: Ref<BookingType | null>
  bookingConflicts: Ref<any[]>
  conflictDialog: Ref<boolean>
  pendingApprovalBooking: Ref<BookingType | null>
  denialDialog: Ref<boolean>
  denialComment: Ref<string>
  imageViewerDialog: Ref<boolean>
  selectedImages: Ref<string[]>
  currentImageIndex: Ref<number>
}) => {
  const closeBookingDialog = () => {
    refs.bookingDialog.value = false
    refs.selectedBooking.value = null
    refs.bookingConflicts.value = []
  }

  const cancelConflictDialog = () => {
    refs.conflictDialog.value = false
    refs.pendingApprovalBooking.value = null
    refs.bookingConflicts.value = []
  }

  const cancelDenialDialog = () => {
    refs.denialDialog.value = false
    refs.denialComment.value = ''
  }

  const closeImageViewer = () => {
    refs.imageViewerDialog.value = false
    refs.selectedImages.value = []
    refs.currentImageIndex.value = 0
  }

  const previousImage = () => {
    if (refs.currentImageIndex.value > 0) {
      refs.currentImageIndex.value--
    }
  }

  const nextImage = () => {
    if (refs.currentImageIndex.value < refs.selectedImages.value.length - 1) {
      refs.currentImageIndex.value++
    }
  }

  const viewImages = (booking: BookingType, authUser: AuthUserStoreType) => {
    const images = authUser.getBookingAttachedImages(booking)
    if (images.length > 0) {
      refs.selectedImages.value = images
      refs.currentImageIndex.value = 0
      refs.imageViewerDialog.value = true
    }
  }

  return {
    closeBookingDialog,
    cancelConflictDialog,
    cancelDenialDialog,
    closeImageViewer,
    previousImage,
    nextImage,
    viewImages
  }
}

// Booking action functions
export const createBookingActions = (
  refs: {
    selectedBooking: Ref<BookingType | null>
    bookingActionLoading: Ref<boolean>
    bookingConflicts: Ref<any[]>
    pendingApprovalBooking: Ref<BookingType | null>
    conflictDialog: Ref<boolean>
    denialDialog: Ref<boolean>
    denialComment: Ref<string>
  },
  authUser: AuthUserStoreType,
  loadBookings: () => Promise<void>,
  dialogActions: ReturnType<typeof createDialogActions>
) => {
  const openBookingDetails = async (booking: BookingType) => {
    refs.selectedBooking.value = booking

    // Check for conflicts when opening booking details
    const bookingDate = getBookingDate(booking)
    const { startTime, endTime } = getBookingTimes(booking)

    if (bookingDate && startTime && endTime) {
      refs.bookingConflicts.value = await authUser.checkConflicts(
        bookingDate,
        startTime,
        endTime,
      )
    }
  }

  const handleApproveBooking = async () => {
    if (!refs.selectedBooking.value) return

    refs.bookingActionLoading.value = true

    try {
      const result = await authUser.approveBooking(refs.selectedBooking.value)

      if (result.success) {
        authUser.addNotification({
          message: `${refs.selectedBooking.value.type} booking approved successfully`,
          type: 'success',
        })
        await loadBookings()
        dialogActions.closeBookingDialog()
      } else if (result.conflicts) {
        refs.bookingConflicts.value = result.conflicts
        refs.pendingApprovalBooking.value = refs.selectedBooking.value
        refs.conflictDialog.value = true
        dialogActions.closeBookingDialog()
      } else {
        console.error('Error approving booking:', result.error)
        authUser.addNotification({
          message: `Failed to approve booking: ${result.error?.message || 'Unknown error'}`,
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error in approval process:', error)
      authUser.addNotification({
        message: 'An error occurred while approving the booking',
        type: 'error',
      })
    } finally {
      refs.bookingActionLoading.value = false
    }
  }

  const handleDenyBooking = async () => {
    if (!refs.selectedBooking.value) return
    refs.denialDialog.value = true
  }

  const confirmDenyBooking = async () => {
    if (!refs.selectedBooking.value || !refs.denialComment.value.trim()) return

    refs.bookingActionLoading.value = true

    try {
      const result = await authUser.denyBookingWithComment(
        refs.selectedBooking.value,
        refs.denialComment.value.trim(),
      )

      if (result.success) {
        authUser.addNotification({
          message: `${refs.selectedBooking.value.type} booking denied`,
          type: 'info',
        })
        refs.denialDialog.value = false
        refs.denialComment.value = ''
        await loadBookings()
        dialogActions.closeBookingDialog()
      } else {
        console.error('Error denying booking:', result.error)
        authUser.addNotification({
          message: `Failed to deny booking: ${result.error?.message || 'Unknown error'}`,
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error in denial process:', error)
      authUser.addNotification({
        message: 'An error occurred while denying the booking',
        type: 'error',
      })
    } finally {
      refs.bookingActionLoading.value = false
    }
  }

  const forceApproveBooking = async () => {
    if (!refs.pendingApprovalBooking.value) return

    refs.bookingActionLoading.value = true

    try {
      const result = await authUser.forceApproveBooking(refs.pendingApprovalBooking.value)

      if (result.success) {
        authUser.addNotification({
          message: `${refs.pendingApprovalBooking.value.type} booking approved despite conflicts`,
          type: 'warning',
        })
        await loadBookings()
        refs.conflictDialog.value = false
        refs.pendingApprovalBooking.value = null
        refs.bookingConflicts.value = []
      } else {
        console.error('Error force approving booking:', result.error)
        authUser.addNotification({
          message: 'Failed to force approve booking',
          type: 'error',
        })
      }
    } catch (error) {
      console.error('Error force approving:', error)
      authUser.addNotification({
        message: 'An error occurred while force approving the booking',
        type: 'error',
      })
    } finally {
      refs.bookingActionLoading.value = false
    }
  }

  return {
    openBookingDetails,
    handleApproveBooking,
    handleDenyBooking,
    confirmDenyBooking,
    forceApproveBooking
  }
}
