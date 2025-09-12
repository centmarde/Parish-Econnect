<script setup>
import { computed } from 'vue'
import { formatEventTitle, formatTime } from '../utils/eventsHelpers'

// Props para sa dialog data
const props = defineProps({
  deleteDialog: Boolean,
  selectedEvent: Object,
  actionLoading: Boolean,
})

// Emits para sa parent component interactions
const emit = defineEmits(['closeDialogs', 'deleteEvent', 'update:deleteDialog'])

// Computed property para sa dialog visibility
const dialogVisible = computed({
  get: () => props.deleteDialog,
  set: (value) => emit('update:deleteDialog', value)
})

const closeDialogs = () => {
  emit('closeDialogs')
}

const deleteEvent = () => {
  emit('deleteEvent')
}
</script>

<template>
  <!-- Delete Dialog -->
      <v-dialog v-model="dialogVisible" max-width="500" persistent>
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center text-error">
            <v-icon class="me-2" color="error">mdi-alert-circle</v-icon>
            Delete {{ selectedEvent?.source === 'announcement' ? 'Announcement' : 'Event' }}
          </v-card-title>

          <v-divider />

          <v-card-text class="pa-6">
            <p class="mb-4">
              Are you sure you want to delete this
              {{ selectedEvent?.source === 'announcement' ? 'announcement' : 'event' }}?
            </p>

            <v-alert type="warning" variant="tonal" class="mb-4">
              <strong>{{ formatEventTitle(selectedEvent || {}) }}</strong
              ><br />
              {{ new Date(selectedEvent?.event_date || '').toLocaleDateString() }}
              {{
                selectedEvent?.starting_time ? `at ${formatTime(selectedEvent.starting_time)}` : ''
              }}
            </v-alert>

            <p class="text-caption text-grey">
              This action cannot be undone.
              {{
                selectedEvent?.source === 'booking'
                  ? 'Note: This will delete the approved booking record.'
                  : ''
              }}
            </p>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn @click="closeDialogs" variant="outlined">Cancel</v-btn>
            <v-btn @click="deleteEvent" color="error" :loading="actionLoading">
              Delete {{ selectedEvent?.source === 'announcement' ? 'Announcement' : 'Event' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
