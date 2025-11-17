import { ref, computed, watch } from 'vue'

/**
 * Calendar Tab Manager Composable
 * Manages the state and behavior of calendar and table view tabs
 */
export function useCalendarTabManager() {
  // Tab state
  const activeTab = ref('calendar')

  // Tab definitions
  const tabs = [
    {
      value: 'calendar',
      title: 'Calendar View',
      icon: 'mdi-calendar-multiple'
    },
    {
      value: 'table',
      title: 'Table View',
      icon: 'mdi-table-large'
    }
  ]

  // Computed properties
  const isCalendarView = computed(() => activeTab.value === 'calendar')
  const isTableView = computed(() => activeTab.value === 'table')
  const currentTabTitle = computed(() => {
    const tab = tabs.find(t => t.value === activeTab.value)
    return tab ? tab.title : ''
  })

  // Methods
  const switchToCalendar = () => {
    activeTab.value = 'calendar'
  }

  const switchToTable = () => {
    activeTab.value = 'table'
  }

  const toggleTab = () => {
    if (activeTab.value === 'calendar') {
      activeTab.value = 'table'
    } else {
      activeTab.value = 'calendar'
    }
  }

  // Force re-render flag to ensure clean tab switching
  const forceRenderKey = ref(0)

  const resetRenderKey = () => {
    forceRenderKey.value++
  }

  // Watch for tab changes (for debugging or side effects)
  watch(activeTab, (newTab, oldTab) => {
    console.log(`[CalendarTabManager] Tab switched from "${oldTab}" to "${newTab}"`)
    // Force component re-render on tab change to ensure clean state
    resetRenderKey()
  })

  return {
    // State
    activeTab,
    tabs,
    forceRenderKey,

    // Computed
    isCalendarView,
    isTableView,
    currentTabTitle,

    // Methods
    switchToCalendar,
    switchToTable,
    toggleTab,
    resetRenderKey
  }
}
