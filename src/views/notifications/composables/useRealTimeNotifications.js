import { onMounted, onUnmounted, watch, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification.js'
import { runNotificationSystemChecks } from '@/views/notifications/composables/notificationHelpers.js'

/**
 * Composable para sa managing real-time notifications
 * Automatically sets up ug cleans up real-time listeners
 */
export function useRealTimeNotifications() {
  const notificationStore = useNotificationStore()

  // Setup real-time listeners on mount
  onMounted(async () => {
    // Run system checks first
    await runNotificationSystemChecks()
    
    // Load stored notifications first (now async)
    await notificationStore.loadStoredNotifications()
    
    // Request notification permission
    await notificationStore.requestNotificationPermission()
    
    // Initialize real-time listeners
    await notificationStore.initializeRealTimeListeners()
  })

  // Cleanup on unmount
  onUnmounted(() => {
    notificationStore.cleanup()
  })

  // Watch para sa saving notifications whenever they change
  watch(
    () => notificationStore.notifications,
    () => {
      notificationStore.saveNotifications()
    },
    { deep: true }
  )

  // Return store properties and methods para sa component use
  return {
    notifications: computed(() => notificationStore.notifications || []),
    unreadCount: computed(() => notificationStore.unreadCount || 0),
    hasUnreadNotifications: notificationStore.hasUnreadNotifications,
    unreadNotifications: notificationStore.unreadNotifications,
    markAsRead: notificationStore.markAsRead,
    markAllAsRead: notificationStore.markAllAsRead,
    clearReadNotifications: notificationStore.clearReadNotifications,
    deleteNotification: notificationStore.deleteNotification,
    saveNotificationToDatabase: notificationStore.saveNotificationToDatabase,
    fetchNotificationsFromDatabase: notificationStore.fetchNotificationsFromDatabase,
    loading: notificationStore.loading,
    error: notificationStore.error
  }
}
