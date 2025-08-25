export interface CalendarEvent {
  id: number
  title: string
  date: string // YYYY-MM-DD
  color?: string
  type?: string
}

export const events: CalendarEvent[] = [
  {
    id: 1,
    title: 'Sunday Mass',
    date: '2025-08-24',
    color: 'primary',
    type: 'mass'
  },
  {
    id: 2,
    title: 'Wedding Ceremony',
    date: '2025-08-26',
    color: 'pink',
    type: 'wedding'
  },
  {
    id: 3,
    title: 'Baptism Service',
    date: '2025-08-28',
    color: 'blue',
    type: 'baptism'
  },
  {
    id: 4,
    title: 'Funeral Mass',
    date: '2025-08-30',
    color: 'grey',
    type: 'funeral'
  }
]

export default events
