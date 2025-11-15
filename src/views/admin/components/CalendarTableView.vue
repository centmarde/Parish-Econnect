<script setup>
import { computed, ref, defineProps, defineEmits } from 'vue'
import { EVENT_LEGEND } from '../utils/constants.ts'

// Props
const props = defineProps({
  events: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  viewOnly: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['edit-event', 'approve-event', 'deny-event', 'delete-event', 'view-event'])

// Table configuration
const itemsPerPage = ref(10)
const page = ref(1)
const search = ref('')
const sortBy = ref([{ key: 'startDate', order: 'asc' }])

// Pagination options
const itemsPerPageOptions = [
  { value: 5, title: '5' },
  { value: 10, title: '10' },
  { value: 25, title: '25' },
  { value: 50, title: '50' },
  { value: -1, title: 'All' }
]

// Table headers
const headers = [
  {
    title: 'Event Title',
    align: 'start',
    sortable: true,
    key: 'title',
    width: '25%'
  },
  {
    title: 'Category',
    align: 'center',
    sortable: true,
    key: 'category',
    width: '15%'
  },
  {
    title: 'Date',
    align: 'center',
    sortable: true,
    key: 'startDate',
    width: '15%'
  },
  {
    title: 'Time',
    align: 'center',
    sortable: true,
    key: 'time',
    width: '10%'
  },
  {
    title: 'Status',
    align: 'center',
    sortable: true,
    key: 'status',
    width: '10%'
  },
  {
    title: 'Actions',
    align: 'center',
    sortable: false,
    key: 'actions',
    width: '10%'
  }
]

// Computed properties
const tableEvents = computed(() => {
  return props.events.map(event => ({
    ...event,
    formattedDate: formatDate(event.startDate),
    formattedTime: event.time || 'All Day',
    statusColor: getStatusColor(event.status),
    categoryInfo: getCategoryInfo(event.category),
    bookingOwnerDisplay: getBookingOwner(event)
  }))
})

// Helper functions
const formatDate = (date) => {
  if (!date) return 'N/A'
  try {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid Date'
  }
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'success'
    case 'pending':
      return 'warning'
    case 'denied':
      return 'error'
    case 'cancelled':
      return 'grey'
    default:
      return 'primary'
  }
}

const getCategoryInfo = (category) => {
  const legend = EVENT_LEGEND.find(item =>
    item.label.toLowerCase().includes(category?.toLowerCase()) ||
    category?.toLowerCase().includes(item.label.toLowerCase())
  )
  return legend || {
    label: category || 'General',
    color: 'primary',
    icon: 'mdi-calendar'
  }
}

const getBookingOwner = (event) => {
  const category = event.category?.toLowerCase()

  // Check if this is a "churchevents" category event
  if (category === 'churchevents' || category === 'churchevent') {
    return 'San Isidro Labrador Parish'
  }

  // Check if this is an "others" category event
  if (category === 'others' || category === 'other') {
    return 'San Isidro Labrador Parish'
  }

  const booking = event.booking || event.originalEvent?.booking

  // Try to get the name first (most reliable)
  if (booking?.fname && booking?.lname) {
    return `${booking.fname} ${booking.lname}`
  }

  // Fallback to email
  if (booking?.email) {
    return booking.email
  }

  // Last fallback
  return event.bookingOwner || event.requester || event.createdBy || 'N/A'
}

// Event handlers
const handleViewEvent = (event) => {
  emit('view-event', event)
}

const handleEditEvent = (event) => {
  emit('edit-event', event)
}

const handleApproveEvent = (event) => {
  emit('approve-event', event)
}

const handleDenyEvent = (event) => {
  emit('deny-event', event)
}

const handleDeleteEvent = (event) => {
  emit('delete-event', event)
}

const canApprove = (event) => {
  if (props.viewOnly) return false
  return event.status === 'pending'
}

const canDeny = (event) => {
  if (props.viewOnly) return false
  return event.status === 'pending'
}

const canEdit = (event) => {
  if (props.viewOnly) return false
  return ['pending', 'approved'].includes(event.status)
}

