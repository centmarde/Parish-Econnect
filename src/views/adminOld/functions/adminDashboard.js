import { supabase } from '@/utils/supabase'
import { ref } from 'vue'

export const eventCategories = ref([
  {
    name: 'announcement',
    label: 'Announcement',
    color: '#9C27B0',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'mdi-bullhorn',
  },
  {
    name: 'mass',
    label: 'Holy Mass',
    color: '#f093fb',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    icon: 'mdi-church',
  },
  {
    name: 'event',
    label: 'Parish Event',
    color: '#43e97b',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    icon: 'mdi-calendar-star',
  },
  {
    name: 'celebration',
    label: 'Celebration',
    color: '#FF9800',
    gradient: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 52%, #2BFF88 90%)',
    icon: 'mdi-party-popper',
  },
  {
    name: 'wedding',
    label: 'Wedding',
    color: '#667eea',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: 'mdi-heart',
  },
  {
    name: 'baptism',
    label: 'Baptism',
    color: '#4facfe',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    icon: 'mdi-water',
  },
  {
    name: 'funeral',
    label: 'Funeral',
    color: '#424242',
    gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
    icon: 'mdi-cross',
  },
  {
    name: 'thanksgiving',
    label: 'Thanksgiving',
    color: '#FF5722',
    gradient: 'linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)',
    icon: 'mdi-hands-pray',
  },
])

// Helpers
export function getEventColor(type) {
  const category = eventCategories.value.find((cat) => cat.name === type)
  return category?.color || '#757575'
}

export function getEventGradient(type) {
  const category = eventCategories.value.find((cat) => cat.name === type)
  return category?.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}

// Helper function to parse time and handle conflicts
function parseTimeToMinutes(timeStr) {
  if (!timeStr) return null

  // Handle different time formats
  let cleanTime = timeStr
    .toString()
    .toLowerCase()
    .replace(/[^0-9:apm\s]/g, '')

  // If it's in HH:MM format (24-hour)
  if (cleanTime.match(/^\d{1,2}:\d{2}$/)) {
    const [hours, minutes] = cleanTime.split(':').map(Number)
    return hours * 60 + minutes
  }

  // If it's in 12-hour format with AM/PM
  const match = cleanTime.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/)
  if (match) {
    let [, hours, minutes, period] = match
    hours = parseInt(hours)
    minutes = parseInt(minutes)

    if (period === 'pm' && hours !== 12) hours += 12
    if (period === 'am' && hours === 12) hours = 0

    return hours * 60 + minutes
  }

  return null
}

function checkTimeConflict(start1, end1, start2, end2) {
  const start1Minutes = parseTimeToMinutes(start1)
  const end1Minutes = parseTimeToMinutes(end1)
  const start2Minutes = parseTimeToMinutes(start2)
  const end2Minutes = parseTimeToMinutes(end2)

  if (!start1Minutes || !end1Minutes || !start2Minutes || !end2Minutes) {
    return false // Can't determine conflict without valid times
  }

  // Check if times overlap
  return start1Minutes < end2Minutes && end1Minutes > start2Minutes
}

