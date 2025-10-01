import { supabase } from '@/utils/supabase.js'

// Type definitions para sa return values
export interface ReferenceInsertResult {
  data?: string | null
  referenceNumber?: string
  error?: string
}

export interface ReferenceNumberResult {
  data?: string | null
  error?: string
}

/**
 * Generate unique reference number para sa funeral bookings
 * Format: FUN-YYYYMMDD-HHMMSS-XXX
 * Where XXX is a random 3-digit number
 */
export function generateReferenceNumber(): string {
  const now = new Date()

  // Format: YYYYMMDD
  const dateStr = now.getFullYear() +
    (now.getMonth() + 1).toString().padStart(2, '0') +
    now.getDate().toString().padStart(2, '0')

  // Format: HHMMSS
  const timeStr = now.getHours().toString().padStart(2, '0') +
    now.getMinutes().toString().padStart(2, '0') +
    now.getSeconds().toString().padStart(2, '0')

  // Random 3-digit number
  const randomNum = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')

  return `FUN-${dateStr}-${timeStr}-${randomNum}`
}

/**
 * Update funeral booking with reference number
 * Ginagamit after successful document upload
 */
export async function insertReferenceNumber(bookingId: number, userId: string): Promise<ReferenceInsertResult> {
  if (!bookingId || !userId) {
    return { error: 'Booking ID ug User ID required' }
  }

  try {
    const referenceNumber = generateReferenceNumber()

    const { data, error } = await supabase
      .from('funeral_bookings')
      .update({ ref_number: referenceNumber })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('ref_number')

    if (error) {
      console.error('Error updating reference number:', error)
      return { error: error.message }
    }

    console.log(`Reference number ${referenceNumber} successfully inserted para sa booking ${bookingId}`)
    return {
      data: data[0]?.ref_number,
      referenceNumber
    }

  } catch (err: any) {
    console.error('Reference number insertion error:', err)
    return { error: err.message || 'Failed to generate reference number' }
  }
}

/**
 * Get reference number ng specific funeral booking
 * Para sa FinnishView.vue display
 */
export async function getBookingReferenceNumber(bookingId: number, userId: string): Promise<ReferenceNumberResult> {
  if (!bookingId || !userId) {
    return { error: 'Booking ID ug User ID required' }
  }

  try {
    const { data, error } = await supabase
      .from('funeral_bookings')
      .select('ref_number')
      .eq('id', bookingId)
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching reference number:', error)
      return { error: error.message }
    }

    return {
      data: data?.ref_number || null
    }

  } catch (err: any) {
    console.error('Reference number fetch error:', err)
    return { error: err.message || 'Failed to fetch reference number' }
  }
}
