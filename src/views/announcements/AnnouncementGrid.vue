<script setup>
import { computed } from 'vue'

// Define props
const props = defineProps({
  announcements: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showActions: {
    type: Boolean,
    default: false
  },
  maxDisplay: {
    type: Number,
    default: 0 // 0 means show all
  }
})

// Define emits
const emit = defineEmits([
  'select',
  'edit',
  'delete',
  'view-more'
])

// Computed properties
const displayedAnnouncements = computed(() => {
  if (props.maxDisplay > 0) {
    return props.announcements.slice(0, props.maxDisplay)
  }
  return props.announcements
})

const hasMoreAnnouncements = computed(() => {
  return props.maxDisplay > 0 && props.announcements.length > props.maxDisplay
})

// Helper functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (timeString) => {
  if (!timeString) return ''

  const [hours, minutes] = timeString.split(':')
  const date = new Date()
  date.setHours(parseInt(hours), parseInt(minutes))

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  })
}

const getAnnouncementStatus = (announcement) => {
  const now = new Date()
  const announcementDate = new Date(announcement.date)

  if (announcementDate > now) {
    return 'upcoming'
  } else if (announcementDate.toDateString() === now.toDateString()) {
    return 'today'
  } else {
    return 'past'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming': return 'primary'
    case 'today': return 'success'
    case 'past': return 'grey'
    default: return 'grey'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'upcoming': return 'Upcoming'
    case 'today': return 'Today'
    case 'past': return 'Past'
    default: return ''
  }
}

// Event handlers
const handleSelect = (announcement) => {
  emit('select', announcement)
}

const handleEdit = (announcement) => {
  emit('edit', announcement)
}

const handleDelete = (announcement) => {
  emit('delete', announcement)
}

const handleViewMore = () => {
  emit('view-more')
}
</script>

