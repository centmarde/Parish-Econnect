import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/utils/supabase.js'

export const useThanksGivingStore = defineStore('thanksGiving', {
  state: () => ({
    bookings: ref([]),
    error: null,
    loading: false,
    selectedBookingId: null
  }),
  actions: {
    async fetchUserThanksGivingBookings() {
      this.loading = true
      this.error = null
      
      try {
        // Get user's thanksgiving bookings from Supabase
        const { data, error } = await supabase
          .from('thanksgiving_bookings')
          .select('*')
          .eq('user_id', this.selectedBookingId)
        
        if (error) throw error
        
        this.bookings = data
      } catch (err) {
        this.error = err.message
        console.error('Error fetching thanksgiving bookings:', err)
      } finally {
        this.loading = false
      }
    },
    selectBooking(id) {
      this.selectedBookingId = id
    }
  },
  getters: {
    getBookings: (state) => state.bookings,
    getError: (state) => state.error
  }
})
