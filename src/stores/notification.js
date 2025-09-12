import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase.js'

export const useNotificationStore = defineStore('notifications', () => {
  // Notifications array para sa real-time notifications
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)
  const error = ref(null)

  // Real-time channels para sa wedding ug funeral bookings
  let weddingChannel = null
  let funeralChannel = null

  // Computed para sa notification badge visibility
  const hasUnreadNotifications = computed(() => unreadCount.value > 0)

  // Computed para sa unread notifications
  const unreadNotifications = computed(() =>
    notifications.value.filter(n => !n.isRead)
  )

  // Helper function para sa getting current user
  const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('Error getting user:', error.message)
      return null
    }
    return user
  }

  // Function para sa creating notification object
  const createNotification = (type, bookingData, status) => {
    const eventTypes = {
      wedding: {
        approved: {
          title: 'Wedding Request Approved',
          message: `Ang inyong wedding request kay ${bookingData.groom_firstname} ug ${bookingData.bride_firstname} na-approve na! Schedule: ${new Date(bookingData.wedding_date).toLocaleDateString()} on ${bookingData.starting_time}`,
          icon: 'mdi-ring',
          color: 'success'
        },
        denied: {
          title: 'Wedding Request Denied',
          message: `Ang inyong wedding request kay ${bookingData.groom_firstname} ug ${bookingData.bride_firstname} on ${bookingData.starting_time} na-deny.  Reasons: ${bookingData.comment}`,
          icon: 'mdi-cancel',
          color: 'error'
        }
      },
      funeral: {
        approved: {
          title: 'Funeral Mass Approved',
          message: `Ang inyong funeral mass request para kay ${bookingData.deceased_firstname} na-approve na! Schedule: ${new Date(bookingData.funeral_date).toLocaleDateString()} on ${bookingData.starting_time}`,
          icon: 'mdi-cross',
          color: 'success'
        },
        denied: {
          title: 'Funeral Mass Denied',
          message: `Ang inyong funeral mass request para kay ${bookingData.deceased_firstname} on ${bookingData.starting_time} na-deny. Reasons: ${bookingData.comment}`,
          icon: 'mdi-cancel',
          color: 'error'
        }
      }
    }

    const config = eventTypes[type]?.[status]
    if (!config) return null

    return {
      id: `${type}_${bookingData.id}_${Date.now()}`,
      title: config.title,
      message: config.message,
      type: config.color,
      timestamp: new Date(),
      isRead: false,
      actionUrl: `/bookings/${type}`,
      icon: config.icon,
      bookingId: bookingData.id,
      bookingType: type
    }
  }

  // Function para sa adding new notification
  const addNotification = async (notification) => {
    // Save to database first
    const dbNotification = await saveNotificationToDatabase(notification)

    // If database save successful, use database ID, otherwise use original ID
    const finalNotification = dbNotification ? {
      ...notification,
      id: dbNotification.id,
      timestamp: new Date(dbNotification.created_at)
    } : notification

    notifications.value.unshift(finalNotification)
    unreadCount.value = unreadNotifications.value.length

    // Optional: Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification(finalNotification.title, {
        body: finalNotification.message,
        icon: '/logo.png'
      })
    }
  }

  // Function para sa marking notifications as read
  const markAsRead = async (notificationId) => {
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification && !notification.isRead) {
      // Update sa database if it's a database notification
      if (typeof notificationId === 'number' || notificationId.toString().match(/^\d+$/)) {
        try {
          const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)

          if (error) {
            console.error('Error marking notification as read in database:', error.message)
            return false
          }
        } catch (err) {
          console.error('Failed to mark notification as read in database:', err)
          return false
        }
      }

      // Update local state
      notification.isRead = true
      unreadCount.value = unreadNotifications.value.length
      return true
    }
    return false
  }

  // Function para sa marking all notifications as read
  const markAllAsRead = async () => {
    const user = await getCurrentUser()
    if (!user) return false

    try {
      // Update all unread notifications sa database
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all notifications as read in database:', error.message)
        return false
      }

      // Update local state
      notifications.value.forEach(n => n.isRead = true)
      unreadCount.value = 0
      return true
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err)
      return false
    }
  }

  // Function para sa clearing read notifications
  const clearReadNotifications = async () => {
    const user = await getCurrentUser()
    if (!user) return false

    try {
      // Delete read notifications from database
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id)
        .eq('is_read', true)

      if (error) {
        console.error('Error clearing read notifications from database:', error.message)
        return false
      }

      // Update local state
      notifications.value = notifications.value.filter(n => !n.isRead)
      return true
    } catch (err) {
      console.error('Failed to clear read notifications:', err)
      return false
    }
  }

  // Function para sa deleting specific notification
  const deleteNotification = async (notificationId) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      // Delete from database if it has a database ID
      if (typeof notificationId === 'number' || notificationId.toString().match(/^\d+$/)) {
        try {
          const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', notificationId)

          if (error) {
            console.error('Error deleting notification from database:', error.message)
            return false
          }
        } catch (err) {
          console.error('Failed to delete notification from database:', err)
          return false
        }
      }

      // Remove from local state
      notifications.value.splice(index, 1)
      unreadCount.value = unreadNotifications.value.length
      //console.log(`Notification ${notificationId} deleted successfully`)
      return true
    }
    return false
  }

  // Function para sa saving notification to database
  const saveNotificationToDatabase = async (notification) => {
    const user = await getCurrentUser()
    if (!user) {
      console.error('Cannot save notification: No authenticated user')
      return null
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          title: notification.title,
          message: notification.message,
          color: notification.type, // Map type to color
          icon: notification.icon,
          user_id: user.id,
          is_read: false // New notifications default to unread
        }])
        .select()
        .single()

      if (error) {
        console.error('Error saving notification to database:', error.message)
        return null
      }

     // console.log('Notification saved to database:', data)
      return data
    } catch (err) {
      console.error('Failed to save notification to database:', err)
      return null
    }
  }

  // Function para sa fetching notifications from database
  const fetchNotificationsFromDatabase = async () => {
    const user = await getCurrentUser()
    if (!user) {
      console.error('Cannot fetch notifications: No authenticated user')
      return []
    }

    try {
      loading.value = true
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching notifications from database:', error.message)
        error.value = error.message
        return []
      }

      // Transform database notifications to local format
      const transformedNotifications = (data || []).map(dbNotification => ({
        id: dbNotification.id, // Use database ID
        title: dbNotification.title,
        message: dbNotification.message,
        type: dbNotification.color || 'info',
        timestamp: new Date(dbNotification.created_at),
        isRead: dbNotification.is_read || false, // Use database is_read column
        icon: dbNotification.icon || 'mdi-bell',
        actionUrl: '/notifications', // Default action
        bookingType: 'database' // Mark as database notification
      }))

      notifications.value = transformedNotifications
      unreadCount.value = unreadNotifications.value.length
     // console.log(`Fetched ${transformedNotifications.length} notifications from database`)

      return transformedNotifications
    } catch (err) {
      console.error('Failed to fetch notifications from database:', err)
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  // Setup real-time listeners para sa wedding bookings
  const setupWeddingListener = async () => {
    const user = await getCurrentUser()
    if (!user) return

    if (weddingChannel) {
      supabase.removeChannel(weddingChannel)
    }

    weddingChannel = supabase
      .channel('wedding-booking-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'wedding_bookings',
          filter: `user_id=eq.${user.id}` // Filter para sa current user lang
        },
        (payload) => {
         // console.log('Wedding booking change received:', payload)

          const oldRecord = payload.old
          const newRecord = payload.new

          // Check if is_approved or is_denied changed
          if (oldRecord.is_approved !== newRecord.is_approved && newRecord.is_approved === true) {
            const notification = createNotification('wedding', newRecord, 'approved')
            if (notification) addNotification(notification)
          }

          if (oldRecord.is_denied !== newRecord.is_denied && newRecord.is_denied === true) {
            const notification = createNotification('wedding', newRecord, 'denied')
            if (notification) addNotification(notification)
          }
        }
      )
      .subscribe()
  }

  // Setup real-time listeners para sa funeral bookings
  const setupFuneralListener = async () => {
    const user = await getCurrentUser()
    if (!user) return

    if (funeralChannel) {
      supabase.removeChannel(funeralChannel)
    }

    funeralChannel = supabase
      .channel('funeral-booking-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'funeral_bookings',
          filter: `user_id=eq.${user.id}` // Filter para sa current user lang
        },
        (payload) => {
         // console.log('Funeral booking change received:', payload)

          const oldRecord = payload.old
          const newRecord = payload.new

          // Check if is_approved or is_denied changed
          if (oldRecord.is_approved !== newRecord.is_approved && newRecord.is_approved === true) {
            const notification = createNotification('funeral', newRecord, 'approved')
            if (notification) addNotification(notification)
          }

          if (oldRecord.is_denied !== newRecord.is_denied && newRecord.is_denied === true) {
            const notification = createNotification('funeral', newRecord, 'denied')
            if (notification) addNotification(notification)
          }
        }
      )
      .subscribe()
  }

  // Initialize real-time listeners
  const initializeRealTimeListeners = async () => {
    try {
      await setupWeddingListener()
      await setupFuneralListener()
      //console.log('Real-time notification listeners initialized')
    } catch (err) {
      console.error('Error initializing real-time listeners:', err)
      error.value = err.message
    }
  }

  // Cleanup function para sa removing channels
  const cleanup = () => {
    if (weddingChannel) {
      supabase.removeChannel(weddingChannel)
      weddingChannel = null
    }
    if (funeralChannel) {
      supabase.removeChannel(funeralChannel)
      funeralChannel = null
    }
  }

  // Function para sa loading notifications from database (replaces localStorage)
  const loadStoredNotifications = async () => {
    try {
      // Try to fetch from database first
      const dbNotifications = await fetchNotificationsFromDatabase()

      if (dbNotifications.length > 0) {
        // Database has notifications, use them
        return
      }

      // If no database notifications, just set empty state
      const user = await getCurrentUser()
      if (user) {
        // User authenticated but no notifications - set empty state
        notifications.value = []
        unreadCount.value = 0
      } else {
        // No user, just set empty notifications
        notifications.value = []
        unreadCount.value = 0
      }
    } catch (err) {
      console.error('Error loading notifications:', err)
      // Fallback to empty array kung naa error
      notifications.value = []
      unreadCount.value = 0
    }
  }

  // Function para sa saving notifications to local storage
  const saveNotifications = () => {
    try {
      localStorage.setItem('parish_notifications', JSON.stringify(notifications.value))
    } catch (err) {
      console.error('Error saving notifications:', err)
    }
  }

  // Function para sa requesting browser notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    hasUnreadNotifications,
    unreadNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearReadNotifications,
    deleteNotification,
    saveNotificationToDatabase,
    fetchNotificationsFromDatabase,
    initializeRealTimeListeners,
    cleanup,
    loadStoredNotifications,
    saveNotifications,
    requestNotificationPermission
  }
})
