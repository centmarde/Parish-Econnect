import { defineStore } from 'pinia'
import { supabase, formActionDefault } from '@/utils/supabase.js'

export const useThanksGivingStore = defineStore('thanksGivingData', {
  state: () => ({
    bookings: [],
    loading: false,
    error: null,
    // currently selected booking id (for navigation or further fetch)
    selectedBookingId: null,
    // Keep formAction in store so components can bind to it
    formAction: { ...formActionDefault },
  }),

  actions: {
    // Helper to get currently authenticated user
    async getUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        this.error = error.message
        return null
      }

      return user
    },

    // Fetch bookings (basic implementation) - can be extended with filters/pagination
    async fetchBookings() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.from('thanksgiving_bookings').select('*')

        if (error) {
          this.error = error.message
          return []
        }

        this.bookings = data || []
        return this.bookings
      } finally {
        this.loading = false
      }
    },

    // Create a new thanksgiving booking (insert)
    // payload should be an object with the booking fields
    async createThanksGiving(payload = {}) {
      // reset formAction
      this.formAction = { ...formActionDefault }
      this.formAction.formProcess = true

      const user = await this.getUser()
      if (!user) {
        this.formAction.formErrorMessage = 'User not authenticated'
        this.formAction.formStatus = 'error'
        this.formAction.formProcess = false
        return false
      }

      // attach user id
      const insertPayload = {
        user_id: user.id,
        ...payload,
      }

      const { error } = await supabase.from('thanksgiving_bookings').insert([insertPayload])

      if (error) {
        this.formAction.formErrorMessage = error.message
        this.formAction.formStatus = error.code || 'error'
        this.formAction.formProcess = false
        return false
      }

      this.formAction.formSuccessMessage = 'Thanksgiving booking submitted successfully!'
      this.formAction.formProcess = false
      return true
    },

    // Fetch thanksgiving bookings filtered by current user's ID
    async fetchUserThanksGivingBookings() {
      this.loading = true
      this.error = null

      const user = await this.getUser()
      if (!user) {
        this.error = 'User not authenticated'
        this.loading = false
        return []
      }

      try {
        const { data, error } = await supabase
          .from('thanksgiving_bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          this.error = error.message
          this.loading = false
          return []
        }

        // Update bookings array with user-specific data
        this.bookings = data || []
        console.log(`Naka-fetch na ang ${this.bookings.length} thanksgiving bookings para sa user`)

        this.loading = false
        return this.bookings
      } catch (err) {
        this.error = err.message
        this.loading = false
        return []
      }
    },

    // Fetch the most recent thanksgiving booking for current user
    async fetchRecentThanksGivingBooking() {
      const user = await this.getUser()
      if (!user) {
        this.error = 'User not authenticated'
        return null
      }

      try {
        const { data, error } = await supabase
          .from('thanksgiving_bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          this.error = error.message
          return null
        }

        const recentBooking = data && data[0] ? data[0] : null
        if (recentBooking) {
          console.log('Recent thanksgiving booking fetched:', recentBooking)
          // optimistic update to bookings array
          const existingIndex = this.bookings.findIndex((b) => b.id === recentBooking.id)
          if (existingIndex === -1) {
            this.bookings.unshift(recentBooking)
          }
        }

        return recentBooking
      } catch (err) {
        this.error = err.message
        return null
      }
    },

    // Select a booking id (used when user clicks a booking card)
    selectBooking(id) {
      this.selectedBookingId = id
    },

    // Get reference (id) of recent booking for display
    async getRecentBookingReferenceNumber() {
      const user = await this.getUser()
      if (!user) {
        this.error = 'User not authenticated'
        return null
      }

      try {
        const { data, error } = await supabase
          .from('thanksgiving_bookings')
          .select('id')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          this.error = error.message
          return null
        }

        const id = data && data[0] ? data[0].id : null
        console.log('Reference id nga na-fetch:', id)
        return id
      } catch (err) {
        this.error = err.message
        return null
      }
    },
  },
})