// Dashboard functions
export async function loadPendingBookings(pendingBookings, stats) {
  try {
    // Load from all booking tables
    const [weddingBookings, baptismBookings, funeralBookings, thanksgivingBookings] =
      await Promise.all([
        supabase.from('wedding_bookings').select('*').eq('is_approved', false),
        supabase.from('baptism_bookings').select('*').eq('is_approved', false),
        supabase.from('funeral_bookings').select('*').eq('is_approved', false),
        supabase.from('thanksgiving_bookings').select('*').eq('is_approved', false),
      ])

    const allBookings = []

    // Process wedding bookings
    if (weddingBookings.data && !weddingBookings.error) {
      allBookings.push(
        ...weddingBookings.data.map((booking) => ({
          ...booking,
          type: 'wedding',
          table: 'wedding_bookings',
          event_date: booking.wedding_date,
          status: 'pending',
          // Use database values or defaults
          starting_time: booking.starting_time || '10:00',
          ending_time: booking.ending_time || '12:00',
        })),
      )
    }

    // Process baptism bookings
    if (baptismBookings.data && !baptismBookings.error) {
      allBookings.push(
        ...baptismBookings.data.map((booking) => ({
          ...booking,
          type: 'baptism',
          table: 'baptism_bookings',
          event_date: booking.baptism_date,
          status: 'pending',
          // Use database values or defaults
          starting_time: booking.starting_time || '14:00',
          ending_time: booking.ending_time || '15:00',
        })),
      )
    }

    // Process funeral bookings
    if (funeralBookings.data && !funeralBookings.error) {
      allBookings.push(
        ...funeralBookings.data.map((booking) => ({
          ...booking,
          type: 'funeral',
          table: 'funeral_bookings',
          event_date: booking.funeral_date,
          // For funeral, use starting_time from database or funeral_time as fallback
          starting_time: booking.starting_time || booking.funeral_time || '09:00',
          ending_time: booking.ending_time || '10:00',
          status: 'pending',
        })),
      )
    }

    // Process thanksgiving bookings
    if (thanksgivingBookings.data && !thanksgivingBookings.error) {
      allBookings.push(
        ...thanksgivingBookings.data.map((booking) => ({
          ...booking,
          type: 'thanksgiving',
          table: 'thanksgiving_bookings',
          event_date: booking.thanksgiving_date,
          status: 'pending',
          // Use database values or defaults
          starting_time: booking.starting_time || '16:00',
          ending_time: booking.ending_time || '17:00',
        })),
      )
    }

    pendingBookings.value = allBookings.sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )
    stats.pendingApprovals = allBookings.length
  } catch (error) {
    console.error('Error loading pending bookings:', error)
  }
}

export async function loadEvents(events, stats) {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('date', { ascending: true })

    if (data && !error) {
      events.value = data
      stats.upcomingEvents = data.filter((e) => new Date(e.date) >= new Date()).length
    }
  } catch (error) {
    console.error('Error loading events:', error)
  }
}

