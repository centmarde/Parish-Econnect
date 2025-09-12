// Composable para sa Events Management
// Mao ni ang business logic para sa events CRUD operations

import { ref, computed } from 'vue'
import { useAnnouncementsStore } from '@/stores/announcementData.js'
import {
  eventCategories,
  defaultEditForm,
  filterEvents,
  getEventTypeOptions
} from '../utils/eventsHelpers'

export function useEventsManagement() {
  // Use ang announcement store
  const announcementStore = useAnnouncementsStore()

  // Reactive state para sa UI
  const selectedEvent = ref(null)
  const editDialog = ref(false)
  const deleteDialog = ref(false)
  const actionLoading = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const filterType = ref('all')
  const searchQuery = ref('')
  const editForm = ref({ ...defaultEditForm })

  // Computed properties
  const loading = computed(() => announcementStore.loading)
  const allEvents = computed(() => announcementStore.allEvents)

  const filteredEvents = computed(() => {
    return filterEvents(allEvents.value, filterType.value, searchQuery.value)
  })

  const eventTypeOptions = computed(() => getEventTypeOptions())

  // Load all events from store
  const loadAllEvents = async () => {
    try {
      errorMessage.value = ''
      const result = await announcementStore.fetchAllEvents()

      if (result.error) {
        errorMessage.value = 'Failed to load events. Please refresh the page.'
      }
    } catch (error) {
      console.error('Error loading events:', error)
      errorMessage.value = 'Failed to load events. Please refresh the page.'
    }
  }

  // Open edit dialog para sa announcements
  const openEditDialog = (event) => {
    if (event.source !== 'announcement') {
      errorMessage.value =
        'Only announcements can be edited. Bookings must be managed through the booking system.'
      return
    }

    selectedEvent.value = event
    editForm.value = {
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      starting_time: event.starting_time || '',
      ending_time: event.ending_time || '',
      type: event.type || 'announcement',
    }
    editDialog.value = true
  }

  // Open delete dialog
  const openDeleteDialog = (event) => {
    selectedEvent.value = event
    deleteDialog.value = true
  }

  // Close mga dialogs at reset form
  const closeDialogs = () => {
    editDialog.value = false
    deleteDialog.value = false
    selectedEvent.value = null
    editForm.value = { ...defaultEditForm }
  }

  // Update event (announcements lang)
  const updateEvent = async () => {
    if (!selectedEvent.value || selectedEvent.value.source !== 'announcement') return

    try {
      actionLoading.value = true
      errorMessage.value = ''

      const updates = {
        title: editForm.value.title,
        description: editForm.value.description,
        date: editForm.value.date,
        starting_time: editForm.value.starting_time,
        ending_time: editForm.value.ending_time,
        type: editForm.value.type,
      }

      const result = await announcementStore.updateAnnouncement(selectedEvent.value.id, updates)

      if (result.error) {
        errorMessage.value = 'Failed to update event. Please try again.'
        return
      }

      successMessage.value = 'Event updated successfully!'
      closeDialogs()
      await loadAllEvents()

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (error) {
      console.error('Error updating event:', error)
      errorMessage.value = 'Failed to update event. Please try again.'
    } finally {
      actionLoading.value = false
    }
  }

  // Delete event
  const deleteEvent = async () => {
    if (!selectedEvent.value) return

    try {
      actionLoading.value = true
      errorMessage.value = ''

      const result = await announcementStore.deleteEvent(selectedEvent.value)

      if (result.error) {
        errorMessage.value = 'Failed to delete event. Please try again.'
        return
      }

      successMessage.value = `${selectedEvent.value.source === 'announcement' ? 'Announcement' : 'Event'} deleted successfully!`
      closeDialogs()

      // Clear success message after 3 seconds
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    } catch (error) {
      console.error('Error deleting event:', error)
      errorMessage.value = 'Failed to delete event. Please try again.'
    } finally {
      actionLoading.value = false
    }
  }

  // Clear mga messages
  const clearMessages = () => {
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    // State
    loading,
    allEvents,
    selectedEvent,
    editDialog,
    deleteDialog,
    actionLoading,
    errorMessage,
    successMessage,
    filterType,
    searchQuery,
    editForm,
    eventCategories,

    // Computed
    filteredEvents,
    eventTypeOptions,

    // Methods
    loadAllEvents,
    openEditDialog,
    openDeleteDialog,
    closeDialogs,
    updateEvent,
    deleteEvent,
    clearMessages,
  }
}
