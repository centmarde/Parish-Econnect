import { supabase } from '@/utils/supabase.js'

// Type definitions for return values
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
 * Generate unique reference number for others bookings
 * Format: OTH-YYYYMMDD-HHMMSS-XXX
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

  return `OTH-${dateStr}-${timeStr}-${randomNum}`
}

/**
 * Update others booking with reference number
 * Used after successful approval
 */
export async function insertReferenceNumber(bookingId: number, userId: string): Promise<ReferenceInsertResult> {
  if (!bookingId || !userId) {
    return { error: 'Booking ID and User ID required' }
  }

  try {
    const referenceNumber = generateReferenceNumber()

    const { data, error } = await supabase
      .from('others')
      .update({ ref_number: referenceNumber })
      .eq('id', bookingId)
      .eq('user_id', userId)
      .select('ref_number')

    if (error) {
      console.error('Error updating others booking with ref_number:', error)
      return { error: error.message }
    }

    if (!data || data.length === 0) {
      return { error: 'No booking found with the given ID and User ID' }
    }

    return {
      data: data[0].ref_number,
      referenceNumber: data[0].ref_number
    }
  } catch (error) {
    console.error('Exception during reference number insertion:', error)
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Check if booking already has a reference number
 */
export async function hasReferenceNumber(bookingId: number): Promise<ReferenceNumberResult> {
  if (!bookingId) {
    return { error: 'Booking ID required' }
  }

  try {
    const { data, error } = await supabase
      .from('others')
      .select('ref_number')
      .eq('id', bookingId)
      .single()

    if (error) {
      return { error: error.message }
    }

    return { data: data?.ref_number || null }
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
