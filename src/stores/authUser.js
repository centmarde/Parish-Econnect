import { supabase } from '@/utils/supabase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

import {
  eventCategories,
  getEventColor,
  getEventGradient,
  loadPendingBookings,
  loadEvents,
  loadStats,
  loadCalendarEvents,
  loadRecentActivities,
  approveBooking,
  denyBooking,
  createEvent,
  checkBookingConflicts,
  getBookingDetails,
  forceApproveBooking,
} from '@/views/admin/functions/adminDashboard'

export const useAuthUserStore = defineStore('authUser', () => {
  const notifications = ref([])
  const pendingBookings = ref([])
  const events = ref([])
  const calendarEvents = ref([])
  const recentActivities = ref([])
  const stats = reactive({
    totalBookings: 0,
    pendingApprovals: 0,
    approvedBookings: 0,
    deniedBookings: 0,
    upcomingEvents: 0,
    totalEvents: 0,
    totalMembers: 0,
  })
  const previousStats = ref({
    totalBookings: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
    totalMembers: 0,
  })
  const statsTrends = reactive({
    totalBookings: 0,
    pendingApprovals: 0,
    approvedBookings: 0,
    deniedBookings: 0,
    upcomingEvents: 0,
    totalEvents: 0,
    totalMembers: 0,
  })

  const unreadNotificationsCount = computed(() => notifications.value.filter((n) => !n.read).length)

  // Dashboard Loader
  async function loadDashboardData() {
    await Promise.all([
      loadPendingBookings(pendingBookings, stats),
      loadEvents(events, stats),
      loadStats(stats),
      loadCalendarEvents(calendarEvents),
      loadRecentActivities(recentActivities),
    ])
  }

  // States
  const userData = ref(null)
  const authPages = ref([])
  const authBranchIds = ref([])

  // Getters
  // Computed Properties; Use for getting the state but not modifying its reactive state
  const userRole = computed(() => {
    return userData.value?.is_admin ? 'Super Administrator' : userData.value.user_role
  })

  // Reset State Action
  function $reset() {
    userData.value = null
    authPages.value = []
    authBranchIds.value = []
  }

  // Actions
  // Retrieve User Session if Logged
  async function isAuthenticated() {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      const { id, email, user_metadata } = data.session.user
      userData.value = { id, email, ...user_metadata }
    }

    return !!data.session
  }

  // Retrieve User Information
  async function getUserInformation() {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata },
      },
    } = await supabase.auth.getUser()

    // Set the retrieved information to state
    userData.value = { id, email, ...user_metadata }
  }

  // Retrieve User Roles Pages
  async function getAuthPages(name) {
    const { data } = await supabase
      .from('user_roles')
      .select('*, pages: user_role_pages (page)')
      .eq('user_role', name)

    // Set the retrieved data to state
    if (data.length > 0) authPages.value = data[0].pages.map((p) => p.page)
  }

  // Retrieve Branch Ids
  async function getAuthBranchIds() {
    const { data } = await supabase
      .from('branches')
      .select('id')
      .in('name', userData.value.branch.split(','))

    authBranchIds.value = data.map((b) => b.id)
  }

  // Update User Information
  async function updateUserInformation(updatedData) {
    const {
      data: {
        // Retrieve Id, Email and Metadata thru Destructuring
        user: { id, email, user_metadata },
      },
      error,
    } = await supabase.auth.updateUser({
      data: {
        ...updatedData,
      },
    })

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set updatedData to userData state
    else if (user_metadata) {
      userData.value = { id, email, ...user_metadata }

      return { data: userData.value }
    }
  }

  // Update User Profile Image
  async function updateUserImage(file) {
    // Get the file extension from the uploaded file
    // const fileExtension = file.name.split('.').pop()

    // Upload the file with the user ID and file extension
    const { data, error } = await supabase.storage
      .from('shirlix')
      .upload('avatars/' + userData.value.id + '-avatar.png', file, {
        cacheControl: '3600',
        upsert: true,
      })

    // Check if it has error
    if (error) {
      return { error }
    }
    // If no error set data to userData state with the image_url
    else if (data) {
      // Retrieve Image Public Url
      const { data: imageData } = supabase.storage.from('shirlix').getPublicUrl(data.path)

      // Update the user information with the new image_url
      return await updateUserInformation({ ...userData.value, image_url: imageData.publicUrl })
    }
  }

  // Calendar helper functions for the dashboard
  const hasEvent = computed(() => (date) => {
    return calendarEvents.value.some((event) => event.date === date)
  })

  const hasMultipleEvents = computed(() => (date) => {
    return calendarEvents.value.filter((event) => event.date === date).length > 1
  })

  const getSelectedDateEvents = computed(() => (selectedDate) => {
    const dateStr = selectedDate.toISOString().split('T')[0]
    return calendarEvents.value.filter((event) => event.date === dateStr)
  })

  const eventDates = computed(() => (date) => {
    const dateEvents = calendarEvents.value.filter((event) => event.date === date)
    if (dateEvents.length === 0) return false
    if (dateEvents.length === 1) return getEventColor(dateEvents[0].type)
    return '#9C27B0' // Multiple events color
  })

  // Booking formatting helper
  const formatBookingDetails = computed(() => (booking) => {
    let title = ''
    let subtitle = ''
    let date = ''
    let time = ''

    switch (booking.type) {
      case 'wedding':
        title = `Wedding Ceremony`
        subtitle =
          booking.title ||
          `${booking.bride_firstname || ''} & ${booking.groom_firstname || ''}`.trim()
        date = booking.wedding_date
          ? new Date(booking.wedding_date).toLocaleDateString()
          : 'Date TBD'
        time = '10:00 AM' // Default wedding time
        break

      case 'baptism':
        title = `Baptism Ceremony`
        subtitle = `${booking.child_firstname} ${booking.child_lastname}`
        date = booking.baptism_date
          ? new Date(booking.baptism_date).toLocaleDateString()
          : 'Date TBD'
        time = '2:00 PM' // Default baptism time
        break

      case 'funeral':
        title = `Funeral Service`
        subtitle = `${booking.deceased_firstname} ${booking.deceased_lastname}`
        date = booking.funeral_date
          ? new Date(booking.funeral_date).toLocaleDateString()
          : 'Date TBD'
        time = booking.funeral_time || '9:00 AM'
        break

      case 'thanksgiving':
        title = `Thanksgiving Service`
        subtitle = `${booking.participant_firstname} ${booking.participant_lastname}`
        date = booking.thanksgiving_date
          ? new Date(booking.thanksgiving_date).toLocaleDateString()
          : 'Date TBD'
        time = '4:00 PM' // Default thanksgiving time
        break

      default:
        title = 'Unknown Event'
        subtitle = 'Details unavailable'
        date = 'Date TBD'
        time = 'Time TBD'
    }

    return { title, subtitle, date, time }
  })

  // Notification management
  const addNotification = (notification) => {
    notifications.value.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification,
    })
  }

  const markNotificationAsRead = (notificationId) => {
    const notification = notifications.value.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  // Booking conflict detection
  const checkConflicts = async (bookingDate, bookingTime) => {
    return await checkBookingConflicts(bookingDate, bookingTime)
  }

  // Get detailed booking information
  const getDetailedBookingInfo = (booking) => {
    return getBookingDetails(booking)
  }

  // Enhanced approve booking with conflict checking
  const approveBookingWithConflictCheck = async (booking) => {
    try {
      // Get the booking date and time
      let bookingDate, bookingTime

      switch (booking.type) {
        case 'wedding':
          bookingDate = booking.wedding_date
          bookingTime = '10:00'
          break
        case 'baptism':
          bookingDate = booking.baptism_date
          bookingTime = '14:00'
          break
        case 'funeral':
          bookingDate = booking.funeral_date
          bookingTime = booking.funeral_time || '09:00'
          break
        case 'thanksgiving':
          bookingDate = booking.thanksgiving_date
          bookingTime = '16:00'
          break
      }

      // Check for conflicts before approving
      if (bookingDate && bookingTime) {
        const conflicts = await checkBookingConflicts(bookingDate, bookingTime)
        if (conflicts.length > 0) {
          return {
            success: false,
            conflicts: conflicts,
            message: `Conflict detected! There is already a ${conflicts[0].type} scheduled at ${bookingTime} on ${bookingDate}`,
          }
        }
      }

      // If no conflicts, proceed with approval
      return await approveBooking(booking, loadDashboardData)
    } catch (error) {
      console.error('Error in conflict check approval:', error)
      return { error }
    }
  }

  return {
    userData,
    userRole,
    authPages,
    authBranchIds,
    $reset,
    isAuthenticated,
    getUserInformation,
    getAuthPages,
    getAuthBranchIds,
    updateUserInformation,
    updateUserImage,

    notifications,
    pendingBookings,
    events,
    calendarEvents,
    recentActivities,
    stats,
    previousStats,
    eventCategories,
    unreadNotificationsCount,
    statsTrends,

    // Dashboard functions
    loadDashboardData,
    loadPendingBookings: () => loadPendingBookings(pendingBookings, stats),
    loadStats: () => loadStats(stats),
    loadRecentActivities: () => loadRecentActivities(recentActivities),

    // Booking management with conflict detection
    approveBooking: approveBookingWithConflictCheck,
    forceApproveBooking: (booking) => forceApproveBooking(booking, loadDashboardData),
    denyBooking: (booking) => denyBooking(booking, loadDashboardData),
    createEvent: (eventData) => createEvent(eventData, loadDashboardData),
    checkConflicts,
    getDetailedBookingInfo,

    // Calendar helpers
    hasEvent,
    hasMultipleEvents,
    getSelectedDateEvents,
    eventDates,

    // Booking helpers
    formatBookingDetails,

    // Notification management
    addNotification,
    markNotificationAsRead,

    // Utility functions
    getEventColor,
    getEventGradient,
  }
})
