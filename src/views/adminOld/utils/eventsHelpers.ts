// Events Helper Functions and Constants
// Mga reusable functions para sa events management

export interface EventCategory {
  name: string
  label: string
  color: string
  icon: string
}

export interface Event {
  id?: number
  title?: string
  description?: string
  date?: string
  event_date?: string
  starting_time?: string
  ending_time?: string
  type?: string
  source?: 'announcement' | 'booking'
  table_name?: string
  created_at?: string
  bride_firstname?: string
  bride_lastname?: string
  groom_firstname?: string
  groom_lastname?: string
  child_firstname?: string
  child_lastname?: string
  deceased_firstname?: string
  deceased_lastname?: string
  participant_firstname?: string
  participant_lastname?: string
  additional_notes?: string
  comment?: string
  reason_for_thanksgiving?: string
}

export interface EditForm {
  title: string
  description: string
  date: string
  starting_time: string
  ending_time: string
  type: string
}

// Event categories constants
export const eventCategories: EventCategory[] = [
  { name: 'announcement', label: 'Announcement', color: '#9C27B0', icon: 'mdi-bullhorn' },
  { name: 'meeting', label: 'Meeting', color: '#9C27B0', icon: 'mdi-bullhorn' },
  { name: 'mass', label: 'Holy Mass', color: '#f093fb', icon: 'mdi-church' },
  { name: 'event', label: 'Parish Event', color: '#43e97b', icon: 'mdi-calendar-star' },
  { name: 'celebration', label: 'Celebration', color: '#FF9800', icon: 'mdi-party-popper' },
  { name: 'wedding', label: 'Wedding', color: '#667eea', icon: 'mdi-heart' },
  { name: 'baptism', label: 'Baptism', color: '#4facfe', icon: 'mdi-water' },
  { name: 'funeral', label: 'Funeral', color: '#424242', icon: 'mdi-cross' },
  { name: 'thanksgiving', label: 'Thanksgiving', color: '#FF5722', icon: 'mdi-hands-pray' },
]

// Default edit form structure
export const defaultEditForm: EditForm = {
  title: '',
  description: '',
  date: '',
  starting_time: '',
  ending_time: '',
  type: 'announcement',
}

// Helper function para kumuha ng event color
export const getEventColor = (type: string): string => {
  const category = eventCategories.find((cat) => cat.name === type)
  return category?.color || '#757575'
}

// Helper function para kumuha ng event icon
export const getEventIcon = (type: string): string => {
  const category = eventCategories.find((cat) => cat.name === type)
  return category?.icon || 'mdi-calendar'
}

// Helper function para format ang event title
export const formatEventTitle = (event: Event): string => {
  if (!event) return ''

  if (event.source === 'announcement') {
    return event.title || ''
  }

  // Format booking titles based on type
  switch (event.type) {
    case 'wedding':
      return `Wedding: ${event.bride_firstname || ''} ${event.bride_lastname || ''} & ${event.groom_firstname || ''} ${event.groom_lastname || ''}`
    case 'baptism':
      return `Baptism: ${event.child_firstname || ''} ${event.child_lastname || ''}`
    case 'funeral':
      return `Funeral Service: ${event.deceased_firstname || ''} ${event.deceased_lastname || ''}`
    case 'thanksgiving':
      return `Thanksgiving: ${event.participant_firstname || ''} ${event.participant_lastname || ''}`
    default:
      return event.title || 'Event'
  }
}

// Helper function para format ang event description
export const formatEventDescription = (event: Event): string => {
  if (!event) return 'No description available'

  if (event.source === 'announcement') {
    return event.description || 'No description provided'
  }

  // Generate descriptions for bookings
  switch (event.type) {
    case 'wedding':
      return (
        event.title ||
        `Wedding ceremony for ${event.bride_firstname || ''} and ${event.groom_firstname || ''}`
      )
    case 'baptism':
      return (
        event.additional_notes ||
        `Baptism ceremony for ${event.child_firstname || ''} ${event.child_lastname || ''}`
      )
    case 'funeral':
      return (
        event.comment ||
        `Funeral service for ${event.deceased_firstname || ''} ${event.deceased_lastname || ''}`
      )
    case 'thanksgiving':
      return (
        event.reason_for_thanksgiving ||
        `Thanksgiving service for ${event.participant_firstname || ''} ${event.participant_lastname || ''}`
      )
    default:
      return 'No description available'
  }
}

// Helper function para format ang time
export const formatTime = (time: string): string => {
  if (!time) return 'Time not set'

  // Handle both time formats
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return time
}

// Helper function para check kung nag pass na ang event
export const isEventPassed = (eventDate: string): boolean => {
  return new Date(eventDate) < new Date()
}

// Helper function para create ang event type options para sa dropdown
export const getEventTypeOptions = () => [
  { value: 'all', title: 'All Events' },
  ...eventCategories.map((cat) => ({ value: cat.name, title: cat.label })),
]

// Helper function para filter ang events based on type at search query
export const filterEvents = (
  events: Event[],
  filterType: string,
  searchQuery: string
): Event[] => {
  let filtered = events

  // Filter by type
  if (filterType !== 'all') {
    filtered = filtered.filter((event) => event.type === filterType)
  }

  // Filter by search query
  if (searchQuery) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (event) =>
        formatEventTitle(event).toLowerCase().includes(query) ||
        formatEventDescription(event).toLowerCase().includes(query),
    )
  }

  return filtered
}
