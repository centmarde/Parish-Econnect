import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/utils/supabase.js'

// Type definitions based on user_roles table schema
export interface UserRole {
  user_id: string
  role: 'user' | 'admin' | 'moderator'
  created_at: string
  updated_at: string
}

export interface RoleChangeLog {
  id: number
  user_id: string
  old_role: string
  new_role: string
  changed_by: string
  changed_at: string
}

export const useRolesDataStore = defineStore('rolesData', () => {
  // State
  const userRoles = ref<UserRole[]>([])
  const currentUserRole = ref<UserRole | null>(null)
  const roleChangeLogs = ref<RoleChangeLog[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Valid roles based on table constraint
  const validRoles = ['user', 'admin', 'moderator'] as const

  // Getters
  const getUserRoleById = computed(() => {
    return (userId: string): UserRole | undefined => {
      return userRoles.value.find(role => role.user_id === userId)
    }
  })

  const getUsersByRole = computed(() => {
    return (role: UserRole['role']): UserRole[] => {
      return userRoles.value.filter(userRole => userRole.role === role)
    }
  })

  const getAdminUsers = computed(() => {
    return userRoles.value.filter(userRole => userRole.role === 'admin')
  })

  const getModeratorUsers = computed(() => {
    return userRoles.value.filter(userRole => userRole.role === 'moderator')
  })

  const getRegularUsers = computed(() => {
    return userRoles.value.filter(userRole => userRole.role === 'user')
  })

  const getTotalUsersByRole = computed(() => {
    return {
      admin: userRoles.value.filter(role => role.role === 'admin').length,
      moderator: userRoles.value.filter(role => role.role === 'moderator').length,
      user: userRoles.value.filter(role => role.role === 'user').length
    }
  })

  const isUserAdmin = computed(() => {
    return (userId: string): boolean => {
      const userRole = getUserRoleById.value(userId)
      return userRole?.role === 'admin'
    }
  })

  const isUserModerator = computed(() => {
    return (userId: string): boolean => {
      const userRole = getUserRoleById.value(userId)
      return userRole?.role === 'moderator'
    }
  })

  const hasElevatedPrivileges = computed(() => {
    return (userId: string): boolean => {
      const userRole = getUserRoleById.value(userId)
      return userRole?.role === 'admin' || userRole?.role === 'moderator'
    }
  })

  const getCurrentUserRole = computed(() => {
    return currentUserRole.value
  })

  const isCurrentUserAdmin = computed(() => {
    return currentUserRole.value?.role === 'admin'
  })

  const isCurrentUserModerator = computed(() => {
    return currentUserRole.value?.role === 'moderator'
  })

  const currentUserHasElevatedPrivileges = computed(() => {
    return currentUserRole.value?.role === 'admin' || currentUserRole.value?.role === 'moderator'
  })

  // Actions




  const getCurrentUserRoleFromAuth = async () => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        error.value = 'No authenticated user found'
        return { data: null, error: { message: 'No authenticated user' } }
      }

      const { data, error: fetchError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        error.value = `Error fetching current user role: ${fetchError.message}`
        return { data: null, error: fetchError }
      }

      currentUserRole.value = data
      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      error.value = errorMessage
      return { data: null, error: { message: errorMessage } }
    } finally {
      loading.value = false
    }
  }







  return {
    // State
    userRoles,
    currentUserRole,
    roleChangeLogs,
    loading,
    error,
    validRoles,

    // Getters
    getUserRoleById,
    getUsersByRole,
    getAdminUsers,
    getModeratorUsers,
    getRegularUsers,
    getTotalUsersByRole,
    isUserAdmin,
    isUserModerator,
    hasElevatedPrivileges,
    getCurrentUserRole,
    isCurrentUserAdmin,
    isCurrentUserModerator,
    currentUserHasElevatedPrivileges,
    getCurrentUserRoleFromAuth,

  }
})
