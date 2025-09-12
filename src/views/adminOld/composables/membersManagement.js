import { ref, computed, onMounted, watch } from 'vue'
import { supabase } from '@/utils/supabase.js'
import { useAuthAdminStore } from '@/stores/authAdmin.js'
import { useAuthUserStore } from '@/stores/authUser.js'

export function useMembersManagement() {
  const authAdmin = useAuthAdminStore()
  const authUser = useAuthUserStore()

  // State variables
  const loading = ref(true)
  const actionLoading = ref(false)
  const deleteLoading = ref(false)
  const members = ref([])
  const selectedMember = ref(null)

  // Dialog states
  const memberDialog = ref(false)
  const addMemberDialog = ref(false)
  const confirmDeleteDialog = ref(false)
  const memberToDelete = ref(null)

  // Filter and search states
  const searchQuery = ref('')
  const selectedRole = ref('all')
  const sortBy = ref('created_at')
  const sortOrder = ref('desc')

  // Pagination
  const page = ref(1)
  const itemsPerPage = ref(10)
  const totalMembers = ref(0)

  // Form states
  const formValid = ref(false)
  const newMember = ref({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    phone: '',
    role: 'user'
  })

  // Validation rules
  const nameRules = [
    v => !!v || 'Name is required',
    v => v.length >= 2 || 'Name must be at least 2 characters'
  ]

  const emailRules = [
    v => !!v || 'Email is required',
    v => /.+@.+\..+/.test(v) || 'Email must be valid'
  ]

  const passwordRules = [
    v => !!v || 'Password is required',
    v => v.length >= 6 || 'Password must be at least 6 characters'
  ]

  // Computed properties
  const filteredMembers = computed(() => {
    let filtered = members.value

    // Filter by search query
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (member) =>
          member.email?.toLowerCase().includes(query) ||
          member.first_name?.toLowerCase().includes(query) ||
          member.last_name?.toLowerCase().includes(query) ||
          member.phone?.includes(query)
      )
    }

    // Filter by role
    if (selectedRole.value !== 'all') {
      filtered = filtered.filter((member) => member.role === selectedRole.value)
    }

    return filtered
  })

  const paginatedMembers = computed(() => {
    const start = (page.value - 1) * itemsPerPage.value
    const end = start + itemsPerPage.value
    return filteredMembers.value.slice(start, end)
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredMembers.value.length / itemsPerPage.value)
  })

  const roleOptions = [
    { value: 'all', title: 'All Roles' },
    { value: 'user', title: 'User' },
    { value: 'admin', title: 'Administrator' },
    { value: 'moderator', title: 'Moderator' }
  ]

  // Load members function
  const loadMembers = async () => {
    try {
      loading.value = true

      // Get all users using authAdmin store
      const usersResult = await authAdmin.listAllUsers()
      if (!usersResult.success) {
        throw new Error(usersResult.error?.message || 'Failed to fetch users')
      }

      // Get user roles from database
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at, updated_at')
        .order(sortBy.value, { ascending: sortOrder.value === 'asc' })

      if (rolesError) throw rolesError

      // Create a map of user roles for quick lookup
      const rolesMap = new Map(userRoles.map(role => [role.user_id, role]))

      // Process users with their roles and booking counts
      const membersWithBookings = await Promise.all(
        usersResult.data.map(async (user) => {
          try {
            const userRole = rolesMap.get(user.id) || { role: 'user', created_at: user.created_at }

            // Get user info from auth metadata or fallback to booking data
            let userEmail = user.email || `user-${user.id.slice(0, 8)}@parish.local`
            let firstName = user.user_metadata?.first_name || user.user_metadata?.firstName || 'Member'
            let lastName = user.user_metadata?.last_name || user.user_metadata?.lastName || ''
            let phone = user.user_metadata?.phone || user.phone || ''
            let imageUrl = user.user_metadata?.avatar_url || user.user_metadata?.image_url || ''

            // Get recent bookings and user info
            const [recentWedding, recentBaptism, recentFuneral, recentThanksgiving, weddingCount, baptismCount, funeralCount, thanksgivingCount] = await Promise.all([
              supabase
                .from('wedding_bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3),
              supabase
                .from('baptism_bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3),
              supabase
                .from('funeral_bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3),
              supabase
                .from('thanksgiving_bookings')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(3),
              supabase.from('wedding_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('baptism_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('funeral_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
              supabase.from('thanksgiving_bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
            ])

            // If no metadata, try to get info from most recent booking
            if (!user.user_metadata?.first_name && !user.user_metadata?.firstName) {
              if (recentWedding.data?.[0]) {
                const booking = recentWedding.data[0]
                firstName = booking.bride_firstname || firstName
                lastName = booking.groom_firstname ? `& ${booking.groom_firstname}` : lastName
              } else if (recentBaptism.data?.[0]) {
                const booking = recentBaptism.data[0]
                firstName = booking.father_firstname || firstName
                lastName = booking.father_lastname || lastName
              } else if (recentFuneral.data?.[0]) {
                const booking = recentFuneral.data[0]
                firstName = booking.requestor_firstname || firstName
                lastName = booking.requestor_lastname || lastName
              } else if (recentThanksgiving.data?.[0]) {
                const booking = recentThanksgiving.data[0]
                firstName = booking.participant_firstname || firstName
                lastName = booking.participant_lastname || lastName
              }
            }

            // Prepare recent bookings data
            const recentBookings = []

            // Add wedding bookings
            if (recentWedding.data) {
              recentBookings.push(...recentWedding.data.map(booking => ({
                id: booking.id,
                type: 'wedding',
                name: `${booking.bride_firstname} & ${booking.groom_firstname}`,
                date: booking.wedding_date,
                approved: booking.approved,
                created_at: booking.created_at
              })))
            }

            // Add baptism bookings
            if (recentBaptism.data) {
              recentBookings.push(...recentBaptism.data.map(booking => ({
                id: booking.id,
                type: 'baptism',
                name: `${booking.father_firstname} ${booking.father_lastname}`,
                date: booking.baptism_date,
                approved: booking.approved,
                created_at: booking.created_at
              })))
            }

            // Add funeral bookings
            if (recentFuneral.data) {
              recentBookings.push(...recentFuneral.data.map(booking => ({
                id: booking.id,
                type: 'funeral',
                name: `${booking.requestor_firstname} ${booking.requestor_lastname}`,
                date: booking.funeral_date,
                approved: booking.approved,
                created_at: booking.created_at
              })))
            }

            // Add thanksgiving bookings
            if (recentThanksgiving.data) {
              recentBookings.push(...recentThanksgiving.data.map(booking => ({
                id: booking.id,
                type: 'thanksgiving',
                name: `${booking.participant_firstname} ${booking.participant_lastname}`,
                date: booking.thanksgiving_date,
                approved: booking.approved,
                created_at: booking.created_at
              })))
            }

            // Sort recent bookings by creation date and limit to 5 most recent
            recentBookings.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
            const limitedRecentBookings = recentBookings.slice(0, 5)

            const totalBookings = [weddingCount, baptismCount, funeralCount, thanksgivingCount]
              .reduce((sum, { count }) => sum + (count || 0), 0)

            return {
              ...userRole,
              id: user.id,
              user_id: user.id,
              email: userEmail,
              first_name: firstName,
              last_name: lastName,
              phone: phone,
              image_url: imageUrl,
              last_sign_in: user.last_sign_in_at,
              created_at: userRole.created_at || user.created_at,
              updated_at: userRole.updated_at || user.updated_at,
              bookings: {
                total: totalBookings,
                wedding: weddingCount.count || 0,
                baptism: baptismCount.count || 0,
                funeral: funeralCount.count || 0,
                thanksgiving: thanksgivingCount.count || 0,
                recent: limitedRecentBookings
              }
            }
          } catch (error) {
            console.error(`Error loading data for user ${user.id}:`, error)
            return {
              id: user.id,
              user_id: user.id,
              role: 'user',
              email: user.email || 'Error loading',
              first_name: 'Unknown',
              last_name: 'User',
              phone: '',
              image_url: '',
              last_sign_in: user.last_sign_in_at,
              created_at: user.created_at,
              bookings: { total: 0, wedding: 0, baptism: 0, funeral: 0, thanksgiving: 0, recent: [] }
            }
          }
        })
      )

      members.value = membersWithBookings
      totalMembers.value = membersWithBookings.length
    } catch (error) {
      console.error('Error loading members:', error)
      authUser.addNotification({
        message: 'Failed to load members',
        type: 'error'
      })
    } finally {
      loading.value = false
    }
  }

  // View member details
  const viewMemberDetails = (member) => {
    console.log('viewMemberDetails called with:', member)
    selectedMember.value = member
    memberDialog.value = true
    console.log('memberDialog value:', memberDialog.value)
    console.log('selectedMember value:', selectedMember.value)
  }

  // Update member role
  const updateMemberRole = async (memberId, newRole) => {
    try {
      actionLoading.value = true

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', memberId)

      if (error) throw error

      authUser.addNotification({
        message: 'Member role updated successfully',
        type: 'success'
      })

      await loadMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      authUser.addNotification({
        message: 'Failed to update member role',
        type: 'error'
      })
    } finally {
      actionLoading.value = false
    }
  }

  // Add new member
  const addMember = async () => {
    if (!formValid.value) return

    try {
      actionLoading.value = true

      // Create user using admin store
      const result = await authAdmin.createUser({
        email: newMember.value.email,
        password: newMember.value.password,
        emailConfirm: true,
        metadata: {
          first_name: newMember.value.first_name,
          last_name: newMember.value.last_name,
          phone: newMember.value.phone
        }
      })

      if (!result.success) {
        throw new Error(result.error.message)
      }

      // Create user role entry
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: result.data.user.id,
          role: newMember.value.role
        })

      if (roleError) throw roleError

      authUser.addNotification({
        message: 'Member added successfully',
        type: 'success'
      })

      addMemberDialog.value = false
      resetNewMemberForm()
      await loadMembers()
    } catch (error) {
      console.error('Error adding member:', error)
      authUser.addNotification({
        message: error.message || 'Failed to add member',
        type: 'error'
      })
    } finally {
      actionLoading.value = false
    }
  }

  // Delete member
  const deleteMember = async () => {
    try {
      deleteLoading.value = true

      // Delete user using admin store
      const result = await authAdmin.deleteUser(memberToDelete.value.id)

      if (!result.success) {
        throw new Error(result.error.message)
      }

      // Delete user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', memberToDelete.value.id)

      if (roleError) throw roleError

      authUser.addNotification({
        message: `Member ${memberToDelete.value.first_name} ${memberToDelete.value.last_name} deleted successfully`,
        type: 'success'
      })

      confirmDeleteDialog.value = false
      memberToDelete.value = null
      await loadMembers()
    } catch (error) {
      console.error('Error deleting member:', error)
      authUser.addNotification({
        message: 'Failed to delete member',
        type: 'error'
      })
    } finally {
      deleteLoading.value = false
    }
  }

  // Confirm delete
  const confirmDelete = (member) => {
    memberToDelete.value = member
    confirmDeleteDialog.value = true
  }

  // Reset form
  const resetNewMemberForm = () => {
    newMember.value = {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      role: 'user'
    }
    formValid.value = false
  }

  // Method para ma-trigger from outside ang refresh
  const refreshMembers = () => {
    loadMembers()
  }

  // Get role color
  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red'
      case 'moderator':
        return 'orange'
      case 'user':
        return 'blue'
      default:
        return 'grey'
    }
  }

  // Get booking type color
  const getBookingTypeColor = (type) => {
    switch (type) {
      case 'wedding':
        return 'pink'
      case 'baptism':
        return 'blue'
      case 'funeral':
        return 'purple'
      case 'thanksgiving':
        return 'green'
      default:
        return 'grey'
    }
  }

  // Watch for filter changes and reset page
  watch([searchQuery, selectedRole], () => {
    page.value = 1
  })

  // Initialize on mount
  onMounted(async () => {
    await loadMembers()
  })

  return {
    // State
    loading,
    actionLoading,
    deleteLoading,
    members,
    selectedMember,
    memberDialog,
    addMemberDialog,
    confirmDeleteDialog,
    memberToDelete,
    searchQuery,
    selectedRole,
    sortBy,
    sortOrder,
    page,
    itemsPerPage,
    totalMembers,
    formValid,
    newMember,

    // Computed
    filteredMembers,
    paginatedMembers,
    totalPages,
    roleOptions,

    // Validation rules
    nameRules,
    emailRules,
    passwordRules,

    // Methods
    loadMembers,
    refreshMembers,
    viewMemberDetails,
    updateMemberRole,
    addMember,
    deleteMember,
    confirmDelete,
    resetNewMemberForm,
    getRoleColor,
    getBookingTypeColor
  }
}
