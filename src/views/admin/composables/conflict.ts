import { computed, ref } from 'vue'

export interface EventConflict {
  eventId: string
  conflictingEventIds: string[]
  conflictType: 'time' | 'venue'
  severity: 'warning' | 'error'
  message: string
}

export interface ConflictEvent {
  id: string
  title: string
  startDate: Date
  endDate: Date
  category: string
  time?: string
  status: string
}

export const useConflictDetection = () => {
  const conflicts = ref<EventConflict[]>([])

  // Helper function to check if two time ranges overlap
  const timeRangesOverlap = (start1: Date, end1: Date, start2: Date, end2: Date): boolean => {
    return start1 < end2 && start2 < end1
  }

  // Helper function to format time for display
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  // Helper function to check if events are on the same date
  const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate()
  }

  // Main function to detect conflicts between events
  const detectConflicts = (events: ConflictEvent[]): EventConflict[] => {
    const detectedConflicts: EventConflict[] = []

    // Only check approved and pending events for conflicts
    const relevantEvents = events.filter(event =>
      event.status === 'approved' || event.status === 'pending'
    )

    for (let i = 0; i < relevantEvents.length; i++) {
      const event1 = relevantEvents[i]
      const conflictingIds: string[] = []

      for (let j = i + 1; j < relevantEvents.length; j++) {
        const event2 = relevantEvents[j]

        // Skip if events are not on the same date
        if (!isSameDate(event1.startDate, event2.startDate)) {
          continue
        }

        // Check for time overlap
        if (timeRangesOverlap(event1.startDate, event1.endDate, event2.startDate, event2.endDate)) {
          conflictingIds.push(event2.id)
        }
      }

      // If conflicts found, create conflict objects
      if (conflictingIds.length > 0) {
        const severity = event1.status === 'approved' ? 'error' : 'warning'
        const conflictingEvents = relevantEvents.filter(e => conflictingIds.includes(e.id))

        const message = conflictingEvents.length === 1
          ? `Time conflict with "${conflictingEvents[0].title}" (${formatTime(conflictingEvents[0].startDate)} - ${formatTime(conflictingEvents[0].endDate)})`
          : `Time conflicts with ${conflictingEvents.length} other events`

        detectedConflicts.push({
          eventId: event1.id,
          conflictingEventIds: conflictingIds,
          conflictType: 'time',
          severity,
          message
        })
      }
    }

    conflicts.value = detectedConflicts
    return detectedConflicts
  }

  // Computed property to get conflicts for a specific event
  const getEventConflicts = (eventId: string) => {
    return computed(() =>
      conflicts.value.filter(conflict =>
        conflict.eventId === eventId || conflict.conflictingEventIds.includes(eventId)
      )
    )
  }

  // Check if an event has conflicts
  const hasConflicts = (eventId: string): boolean => {
    return conflicts.value.some(conflict =>
      conflict.eventId === eventId || conflict.conflictingEventIds.includes(eventId)
    )
  }

  // Get conflict severity for an event
  const getConflictSeverity = (eventId: string): 'warning' | 'error' | null => {
    const eventConflicts = conflicts.value.filter(conflict =>
      conflict.eventId === eventId || conflict.conflictingEventIds.includes(eventId)
    )

    if (eventConflicts.length === 0) return null

    // Return the highest severity
    return eventConflicts.some(c => c.severity === 'error') ? 'error' : 'warning'
  }

  // Get all conflicts for display
  const getAllConflicts = computed(() => conflicts.value)

  // Get conflicts count
  const conflictsCount = computed(() => conflicts.value.length)

  return {
    conflicts: getAllConflicts,
    conflictsCount,
    detectConflicts,
    getEventConflicts,
    hasConflicts,
    getConflictSeverity
  }
}