export async function loadStats(stats) {
  try {
    // Get counts from all booking tables
    const [weddingCount, baptismCount, funeralCount, thanksgivingCount] = await Promise.all([
      supabase.from('wedding_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('baptism_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('funeral_bookings').select('*', { count: 'exact', head: true }),
      supabase.from('thanksgiving_bookings').select('*', { count: 'exact', head: true }),
    ])

    const totalBookings =
      (weddingCount.count || 0) +
      (baptismCount.count || 0) +
      (funeralCount.count || 0) +
      (thanksgivingCount.count || 0)

    stats.totalBookings = totalBookings
    stats.totalMembers = Math.floor(totalBookings * 1.5) // Estimated members based on bookings
  } catch (error) {
    console.error('Error loading stats:', error)
  }
}

export async function loadCalendarEvents(calendarEvents) {
  try {
    // Load approved bookings from all tables
    const [approvedWeddings, approvedBaptisms, approvedFunerals, approvedThanksgivings] =
      await Promise.all([
        supabase.from('wedding_bookings').select('*').eq('is_approved', true),
        supabase.from('baptism_bookings').select('*').eq('is_approved', true),
        supabase.from('funeral_bookings').select('*').eq('is_approved', true),
        supabase.from('thanksgiving_bookings').select('*').eq('is_approved', true),
      ])

    const events = []

    // Process wedding bookings
    if (approvedWeddings.data && !approvedWeddings.error) {
      events.push(
        ...approvedWeddings.data.map((booking) => ({
          id: `wedding-${booking.id}`,
          date: booking.wedding_date,
          starting_time: booking.starting_time || '10:00',
          ending_time: booking.ending_time || '12:00',
          title:
            booking.title || `Wedding: ${booking.bride_firstname} & ${booking.groom_firstname}`,
          location: 'Parish Church',
          type: 'wedding',
          color: getEventColor('wedding'),
          gradient: getEventGradient('wedding'),
          status: 'approved',
          booking_data: booking,
        })),
      )
    }

    // Process baptism bookings
    if (approvedBaptisms.data && !approvedBaptisms.error) {
      events.push(
        ...approvedBaptisms.data.map((booking) => ({
          id: `baptism-${booking.id}`,
          date: booking.baptism_date,
          starting_time: booking.starting_time || '14:00',
          ending_time: booking.ending_time || '15:00',
          title: `Baptism: ${booking.child_firstname} ${booking.child_lastname}`,
          location: 'Parish Church',
          type: 'baptism',
          color: getEventColor('baptism'),
          gradient: getEventGradient('baptism'),
          status: 'approved',
          booking_data: booking,
        })),
      )
    }

    // Process funeral bookings
    if (approvedFunerals.data && !approvedFunerals.error) {
      events.push(
        ...approvedFunerals.data.map((booking) => ({
          id: `funeral-${booking.id}`,
          date: booking.funeral_date,
          starting_time: booking.starting_time || booking.funeral_time || '09:00',
          ending_time: booking.ending_time || '10:00',
          title: `Funeral: ${booking.deceased_firstname} ${booking.deceased_lastname}`,
          location: 'Parish Church',
          type: 'funeral',
          color: getEventColor('funeral'),
          gradient: getEventGradient('funeral'),
          status: 'approved',
          booking_data: booking,
        })),
      )
    }

    // Process thanksgiving bookings
    if (approvedThanksgivings.data && !approvedThanksgivings.error) {
      events.push(
        ...approvedThanksgivings.data.map((booking) => ({
          id: `thanksgiving-${booking.id}`,
          date: booking.thanksgiving_date,
          starting_time: booking.starting_time || '16:00',
          ending_time: booking.ending_time || '17:00',
          title: `Thanksgiving: ${booking.participant_firstname} ${booking.participant_lastname}`,
          location: 'Parish Church',
          type: 'thanksgiving',
          color: getEventColor('thanksgiving'),
          gradient: getEventGradient('thanksgiving'),
          status: 'approved',
          booking_data: booking,
        })),
      )
    }

    // Load announcements/parish events
    const { data: announcements } = await supabase.from('announcements').select('*')
    const announcementEvents = (announcements || []).map((event) => ({
      id: `announcement-${event.id}`,
      date: event.date,
      starting_time: event.starting_time,
      ending_time: event.ending_time,
      title: event.title,
      location: 'Parish',
      type: event.type || 'announcement',
      color: getEventColor(event.type || 'announcement'),
      gradient: getEventGradient(event.type || 'announcement'),
      status: 'confirmed',
      description: event.description,
    }))

    calendarEvents.value = [...events, ...announcementEvents]
      .filter((event) => event.date) // Filter out events without dates
      .sort(
        (a, b) =>
          new Date(`${a.date} ${a.starting_time}`) - new Date(`${b.date} ${b.starting_time}`),
      )
  } catch (error) {
    console.error('Error loading calendar events:', error)
  }
}

export async function loadRecentActivities(recentActivities) {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('changed_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      recentActivities.value = data.map((activity) => {
        let icon = 'mdi-history'
        let color = 'grey'
        if (activity.action.includes('Approved') || activity.action.includes('approved')) {
          icon = 'mdi-check-circle'
          color = 'green'
        } else if (activity.action.includes('Denied') || activity.action.includes('denied')) {
          icon = 'mdi-close-circle'
          color = 'red'
        } else if (activity.action.includes('Created') || activity.action.includes('created')) {
          icon = 'mdi-plus-circle'
          color = 'blue'
        }
        return { ...activity, icon, color }
      })
    }
  } catch (error) {
    console.error('Error loading recent activities:', error)
  }
}

export async function forceApproveBooking(booking, loadDashboardData) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Determine the correct approval column based on booking type
    let approvalColumn = 'is_approved'
    if (booking.type === 'wedding') {
      approvalColumn = 'is_approved' // Note: wedding table uses 'is_approved'
    }

    const { error } = await supabase
      .from(booking.table)
      .update({
        [approvalColumn]: true,
        // Add timestamp fields if they exist
        ...(booking.table !== 'wedding_bookings' && { approved_at: new Date().toISOString() }),
        ...(booking.table !== 'wedding_bookings' && { approved_by: user.id }),
      })
      .eq('id', booking.id)

    if (error) throw error

    // Log the force approval action with conflict note
    await supabase.from('audit_logs').insert([
      {
        action: `Force approved ${booking.type} booking for ${getBookingName(booking)} despite conflicts`,
        user_id: user.id,
        table_name: booking.table,
        record_id: booking.id,
        old_data: { is_approved: false },
        new_data: { is_approved: true },
        changed_at: new Date().toISOString(),
      },
    ])

    await loadDashboardData()
    return { success: true }
  } catch (error) {
    console.error('Error force approving booking:', error)
    return { error }
  }
}

