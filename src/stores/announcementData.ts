import { defineStore } from 'pinia'
import { supabase, formActionDefault } from '@/utils/supabase.js'

// TypeScript interface for Announcement based on the schema
export interface Announcement {
  id: number
  date: string // timestamp with time zone
  title: string
  description: string
  starting_time: string
  ending_time: string
}

// Interface for creating/updating announcements (without id)
export interface AnnouncementPayload {
  date?: string
  title?: string
  description?: string
  starting_time?: string
  ending_time?: string
}

export const useAnnouncementStore = defineStore('announcementData', {
  state: () => ({
    announcements: [] as Announcement[],
    loading: false,
    error: null as string | null,
    selectedAnnouncementId: null as number | null,
    formAction: { ...formActionDefault },
  }),

  getters: {
    // Get announcement by ID
    getAnnouncementById: (state) => (id: number) => {
      return state.announcements.find(announcement => announcement.id === id)
    },

    // Get announcements sorted by date (chronological order - earliest first)
    sortedAnnouncements: (state) => {
      return [...state.announcements].sort((a, b) => {
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)

        // Primary sort: by date (chronological order - earliest first)
        const dateComparison = aDate.getTime() - bDate.getTime()

        // If dates are the same, sort by starting time if available
        if (dateComparison === 0) {
          if (a.starting_time && b.starting_time) {
            return a.starting_time.localeCompare(b.starting_time)
          }
          // If only one has time, prioritize the one with time
          if (a.starting_time && !b.starting_time) return -1
          if (!a.starting_time && b.starting_time) return 1

          // If both have no time or same time, sort by title
          return (a.title || '').localeCompare(b.title || '')
        }

        return dateComparison
      })
    },

    // Get upcoming announcements (future dates)
    upcomingAnnouncements: (state) => {
      const now = new Date()
      return state.announcements.filter(announcement =>
        new Date(announcement.date) >= now
      ).sort((a, b) => {
        const aDate = new Date(a.date)
        const bDate = new Date(b.date)

        // Primary sort: by date (chronological order - earliest first)
        const dateComparison = aDate.getTime() - bDate.getTime()

        // If dates are the same, sort by starting time if available
        if (dateComparison === 0) {
          if (a.starting_time && b.starting_time) {
            return a.starting_time.localeCompare(b.starting_time)
          }
          // If only one has time, prioritize the one with time
          if (a.starting_time && !b.starting_time) return -1
          if (!a.starting_time && b.starting_time) return 1

          // If both have no time or same time, sort by title
          return (a.title || '').localeCompare(b.title || '')
        }

        return dateComparison
      })
    }
  },

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

    // CREATE - Add a new announcement
    async createAnnouncement(payload: AnnouncementPayload) {
      // Reset formAction
      this.formAction = { ...formActionDefault }
      this.formAction.formProcess = true

      try {
        // Set default date to now if not provided
        const insertPayload = {
          date: new Date().toISOString(),
          ...payload,
        }

        const { data, error } = await supabase
          .from('announcements')
          .insert([insertPayload])
          .select()
          .single()

        if (error) {
          this.formAction.formErrorMessage = error.message
          this.formAction.formStatus = 'error'
          this.formAction.formProcess = false
          return { success: false, error: error.message }
        }

        // Add to local state in chronological order
        const insertIndex = this.announcements.findIndex(announcement => {
          const existingDate = new Date(announcement.date)
          const newDate = new Date(data.date)

          if (newDate < existingDate) {
            return true
          } else if (newDate.getTime() === existingDate.getTime()) {
            // Same date, compare by time
            if (data.starting_time && announcement.starting_time) {
              return data.starting_time < announcement.starting_time
            } else if (data.starting_time && !announcement.starting_time) {
              return true
            }
          }
          return false
        })

        if (insertIndex === -1) {
          this.announcements.push(data)
        } else {
          this.announcements.splice(insertIndex, 0, data)
        }

        this.formAction.formSuccessMessage = 'Announcement created successfully!'
        this.formAction.formProcess = false
        return { success: true, data }

      } catch (err: any) {
        this.formAction.formErrorMessage = err.message
        this.formAction.formStatus = 'error'
        this.formAction.formProcess = false
        return { success: false, error: err.message }
      }
    },

    // READ - Fetch all announcements
    async fetchAnnouncements() {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .order('date', { ascending: true })
          .order('starting_time', { ascending: true })

        if (error) {
          this.error = error.message
          return []
        }

        this.announcements = data || []
        return this.announcements

      } catch (err: any) {
        this.error = err.message
        return []
      } finally {
        this.loading = false
      }
    },

    // READ - Fetch a single announcement by ID
    async fetchAnnouncementById(id: number) {
      this.loading = true
      this.error = null

      try {
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('id', id)
          .single()

        if (error) {
          this.error = error.message
          return null
        }

        // Update local state if announcement exists
        const existingIndex = this.announcements.findIndex(a => a.id === id)
        if (existingIndex !== -1) {
          this.announcements[existingIndex] = data
        } else {
          this.announcements.push(data)
        }

        return data

      } catch (err: any) {
        this.error = err.message
        return null
      } finally {
        this.loading = false
      }
    },

    // UPDATE - Update an existing announcement
    async updateAnnouncement(id: number, payload: AnnouncementPayload) {
      this.formAction = { ...formActionDefault }
      this.formAction.formProcess = true

      try {
        const { data, error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', id)
          .select()
          .single()

        if (error) {
          this.formAction.formErrorMessage = error.message
          this.formAction.formStatus = 'error'
          this.formAction.formProcess = false
          return { success: false, error: error.message }
        }

        // Update local state
        const index = this.announcements.findIndex(a => a.id === id)
        if (index !== -1) {
          this.announcements[index] = data
        }

        this.formAction.formSuccessMessage = 'Announcement updated successfully!'
        this.formAction.formProcess = false
        return { success: true, data }

      } catch (err: any) {
        this.formAction.formErrorMessage = err.message
        this.formAction.formStatus = 'error'
        this.formAction.formProcess = false
        return { success: false, error: err.message }
      }
    },

    // DELETE - Remove an announcement
    async deleteAnnouncement(id: number) {
      this.loading = true
      this.error = null

      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .eq('id', id)

        if (error) {
          this.error = error.message
          return { success: false, error: error.message }
        }

        // Remove from local state
        this.announcements = this.announcements.filter(a => a.id !== id)

        return { success: true }

      } catch (err: any) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    },

    // Utility - Select an announcement (for navigation or detailed view)
    selectAnnouncement(id: number) {
      this.selectedAnnouncementId = id
    },

    // Utility - Clear selection
    clearSelection() {
      this.selectedAnnouncementId = null
    },

    // Utility - Reset form action state
    resetFormAction() {
      this.formAction = { ...formActionDefault }
    },

    // BULK OPERATIONS

    // Fetch announcements with pagination
    async fetchAnnouncementsPaginated(page: number = 1, limit: number = 10) {
      this.loading = true
      this.error = null

      try {
        const from = (page - 1) * limit
        const to = from + limit - 1

        const { data, error, count } = await supabase
          .from('announcements')
          .select('*', { count: 'exact' })
          .order('date', { ascending: true })
          .order('starting_time', { ascending: true })
          .range(from, to)

        if (error) {
          this.error = error.message
          return { data: [], count: 0 }
        }

        // For paginated results, replace the announcements array
        if (page === 1) {
          this.announcements = data || []
        } else {
          // For subsequent pages, append to existing data
          this.announcements.push(...(data || []))
        }

        return { data: data || [], count: count || 0 }

      } catch (err: any) {
        this.error = err.message
        return { data: [], count: 0 }
      } finally {
        this.loading = false
      }
    },

    // Delete multiple announcements
    async deleteMultipleAnnouncements(ids: number[]) {
      this.loading = true
      this.error = null

      try {
        const { error } = await supabase
          .from('announcements')
          .delete()
          .in('id', ids)

        if (error) {
          this.error = error.message
          return { success: false, error: error.message }
        }

        // Remove from local state
        this.announcements = this.announcements.filter(a => !ids.includes(a.id))

        return { success: true }

      } catch (err: any) {
        this.error = err.message
        return { success: false, error: err.message }
      } finally {
        this.loading = false
      }
    }
  },
})
