import { defineStore } from 'pinia'
import { supabase } from '@/utils/supabase.js'
import { useAuthAdminStore } from './authAdmin.js'

export const useUsersStore = defineStore('usersData', {
  state: () => ({
    users: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchUsers() {
      this.loading = true
      this.error = null
      try {
        const authAdmin = useAuthAdminStore()

        // Get all users from Supabase Auth
        const usersResult = await authAdmin.listAllUsers()
        if (!usersResult.success) {
          throw new Error(usersResult.error?.message || 'Failed to fetch users')
        }

        // Get user roles from database
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role, created_at, updated_at')
          .order('created_at', { ascending: false })

        if (rolesError) throw rolesError

        // Create a map of user roles for quick lookup
        const rolesMap = new Map(userRoles?.map(role => [role.user_id, role]) || [])

        // Process users with their roles
        this.users = usersResult.data.map((user) => {
          const userRole = rolesMap.get(user.id) || { role: 'user', created_at: user.created_at }

          return {
            id: user.id,
            email: user.email || `user-${user.id.slice(0, 8)}@parish.local`,
            first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Member',
            last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
            full_name: `${user.user_metadata?.first_name || user.user_metadata?.firstName || 'Member'} ${user.user_metadata?.last_name || user.user_metadata?.lastName || ''}`.trim(),
            phone: user.user_metadata?.phone || user.phone || '',
            phone_number: user.user_metadata?.phone || user.phone || '',
            address: user.user_metadata?.address || '',
            image_url: user.user_metadata?.avatar_url || user.user_metadata?.image_url || '',
            role: userRole.role,
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at
          }
        })

        return this.users
      } catch (err) {
        this.error = err.message
        console.error('Error fetching users:', err)
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchUserById(userId) {
      this.loading = true
      this.error = null
      try {
        const authAdmin = useAuthAdminStore()

        // Get user from Supabase Auth
        const usersResult = await authAdmin.listAllUsers()
        if (!usersResult.success) {
          throw new Error(usersResult.error?.message || 'Failed to fetch user')
        }

        const user = usersResult.data.find(u => u.id === userId)
        if (!user) {
          throw new Error('User not found')
        }

        // Get user role from database
        const { data: userRole, error: roleError } = await supabase
          .from('user_roles')
          .select('user_id, role, created_at, updated_at')
          .eq('user_id', userId)
          .single()

        if (roleError && roleError.code !== 'PGRST116') throw roleError

        return {
          id: user.id,
          email: user.email || `user-${user.id.slice(0, 8)}@parish.local`,
          first_name: user.user_metadata?.first_name || user.user_metadata?.firstName || 'Member',
          last_name: user.user_metadata?.last_name || user.user_metadata?.lastName || '',
          full_name: `${user.user_metadata?.first_name || user.user_metadata?.firstName || 'Member'} ${user.user_metadata?.last_name || user.user_metadata?.lastName || ''}`.trim(),
          phone: user.user_metadata?.phone || user.phone || '',
          phone_number: user.user_metadata?.phone || user.phone || '',
          address: user.user_metadata?.address || '',
          image_url: user.user_metadata?.avatar_url || user.user_metadata?.image_url || '',
          role: userRole?.role || 'user',
          created_at: user.created_at,
          last_sign_in: user.last_sign_in_at
        }
      } catch (err) {
        this.error = err.message
        console.error('Error fetching user:', err)
        throw err
      } finally {
        this.loading = false
      }
    }
  }
})
