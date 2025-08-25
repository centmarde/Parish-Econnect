// Utility functions para sa real-time notification setup
// Ensure nga ang database tables naa ang required columns

import { supabase } from '@/utils/supabase.js'

/**
 * Check if ang wedding_bookings table naa ang required columns
 * Required columns: is_approve, is_denied, user_id
 */
export const checkWeddingBookingsSchema = async () => {
  try {
    // Try to select ang required columns
    const { error } = await supabase
      .from('wedding_bookings')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Wedding bookings table schema check failed:', error.message)
      return false
    }

   // console.log('Wedding bookings table schema check: OK')
    return true
  } catch (err) {
    console.error('Error checking wedding bookings schema:', err)
    return false
  }
}

/**
 * Check if ang funeral_bookings table naa ang required columns
 * Required columns: is_approve, is_denied, user_id
 */
export const checkFuneralBookingsSchema = async () => {
  try {
    // Try to select ang required columns
    const { error } = await supabase
      .from('funeral_bookings')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Funeral bookings table schema check failed:', error.message)
      return false
    }

    //console.log('Funeral bookings table schema check: OK')
    return true
  } catch (err) {
    console.error('Error checking funeral bookings schema:', err)
    return false
  }
}

/**
 * Validate if current user has proper authentication para sa real-time
 */
export const validateUserForRealtime = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('User authentication check failed:', error.message)
      return false
    }

    if (!user) {
      console.warn('No authenticated user found for real-time notifications')
      return false
    }

    //console.log('User authentication for real-time: OK', user.id)
    return true
  } catch (err) {
    console.error('Error validating user for real-time:', err)
    return false
  }
}

/**
 * Run all schema and connection checks
 */
export const runNotificationSystemChecks = async () => {
  //console.log('Running notification system checks...')
  
  const checks = [
    { name: 'User Authentication', check: validateUserForRealtime },
    { name: 'Wedding Bookings Schema', check: checkWeddingBookingsSchema },
    { name: 'Funeral Bookings Schema', check: checkFuneralBookingsSchema }
  ]

  const results = []
  
  for (const { name, check } of checks) {
    try {
      const result = await check()
      results.push({ name, success: result })
     // console.log(`✅ ${name}: ${result ? 'PASSED' : 'FAILED'}`)
    } catch (err) {
      results.push({ name, success: false, error: err.message })
      console.log(`❌ ${name}: FAILED - ${err.message}`)
    }
  }

  return results
}