export async function checkBookingConflicts(bookingDate, bookingStartTime, bookingEndTime) {
  try {
    // Check all approved bookings for conflicts
    const [approvedWeddings, approvedBaptisms, approvedFunerals, approvedThanksgivings] =
      await Promise.all([
        supabase.from('wedding_bookings').select('*').eq('is_approved', true),
        supabase.from('baptism_bookings').select('*').eq('is_approved', true),
        supabase.from('funeral_bookings').select('*').eq('is_approved', true),
        supabase.from('thanksgiving_bookings').select('*').eq('is_approved', true),
      ])

    const conflicts = []

    // Check wedding conflicts
    if (approvedWeddings.data) {
      approvedWeddings.data.forEach((booking) => {
        if (booking.wedding_date === bookingDate) {
          const weddingStartTime = booking.starting_time || '10:00'
          const weddingEndTime = booking.ending_time || '12:00'

          if (
            checkTimeConflict(bookingStartTime, bookingEndTime, weddingStartTime, weddingEndTime)
          ) {
            conflicts.push({
              type: 'wedding',
              name: getBookingName({ ...booking, type: 'wedding' }),
              date: booking.wedding_date,
              starting_time: weddingStartTime,
              ending_time: weddingEndTime,
              id: booking.id,
            })
          }
        }
      })
    }

    // Check baptism conflicts
    if (approvedBaptisms.data) {
      approvedBaptisms.data.forEach((booking) => {
        if (booking.baptism_date === bookingDate) {
          const baptismStartTime = booking.starting_time || '14:00'
          const baptismEndTime = booking.ending_time || '15:00'

          if (
            checkTimeConflict(bookingStartTime, bookingEndTime, baptismStartTime, baptismEndTime)
          ) {
            conflicts.push({
              type: 'baptism',
              name: getBookingName({ ...booking, type: 'baptism' }),
              date: booking.baptism_date,
              starting_time: baptismStartTime,
              ending_time: baptismEndTime,
              id: booking.id,
            })
          }
        }
      })
    }

    // Check funeral conflicts
    if (approvedFunerals.data) {
      approvedFunerals.data.forEach((booking) => {
        if (booking.funeral_date === bookingDate) {
          const funeralStartTime = booking.starting_time || booking.funeral_time || '09:00'
          const funeralEndTime = booking.ending_time || '10:00'

          if (
            checkTimeConflict(bookingStartTime, bookingEndTime, funeralStartTime, funeralEndTime)
          ) {
            conflicts.push({
              type: 'funeral',
              name: getBookingName({ ...booking, type: 'funeral' }),
              date: booking.funeral_date,
              starting_time: funeralStartTime,
              ending_time: funeralEndTime,
              id: booking.id,
            })
          }
        }
      })
    }

    // Check thanksgiving conflicts
    if (approvedThanksgivings.data) {
      approvedThanksgivings.data.forEach((booking) => {
        if (booking.thanksgiving_date === bookingDate) {
          const thanksgivingStartTime = booking.starting_time || '16:00'
          const thanksgivingEndTime = booking.ending_time || '17:00'

          if (
            checkTimeConflict(
              bookingStartTime,
              bookingEndTime,
              thanksgivingStartTime,
              thanksgivingEndTime,
            )
          ) {
            conflicts.push({
              type: 'thanksgiving',
              name: getBookingName({ ...booking, type: 'thanksgiving' }),
              date: booking.thanksgiving_date,
              starting_time: thanksgivingStartTime,
              ending_time: thanksgivingEndTime,
              id: booking.id,
            })
          }
        }
      })
    }

    // Check announcements/events conflicts
    const { data: announcements } = await supabase
      .from('announcements')
      .select('*')
      .eq('date', bookingDate)

    if (announcements) {
      announcements.forEach((event) => {
        const eventStartTime = event.starting_time
        const eventEndTime = event.ending_time

        if (
          eventStartTime &&
          eventEndTime &&
          checkTimeConflict(bookingStartTime, bookingEndTime, eventStartTime, eventEndTime)
        ) {
          conflicts.push({
            type: event.type || 'announcement',
            name: event.title,
            date: event.date,
            starting_time: eventStartTime,
            ending_time: eventEndTime,
            id: event.id,
          })
        }
      })
    }

    return conflicts
  } catch (error) {
    console.error('Error checking booking conflicts:', error)
    return []
  }
}

