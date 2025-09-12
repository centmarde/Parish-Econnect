import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

// Create a supabase service role client for admin operations
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
)

//Form Action Utils
export const formActionDefault = {
  formProcess: false,
  formStatus: 200,
  formErrorMessage: '',
  formSuccessMessage: '',
}

// Check if the session exists and is valid; Return false if there's an error
export const isAuthenticated = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error getting session:', error.message)
    return false
  }

  return !!data.session
}

//Retrieve User Information
export const getUserInformation = async () => {
  const {
    data: {
      user: { user_metadata },
    },
  } = await supabase.auth.getUser()

  return user_metadata
}

// Function to fetch all bookings from the database
/* export const fetchBookings = async () => {
  const { data, error } = await supabase.from('bookings').select('*').limit(1000)

  if (error) {
    console.error('Error fetching bookings:', error)
    return { error }
  }

  return { data }
}*/

export const fetchBookings = async () => {
  const { data, error, count } = await supabase
    .from('bookings')
    .select('*', { count: 'exact' })
    .range(0, 1000)

  if (error) {
    console.error('Error fetching bookings:', error)
    return { error }
  }

  console.log('Total bookings count:', count)
  return { data, count }
}

export const tableSearch = (search) => {
  return (search ||= '')
}

// Sign out helper that also handles form action state and optional redirect
export const signOutAndRedirect = async (router, formActionRef) => {
  // Set form processing state if formActionRef is provided
  if (formActionRef && typeof formActionRef === 'object' && 'value' in formActionRef) {
    formActionRef.value = { ...formActionDefault, formProcess: true }
  }

  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error during logout:', error)
    if (formActionRef && 'value' in formActionRef) formActionRef.value.formProcess = false
    return { error }
  }

  // Clear the login mode from session storage
  sessionStorage.removeItem('loginMode')

  if (formActionRef && 'value' in formActionRef) formActionRef.value.formProcess = false

  // Redirect if router is provided
  if (router && typeof router.replace === 'function') {
    router.replace('/')
  }

  return { error: null }
}
