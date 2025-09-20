<script setup>
import { computed } from 'vue'
import { getNotificationTypeColor, getNotificationTypeIcon } from '../data/notificationData.js'

const props = defineProps({
  notification: {
    type: Object,
    required: true
  },
  dense: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['markAsRead', 'click', 'delete'])

// Computed properties para sa styling
const cardClasses = computed(() => [
  'notification-card',
  'mb-2',
  { 'notification-unread': !props.notification.isRead },
  { 'notification-read': props.notification.isRead }
])

const timeAgo = computed(() => {
  const now = new Date()
  const diff = now.getTime() - props.notification.timestamp.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
})

const handleClick = () => {
  if (!props.notification.isRead) {
    emit('markAsRead', props.notification.id)
  }
  emit('click', props.notification)
}

const handleDelete = (event) => {
  // Stop event propagation para dili ma-trigger ang card click
  event.stopPropagation()
  emit('delete', props.notification.id)
}
</script>

<template>
  <v-card
    :class="cardClasses"
    :elevation="notification.isRead ? 1 : 3"
    @click="handleClick"
    style="cursor: pointer"
  >
    <v-card-text class="pa-4">
      <v-row align="center" no-gutters>
        <!-- Notification Icon -->
        <v-col cols="auto" class="me-3">
          <v-avatar
            :color="getNotificationTypeColor(notification.type)"
            :size="dense ? 32 : 40"
          >
            <v-icon
              :icon="notification.icon || getNotificationTypeIcon(notification.type)"
              :size="dense ? 'small' : 'default'"
              color="white"
            />
          </v-avatar>
        </v-col>

        <!-- Notification Content -->
        <v-col>
          <div class="d-flex justify-space-between align-start mb-1">
            <h3
              :class="[
                'text-subtitle-1 font-weight-medium mb-1',
                { 'text-primary': !notification.isRead }
              ]"
            >
              {{ notification.title }}
            </h3>

            <div class="d-flex align-center gap-2">
              <!-- Unread indicator -->
              <v-chip
                v-if="!notification.isRead"
                color="primary"
                size="x-small"
              >
                New
              </v-chip>

              <!-- Delete button -->
              <v-btn
                icon
                size="x-small"
                variant="text"
                color="error"
                class="delete-btn"
                @click="handleDelete"
                :title="'Delete notification'"
              >
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>

          <p
            :class="[
              'text-body-2 mb-2',
              { 'text-medium-emphasis': notification.isRead },
              { 'text-high-emphasis': !notification.isRead }
            ]"
          >
            {{ notification.message }}
          </p>

          <div class="d-flex justify-space-between align-center">
            <span class="text-caption text-medium-emphasis">
              {{ timeAgo }}
            </span>

            <!-- Action button if actionUrl exists -->
        <!--     <v-btn
              v-if="notification.actionUrl"
              :color="getNotificationTypeColor(notification.type)"
              size="small"
              variant="text"
              @click.stop="$router.push(notification.actionUrl)"
            >
              View Details
              <v-icon end icon="mdi-arrow-right" />
            </v-btn> -->
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.notification-card {
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.notification-unread {
  border-left-color: rgb(var(--v-theme-primary));
  background-color: rgb(var(--v-theme-surface));
}

.notification-read {
  border-left-color: rgb(var(--v-theme-surface-variant));
  opacity: 0.8;
}

.notification-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

.delete-btn {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.notification-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background-color: rgba(var(--v-theme-error), 0.1) !important;
}
</style>
