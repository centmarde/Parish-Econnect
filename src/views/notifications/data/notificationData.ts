// Notification interface para sa notification system
// Expected structure:
// {
//   id: string | number
//   title: string
//   message: string
//   type: 'info' | 'success' | 'warning' | 'error'
//   timestamp: Date
//   isRead: boolean
//   actionUrl?: string
//   icon?: string
// }

// Mock notification data para sa testing
// export const mockNotifications = [
//   {
//     id: 1,
//     title: 'Baptism Request Approved',
//     message: 'Ang inyong baptism request kay Baby Maria Santos na-approve na. Schedule: January 15, 2025 sa 10:00 AM.',
//     type: 'success',
//     timestamp: new Date('2025-01-10T14:30:00'),
//     isRead: false,
//     actionUrl: '/bookings/baptism',
//     icon: 'mdi-water'
//   },
//   {
//     id: 2,
//     title: 'Wedding Mass Schedule Updated',
//     message: 'Ang wedding mass schedule ninyo ni John & Jane nausab na from February 14 to February 21, 2025.',
//     type: 'warning',
//     timestamp: new Date('2025-01-08T09:15:00'),
//     isRead: false,
//     actionUrl: '/bookings/wedding',
//     icon: 'mdi-ring'
//   },
//   {
//     id: 3,
//     title: 'Document Requirements',
//     message: 'Palihug submit ang remaining documents para sa inyong funeral mass request. Deadline: January 20, 2025.',
//     type: 'info',
//     timestamp: new Date('2025-01-05T16:45:00'),
//     isRead: true,
//     actionUrl: '/documents',
//     icon: 'mdi-file-document'
//   },
//   {
//     id: 4,
//     title: 'Payment Confirmation',
//     message: 'Ang inyong payment sa thanksgiving mass na-receive na namo. Thank you!',
//     type: 'success',
//     timestamp: new Date('2025-01-03T11:20:00'),
//     isRead: true,
//     actionUrl: '/payments',
//     icon: 'mdi-credit-card-check'
//   },
//   {
//     id: 5,
//     title: 'Mass Schedule Cancelled',
//     message: 'Ang January 12 evening mass na-cancel tungod sa special event. Please reschedule.',
//     type: 'error',
//     timestamp: new Date('2025-01-01T08:00:00'),
//     isRead: false,
//     actionUrl: '/schedule',
//     icon: 'mdi-calendar-remove'
//   },
//   {
//     id: 6,
//     title: 'New Announcement',
//     message: 'Special Holy Week activities sa parish. Check ang schedule para sa complete details.',
//     type: 'info',
//     timestamp: new Date('2024-12-28T12:00:00'),
//     isRead: true,
//     actionUrl: '/announcements',
//     icon: 'mdi-bullhorn'
//   }
// ]

// Helper function para sa notification type colors
export const getNotificationTypeColor = (type) => {
  switch (type) {
    case 'success':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'error'
    case 'info':
    default:
      return 'info'
  }
}

// Helper function para sa notification type icons
export const getNotificationTypeIcon = (type) => {
  switch (type) {
    case 'success':
      return 'mdi-check-circle'
    case 'warning':
      return 'mdi-alert'
    case 'error':
      return 'mdi-alert-circle'
    case 'info':
    default:
      return 'mdi-information'
  }
}