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
          event_time: booking.funeral_time,
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
          time: '10:00', // Default time, adjust as needed
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
          time: '14:00', // Default time
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
          time: booking.funeral_time || '09:00',
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
          time: '16:00', // Default time
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
      time: event.time,
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
      .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
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
      approvalColumn = 'is_approved' // Note: wedding table uses 'is_approve' not 'is_approved'
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
        old_role: 'pending',
        new_role: 'approved_with_conflict',
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

export async function checkBookingConflicts(bookingDate, bookingTime) {
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
          const weddingTime = '10:00' // Default wedding time
          if (weddingTime === bookingTime) {
            conflicts.push({
              type: 'wedding',
              name: getBookingName({ ...booking, type: 'wedding' }),
              date: booking.wedding_date,
              time: weddingTime,
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
          const baptismTime = '14:00' // Default baptism time
          if (baptismTime === bookingTime) {
            conflicts.push({
              type: 'baptism',
              name: getBookingName({ ...booking, type: 'baptism' }),
              date: booking.baptism_date,
              time: baptismTime,
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
          const funeralTime = booking.funeral_time || '09:00'
          if (funeralTime === bookingTime) {
            conflicts.push({
              type: 'funeral',
              name: getBookingName({ ...booking, type: 'funeral' }),
              date: booking.funeral_date,
              time: funeralTime,
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
          const thanksgivingTime = '16:00' // Default thanksgiving time
          if (thanksgivingTime === bookingTime) {
            conflicts.push({
              type: 'thanksgiving',
              name: getBookingName({ ...booking, type: 'thanksgiving' }),
              date: booking.thanksgiving_date,
              time: thanksgivingTime,
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
        if (event.time === bookingTime) {
          conflicts.push({
            type: event.type || 'announcement',
            name: event.title,
            date: event.date,
            time: event.time,
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
      approvalColumn = 'is_approve' // Note: wedding table uses 'is_approve' not 'is_approved'
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
        old_role: 'pending',
        new_role: 'approved',
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

    // For denial, we could either delete the record or add a denied status
    // Since the tables use boolean fields, we'll keep them as false but could add logic later
    // For now, let's delete the booking or add a denied timestamp

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
        old_role: 'pending',
        new_role: 'denied',
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

export async function createEvent(eventData, loadDashboardData) {
  try {
    const { error } = await supabase.from('announcements').insert([
      {
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
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
        time: '10:00', // Default wedding time
        comments: booking.comments,
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
        time: '14:00', // Default baptism time
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
        funeralTime: booking.funeral_time,
        time: booking.funeral_time || '09:00',
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
        time: '16:00', // Default thanksgiving time
        attachedImages: booking.attached_images,
        contactInfo: `Contact via user: ${booking.user_id}`,
      }

    default:
      return details
  }
}