export async function approveBooking(booking, loadDashboardData) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    // Determine the correct approval column based on booking type
    let approvalColumn = 'is_approved'
    if (booking.type === 'wedding') {
      approvalColumn = 'is_approved' // Note: wedding table uses 'is_approved'
    }

    const { error } = await supabase
      .from(booking.table)
      .update({
        [approvalColumn]: true,
        // Add timestamp fields if they exist
        ...(booking.table !== 'wedding_bookings' && { approved_at: new Date().toISOString() }),
        ...(booking.table !== 'wedding_bookings' && { approved_by: user.id }),
      })
      .eq('id', booking.id)

    if (error) throw error

    // Log the approval action
    await supabase.from('audit_logs').insert([
      {
        action: `Approved ${booking.type} booking for ${getBookingName(booking)}`,
        user_id: user.id,
        table_name: booking.table,
        record_id: booking.id,
        old_data: { is_approved: false },
        new_data: { is_approved: true },
        changed_at: new Date().toISOString(),
      },
    ])

    await loadDashboardData()
    return { success: true }
  } catch (error) {
    console.error('Error approving booking:', error)
    return { error }
  }
}

export async function denyBooking(booking, loadDashboardData) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    const updates = {
      // Keep the approval as false but add denial info
      ...(booking.table !== 'wedding_bookings' && { denied_at: new Date().toISOString() }),
      ...(booking.table !== 'wedding_bookings' && { denied_by: user.id }),
    }

    const { error } = await supabase.from(booking.table).update(updates).eq('id', booking.id)

    if (error) throw error

    await supabase.from('audit_logs').insert([
      {
        action: `Denied ${booking.type} booking for ${getBookingName(booking)}`,
        user_id: user.id,
        table_name: booking.table,
        record_id: booking.id,
        old_data: { is_approved: false },
        new_data: { is_denied: true },
        changed_at: new Date().toISOString(),
      },
    ])

    await loadDashboardData()
    return { success: true }
  } catch (error) {
    console.error('Error denying booking:', error)
    return { error }
  }
}

export async function denyBookingWithComment(booking, denialComment, loadDashboardData) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError) throw userError

    const updates = {
      is_denied: true,
      comment: denialComment,
      denied_at: new Date().toISOString(),
      denied_by: user.id,
    }

    const { error } = await supabase.from(booking.table).update(updates).eq('id', booking.id)

    if (error) throw error

    await supabase.from('audit_logs').insert([
      {
        action: `Denied ${booking.type} booking for ${getBookingName(booking)} with comment: "${denialComment}"`,
        user_id: user.id,
        table_name: booking.table,
        record_id: booking.id,
        old_data: { is_approved: false, is_denied: false },
        new_data: { is_approved: false, is_denied: true, comment: denialComment },
        changed_at: new Date().toISOString(),
      },
    ])

    // Send notification to user about denial
    await supabase.from('notifications').insert([
      {
        user_id: booking.user_id,
        title: `${booking.type.charAt(0).toUpperCase() + booking.type.slice(1)} Booking Denied`,
        message: `Your ${booking.type} booking has been denied. Reason: ${denialComment}`,
        color: 'error',
        icon: 'mdi-close-circle',
        is_read: false,
      },
    ])

    await loadDashboardData()
    return { success: true }
  } catch (error) {
    console.error('Error denying booking with comment:', error)
    return { error }
  }
}

// Function to get attached images for a booking
export function getBookingAttachedImages(booking) {
  const images = []

  switch (booking.type) {
    case 'wedding':
      if (booking.attached_images_1) images.push(booking.attached_images_1)
      if (booking.attached_images_2) images.push(booking.attached_images_2)
      if (booking.attached_images_3) images.push(booking.attached_images_3)
      break
    case 'baptism':
    case 'funeral':
    case 'thanksgiving':
      if (booking.attached_images) images.push(booking.attached_images)
      break
  }

  return images.filter((img) => img && img.trim() !== '')
}

