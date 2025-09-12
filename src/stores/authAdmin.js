import { supabase, supabaseAdmin } from '@/utils/supabase'
import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthAdminStore = defineStore('authAdmin', () => {
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Function to update user information
  const updateUser = async (userId, updateData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabase.auth.updateUser({
        email: updateData.email,
        password: updateData.password,
        data: updateData.metadata || {}
      })

      if (updateError) {
        error.value = updateError.message
        return { success: false, error: updateError }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to update user with admin privileges (using service role)
  const adminUpdateUser = async (userId, updateData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          email: updateData.email,
          password: updateData.password,
          user_metadata: updateData.metadata || {},
          email_confirm: updateData.emailConfirm || false,
          phone_confirm: updateData.phoneConfirm || false
        }
      )

      if (updateError) {
        error.value = updateError.message
        return { success: false, error: updateError }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to list all users (admin only)
  const listAllUsers = async (page = 1, perPage = 1000) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: listError } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage
      })

      if (listError) {
        error.value = listError.message
        return { success: false, error: listError }
      }

      users.value = data.users
      return {
        success: true,
        data: data.users,
        aud: data.aud,
        nextPage: data.nextPage
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to get user by ID (admin only)
  const getUserById = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (getUserError) {
        error.value = getUserError.message
        return { success: false, error: getUserError }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to delete user (admin only)
  const deleteUser = async (userId) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

      if (deleteError) {
        error.value = deleteError.message
        return { success: false, error: deleteError }
      }

      // Remove user from local state
      users.value = users.value.filter(user => user.id !== userId)
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to create new user (admin only)
  const createUser = async (userData) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: userData.emailConfirm || false,
        phone_confirm: userData.phoneConfirm || false,
        user_metadata: userData.metadata || {}
      })

      if (createError) {
        error.value = createError.message
        return { success: false, error: createError }
      }

      // Add new user to local state
      users.value.push(data.user)
      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Function to ban/unban user
  const banUser = async (userId, duration = '24h') => {
    loading.value = true
    error.value = null

    try {
      const { data, error: banError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: duration
      })

      if (banError) {
        error.value = banError.message
        return { success: false, error: banError }
      }

      return { success: true, data }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err }
    } finally {
      loading.value = false
    }
  }

  // Clear error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    users,
    loading,
    error,

    // Actions
    updateUser,
    adminUpdateUser,
    listAllUsers,
    getUserById,
    deleteUser,
    createUser,
    banUser,
    clearError
  }
})
