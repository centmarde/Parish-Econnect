import { ref } from 'vue'
import type { Router } from 'vue-router'

// Types
export interface EventItem {
  name: string
  description: string
  color: string
  icon: string
}

export interface BookingStep {
  id: number
  title: string
  icon: string
  desc: string
  englishDesc: string
  color: string
  gradient: string
}

// Event Items Data
export const getEventItems = (): EventItem[] => [
  {
    name: '💍 Special Wedding Mass',
    description: 'Celebrate your sacred union',
    color: 'pink-lighten-4',
    icon: 'mdi-heart',
  },
  {
    name: '⚰️ Funeral Mass',
    description: 'Honor and remember',
    color: 'grey-lighten-3',
    icon: 'mdi-cross',
  },
  {
    name: '🎁 Thanksgiving Mass',
    description: 'Express gratitude and joy',
    color: 'amber-lighten-4',
    icon: 'mdi-gift',
  },
  {
    name: '✝️ Baptism Mass (Christening)',
    description: 'Welcome new life in faith',
    color: 'blue-lighten-4',
    icon: 'mdi-water',
  },
]

// Booking Steps Data
export const getBookingSteps = (): BookingStep[] => [
  {
    id: 1,
    title: 'Choose Your Event',
    icon: 'mdi-calendar-search',
    desc: 'Pili-a ang event nga gusto nimo i-book.',
    englishDesc: 'Browse and select the perfect event for your needs.',
    color: 'primary',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    title: 'Sign & Scan',
    icon: 'mdi-scan-helper',
    desc: 'I-print ug i-sign ang PDF dayon i-scan balik para sa digital copy.',
    englishDesc: 'Print, complete, sign, and digitize your form.',
    color: 'warning',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    id: 3,
    title: 'Submit Request',
    icon: 'mdi-send-check',
    desc: 'I-upload ang scanned PDF ug isumite ang booking request.',
    englishDesc: 'Upload your completed form and finalize booking.',
    color: 'error',
    gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  },
]

// Background Images Data
export const getBackgroundImages = (): string[] => [
  '/wedding mass background image.jpg',
  'thanksgiving mass background image.png',
  '/funeral mass background image.jpg',
  '/baptism mass background image.jpg',
]

// Event Item Helper Functions
export const isWeddingEvent = (item: EventItem): boolean => {
  return item.name && item.name.startsWith('💍')
}

export const isFuneralEvent = (item: EventItem): boolean => {
  return item.name && item.name.startsWith('⚰️')
}

export const isThanksgivingEvent = (item: EventItem): boolean => {
  return item.name && item.name.startsWith('🎁')
}

export const isBaptismEvent = (item: EventItem): boolean => {
  return item.name && item.name.startsWith('✝️')
}

export const cleanEventName = (name: string): string => {
  return name.replace(/^[^\s]*\s/, '')
}

// Step Hover Management
export const useStepHover = () => {
  const hoveredStep = ref<number | null>(null)

  const setHoveredStep = (stepId: number) => {
    hoveredStep.value = stepId
  }

  const clearHoveredStep = () => {
    hoveredStep.value = null
  }

  return {
    hoveredStep,
    setHoveredStep,
    clearHoveredStep,
  }
}

// Visibility Management
export const useVisibility = (delay: number = 100) => {
  const isVisible = ref(false)

  const showWithDelay = () => {
    setTimeout(() => {
      isVisible.value = true
    }, delay)
  }

  return {
    isVisible,
    showWithDelay,
  }
}

// Step Click Handler
export const createStepClickHandler = (
  router: Router,
  onDialogOpen: () => void
) => {
  return (step: BookingStep) => {
    if (!step) return

    if (step.id === 2) {
      console.log('Navigating to camera view')
      router.push('/camera')
      return
    }

    if (step.id === 1 || step.id === 2) {
      onDialogOpen()
    }
  }
}

// Booking Selection Handler
export const createBookingSelectionHandler = (
  onItemSelected: (item: EventItem) => void,
  onDialogClose: () => void
) => {
  return (item: EventItem) => {
    onItemSelected(item)
    onDialogClose()
  }
}

// Loading Management
export const useLoadingState = (delay: number = 500) => {
  const isLoaded = ref(false)

  const triggerLoading = () => {
    setTimeout(() => {
      isLoaded.value = true
    }, delay)
  }

  return {
    isLoaded,
    triggerLoading,
  }
}

// Dialog Management
export const useDialog = () => {
  const dialog = ref(false)

  const openDialog = () => {
    dialog.value = true
  }

  const closeDialog = () => {
    dialog.value = false
  }

  const toggleDialog = () => {
    dialog.value = !dialog.value
  }

  return {
    dialog,
    openDialog,
    closeDialog,
    toggleDialog,
  }
}

// Selected Item Management
export const useSelectedItem = () => {
  const selectedItem = ref<EventItem | null>(null)

  const setSelectedItem = (item: EventItem) => {
    selectedItem.value = item
  }

  const clearSelectedItem = () => {
    selectedItem.value = null
  }

  return {
    selectedItem,
    setSelectedItem,
    clearSelectedItem,
  }
}
