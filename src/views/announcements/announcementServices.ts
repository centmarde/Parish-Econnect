import { ref, computed, onMounted } from 'vue'
import { useAnnouncementStore, type Announcement, type AnnouncementPayload } from '@/stores/announcementData'

/**
 * Composable for managing announcements with CRUD operations
 * Provides a clean interface for components to interact with announcement data
 *
 * Data Ordering: All announcements are organized in chronological order (earliest date first)
 * - Primary sort: by date (ascending - earliest first)
 * - Secondary sort: by starting_time (ascending - earliest time first)
 * - Tertiary sort: by title (alphabetical)
 *
 * This ensures that upcoming events appear in the order they will occur,
 * making it easier for users to see what's happening next.
 */
export function useAnnouncementServices() {
  const announcementStore = useAnnouncementStore()

  // Local reactive state for component-specific needs
  const isLoading = ref(false)
  const searchQuery = ref('')
  const selectedAnnouncements = ref<number[]>([])
  const showPastAnnouncements = ref(true) // Changed to true for "show all" as default

  // Pagination state
  const currentPage = ref(1)
  const itemsPerPage = ref(6) // Changed from 10 to 6
  const totalItems = ref(0)

  // Computed properties that derive from store state
  const announcements = computed(() => announcementStore.announcements)
  const loading = computed(() => announcementStore.loading || isLoading.value)
  const error = computed(() => announcementStore.error)
  const formAction = computed(() => announcementStore.formAction)
  const selectedAnnouncementId = computed(() => announcementStore.selectedAnnouncementId)

  // Filtered announcements based on search and time filter
  const filteredAnnouncements = computed(() => {
    let filtered = announcements.value

    // Filter by search query
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(announcement =>
        announcement.title?.toLowerCase().includes(query) ||
        announcement.description?.toLowerCase().includes(query)
      )
    }

    // Filter by time (show past or upcoming)
    if (!showPastAnnouncements.value) {
      const now = new Date()
      filtered = filtered.filter(announcement =>
        new Date(announcement.date) >= now
      )
    }

    // Sort announcements in chronological order (earliest date first)
    filtered.sort((a, b) => {
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

    return filtered
  })

  // Paginated announcements from filtered results
  const paginatedAnnouncements = computed(() => {
    const filtered = filteredAnnouncements.value
    totalItems.value = filtered.length

    const start = (currentPage.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value

    return filtered.slice(start, end)
  })

  // Get upcoming announcements (from store getter)
  const upcomingAnnouncements = computed(() => announcementStore.upcomingAnnouncements)

  // Get sorted announcements (from store getter)
  const sortedAnnouncements = computed(() => announcementStore.sortedAnnouncements)

  // Get today's announcements for highlighting
  const todaysAnnouncements = computed(() => {
    const today = new Date()
    const todayDateString = today.toDateString()

    return announcements.value.filter(announcement => {
      const announcementDate = new Date(announcement.date)
      return announcementDate.toDateString() === todayDateString
    }).sort((a, b) => {
      // Sort today's announcements by time
      if (a.starting_time && b.starting_time) {
        return a.starting_time.localeCompare(b.starting_time)
      }
      // If only one has time, prioritize the one with time
      if (a.starting_time && !b.starting_time) return -1
      if (!a.starting_time && b.starting_time) return 1

      // If both have no time, sort by title
      return (a.title || '').localeCompare(b.title || '')
    })
  })

  // CRUD Operations with enhanced error handling and loading states

  /**
   * Create a new announcement
   */
  async function createAnnouncement(payload: AnnouncementPayload) {
    isLoading.value = true
    try {
      const result = await announcementStore.createAnnouncement(payload)

      if (result.success) {
        // Reset form or navigate as needed
        await refreshAnnouncements()
        return { success: true, data: result.data }
      }

      return { success: false, error: result.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch all announcements
   */
  async function fetchAnnouncements() {
    isLoading.value = true
    try {
      const data = await announcementStore.fetchAnnouncements()
      return data
    } catch (error: any) {
      console.error('Error fetching announcements:', error)
      return []
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch a single announcement by ID
   */
  async function fetchAnnouncementById(id: number) {
    isLoading.value = true
    try {
      const data = await announcementStore.fetchAnnouncementById(id)
      return data
    } catch (error: any) {
      console.error('Error fetching announcement:', error)
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update an existing announcement
   */
  async function updateAnnouncement(id: number, payload: AnnouncementPayload) {
    isLoading.value = true
    try {
      const result = await announcementStore.updateAnnouncement(id, payload)

      if (result.success) {
        await refreshAnnouncements()
        return { success: true, data: result.data }
      }

      return { success: false, error: result.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete a single announcement
   */
  async function deleteAnnouncement(id: number) {
    isLoading.value = true
    try {
      const result = await announcementStore.deleteAnnouncement(id)

      if (result.success) {
        // Remove from selected announcements if it was selected
        selectedAnnouncements.value = selectedAnnouncements.value.filter(
          selectedId => selectedId !== id
        )
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Delete multiple announcements
   */
  async function deleteMultipleAnnouncements(ids?: number[]) {
    const idsToDelete = ids || selectedAnnouncements.value

    if (idsToDelete.length === 0) {
      return { success: false, error: 'No announcements selected for deletion' }
    }

    isLoading.value = true
    try {
      const result = await announcementStore.deleteMultipleAnnouncements(idsToDelete)

      if (result.success) {
        // Clear selected announcements
        selectedAnnouncements.value = []
        return { success: true }
      }

      return { success: false, error: result.error }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch announcements with pagination
   */
  async function fetchAnnouncementsPaginated(page: number = 1, limit: number = 10) {
    isLoading.value = true
    try {
      const result = await announcementStore.fetchAnnouncementsPaginated(page, limit)
      return result
    } catch (error: any) {
      console.error('Error fetching paginated announcements:', error)
      return { data: [], count: 0 }
    } finally {
      isLoading.value = false
    }
  }

  // Utility Functions

  /**
   * Refresh announcements data
   */
  async function refreshAnnouncements() {
    await fetchAnnouncements()
  }

  /**
   * Select/deselect announcement
   */
  function selectAnnouncement(id: number) {
    announcementStore.selectAnnouncement(id)
  }

  /**
   * Clear selection
   */
  function clearSelection() {
    announcementStore.clearSelection()
    selectedAnnouncements.value = []
  }

  /**
   * Toggle announcement selection for bulk operations
   */
  function toggleAnnouncementSelection(id: number) {
    const index = selectedAnnouncements.value.indexOf(id)
    if (index > -1) {
      selectedAnnouncements.value.splice(index, 1)
    } else {
      selectedAnnouncements.value.push(id)
    }
  }

  /**
   * Select all filtered announcements
   */
  function selectAllFilteredAnnouncements() {
    selectedAnnouncements.value = filteredAnnouncements.value.map(a => a.id)
  }

  /**
   * Check if announcement is selected
   */
  function isAnnouncementSelected(id: number) {
    return selectedAnnouncements.value.includes(id)
  }

  /**
   * Get announcement by ID (from store getter)
   */
  function getAnnouncementById(id: number) {
    return announcementStore.getAnnouncementById(id)
  }

  /**
   * Reset form action state
   */
  function resetFormAction() {
    announcementStore.resetFormAction()
  }

  /**
   * Search announcements
   */
  function searchAnnouncements(query: string) {
    searchQuery.value = query
  }

  /**
   * Toggle showing past announcements
   */
  function togglePastAnnouncements() {
    showPastAnnouncements.value = !showPastAnnouncements.value
  }

  /**
   * Format date for display
   */
  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  /**
   * Format time for display
   */
  function formatTime(timeString: string | null) {
    if (!timeString) return ''

    // Parse time string and format
    const [hours, minutes] = timeString.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))

    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }

  /**
   * Check if announcement is in the future
   */
  function isUpcoming(announcement: Announcement) {
    return new Date(announcement.date) >= new Date()
  }

  /**
   * Check if announcement is for today
   */
  function isToday(announcement: Announcement) {
    const today = new Date()
    const announcementDate = new Date(announcement.date)
    return announcementDate.toDateString() === today.toDateString()
  }

  /**
   * Get announcement status
   */
  function getAnnouncementStatus(announcement: Announcement) {
    const now = new Date()
    const announcementDate = new Date(announcement.date)

    if (announcementDate > now) {
      return 'upcoming'
    } else if (announcementDate.toDateString() === now.toDateString()) {
      return 'today'
    } else {
      return 'past'
    }
  }

  // Pagination functions
  const setCurrentPage = (page) => {
    currentPage.value = page
  }

  const setItemsPerPage = (items) => {
    itemsPerPage.value = items
    currentPage.value = 1 // Reset to first page when changing items per page
  }

  const resetPagination = () => {
    currentPage.value = 1
    totalItems.value = 0
  }

  // Initialize data on mount
  onMounted(async () => {
    await fetchAnnouncements()
  })

  // Return all the reactive properties and methods for component use
  return {
    // Reactive state
    announcements,
    filteredAnnouncements,
    paginatedAnnouncements,
    upcomingAnnouncements,
    sortedAnnouncements,
    todaysAnnouncements,
    loading,
    error,
    formAction,
    selectedAnnouncementId,
    selectedAnnouncements: computed(() => selectedAnnouncements.value),
    searchQuery,
    showPastAnnouncements,

    // Pagination state
    currentPage,
    itemsPerPage,
    totalItems,

    // CRUD operations
    createAnnouncement,
    fetchAnnouncements,
    fetchAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    deleteMultipleAnnouncements,
    fetchAnnouncementsPaginated,

    // Utility functions
    refreshAnnouncements,
    selectAnnouncement,
    clearSelection,
    toggleAnnouncementSelection,
    selectAllFilteredAnnouncements,
    isAnnouncementSelected,
    getAnnouncementById,
    resetFormAction,
    searchAnnouncements,
    togglePastAnnouncements,
    formatDate,
    formatTime,
    isUpcoming,
    isToday,
    getAnnouncementStatus,

    // Pagination functions
    setCurrentPage,
    setItemsPerPage,
    resetPagination,
  }
}