<template>
  <div class="announcement-grid">
    <!-- Loading State -->
    <div v-if="loading" class="d-flex justify-center pa-8">
      <v-progress-circular
        indeterminate
        color="primary"
        size="64"
      >
        <template #default>
          Loading...
        </template>
      </v-progress-circular>
    </div>

    <!-- Empty State -->
    <v-card
      v-else-if="!loading && announcements.length === 0"
      class="pa-8 text-center elevation-1"
    >
      <v-icon
        size="64"
        color="grey-lighten-1"
        class="mb-4"
      >
        mdi-bullhorn-outline
      </v-icon>
      <h3 class="text-h5 text-grey-darken-1 mb-2">
        No Announcements
      </h3>
      <p class="text-body-1 text-grey">
        There are no announcements to display at this time.
      </p>
    </v-card>

    <!-- Announcements Grid -->
    <v-row v-else dense>
      <v-col
        v-for="announcement in displayedAnnouncements"
        :key="announcement.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card
          :class="[
            'announcement-card elevation-2 h-100 d-flex flex-column',
            getAnnouncementStatus(announcement) === 'today' ? 'today-highlight' : ''
          ]"
          hover
          @click="handleSelect(announcement)"
        >
          <!-- Card Header -->
          <v-card-title class="d-flex justify-space-between align-start pa-4">
            <div class="flex-grow-1">
              <h3 class="text-h6 text-wrap">
                {{ announcement.title || 'Untitled Announcement' }}
              </h3>
            </div>

            <!-- Status Chip with special handling for today -->
            <div class="d-flex align-center ml-2">
              <!-- Special Today Badge -->
              <v-chip
                v-if="getAnnouncementStatus(announcement) === 'today'"
                color="success"
                size="small"
                variant="elevated"
                class="today-badge mr-1"
              >
                <v-icon start size="small">mdi-calendar-today</v-icon>
                TODAY
              </v-chip>

              <!-- Regular Status Chip -->
              <v-chip
                v-else
                :color="getStatusColor(getAnnouncementStatus(announcement))"
                size="small"
                variant="outlined"
              >
                {{ getStatusText(getAnnouncementStatus(announcement)) }}
              </v-chip>
            </div>
          </v-card-title>

          <!-- Card Content -->
          <v-card-text class="flex-grow-1 pa-4 pt-0">
            <!-- Date and Time -->
            <div class="mb-3">
              <div class="d-flex align-center mb-1">
                <v-icon size="small" color="grey-darken-1" class="mr-2">
                  mdi-calendar
                </v-icon>
                <span class="text-body-2 text-grey-darken-1">
                  {{ formatDate(announcement.date) }}
                </span>
              </div>

              <div
                v-if="announcement.starting_time || announcement.ending_time"
                class="d-flex align-center"
              >
                <v-icon size="small" color="grey-darken-1" class="mr-2">
                  mdi-clock-outline
                </v-icon>
                <span class="text-body-2 text-grey-darken-1">
                  <span v-if="announcement.starting_time">
                    {{ formatTime(announcement.starting_time) }}
                  </span>
                  <span v-if="announcement.starting_time && announcement.ending_time">
                    -
                  </span>
                  <span v-if="announcement.ending_time">
                    {{ formatTime(announcement.ending_time) }}
                  </span>
                </span>
              </div>
            </div>

            <!-- Description -->
            <p
              v-if="announcement.description"
              class="text-body-2 text-grey-darken-2"
              style="line-height: 1.4;"
            >
              {{ announcement.description.length > 120
                ? announcement.description.substring(0, 120) + '...'
                : announcement.description
              }}
            </p>
            <p v-else class="text-body-2 text-grey font-italic">
              No description provided
            </p>
          </v-card-text>

          <!-- Card Actions -->
          <v-card-actions v-if="showActions" class="pa-4 pt-0">
            <v-spacer></v-spacer>

            <v-btn
              icon
              size="small"
              variant="text"
              color="primary"
              @click.stop="handleEdit(announcement)"
            >
              <v-icon>mdi-pencil</v-icon>
              <v-tooltip activator="parent">Edit</v-tooltip>
            </v-btn>

            <v-btn
              icon
              size="small"
              variant="text"
              color="error"
              @click.stop="handleDelete(announcement)"
            >
              <v-icon>mdi-delete</v-icon>
              <v-tooltip activator="parent">Delete</v-tooltip>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- View More Button -->
    <div
      v-if="hasMoreAnnouncements"
      class="text-center mt-4"
    >
      <v-btn
        color="primary"
        variant="outlined"
        size="large"
        @click="handleViewMore"
      >
        <v-icon start>mdi-chevron-down</v-icon>
        View More Announcements
        <v-chip
          class="ml-2"
          size="small"
          color="primary"
        >
          {{ announcements.length - maxDisplay }} more
        </v-chip>
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.announcement-grid {
  width: 100%;
}

.announcement-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.announcement-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Today's announcement highlighting */
.today-highlight {
  border: 2px solid #4caf50 !important;
  background: linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%) !important;
  position: relative;
}

.today-highlight::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #4caf50, #66bb6a);
  border-radius: 8px;
  z-index: -1;
  animation: pulse-border 2s infinite;
}

@keyframes pulse-border {
  0% { opacity: 0.7; }
  50% { opacity: 1; }
  100% { opacity: 0.7; }
}

/* Today badge special styling */
.today-badge {
  font-weight: bold !important;
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from { box-shadow: 0 0 5px #4caf50; }
  to { box-shadow: 0 0 15px #4caf50, 0 0 20px #4caf50; }
}

.text-wrap {
  word-wrap: break-word;
  word-break: break-word;
}

/* Responsive adjustments */
@media (max-width: 599px) {
  .announcement-card .v-card-title {
    flex-direction: column;
    align-items: flex-start !important;
  }

  .announcement-card .v-chip {
    margin-left: 0 !important;
    margin-top: 8px;
  }
}
</style>