export async function createEvent(eventData, loadDashboardData) {
  try {
    const { error } = await supabase.from('announcements').insert([
      {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        starting_time: eventData.starting_time,
        ending_time: eventData.ending_time,
        type: eventData.type,
        created_at: new Date().toISOString(),
      },
    ])

    if (!error) {
      await loadDashboardData()
      return { success: true }
    } else {
      return { error }
    }
  } catch (error) {
    console.error('Error creating event:', error)
    return { error }
  }
}

// Helper function to get booking name for different types
function getBookingName(booking) {
  switch (booking.type) {
    case 'wedding':
      return `${booking.bride_firstname || ''} & ${booking.groom_firstname || ''}`.trim()
    case 'baptism':
      return `${booking.child_firstname} ${booking.child_lastname}`
    case 'funeral':
      return `${booking.deceased_firstname} ${booking.deceased_lastname}`
    case 'thanksgiving':
      return `${booking.participant_firstname} ${booking.participant_lastname}`
    default:
      return 'Unknown'
  }
}

export function getBookingDetails(booking) {
  const details = {
    id: booking.id,
    type: booking.type,
    table: booking.table,
    name: getBookingName(booking),
    createdAt: booking.created_at,
    status: booking.status || 'pending',
  }

  switch (booking.type) {
    case 'wedding':
      return {
        ...details,
        brideFirstName: booking.bride_firstname,
        brideLastName: booking.bride_lastname,
        groomFirstName: booking.groom_firstname,
        groomLastName: booking.groom_lastname,
        title: booking.title,
        weddingDate: booking.wedding_date,
        starting_time: booking.starting_time || '10:00',
        ending_time: booking.ending_time || '12:00',
        comments: booking.comment,
        attachedImages: booking.attached_images,
        contactInfo: `Contact via user: ${booking.user_id}`,
      }

    case 'baptism':
      return {
        ...details,
        childFirstName: booking.child_firstname,
        childLastName: booking.child_lastname,
        childDOB: booking.child_dob,
        parentFatherFirstName: booking.parent_father_firstname,
        parentFatherLastName: booking.parent_father_lastname,
        parentMotherFirstName: booking.parent_mother_firstname,
        parentMotherLastName: booking.parent_mother_lastname,
        godparentFirstName: booking.godparent_firstname,
        godparentLastName: booking.godparent_lastname,
        baptismDate: booking.baptism_date,
        starting_time: booking.starting_time || '14:00',
        ending_time: booking.ending_time || '15:00',
        additionalNotes: booking.additional_notes,
        attachedImages: booking.attached_images,
        contactInfo: `Contact via user: ${booking.user_id}`,
      }

    case 'funeral':
      return {
        ...details,
        deceasedFirstName: booking.deceased_firstname,
        deceasedLastName: booking.deceased_lastname,
        deceasedDOB: booking.deceased_dob,
        deceasedDOD: booking.deceased_dod,
        contactFirstName: booking.contact_firstname,
        contactLastName: booking.contact_lastname,
        contactPhone: booking.contact_phone,
        contactEmail: booking.contact_email,
        relationshipToDeceased: booking.relationship_to_deceased,
        funeralDate: booking.funeral_date,
        starting_time: booking.starting_time || booking.funeral_time || '09:00',
        ending_time: booking.ending_time || '10:00',
        attachedImages: booking.attached_images,
        contactInfo: `${booking.contact_phone || ''} ${booking.contact_email || ''}`.trim(),
      }

    case 'thanksgiving':
      return {
        ...details,
        participantFirstName: booking.participant_firstname,
        participantLastName: booking.participant_lastname,
        typeOfThanksgiving: booking.type_of_thanksgiving,
        reasonForThanksgiving: booking.reason_for_thanksgiving,
        familyMembersCount: booking.family_members_count,
        thanksgivingDate: booking.thanksgiving_date,
        starting_time: booking.starting_time || '16:00',
        ending_time: booking.ending_time || '17:00',
        attachedImages: booking.attached_images,
        contactInfo: `Contact via user: ${booking.user_id}`,
      }

    default:
      return details
  }
}
