import { supabase } from '@/utils/supabase'
import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useAnnouncementsStore = defineStore('announcement', () => {
  // State
  const announcements = ref([])
  const allEvents = ref([])
  const loading = ref(false)
  const error = ref('')

  // Computed
  const announcementsCount = computed(() => announcements.value.length)
  const eventsCount = computed(() => allEvents.value.length)

  // Actions for announcements only
  const fetchAnnouncements = async () => {
    try {
      loading.value = true
      error.value = ''

      const { data, error: fetchError } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      announcements.value = data || []
      return { data, error: null }
    } catch (err) {
      console.error('Error fetching announcements:', err)
      error.value = 'Failed to fetch announcements'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const createAnnouncement = async (announcementData) => {
    try {
      loading.value = true
      error.value = ''

      const { data, error: createError } = await supabase
        .from('announcements')
        .insert([announcementData])
        .select()

      if (createError) throw createError

      if (data && data.length > 0) {
        announcements.value.unshift(data[0])
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error creating announcement:', err)
      error.value = 'Failed to create announcement'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const updateAnnouncement = async (id, updates) => {
    try {
      loading.value = true
      error.value = ''

      const { data, error: updateError } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select()

      if (updateError) throw updateError

      if (data && data.length > 0) {
        const index = announcements.value.findIndex(item => item.id === id)
        if (index !== -1) {
          announcements.value[index] = data[0]
        }
      }

      return { data, error: null }
    } catch (err) {
      console.error('Error updating announcement:', err)
      error.value = 'Failed to update announcement'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const deleteAnnouncement = async (id) => {
    try {
      loading.value = true
      error.value = ''

      const { error: deleteError } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // Remove from local state
      announcements.value = announcements.value.filter(item => item.id !== id)

      return { error: null }
    } catch (err) {
      console.error('Error deleting announcement:', err)
      error.value = 'Failed to delete announcement'
      return { error: err }
    } finally {
      loading.value = false
    }
  }

  // Actions for all events (announcements + approved bookings)
  const fetchAllEvents = async () => {
    try {
      loading.value = true
      error.value = ''

      // Load announcements
      const { data: announcements, error: announcementsError } = await supabase
        .from('announcements')
        .select('*')
        .order('date', { ascending: false })

      if (announcementsError) throw announcementsError

      // Load approved bookings from all tables
      const [
        { data: weddings, error: weddingError },
        { data: baptisms, error: baptismError },
        { data: funerals, error: funeralError },
        { data: thanksgivings, error: thanksgivingError },
      ] = await Promise.all([
        supabase.from('wedding_bookings').select('*').eq('is_approved', true),
        supabase.from('baptism_bookings').select('*').eq('is_approved', true),
        supabase.from('funeral_bookings').select('*').eq('is_approved', true),
        supabase.from('thanksgiving_bookings').select('*').eq('is_approved', true),
      ])

      if (weddingError) throw weddingError
      if (baptismError) throw baptismError
      if (funeralError) throw funeralError
      if (thanksgivingError) throw thanksgivingError

      const events = []

      // Process announcements
      if (announcements) {
        events.push(
          ...announcements.map((event) => ({
            ...event,
            source: 'announcement',
            event_date: event.date,
            table_name: 'announcements',
          })),
        )
      }

      // Process wedding bookings
      if (weddings) {
        events.push(
          ...weddings.map((booking) => ({
            ...booking,
            source: 'booking',
            type: 'wedding',
            event_date: booking.wedding_date,
            table_name: 'wedding_bookings',
          })),
        )
      }

      // Process baptism bookings
      if (baptisms) {
        events.push(
          ...baptisms.map((booking) => ({
            ...booking,
            source: 'booking',
            type: 'baptism',
            event_date: booking.baptism_date,
            table_name: 'baptism_bookings',
          })),
        )
      }

      // Process funeral bookings
      if (funerals) {
        events.push(
          ...funerals.map((booking) => ({
            ...booking,
            source: 'booking',
            type: 'funeral',
            event_date: booking.funeral_date,
            table_name: 'funeral_bookings',
          })),
        )
      }

      // Process thanksgiving bookings
      if (thanksgivings) {
        events.push(
          ...thanksgivings.map((booking) => ({
            ...booking,
            source: 'booking',
            type: 'thanksgiving',
            event_date: booking.thanksgiving_date,
            table_name: 'thanksgiving_bookings',
          })),
        )
      }

      // Sort by date (latest first) and then by created_at
      allEvents.value = events
        .filter((event) => event.event_date) // Only include events with dates
        .sort((a, b) => {
          const dateA = new Date(a.event_date)
          const dateB = new Date(b.event_date)
          if (dateA.getTime() === dateB.getTime()) {
            // If dates are same, sort by created_at
            return new Date(b.created_at || 0) - new Date(a.created_at || 0)
          }
          return dateB - dateA
        })

      return { data: allEvents.value, error: null }
    } catch (err) {
      console.error('Error loading all events:', err)
      error.value = 'Failed to load events'
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  const deleteEvent = async (event) => {
    try {
      loading.value = true
      error.value = ''

      const { error: deleteError } = await supabase
        .from(event.table_name)
        .delete()
        .eq('id', event.id)

      if (deleteError) throw deleteError

      // Remove from local state
      allEvents.value = allEvents.value.filter(item =>
        !(item.id === event.id && item.table_name === event.table_name)
      )

      // If it's an announcement, also remove from announcements array
      if (event.source === 'announcement') {
        announcements.value = announcements.value.filter(item => item.id !== event.id)
      }

      return { error: null }
    } catch (err) {
      console.error('Error deleting event:', err)
      error.value = 'Failed to delete event'
      return { error: err }
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = ''
  }

  // Reset store
  const $reset = () => {
    announcements.value = []
    allEvents.value = []
    loading.value = false
    error.value = ''
  }

  return {
    // State
    announcements,
    allEvents,
    loading,
    error,

    // Computed
    announcementsCount,
    eventsCount,

    // Actions
    fetchAnnouncements,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    fetchAllEvents,
    deleteEvent,
    clearError,
    $reset
  }
})
