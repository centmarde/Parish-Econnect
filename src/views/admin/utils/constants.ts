// Calendar constants and sample data
export const CALENDAR_TYPE_OPTIONS = [
  { title: 'Month', value: 'month' },
  { title: 'Week', value: 'week' },
  { title: 'Day', value: 'day' }
]

// Event categories and their colors
export const EVENT_CATEGORIES = {
  WEDDING: { name: 'Wedding', color: '#4CAF50', icon: 'mdi-heart' },
  BAPTISM: { name: 'Baptism', color: '#2196F3', icon: 'mdi-baby-face' },
  FUNERAL: { name: 'Funeral', color: '#FF9800', icon: 'mdi-cross' },
  THANKSGIVING: { name: 'Thanksgiving', color: '#9C27B0', icon: 'mdi-hands-pray' },
  MASS: { name: 'Mass', color: '#795548', icon: 'mdi-church' },
  OTHERS: { name: 'Others', color: '#607D8B', icon: 'mdi-calendar-star' }
}

// Sample events for calendar display


// Event legend for display
export const EVENT_LEGEND = [
  {
    color: EVENT_CATEGORIES.WEDDING.color,
    label: EVENT_CATEGORIES.WEDDING.name,
    icon: EVENT_CATEGORIES.WEDDING.icon
  },
  {
    color: EVENT_CATEGORIES.BAPTISM.color,
    label: EVENT_CATEGORIES.BAPTISM.name,
    icon: EVENT_CATEGORIES.BAPTISM.icon
  },
  {
    color: EVENT_CATEGORIES.FUNERAL.color,
    label: EVENT_CATEGORIES.FUNERAL.name,
    icon: EVENT_CATEGORIES.FUNERAL.icon
  },
  {
    color: EVENT_CATEGORIES.THANKSGIVING.color,
    label: EVENT_CATEGORIES.THANKSGIVING.name,
    icon: EVENT_CATEGORIES.THANKSGIVING.icon
  },
  {
    color: EVENT_CATEGORIES.MASS.color,
    label: EVENT_CATEGORIES.MASS.name,
    icon: EVENT_CATEGORIES.MASS.icon
  },
  {
    color: EVENT_CATEGORIES.OTHERS.color,
    label: EVENT_CATEGORIES.OTHERS.name,
    icon: EVENT_CATEGORIES.OTHERS.icon
  }
]
