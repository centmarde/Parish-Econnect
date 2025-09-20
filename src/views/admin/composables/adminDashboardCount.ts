import { ref, computed } from 'vue'
import { useAuthAdminStore } from '@/stores/authAdmin.js'
import { useWeddingStore } from '@/stores/weddingBookingData.js'
import { useBaptismStore } from '@/stores/baptismBookingData.js'
import { useFuneralStore } from '@/stores/funeralBookingData.js'
import { useThanksGivingStore } from '@/stores/thanksGivingBookingData.js'
import { useAnnouncementsStore } from '@/stores/announcementData.js'
import { supabase } from '@/utils/supabase.js'

export interface DashboardStats {
  totalBookings: number
  pendingApprovals: number
  upcomingEvents: number
  totalMembers: number
}

export interface DashboardTrends {
  totalBookings: number | { value: number; urgent?: number; next?: string }
  pendingApprovals: number | { urgent: number }
  upcomingEvents: number | { next: string }
  totalMembers: number | { value: number }
}

interface SupabaseAuthUser {
  id: string
  email: string
  created_at: string
  updated_at: string
  [key: string]: any
}

export function useAdminDashboard() {
  // Store instances
  const authAdminStore = useAuthAdminStore()
  const weddingStore = useWeddingStore()
  const baptismStore = useBaptismStore()
  const funeralStore = useFuneralStore()
  const thanksgivingStore = useThanksGivingStore()
  const announcementsStore = useAnnouncementsStore()

  // Reactive state
  const stats = ref<DashboardStats>({
    totalBookings: 0,
    pendingApprovals: 0,
    upcomingEvents: 0,
    totalMembers: 0,
  })

  const statsTrends = ref<DashboardTrends>({
    totalBookings: 0,
    pendingApprovals: 0,
    upcomingEvents: { next: '' },
    totalMembers: 0,
  })

  const loading = ref(false)
  const error = ref<string | null>(null)

  // Count total bookings across all booking types
  const countTotalBookings = async (): Promise<number> => {
    try {
      const [weddingResult, baptismResult, funeralResult, thanksgivingResult] = await Promise.all([
        supabase.from('wedding_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('baptism_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('funeral_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('thanksgiving_bookings').select('*', { count: 'exact', head: true }),
      ])

      const totalBookings =
        (weddingResult.count || 0) +
        (baptismResult.count || 0) +
        (funeralResult.count || 0) +
        (thanksgivingResult.count || 0)

      return totalBookings
    } catch (err) {
      console.error('Error counting total bookings:', err)
      return 0
    }
  }

  // Count pending approvals across all booking types
  const countPendingApprovals = async (): Promise<{ total: number; urgent: number }> => {
    try {
      const currentDate = new Date()
      const urgentThreshold = new Date()
      urgentThreshold.setDate(currentDate.getDate() + 7) // Consider urgent if within 7 days

      const [weddingResult, baptismResult, funeralResult, thanksgivingResult] = await Promise.all([
        supabase
          .from('wedding_bookings')
          .select('wedding_date')
          .eq('is_approved', false)
          .neq('is_denied', true),
        supabase
          .from('baptism_bookings')
          .select('baptism_date')
          .eq('is_approved', false)
          .neq('is_denied', true),
        supabase
          .from('funeral_bookings')
          .select('funeral_date')
          .eq('is_approved', false)
          .neq('is_denied', true),
        supabase
          .from('thanksgiving_bookings')
          .select('thanksgiving_date')
          .eq('is_approved', false)
          .neq('is_denied', true),
      ])

      let total = 0
      let urgent = 0

      // Count wedding bookings
      if (weddingResult.data) {
        total += weddingResult.data.length
        urgent += weddingResult.data.filter(booking =>
          booking.wedding_date && new Date(booking.wedding_date) <= urgentThreshold
        ).length
      }

      // Count baptism bookings
      if (baptismResult.data) {
        total += baptismResult.data.length
        urgent += baptismResult.data.filter(booking =>
          booking.baptism_date && new Date(booking.baptism_date) <= urgentThreshold
        ).length
      }

      // Count funeral bookings
      if (funeralResult.data) {
        total += funeralResult.data.length
        urgent += funeralResult.data.filter(booking =>
          booking.funeral_date && new Date(booking.funeral_date) <= urgentThreshold
        ).length
      }

      // Count thanksgiving bookings
      if (thanksgivingResult.data) {
        total += thanksgivingResult.data.length
        urgent += thanksgivingResult.data.filter(booking =>
          booking.thanksgiving_date && new Date(booking.thanksgiving_date) <= urgentThreshold
        ).length
      }

      return { total, urgent }
    } catch (err) {
      console.error('Error counting pending approvals:', err)
      return { total: 0, urgent: 0 }
    }
  }

  // Count upcoming events (approved bookings + announcements)
  const countUpcomingEvents = async (): Promise<{ total: number; nextEvent: string | null }> => {
    try {
      const currentDate = new Date().toISOString().split('T')[0]

      const [approvedWeddings, approvedBaptisms, approvedFunerals, approvedThanksgivings, announcements] = await Promise.all([
        supabase
          .from('wedding_bookings')
          .select('*')
          .eq('is_approved', true)
          .gte('wedding_date', currentDate)
          .order('wedding_date', { ascending: true }),
        supabase
          .from('baptism_bookings')
          .select('*')
          .eq('is_approved', true)
          .gte('baptism_date', currentDate)
          .order('baptism_date', { ascending: true }),
        supabase
          .from('funeral_bookings')
          .select('*')
          .eq('is_approved', true)
          .gte('funeral_date', currentDate)
          .order('funeral_date', { ascending: true }),
        supabase
          .from('thanksgiving_bookings')
          .select('*')
          .eq('is_approved', true)
          .gte('thanksgiving_date', currentDate)
          .order('thanksgiving_date', { ascending: true }),
        supabase
          .from('announcements')
          .select('*')
          .gte('date', currentDate)
          .order('date', { ascending: true })
      ])

      const allUpcomingEvents = []

      // Collect all events with their dates
      if (approvedWeddings.data) {
        allUpcomingEvents.push(...approvedWeddings.data.map(event => ({
          date: event.wedding_date,
          title: `Wedding: ${event.bride_firstname} & ${event.groom_firstname}`
        })))
      }

      if (approvedBaptisms.data) {
        allUpcomingEvents.push(...approvedBaptisms.data.map(event => ({
          date: event.baptism_date,
          title: `Baptism: ${event.child_firstname} ${event.child_lastname}`
        })))
      }

      if (approvedFunerals.data) {
        allUpcomingEvents.push(...approvedFunerals.data.map(event => ({
          date: event.funeral_date,
          title: `Funeral: ${event.deceased_firstname} ${event.deceased_lastname}`
        })))
      }

      if (approvedThanksgivings.data) {
        allUpcomingEvents.push(...approvedThanksgivings.data.map(event => ({
          date: event.thanksgiving_date,
          title: `Thanksgiving: ${event.title} ${event.organizer}`
        })))
      }

      if (announcements.data) {
        allUpcomingEvents.push(...announcements.data.map(event => ({
          date: event.date,
          title: event.title
        })))
      }

      // Sort by date and get the next event
      const sortedEvents = allUpcomingEvents
        .filter(event => event.date)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const nextEvent = sortedEvents.length > 0 ? sortedEvents[0].title : null

      return { total: sortedEvents.length, nextEvent }
    } catch (err) {
      console.error('Error counting upcoming events:', err)
      return { total: 0, nextEvent: null }
    }
  }

  // Count total parish members (from users table)
  const countTotalMembers = async (): Promise<{ total: number; newMembers: number }> => {
    try {
      // Get total users
      const usersResult = await authAdminStore.listAllUsers()
      const totalUsers = usersResult.success ? usersResult.data?.length || 0 : 0

      // Count new members (registered in last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const newMembers = usersResult.success && usersResult.data
        ? (usersResult.data as SupabaseAuthUser[]).filter((user: SupabaseAuthUser) =>
            user.created_at && new Date(user.created_at) > thirtyDaysAgo
          ).length
        : 0

      return { total: totalUsers, newMembers }
    } catch (err) {
      console.error('Error counting total members:', err)
      return { total: 0, newMembers: 0 }
    }
  }

  // Calculate trend percentages (comparing last 30 days vs previous 30 days)
  const calculateTrends = async () => {
    try {
      const now = new Date()
      const thirtyDaysAgo = new Date()
      const sixtyDaysAgo = new Date()

      thirtyDaysAgo.setDate(now.getDate() - 30)
      sixtyDaysAgo.setDate(now.getDate() - 60)

      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]
      const sixtyDaysAgoStr = sixtyDaysAgo.toISOString().split('T')[0]

      // Get bookings from last 30 days vs previous 30 days
      const [recentBookings, previousBookings] = await Promise.all([
        Promise.all([
          supabase.from('wedding_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
          supabase.from('baptism_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
          supabase.from('funeral_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
          supabase.from('thanksgiving_bookings').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgoStr),
        ]),
        Promise.all([
          supabase.from('wedding_bookings').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgoStr).lt('created_at', thirtyDaysAgoStr),
          supabase.from('baptism_bookings').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgoStr).lt('created_at', thirtyDaysAgoStr),
          supabase.from('funeral_bookings').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgoStr).lt('created_at', thirtyDaysAgoStr),
          supabase.from('thanksgiving_bookings').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgoStr).lt('created_at', thirtyDaysAgoStr),
        ])
      ])

      const recentCount = recentBookings.reduce((sum, result) => sum + (result.count || 0), 0)
      const previousCount = previousBookings.reduce((sum, result) => sum + (result.count || 0), 0)

      const bookingsTrend = previousCount > 0 ? Math.round(((recentCount - previousCount) / previousCount) * 100) : 0

      return { bookingsTrend }
    } catch (err) {
      console.error('Error calculating trends:', err)
      return { bookingsTrend: 0 }
    }
  }

  // Main function to load all dashboard data
  const loadDashboardData = async (): Promise<void> => {
    loading.value = true
    error.value = null

    try {
      const [
        totalBookings,
        pendingData,
        upcomingData,
        membersData,
        trendsData
      ] = await Promise.all([
        countTotalBookings(),
        countPendingApprovals(),
        countUpcomingEvents(),
        countTotalMembers(),
        calculateTrends()
      ])

      // Update stats
      stats.value = {
        totalBookings,
        pendingApprovals: pendingData.total,
        upcomingEvents: upcomingData.total,
        totalMembers: membersData.total,
      }

      // Update trends with enhanced information
      statsTrends.value = {
        totalBookings: trendsData.bookingsTrend,
        pendingApprovals: pendingData.urgent > 0 ? { urgent: pendingData.urgent } : 0,
        upcomingEvents: upcomingData.nextEvent ? { next: upcomingData.nextEvent } : 0,
        totalMembers: membersData.newMembers > 0 ? { value: membersData.newMembers } : 0,
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err)
      error.value = 'Failed to load dashboard data'
    } finally {
      loading.value = false
    }
  }

  // Computed properties for easy access
  const dashboardStats = computed(() => stats.value)
  const dashboardTrends = computed(() => statsTrends.value)
  const isLoading = computed(() => loading.value)
  const dashboardError = computed(() => error.value)

  // Individual count functions for specific use cases
  const getBookingTypeCount = async (type: 'wedding' | 'baptism' | 'funeral' | 'thanksgiving'): Promise<number> => {
    try {
      const { count } = await supabase
        .from(`${type}_bookings`)
        .select('*', { count: 'exact', head: true })

      return count || 0
    } catch (err) {
      console.error(`Error counting ${type} bookings:`, err)
      return 0
    }
  }

  const getPendingBookingsByType = async (type: 'wedding' | 'baptism' | 'funeral' | 'thanksgiving'): Promise<number> => {
    try {
      const { count } = await supabase
        .from(`${type}_bookings`)
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)
        .neq('is_denied', true)

      return count || 0
    } catch (err) {
      console.error(`Error counting pending ${type} bookings:`, err)
      return 0
    }
  }

  return {
    // Reactive state
    stats: dashboardStats,
    statsTrends: dashboardTrends,
    loading: isLoading,
    error: dashboardError,

    // Main functions
    loadDashboardData,

    // Individual count functions
    countTotalBookings,
    countPendingApprovals,
    countUpcomingEvents,
    countTotalMembers,
    getBookingTypeCount,
    getPendingBookingsByType,
    calculateTrends,

    // Store instances (if needed for other operations)
    authAdminStore,
    weddingStore,
    baptismStore,
    funeralStore,
    thanksgivingStore,
    announcementsStore,
  }
}
