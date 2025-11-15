import { ref } from 'vue'
import { supabase } from '@/utils/supabase.js'

/**
 * Get current month's booking counts for all booking types
 */
export async function getCurrentMonthBookingCounts() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const startDate = `${year}-${month}-01`

  // Calculate last day of current month
  const nextMonth = new Date(year, now.getMonth() + 1, 1)
  const lastDay = new Date(nextMonth - 1)
  const endDate = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`

  try {
    // Fetch counts for each booking type in parallel
    const [baptismRes, weddingRes, funeralRes, thanksgivingRes, othersRes] = await Promise.all([
      supabase
        .from('baptism_bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59'),

      supabase
        .from('wedding_bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59'),

      supabase
        .from('funeral_bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59'),

      supabase
        .from('thanksgiving_bookings')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59'),

      supabase
        .from('others')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', startDate)
        .lte('created_at', endDate + 'T23:59:59')
    ])

    return {
      baptism: baptismRes.count || 0,
      wedding: weddingRes.count || 0,
      funeral: funeralRes.count || 0,
      thanksgiving: thanksgivingRes.count || 0,
      others: othersRes.count || 0,
      error: null
    }
  } catch (error) {
    console.error('Error fetching booking counts:', error)
    return {
      baptism: 0,
      wedding: 0,
      funeral: 0,
      thanksgiving: 0,
      others: 0,
      error: error.message
    }
  }
}

/**
 * Get booking trends for the last 6 months
 */
export async function getBookingTrends(monthsBack = 6) {
  const results = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const startDate = `${year}-${month}-01`

    // Calculate last day of month
    const nextMonth = new Date(year, date.getMonth() + 1, 1)
    const lastDay = new Date(nextMonth - 1)
    const endDate = `${year}-${month}-${String(lastDay.getDate()).padStart(2, '0')}`

    try {
      const [baptismRes, weddingRes, funeralRes, thanksgivingRes, othersRes] = await Promise.all([
        supabase
          .from('baptism_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),

        supabase
          .from('wedding_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),

        supabase
          .from('funeral_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),

        supabase
          .from('thanksgiving_bookings')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59'),

        supabase
          .from('others')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', startDate)
          .lte('created_at', endDate + 'T23:59:59')
      ])

      results.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        baptism: baptismRes.count || 0,
        wedding: weddingRes.count || 0,
        funeral: funeralRes.count || 0,
        thanksgiving: thanksgivingRes.count || 0,
        others: othersRes.count || 0
      })
    } catch (error) {
      console.error(`Error fetching trends for ${year}-${month}:`, error)
      results.push({
        month: date.toLocaleString('default', { month: 'short', year: 'numeric' }),
        baptism: 0,
        wedding: 0,
        funeral: 0,
        thanksgiving: 0,
        others: 0
      })
    }
  }

  return results
}

/**
 * Composable for booking statistics
 */
export function useBookingStats() {
  const currentMonthCounts = ref({
    baptism: 0,
    wedding: 0,
    funeral: 0,
    thanksgiving: 0,
    others: 0
  })

  const trendData = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function loadCurrentMonthStats() {
    loading.value = true
    error.value = null

    try {
      const counts = await getCurrentMonthBookingCounts()
      if (counts.error) {
        error.value = counts.error
      } else {
        currentMonthCounts.value = counts
      }
    } catch (err) {
      error.value = err.message
      console.error('Error loading current month stats:', err)
    } finally {
      loading.value = false
    }
  }

  async function loadTrendData(monthsBack = 6) {
    loading.value = true
    error.value = null

    try {
      trendData.value = await getBookingTrends(monthsBack)
    } catch (err) {
      error.value = err.message
      console.error('Error loading trend data:', err)
    } finally {
      loading.value = false
    }
  }

  return {
    currentMonthCounts,
    trendData,
    loading,
    error,
    loadCurrentMonthStats,
    loadTrendData
  }
}