const canDelete = () => {
  if (props.viewOnly) return false
  return true // Admin can delete any event
}
</script>

<template>
  <v-card elevation="0" class="table-container">
    <!-- Table Header -->
    <v-card-title class="d-flex align-center justify-space-between pa-6">
      <div class="d-flex align-center">
        <v-icon size="28" class="me-3">mdi-table-large</v-icon>
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">Events Table View</h3>
          <p class="text-body-2 mb-0 text-grey-darken-1">
            Detailed list of all parish events ({{ tableEvents.length }} total)
          </p>
        </div>
      </div>

      <!-- Search -->
      <div class="search-container" style="max-width: 300px;">
        <v-text-field
          v-model="search"
          append-inner-icon="mdi-magnify"
          label="Search events..."
          single-line
          hide-details
          variant="outlined"
          density="compact"
        ></v-text-field>
      </div>
    </v-card-title>

    <v-divider></v-divider>

    <!-- Data Table -->
    <v-data-table
      v-model:page="page"
      :headers="headers"
      :items="tableEvents"
      :search="search"
      :loading="loading"
      :items-per-page="itemsPerPage"
      :items-per-page-options="itemsPerPageOptions"
      :sort-by="sortBy"
      class="elevation-0"
      item-key="id"
      show-expand
      expand-on-click
    >
      <!-- Category Column -->
      <template #[`item.category`]="{ item }">
        <v-chip
          :color="item.categoryInfo.color"
          size="small"
          variant="tonal"
        >
          <v-icon :icon="item.categoryInfo.icon" size="16" class="me-1"></v-icon>
          {{ item.categoryInfo.label }}
        </v-chip>
      </template>

      <!-- Date Column -->
      <template #[`item.startDate`]="{ item }">
        <div class="text-body-2">
          {{ item.formattedDate }}
        </div>
      </template>

      <!-- Time Column -->
      <template #[`item.time`]="{ item }">
        <div class="text-body-2">
          {{ item.formattedTime }}
        </div>
      </template>

      <!-- Status Column -->
      <template #[`item.status`]="{ item }">
        <v-chip
          :color="item.statusColor"
          size="small"
          variant="tonal"
        >
          {{ item.status || 'Unknown' }}
        </v-chip>
      </template>

      <!-- Actions Column -->
      <template #[`item.actions`]="{ item }">
        <div class="d-flex gap-1">
          <v-tooltip text="View Details">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-eye"
                size="small"
                variant="text"
                color="primary"
                @click="handleViewEvent(item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-if="canEdit(item)" text="Edit Event">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-pencil"
                size="small"
                variant="text"
                color="warning"
                @click="handleEditEvent(item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-if="canApprove(item)" text="Approve Event">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-check"
                size="small"
                variant="text"
                color="success"
                @click="handleApproveEvent(item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-if="canDeny(item)" text="Deny Event">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                @click="handleDenyEvent(item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip v-if="canDelete(item)" text="Delete Event">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-delete"
                size="small"
                variant="text"
                color="error"
                @click="handleDeleteEvent(item)"
              ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>

      <!-- Expanded Row Details -->
      <template #[`expanded-row`]="{ item }">
        <tr>
          <td colspan="6" class="pa-4">
            <v-card variant="tonal" class="pa-4">
              <v-row>
                <v-col cols="12" md="6">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Event Details</h4>
                  <div class="text-body-2 mb-1">
                    <strong>Description:</strong> {{ item.description || 'No description provided' }}
                  </div>
                  <div class="text-body-2 mb-1">
                    <strong>Location:</strong> {{ item.location || 'TBA' }}
                  </div>
                  <div class="text-body-2 mb-1">
                    <strong>Duration:</strong> {{ item.duration || 'Not specified' }}
                  </div>
                </v-col>
                <v-col cols="12" md="6">
                  <h4 class="text-subtitle-1 font-weight-bold mb-2">Administrative Info</h4>
                  <div class="text-body-2 mb-1">
                    <strong>Created:</strong> {{ formatDate(item.createdAt) }}
                  </div>
                  <div class="text-body-2 mb-1">
                    <strong>Contact:</strong> {{ item.contact || item.email || 'N/A' }}
                  </div>
                  <div class="text-body-2 mb-1">
                    <strong>Phone:</strong> {{ item.phone || 'N/A' }}
                  </div>
                  <div class="text-body-2 mb-1" v-if="item.notes">
                    <strong>Notes:</strong> {{ item.notes }}
                  </div>
                </v-col>
              </v-row>
            </v-card>
          </td>
        </tr>
      </template>

      <!-- Loading State -->
      <template #loading>
        <div class="d-flex justify-center align-center pa-8">
          <v-progress-circular
            indeterminate
            color="primary"
            size="48"
          ></v-progress-circular>
          <span class="ms-4">Loading events...</span>
        </div>
      </template>

      <!-- No Data State -->
      <template #no-data>
        <div class="text-center pa-8">
          <v-icon color="grey-lighten-1" size="64" class="mb-4">
            mdi-calendar-blank
          </v-icon>
          <h3 class="text-h6 text-grey-darken-1 mb-2">No Events Found</h3>
          <p class="text-body-2 text-grey">
            No events match your search criteria or no events are currently scheduled.
          </p>
        </div>
      </template>

      <!-- Custom Table Footer with Pagination -->
      <template #bottom>
        <div class="pa-4">
          <div class="d-flex align-center justify-space-between flex-wrap">
            <div class="text-body-2 text-grey">
              Showing {{ Math.min((page - 1) * itemsPerPage + 1, tableEvents.length) }} to {{ Math.min(page * itemsPerPage, tableEvents.length) }} of {{ tableEvents.length }} event{{ tableEvents.length !== 1 ? 's' : '' }}
            </div>
            <div class="d-flex align-center gap-4">
              <!-- Items per page selector -->
              <div class="d-flex align-center gap-2">
                <span class="text-body-2">Rows per page:</span>
                <v-select
                  v-model="itemsPerPage"
                  :items="itemsPerPageOptions"
                  variant="outlined"
                  density="compact"
                  hide-details
                  style="width: 80px;"
                ></v-select>
              </div>
              <!-- Pagination -->
              <v-pagination
                v-if="tableEvents.length > itemsPerPage && itemsPerPage !== -1"
                v-model="page"
                :length="Math.ceil(tableEvents.length / itemsPerPage)"
                :total-visible="5"
                density="compact"
                variant="elevated"
              ></v-pagination>
            </div>
          </div>
        </div>
      </template>
    </v-data-table>
  </v-card>
</template>

<style scoped>
.table-container {
  height: auto;
  min-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.search-container {
  min-width: 250px;
}

:deep(.v-data-table) {
  flex: 1;
}

:deep(.v-data-table__wrapper) {
  max-height: calc(100vh - 400px);
  min-height: 400px;
  overflow-y: auto;
}

:deep(.v-data-table-header) {
  background-color: rgb(var(--v-theme-surface-variant));
}

:deep(.v-data-table-header th) {
  font-weight: 600 !important;
  color: rgb(var(--v-theme-on-surface-variant)) !important;
}

:deep(.v-data-table-rows-no-data) {
  height: 300px;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .search-container {
    min-width: 200px;
  }

  :deep(.v-data-table__wrapper) {
    max-height: calc(100vh - 350px);
    min-height: 300px;
  }
}

@media (max-width: 600px) {
  .search-container {
    min-width: 150px;
    max-width: 200px;
  }

  :deep(.v-data-table__wrapper) {
    max-height: calc(100vh - 400px);
    min-height: 250px;
  }

  /* Stack pagination controls on mobile */
  :deep(.v-data-table .pa-4 > .d-flex) {
    flex-direction: column;
    gap: 12px;
    align-items: stretch !important;
  }

  :deep(.v-data-table .pa-4 .d-flex.gap-4) {
    justify-content: center;
  }
}
</style>
