<script setup>
import { computed } from 'vue'
import { format } from 'date-fns'
import { EVENT_CATEGORIES } from '../utils/constants'

// Component name para sa ESLint multi-word rule
defineOptions({
  name: 'CalendarDialog'
})

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    required: true
  },
  eventsForDate: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'edit-event', 'add-event'])

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const formattedDate = computed(() => {
  try {
    return format(new Date(props.selectedDate), 'MMMM dd, yyyy')
  } catch {
    return props.selectedDate
  }
})

const dayOfWeek = computed(() => {
  try {
    return format(new Date(props.selectedDate), 'EEEE')
  } catch {
    return ''
  }
})

// Methods
const getCategoryInfo = (category) => {
  return EVENT_CATEGORIES[category?.toUpperCase()] || EVENT_CATEGORIES.OTHERS
}



const handleEditEvent = (event) => {
  emit('edit-event', event)
}

const getStatusColor = (booking) => {
  // You can customize this based on your booking status field
  const status = booking.status || 'pending'
  switch (status.toLowerCase()) {
    case 'approved': return 'success'
    case 'rejected': return 'error'
    case 'pending': return 'warning'
    default: return 'info'
  }
}
</script>

<template>
  <v-dialog
    v-model="isOpen"
    max-width="600"
    persistent
  >
    <v-card class="rounded-lg">
      <!-- Header -->
      <v-card-title class="d-flex align-center justify-space-between bg-primary text-white pa-4">
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">{{ dayOfWeek }}</h3>
          <p class="text-body-2 mb-0 opacity-90">{{ formattedDate }}</p>
        </div>
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="isOpen = false"
        ></v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Content -->
      <v-card-text class="pa-0">
        <!-- No events message -->
        <div v-if="eventsForDate.length === 0" class="text-center pa-8">
          <v-icon color="primary" size="64" class="mb-4">
            mdi-calendar-plus
          </v-icon>
          <h4 class="text-h6 text-primary mb-2">Add Events in This Day</h4>
          <p class="text-body-2 text-grey">
            Start scheduling events for {{ formattedDate }}. Click the button below to create your first event.
          </p>

        </div>

        <!-- Events list -->
        <div v-else class="pa-4">
          <h4 class="text-subtitle-1 font-weight-bold mb-4 text-grey-darken-2">
            {{ eventsForDate.length }} Event{{ eventsForDate.length > 1 ? 's' : '' }} Scheduled
          </h4>

          <v-list class="pa-0">
            <v-list-item
              v-for="(event, index) in eventsForDate"
              :key="event.id"
              class="px-0 py-3"
              :class="{ 'border-t': index > 0 }"
            >
              <template #prepend>
                <v-avatar :color="event.color || '#607D8B'" size="40" class="me-4">
                  <v-icon :icon="getCategoryInfo(event.category).icon" color="white"></v-icon>
                </v-avatar>
              </template>

              <v-list-item-title class="font-weight-bold text-body-1 mb-1">
                {{ event.title || event.name || 'Event' }}
              </v-list-item-title>

              <v-list-item-subtitle class="mb-2">
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    :color="event.color || '#607D8B'"
                    size="small"
                    variant="tonal"
                    class="me-2"
                  >
                    {{ getCategoryInfo(event.category).name }}
                  </v-chip>

                  <div class="d-flex align-center text-caption text-grey-darken-1">
                    <v-icon icon="mdi-clock" size="16" class="me-1"></v-icon>
                    {{ event.time ? event.time : 'All Day' }}
                  </div>

                  <v-chip
                    v-if="event.booking"
                    :color="getStatusColor(event.booking)"
                    size="small"
                    variant="tonal"
                  >
                    {{ event.booking.status || 'Pending' }}
                  </v-chip>
                </div>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex gap-1">
                  <v-btn
                    icon="mdi-pencil"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="handleEditEvent(event)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                    <v-tooltip activator="parent" location="top">
                      Edit Event
                    </v-tooltip>
                  </v-btn>

                  <v-btn
                    icon="mdi-eye"
                    size="small"
                    variant="text"
                    color="info"
                    @click="handleEditEvent(event)"
                  >
                    <v-icon>mdi-eye</v-icon>
                    <v-tooltip activator="parent" location="top">
                      View Details
                    </v-tooltip>
                  </v-btn>
                </div>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="pa-4 pt-0">
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          color="grey"
          @click="isOpen = false"
        >
          Close
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          prepend-icon="mdi-plus"
          @click="$emit('add-event', selectedDate)"
        >
          Add Event
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.border-t {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
