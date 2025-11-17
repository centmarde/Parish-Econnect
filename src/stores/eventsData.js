import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase.js'

export const useEventsStore = defineStore('eventsData', {
  state: () => ({
    events: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchEvents() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true })

        if (error) throw error

        this.events = data || []
        return this.events
      } catch (err) {
        this.error = err.message
        console.error('Error fetching events:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUpcomingEvents() {
      this.loading = true
      this.error = null
      try {
        const today = new Date().toISOString().split('T')[0]

        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('event_date', today)
          .order('event_date', { ascending: true })
          .limit(50)

        if (error) throw error

        this.events = data || []
        return this.events
      } catch (err) {
        this.error = err.message
        console.error('Error fetching upcoming events:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchEventById(eventId) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single()

        if (error) throw error

        return data
      } catch (err) {
        this.error = err.message
        console.error('Error fetching event:', err)
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
