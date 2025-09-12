import { ref, computed } from 'vue'
import { useBaptismStore } from '@/stores/baptismBookingData.js'
import { useWeddingStore } from '@/stores/weddingBookingData.js'
import { useFuneralStore } from '@/stores/funeralBookingData.js'
import { useThanksGivingStore } from '@/stores/thanksGivingBookingData.js'
import { EVENT_CATEGORIES } from '../utils/constants'

export const useCalendarFetch = () => {
  const loading = ref(false)
  const error = ref('')

  // Initialize stores
  const baptismStore = useBaptismStore()
  const weddingStore = useWeddingStore()
  const funeralStore = useFuneralStore()
  const thanksgivingStore = useThanksGivingStore()

  // Transform booking data to calendar events (VCalendar compatible)
  const transformBookingToEvent = (booking: any, category: string) => {
    const categoryConfig = EVENT_CATEGORIES[category.toUpperCase()]

    // Extract event details based on booking type
    let eventName = ''
    let eventDate = ''
    let eventTime = ''
    let eventEndTime = ''

    switch (category) {
      case 'wedding':
        eventName = `Wedding Mass - ${booking.groom_firstname} ${booking.groom_lastname} & ${booking.bride_firstname} ${booking.bride_lastname}`
        eventDate = booking.wedding_date
        eventTime = booking.starting_time
        eventEndTime = booking.ending_time
        break
      case 'baptism':
        eventName = `Baptism Mass - ${booking.child_firstname} ${booking.child_lastname}`
        eventDate = booking.baptism_date
        eventTime = booking.starting_time
        eventEndTime = booking.ending_time
        break
      case 'funeral':
        eventName = `Funeral Service - ${booking.deceased_firstname} ${booking.deceased_lastname}`
        eventDate = booking.funeral_date
        eventTime = booking.starting_time
        eventEndTime = booking.ending_time
        break
      case 'thanksgiving':
        eventName = `Thanksgiving Mass - ${booking.title} ${booking.organizer}`
        eventDate = booking.thanksgiving_date
        eventTime = booking.starting_time
        eventEndTime = booking.ending_time
        break
      default:
        eventName = 'Parish Event'
        eventDate = booking.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
        eventTime = '10:00'
        eventEndTime = '11:00'
    }

    console.warn('Processing booking:', { category, eventName, eventDate, eventTime, eventEndTime })
    // Ensure we have valid date
    if (!eventDate) {
      console.warn('No event date found for booking:', booking)
      return null
    }

    // Format date and time for calendar (vue-simple-calendar expects Date objects)
    const startDate = new Date(eventDate)
    if (eventTime) {
      const [hours, minutes] = eventTime.split(':')
      startDate.setHours(parseInt(hours), parseInt(minutes))
    }

    // End date - use ending_time if available, otherwise default to 1 hour after start
    const endDate = new Date(startDate)
    if (!eventTime) {
      // All-day events
      endDate.setDate(endDate.getDate() + 1)
    } else if (eventEndTime) {
      // Use ending_time from booking if available
      const [endHours, endMinutes] = eventEndTime.split(':')
      endDate.setHours(parseInt(endHours), parseInt(endMinutes))
    } else {
      // Add 1 hour duration for timed events (fallback)
      endDate.setHours(endDate.getHours() + 1)
    }

    // Determine status based on boolean fields
    let status = 'pending'

    console.log('Booking approval status:', {
      is_approved: booking.is_approved,
      is_denied: booking.is_denied
    })
    if (booking.is_approved) {
      status = 'approved'
    } else if (booking.is_denied) {
      status = 'denied'
    }

    // Save transformation data to localStorage for debugging and dialog access
    const transformationData = {
      category,
      eventName,
      eventDate,
      eventTime,
      eventEndTime,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      status,
      booking,
      timestamp: new Date().toISOString()
    }

    // Store in localStorage with unique key based on booking id and category
    const storageKey = `booking_transform_${category}_${booking.id}`
    try {
      localStorage.setItem(storageKey, JSON.stringify(transformationData))
      console.log('Saved transformation data to localStorage:', storageKey, transformationData)
    } catch (error) {
      console.warn('Failed to save transformation data to localStorage:', error)
    }

    console.error('Transforming booking:', { category, eventName, eventDate, eventTime, eventEndTime, startDate, endDate, status, booking })

    // vue-simple-calendar compatible event structure
    return {
      // Required fields for vue-simple-calendar
      id: `${category}_${booking.id}`,
      title: eventName,
      startDate: startDate,
      endDate: endDate,
      classes: [`event-${category}`], // CSS classes for styling

      // Custom fields for our app
      category: category,
      booking: booking, // Keep reference to original booking data
      color: categoryConfig?.color ,
      time: eventTime || null,
      allDay: !eventTime,
      status: status, // Derived from is_approved and is_denied

      // Pass detailed booking data for dialog access
      eventName: eventName,
      eventDate: eventDate,
      eventTime: eventTime,
      eventEndTime: eventEndTime,
      bookingData: {
        id: booking.id,
        category: category,
        is_approved: booking.is_approved,
        is_denied: booking.is_denied,
        status: status
      },

      // Additional metadata
      details: eventName,
      bookingId: booking.id
    }
  }

  // Computed property for combined events
  const allEvents = computed(() => {
    const events = []

    // Debug: log booking counts from each store
    console.log('Store booking counts:', {
      baptism: baptismStore.bookings.length,
      wedding: weddingStore.bookings.length,
      funeral: funeralStore.bookings.length,
      thanksgiving: thanksgivingStore.bookings.length
    })

    // Transform baptism bookings
    baptismStore.bookings.forEach(booking => {
      const event = transformBookingToEvent(booking, 'baptism')
      if (event) events.push(event)
    })

    // Transform wedding bookings
    weddingStore.bookings.forEach(booking => {
      const event = transformBookingToEvent(booking, 'wedding')
      if (event) events.push(event)
    })

    // Transform funeral bookings
    funeralStore.bookings.forEach(booking => {
      const event = transformBookingToEvent(booking, 'funeral')
      if (event) events.push(event)
    })

    // Transform thanksgiving bookings
    thanksgivingStore.bookings.forEach(booking => {
      const event = transformBookingToEvent(booking, 'thanksgiving')
      if (event) events.push(event)
    })

    console.log('Total transformed events:', events.length)
    return events.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  })

  // Fetch events from all stores
  const fetchAllEvents = async () => {
    loading.value = true
    error.value = ''

    try {
      // Fetch from all booking stores in parallel
      await Promise.all([
        baptismStore.fetchBookings(),
        weddingStore.fetchBookings(),
        funeralStore.fetchBookings(),
        thanksgivingStore.fetchBookings()
      ])

      console.log('Naka-fetch na ang tanan events para sa calendar')
      console.log('Total events created:', allEvents.value.length)

      // Debug: log first few events to check structure
      if (allEvents.value.length > 0) {
        console.log('Sample event structure:', allEvents.value[0])
      }
    } catch (err) {
      error.value = err.message || 'Error fetching calendar events'
      console.error('Error fetching calendar events:', err)
    } finally {
      loading.value = false
    }
  }

  // Get events by date range (optional filter)
  const getEventsByDateRange = (startDate: string, endDate: string) => {
    return allEvents.value.filter(event => {
      const eventDate = event.startDate
      const start = new Date(startDate)
      const end = new Date(endDate)
      return eventDate >= start && eventDate <= end
    })
  }

  // Get events by category
  const getEventsByCategory = (category: string) => {
    return allEvents.value.filter(event => event.category === category)
  }

  return {
    // State
    loading,
    error,
    allEvents,

    // Actions
    fetchAllEvents,
    getEventsByDateRange,
    getEventsByCategory
  }
}
