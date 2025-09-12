<script>
</script>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  conflictDialog: Boolean,
  bookingConflicts: Array,
  bookingActionLoading: Boolean,
  getEventColor: Function
})

// Emits
const emit = defineEmits(['update:conflictDialog', 'cancel', 'forceApprove'])

// Local computed properties for v-model support
const conflictDialog = computed({
  get: () => props.conflictDialog,
  set: (value) => emit('update:conflictDialog', value)
})

// Methods
const cancelConflictDialog = () => {
  emit('cancel')
}

const forceApproveBooking = () => {
  emit('forceApprove')
}
</script>

<template>
   <!-- Conflict Dialog (same as AdminDashboard) -->
      <v-dialog v-model="conflictDialog" max-width="600" persistent>
        <v-card class="glass-card">
          <v-card-title class="d-flex align-center text-warning">
            <v-icon class="me-2" color="warning" size="32">mdi-alert-circle</v-icon>
            Schedule Conflict Detected
          </v-card-title>

          <v-card-text class="pa-6">
            <p class="mb-4">
              The booking you're trying to approve conflicts with existing scheduled events:
            </p>

            <v-list class="mb-4">
              <v-list-item
                v-for="conflict in props.bookingConflicts"
                :key="conflict.id"
                class="conflict-item pa-3 mb-2"
                :style="{ borderLeft: `4px solid ${props.getEventColor(conflict.type)}` }"
              >
                <template #prepend>
                  <v-chip :color="props.getEventColor(conflict.type)" size="small" class="me-3">
                    {{ conflict.type }}
                  </v-chip>
                </template>

                <v-list-item-title class="font-weight-semibold">
                  {{ conflict.name }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ conflict.date }} at {{ conflict.starting_time }} - {{ conflict.ending_time }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>

            <p class="text-body-2 text-grey-darken-1">
              You can either reschedule one of the events or proceed with approval if you believe
              the conflict can be managed.
            </p>
          </v-card-text>

          <v-card-actions class="pa-6">
            <v-spacer />
            <v-btn variant="outlined" @click="cancelConflictDialog" class="me-3"> Cancel </v-btn>
            <v-btn color="warning" @click="forceApproveBooking" :loading="props.bookingActionLoading">
              <v-icon class="me-1">mdi-check-bold</v-icon>
              Approve Anyway
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
</template>
