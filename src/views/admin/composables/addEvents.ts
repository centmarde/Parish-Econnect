import { ref } from 'vue'
import { supabase } from '@/utils/supabase'

export const useAddEvents = () => {
  const loading = ref(false)
  const error = ref('')
  const success = ref('')

  // Add new event to other_events table
  const addEvent = async (eventData) => {
    loading.value = true
    error.value = ''
    success.value = ''

    try {
      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        throw new Error('User not authenticated')
      }

      // Use provided event date or current date as fallback
      const eventDate = eventData.eventDate || new Date().toISOString().split('T')[0]

      // Create the created_at timestamp using the event date
      // If time is provided, use it; otherwise use current time
      let createdAtTimestamp
      if (eventData.starting_time) {
        // Combine event date with starting time
        createdAtTimestamp = `${eventDate}T${eventData.starting_time}:00.000Z`
      } else {
        // Use event date at midnight
        createdAtTimestamp = `${eventDate}T00:00:00.000Z`
      }

      const { data, error: insertError } = await supabase
        .from('other_events')
        .insert({
          title: eventData.title,
          description: eventData.description,
          starting_time: eventData.starting_time || null,
          ending_time: eventData.ending_time || null,
          user_id: userData.user.id,
          created_at: createdAtTimestamp
        })
        .select()

      if (insertError) {
        throw insertError
      }

      success.value = 'Event added successfully'
      return { data, success: true }

    } catch (err) {
      error.value = err.message || 'Failed to add event'
      console.error('Error adding event:', err)
      return { error: err.message, success: false }
    } finally {
      loading.value = false
    }
  }

  // Get all other events
  const getOtherEvents = async () => {
    loading.value = true
    error.value = ''

    try {
      const { data, error: fetchError } = await supabase
        .from('other_events')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      return { data, success: true }

    } catch (err) {
      error.value = err.message || 'Failed to fetch events'
      console.error('Error fetching events:', err)
      return { error: err.message, success: false }
    } finally {
      loading.value = false
    }
  }

  // Update event
  const updateEvent = async (eventId, eventData) => {
    loading.value = true
    error.value = ''
    success.value = ''

    try {
      const { data, error: updateError } = await supabase
        .from('other_events')
        .update({
          title: eventData.title,
          description: eventData.description,
          starting_time: eventData.starting_time || null,
          ending_time: eventData.ending_time || null
        })
        .eq('id', eventId)
        .select()

      if (updateError) {
        throw updateError
      }

      success.value = 'Event updated successfully'
      return { data, success: true }

    } catch (err) {
      error.value = err.message || 'Failed to update event'
      console.error('Error updating event:', err)
      return { error: err.message, success: false }
    } finally {
      loading.value = false
    }
  }

  // Delete event
  const deleteEvent = async (eventId) => {
    loading.value = true
    error.value = ''
    success.value = ''

    try {
      const { error: deleteError } = await supabase
        .from('other_events')
        .delete()
        .eq('id', eventId)

      if (deleteError) {
        throw deleteError
      }

      success.value = 'Event deleted successfully'
      return { success: true }

    } catch (err) {
      error.value = err.message || 'Failed to delete event'
      console.error('Error deleting event:', err)
      return { error: err.message, success: false }
    } finally {
      loading.value = false
    }
  }

  // Clear messages
  const clearMessages = () => {
    error.value = ''
    success.value = ''
  }

  return {
    // State
    loading,
    error,
    success,

    // Actions
    addEvent,
    getOtherEvents,
    updateEvent,
    deleteEvent,
    clearMessages
  }
}
