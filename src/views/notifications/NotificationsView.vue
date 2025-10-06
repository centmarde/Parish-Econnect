<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import NavBar2 from '@/components/layout/NavBar2.vue'
import PreloaderView from '@/components/layout/PreloaderView.vue'
import NotificationWidget from './components/NotificationWidget.vue'
import AppBar from '@/components/layout/AppBar.vue'
//import MyForms from '@/components/layout/MyForms.vue'
import { useRealTimeNotifications } from '@/views/notifications/composables/useRealTimeNotifications.js'

const router = useRouter()
const { mdAndUp } = useDisplay()

// Use real-time notifications composable
const {
  notifications,
  unreadCount,
  /* hasUnreadNotifications, */
  markAsRead,
  markAllAsRead,
  clearReadNotifications,
  deleteNotification,
  // fetchNotificationsFromDatabase,
  loading,
  error
} = useRealTimeNotifications()

// Local reactive data para sa filtering
const filterType = ref('all')
const searchQuery = ref('')

// Computed properties para sa filtering
const filteredNotifications = computed(() => {
  // Ensure notifications.value is an array, fallback to empty array
  let filtered = notifications.value || []

  // Filter by type
  if (filterType.value !== 'all') {
    if (filterType.value === 'unread') {
      filtered = filtered.filter(n => !n.isRead)
    } else if (filterType.value === 'read') {
      filtered = filtered.filter(n => n.isRead)
    } else {
      filtered = filtered.filter(n => n.type === filterType.value)
    }
  }

  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(n =>
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query)
    )
  }

  // Sort by timestamp (newest first)
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// Filter options para sa dropdown
const filterOptions = [
  { value: 'all', title: 'All Notifications' },
  { value: 'unread', title: 'Unread' },
  { value: 'read', title: 'Read' }
]

// Function para sa handling notification click
const handleNotificationClick = (notification) => {
  // Mark as read kung unread pa
  if (!notification.isRead) {
    markAsRead(notification.id)
  }

  // Navigate sa action URL kung naa
  if (notification.actionUrl) {
    router.push(notification.actionUrl)
  }
}

onMounted(() => {
  console.log('NotificationsView mounted - Real-time listeners should be active')
})
</script>

<template>
  <PreloaderView />
  <NavBar2>
    <template #content>
      <v-container fluid class="pa-4">
         <!--  <v-row>
            <v-col cols="12">
              <MyForms />
            </v-col>
          </v-row> -->
        <!-- Header section -->
        <v-row class="mb-4">
          <v-col cols="12">
            <div class="d-flex justify-space-between align-center mb-4">
              <div>
                <h1 class="text-h4 font-weight-bold mb-1">Notifications</h1>
                <p class="text-body-1 text-medium-emphasis">
                  Manage your parish notifications and updates
                </p>
              </div>

              <!-- Unread count badge -->
              <v-chip
                v-if="unreadCount && unreadCount > 0"
                color="primary"
                class="me-2"
              >
                {{ unreadCount }} unread
              </v-chip>
            </div>
          </v-col>
        </v-row>

        <!-- Filter and search controls -->
        <v-row class="mb-4">
          <v-col cols="12" md="4">
            <v-select
              v-model="filterType"
              :items="filterOptions"
              item-value="value"
              item-title="title"
              label="Filter notifications"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-filter"
            />
          </v-col>

          <v-col cols="12" md="5">
            <v-text-field
              v-model="searchQuery"
              label="Search notifications"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-magnify"
              clearable
              placeholder="Search by title or message..."
            />
          </v-col>

          <v-col cols="12" md="3" class="d-flex align-center justify-end">
           <!--  <v-btn
              color="primary"
              variant="text"
              size="small"
              class="me-2"
              :loading="loading"
              @click="fetchNotificationsFromDatabase"
              title="Refresh from database"
            >
              <v-icon icon="mdi-refresh" />
            </v-btn> -->

            <v-btn
              v-if="unreadCount && unreadCount > 0"
              color="primary"
              variant="outlined"
              size="small"
              class="me-2"
              @click="markAllAsRead"
            >
              Mark All Read
            </v-btn>

            <v-btn
              color="error"
              variant="text"
              size="small"
              @click="clearReadNotifications"
            >
              Clear Read
            </v-btn>
          </v-col>
        </v-row>

        <!-- Loading state -->
        <v-row v-if="loading" class="mb-4">
          <v-col cols="12" class="text-center">
            <v-progress-circular indeterminate color="primary" />
            <p class="text-body-2 text-medium-emphasis mt-2">
              Loading notifications...
            </p>
          </v-col>
        </v-row>

        <!-- Error state -->
        <v-row v-if="error" class="mb-4">
          <v-col cols="12">
            <v-alert
              type="error"
              variant="outlined"
              :text="error"
              closable
            />
          </v-col>
        </v-row>

        <!-- Notifications list -->
        <v-row>
          <v-col cols="12">
            <div v-if="!filteredNotifications || filteredNotifications.length === 0" class="text-center py-8">
              <v-icon
                icon="mdi-bell-off"
                size="64"
                color="grey-lighten-1"
                class="mb-4"
              />
              <h3 class="text-h6 text-medium-emphasis mb-2">
                No notifications found
              </h3>
              <p class="text-body-2 text-medium-emphasis">
                {{ searchQuery ? 'Try adjusting your search or filter' : 'You\'re all caught up!' }}
              </p>
            </div>

            <!-- Mobile layout (old single-column style) -->
            <div v-if="!mdAndUp" class="notifications-list-mobile">
              <NotificationWidget
                v-for="notification in filteredNotifications"
                :key="notification.id"
                :notification="notification"
                @mark-as-read="markAsRead"
                @click="handleNotificationClick"
                @delete="deleteNotification"
                class="mb-2"
              />
            </div>

            <!-- Desktop layout (grid style) -->
            <v-row v-else class="notifications-list">
              <v-col
                v-for="notification in filteredNotifications"
                :key="notification.id"
                cols="12"
                md="4"
                lg="3"
                xl="3"
              >
                <NotificationWidget
                  :notification="notification"
                  @mark-as-read="markAsRead"
                  @click="handleNotificationClick"
                  @delete="deleteNotification"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- Load more button (future enhancement) -->
        <v-row v-if="filteredNotifications && filteredNotifications.length > 0" class="mt-4">
          <v-col cols="12" class="text-center">
            <v-btn
              color="primary"
              variant="outlined"
              disabled
            >
              Load More Notifications
              <v-icon end icon="mdi-chevron-down" />
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
      <AppBar />
    </template>
  </NavBar2>
</template>

<style scoped>
.notifications-list {
  max-width: 100%;
  margin: 0 auto;
}

/* Mobile responsive adjustments */
@media (max-width: 960px) {
  .notifications-list {
    max-width: 100%;
  }
}

/* Ensure consistent card height in grid layout */
.notifications-list .v-col {
  display: flex;
  flex-direction: column;
}
</style>
