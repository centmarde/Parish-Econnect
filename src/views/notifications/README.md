# Real-time Notifications System

## Overview
This system provides real-time notifications para sa parish events using Supabase real-time subscriptions. Mag-listen siya sa changes sa `wedding_bookings` ug `funeral_bookings` tables, specifically sa `is_approve` ug `is_denied` columns.

## Features
- ✅ Real-time notifications kada ma-approve or ma-deny ang bookings
- ✅ Browser notifications (with permission)
- ✅ Persistent notifications (stored sa localStorage)
- ✅ Unread count sa NavBar
- ✅ Filter ug search functionality
- ✅ Mobile responsive design

## Database Requirements

### Wedding Bookings Table (`wedding_bookings`)
Required columns:
- `id` - Primary key
- `user_id` - UUID, references auth.users
- `is_approve` - Boolean
- `is_denied` - Boolean
- `groom_name` - Text
- `bride_name` - Text
- `wedding_date` - Date/Timestamp
- `created_at` - Timestamp

### Funeral Bookings Table (`funeral_bookings`)
Required columns:
- `id` - Primary key
- `user_id` - UUID, references auth.users
- `is_approve` - Boolean
- `is_denied` - Boolean
- `deceased_name` - Text
- `funeral_date` - Date/Timestamp
- `created_at` - Timestamp

## Setup Instructions

### 1. Database Setup
Make sure ang database tables naa na ang required columns. Kung wala pa, run these SQL commands sa Supabase:

```sql
-- Add columns sa wedding_bookings table (if not exist)
ALTER TABLE wedding_bookings 
ADD COLUMN IF NOT EXISTS is_approve BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_denied BOOLEAN DEFAULT FALSE;

-- Add columns sa funeral_bookings table (if not exist)
ALTER TABLE funeral_bookings 
ADD COLUMN IF NOT EXISTS is_approve BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_denied BOOLEAN DEFAULT FALSE;
```

### 2. Row Level Security (RLS)
Make sure naa ang proper RLS policies para sa real-time subscriptions:

```sql
-- Wedding bookings RLS
ALTER TABLE wedding_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wedding bookings" ON wedding_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own wedding bookings" ON wedding_bookings
    FOR UPDATE USING (auth.uid() = user_id);

-- Funeral bookings RLS
ALTER TABLE funeral_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own funeral bookings" ON funeral_bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own funeral bookings" ON funeral_bookings
    FOR UPDATE USING (auth.uid() = user_id);
```

### 3. Real-time Setup
Supabase real-time subscriptions are already configured sa code. The system automatically:
- Sets up channels para sa both tables
- Filters by current user ID
- Listens para sa UPDATE events
- Creates notifications kada ma-change ang `is_approve` or `is_denied`

## Usage

### Automatic Initialization
The notification system automatically initializes kada mag-load ang app through `App.vue`. No manual setup needed.

### Manual Testing
Sa NotificationsView, naa testing buttons para sa simulating notifications:

```javascript
import { useTestNotifications } from '@/composables/useRealTimeNotifications.js'

const { simulateWeddingApproval, simulateFuneralDenial } = useTestNotifications()

// Simulate a wedding approval notification
simulateWeddingApproval()

// Simulate a funeral denial notification
simulateFuneralDenial()
```

### Admin Actions (Database Updates)
Para ma-trigger ang real-time notifications, update lang ang database directly:

```sql
-- Approve a wedding booking (this will trigger notification)
UPDATE wedding_bookings 
SET is_approve = TRUE 
WHERE id = 'some-booking-id' AND user_id = 'some-user-id';

-- Deny a funeral booking (this will trigger notification)
UPDATE funeral_bookings 
SET is_denied = TRUE 
WHERE id = 'some-booking-id' AND user_id = 'some-user-id';
```

## Code Structure

### Files Overview
- `src/stores/notification.js` - Pinia store para sa notification management
- `src/composables/useRealTimeNotifications.js` - Composable para sa real-time setup
- `src/utils/notificationHelpers.js` - Helper functions para sa schema validation
- `src/views/notifications/NotificationsView.vue` - Main notifications page
- `src/views/notifications/components/NotificationWidget.vue` - Individual notification component

### Real-time Flow
1. User logs in
2. `useRealTimeNotifications()` composable runs
3. System checks database schema ug user authentication
4. Creates Supabase channels para sa each table
5. Filters subscriptions by current user ID
6. Listens para sa `UPDATE` events on `is_approve` ug `is_denied` columns
7. Creates notification objects kada naa changes
8. Displays notifications sa UI ug stores sa localStorage

## Browser Notifications
The system requests permission para sa browser notifications. Users will see a popup asking for permission. Once granted, notifications will show even when the browser tab is not active.

## Troubleshooting

### Common Issues

1. **No notifications showing up**
   - Check if user is authenticated
   - Verify database columns exist
   - Check browser console para sa errors
   - Ensure RLS policies are correct

2. **Real-time not working**
   - Verify Supabase project has real-time enabled
   - Check network connectivity
   - Look para sa connection errors sa console

3. **Browser notifications not working**
   - Check if user granted permission
   - Ensure HTTPS connection (required for notifications)
   - Check browser settings

### Debug Commands
Open browser console ug run:

```javascript
// Check if real-time system is working
await runNotificationSystemChecks()

// Manually trigger test notifications
simulateWeddingApproval()
simulateFuneralDenial()
```

## Production Deployment

### Before Going Live:
1. Remove testing buttons from NotificationsView
2. Remove console.log statements
3. Test with real database updates
4. Verify RLS policies are secure
5. Test on different devices ug browsers

### Performance Considerations:
- Real-time channels automatically reconnect on network issues
- Notifications are persisted sa localStorage para sa offline support
- System handles cleanup kada component unmounts
- Filters ensure users only receive their own notifications
